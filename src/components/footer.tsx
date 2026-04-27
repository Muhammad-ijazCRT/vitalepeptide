import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer-shell">
      <div className="container footer-shell__inner">
        <section className="footer-newsletter" aria-labelledby="footer-newsletter-heading">
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <p className="footer-eyebrow mb-2">Newsletter</p>
              <h2 id="footer-newsletter-heading" className="footer-newsletter__title">
                Subscribe to our emails
              </h2>
              <p className="footer-newsletter__lead mb-0">
                Peptide product updates, lab-focused offers, and research news—no spam.
              </p>
            </div>
            <div className="col-lg-6">
              <form className="footer-newsletter__form" action="#" method="post">
                <label htmlFor="footer-email" className="visually-hidden">
                  Email address
                </label>
                <input
                  id="footer-email"
                  type="email"
                  className="form-control footer-newsletter__input"
                  placeholder="Email address"
                  aria-label="Email address"
                  autoComplete="email"
                  required
                />
                <button type="submit" className="btn footer-newsletter__submit">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>

        <div className="row g-4 g-xl-5 footer-main">
          <div className="col-lg-5 col-md-6">
            <Link href="/" className="footer-brand-frame text-decoration-none">
              <Image
                src="/logo.webp"
                alt="Vitale Peptide"
                width={200}
                height={60}
                className="footer-logo-img"
              />
            </Link>
            <p className="footer-tagline">
              Premium research-grade peptides for consistency, quality, and professional laboratory use.
            </p>
          </div>
          <div className="col-6 col-md-3 col-lg-2 offset-lg-1">
            <p className="footer-col-label">Explore</p>
            <ul className="footer-link-list list-unstyled mb-0">
              <li>
                <Link href="/" className="footer-link">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="footer-link">
                  Store
                </Link>
              </li>
              <li>
                <Link href="/about-us" className="footer-link">
                  About us
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="footer-link">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-6 col-md-3 col-lg-4">
            <p className="footer-col-label">Compliance</p>
            <p className="footer-compliance mb-0">
              For research purposes only. Not intended for human consumption, medical use, or diagnostic procedures.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright mb-0">© {new Date().getFullYear()} Vitale Peptide. All rights reserved.</p>
          <nav className="footer-legal-nav" aria-label="Legal">
            <Link href="/policies/privacy-policy" className="footer-legal-link">
              Privacy policy
            </Link>
            <span className="footer-legal-sep" aria-hidden="true">
              ·
            </span>
            <Link href="/policies/contact-information" className="footer-legal-link">
              Contact information
            </Link>
            <span className="footer-legal-sep" aria-hidden="true">
              ·
            </span>
            <Link href="/policies/terms-of-service" className="footer-legal-link">
              Terms of service
            </Link>
            <span className="footer-legal-sep" aria-hidden="true">
              ·
            </span>
            <Link href="/policies/refund-policy" className="footer-legal-link">
              Refund policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
