// =============================
// src/components/Status.js
// =============================
import { View, Text, StyleSheet } from "react-native";

export default function Status({ game }) {
	const { status, errors, usedInputs, score } = game.state;
	const max = game.config.maxErrors ?? 6;

	return (
		<View style={styles.container}>
			<Text style={styles.text}>
				Erros: {errors}/{max}
			</Text>
			<Text style={styles.text}>Usadas: {usedInputs.join(", ") || "-"}</Text>
			<Text style={styles.text}>Pontuação: {score}</Text>
			{status === "won" && <Text style={[styles.text, styles.won]}>Você venceu! 🎉</Text>}
			{status === "lost" && <Text style={[styles.text, styles.lost]}>Você perdeu. 😢</Text>}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { gap: 4, marginBottom: 16 },
	text: { color: "#fff" },
	won: { color: "#4caf50", fontWeight: "700" },
	lost: { color: "#ef5350", fontWeight: "700" },
});
