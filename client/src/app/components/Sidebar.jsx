"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const routes = [
  { link: "/upload", title: "Upload", short: "Upload" },
  { link: "/ask", title: "Ask", short: "Ask" },
];

function NavLinks({ orientation = "vertical", onNavigate }) {
  const pathname = usePathname();

  return routes.map((route) => {
    const active = pathname === route.link;

    return (
      <Link
        href={route.link}
        key={route.link}
        onClick={onNavigate}
        className={
          orientation === "horizontal"
            ? `flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 text-xs font-medium transition ${
                active
                  ? "bg-indigo-600/20 text-indigo-200"
                  : "text-gray-400 hover:bg-slate-900 hover:text-white"
              }`
            : `rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-indigo-600/20 text-indigo-200"
                  : "text-gray-300 hover:bg-slate-900 hover:text-white"
              }`
        }
      >
        {orientation === "horizontal" ? route.short : route.title}
      </Link>
    );
  });
}

export function DesktopSidebar() {
  return (
    <aside className="desktop-sidebar">
      <div className="border-b border-gray-800 px-4 py-4">
        <p className="text-sm font-semibold tracking-tight text-white">
          PDF RAG
        </p>
        <p className="mt-1 text-xs text-gray-500">Upload · Index · Ask</p>
      </div>

      <nav className="flex flex-col gap-1 p-2">
        <NavLinks orientation="vertical" />
      </nav>
    </aside>
  );
}

export function MobileBottomNav() {
  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-bottom-nav-inner">
        <NavLinks orientation="horizontal" />
      </div>
    </nav>
  );
}

export default function Sidebar() {
  return <DesktopSidebar />;
}
