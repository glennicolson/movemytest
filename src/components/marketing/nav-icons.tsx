import {
  Car,
  Tag,
  MapPin,
  HelpCircle,
  LifeBuoy,
  Users,
  UserPlus,
  Building2,
  Info,
  Newspaper,
  BookOpen,
  Library,
  Search,
  LogIn,
  Mail,
  GraduationCap,
  Brain,
  Route,
  type LucideProps,
} from "lucide-react";

export type NavIconKey =
  | "driving-lessons"
  | "prices"
  | "areas"
  | "faq"
  | "learner-help"
  | "become-an-instructor"
  | "about"
  | "blog"
  | "resource-hub"
  | "search"
  | "portal-login"
  | "contact"
  | "learn-to-drive"
  | "instructors"
  | "about-us"
  | "resources"
  | "meet-the-team"
  | "theory-test-help"
  | "driving-test-help"
  | "local-driving-advice"
  | "theory"
  | "driving-test"
  | "local-advice"
  | "learner-basics"
  | "learner"
  | "instructor"
  | "portal"
  | "portal/dashboard"
  | "instructor/dashboard"
  | "dashboard"
  | "admin";

const iconMap: Record<NavIconKey, React.ComponentType<LucideProps>> = {
  "learn-to-drive": GraduationCap,
  "driving-lessons": Car,
  prices: Tag,
  areas: MapPin,
  faq: HelpCircle,
  "learner-help": LifeBuoy,
  instructors: Users,
  "become-an-instructor": UserPlus,
  "about-us": Building2,
  about: Info,
  blog: Newspaper,
  resources: Library,
  "resource-hub": BookOpen,
  search: Search,
  "portal-login": LogIn,
  contact: Mail,
  "meet-the-team": Users,
  "theory-test-help": Brain,
  "driving-test-help": Route,
  "local-driving-advice": MapPin,
  "theory": Brain,
  "driving-test": Route,
  "local-advice": MapPin,
  "learner-basics": BookOpen,
  
  "learner": GraduationCap,
  "instructor": Users,
  "admin": Building2,
  "portal": GraduationCap,
  "portal/dashboard": GraduationCap,
  "instructor/dashboard": Users,
  "dashboard": Building2,
};

/**
 * Resolve a Lucide icon component from a nav item's href or title.
 * Falls back to a sensible default based on URL path or label text.
 */
export function getNavIcon(
  href: string,
  title: string
): React.ComponentType<LucideProps> | null {
  // Try to match by href slug
  const slug = href.replace(/^\/, "").replace(/\/$/, "");
  if (slug in iconMap) return iconMap[slug as NavIconKey];

  // Fallback: match by title text (case-insensitive, partial)
  const t = title.toLowerCase();
  if (t.includes("lesson") || t.includes("driving")) return Car;
  if (t.includes("price")) return Tag;
  if (t.includes("area")) return MapPin;
  if (t.includes("faq")) return HelpCircle;
  if (t.includes("help") && t.includes("learner")) return LifeBuoy;
  if (t.includes("instructor") && t.includes("become")) return UserPlus;
  if (t.includes("instructor")) return Users;
  if (t.includes("about")) return Building2;
  if (t.includes("blog")) return Newspaper;
  if (t.includes("resource")) return Library;
  if (t.includes("search")) return Search;
  if (t.includes("login") || t.includes("portal")) return LogIn;
  if (t.includes("contact")) return Mail;
  if (t.includes("theory")) return Brain;
  if (t.includes("driving test") || t.includes("test help")) return Route;
  if (t.includes("local") && t.includes("advice")) return MapPin;
  if (t.includes("learner") && t.includes("basic")) return BookOpen;
  if (t.includes("news")) return Newspaper;
  if (t.includes("learn") || t.includes("drive")) return GraduationCap;

  return null;
}

/**
 * Premium icon wrapper for nav dropdown items.
 * Renders a refined icon inside a subtle glass-morphism container.
 */
export function NavIcon({
  icon: Icon,
  size = 20,
  strokeWidth = 1.5,
  className = "",
}: {
  icon: React.ComponentType<LucideProps>;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-400 ring-1 ring-white/[0.06] transition-all duration-200 group-hover:bg-[var(--brand-accent)]/10 group-hover:text-[var(--brand-accent)] group-hover:ring-[var(--brand-accent)]/20 ${className}`}
    >
      <Icon size={size} strokeWidth={strokeWidth} />
    </span>
  );
}
