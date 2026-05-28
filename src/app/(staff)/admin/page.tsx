import { getAdminDashboardData } from "@/features/admin/queries";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { ShieldCheck } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">MoveMyTest Admin</h1>
        <p className="mt-2 text-lg text-slate-700">
          Admin Portal for MoveMyTest — learner test swap management.
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <div className="flex gap-3 text-blue-950">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0" />
          <div>
            <CardTitle className="text-blue-950">Admin visibility</CardTitle>
            <CardDescription className="text-blue-900">
              Admins can see operational state across learners and instructors. ADI numbers are partially masked, and emails are obscured for privacy.
            </CardDescription>
          </div>
        </div>
      </Card>

      <AdminTabs data={data} />
    </div>
  );
}
