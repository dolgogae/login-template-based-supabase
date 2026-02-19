import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { useSession } from "../hooks/useSession";

export default function RootLayout() {
  const { session, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (session && inAuthGroup) {
      // 로그인됐는데 auth 화면에 있으면 → 앱으로
      router.replace("/(app)/home");
    } else if (!session && !inAuthGroup) {
      // 비로그인인데 보호된 화면에 있으면 → 로그인으로
      router.replace("/(auth)/login");
    }
  }, [session, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}
