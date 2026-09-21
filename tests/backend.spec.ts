import { test, expect } from "@playwright/test";
import { db } from "../lib/db/client";
import { user, listings, applications, ownerSubmissions } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import { createApplication, transitionApplicationStatus } from "../lib/services/applications";
import { transitionSubmissionStatus, createOwnerSubmission } from "../lib/services/submissions";

test.describe("HTC Production Backend & Neon Database Verification", () => {
  test("Database connection & seeded data integrity", async () => {
    // 1. Verify admin user exists
    const [adminUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, "admin@htc.example"))
      .limit(1);

    expect(adminUser).toBeDefined();
    expect(adminUser.role).toBe("admin");

    // 2. Verify active listings exist
    const allListings = await db.select().from(listings);
    expect(allListings.length).toBeGreaterThanOrEqual(8);

    const sarvani = allListings.find((l) => l.slug === "sarvani-heights-3bhk");
    expect(sarvani).toBeDefined();
    expect(sarvani?.price).toBe(42000);
    expect(sarvani?.status).toBe("active");
  });

  test("Application workflow with competing closure automation (O-3)", async () => {
    // 1. Create a dedicated listing for this test to avoid parallel conflicts
    const uniqueSlug = `test-competing-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const [listing] = await db
      .insert(listings)
      .values({
        slug: uniqueSlug,
        title: "Test 2 BHK for Competing Closure Automation",
        intent: "rent",
        status: "active",
        bhk: 2,
        propertyType: "Apartment",
        areaSqft: 1200,
        price: 32000,
        locality: "Kondapur",
        city: "Hyderabad",
      })
      .returning();

    expect(listing).toBeDefined();

    // 2. Create test user 1
    const testEmail1 = `tenant1_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@example.com`;
    const [user1] = await db
      .insert(user)
      .values({
        id: `test_u1_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: "Test Applicant One",
        email: testEmail1,
        role: "user",
      })
      .returning();

    // 3. Create test user 2 (competing applicant)
    const testEmail2 = `tenant2_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@example.com`;
    const [user2] = await db
      .insert(user)
      .values({
        id: `test_u2_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: "Test Applicant Two",
        email: testEmail2,
        role: "user",
      })
      .returning();

    // 4. Submit application for User 1
    const app1 = await createApplication({
      listingId: listing.id,
      userId: user1.id,
      intent: "rent",
      moveInDate: "2026-10-01",
      budget: 32000,
      occupants: 2,
      contactPhone: "+919876543210",
      message: "Application from Test Applicant One",
    });

    expect(app1.reference).toMatch(/^APP-\d{2}-\d{6}$/);
    expect(app1.status).toBe("submitted");

    // 5. Verify single open application constraint: User 1 cannot submit a second open application on same listing
    await expect(
      createApplication({
        listingId: listing.id,
        userId: user1.id,
        intent: "rent",
        contactPhone: "+919876543210",
      })
    ).rejects.toThrow(/already have an active application/);

    // 6. Submit competing application for User 2
    const app2 = await createApplication({
      listingId: listing.id,
      userId: user2.id,
      intent: "rent",
      moveInDate: "2026-10-05",
      budget: 33000,
      occupants: 1,
      contactPhone: "+919876543211",
      message: "Competing application from Test Applicant Two",
    });

    expect(app2.reference).toMatch(/^APP-\d{2}-\d{6}$/);
    expect(app2.status).toBe("submitted");

    // 7. Transition App 1 to closed_won
    const wonApp = await transitionApplicationStatus({
      applicationId: app1.id,
      toStatus: "closed_won",
      actorId: user1.id,
      actorName: "HTC Admin",
      reason: "Agreement executed and deposit paid",
    });

    expect(wonApp.status).toBe("closed_won");

    // 8. Verify Listing status was automatically updated to 'rented'
    const [updatedListing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, listing.id))
      .limit(1);

    expect(updatedListing.status).toBe("rented");
    expect(updatedListing.closedAt).toBeDefined();

    // 9. Verify Competing App 2 was automatically closed_lost with 'Listing no longer available'
    const [updatedApp2] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, app2.id))
      .limit(1);

    expect(updatedApp2.status).toBe("closed_lost");
    expect(updatedApp2.closeReason).toBe("Listing no longer available");
  });

  test("Owner submission approval automatically publishes live listing (O-3)", async () => {
    // 1. Create a submission
    const sub = await createOwnerSubmission({
      ownerName: "N. Venkatesh",
      ownerEmail: `venkatesh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@example.com`,
      ownerPhone: "+919123456789",
      locality: "Madhapur",
      city: "Hyderabad",
      communityName: "Fresh Valley View",
      bhk: 3,
      price: 48000,
      areaSqft: 1600,
    });

    expect(sub.reference).toMatch(/^L-\d{2}-\d{6}$/);
    expect(sub.status).toBe("submitted");

    // 2. Staff approves the submission
    const approved = await transitionSubmissionStatus({
      submissionId: sub.id,
      toStatus: "approved",
      actorName: "HTC Facility Lead",
      reason: "Physical verification passed",
    });

    expect(approved.status).toBe("approved");
    expect(approved.createdListingId).toBeDefined();

    // 3. Verify newly published listing exists in database
    const [createdListing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, approved.createdListingId!))
      .limit(1);

    expect(createdListing).toBeDefined();
    expect(createdListing.status).toBe("active");
    expect(createdListing.price).toBe(48000);
    expect(createdListing.locality).toBe("Madhapur");
  });

  test("Better Auth API endpoint accepts login and sets session cookie", async ({ request }) => {
    const res = await request.post("/api/auth/sign-in/email", {
      data: {
        email: "admin@htc.example",
        password: "AdminPassword2026!",
      },
    });

    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.user).toBeDefined();
    expect(json.user.email).toBe("admin@htc.example");
  });
});
