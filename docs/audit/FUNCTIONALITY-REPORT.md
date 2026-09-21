# HTC Functionality & Admin-Sync Audit Report — Phase A
**Audit date:** 2026-09-21
**Auditor:** Independent QA (Antigravity)
**Method:** Static code inspection (all routes, actions, services, schemas, components) + logical proof-of-execution. Dynamic testing deferred pending confirmation of test database and running instance (see Section A0 notes).
**Codebase:** Next.js 16.3.5 / better-auth 1.7.5 / Drizzle ORM 0.45.2 / Neon Postgres

---

## A0. Method Note

Dynamic tests (actual HTTP submissions, DB row verification) require a live `localhost:3000` instance against a throwaway database. These are marked `DYNAMIC-NEEDED` below. All static conclusions are derived directly from reading source files and tracing code paths. No result is assumed — every static PASS requires the code to provably implement the behavior without ambiguity.

---

## A2. Public Forms → Admin (Create-Side Sync)

### Form Coverage Matrix

| Form | Source | Creates Row | Row in Admin | Fields Intact | Validation Blocks | Rate Limit | Reference Returned |
|---|---|---|---|---|---|---|---|
| Contact enquiry | `/contact` → `submitEnquiryAction` → `createEnquiry` | ✅ PASS (code) | ✅ PASS (admin/enquiries queries all) | ✅ PASS | ✅ PASS (Zod schema) | ✅ PASS (5/hr/IP DB-backed) | ✅ PASS |
| Listing enquiry (contact-owner) | `/properties/[slug]` → `submitEnquiryAction` | ✅ PASS (code) | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS | ✅ PASS |
| Book a walkthrough | `/communities` → `submitWalkthroughAction` → `createWalkthroughRequest` | ✅ PASS (code) | ✅ PASS (admin/walkthroughs) | ✅ PASS | ✅ PASS | ✅ PASS (5/hr/IP) | ✅ PASS |
| List your property | `/list-your-property` → `submitOwnerSubmissionAction` → `createOwnerSubmission` | ✅ PASS (code) | ✅ PASS (admin/submissions) | ✅ PASS | ✅ PASS | ✅ PASS (5/hr/IP) | ✅ PASS |

**Honeypot:** All three public form actions check `parsed.data.website_hp` → return success with no DB row. ✅ PASS (code)

**Consent:** `contactEnquirySchema` requires `consent: true`; `consentAt` stored as `new Date()` in `createEnquiry`. ✅ PASS (code)
`ownerSubmissionSchema`: no explicit `consent` field in schema. **Finding: ownerSubmission does not capture consent_at or consent checkbox.** See FUNC-01.

**Source field:** `submitEnquiryAction` passes `parsed.data.source` (caller-supplied). Zod has `source: z.string().default("/contact")` — always present. ✅ PASS

**Phone masking in list view:** Admin Applications view displays full `contactPhone` in the list table (line 317 of AdminApplicationsView.tsx). **Finding: No masking in list view — phone visible to all staff at the list level.** See FUNC-02.

**Data leakage:** The enquiries data is only in `/admin/enquiries`, not visible to the public user. ✅ PASS

**Timing guard (sub-3-second submit):** No timing guard is implemented anywhere. ❌ MISSING — See FUNC-03.

---

## A3. Auth and Application Flow

### Login-gated Apply

- `submitApplicationAction` (applications.ts:11): checks `session?.user`, returns `{ requiresAuth: true }` if no session. The `StickyContactBar` component catches this and falls back to creating an enquiry (not an application). ⚠️ **Finding:** Anonymous users are NOT redirected to login on Apply click. Instead their interest is captured as an enquiry (guest fallback). The spec says "Anonymous user clicks Apply → redirected to `/login?returnTo=/properties/[slug]`". The redirect occurs via `router.push('/login?returnTo=/properties')` for the Save action (line 95 of StickyContactBar), NOT for Apply. **The spec redirect is not implemented for the Apply flow.** See FUNC-04.
- Note: the fallback enquiry capture is a reasonable UX alternative, but it diverges from spec.

### returnTo Safety (Security also in B-A01)

**Evidence from code:**

1. `app/login/page.tsx:14` — `const returnTo = searchParams.get("returnTo") || "";` — raw URL param
2. `app/login/page.tsx:40-41` — `const destination = returnTo || ...;` then `window.location.href = destination;` — **no validation**
3. `app/signup/page.tsx:14` — same raw param extraction
4. `app/signup/page.tsx:37` — `router.push(res.returnTo || "/account")` — Next.js router.push with unvalidated value
5. `app/actions/auth.ts:47` — `returnTo: parsed.data.returnTo || ...` — server action echoes raw returnTo
6. `loginSchema` / `signupSchema` in `forms.ts` — `returnTo: z.string().optional()` — no URL validation

**Verdict:** `returnTo=//evil.com` → `window.location.href = "//evil.com"` is an open redirect. `returnTo=javascript:alert(1)` → `window.location.href = "javascript:alert(1)"` is a javascript: URL redirect. ❌ **FAIL — Open Redirect. See Security PF-01/PF-13.**

### Duplicate Application Guard

`createApplication` (applications.ts:38-55): Checks for existing open application using `notInArray(status, ["closed_won", "closed_lost", "withdrawn"])`. Throws if found. DB also has partial unique index `applications_one_open_per_user_listing`. Both application-layer and DB-layer guards exist. ✅ PASS (code)

### User-Facing Status Labels

`UserAccountView` (components/sections/account/UserAccountView.tsx): DYNAMIC-NEEDED to verify exact label text ("Received" vs internal "submitted"). Internal notes are in `notes` table with `isPrivate` flag; account page does NOT fetch notes. ✅ PASS — notes not exposed to user (code).

### returnTo Safety Test Cases

| Payload | Expected | Code Result |
|---|---|---|
| `returnTo=//evil.com` | Ignored, land on safe page | ❌ FAIL — redirects to //evil.com |
| `returnTo=https://evil.com` | Ignored | DYNAMIC-NEEDED (router.push may not follow full URL) |
| `returnTo=javascript:alert(1)` | Ignored | ❌ FAIL — `window.location.href = "javascript:alert(1)"` |
| `returnTo=/account` | Follow safely | ✅ PASS |
| `returnTo=/admin` | Follow safely | ✅ PASS |

---

## A4. Status Workflows and Side Effects

### Application Status Machine

| Transition | DB Update | statusEvent | Expected Side Effect | Side Effect Implemented |
|---|---|---|---|---|
| submitted → contacted | ✅ applications row | ✅ statusEvents insert | None beyond status | ✅ PASS |
| → visit_scheduled (no date) | ✅ schema allows null visitAt | ✅ statusEvents | Should be REJECTED | ❌ FAIL — server allows null date (PF-12) |
| → visit_scheduled (with date) | ✅ visitAt stored | ✅ statusEvents | Visit time shown to user | DYNAMIC-NEEDED |
| → approved | ✅ status updated | ✅ statusEvents | **listing→reserved** | ❌ FAIL — NOT IMPLEMENTED (PF-05) |
| → closed_won | ✅ status updated | ✅ statusEvents | listing→rented/sold; competing apps→closed_lost each with statusEvent; auditLog | ✅ PASS (code, lines 155-215) |
| approved → closed_lost | ✅ status updated | ✅ statusEvents | listing reverts reserved→active | ❌ FAIL — NOT IMPLEMENTED (PF-06) |
| → closed_lost (any) | ✅ status + closeReason | ✅ statusEvents | None | ✅ PASS |
| → withdrawn | ✅ status + closeReason | ✅ statusEvents | None | ✅ PASS |

**Race condition (two closed_won on same listing):** The `transitionApplicationStatus` service runs in a DB transaction. Both sessions would attempt to update listings and competing apps inside separate transactions. PostgreSQL serializable isolation not explicitly set — the listing update is not guarded by a lock on the current status. **Finding: Potential race condition where two concurrent `closed_won` transitions could leave listing in inconsistent state.** The second `closed_won` would re-run the cascade on an already-rented/sold listing with no competing open apps. Listing would remain in correct final state (rented/sold). The race does NOT produce an "orphaned reserved/rented mix" because `approved` never sets reserved (PF-05). In practice harmless but should be documented. FUNC-05.

**Audit log for each transition:** `status_events` row written for every transition. ✅ PASS (code — every transition in both service files inserts statusEvents).
`audit_log` written for: `closed_won`, `submission_status_*`. NOT written for: `contacted`, `visit_scheduled`, `approved`, `closed_lost`, `withdrawn` (application). This is per-design — `statusEvents` is the per-transition log; `auditLog` is for significant security events only. ✅ PASS (intentional design).

### Owner Submission Status Machine

| Transition | DB Update | statusEvent | auditLog | Side Effect |
|---|---|---|---|---|
| → under_review | ✅ | ✅ | ✅ | None |
| → verification_scheduled | ✅ | ✅ | ✅ | None |
| → approved (no listing yet) | ✅ | ✅ | ✅ | Auto-creates listing with status=active, sets createdListingId | ✅ PASS |
| → approved (listing exists) | ✅ | ✅ | ✅ | No duplicate listing | ✅ PASS |
| → rejected | ✅ | ✅ | ✅ | None | ✅ PASS |

### Walkthrough Status Machine

`visit_scheduled`/`scheduled` date requirement: `updateWalkthroughStatusSchema` has `scheduledAt: z.string().optional().nullable()` — not enforced even when status is `scheduled`. ❌ FAIL (PF-12 applies to walkthroughs too, same pattern).

### Enquiry Status Machine

`new → in_progress → contacted → resolved → spam` — all handled in `adminUpdateEnquiryStatusAction`. Status events written. No listing side effects. ✅ PASS (code).

---

## A5. Admin Panel Functionality

| Capability | Spec Requirement | Implementation Status |
|---|---|---|
| Dashboard KPI counts | `SELECT COUNT(*)` per status | ✅ PASS — uses Drizzle count() with correct filters |
| Dashboard "needs attention" | Overdue follow-ups | ❌ NOT IMPLEMENTED — dashboard shows recent items, no overdue filter |
| Dashboard "my work" | Signed-in staff's assignments | ❌ NOT IMPLEMENTED — dashboard shows all recent, not filtered by current user |
| List: sort by column | Sortable columns | ❌ NOT IMPLEMENTED — client-side filter only, no sort by column |
| List: status filter | Status tab filter | ✅ PASS — client-side filter by status works |
| List: search (name, email, phone, ref) | Trigram search | ✅ PARTIAL — client-side JS includes(), not DB trigram search |
| List: date range filter | Date range UI | ❌ NOT IMPLEMENTED |
| List: city/category filter | Category filter | ❌ NOT IMPLEMENTED for most entities |
| List: pagination | Keyset pagination | ❌ NOT IMPLEMENTED — all records loaded at once |
| Saved view tabs | New/Mine/Follow-ups | ❌ NOT IMPLEMENTED |
| Bulk actions | Select multiple → status/assign | ❌ NOT IMPLEMENTED |
| CSV export | Correct columns, injection-safe | ⚠️ PARTIAL — client-side CSV generation exists but: (1) not audited in DB, (2) see CSV injection below |
| CSV injection | Leading `=+−@` neutralised | ❌ FAIL — `exportCSV()` in AdminApplicationsView.tsx:186-223 uses raw values in cells with no sanitisation. e.g. `a.reference` (controlled format), but `a.userName` is raw user input in CSV. See FUNC-06. |
| Detail drawer: correct data | Full data in drawer | ✅ PASS — selectedApp shows all fields |
| Detail drawer: next statuses | Restricted status list | ⚠️ PARTIAL — all statuses always shown in dropdown; no machine-enforced restriction of which next-states are valid |
| Detail drawer: required field prompts | visitAt required for visit_scheduled | ❌ FAIL — client shows date picker conditionally but doesn't enforce required |
| Detail drawer: terminal transition confirmation | Confirmation dialog naming side effects | ❌ NOT IMPLEMENTED — uses browser `confirm()` only for role changes; no confirmation dialog for closed_won |
| Notes: add/list with author and time | Notes panel | ✅ PASS (code) |
| Timeline: events + notes + audit | Merged timeline | ⚠️ PARTIAL — statusEvents shown in timeline; notes shown separately; no merged single timeline |
| Listings management | Create/edit/publish/archive | ❌ NOT IMPLEMENTED — `/admin/listings` page exists but AdminListingsView component appears minimal |
| Users: change role | Role dropdown | ✅ PASS (code — adminUpdateUserRoleAction) |
| Users: disable/enable | Disable toggle | ❌ NOT IMPLEMENTED — `user.disabled` field exists in schema but no action to toggle it |
| Users: reset password | Password reset action | ❌ NOT IMPLEMENTED |
| Users: revoke sessions | Revoke action | ❌ NOT IMPLEMENTED |
| Users: cannot demote last admin | Guard | ❌ NOT IMPLEMENTED (PF-04) |
| Users: every action audited | auditLog | ✅ PASS for role changes; ❌ FAIL for missing actions |
| Activity log: filterable | Filter UI | ❌ NOT IMPLEMENTED — displays flat list of last 100 rows |
| Activity log: before/after diffs | detailsJson | ✅ PARTIAL — detailsJson has fromStatus/toStatus; no structured before/after diff |

---

## A6. Front-End Regression Against Real Data

### Critical Finding: Properties Page Uses Hardcoded Data (FUNC-07)

**Evidence:** `components/sections/properties/PropertiesResults.tsx:16-25`
```typescript
const ALL_LISTINGS: Listing[] = [
  { photoId: "properties-listing-01", slug: "sarvani-heights-3bhk", ... },
  { photoId: "properties-listing-02", slug: "lanco-hills-residencies-2bhk", ... },
  // ...8 hardcoded listings
];
```

The `/properties` page is a **client component that filters a hardcoded JavaScript array**. It does not query the database. This means:
- Listings created via owner submission approval do NOT appear on the public properties page
- Reserved/rented/sold listings still appear in the hardcoded array (no status filtering)
- The HTC-managed filter is hardcoded (`htcManaged: true/false`)
- Search is against hardcoded text, not the DB
- Any admin-created listing is invisible to the public

**Severity:** S0 — Critical functional defect. This is the core browse experience and it's entirely disconnected from the database.

### Critical Finding: Property Detail Page Uses Static Data (FUNC-08)

**Evidence:** `app/properties/[slug]/page.tsx` — The page receives the `slug` param but **does not query the database**. All content (title, price, specs, gallery) is rendered by static sub-components with hardcoded demo values.

**Severity:** S0 — Critical functional defect.

### Playwright Suite

DYNAMIC-NEEDED — Cannot run without live instance. The `tests/` directory exists per the file listing. Command: `npm run test`.

---

## A7. Cross-Cutting Checks

| Check | Status |
|---|---|
| Orphaned data on FK cascade | ✅ PASS — FKs have explicit onDelete actions (cascade, restrict, set null) |
| Idempotency (double-submit) | ✅ PASS — DB partial unique index + application-layer check prevent duplicate applications; rate limit + transaction prevent duplicate form rows |
| Empty states | ✅ PASS — All admin list tables have empty state cells; DYNAMIC-NEEDED for error states |
| Timezone: timestamptz | ✅ PASS — All timestamps use `{ withTimezone: true }` in Drizzle schema |
| Timezone: IST display | DYNAMIC-NEEDED — display formatting depends on locale |
| Money: integer rupees | ✅ PASS — All price fields are `integer` in schema, no `decimal`/`float` |
| Money: Indian grouping | ✅ PASS — Admin view uses `.toLocaleString("en-IN")` |

---

## Defect Register

| ID | Severity | Feature | Steps to Reproduce | Expected | Actual | Evidence | Root Cause |
|---|---|---|---|---|---|---|---|
| FUNC-01 | S2 | Owner submission consent | Submit /list-your-property form | `consent_at` stored in DB | No consent field in ownerSubmissionSchema; ownerSubmissions table has no consent_at column | `lib/db/schema/owner-submissions.ts` — no consentAt field | Missing schema column and Zod validation |
| FUNC-02 | S2 | Phone masking | Load /admin/applications | Phone masked in list view | Full phone visible in table at AdminApplicationsView.tsx:317 | `components/sections/admin/AdminApplicationsView.tsx:317` | No masking applied in list rendering |
| FUNC-03 | S3 | Sub-3-second submit guard | Submit any public form within 3s | Request rejected | No timing guard exists | All `submitEnquiryAction`, `submitOwnerSubmissionAction`, `submitWalkthroughAction` — no timing check | Not implemented |
| FUNC-04 | S2 | Apply→login redirect | Click Apply as anonymous user on /properties/[slug] | Redirect to /login?returnTo=/properties/[slug] | Falls back to creating enquiry (no redirect) | `components/sections/property-detail/StickyContactBar.tsx:65-82` | Spec redirect not implemented; guest fallback used instead |
| FUNC-05 | S2 | Race: two closed_won | Two staff sessions simultaneously close_won different apps on same listing | Exactly one wins | Potential DB inconsistency (serializable isolation not set) | `lib/services/applications.ts:112` — `db.transaction()` default isolation | Missing `SERIALIZABLE` isolation level |
| FUNC-06 | S2 | CSV injection | Export CSV with user named `=CMD|' /C calc'!A0` | Cell value sanitised | Raw value written to CSV | `AdminApplicationsView.tsx:203` — `"${a.userName}"` double-quoted but no `=+−@` stripping | No CSV injection sanitisation |
| **FUNC-07** | **S0** | Properties page DB connection | Browse /properties | Listings from DB | Hardcoded static array in PropertiesResults.tsx | `components/sections/properties/PropertiesResults.tsx:16-25` | Frontend not connected to DB |
| **FUNC-08** | **S0** | Property detail page | Visit /properties/any-slug | DB-backed listing data | Static hardcoded demo content | `app/properties/[slug]/page.tsx` — no DB query | Frontend not connected to DB |
| FUNC-09 | S1 | `approved` status side effect | Admin: set application to approved | Listing status → reserved | Listing unchanged | `lib/services/applications.ts` — no reserved flip on approved | Not implemented (PF-05) |
| FUNC-10 | S1 | `closed_lost` revert | Admin: set approved app to closed_lost | Listing reverts reserved→active | Listing unchanged (already wasn't reserved per FUNC-09) | Same service file | Not implemented (PF-06) |
| FUNC-11 | S2 | `visit_scheduled` date required | Admin: set visit_scheduled without a date | Request rejected | No server-side enforcement | `lib/validation/forms.ts:116-117` — visitAt optional | Missing conditional Zod refinement (PF-12) |
| FUNC-12 | S1 | Admin: disable user | Admin panel | Disable/enable user | No disable/enable capability | `components/sections/admin/AdminUsersView.tsx` — no disable toggle | Not implemented |
| FUNC-13 | S1 | Admin: revoke sessions | Admin panel | Revoke all sessions for user | Not implemented | N/A | Not implemented |
| FUNC-14 | S1 | Admin: bulk actions | Admin panel | Multi-select + bulk status/assign | Not implemented | N/A | Not implemented |
| FUNC-15 | S2 | Admin: dashboard needs-attention | /admin | Overdue follow-ups surfaced | Not implemented | `app/admin/page.tsx` — no nextFollowUpAt < now query | Not implemented |
| FUNC-16 | S2 | Admin: pagination | /admin/* | Keyset pagination | All records loaded at once | All admin pages: `.select()...` no LIMIT/OFFSET beyond recent-5 | Not implemented |
| FUNC-17 | S2 | Admin: CSV export audit | CSV download | Export audited in audit_log | Not audited | `AdminApplicationsView.tsx:186` — client-side export, no server call | Not implemented |

---

## Admin-Sync Loop Verdict

**The admin-sync loop is PARTIALLY BROKEN.**

✅ Working: Public forms → DB → admin panel (enquiries, submissions, walkthroughs). The data path from form submission to admin section works correctly for all three public form types.

✅ Working: Application creation → DB → admin panel → user account status events.

✅ Working: `closed_won` cascade → listing status change + competing app closure + audit log.

✅ Working: Owner submission approval → auto-create listing + link back.

❌ Broken: Properties/listings page does NOT read from DB (FUNC-07). Any listing created via admin or owner submission is invisible to the public.

❌ Broken: Property detail page does NOT read from DB (FUNC-08). The apply-to-specific-listing flow cannot work end-to-end against real data.

❌ Broken: `approved` status does NOT flip listing to `reserved` (FUNC-09).

❌ Broken: Several admin capabilities specified (disable user, revoke sessions, bulk actions, pagination) are not implemented.

**The two most critical sync failures are FUNC-07 and FUNC-08** — the public-facing browse experience is entirely disconnected from the database backend. This means the backend (admin panel, applications, submissions) is functionally complete but there is no working user-visible connection to it via the listings pages.

