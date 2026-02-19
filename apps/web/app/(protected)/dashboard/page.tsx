import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const handleSignOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">대시보드</h1>

        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <p className="text-xs font-medium text-gray-500">로그인된 계정</p>
          <p className="mt-1 font-medium text-gray-900">{user.email}</p>
          <p className="mt-1 text-xs text-gray-400">
            Provider: {user.app_metadata?.provider ?? "unknown"}
          </p>
        </div>

        <p className="mb-6 text-sm text-gray-500">
          이 페이지는 로그인 후에만 접근 가능한 보호된 페이지입니다.
          <br />
          실제 프로젝트에서는 이 페이지를 수정해서 사용하세요.
        </p>

        <form action={handleSignOut}>
          <button
            type="submit"
            className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700"
          >
            로그아웃
          </button>
        </form>
      </div>
    </main>
  );
}
