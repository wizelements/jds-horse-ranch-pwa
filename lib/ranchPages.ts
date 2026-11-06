export type RanchPage = {
  title: string;
  description: string;
  heading: string;
  kicker: string;
  intro: string;
  image: string;
  imageAlt: string;
  sectionTitle: string;
  details: readonly string[];
  highlights: readonly { label: string; value: string }[];
  faq: readonly { question: string; answer: string }[];
  serviceType?: string;
};
export const ranchPages: Record<string, RanchPage> = {
  "horseback-riding-lessons-fairburn-ga": {
    title: "Horseback Riding Lessons in Fairburn, GA | JD's Horse Ranch",
    description: "Explore horseback riding lessons at JD's Horse Ranch in Fairburn near Atlanta. One-hour lessons start at $85. Call JD to discuss your ride.",
    heading: "Horseback riding lessons in Fairburn, Georgia",
    kicker: "Build confidence in the saddle",
    intro: "Whether this is your first time around horses or you're returning to the saddle, start with a conversation. JD will help you understand the riding experience, discuss the riders in your party and arrange an appointment when availability is confirmed.",
    image: "/photos/ranch-2.jpg",
    imageAlt: "A smiling guest riding a brown horse with a guide standing beside them at JD's Horse Ranch",
    sectionTitle: "What to know before your lesson",
    details: [
      "The ranch is at 7555 Jones Road in Fairburn, Georgia, outside Atlanta. Lessons are by appointment only; there are no walk-ins.",
      "Published pricing is one hour starting at $85. For children age nine and under, a 30-minute lesson is listed at $45. Discuss the appropriate duration and current availability with JD before planning your visit.",
      "Wear long pants and sturdy, closed-toe shoes or boots. Ask JD about any other rider-specific requirements when arranging the lesson.",
      "Deposits are non-refundable. Requests to reschedule require at least 24 hours' notice and JD's approval."
    ],
    highlights: [{label:"One-hour lesson",value:"Starting at $85"},{label:"Ages 9 and under",value:"30 minutes · $45"},{label:"Reservations",value:"Call before visiting"}],
    faq: [
      {question:"Can beginners inquire about riding lessons?",answer:"Yes. Call JD and tell him about your riding experience, age group and goals so he can explain what is suitable and available."},
      {question:"Can I walk in for a lesson?",answer:"No. JD's Horse Ranch is appointment-only. Call ahead to arrange a time."},
      {question:"How do I reserve a lesson?",answer:"Call (404) 981-2361 to discuss availability and any deposit. JD must confirm your reservation; calling alone does not reserve a time."}
    ],
    serviceType:"Horseback riding lessons"
  },
  "guided-horseback-trail-rides-fairburn-ga": {
    title: "Guided Horseback Trail Rides in Fairburn, GA | JD's Horse Ranch",
    description: "Plan a guided horseback trail ride near Atlanta at JD's Horse Ranch in Fairburn. Published rides for one, two or three guests. Call to schedule.",
    heading: "Guided horseback trail rides near Atlanta",
    kicker: "A slower pace, just outside the city",
    intro: "Make room for the country. JD's Horse Ranch offers guided horseback trail rides in Fairburn for people who want to spend time outdoors and create a memorable experience. Speak directly with JD about your group, timing and the available ride options.",
    image: "/photos/ranch-7.jpg",
    imageAlt: "An archival group of horseback riders gathered outside a ranch stable",
    sectionTitle: "Choose the ride for your group",
    details: [
      "The ranch currently publishes guided one-hour trail rides for one, two or three people. A one-rider ride is listed at $85, a two-rider ride at $160 and a three-rider ride at $245.",
      "Tell JD how many people are riding and whether anyone is new to horses. He can explain the arrangements, availability and any relevant rider requirements.",
      "Rides are by appointment at 7555 Jones Road, Fairburn, GA 30213. Please do not arrive without a confirmed appointment.",
      "Deposits are non-refundable. Rescheduling requires at least 24 hours' notice and JD's approval."
    ],
    highlights: [{label:"One rider",value:"1 hour · $85"},{label:"Two riders",value:"1 hour · $160"},{label:"Three riders",value:"1 hour · $245"}],
    faq: [
      {question:"Are guided rides offered for couples?",answer:"The ranch publishes a one-hour guided trail ride for two at $160. Call JD to ask about dates and availability."},
      {question:"Do I have to book before driving to Fairburn?",answer:"Yes. Visits are by appointment only, with no walk-ins."},
      {question:"Is a phone conversation required?",answer:"Yes. Call JD directly to discuss the group and confirm an available ride before making plans."}
    ],
    serviceType:"Guided horseback trail rides"
  },
  "horseback-riding-special-events-fairburn-ga": {
    title: "Horse Ranch Special Events & Photo Shoots in Fairburn, GA",
    description: "Ask about ranch experiences, birthday occasions, photography, video shoots and horse rental at JD's Horse Ranch in Fairburn. Call JD for arrangements.",
    heading: "Special occasions at JD's Horse Ranch",
    kicker: "For moments worth remembering",
    intro: "A horse ranch can be the setting for a beautiful memory. JD's Horse Ranch invites inquiries about birthday occasions, photo shoots and video shoots, with details arranged through a direct conversation instead of a one-size-fits-all booking form.",
    image: "/photos/ranch-8.jpg",
    imageAlt: "A smiling ranch guest with birthday cupcakes at an outdoor celebration",
    sectionTitle: "Plan your occasion with JD",
    details: [
      "The ranch's published services include birthday occasions, photo shoots, video shoots and one-hour horse rental at $200. Event arrangements and access must be confirmed directly with JD.",
      "Explain the kind of occasion you have in mind, the date, the group size and whether your plans include photography or video production. JD can discuss suitability and what is actually available.",
      "The ranch is in Fairburn, Georgia, outside Atlanta. There are no walk-ins, including for special occasions.",
      "Deposits are non-refundable. Confirm all booking terms and arrangements before payment."
    ],
    highlights: [{label:"Horse rental",value:"1 hour · $200"},{label:"Occasions",value:"Birthdays & celebrations"},{label:"Creative use",value:"Photo & video inquiries"}],
    faq: [
      {question:"Can I arrange a birthday occasion?",answer:"The ranch accepts birthday-related inquiries. Call JD to discuss what can be accommodated and the available dates."},
      {question:"Is horse rental available for a photo shoot?",answer:"One-hour horse rental is listed at $200. Call JD to confirm whether your production needs can be accommodated and to clarify terms."},
      {question:"Can I reserve online?",answer:"Reservations begin with a phone conversation. Call JD directly; no online form confirms an event."}
    ],
    serviceType:"Horse ranch special events and horse rental"
  },
  "visit-jds-horse-ranch-fairburn-ga": {
    title: "Visit JD's Horse Ranch | Address, Directions & Appointments",
    description: "Find JD's Horse Ranch at 7555 Jones Road, Fairburn, GA 30213. Appointment only, no walk-ins. Call (404) 981-2361 before visiting.",
    heading: "Plan your visit to JD's Horse Ranch",
    kicker: "Fairburn, Georgia · Just outside Atlanta",
    intro: "JD's Horse Ranch welcomes guests by appointment at its Fairburn location. To make your visit smooth, start by calling JD to discuss the experience you want, the number of riders and your preferred day.",
    image: "/photos/ranch-0.jpg",
    imageAlt: "A ranch handler standing beside a chestnut horse at JD's Horse Ranch",
    sectionTitle: "Before you head to the ranch",
    details: [
      "The published address is 7555 Jones Road, Fairburn, GA 30213. Confirm that your reservation has been accepted before traveling.",
      "The ranch operates by appointment only and does not welcome walk-ins. If you need to adjust your plans, call JD rather than arriving early or unannounced.",
      "For riding, long pants and sturdy, closed-toe shoes or boots are recommended. JD will explain any other preparations relevant to your experience.",
      "Reservations are handled by phone at (404) 981-2361. Deposits are non-refundable, and rescheduling requires at least 24 hours' notice and JD's approval."
    ],
    highlights: [{label:"Address",value:"7555 Jones Rd, Fairburn, GA"},{label:"Access",value:"Appointment only"},{label:"Talk with JD",value:"(404) 981-2361"}],
    faq: [
      {question:"Where is the ranch located?",answer:"JD's Horse Ranch is at 7555 Jones Road, Fairburn, Georgia 30213."},
      {question:"Can I visit without calling?",answer:"No. The ranch requires an appointment and does not accept walk-ins."},
      {question:"What if I need to move my appointment?",answer:"Call JD at least 24 hours before the scheduled visit to discuss rescheduling. Changes are subject to his approval and availability."}
    ]
  }
};
