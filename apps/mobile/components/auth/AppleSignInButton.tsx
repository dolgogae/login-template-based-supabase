/**
 * Apple 로그인 버튼 - iOS에서만 렌더링됩니다.
 */

import { Platform, TouchableOpacity, Text, StyleSheet } from "react-native";
import { signInWithApple } from "../../lib/auth/apple";

export function AppleSignInButton() {
  // Android에서는 렌더링하지 않음
  if (Platform.OS !== "ios") return null;

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={signInWithApple}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>Apple로 계속하기</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: "100%",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
});
