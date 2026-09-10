import { StyleSheet, Text, View } from "react-native";

export default function PartnerDashboardRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>hello partner</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
  },
});
