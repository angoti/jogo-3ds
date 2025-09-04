import { useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

// Board para Memória 3×4
// - Renderiza 12 cartas (3 colunas × 4 linhas)
// - Chama game.guess(index) ao tocar em uma carta
// - Mostra valor quando revealed/matched; oculta quando virada

export default function Board({ game }) {
	const deck = useMemo(() => game.state.payload?.deck ?? [], [game.state.payload?.deck]);

	return (
		<View style={styles.grid}>
			{deck.map((card, index) => {
				const isRevealed = card.revealed || card.matched;
				return (
					<Pressable
						key={card.id}
						style={[styles.card, card.matched && styles.matched]}
						onPress={() => game.guess(index)}
						accessibilityLabel={`Carta ${index + 1}`}
						disabled={card.matched || card.revealed || game.state.status !== "playing"}>
						<View style={[styles.face, isRevealed ? styles.faceUp : styles.faceDown]}>
							{isRevealed ? <Text style={styles.value}>{card.value.toUpperCase()}</Text> : <Text style={styles.back}>?</Text>}
						</View>
					</Pressable>
				);
			})}
		</View>
	);
}

const GAP = 10;

const styles = StyleSheet.create({
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: GAP,
		padding: GAP,
	},
	card: {
		width: "30%", // três colunas aproximadamente
		aspectRatio: 3 / 4,
		borderRadius: 12,
		overflow: "hidden",
	},
	face: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 2,
		borderRadius: 12,
	},
	faceDown: {
		backgroundColor: "#1e1e1e",
		borderColor: "#333",
	},
	faceUp: {
		backgroundColor: "#263238",
		borderColor: "#455a64",
	},
	value: { color: "#fff", fontSize: 12, fontWeight: "800" },
	back: { color: "#9e9e9e", fontSize: 20, fontWeight: "700" },
	matched: {
		opacity: 0.6,
	},
});
