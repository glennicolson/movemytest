"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { AdminOverview } from "./admin-overview";
import { AdminLearners } from "./admin-learners";
import { AdminListings } from "./admin-listings";
import { AdminMatches } from "./admin-matches";
import { AdminInstructors } from "./admin-instructors";
import { AdminSupport } from "./admin-support";
import { AdminEmails } from "./admin-emails";
import { AdminAudit } from "./admin-audit";
import { AdminCentres } from "./admin-centres";
import type { AdminDashboardData } from "./types";

// Re-export the data type for convenience
export type { AdminDashboardData } from "./types";

export function AdminTabs({ data }: { data: AdminDashboardData }) {
  const [tab, setTab] = useState("overview");

  const items = [
    {
      id: "overview",
      label: "Dashboard",
      content: (
        <AdminOverview
          data={data}
          onNavigateTab={(t) => setTab(t)}
        />
      ),
      count: undefined,
      tone: "neutral" as const,
    },
    {
      id: "learners",
      label: "Learners",
      content: <AdminLearners learners={data.learnerAccounts} />,
      count: data.learnerAccountCount,
      tone: "neutral" as const,
    },
    {
      id: "listings",
      label: "Listings",
      content: <AdminListings listings={data.listings} />,
      count: data.listings.length,
      tone: "neutral" as const,
    },
    {
      id: "matches",
      label: "Matches",
      content: <AdminMatches matches={data.matches} />,
      count: data.matches.length,
      tone: "neutral" as const,
    },
    {
      id: "instructors",
      label: "Instructors",
      content: <AdminInstructors instructors={data.instructors} />,
      count: data.instructorAccountCount,
      tone: "neutral" as const,
    },
    {
      id: "support",
      label: "Support",
      content: <AdminSupport reports={data.reports} />,
      count: data.openReportCount,
      tone: data.openReportCount > 0 ? "in-progress" as const : "complete" as const,
    },
    {
      id: "emails",
      label: "Emails",
      content: <AdminEmails emails={data.emailQueue} />,
      count: data.pendingEmailCount,
      tone: data.pendingEmailCount > 10 ? "in-progress" as const : "neutral" as const,
    },
    {
      id: "audit",
      label: "Audit",
      content: <AdminAudit logs={data.auditLogs} />,
      count: data.auditLogs.length,
      tone: "neutral" as const,
    },
    {
      id: "centres",
      label: "Centres",
      content: <AdminCentres centres={data.centres} />,
      count: data.centres.length,
      tone: "neutral" as const,
    },
  ];

  return <Tabs items={items} initialTabId={tab} />;
}
