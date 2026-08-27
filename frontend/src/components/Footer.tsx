import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200/70 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        <p className="text-xs text-neutral-500">
          Files are automatically deleted after processing.
        </p>
        <nav className="flex items-center gap-5 text-xs text-neutral-500">
          <Link href="/privacy" className="transition-colors hover:text-neutral-900">
            Privacy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-neutral-900">
            Terms
          </Link>
          <span className="text-neutral-300">·</span>
          <span>© {new Date().getFullYear()} QuikDrop</span>
        </nav>
      </div>
    </footer>
  );
}