import { ChevronLeft } from "lucide-react";
import Link from "next/link";

// One screen in a tab's stack: a top bar (back button, title, actions) and the
// content. The tab bar is in the (app) layout.
export function Screen({
  title,
  back,
  action,
  children,
}: {
  title: string;
  back?: { href: string; label: string };
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50/90 pt-[env(safe-area-inset-top)] backdrop-blur dark:border-zinc-800 dark:bg-black/90">
        <div className="mx-auto grid h-11 max-w-lg grid-cols-[1fr_auto_1fr] items-center gap-2 px-2">
          <div className="min-w-0">
            {back && (
              <Link
                href={back.href}
                className="flex min-w-0 items-center text-[17px] text-blue-600 active:opacity-50 dark:text-blue-400"
              >
                <ChevronLeft className="size-6 shrink-0" strokeWidth={2.5} aria-hidden />
                <span className="truncate">{back.label}</span>
              </Link>
            )}
          </div>
          <h1 className="max-w-[55vw] truncate text-center text-[17px] font-semibold text-zinc-950 dark:text-zinc-50">
            {title}
          </h1>
          <div className="flex min-w-0 justify-end">{action}</div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+5.5rem)]">
        {children}
      </main>
    </>
  );
}

// A text or icon button for the top bar's right side.
export function ScreenAction({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex items-center gap-1 px-2 text-[17px] text-blue-600 active:opacity-50 dark:text-blue-400"
    >
      {children}
    </Link>
  );
}
