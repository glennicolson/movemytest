const POSTMARK_API_URL = "https://api.postmarkapp.com/email";

function env(key: string) {
  return process.env[key] || "";
}

interface DiaryEntryEmailData {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date;
  durationMinutes: number | null;
  priority: string;
  status: string;
  recurrence: string | null;
  recurrenceUntil: Date | null;
  assignedTo: { firstName: string; lastName: string; email: string } | null;
  createdBy: { firstName: string; lastName: string } | null;
}

function escapeICS(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function generateICS(entry: DiaryEntryEmailData): string {
  const now = new Date();
  const uid = `${entry.id}@thedtc.co.uk`;
  const start = formatICSDate(entry.dueDate);
  const end = entry.durationMinutes
    ? formatICSDate(new Date(entry.dueDate.getTime() + entry.durationMinutes * 60 * 1000))
    : formatICSDate(new Date(entry.dueDate.getTime() + 60 * 60 * 1000));

  const summary = escapeICS(entry.title);
  const description = escapeICS(entry.description || "");
  const location = escapeICS("MoveMyTest");

  let rrule = "";
  if (entry.recurrence && entry.recurrence !== "NONE") {
    const freq =
      entry.recurrence === "DAILY"
        ? "DAILY"
        : entry.recurrence === "WEEKLY"
          ? "WEEKLY"
          : entry.recurrence === "MONTHLY"
            ? "MONTHLY"
            : "YEARLY";
    const until = entry.recurrenceUntil ? formatICSDate(entry.recurrenceUntil) : "";
    rrule = `RRULE:FREQ=${freq}${until ? `;UNTIL=${until}` : ""}\r\n`;
  }

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-/MoveMyTest/Diary Task/EN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `ORGANIZER;CN="${escapeICS(entry.createdBy ? `${entry.createdBy.firstName} ${entry.createdBy.lastName}` : "MoveMyTest")}":mailto:${env("AUTH_POSTMARK_FROM_EMAIL")}`,
    entry.assignedTo ? `ATTENDEE;CN="${escapeICS(`${entry.assignedTo.firstName} ${entry.assignedTo.lastName}`)}":mailto:${entry.assignedTo.email}` : "",
    rrule,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n") + "\r\n";
}

/**
 * Send a diary task invite email with ICS calendar attachment.
 * Failures are logged but never throw — the diary entry is already saved.
 */
export async function sendDiaryTaskInvite(data: {
  entry: DiaryEntryEmailData;
  to: string;
}) {
  const serverToken = env("AUTH_POSTMARK_SERVER_TOKEN");
  const fromEmail = env("AUTH_POSTMARK_FROM_EMAIL");
  const fromName = env("AUTH_POSTMARK_FROM_NAME") || "MoveMyTest";

  if (!serverToken || !fromEmail) {
    console.warn("[diary-task-email] Postmark not configured — skipping task invite email");
    return;
  }

  const entry = data.entry;
  const subject = `Diary Task: ${entry.title}`;

  const priorityLabel =
    entry.priority === "URGENT"
      ? "Urgent"
      : entry.priority === "HIGH"
        ? "High"
        : entry.priority === "MEDIUM"
          ? "Medium"
          : "Low";

  const priorityColor =
    entry.priority === "URGENT"
      ? "#dc2626"
      : entry.priority === "HIGH"
        ? "#d97706"
        : entry.priority === "MEDIUM"
          ? "#2563eb"
          : "#64748b";

  const dueFormatted = entry.dueDate.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const timeFormatted = entry.durationMinutes
    ? `${new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" }).format(entry.dueDate)} – ${new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" }).format(new Date(
        entry.dueDate.getTime() + entry.durationMinutes * 60 * 1000
      ))}`
    : new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" }).format(entry.dueDate);

  const durationText = entry.durationMinutes
    ? `${Math.floor(entry.durationMinutes / 60)}h ${entry.durationMinutes % 60}m`
    : "No duration set";

  const recurrenceText =
    entry.recurrence && entry.recurrence !== "NONE"
      ? entry.recurrence === "DAILY"
        ? "Repeats daily"
        : entry.recurrence === "WEEKLY"
          ? "Repeats weekly"
          : entry.recurrence === "MONTHLY"
            ? "Repeats monthly"
            : "Repeats annually"
      : "Does not repeat";

  const htmlBody = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#16643c;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;font-size:20px;font-weight:600">Diary Task Assigned</h2>
        <p style="margin:4px 0 0;font-size:14px;opacity:0.9">You have been assigned a new task in MoveMyTest diary.</p>
      </div>
      <div style="padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;background:#fff">
        <h3 style="margin:0 0 8px;font-size:18px;color:#1e293b">${entry.title}</h3>
        ${entry.description ? `<p style="margin:0 0 16px;color:#475569;font-size:14px">${entry.description}</p>` : ""}
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr>
            <td style="padding:8px 0;color:#64748b;font-weight:500;width:120px">Due date</td>
            <td style="padding:8px 0;color:#1e293b">${dueFormatted}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;font-weight:500">Time</td>
            <td style="padding:8px 0;color:#1e293b">${timeFormatted}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;font-weight:500">Duration</td>
            <td style="padding:8px 0;color:#1e293b">${durationText}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;font-weight:500">Priority</td>
            <td style="padding:8px 0">
              <span style="display:inline-block;background:${priorityColor}15;color:${priorityColor};padding:2px 10px;border-radius:9999px;font-size:12px;font-weight:600">${priorityLabel}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;font-weight:500">Recurrence</td>
            <td style="padding:8px 0;color:#1e293b">${recurrenceText}</td>
          </tr>
        </table>
        <p style="margin:20px 0 0;font-size:13px;color:#94a3b8">Add this task to your calendar by accepting the attached invitation.</p>
      </div>
    </div>`;

  const textBody = `Diary Task: ${entry.title}

You have been assigned a new task in MoveMyTest diary.

Due: ${dueFormatted} at ${timeFormatted}
Duration: ${durationText}
Priority: ${priorityLabel}
Recurrence: ${recurrenceText}

${entry.description || ""}

Add this task to your calendar by accepting the attached invitation.`.trim();

  const icsContent = generateICS(entry);
  const icsBase64 = Buffer.from(icsContent).toString("base64");

  try {
    const response = await fetch(POSTMARK_API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": serverToken,
      },
      body: JSON.stringify({
        From: `${fromName} <${fromEmail}>`,
        To: data.to,
        Subject: subject,
        TextBody: textBody,
        HtmlBody: htmlBody,
        MessageStream: env("AUTH_POSTMARK_MESSAGE_STREAM") || undefined,
        Tag: "diary-task-invite",
        Attachments: [
          {
            Name: `dtc-task-${entry.id}.ics`,
            Content: icsBase64,
            ContentType: "text/calendar; charset=utf-8; method=REQUEST",
          },
        ],
      }),
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error(`[diary-task-email] Postmark task invite failed: ${response.status} ${responseText}`);
    }
  } catch (error) {
    console.error("[diary-task-email] Postmark task invite error:", error instanceof Error ? error.message : error);
  }
}
