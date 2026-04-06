import Link from "next/link";

interface BackButtonProps {
  href: string;
}

export function BackButton({ href }: BackButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors mb-6"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
      </svg>
      <span className="text-[13px]">Back</span>
    </Link>
  );
}
