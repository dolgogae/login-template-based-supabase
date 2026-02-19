"use client";

import { GoogleButton } from "./GoogleButton";
import { AppleButton } from "./AppleButton";
import { KakaoButton } from "./KakaoButton";
import { NaverButton } from "./NaverButton";
import { getEnabledProviders } from "@repo/supabase";

export function LoginCard() {
  const providers = getEnabledProviders();

  const hasAnyProvider = Object.values(providers).some(Boolean);

  if (!hasAnyProvider) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-center text-sm text-gray-500">
          활성화된 로그인 방법이 없습니다.
          <br />
          환경변수에서 AUTH_*_ENABLED를 설정하세요.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
        <p className="mt-2 text-sm text-gray-500">계정으로 계속하세요</p>
      </div>

      <div className="flex flex-col gap-3">
        {providers.google && <GoogleButton />}
        {providers.apple && <AppleButton />}
        {providers.kakao && <KakaoButton />}
        {providers.naver && <NaverButton />}
      </div>
    </div>
  );
}
