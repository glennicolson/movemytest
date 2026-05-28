const POSTMARK_API_URL = "https://api.postmarkapp.com/email";

function env(key: string) {
  return process.env[key] || "";
}

/**
 * Send a learner enquiry notification email to reception.
 * Failures are logged but never throw — the lead is already saved in the CRM.
 */
export async function sendLearnerEnquiryNotification(data: {
  title?: string | null;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  email: string;
  phone: string;
  homePhone?: string | null;
  addressStreet?: string | null;
  addressCity?: string | null;
  postcode?: string | null;
  licenceHeld?: string | null;
  theoryTestPassed?: string | null;
  practicalTestBooked?: string | null;
  practicalTestDetail?: string | null;
  previousExperience?: string | null;
  daysAvailable?: string | null;
  specialRequirements?: string | null;
  serviceRequired?: string | null;
  hearAboutUs?: string | null;
  notes?: string | null;
}) {
  const serverToken = env("AUTH_POSTMARK_SERVER_TOKEN");
  const fromEmail = env("AUTH_POSTMARK_FROM_EMAIL");
  const fromName = env("AUTH_POSTMARK_FROM_NAME") || "MoveMyTest";
  const toEmail = env("ENQUIRY_NOTIFICATION_TO") || "reception@thedtc.co.uk";

  if (!serverToken || !fromEmail) {
    console.warn("[enquiry-notification] Postmark not configured — skipping learner notification email");
    return;
  }

  const fullName = [data.title, data.firstName, data.lastName].filter(Boolean).join(" ");
  const subject = `New Learner Enquiry — ${data.firstName} ${data.lastName}`;

  const rows: [string, string | null | undefined][] = [
    ["Name", fullName],
    ["Date of Birth", data.dateOfBirth],
    ["Email", data.email],
    ["Mobile", data.phone],
    ["Home Phone", data.homePhone],
    ["Address", [data.addressStreet, data.addressCity, data.postcode].filter(Boolean).join(", ")],
    ["Licence Held", data.licenceHeld],
    ["Theory Test Passed", data.theoryTestPassed],
    ["Practical Test Booked", data.practicalTestBooked],
    ["Practical Test Detail", data.practicalTestDetail],
    ["Previous Experience", data.previousExperience],
    ["Days Available", data.daysAvailable],
    ["Special Requirements", data.specialRequirements],
    ["Service Required", data.serviceRequired],
    ["How They Found Us", data.hearAboutUs],
    ["Additional Notes", data.notes],
  ];

  const textBody = rows
    .filter(([, v]) => v)
    .map(([label, v]) => `${label}: ${v}`)
    .join("\n");

  const htmlRows = rows
    .filter(([, v]) => v)
    .map(([label, v]) => `<tr><td style="padding:4px 12px;font-weight:600;vertical-align:top;white-space:nowrap;color:#334155">${label}</td><td style="padding:4px 12px;vertical-align:top;color:#475569">${v}</td></tr>`)
    .join("\n");

  const htmlBody = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1e293b;margin:0 0 4px">New Learner Enquiry</h2>
      <p style="color:#64748b;margin:0 0 16px;font-size:14px">A new learner enquiry has been submitted through MoveMyTest website contact form.</p>
      <table style="border-collapse:collapse;width:100%;font-size:14px;border:1px solid #e2e8f0;border-radius:8px">
        ${htmlRows}
      </table>
      <p style="color:#94a3b8;font-size:12px;margin-top:16px">This lead has also been saved in the CRM leads list.</p>
    </div>`;

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
        To: toEmail,
        Subject: subject,
        TextBody: textBody,
        HtmlBody: htmlBody,
        ReplyTo: data.email,
        MessageStream: env("AUTH_POSTMARK_MESSAGE_STREAM") || undefined,
        Tag: "learner-enquiry",
      }),
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error(`[enquiry-notification] Postmark learner notification failed: ${response.status} ${responseText}`);
    }
  } catch (error) {
    console.error("[enquiry-notification] Postmark learner notification error:", error instanceof Error ? error.message : error);
  }
}

/**
 * Send an instructor application notification email to reception.
 * Failures are logged but never throw — the lead is already saved in the CRM.
 */
export async function sendInstructorEnquiryNotification(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  instructorStatus?: string | null;
  area?: string | null;
  lessonType?: string | null;
  adiNumber?: string | null;
  hasCar?: string | null;
  message?: string | null;
}) {
  const serverToken = env("AUTH_POSTMARK_SERVER_TOKEN");
  const fromEmail = env("AUTH_POSTMARK_FROM_EMAIL");
  const fromName = env("AUTH_POSTMARK_FROM_NAME") || "MoveMyTest";
  const toEmail = env("ENQUIRY_NOTIFICATION_TO") || "reception@thedtc.co.uk";

  if (!serverToken || !fromEmail) {
    console.warn("[enquiry-notification] Postmark not configured — skipping instructor notification email");
    return;
  }

  const subject = `New Instructor Application — ${data.firstName} ${data.lastName}`;

  const statusLabels: Record<string, string> = {
    qualified_adi: "Qualified ADI (green badge holder)",
    trainee: "Trainee instructor (working towards ADI qualification)",
    exploring: "Exploring becoming a driving instructor",
  };

  const rows: [string, string | null | undefined][] = [
    ["Name", `${data.firstName} ${data.lastName}`],
    ["Email", data.email],
    ["Phone", data.phone],
    ["Status", data.instructorStatus ? (statusLabels[data.instructorStatus] ?? data.instructorStatus) : null],
    ["Preferred Area", data.area],
    ["Lesson Type", data.lessonType],
    ["ADI// Licence Number", data.adiNumber],
    ["Has Own Car", data.hasCar === "yes" ? "Yes" : data.hasCar === "no" ? "No" : data.hasCar],
    ["Message", data.message],
  ];

  const textBody = rows
    .filter(([, v]) => v)
    .map(([label, v]) => `${label}: ${v}`)
    .join("\n");

  const htmlRows = rows
    .filter(([, v]) => v)
    .map(([label, v]) => `<tr><td style="padding:4px 12px;font-weight:600;vertical-align:top;white-space:nowrap;color:#334155">${label}</td><td style="padding:4px 12px;vertical-align:top;color:#475569">${v}</td></tr>`)
    .join("\n");

  const htmlBody = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1e293b;margin:0 0 4px">New Instructor Application</h2>
      <p style="color:#64748b;margin:0 0 16px;font-size:14px">A new instructor application has been submitted through MoveMyTest website.</p>
      <table style="border-collapse:collapse;width:100%;font-size:14px;border:1px solid #e2e8f0;border-radius:8px">
        ${htmlRows}
      </table>
      <p style="color:#94a3b8;font-size:12px;margin-top:16px">This lead has also been saved in the CRM leads list.</p>
    </div>`;

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
        To: toEmail,
        Subject: subject,
        TextBody: textBody,
        HtmlBody: htmlBody,
        ReplyTo: data.email,
        MessageStream: env("AUTH_POSTMARK_MESSAGE_STREAM") || undefined,
        Tag: "instructor-enquiry",
      }),
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error(`[enquiry-notification] Postmark instructor notification failed: ${response.status} ${responseText}`);
    }
  } catch (error) {
    console.error("[enquiry-notification] Postmark instructor notification error:", error instanceof Error ? error.message : error);
  }
}