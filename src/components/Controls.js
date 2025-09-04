import React, { useCallback, useState } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";

export default function Controls({ game }) {
	const [input, setInput] = useState("");

	const onSubmit = useCallback(() => {
		if (!input) return;
		game.guess(input);
		setInput("");
	}, [game, input]);
	return (
		<View style={styles.container}>
			{game.config.showHints && (
				<Pressable style={[styles.btn, styles.hint]} onPress={game.hint} accessibilityLabel="Dica">
					<Text style={styles.btnText}>Dica</Text>
				</Pressable>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flexDirection: "row", gap: 8, marginBottom: 12 },
	input: { flex: 1, backgroundColor: "#222", color: "#fff", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "#333" },
	btn: { backgroundColor: "#3949ab", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
	hint: { backgroundColor: "#6a1b9a" },
	btnText: { color: "#fff", fontWeight: "700" },
});
