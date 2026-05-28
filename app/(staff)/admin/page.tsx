"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">MoveMyTest Admin</h1>
        <p className="mt-2 text-lg text-slate-700">Admin Portal for MoveMyTest — learner test swap management.</p>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <div className="flex gap-3 text-blue-950">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0" />
          <div>
            <CardTitle className="text-blue-950">Coming Soon</CardTitle>
            <CardDescription className="text-blue-900">
              The admin dashboard is being rebuilt for the standalone MoveMyTest platform.
              Full functionality will include learner listings, match management, instructor oversight, and reporting.
            </CardDescription>
          </div>
        </div>
      </Card>
    </div>
  );
}
