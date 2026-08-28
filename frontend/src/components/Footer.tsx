import Link from "next/link";
import VisitorCounter from "./VisitorCounter";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200/70 py-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-4 px-4 sm:grid-cols-[1fr_auto_1fr] sm:px-6">
        <p className="text-xs text-neutral-500 sm:text-left">
          Files are automatically deleted after processing.
        </p>
        <div className="flex justify-center">
          <VisitorCounter />
        </div>
        <nav className="flex items-center gap-5 text-xs text-neutral-500 sm:justify-end">
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