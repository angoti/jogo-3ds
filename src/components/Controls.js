// =============================
// src/components/Controls.js
// =============================
import { useCallback, useState } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";

const Tecla = ({ tecla, onPress }) => (
	<Pressable
		onPress={onPress}
		style={{
			backgroundColor: "#333",
			padding: 8,
			borderRadius: 8,
			alignItems: "center",
			justifyContent: "center",
			width: 40,
			height: 40,
			borderWidth: 1,
			borderColor: "#666",
		}}>
		<Text style={styles.btnText}>{tecla}</Text>
	</Pressable>
);

const Teclado = ({ onPress }) => {
	return (
		<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, margin: 8, justifyContent: "center" }}>
			{"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letra, index) => (
				<Tecla key={index} tecla={letra} onPress={() => onPress(letra)} />
			))}
		</View>
	);
};

export default function Controls({ game }) {
	const [input, setInput] = useState("");

	const onSubmit = useCallback(() => {
		if (!input) return;
		game.guess(input);
		setInput("");
	}, [game, input]);

	return (
		<View style={styles.container}>
			<Teclado
				onPress={letra => {
					game.guess(letra);
				}}
			/>
			{game.config.showHints && (
				<Pressable style={[styles.btn, styles.hint]} onPress={game.hint} accessibilityLabel="Dica">
					<Text style={styles.btnText}>Dica</Text>
				</Pressable>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { marginBottom: 12 },
	btn: {
		backgroundColor: "#3949ab",
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: 12,
	},
	hint: { backgroundColor: "#6a1b9a" },
	btnText: { color: "#fff", fontWeight: "700" },
});
