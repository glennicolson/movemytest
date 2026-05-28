import type { Route } from "next";
import type { AppRole } from "@/lib/auth/roles";

export type NavItem = {
  title: string;
  href: Route;
  description?: string;
  /** Only show this item if the user's role is in this list. Omit to show for all roles. */
  roles?: AppRole[];
};

/** A grouped nav section with a label and items */
export type NavGroup = {
  label: string;
  items: NavItem[];
};
