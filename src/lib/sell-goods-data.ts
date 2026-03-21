export type GoodsCategory =
  | "Cosmetics"
  | "Accessories"
  | "Clothes"
  | "Sneakers"
  | "Books"
  | "Dorm Essentials"
  | "Electronics"
  | "Other";

export type GoodsCondition = "New" | "Used";

export type GoodsListing = {
  id: string;
  title: string;
  seller: string;
  campus: string;
  category: GoodsCategory;
  condition: GoodsCondition;
  price: number;
  neighborhood: string;
  summary: string;
  details: string;
  badges: string[];
  imageHint: string;
  createdAt: string;
};

export const goodsListings: GoodsListing[] = [
  {
    id: "sg-1",
    title: "Rare Beauty blush duo",
    seller: "Nadia K.",
    campus: "Temple University",
    category: "Cosmetics",
    condition: "New",
    price: 18,
    neighborhood: "Morgan Hall",
    summary: "Student-only cosmetic bundle, unopened and priced below retail.",
    details:
      "Two unopened shades, bought for a club event but never used. Best for students who want affordable beauty pickups without paying store markup.",
    badges: ["Student only", "New", "Pickup today"],
    imageHint: "Cosmetic set",
    createdAt: "2026-03-18T09:00:00.000Z",
  },
  {
    id: "sg-2",
    title: "Nike Dunk Low size 9",
    seller: "Chris D.",
    campus: "Temple University",
    category: "Sneakers",
    condition: "Used",
    price: 52,
    neighborhood: "Temple Station",
    summary: "Clean student resale pair with light wear and quick campus pickup.",
    details:
      "Worn a few times, still in good condition, and easy to meet near campus. Good fit for students trying to keep style costs down.",
    badges: ["Student only", "Used", "Fast meetup"],
    imageHint: "Blue sneakers",
    createdAt: "2026-03-17T18:30:00.000Z",
  },
  {
    id: "sg-3",
    title: "Organic Chemistry textbook + notes",
    seller: "Maya R.",
    campus: "Temple University",
    category: "Books",
    condition: "Used",
    price: 28,
    neighborhood: "Charles Library",
    summary: "Affordable class bundle with highlighted sections and exam notes.",
    details:
      "Includes textbook plus printed review sheets. Perfect for students who need a cheaper setup for a hard science course.",
    badges: ["Student only", "Budget pick"],
    imageHint: "Textbook stack",
    createdAt: "2026-03-16T12:15:00.000Z",
  },
  {
    id: "sg-4",
    title: "Desk lamp + organizer kit",
    seller: "Jordan T.",
    campus: "Temple University",
    category: "Dorm Essentials",
    condition: "Used",
    price: 14,
    neighborhood: "1300 Residence Hall",
    summary: "Simple dorm desk setup for late study nights and move-in resets.",
    details:
      "Includes lamp, pen holder, and cable tray. Easy campus pickup and ideal for dorm refreshes on a student budget.",
    badges: ["Student only", "Dorm setup"],
    imageHint: "Desk setup",
    createdAt: "2026-03-18T07:45:00.000Z",
  },
  {
    id: "sg-5",
    title: "iPad keyboard case",
    seller: "Alex P.",
    campus: "Drexel University",
    category: "Electronics",
    condition: "Used",
    price: 24,
    neighborhood: "Tech Center",
    summary: "Useful study accessory with light wear and solid typing feel.",
    details:
      "Fits a student workflow well for note taking, library sessions, and quick writing jobs. Priced for resale, not profit-chasing.",
    badges: ["Student only", "Tech", "Used"],
    imageHint: "Keyboard case",
    createdAt: "2026-03-15T14:00:00.000Z",
  },
  {
    id: "sg-6",
    title: "Vintage hoodie bundle",
    seller: "Sana L.",
    campus: "University of Pennsylvania",
    category: "Clothes",
    condition: "Used",
    price: 20,
    neighborhood: "Broad & Cecil",
    summary: "Campus-friendly clothing bundle with soft wear and good condition.",
    details:
      "Two hoodies in good shape, student-priced for quick sell-through. Great for colder nights and easy streetwear pickups.",
    badges: ["Student only", "Clothes"],
    imageHint: "Hoodie bundle",
    createdAt: "2026-03-14T19:20:00.000Z",
  },
  {
    id: "sg-7",
    title: "Charm bracelet + earrings set",
    seller: "Lina M.",
    campus: "Temple University",
    category: "Accessories",
    condition: "New",
    price: 11,
    neighborhood: "Tyler School",
    summary: "Student-made accessories set for budget gifts or personal style.",
    details:
      "Never worn and packed in a simple pouch. A good low-cost pickup for campus events or creator support.",
    badges: ["Student only", "New", "Handmade feel"],
    imageHint: "Accessories set",
    createdAt: "2026-03-17T10:10:00.000Z",
  },
  {
    id: "sg-8",
    title: "Misc student extras box",
    seller: "Tori B.",
    campus: "Drexel University",
    category: "Other",
    condition: "Used",
    price: 9,
    neighborhood: "Oxford Village",
    summary: "Catch-all box with useful extras for students moving in or out.",
    details:
      "Includes hangers, storage hooks, notebooks, and random practical items that still have life left in them.",
    badges: ["Student only", "Cheap bundle"],
    imageHint: "Mixed dorm items",
    createdAt: "2026-03-13T11:40:00.000Z",
  },
];
