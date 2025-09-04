// =============================
// src/components/Header.js
// =============================
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

export default function Header({ title, onReset }) {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>{title}</Text>
			<Pressable onPress={onReset} style={styles.btn}>
				<Text style={styles.btnText}>⟳ Reiniciar</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingVertical: 16,
		alignItems: "center",
		gap: 8,
	},
	title: { color: "#fff", fontSize: 22, fontWeight: "700" },
	btn: {
		backgroundColor: "#2e7d32",
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 12,
	},
	btnText: { color: "#fff", fontWeight: "700" },
});
