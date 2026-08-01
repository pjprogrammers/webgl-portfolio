"use client";

import { useEffect, useState, useTransition } from "react";
import classNames from "classnames";
import { useTranslations } from "next-intl";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/components/atoms";
import { CustomDropdown } from "@/components/molecules";
import type { DropdownOption } from "@/components/molecules";
import { useGlobalStore } from "@/stores/global-store";
import { useContactStore } from "@/stores/contact-store";
import type { ContactFormField } from "@/stores/contact-store.types";
import { MAILTO } from "@/config/info.config";
import { sendContactEmail, type ContactActionError } from "./actions";

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

type FieldErrors = Partial<Record<ContactFormField, boolean>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Contact = () => {
  const { showContactForm, setShowContactForm } = useGlobalStore();
  const { name, email, company, services, budget, message, setField, reset } =
    useContactStore();

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [overlayEl, setOverlayEl] = useState<HTMLDivElement | null>(null);

  const pathname = usePathname();

  const t = useTranslations("contact");
  const tGlobals = useTranslations("globals");

  useEffect(() => {
    setShowContactForm(false);
  }, [pathname, setShowContactForm]);

  const serviceOptions: DropdownOption[] = (
    ["immersive", "premium", "designDev", "other"] as const
  ).map((key) => {
    const label = t(`form.services.options.${key}`);
    return { value: label, label };
  });

  const budgetOptions: DropdownOption[] = (
    ["tier1", "tier2", "tier3", "tier4"] as const
  ).map((key) => {
    const label = t(`form.budget.options.${key}`);
    return { value: label, label };
  });

  const errorToMessage = (error?: ContactActionError) => {
    switch (error) {
      case "missing_fields":
        return t("form.feedback.missingFields");
      case "invalid_email":
        return t("form.feedback.invalidEmail");
      default:
        return t("form.feedback.error");
    }
  };

  const getInvalidFields = (): FieldErrors => {
    const invalid: FieldErrors = {};
    if (!name.trim()) invalid.name = true;
    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) invalid.email = true;
    if (!company.trim()) invalid.company = true;
    if (!services.trim()) invalid.services = true;
    if (!budget.trim()) invalid.budget = true;
    if (!message.trim()) invalid.message = true;
    return invalid;
  };

  const handleFieldChange = (field: ContactFormField, value: string) => {
    setField(field, value);
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) return;

    const invalid = getInvalidFields();
    if (Object.keys(invalid).length > 0) {
      setErrors(invalid);
      setFeedback({
        type: "error",
        message: t("form.feedback.missingFields"),
      });
      return;
    }

    setErrors({});
    setFeedback(null);
    startTransition(async () => {
      const result = await sendContactEmail({
        name,
        email,
        company,
        services,
        budget,
        message,
      });

      if (result.success) {
        setFeedback({ type: "success", message: t("form.feedback.success") });
        reset();
        return;
      }

      setFeedback({ type: "error", message: errorToMessage(result.error) });
    });
  };

  return (
    <div
      className={classNames(
        "fixed top-0 right-0 z-1000000 h-screen w-105 max-w-full transition-transform duration-700",
        {
          "translate-x-full": !showContactForm,
          "translate-x-0": showContactForm,
        },
      )}
    >
      {/* Own layer: avoids nesting backdrop-filter (breaks dropdown blur) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 border-l border-r border-brand-10/10 bg-brand-100/40 backdrop-blur-3xl"
      />
      <section
        data-lenis-prevent
        data-carousel-ignore
        className="relative flex h-full flex-col justify-between overflow-y-auto"
      >
        <div className="flex flex-1 flex-col gap-3 justify-between pt-c-16 px-c-16 pb-3">
          <div>
            <div className="flex items-center justify-between gap-c-16">
              <h2 className="heading-3 font-instrument-serif text-brand-05 italic">
                {t("title")}
              </h2>
              <div
                data-event="hover"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-05/4 border border-brand-05/6"
                onClick={() => setShowContactForm(false)}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 13 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.0205 0.707031L6.7168 6.01074L12.0205 11.3145L11.3135 12.0215L6.00977 6.71777L0.707031 12.0205L0 11.3135L5.30273 6.01074L0 0.708008L0.707031 0.000976562L6.00977 5.30371L11.3135 0L12.0205 0.707031Z"
                    fill="white"
                  />
                </svg>
              </div>
            </div>
            <p
              className="body-md"
              dangerouslySetInnerHTML={{ __html: t.raw("description") }}
            />
          </div>

          <Link isExternalLink href={MAILTO} className="body-md w-fit">
            {tGlobals("email")}
          </Link>
        </div>

        <form className="flex flex-col" onSubmit={handleSubmit} noValidate>
          <label
            data-event="hide"
            htmlFor="name"
            className="relative h-20 max-h-[10vh] border-t border-brand-10/10 py-3 px-c-16"
          >
            <span className="body-xs pointer-events-none flex items-center gap-1.5">
              {t("form.name.label")}
              {errors.name && (
                <span
                  aria-hidden="true"
                  className="block w-1 h-1 rounded-full bg-red-500"
                />
              )}
            </span>
            <input
              className="cursor-text! absolute inset-0 px-c-16 pt-6"
              id="name"
              type="text"
              value={name}
              onChange={(event) =>
                handleFieldChange("name", event.target.value)
              }
              placeholder={t("form.name.placeholder")}
            />
          </label>
          <label
            data-event="hide"
            htmlFor="email"
            className="relative h-20 max-h-[10vh] border-t border-brand-10/10 py-3 px-c-16"
          >
            <span className="body-xs pointer-events-none flex items-center gap-1.5">
              {t("form.email.label")}
              {errors.email && (
                <span
                  aria-hidden="true"
                  className="block w-1 h-1 rounded-full bg-red-500"
                />
              )}
            </span>
            <input
              className="cursor-text! absolute inset-0 px-c-16 pt-6"
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                handleFieldChange("email", event.target.value)
              }
              placeholder={t("form.email.placeholder")}
            />
          </label>
          <label
            data-event="hide"
            htmlFor="company"
            className="relative h-20 max-h-[10vh] border-t border-brand-10/10 py-3 px-c-16"
          >
            <span className="body-xs pointer-events-none flex items-center gap-1.5">
              {t("form.company.label")}
              {errors.company && (
                <span
                  aria-hidden="true"
                  className="block w-1 h-1 rounded-full"
                />
              )}
            </span>
            <input
              className="cursor-text! absolute inset-0 px-c-16 pt-6"
              id="company"
              type="text"
              value={company}
              onChange={(event) =>
                handleFieldChange("company", event.target.value)
              }
              placeholder={t("form.company.placeholder")}
            />
          </label>

          <CustomDropdown
            id="services"
            label={t("form.services.label")}
            placeholder={t("form.services.placeholder")}
            value={services}
            options={serviceOptions}
            error={errors.services}
            active={showContactForm}
            portalTarget={overlayEl}
            onChange={(value) => handleFieldChange("services", value)}
          />

          <CustomDropdown
            id="budget"
            label={t("form.budget.label")}
            placeholder={t("form.budget.placeholder")}
            value={budget}
            options={budgetOptions}
            error={errors.budget}
            active={showContactForm}
            portalTarget={overlayEl}
            onChange={(value) => handleFieldChange("budget", value)}
          />

          <label
            data-event="hide"
            htmlFor="message"
            className="relative h-40 max-h-[20vh] border-t border-brand-10/10 py-3 px-c-16"
          >
            <span className="body-xs pointer-events-none flex items-center gap-1.5">
              {t("form.message.label")}
              {errors.message && (
                <span
                  aria-hidden="true"
                  className="block w-1 h-1 rounded-full bg-red-500"
                />
              )}
            </span>
            <textarea
              className="cursor-text! absolute inset-0 px-c-16 pt-9"
              id="message"
              value={message}
              onChange={(event) =>
                handleFieldChange("message", event.target.value)
              }
              placeholder={t("form.message.placeholder")}
            />
          </label>

          {feedback && (
            <p
              aria-live="polite"
              className={classNames(
                "body-xs px-c-16 py-3 border-t border-brand-10/10",
                {
                  "text-brand-05": feedback.type === "success",
                  "text-red-400": feedback.type === "error",
                },
              )}
            >
              {feedback.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            data-event="hover"
            className="h-20 max-h-[10vh] border-t border-brand-10/10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? t("form.sending") : t("form.submit")}
          </button>
        </form>
      </section>

      {/* Sibling of content + backdrop: menus inherit panel translate, blur isn't nested */}
      <div
        ref={setOverlayEl}
        className="pointer-events-none absolute inset-0 z-20"
      />
    </div>
  );
};

export default Contact;
