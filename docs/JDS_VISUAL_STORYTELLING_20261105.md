# JDS Horse Ranch — Visual trust and photo search quality

## Outcome
Visitors arriving from "horse riding atlanta" should immediately see a real rider on a real horse, understand that a guide is present, learn what experiences are offered, and feel confident calling JD. Photographs must clarify the experience rather than disguise the location or make unverified safety promises.

## Verified source and rights boundary (Nov 5, 2026)
- Examined every JPEG in the existing repository /public/photos/ranch-0.jpg through ranch-9.jpg. These photographs were already part of the ranch redesign and are retained as first-party source assets.
- On November 5, 2026, the project operator explicitly confirmed they have reuse rights to JD's ranch guest photographs. Six authentic images from @carla.marie.mills' public April 2025 and December 2024 guest posts were downloaded from the creator's original public posts and checked visually. They were stored as versioned local WebP site assets rather than linking to expiring signed CDN URLs.
- The site attributes the creator, shows dates and links back to the original guest posts without removing existing creator marks. The reuse-rights confirmation was provided in conversation; written license documents or image likeness releases have not independently been inspected.
- The new gallery places rider photographs first, then a wooded riding experience, a view from horseback at a lake, and horse portraits, followed by the prior archive. The visit page shows the April 2025 ranch banner as an illustrative sign, not a guarantee the sign has not moved.
- Avoid representing older photographs, signage or trail conditions as a live current view of the Fairburn facility.
- Photos of children: leave permission-sensitive images in their existing context, avoid promoting them into a hero image or new advertisement without release confirmation.

## Intent and image placement
| Stage | Visitor question | Visual response | Photo currently used |
|---|---|---|---|
| Initial search landing | "Is this really horseback riding? Will someone guide me?" | Large, unobscured mounted guest + nearby guide; true HTML img, priority load, subject-aware crop | ranch-2 |
| Service cards: riding lessons | "Will I be helped?" | Guest mounted with guide nearby, rather than generic horses | ranch-2 |
| Service cards: guided trail rides | "Can a small group ride?" | Archival group of riders; do not portray stable as the current trail | ranch-7 |
| Service cards: events | "Can we celebrate here?" | A real celebration with cupcakes rather than an unrelated group portrait | ranch-8 |
| Gallery trust | "Are these real people and horses?" | Individually named archival images, recognizable experiences, honest descriptions | ranch-1,7,5,8,9,0 |
| Visit page | "Where is it?" | A ranch photo explicitly marked archival; actual address and directions in text | ranch-0 |

## Search and accessibility
- Hero migrated from CSS background image to Next Image (real <img>, alt, responsive sizes, priority), making it more discoverable and better suited to image results and Core Web Vitals.
- Image alt descriptions describe visible subjects; no keyword stuffing or unsupported safety/welfare claims.
- Service detail pages have captions, their own Open Graph images and primaryImageOfPage structured data.
- The canonical six-page sitemap includes image URLs for the homepage and relevant service pages.
- Next Image serves appropriately sized versions. No external hotlinked guest imagery was introduced.
- Avoid using photos of the former barn for "current location" queries; record future photo provenance before publishing.

## Priority replacement shots for JD (only when properly licensed and verified current)
1. **Hero:** landscape 1600x1000 or larger, an adult guest actually riding a calm horse beside a guide, with space around the subjects for mobile cropping, captured at the current ranch.
2. **Trail page:** authentic wooded trail with two riders and visible horses at the current ranch; landscape, clear natural light.
3. **Lessons:** guide interacting with a first-time rider (with express consent), actual orientation/lesson.
4. **Visit:** current Fairburn entrance, parking/arrival point, and clear approach; avoid exposing private addresses beyond business listing.
5. **Special events:** actual JD-approved birthday/event guests; releases confirmed for identifiable people, especially minors.

Each replacement should record photographer, capture date, current-site confirmation, usage permission, source file, aspect ratio and accessibility alt. Replace existing assets only after those checks; do not portray third-party guest images as owned.

## Measurement
Track organic search queries, Google Images impressions, Core Web Vitals (LCP), tap-to-call interactions and reservation conversion. A prettier site does not prove a ranking or revenue lift. Compare after enough real traffic.

## Nov 5 authorized guest-photo placement and provenance
| Local site asset | Photographer/source | Actual visible subject | Placement |
|---|---|---|---|
| `guest-2025-ride.webp` | @carla.marie.mills, Apr 16 2025 | Guest mounted on pinto horse in a sunny paddock | Homepage hero, gallery, social preview |
| `guest-2024-woodland-ride.webp` | @carla.marie.mills, Dec 8 2024 | Guest riding a pinto among woods | Trail service card and details, gallery |
| `guest-2024-lake-view.webp` | @carla.marie.mills, Dec 8 2024 | View of a lake beyond a horse's ears | Gallery |
| `guest-2025-ranch-sign.webp` | @carla.marie.mills, Apr 16 2025 | JD's Horse Ranch sign with phone on a roadside structure | Visit page wayfinding (historical note) |
| `guest-2025-two-horses.webp` | @carla.marie.mills, Apr 16 2025 | Two saddled horses beside wooden rail | Gallery |
| `guest-2025-black-horse.webp` | @carla.marie.mills, Apr 16 2025 | Black horse with blue halter | Gallery |

Original posts:
- https://www.lemon8-app.com/@carla.marie.mills/7493317959583367723
- https://www.lemon8-app.com/@carla.marie.mills/7446094569826959914

All six images are archived in JDS's public repository, identified and credited; Google search photos were used for discovery, but no Google Maps CDN assets were scraped or hotlinked. Search engines receive source-image URLs in the public image sitemap and structured data.

