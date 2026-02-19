import { View, Text, StyleSheet } from "react-native";
import { getEnabledProviders } from "@repo/supabase";
import { GoogleSignInButton } from "../../components/auth/GoogleSignInButton";
import { AppleSignInButton } from "../../components/auth/AppleSignInButton";
import { KakaoSignInButton } from "../../components/auth/KakaoSignInButton";
import { NaverSignInButton } from "../../components/auth/NaverSignInButton";

export default function LoginScreen() {
  const providers = getEnabledProviders();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>로그인</Text>
        <Text style={styles.subtitle}>계정으로 계속하세요</Text>
      </View>

      <View style={styles.buttons}>
        {providers.google && <GoogleSignInButton />}
        {providers.apple && <AppleSignInButton />}
        {providers.kakao && <KakaoSignInButton />}
        {providers.naver && <NaverSignInButton />}
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
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
  },
  buttons: {
    width: "100%",
    gap: 12,
  },
});
