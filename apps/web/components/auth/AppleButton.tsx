"use client";

import { createClient } from "@/lib/supabase/client";

export function AppleButton() {
  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button
      onClick={handleLogin}
      className="flex w-full items-center justify-center gap-3 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-900"
    >
      <svg width="17" height="20" viewBox="0 0 814 1000" xmlns="http://www.w3.org/2000/svg" fill="white">
        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.5 0 694.5 0 602.5c0-234.6 155.5-355.8 308.1-355.8 79.8 0 146.1 52.5 195.6 52.5 47.2 0 121.7-55.8 209.1-55.8l43.2.4zm-71.1-152.9c33-39.1 56.7-94.1 56.7-149.1 0-7.8-.6-15.6-1.9-22.7-53.8 2-117.8 35.8-155.5 79.8-29.4 33.7-56.8 88.1-56.8 144.1 0 8.4 1.3 16.9 1.9 19.5 3.2.6 8.4 1.3 13.6 1.3 47.9 0 108.2-32.4 141.9-72.9z"/>
      </svg>
      Apple로 계속하기
    </button>
  );
}
