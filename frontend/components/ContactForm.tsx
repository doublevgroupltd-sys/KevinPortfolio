"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { apiClientFetch, ApiClientError } from "@/lib/api";

interface ContactFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function onSubmit(values: ContactFormValues) {
    setServerError(null);
    try {
      const { csrfToken } = await apiClientFetch<{ csrfToken: string }>("/auth/csrf");
      await apiClientFetch("/contact", {
        method: "POST",
        body: JSON.stringify(values),
        csrfToken,
      });
      setSuccess(true);
      reset();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setServerError(err.message);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <section id="contact" className="section-padding container-luxury">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Contact</p>
        <h2 className="mt-4 font-display text-display-2 font-semibold tracking-tight">
          Let&apos;s build something
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Have a project in mind? Tell me about it and I&apos;ll get back to you within 48 hours.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-2xl">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 rounded-xl2 border border-border bg-card p-14 text-center"
              role="status"
            >
              <CheckCircle2 className="h-14 w-14 text-gold" aria-hidden="true" />
              <h3 className="font-display text-2xl font-semibold">Message sent!</h3>
              <p className="text-muted-foreground">Thanks for reaching out — I&apos;ll be in touch soon.</p>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="mt-2 text-sm font-medium underline"
              >
                Send another message
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
              noValidate
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register("name", { required: "Name is required", minLength: 2 })}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3.5 text-base outline-none focus:border-gold"
                  />
                  {errors.name && (
                    <p id="name-error" className="mt-1.5 text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                    })}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3.5 text-base outline-none focus:border-gold"
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-1.5 text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="mb-2 block text-sm font-medium">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  {...register("subject", { required: "Subject is required" })}
                  aria-invalid={!!errors.subject}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3.5 text-base outline-none focus:border-gold"
                />
                {errors.subject && <p className="mt-1.5 text-sm text-red-500">{errors.subject.message}</p>}
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  {...register("message", { required: "Message is required", minLength: 10 })}
                  aria-invalid={!!errors.message}
                  className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3.5 text-base outline-none focus:border-gold"
                />
                {errors.message && <p className="mt-1.5 text-sm text-red-500">{errors.message.message}</p>}
              </div>

              {serverError && (
                <p role="alert" className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-medium text-accent-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-5 w-5" aria-hidden="true" />
                )}
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
