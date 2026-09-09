"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

export default function Header() {
  const { isLoaded, isSignedIn, user } = useUser();

  return (
    <header className="app-header">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold tracking-tight text-white">
          PDF RAG
        </p>
        <p className="header-subtitle">Document Q&A</p>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {!isLoaded && <div className="text-sm text-gray-500">Loading...</div>}

        {isLoaded && !isSignedIn && (
          <SignInButton mode="modal">
            <button className="btn-primary btn-primary-block !min-h-0 !w-auto px-4 py-2">
              Sign In
            </button>
          </SignInButton>
        )}

        {isSignedIn && (
          <div className="flex items-center gap-2 text-sm text-gray-400 sm:gap-3">
            <span className="header-username">
              {user.firstName} {user.lastName}
            </span>
            <UserButton />
          </div>
        )}
      </div>
    </header>
  );
}
