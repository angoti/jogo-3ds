// =============================
// src/GameEngine.js
// =============================
import { useCallback, useEffect, useMemo, useState } from "react";
import { normalizar } from "./utils/normalizar";
import items from "./data/items.palavras.json";
import { imagens } from "./data/items.imagens";

// === Memória 3x4 (6 pares) — apenas trocando as regras do engine ===
// Mantemos a mesma API (useGame) e campos básicos de estado, mas agora:
// - secret/masked passam a ser informativos
// - guess(value) espera um índice da carta (0..11) em string ou número
// - payload guarda o baralho e seleção atual
const DEFAULT_CONFIG = {
	title: "Memória 3×4",
	showHints: false,
	difficulty: "normal",
	maxErrors: 999, // não usamos para perder, apenas contamos erros
};

function shuffle(arr) {
	const a = arr.slice();
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

function criarValoresBase() {
	return items.slice(0, 6).map(w => normalizar(String(w)) || "x");
}

function criarBaralho() {
	const valores = criarValoresBase();
	// cria pares
	const deck = valores
		.flatMap(v => [
			{ value: v, id: v + "-a" },
			{ value: v, id: v + "-b" },
		])
		.map((c, idx) => ({ ...c, idx, revealed: false, matched: false }));
	return shuffle(deck).map((c, idx) => ({ ...c, idx }));
}

function todosPareados(deck) {
	return deck.every(c => c.matched);
}

export default function useGame() {
	const [config, setConfigState] = useState(DEFAULT_CONFIG);
	// const dataset = useMemo(() => items, []);
	// const listaDeImagens = useMemo(() => imagens, []);

	const buildInitialState = useCallback(() => {
		const deck = criarBaralho();
		return {
			secret: "memoria-3x4",
			masked: "0/6 pares",
			usedInputs: [],
			score: 0,
			errors: 0,
			status: "idle",
			payload: {
				deck,
				firstIndex: null, // índice da primeira carta selecionada
				lock: false,
				pairs: 6,
			},
		};
	}, []);
	const [state, setState] = useState(() => buildInitialState());
	const start = useCallback(() => {
		setState(prev => ({ ...prev, status: "playing" }));
	}, []);

	const reset = useCallback(() => {
		setState(buildInitialState());
		start();
	}, [buildInitialState]);

	const atualizarMaskedEScore = (deck, errors, prevScore) => {
		const pareados = deck.filter(c => c.matched).length / 2;
		const masked = `${pareados}/6 pares`;
		const score = Math.max(0, pareados * 20 - errors * 2);
		return { masked, score };
	};

	const guess = useCallback(
		raw => {
			if (state.status !== "playing") return;
			const idx = typeof raw === "number" ? raw : parseInt(String(raw), 10);
			if (Number.isNaN(idx)) return;

			const payload = state.payload || {};
			const deck = (payload.deck || []).slice();
			if (!deck[idx] || deck[idx].matched || deck[idx].revealed) return;
			if (payload.lock) return;
			// Revela a carta clicada
			deck[idx] = { ...deck[idx], revealed: true };
			// Se não há primeira seleção, apenas marca e sai
			if (payload.firstIndex === null) {
				const { masked, score } = atualizarMaskedEScore(deck, state.errors, state.score);
				setState(prev => ({
					...prev,
					masked,
					score,
					payload: { ...prev.payload, deck, firstIndex: idx },
				}));
				return;
			}

			// Há primeira seleção: comparar
			const i = payload.firstIndex;
			const sameValue = deck[i].value === deck[idx].value;
			if (sameValue) {
				deck[i] = { ...deck[i], matched: true };
				deck[idx] = { ...deck[idx], matched: true };
				const { masked, score } = atualizarMaskedEScore(deck, state.errors);
				let status = state.status;
				if (todosPareados(deck)) status = "won";
				setState(prev => ({
					...prev,
					masked,
					score,
					status,
					payload: { ...prev.payload, deck, firstIndex: null, lock: false },
				}));
				return;
			}
			// Não é par: mantém as duas reveladas por 1s e depois vira de volta
			setState(prev => ({
				...prev,
				payload: { ...prev.payload, deck, firstIndex: i, lock: true },
			}));

			setTimeout(() => {
				const deckAfter = deck.slice();
				deckAfter[i] = { ...deckAfter[i], revealed: false };
				deckAfter[idx] = { ...deckAfter[idx], revealed: false };
				const errors = state.errors + 1;
				const { masked, score } = atualizarMaskedEScore(deckAfter, errors);
				setState(prev => ({
					...prev,
					errors,
					masked,
					score,
					payload: { ...prev.payload, deck: deckAfter, firstIndex: null, lock: false },
				}));
			}, 1000);
			
		},
		[state]
	);

	const hint = useCallback(() => {
		// Opcional: revelar uma dica rápida (não implementado por padrão)
		return;
	}, []);

	const setConfig = useCallback(partial => {
		setConfigState(prev => ({ ...prev, ...partial }));
	}, []);

	useEffect(() => {
		start();
	}, [start]);

	return {
		state,
		config,
		start,
		reset,
		guess,
		hint,
		setConfig,
	};
}
