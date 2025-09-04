// =============================
// Project structure (Expo + JavaScript)
// =============================
// Use com projeto Expo JavaScript (sem TypeScript).
// Crie com: `npx create-expo-app my-game`
// Depois, substitua/adicione os arquivos abaixo.

// ├── App.js
// └── src/
//     ├── GameEngine.js
//     ├── data/
//     │   └── items.example.json
//     ├── utils/
//     │   └── normalizar.js
//     └── components/
//         ├── Header.js
//         ├── Board.js
//         ├── Controls.js
//         └── Status.js

// =============================
// Notas rápidas para JS/Expo
// =============================
// - Se quiser usar @expo/vector-icons: `expo install @expo/vector-icons`
// - Para manter JSON local (dataset), o Metro bundler suporta import "items.example.json" diretamente.
// - Para rodar: `npx expo start --tunnel` (ou --localhost, conforme sua preferência).
// - Para personalizar regras: edite `guess`, `hint`, `maskSecret`, condições de vitória/derrota em GameEngine.js.

// =============================
// App.js
// =============================
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import Header from "./src/components/Header";
import Board from "./src/components/Board";
import Controls from "./src/components/Controls";
import Status from "./src/components/Status";
import useGame from "./src/GameEngine";

export default function App() {
	const game = useGame();

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="light-content" />
			<Header title={game.config.title} onReset={game.reset} />
			<Board game={game} />
			{/* <Controls game={game} /> */}
			<Status game={game} />
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#111", paddingHorizontal: 16 },
});
