import { createElement } from "react";
import {
  BadgeDollarSign,
  Banknote,
  BriefcaseBusiness,
  Bus,
  Car,
  CircleEllipsis,
  Clapperboard,
  Coffee,
  Dumbbell,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Laptop,
  Plane,
  Receipt,
  ShoppingBag,
  Tags,
  TrendingUp,
  Utensils,
  WalletCards,
} from "lucide-react";

const categoryIconMap = {
  tags: Tags,
  utensils: Utensils,
  car: Car,
  bus: Bus,
  "shopping-bag": ShoppingBag,
  receipt: Receipt,
  "graduation-cap": GraduationCap,
  "heart-pulse": HeartPulse,
  home: Home,
  plane: Plane,
  gift: Gift,
  coffee: Coffee,
  clapperboard: Clapperboard,
  dumbbell: Dumbbell,
  briefcase: BriefcaseBusiness,
  banknote: Banknote,
  "badge-dollar": BadgeDollarSign,
  laptop: Laptop,
  "trending-up": TrendingUp,
  wallet: WalletCards,
  other: CircleEllipsis,
};

export const categoryIconOptions = [
  { value: "tags", label: "General" },
  { value: "utensils", label: "Food" },
  { value: "car", label: "Car" },
  { value: "bus", label: "Transport" },
  { value: "shopping-bag", label: "Shopping" },
  { value: "receipt", label: "Bills" },
  { value: "graduation-cap", label: "Education" },
  { value: "heart-pulse", label: "Health" },
  { value: "home", label: "Home" },
  { value: "plane", label: "Travel" },
  { value: "gift", label: "Gift" },
  { value: "coffee", label: "Coffee" },
  { value: "clapperboard", label: "Entertainment" },
  { value: "dumbbell", label: "Fitness" },
  { value: "briefcase", label: "Salary" },
  { value: "banknote", label: "Money" },
  { value: "badge-dollar", label: "Business" },
  { value: "laptop", label: "Freelance" },
  { value: "trending-up", label: "Investment" },
  { value: "wallet", label: "Wallet" },
  { value: "other", label: "Other" },
];

export function CategoryIcon({ name, ...properties }) {
  const IconComponent = categoryIconMap[name] ?? Tags;

  return createElement(IconComponent, properties);
}