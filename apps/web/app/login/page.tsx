import { LoginCard } from "@/components/auth/LoginCard";

interface SearchParams {
  error?: string;
  next?: string;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {params.error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            로그인 중 오류가 발생했습니다: {decodeURIComponent(params.error)}
          </div>
        )}
        <LoginCard />
      </div>
    </main>
  );
}
