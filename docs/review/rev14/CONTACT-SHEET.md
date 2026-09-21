# Revision 14 — Communities Hero: Shared Carousel Contact Sheet

## Manifest & Slide Summary

All 5 slides tell the complete community operations story on `/communities`. The carousel uses the shared `ThumbnailCarousel` component with frosted caption cards synchronized to the slide transitions.

| # | ID | Category | Status / File | Size | Alt Text | Caption Label & Detail |
|---|---|---|---|---|---|---|
| **01** | `communities-carousel-01` | **EXT-DAY** | `public/sequences/communities-carousel-01.jpg` | **113.5 KB** | Community gate with security cabin | **Visitor management**<br>Every guest approved from the resident's phone |
| **02** | `communities-carousel-02` | **INT-DAY** | `public/sequences/communities-carousel-02.jpg` | **133.3 KB** | Residents in the community clubhouse | **Facility booking**<br>Clubhouse, courts and halls — no double bookings |
| **03** | `communities-carousel-03` | **PEOPLE-OPS** | `<Placeholder>` (Quota fallback) | — | Facility manager at the community office | **Operations console**<br>Every complaint assigned, tracked and closed |
| **04** | `communities-carousel-04` | **PEOPLE-OPS** | `<Placeholder>` (Quota fallback) | — | Committee members meeting | **Committee workspace**<br>Decisions and approvals, on record |
| **05** | `communities-carousel-05` | **DETAIL** | `<Placeholder>` (Quota fallback) | — | A resident using the community app | **Resident app**<br>Dues, notices and requests in one place |

## Quality & Budget Verification
- **Generated Images**: Both 01 and 02 are within budget (113.5 KB & 133.3 KB $\le 180\text{ KB}$).
- **Placeholder Fallback**: Slides 03–05 render semantic `<Placeholder>` frames (`data-placeholder`), ensuring the carousel is **never blank**.
- **Stand-in Badge**: Top-left position on `/communities` avoids collision with bottom-left caption cards.
- **Caption Contrast**: Frosted white card (`rgba(255, 255, 255, 0.92)` backdrop) provides $\ge 4.5:1$ contrast against `--red-700` (`#B52D20` = 5.4:1) and `--ink-700` (`#342E28` = 11.2:1).
