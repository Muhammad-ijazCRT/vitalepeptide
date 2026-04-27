import Link from "next/link";
import { PolicySidebar } from "./policy-sidebar";

type PolicyShellProps = {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  currentHref: string;
  children: React.ReactNode;
};

export function PolicyShell({ title, subtitle, lastUpdated, currentHref, children }: PolicyShellProps) {
  return (
    <main className="policy-page">
      <header className="policy-page__hero">
        <div className="container policy-page__hero-inner">
          <nav className="policy-page__breadcrumb small mb-3" aria-label="Breadcrumb">
            <Link href="/" className="policy-page__breadcrumb-link">
              Home
            </Link>
            <span className="policy-page__breadcrumb-sep" aria-hidden="true">
              /
            </span>
            <span className="policy-page__breadcrumb-current">{title}</span>
          </nav>
          <h1 className="policy-page__title">{title}</h1>
          {subtitle ? <p className="policy-page__subtitle mb-0">{subtitle}</p> : null}
          {lastUpdated ? (
            <p className="policy-page__updated small mt-3 mb-0">
              Last updated: <time dateTime={lastUpdated}>{formatDisplayDate(lastUpdated)}</time>
            </p>
          ) : null}
        </div>
      </header>

      <div className="container policy-page__body py-4 py-lg-5">
        <div className="row g-4 g-xl-5">
          <aside className="col-lg-4 col-xl-3">
            <div className="policy-page__aside sticky-lg-top">
              <PolicySidebar currentHref={currentHref} />
            </div>
          </aside>
          <div className="col-lg-8 col-xl-9">
            <article className="policy-page__article">{children}</article>
          </div>
        </div>
      </div>
    </main>
  );
}

function formatDisplayDate(iso: string) {
  const d = new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
