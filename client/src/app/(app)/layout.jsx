"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import Header from "../components/Header";
import { DesktopSidebar, MobileBottomNav } from "../components/Sidebar";

export default function AppLayout({ children }) {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <div className="app-shell">
      <Header />

      {!isLoaded && (
        <main className="flex flex-1 items-center justify-center px-4 text-sm text-gray-400">
          Loading...
        </main>
      )}

      {isLoaded && !isSignedIn && (
        <main className="page-scroll flex items-center justify-center">
          <div className="page-card w-full max-w-md text-center">
            <h1 className="page-title">Sign in to continue</h1>
            <p className="page-subtitle">
              Upload PDFs and ask grounded questions after signing in.
            </p>
            <SignInButton mode="modal">
              <button className="btn-primary btn-primary-block mt-6">
                Sign In
              </button>
            </SignInButton>
          </div>
        </main>
      )}

      {isLoaded && isSignedIn && (
        <>
          <main className="app-main">
            <DesktopSidebar />
            <div className="app-content">{children}</div>
          </main>
          <MobileBottomNav />
        </>
      )}
    </div>
  );
}
