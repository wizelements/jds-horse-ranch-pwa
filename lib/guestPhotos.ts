import type { GalleryPhoto } from "@/lib/types";

// Ranch visitor media posted publicly in 2024 and 2025, reused with operator-confirmed permission.
// These are historical guest experiences, not a guarantee of today's horses, trails or arrival setup.
const stamp = "2026-11-05T00:00:00.000Z";
const common = { active: true, created_at: stamp, updated_at: stamp };

export const FEATURED_GUEST_PHOTOS: GalleryPhoto[] = [
  {
    ...common, id: "guest-2025-ride", display_order: 0,
    image_url: "/photos/guest-2025-ride.webp",
    title: "A real ride in Fairburn",
    description: "April 2025 guest photo: a rider in a white cowboy hat on a black-and-white pinto horse in the sunshine.",
  },
  {
    ...common, id: "guest-2024-woodland", display_order: 1,
    image_url: "/photos/guest-2024-woodland-ride.webp",
    title: "Among the trees",
    description: "December 2024 guest photo: a rider on horseback on a wooded path.",
  },
  {
    ...common, id: "guest-2024-lake", display_order: 2,
    image_url: "/photos/guest-2024-lake-view.webp",
    title: "A view from the saddle",
    description: "December 2024 guest photo: a quiet lakeside view over a horse's ears during a ride.",
  },
  {
    ...common, id: "guest-2025-pair", display_order: 3,
    image_url: "/photos/guest-2025-two-horses.webp",
    title: "Ready for the ride",
    description: "April 2025 guest photo: two saddled horses standing beside a wooden rail in a grassy area.",
  },
  {
    ...common, id: "guest-2025-horse", display_order: 4,
    image_url: "/photos/guest-2025-black-horse.webp",
    title: "Meet a ranch horse",
    description: "April 2025 guest photo: a black horse wearing a blue halter standing outdoors near trees.",
  },
];

export const GUEST_PHOTO_CREDITS: Record<string, { label: string; url: string; date: string }> = {
  "guest-2025-ride": { label: "@carla.marie.mills", date: "April 2025", url: "https://www.lemon8-app.com/@carla.marie.mills/7493317959583367723" },
  "guest-2024-woodland": { label: "@carla.marie.mills", date: "December 2024", url: "https://www.lemon8-app.com/@carla.marie.mills/7446094569826959914" },
  "guest-2024-lake": { label: "@carla.marie.mills", date: "December 2024", url: "https://www.lemon8-app.com/@carla.marie.mills/7446094569826959914" },
  "guest-2025-pair": { label: "@carla.marie.mills", date: "April 2025", url: "https://www.lemon8-app.com/@carla.marie.mills/7493317959583367723" },
  "guest-2025-horse": { label: "@carla.marie.mills", date: "April 2025", url: "https://www.lemon8-app.com/@carla.marie.mills/7493317959583367723" },
};
