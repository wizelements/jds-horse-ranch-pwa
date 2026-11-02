import type { GalleryPhoto, Service, Testimonial } from "@/lib/types";

const stamp = "2026-11-02T00:00:00.000Z";
const base = { active: true, created_at: stamp, updated_at: stamp };
// Published business information, verified against jdshorseranch.com on Nov 1.
export const DEFAULT_SERVICES: Service[] = [
  { ...base, id: "service-riding-lessons", name: "Riding lessons", description: "From first-time riders to those ready to grow their skills, riding lessons are personally reviewed and arranged by JD.", price_min: 85, price_max: 85, price_detail: "Children 9 & under · 30 minutes · $45", duration_minutes: 60, age_requirement: "Discuss with JD", display_order: 1 },
  { ...base, id: "service-trail-rides", name: "Guided trail rides", description: "Leave the everyday behind and enjoy the natural surroundings on a guided ride for yourself, a friend, or a small group.", price_min: 85, price_max: 85, price_detail: "2 riders · $160 / 3 riders · $245", duration_minutes: 60, age_requirement: "Discuss with JD", display_order: 2 },
  { ...base, id: "service-special-events", name: "Special occasions", description: "Birthdays, photo shoots, video projects, and more. Share your ideas with JD to arrange the details together.", price_min: 200, price_max: 200, price_detail: "Horse rental · Event details personally reviewed", duration_minutes: 60, age_requirement: "Discuss with JD", display_order: 3 },
];

export const DEFAULT_PHOTOS: GalleryPhoto[] = [
  [1, "Time with the horses", "A handler walking a chestnut horse in the ranch pasture"],
  [5, "A warm welcome", "Two visitors standing with horses inside the barn"],
  [6, "Close to the horses", "A guest posing beside a chestnut horse"],
  [7, "Ride together", "A group of mounted riders and guides outside the ranch barn"],
  [8, "Days to remember", "A guest with a celebration cake at a ranch gathering"],
  [9, "Bring your people", "Friends and family gathered together for a ranch celebration"],
].map(([index, title, description], order) => ({ ...base, id: `ranch-photo-${index}`, image_url: `/photos/ranch-${index}.jpg`, title: String(title), description: String(description), display_order: order }));

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { ...base, id: "published-rebecca", customer_name: "Rebecca L.", text: "JD is a great instructor. He makes sure everyone feels confident and safe going out on the trail. Their views are beautiful.", display_order: 1 },
  { ...base, id: "published-akeela", customer_name: "Akeela M.", text: "Had a great time! Everyone was so welcoming, we were taught how to properly hold the reigns and place our feet before going on the trail.", display_order: 2 },
  { ...base, id: "published-sylvester", customer_name: "Sylvester S.", text: "The horses were so gentle, and the tour breath taking. A very great program for everyone.", display_order: 3 },
];
