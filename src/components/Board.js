// =============================
// src/components/Board.js
// =============================
import { useMemo } from "react";
import { Image, View, Text, StyleSheet } from "react-native";

export default function Board({ game }) {
	const masked = useMemo(() => game.state.masked ?? "", [game.state.masked]);

	return (
		<View style={styles.container}>
			<Image source={game.state.imagem} style={{ height: "80%", margin: 10 }} resizeMode="contain" />
			<Text style={styles.secret}>{masked}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { alignItems: "center", flex: 1 },
	secret: { color: "#fff", fontSize: 36, letterSpacing: 2, textAlign: "center" },
});
