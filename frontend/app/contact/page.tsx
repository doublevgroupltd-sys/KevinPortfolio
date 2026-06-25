import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch to discuss your next project.",
};

export default function ContactPage() {
  return (
    <div className="pt-20">
      <ContactForm />
    </div>
  );
}
