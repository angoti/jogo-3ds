// =============================
// src/GameEngine.js
// =============================
import { useCallback, useEffect, useMemo, useState } from "react";
import { normalizar } from "./utils/normalizar";
import items from "./data/items.palavras.json";
import { imagens } from "./data/items.imagens";

const DEFAULT_CONFIG = {
	title: "Jogo-Base",
	showHints: false,
	difficulty: "normal",
	maxErrors: 6,
};

function sortear(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function maskSecret(secret, usedInputs) {
	const set = new Set(usedInputs.map(normalizar));
	return secret
		.split("")
		.map(ch => (set.has(normalizar(ch)) ? ch : "_"))
		.join(" ");
}

function allRevealed(masked) {
	return !masked.includes("_");
}

export default function useGame() {
	const [config, setConfigState] = useState(DEFAULT_CONFIG);
	const dataset = useMemo(() => items, []);
	const listaDeImagens = useMemo(() => imagens, []);

  const buildInitialState = useCallback(() => {
    console.log("building initial state...");
		const raw = String(sortear(dataset));
		const secret = raw;
		const masked = maskSecret(secret, []);
		return {
			secret,
			masked,
			usedInputs: [],
			score: 0,
			errors: 0,
			status: "idle",
			imagem: listaDeImagens[0],
		};
	}, [dataset, listaDeImagens]);

	const [state, setState] = useState(buildInitialState());

	const start = useCallback(() => {
		setState(prev => ({ ...prev, status: "playing" }));
	}, []);

  const reset = useCallback(() => {
    console.log("resetting game...");
    setState(buildInitialState());
    start();
  }, [buildInitialState]);

	const guess = useCallback(
    value => {
      console.log("guessing:", value);
			if (state.status !== "playing") return;

			const v = normalizar(value).slice(0, 1);
			if (!v) return;

			if (state.usedInputs.map(normalizar).includes(v)) {
				return;
			}

			const usedInputs = [...state.usedInputs, v];
			const normalizedSecret = normalizar(state.secret);
			const isHit = normalizedSecret.includes(v);

			const masked = maskSecret(state.secret, usedInputs);
			const errors = state.errors + (isHit ? 0 : 1);

			let status = state.status;
			if (allRevealed(masked)) status = "won";
			else if (errors >= (config.maxErrors ?? 6)) status = "lost";

			const scoreDelta = isHit ? 10 : -2;

			setState(prev => ({
				...prev,
				usedInputs,
				masked,
				errors,
				status,
				score: Math.max(0, prev.score + scoreDelta),
				imagem: listaDeImagens[errors],
			}));
		},
		[state, config.maxErrors]
	);

	const hint = useCallback(() => {
		if (!config.showHints || state.status !== "playing") return;
		const normalizedSecret = normalizar(state.secret);
		const used = new Set(state.usedInputs);
		const candidates = Array.from(new Set(normalizedSecret.split(""))).filter(c => !used.has(c));
		if (candidates.length === 0) return;
		const chosen = sortear(candidates);
		guess(chosen);
	}, [config.showHints, state.status, state.secret, state.usedInputs, guess]);

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
