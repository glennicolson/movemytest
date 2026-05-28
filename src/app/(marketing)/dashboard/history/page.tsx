import { getLearnerMoveMyTestDashboard } from "@/features/movemytest/queries";
import { requireMoveMyTestSession } from "@/features/movemytest/session";

export default async function HistoryPage() {
  const session = await requireMoveMyTestSession("/dashboard/history");
  const { history } = await getLearnerMoveMyTestDashboard(session.accountId);
  const formatDateTime = (value: Date) =>
    value.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-950">Swap history</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Your completed, expired and cancelled listings over time.
        </p>
        <div className="mt-5 space-y-3">
          {history.length ? (
            history.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <p className="font-semibold text-slate-950">{item.currentCentre.name}</p>
                <p className="mt-1 text-slate-600">
                  {formatDateTime(item.currentDateTime)} · {item.status.toLowerCase().replaceAll("_", " ")}
                </p>
              </div>
            ))
          ) : (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              No swap history yet. Your completed, expired and cancelled listings will appear here.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
