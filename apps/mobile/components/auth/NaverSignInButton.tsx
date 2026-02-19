import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { signInWithNaver } from "../../lib/auth/naver";

export function NaverSignInButton() {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={signInWithNaver}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>네이버로 계속하기</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#03C75A",
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
