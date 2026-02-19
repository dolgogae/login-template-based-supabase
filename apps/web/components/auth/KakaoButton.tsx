"use client";

export function KakaoButton() {
  const handleLogin = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // Edge Function으로 redirect → Kakao 인증 후 /auth/confirm으로 돌아옴
    window.location.href = `${supabaseUrl}/functions/v1/kakao-auth/login?platform=web`;
  };

  return (
    <button
      onClick={handleLogin}
      className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#FEE500] px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-yellow-300"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9 0.5C4.029 0.5 0 3.636 0 7.5c0 2.416 1.574 4.54 3.963 5.796L2.99 17.032a.25.25 0 0 0 .388.263L8.5 13.96c.165.01.331.015.5.015 4.971 0 9-3.136 9-7s-4.029-7-9-7z"
          fill="#000000"
        />
      </svg>
      카카오로 계속하기
    </button>
  );
}
