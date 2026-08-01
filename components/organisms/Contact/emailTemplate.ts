import type { ContactFormFields } from "@/stores/contact-store.types";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const row = (label: string, value: string) => {
  const safe = value.trim() ? escapeHtml(value).replace(/\n/g, "<br />") : "—";
  return `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #2a2342;color:#8c7cad;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;width:140px;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:12px 0;border-bottom:1px solid #2a2342;color:#f5f4f8;font-size:15px;line-height:1.5;">${safe}</td>
    </tr>`;
};

export const buildContactEmailHtml = (data: ContactFormFields) => `
  <div style="background:#030206;padding:32px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#0d0718;border:1px solid #2a2342;border-radius:16px;padding:32px;">
      <h1 style="margin:0 0 4px;color:#f5f4f8;font-size:20px;font-weight:600;">New contact message</h1>
      <p style="margin:0 0 24px;color:#8c7cad;font-size:13px;">From jashansingla.com contact form</p>
      <table style="width:100%;border-collapse:collapse;">
        ${row("Name", data.name)}
        ${row("Email", data.email)}
        ${row("Company", data.company)}
        ${row("Services", data.services)}
        ${row("Budget", data.budget)}
        ${row("Message", data.message)}
      </table>
    </div>
  </div>
`;

export const buildContactEmailText = (data: ContactFormFields) =>
  [
    `Name: ${data.name || "—"}`,
    `Email: ${data.email || "—"}`,
    `Company: ${data.company || "—"}`,
    `Services: ${data.services || "—"}`,
    `Budget: ${data.budget || "—"}`,
    "",
    "Message:",
    data.message || "—",
  ].join("\n");
