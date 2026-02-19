import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { supabase } from "../../lib/supabase/client";
import { useSession } from "../../hooks/useSession";
import { AdMobBanner } from "../../components/ads/AdMobBanner";
import { CoupangBanner } from "../../components/ads/CoupangBanner";

export default function HomeScreen() {
  const { user } = useSession();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>대시보드</Text>

        <View style={styles.userInfo}>
          <Text style={styles.label}>로그인된 계정</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.provider}>
            Provider: {user?.app_metadata?.provider ?? "unknown"}
          </Text>
        </View>

        <Text style={styles.description}>
          이 화면은 로그인 후에만 접근 가능한 보호된 화면입니다.{"\n"}
          실제 프로젝트에서는 이 화면을 수정해서 사용하세요.
        </Text>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      {/* 광고 영역 - 활성화 시 하단에 표시됩니다 */}
      <View style={styles.adContainer}>
        <AdMobBanner />
        <CoupangBanner width={320} height={100} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  userInfo: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  provider: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
  },
  description: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 20,
  },
  signOutButton: {
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  signOutText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  adContainer: {
    marginTop: 16,
    alignItems: "center",
    gap: 8,
  },
});
