/** Outline icons for customer sidebar (stroke follows currentColor). */

export function CustomerNavIconDashboard({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 5a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zM13 5a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V5zM4 14a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5zM13 14a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-5z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function CustomerNavIconOrders({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 5h10v14H9V5zM5 9h4v10H5V9z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 5V3h6v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function CustomerNavIconWishlist({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s-6.5-4.35-9-8.5C.5 8.5 2.5 5 6 5c2.1 0 3.25 1.3 4 2.5C10.75 6.3 11.9 5 14 5c3.5 0 5.5 3.5 3 7.5-2.5 4.15-9 8.5-9 8.5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CustomerNavIconCheckout({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 7V5.5a3 3 0 0 1 6 0V7M5.5 7h13l-1.1 11.5H6.6L5.5 7z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.25" cy="18.5" r="1.15" fill="currentColor" />
      <circle cx="16.25" cy="18.5" r="1.15" fill="currentColor" />
    </svg>
  );
}

export function CustomerNavIconProfile({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8.5" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M6 19c0-3 2.7-4.5 6-4.5s6 1.5 6 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
