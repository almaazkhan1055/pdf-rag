"use client";

import { useUser } from "@clerk/nextjs";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export default function AppLayout({ children }) {
  const { isSignedIn } = useUser();
  return (
    <div className="flex h-screen bg-slate-950 text-white flex-col">
      <Header />
      {isSignedIn && (
        <main className="flex min-w-0 flex-1 overflow-hidden">
          <Sidebar />
          {children}
        </main>
      )}
    </div>
  );
}
