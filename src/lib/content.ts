import {
  BadgeCheck,
  Camera,
  Clapperboard,
  Layers,
  Megaphone,
  PenTool,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

export type ProjectStatus = "Done" | "In Build" | "Active" | "Early Stage";

export type Project = {
  id: string;
  title: string;
  category: string;
  status: ProjectStatus;
  headline: string;
  description: string;
  outcomeLabel: string;
  outcome: string;
  video?: string;
  poster?: string;
  gallery?: string[];
  tags: string[];
};

export const brand = {
  name: "SNAG",
  logo: "/assets/logos/snag-wordmark-red.svg",
  email: "teamstudiosnag@gmail.com",
  instagram: "@studio.snag",
  phone: "+91 97293 17565",
  phone2: "+91 93522 69479",
  location: "Pyramid Altia, Sector 70, Gurgaon",
  location2: "2nd floor, Skyline Complex, Kadru, Ranchi, Jharkhand 834002",
};

// NOTE: copy below is lean placeholder text — the bold/quirky rewrite happens in
// the dedicated text pass. Videos point at clean slugs in /assets/work/ (drop the
// renamed files there per the rename map). Red Radisson reuses the existing reel.
export const projects: Project[] = [
  {
    id: "superprofile-partnership",
    title: "SuperProfile",
    category: "Partnership program",
    status: "Done",
    headline: "500+ creators. One system. No noise.",
    description: "The onboarding and activation engine for a high-volume paid creator partnership program.",
    outcomeLabel: "Outcome",
    outcome: "Mass adoption and sustained creator velocity.",
    video: "/assets/media/peribest.mp4",
    poster: "/assets/posters/peribest.png",
    tags: ["creator ops", "partnerships", "systems"],
  },
  {
    id: "superprofile-founder",
    title: "SuperProfile",
    category: "Founder content",
    status: "Active",
    headline: "Camera-shy founders. Suddenly impossible to ignore.",
    description: "We turn 'I hate being on camera' into a founder feed people actually follow.",
    outcomeLabel: "Reel",
    outcome: "Founder content, on tap.",
    video: "/assets/work/superprofile.mp4",
    tags: ["founder content", "influence", "systems"],
  },
  {
    id: "prismoline",
    title: "Prismoline",
    category: "Brand + social",
    status: "Active",
    headline: "Sharp brand. Now it finally posts like one.",
    description: "Social with an actual point of view — not just pretty little squares.",
    outcomeLabel: "Vibe",
    outcome: "Consistency that compounds.",
    video: "/assets/work/prismoline.mp4",
    tags: ["branding", "social", "content"],
  },
  {
    id: "pevlyo",
    title: "Pevlyo",
    category: "Social + growth",
    status: "Active",
    headline: "Built to stop the thumb mid-scroll.",
    description: "Growth-minded content that earns attention instead of buying noise.",
    outcomeLabel: "Aim",
    outcome: "Attention, then momentum.",
    video: "/assets/work/pevlyo.mp4",
    tags: ["growth", "social", "creators"],
  },
  {
    id: "saar",
    title: "Saar",
    category: "Content + creative",
    status: "Active",
    headline: "Made to be saved, sent, and quietly stolen.",
    description: "Creative built for the share — not just the polite little like.",
    outcomeLabel: "Aim",
    outcome: "Posts people pass around.",
    video: "/assets/work/saar.mp4",
    tags: ["creative", "content", "reels"],
  },
  {
    id: "baecave",
    title: "BAECAVE",
    category: "Creator experience",
    status: "Done",
    headline: "Every corner built to end up on a feed.",
    description: "A creator-first experience engineered to be captured, posted, and repeated.",
    outcomeLabel: "Result",
    outcome: "Organic creator content, at volume.",
    video: "/assets/work/baecave.mp4",
    tags: ["events", "UGC", "experience"],
  },
  {
    id: "red-radisson",
    title: "Red Radisson",
    category: "Creator experience",
    status: "Done",
    headline: "Not an event. A content ecosystem.",
    description: "A closed-room creator night inside a Radisson — designed to circulate for weeks.",
    outcomeLabel: "Result",
    outcome: "Loud local recall. All organic.",
    video: "/assets/media/red-radisson.mp4",
    poster: "/assets/posters/red-radisson.png",
    tags: ["events", "hospitality", "UGC"],
  },
  {
    id: "ranchi-updates",
    title: "Ranchi Updates",
    category: "Media + community",
    status: "Active",
    headline: "A whole city's feed, run like a newsroom.",
    description: "Community-led local content that never clocks out.",
    outcomeLabel: "Aim",
    outcome: "Daily reach, zero filler.",
    video: "/assets/work/ranchi-updates.mp4",
    tags: ["media", "community", "local"],
  },
  {
    id: "ratnalaya",
    title: "Ratnalaya Jewellers",
    category: "Brand + content",
    status: "Done",
    headline: "Old-money sparkle. New-feed energy.",
    description: "Heritage jewellery, finally desirable on a scroll — not dusty in a case.",
    outcomeLabel: "Aim",
    outcome: "Heritage made thumb-stopping.",
    video: "/assets/work/ratnalaya.mp4",
    tags: ["jewellery", "branding", "content"],
  },
  {
    id: "burger-bae",
    title: "Burger Bae",
    category: "Social + growth",
    status: "Done",
    headline: "₹30K a day to ₹3L a day. No gimmicks.",
    description: "Social and growth around content that converts — then a 360+ creator barter campaign pushed into distribution.",
    outcomeLabel: "Outcome",
    outcome: "10× revenue scale on a creator-led run.",
    video: "/assets/media/burger-bae.mp4",
    poster: "/assets/posters/burger-bae.png",
    tags: ["growth", "food", "creator campaign"],
  },
  {
    id: "my-artist",
    title: "My Artist",
    category: "Brand identity",
    status: "In Build",
    headline: "Built to be a brand — not another nail-store page.",
    description: "Identity, launch language, and visual system from zero for a culture-led beauty brand.",
    outcomeLabel: "Status",
    outcome: "In build — designed for scale, not hype.",
    video: "/assets/media/my-artist.mp4",
    poster: "/assets/posters/my-artist.png",
    tags: ["identity", "beauty", "launch"],
  },
  {
    id: "depano",
    title: "Depano",
    category: "Positioning + digital",
    status: "Active",
    headline: "Not starting from zero. Un-sticking what was stuck.",
    description: "A fashion brand with no traction, reworked into sharper positioning, content direction, and conversion intent.",
    outcomeLabel: "Focus",
    outcome: "Turning visibility into real website sales.",
    video: "/assets/media/depano-lite.m4v",
    poster: "/assets/posters/depano.png",
    tags: ["fashion", "positioning", "sales"],
  },
  {
    id: "barber-syndicate",
    title: "Barber Syndicate",
    category: "Brand + content",
    status: "Early Stage",
    headline: "A grooming brand with edge — built for repeat chairs.",
    description: "Brand and content for a barber-led grooming network where recall keeps the chairs full.",
    outcomeLabel: "Role",
    outcome: "End-to-end brand and content ownership.",
    video: "/assets/media/beautyr-marketplace.mp4",
    tags: ["grooming", "branding", "content"],
  },
];

export const services = [
  {
    title: "Social Media Management",
    text: "Content systems for reach, consistency, and conversion.",
    icon: Users,
  },
  {
    title: "Influencer Marketing",
    text: "Creator networks structured to create movement, not vanity reach.",
    icon: Sparkles,
  },
  {
    title: "Branding & Creative",
    text: "Positioning, identity, and campaigns with a reason to exist.",
    icon: PenTool,
  },
  {
    title: "Production & Shoots",
    text: "Content-first production built for real usage and fast output.",
    icon: Camera,
  },
  {
    title: "Campaigns & Launches",
    text: "High-impact moments designed to drive attention and momentum.",
    icon: Megaphone,
  },
  {
    title: "Content Systems",
    text: "Repeatable formats that turn scattered posting into brand memory.",
    icon: Layers,
  },
  {
    title: "Design & Editing",
    text: "Platform-ready visuals, reels, and edits with a point of view.",
    icon: Clapperboard,
  },
  {
    title: "Strategy & Ads",
    text: "Sharper decisions across websites, SEO, ads, and scripting.",
    icon: Target,
  },
  {
    title: "Bottom Line",
    text: "We build systems that scale attention.",
    icon: BadgeCheck,
  },
];
