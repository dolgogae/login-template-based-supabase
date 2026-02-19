"use client";

export function NaverButton() {
  const handleLogin = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // Edge Function으로 redirect → Naver 인증 후 /auth/confirm으로 돌아옴
    window.location.href = `${supabaseUrl}/functions/v1/naver-auth/login?platform=web`;
  };

  return (
    <button
      onClick={handleLogin}
      className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#03C75A] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-green-500"
    >
      <span className="text-lg font-bold leading-none">N</span>
      네이버로 계속하기
    </button>
  );
}
