"use client";

import { FormEvent } from "react";
import Image from "next/image";
import { sendContact } from "../../lib/api";
import { useToast } from "../../contexts/toast-provider";

export default function ContactUsPage() {
  const toast = useToast();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const phone = String(form.get("phone") ?? "");
    const comment = String(form.get("comment") ?? "");

    const payload = {
      name,
      email,
      message: `Phone: ${phone || "Not provided"}\n\n${comment}`
    };

    const response = await sendContact(payload);
    toast.success(response?.message ?? "Message sent.");
    event.currentTarget.reset();
  }

  return (
    <main>
      <section className="contact-hero py-3 py-lg-4">
        <div className="container">
          <div className="rounded-3 overflow-hidden border shadow-sm">
            <Image
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80"
              alt="Customer support and research consultation"
              width={1600}
              height={420}
              className="img-fluid w-100 object-fit-cover contact-banner-image"
            />
          </div>
        </div>
      </section>

      <section className="container py-4 py-lg-5">
        <div className="mx-auto contact-shell">
          <p className="text-secondary mb-4">
            Contact our research support team for product details, order questions, or laboratory-use information.
          </p>
          <form onSubmit={onSubmit} className="row g-3">
            <div className="col-md-6">
              <input className="form-control form-control-lg" name="name" placeholder="Name" required />
            </div>
            <div className="col-md-6">
              <input className="form-control form-control-lg" name="email" type="email" placeholder="Email *" required />
            </div>
            <div className="col-12">
              <input className="form-control form-control-lg" name="phone" placeholder="Phone number" />
            </div>
            <div className="col-12">
              <textarea
                className="form-control form-control-lg"
                name="comment"
                rows={6}
                placeholder="Comment"
                required
              />
            </div>
            <div className="col-12">
              <button className="btn btn-primary px-4 py-2" type="submit">
                Send
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
