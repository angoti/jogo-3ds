import { useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

// Board para Caça-Palavras 6×6
// - Renderiza grade 6x6
// - Primeiro toque define início; segundo toque (na mesma linha/coluna) define fim
// - Chama game.guess(index)

const SIZE = 6;

export default function Board({ game }) {
	const grid = useMemo(() => game.state.payload?.grid ?? [], [game.state.payload?.grid]);
	const foundCells = useMemo(() => game.state.payload?.foundCells ?? [], [game.state.payload?.foundCells]);
	const firstIndex = game.state.payload?.firstIndex ?? null;

	return (
		<View style={styles.grid}>
			{grid.map((ch, index) => {
				const isFound = !!foundCells[index];
				const isFirst = firstIndex === index;
				return (
					<Pressable
						key={index}
						style={[styles.cell, isFound && styles.found, isFirst && styles.start]}
						onPress={() => game.guess(index)}
						disabled={game.state.status !== "playing"}
						accessibilityLabel={`Célula ${index + 1}`}>
						<Text style={styles.letter}>{String(ch)}</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

const GAP = 6;

const styles = StyleSheet.create({
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: GAP,
		padding: GAP,
	},
	cell: {
		width: "14%", // ~ 6 colunas com gaps
		aspectRatio: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#1e1e1e",
		borderColor: "#333",
		borderWidth: 1,
		borderRadius: 8,
	},
	letter: { color: "#fff", fontSize: 18, fontWeight: "800" },
	found: {
		backgroundColor: "#2e7d32",
		borderColor: "#33691e",
	},
	start: {
		backgroundColor: "#263238",
		borderColor: "#455a64",
	},
});
