import { db } from "../client";
import { communities } from "../schema";
import { eq } from "drizzle-orm";

export const SEED_COMMUNITIES = [
  {
    slug: "sarvani-heights",
    name: "Sarvani Heights",
    locality: "Gachibowli",
    city: "Hyderabad",
    totalHomes: 240,
    managedSince: "2023-01-15",
    amenities: ["Swimming Pool", "Gym", "Clubhouse", "24/7 Power Backup", "Covered Parking", "Children Play Area"],
    avgResolutionHours: 2,
  },
  {
    slug: "lanco-hills-residencies",
    name: "Lanco Hills Residencies",
    locality: "Manikonda",
    city: "Hyderabad",
    totalHomes: 650,
    managedSince: "2022-06-01",
    amenities: ["Swimming Pool", "Tennis Court", "Gym", "Security Guard", "Elevator", "EV Charging"],
    avgResolutionHours: 3,
  },
  {
    slug: "my-home-bhooja",
    name: "My Home Bhooja",
    locality: "HITEC City",
    city: "Hyderabad",
    totalHomes: 1800,
    managedSince: "2021-11-20",
    amenities: ["Olympic Pool", "Badminton Court", "Gym", "Concierge", "Spa", "Library"],
    avgResolutionHours: 1,
  },
  {
    slug: "aparna-serene-park",
    name: "Aparna Serene Park",
    locality: "Kondapur",
    city: "Hyderabad",
    totalHomes: 1100,
    managedSince: "2023-04-10",
    amenities: ["Gym", "Jogging Track", "Clubhouse", "Intercom", "Visitor Parking"],
    avgResolutionHours: 2,
  },
  {
    slug: "jayabheri-the-summit",
    name: "Jayabheri The Summit",
    locality: "Nanakramguda",
    city: "Hyderabad",
    totalHomes: 520,
    managedSince: "2022-09-01",
    amenities: ["Clubhouse", "Gym", "Landscaped Gardens", "Solar Water Heating"],
    avgResolutionHours: 4,
  },
  {
    slug: "smr-vinay-iconia",
    name: "SMR Vinay Iconia",
    locality: "Kondapur",
    city: "Hyderabad",
    totalHomes: 1400,
    managedSince: "2021-03-15",
    amenities: ["Cricket Pitch", "Swimming Pool", "Gym", "Grocery Store", "Pharmacy on site"],
    avgResolutionHours: 2,
  },
  {
    slug: "rajapushpa-atria",
    name: "Rajapushpa Atria",
    locality: "Kokapet",
    city: "Hyderabad",
    totalHomes: 850,
    managedSince: "2023-08-01",
    amenities: ["Rooftop Lounge", "Infinity Pool", "Squash Court", "Gym"],
    avgResolutionHours: 2,
  },
  {
    slug: "candeur-landmark",
    name: "Candeur Landmark",
    locality: "Financial District",
    city: "Hyderabad",
    totalHomes: 920,
    managedSince: "2024-01-10",
    amenities: ["Gym", "Co-working Space", "Badminton Court", "Security"],
    avgResolutionHours: 3,
  },
];

export async function seedCommunities() {
  console.log("Seeding communities...");
  const communityMap = new Map<string, string>(); // slug -> id

  for (const c of SEED_COMMUNITIES) {
    const existing = await db
      .select({ id: communities.id })
      .from(communities)
      .where(eq(communities.slug, c.slug))
      .limit(1);

    if (existing.length > 0) {
      communityMap.set(c.slug, existing[0].id);
      console.log(`Community exists: ${c.name}`);
    } else {
      const [inserted] = await db
        .insert(communities)
        .values({
          slug: c.slug,
          name: c.name,
          locality: c.locality,
          city: c.city,
          totalHomes: c.totalHomes,
          managedSince: c.managedSince,
          amenities: c.amenities,
          avgResolutionHours: c.avgResolutionHours,
        })
        .returning({ id: communities.id });
      communityMap.set(c.slug, inserted.id);
      console.log(`Created community: ${c.name}`);
    }
  }

  return communityMap;
}
