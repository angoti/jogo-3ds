import { useState } from "react";
import { TextInput, View, StyleSheet, Pressable, Text } from "react-native";

export default function Controls({ game }) {
	const [input, setInput] = useState("");

	const onSubmit = () => {
		if (!input) return;
		game.marcarPalavra(input.toUpperCase());
		setInput("");
	};

	return (
		<View style={styles.container}>
			<TextInput style={styles.input} placeholder="Digite palavra encontrada" placeholderTextColor="#aaa" value={input} onChangeText={setInput} />
			<Pressable style={styles.btn} onPress={onSubmit}>
				<Text style={styles.btnText}>Marcar</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flexDirection: "row", marginBottom: 12, gap: 8 },
	input: {
		flex: 1,
		backgroundColor: "#222",
		color: "#fff",
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#333",
	},
	btn: {
		backgroundColor: "#3949ab",
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: 12,
	},
	btnText: { color: "#fff", fontWeight: "700" },
});
