import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { signInWithKakao } from "../../lib/auth/kakao";

export function KakaoSignInButton() {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={signInWithKakao}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>카카오로 계속하기</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE500",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: "100%",
  },
  text: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "500",
  },
});
