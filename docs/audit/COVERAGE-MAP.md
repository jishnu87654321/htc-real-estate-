# HTC Coverage Map — Phase A Audit
Generated: 2026-09-21 | Method: static code inspection of all route, action, service, schema, and component files

## A. Route Inventory

### Public Routes
| Route | Page File | Auth Required | Form / Action |
|---|---|---|---|
| `/` | `app/page.tsx` | No | None |
| `/about` | `app/about/page.tsx` | No | None |
| `/contact` | `app/contact/page.tsx` | No | `submitEnquiryAction` |
| `/communities` | `app/communities/page.tsx` | No | `submitWalkthroughAction` (modal) |
| `/communities/residents` | `app/communities/residents/page.tsx` | No | None |
| `/properties` | `app/properties/page.tsx` | No | None (client-side filter) |
| `/properties/[slug]` | `app/properties/[slug]/page.tsx` | No (view); Login for Apply | `submitApplicationAction`, `submitEnquiryAction`, `toggleSaveListingAction` |
| `/list-your-property` | `app/list-your-property/page.tsx` | No | `submitOwnerSubmissionAction` |
| `/pricing` | `app/pricing/page.tsx` | No | None |
| `/operations` | `app/operations/page.tsx` | No | None |
| `/login` | `app/login/page.tsx` | No | `signIn.email()` (better-auth client) |
| `/signup` | `app/signup/page.tsx` | No | `signupAction` |
| `/account` | `app/account/page.tsx` | Yes (`requireUser`) | `withdrawApplicationAction` |

### Admin Routes
| Route | Auth Level | Data Source |
|---|---|---|
| `/admin` | staff/admin | applications, enquiries, ownerSubmissions, walkthroughRequests, listings |
| `/admin/applications` | staff/admin | applications, listings, user, notes, statusEvents |
| `/admin/enquiries` | staff/admin | enquiries, user, notes |
| `/admin/submissions` | staff/admin | ownerSubmissions, user, notes |
| `/admin/walkthroughs` | staff/admin | walkthroughRequests, user |
| `/admin/listings` | staff/admin | listings |
| `/admin/users` | **staff/admin ONLY** (should be admin-only — PF-03) | user |
| `/admin/activity` | **staff/admin ONLY** (should be admin-only — PF-03) | auditLog |

## B. Server Action Inventory

| Action | Auth Guard | Rate Limited | Tables Written |
|---|---|---|---|
| `submitEnquiryAction` | None | Yes 5/hr/IP | enquiries, statusEvents, rateLimits |
| `submitOwnerSubmissionAction` | None | Yes 5/hr/IP | ownerSubmissions, statusEvents, rateLimits |
| `submitWalkthroughAction` | None | Yes 5/hr/IP | walkthroughRequests, statusEvents, rateLimits |
| `submitApplicationAction` | Session check | No | applications, statusEvents, referenceCounters |
| `withdrawApplicationAction` | requireUser | No | applications, statusEvents |
| `toggleSaveListingAction` | Session check | No | savedListings |
| `loginAction` | None | Yes 5/15min/IP | user.lastLoginAt, rateLimits |
| `signupAction` | None | Yes 5/hr/IP | user, account, rateLimits |
| `logoutAction` | None | No | session |
| `adminUpdateApplicationStatusAction` | requireRole staff/admin | No | applications, statusEvents, [listings+auditLog on closed_won] |
| `adminUpdateEnquiryStatusAction` | requireRole staff/admin | No | enquiries, statusEvents |
| `adminUpdateSubmissionStatusAction` | requireRole staff/admin | No | ownerSubmissions, statusEvents, [listings+auditLog on approved] |
| `adminUpdateWalkthroughStatusAction` | requireRole staff/admin | No | walkthroughRequests, statusEvents |
| `adminAddNoteAction` | requireRole staff/admin | No | notes |
| `adminAssignEntityAction` | requireRole staff/admin | No | applications/enquiries/ownerSubmissions/walkthroughRequests — NO auditLog (PF-11) |
| `adminUpdateUserRoleAction` | requireRole admin | No | user, auditLog |

## C. Feature→DB→Admin→User Trace Matrix (Test Cases)

| # | Feature | Entry Point | Action | Service | DB Tables | Admin Section | User View |
|---|---|---|---|---|---|---|---|
| TC-01 | General enquiry | /contact | submitEnquiryAction | createEnquiry | enquiries, statusEvents | Queries & Leads | Reference returned |
| TC-02 | Listing enquiry | /properties/[slug] | submitEnquiryAction | createEnquiry | enquiries, statusEvents | Queries & Leads | Reference returned |
| TC-03 | Book walkthrough | /communities | submitWalkthroughAction | createWalkthroughRequest | walkthroughRequests, statusEvents | Walkthroughs | Reference returned |
| TC-04 | List property | /list-your-property | submitOwnerSubmissionAction | createOwnerSubmission | ownerSubmissions, statusEvents | Submissions | Account→My Submissions |
| TC-05 | Apply (logged in) | /properties/[slug] | submitApplicationAction | createApplication | applications, statusEvents, referenceCounters | Applications | Account→My Applications |
| TC-06 | Apply (guest fallback) | /properties/[slug] | submitEnquiryAction | createEnquiry | enquiries, statusEvents | Queries & Leads | Reference returned |
| TC-07 | Save listing | /properties/[slug] | toggleSaveListingAction | direct DB | savedListings | Not in admin | Account→Saved Homes |
| TC-08 | Signup | /signup | signupAction | better-auth | user, account | Admin→Users | /account redirect |
| TC-09 | Login | /login | better-auth client | N/A | session, user.lastLoginAt | Admin→Users | /account or /admin |
| TC-10 | Withdraw application | /account | withdrawApplicationAction | transitionApplicationStatus | applications, statusEvents | Applications (updated) | Account→withdrawn |
| TC-11 | Admin: contacted | /admin/applications | adminUpdateApplicationStatusAction | transitionApplicationStatus | applications, statusEvents | Applications timeline | Account→"contacted" |
| TC-12 | Admin: visit_scheduled | /admin/applications | adminUpdateApplicationStatusAction | transitionApplicationStatus | applications, statusEvents | Applications | Account→visit date |
| TC-13 | Admin: approved | /admin/applications | adminUpdateApplicationStatusAction | transitionApplicationStatus | applications, statusEvents, MISSING→listings reserved | Applications | Account→"approved" |
| TC-14 | Admin: closed_won | /admin/applications | adminUpdateApplicationStatusAction | transitionApplicationStatus | applications, statusEvents, listings, auditLog | Applications | Account→"completed" |
| TC-15 | Admin: closed_lost (from approved) | /admin/applications | adminUpdateApplicationStatusAction | transitionApplicationStatus | applications, statusEvents, MISSING→listing revert | Applications | Account→"closed" |
| TC-16 | Admin: submission approved | /admin/submissions | adminUpdateSubmissionStatusAction | transitionSubmissionStatus | ownerSubmissions, listings (auto-create), statusEvents, auditLog | Submissions | Account→My Submissions |
| TC-17 | Admin: role change | /admin/users | adminUpdateUserRoleAction | direct DB | user, auditLog | Users | N/A |
| TC-18 | Admin: assign entity | Any admin drawer | adminAssignEntityAction | direct DB | entity table | Admin assigned | N/A |
| TC-19 | Admin: add note | Any admin drawer | adminAddNoteAction | direct DB | notes | Admin notes panel | Not visible to user |

## D. Missing / UNVERIFIED Features

| Category | Item | Finding ID | Severity |
|---|---|---|---|
| Security | `returnTo` open redirect | PF-01/13 | High |
| Security | Hardcoded auth secret fallback | PF-02 | Critical |
| Security | `/admin/users` staff access | PF-03 | High |
| Security | No last-admin guard | PF-04 | High |
| Security | No security headers | PF-08 | Medium |
| Functionality | `approved` doesn't reserve listing | PF-05 | High |
| Functionality | `closed_lost` from approved doesn't revert | PF-06 | High |
| Functionality | `visit_scheduled` no server-side date check | PF-12 | Medium |
| Functionality | Assign action not audited | PF-11 | Low |
| Functionality | Rate limit counts success, not just failure | PF-07 | Medium |
| Functionality | Properties page uses hardcoded listing array, not DB | NEW | High |
| Functionality | Property detail page uses static data, not DB | NEW | High |
| Functionality | Admin: disable/enable user | MISSING | High |
| Functionality | Admin: revoke sessions | MISSING | Medium |
| Functionality | Admin: bulk actions | MISSING | Medium |
| Functionality | Admin: keyset pagination | MISSING | Low |
| Functionality | Admin: saved view tabs (New/Mine/etc.) | MISSING | Low |
| Functionality | Admin: CSV export audit log | MISSING | Low |
| Functionality | Sub-3-second submission timing guard | MISSING | Low |

