// components/Icons.js
// Small, original line-style SVG icons used across the site.

export function LightningIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"
        fill="url(#lightning-grad)"
        stroke="none"
      />
      <defs>
        <linearGradient id="lightning-grad" x1="4" y1="2" x2="20" y2="22">
          <stop offset="0" stopColor="#7C5CFC" />
          <stop offset="1" stopColor="#3E7BFA" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function LinkStepIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#EFEBFF" />
      <path
        d="M17 23a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1.2 1.2"
        stroke="#7C5CFC"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M23 17a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1.2-1.2"
        stroke="#7C5CFC"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PasteStepIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#E9F1FF" />
      <rect x="13" y="12" width="14" height="17" rx="2.5" stroke="#3E7BFA" strokeWidth="1.8" />
      <rect x="16" y="9" width="8" height="4" rx="1.5" fill="#3E7BFA" />
      <path d="M16.5 18h7M16.5 22h7M16.5 26h4.5" stroke="#3E7BFA" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function DownloadStepIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#FFF3E0" />
      <path d="M20 12v13" stroke="#F5A524" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15 20l5 5 5-5" stroke="#F5A524" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 27h14" stroke="#F5A524" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function InstagramIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function ThreadsIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3c5 0 8 3 8 8.5S17 21 12.3 21c-3.2 0-5.6-1.4-5.6-4.3 0-2.6 2.1-4 5-4 1.4 0 2.6.3 3.5.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M14.5 9.2c-.6-1-1.7-1.6-3-1.6-2 0-3.5 1.3-3.5 3.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MailIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3l7 3v5c0 4.5-2.9 8.3-7 10-4.1-1.7-7-5.5-7-10V6l7-3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M9 12.2l2 2 4-4.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HDIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="12" rx="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M7 9.5v5M10.2 9.5v5M7 12h3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 9.5h1.6a1.6 1.6 0 0 1 1.6 1.6v1.8a1.6 1.6 0 0 1-1.6 1.6H14v-5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function ClockIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7v5l3.2 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DeviceIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 17h2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M17 8h4v9a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronIcon({ open }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      style={{
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.2s ease",
      }}
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
    }




                
