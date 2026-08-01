"use server";

import { Resend } from "resend";

import { EMAIL } from "@/config/info.config";
import type { ContactFormFields } from "@/stores/contact-store.types";
import { buildContactEmailHtml, buildContactEmailText } from "./emailTemplate";

export type ContactActionError =
  | "missing_api_key"
  | "missing_fields"
  | "invalid_email"
  | "send_failed";

export type ContactActionResult = {
  success: boolean;
  error?: ContactActionError;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendContactEmail(
  data: ContactFormFields,
): Promise<ContactActionResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { success: false, error: "missing_api_key" };
  }

  const name = data.name?.trim() ?? "";
  const email = data.email?.trim() ?? "";
  const message = data.message?.trim() ?? "";

  if (!name || !email || !message) {
    return { success: false, error: "missing_fields" };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { success: false, error: "invalid_email" };
  }

  const resend = new Resend(apiKey);
  const from =
    // process.env.CONTACT_FROM_EMAIL ?? "Jashan Singla <onboarding@resend.dev>";
    process.env.CONTACT_FROM_EMAIL ?? "Website <hello@jashansingla.com>";

  try {
    const { error } = await resend.emails.send({
      from,
      to: EMAIL,
      replyTo: email,
      subject: `New contact form message from ${name}`,
      html: buildContactEmailHtml(data),
      text: buildContactEmailText(data),
    });

    if (error) {
      console.error("[contact] Resend returned an error:", error);
      return { success: false, error: "send_failed" };
    }

    return { success: true };
  } catch (err) {
    console.error("[contact] Unexpected error while sending email:", err);
    return { success: false, error: "send_failed" };
  }
}
