# JD's Horse Ranch — verified photography and intentional placement
Source of truth: https://jdshorseranch.com/ (owner website), captured October 28, 2026. The WordPress homepage contains public media image0–image9 under `https://jdshorseranch.com/wp-content/uploads/2020/09/`.

**Critical diagnosis:** the earlier `jds-horse-ranch-v1751084549.websitepro-cdn.com` hostname returns HTTP **410** on all ten JPEGs in the Vercel deployment environment. Photos were missing even though components were rendering. The redesign now uses the official **jdshorseranch.com** media origin directly. Next.js Image remotePatterns allow only that validated origin.

Presentation map:
- `image0.jpeg` — atmospheric homepage hero, dark gradient for readable heading
- `image1.jpeg` — riding lessons card
- `image2.jpeg` — guided trail rides card
- `image3.jpeg` — special events card
- `image4.jpeg` — personal phone booking section with a distinct crop
- `image5.jpeg` through `image9.jpeg` — responsive 5-image mosaic with click-to-enlarge and keyboard controls

**Content caveat:** all numbered photo filenames are from the ranch's published gallery and do not have descriptive captions. Do not invent that a specific image depicts a particular rider, trainer, horse, or activity. Alt text uses neutral source descriptions until JD provides captions.

Google research: The business listing is https://www.google.com/maps/place/?q=place_id:ChIJgaHu6b8f9YgRBA8VlHl70mk. The gallery includes a clearly labeled link to view Google-hosted customer photos; this avoids unauthorized rehosting of customer images or violating Google photo attribution/license restrictions. Images returned by Google search from unrelated third-party sites, including travel blog portraits and stock-type directory thumbnails, have **not** been copied into the ranch website.

Guest path remains phone-first at **(404) 981-2361**, with no public forms, WhatsApp, or SMS.
