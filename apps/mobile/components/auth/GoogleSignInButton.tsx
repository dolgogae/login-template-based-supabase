import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useGoogleAuth } from "../../lib/auth/google";

export function GoogleSignInButton() {
  const { signIn, isLoading } = useGoogleAuth();

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={signIn}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#3C4043" />
      ) : (
        <Text style={styles.text}>Google로 계속하기</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DADCE0",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: "100%",
  },
  text: {
    color: "#3C4043",
    fontSize: 15,
    fontWeight: "500",
  },
});
