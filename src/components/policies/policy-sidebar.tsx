import Link from "next/link";
import { POLICY_NAV } from "../../lib/policy-nav";

export function PolicySidebar({ currentHref }: { currentHref: string }) {
  return (
    <nav className="policy-sidebar" aria-label="Legal and policy pages">
      <p className="policy-sidebar__label text-uppercase small fw-semibold text-secondary mb-3">On this site</p>
      <ul className="policy-sidebar__list list-unstyled mb-0">
        {POLICY_NAV.map((item) => {
          const active = item.href === currentHref;
          return (
            <li key={item.href} className="policy-sidebar__item">
              <Link href={item.href} className={`policy-sidebar__link${active ? " policy-sidebar__link--active" : ""}`}>
                {item.label}
                {active ? <span className="visually-hidden"> (current page)</span> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
