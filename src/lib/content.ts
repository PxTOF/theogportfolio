import { Megaphone, PenTool, Users } from "lucide-react";

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
  name: "PERIMYSTIC",
  instagram: "@perimystic",
  instagramUrl: "https://www.instagram.com/perimystic/",
  email: "pushkarsvashisht@gmail.com",
  phone: "+919729317565",
  phoneDisplay: "+91 97293 17565",
  serviceArea: "Chandigarh & Delhi NCR",
};

// These are examples of the founder's professional work at previous companies.
// They are NOT presented as contracts delivered by Perimystic.
export const projects: Project[] = [
  {
    id: "superprofile-partnership",
    title: "SuperProfile",
    category: "Founder experience · Creator partnerships",
    status: "Done",
    headline: "Creators are people. Not spreadsheet cells.",
    description: "Creator sourcing, onboarding and paid-campaign operations as part of the founder's previous role.",
    outcomeLabel: "Experience",
    outcome: "Creator partnerships and activation systems.",
    video: "/assets/media/peribest.mp4",
    poster: "/assets/posters/peribest.png",
    tags: ["creator ops", "partnerships", "strategy"],
  },
  {
    id: "burger-bae",
    title: "Burger Bae",
    category: "Founder experience · Social",
    status: "Done",
    headline: "Not another burger reel. A brand with a voice.",
    description: "Freelance social, content and creator-campaign work undertaken before Perimystic.",
    outcomeLabel: "Experience",
    outcome: "Content, partnerships and campaign coordination.",
    video: "/assets/media/burger-bae.mp4",
    poster: "/assets/posters/burger-bae.png",
    tags: ["social", "food", "creators"],
  },
  {
    id: "depano",
    title: "Depano",
    category: "Founder experience · Fashion",
    status: "Done",
    headline: "Fashion with something to say.",
    description: "Brand positioning and content-direction work completed during a previous agency role.",
    outcomeLabel: "Experience",
    outcome: "Positioning, content and creative direction.",
    video: "/assets/media/depano-lite.m4v",
    poster: "/assets/posters/depano.png",
    tags: ["fashion", "social", "brand"],
  },
  {
    id: "barber-syndicate",
    title: "Barber Syndicate",
    category: "Founder experience · Brand building",
    status: "Done",
    headline: "Built with a little more edge.",
    description: "Founder-led brand building and content work undertaken in a previous role.",
    outcomeLabel: "Experience",
    outcome: "Brand and content systems built from scratch.",
    tags: ["grooming", "brand", "content"],
  },
  {
    id: "body-juices",
    title: "Body Juices",
    category: "Founder experience · Brand building",
    status: "Done",
    headline: "Start fresh. Stay memorable.",
    description: "Early brand building and creative-direction experience from a previous role.",
    outcomeLabel: "Experience",
    outcome: "Brand and content direction from the ground up.",
    tags: ["consumer", "brand", "creative"],
  },
];

export const services = [
  {
    title: "Social & Content",
    text: "Strategy, reels, carousels, campaigns and the systems that keep a good feed moving.",
    icon: PenTool,
  },
  {
    title: "Creator Campaigns",
    text: "The right people, the right brief, and partnerships worth making.",
    icon: Users,
  },
  {
    title: "Brand Launches",
    text: "Positioning, campaign ideas and launch creative that gives people something to talk about.",
    icon: Megaphone,
  },
];
