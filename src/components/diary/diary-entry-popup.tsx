"use client";

import { useState } from "react";

export function DiaryEntryPopup() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isTimed, setIsTimed] = useState(false);
  const [dueTime, setDueTime] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [priority, setPriority] = useState("MEDIUM");
  const [recurrence, setRecurrence] = useState("NONE");
  const [recurrenceUntil, setRecurrenceUntil] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ status: string; message?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;
    setSending(true);

    const dueDateValue = isTimed ? `${dueDate}T${dueTime}:00` : dueDate;

    const formData = new FormData();
    formData.set("title", title);
    formData.set("description", description);
    formData.set("dueDate", dueDateValue);
    formData.set("priority", priority);
    if (isTimed) formData.set("durationMinutes", durationMinutes);
    formData.set("recurrence", recurrence);
    if (recurrence !== "NONE" && recurrenceUntil) formData.set("recurrenceUntil", recurrenceUntil);

    try {
      const { createDiaryEntryAction } = await import("@/features/diary/actions");
      const res = await createDiaryEntryAction(formData);
      setResult(res);
      if (res.status === "success") {
        setTitle("");
        setDescription("");
        setDueDate("");
        setIsTimed(false);
        setDueTime("09:00");
        setDurationMinutes("60");
        setPriority("MEDIUM");
        setRecurrence("NONE");
        setRecurrenceUntil("");
      }
    } catch {
      setResult({ status: "error", message: "Failed to create entry." });
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional details..." rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500" />
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <div>
          <p className="text-sm font-medium text-slate-700">Timed entry</p>
          <p className="text-xs text-slate-500">Add a start time and duration.</p>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={isTimed} onChange={(e) => setIsTimed(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-[#16643c] focus:ring-[#16643c]" />
          Yes
        </label>
      </div>
      <div className="flex gap-3">
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500" />
        {isTimed && <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500" />}
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500">
          <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option>
        </select>
      </div>
      {isTimed && (
        <select value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500">
          <option value="15">15 minutes</option>
          <option value="30">30 minutes</option>
          <option value="45">45 minutes</option>
          <option value="60">1 hour</option>
          <option value="90">1 hour 30 minutes</option>
          <option value="120">2 hours</option>
          <option value="180">3 hours</option>
          <option value="240">4 hours</option>
          <option value="480">All working day (8 hours)</option>
        </select>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500">
          <option value="NONE">Does not repeat</option>
          <option value="DAILY">Repeat daily</option>
          <option value="WEEKLY">Repeat weekly</option>
          <option value="MONTHLY">Repeat monthly</option>
          <option value="ANNUAL">Repeat annually</option>
        </select>
        <input type="date" value={recurrenceUntil} onChange={(e) => setRecurrenceUntil(e.target.value)} disabled={recurrence === "NONE"} className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500" />
      </div>
      <button type="submit" disabled={sending || !title.trim() || !dueDate} className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50">
        {sending ? "Creating..." : "Create diary entry"}
      </button>
      {result?.status === "success" && <p className="text-sm text-emerald-600 font-medium">✓ Entry created</p>}
      {result?.status === "error" && result.message && <p className="text-sm text-red-600">{result.message}</p>}
    </form>
  );
}
