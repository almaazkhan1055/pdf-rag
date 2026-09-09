"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

export default function Header() {
  const { isLoaded, isSignedIn, user } = useUser();

  return (
    <header className="flex justify-end items-center p-4 gap-4 h-16 bg-slate-950 border-b border-gray-800">
      {!isLoaded && !isSignedIn && <div>Loading...</div>}
      {!isSignedIn && isLoaded && (
        <SignInButton mode="modal">
          <button className="bg-[#6c47ff] text-white rounded-full px-5 py-2">
            Sign In
          </button>
        </SignInButton>
      )}

      {isSignedIn && (
        <div className="flex items-center gap-5 text-sm text-gray-500">
          <span>
            Welcome! {user.firstName} {user.lastName}
          </span>
          <UserButton />
        </div>
      )}
    </header>
  );
}
