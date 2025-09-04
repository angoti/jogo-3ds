// =============================
// src/GameEngine.js
// =============================
import { useCallback, useMemo, useState, useEffect } from "react";
import { normalizar } from "./utils/normalizar";
import items from "./data/items.palavras.json";

// === Caça-Palavras (mini) 6x6 com 6 palavras (linhas/colunas; sem diagonal) ===
// Mantém a mesma API (useGame) e troca apenas as regras.
// Interação: toque em uma célula para marcar o INÍCIO; toque em outra na mesma
// linha/coluna para marcar o FIM. O trecho selecionado é checado como palavra.

const GRID = 6; // 6x6
const NUM_WORDS = 6;

const DEFAULT_CONFIG = {
	title: "Caça-Palavras 6x6",
	showHints: false,
	difficulty: "normal",
	maxErrors: 999,
};

function randInt(n) {
	return Math.floor(Math.random() * n);
}
function pickRandom(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

// Gera letras A–Z
function randLetter() {
	const A = "A".charCodeAt(0);
	return String.fromCharCode(A + randInt(26));
}

function toMatrixIndex(idx) {
	return { r: Math.floor(idx / GRID), c: idx % GRID };
}
function toIndex(r, c) {
	return r * GRID + c;
}

function cleanWord(w) {
	return normalizar(String(w)).replace(/[^a-z]/g, "");
}

function chooseWords(all) {
	// Seleciona até 6 palavras 3..6 letras, normalizadas
	const pool = all.map(w => cleanWord(w)).filter(w => w.length >= 3 && w.length <= GRID);
	// fallback simples caso dataset não tenha suficientes
	const fallback = ["casa", "nota", "jogo", "rede", "dado", "code"];
	const selected = [];
	const used = new Set();
	// const source = pool.length < 6 ? pool : fallback;
	while (selected.length < NUM_WORDS) {
		const w = pickRandom(fallback);
		if (!used.has(w)) {
			used.add(w);
			selected.push(w);
		} else if (pool.length === 0 && fallback.length === 0) {
			break;
		}
	}
	return selected.slice(0, NUM_WORDS);
	// return [];
}

function placeWords(words) {
	// Tenta posicionar horizontal/verticalmente, permitindo cruzamentos compatíveis
	const grid = Array(GRID * GRID).fill(null);
	const placements = []; // { word, cells: number[] }

	function canPlaceAt(startR, startC, dr, dc, word) {
		if (dr !== 0 && dc !== 0) return false; // sem diagonal
		const cells = [];
		for (let i = 0; i < word.length; i++) {
			const r = startR + dr * i;
			const c = startC + dc * i;
			if (r < 0 || r >= GRID || c < 0 || c >= GRID) return false;
			const idx = toIndex(r, c);
			const existing = grid[idx];
			if (existing && existing !== word[i].toUpperCase()) return false; // conflito
			cells.push(idx);
		}
		return cells;
	}

	for (const w of words) {
		const W = w.toUpperCase();
		let placed = false;
		for (let attempt = 0; attempt < 200 && !placed; attempt++) {
			const dir = Math.random() < 0.5 ? "H" : "V";
			const dr = dir === "H" ? 0 : 1;
			const dc = dir === "H" ? 1 : 0;
			const maxR = dir === "H" ? GRID : GRID - W.length;
			const maxC = dir === "H" ? GRID - W.length : GRID;
			const r0 = Math.floor(Math.random() * maxR);
			const c0 = Math.floor(Math.random() * maxC);
			const cells = canPlaceAt(r0, c0, dr, dc, W);
			if (cells) {
				cells.forEach((idx, i) => {
					grid[idx] = W[i];
				});
				placements.push({ word: w, norm: w, cells });
				placed = true;
			}
		}
		if (!placed) {
			// fallback: coloca na primeira linha possível
			const dr = 0;
			const dc = 1;
			const r0 = placements.length % GRID;
			const c0 = 0;
			const cells = [];
			for (let i = 0; i < W.length && i < GRID; i++) {
				const idx = toIndex(r0, c0 + i);
				grid[idx] = W[i];
				cells.push(idx);
			}
			placements.push({ word: w, norm: w, cells });
		}
	}

	// Preenche vazios com letras aleatórias
	for (let i = 0; i < grid.length; i++) {
		if (!grid[i]) grid[i] = randLetter();
	}

	return { letters: grid, placements };
}

export default function useGame() {
	const [config, setConfigState] = useState(DEFAULT_CONFIG);
	const dataset = useMemo(() => items, []);
	// const listaDeImagens = useMemo(() => imagens, []);

	const buildInitialState = useCallback(() => {
		const chosen = chooseWords(dataset);
		const { letters, placements } = placeWords(chosen);
		return {
			secret: "caca-palavras-6x6",
			masked: `0/${NUM_WORDS} palavras`,
			usedInputs: [],
			score: 0,
			errors: 0,
			status: "idle",
			payload: {
				grid: letters, // Array(36) de letras maiúsculas
				placements, // lista de palavras e suas células
				found: Array(placements.length).fill(false),
				foundCells: Array(letters.length).fill(false),
				firstIndex: null,
				lock: false,
			},
		};
	}, [dataset]);

	const [state, setState] = useState(() => buildInitialState());

	const start = useCallback(() => {
		setState(prev => ({ ...prev, status: "playing" }));
	}, []);

	const reset = useCallback(() => {
		setState(buildInitialState());
		start();
	}, [buildInitialState, start]);

	function computePath(a, b) {
		const A = toMatrixIndex(a);
		const B = toMatrixIndex(b);
		if (A.r === B.r) {
			const c1 = Math.min(A.c, B.c),
				c2 = Math.max(A.c, B.c);
			const cells = [];
			for (let c = c1; c <= c2; c++) cells.push(toIndex(A.r, c));
			return cells;
		}
		if (A.c === B.c) {
			const r1 = Math.min(A.r, B.r),
				r2 = Math.max(A.r, B.r);
			const cells = [];
			for (let r = r1; r <= r2; r++) cells.push(toIndex(r, A.c));
			return cells;
		}
		return null; // não é linha/coluna reta
	}

	const atualizarMaskedEScore = (foundArr, errors) => {
		const count = foundArr.filter(Boolean).length;
		const masked = `${count}/${NUM_WORDS} palavras`;
		const score = Math.max(0, count * 10 - errors * 1);
		return { masked, score };
	};

	const guess = useCallback(
		raw => {
			if (state.status !== "playing") return;
			const idx = typeof raw === "number" ? raw : parseInt(String(raw), 10);
			if (Number.isNaN(idx)) return;

			const payload = state.payload || {};
			const { firstIndex } = payload;
			if (payload.lock) return;

			if (firstIndex === null) {
				setState(prev => ({ ...prev, payload: { ...prev.payload, firstIndex: idx } }));
				return;
			}

			// Temos início e fim: calcula caminho
			const path = computePath(firstIndex, idx);
			if (!path) {
				// seleção inválida
				const errors = state.errors + 1;
				const { masked, score } = atualizarMaskedEScore(payload.found, errors);
				setState(prev => ({
					...prev,
					errors,
					masked,
					score,
					payload: { ...prev.payload, firstIndex: null },
				}));
				return;
			}

			const str = path.map(i => payload.grid[i]).join(""); // maiúsculas
			const norm = normalizar(str).toLowerCase();
			const normRev = normalizar(str.split("").reverse().join("")).toLowerCase();

			// Procura palavra que case exatamente com o trecho
			let foundIndex = -1;
			for (let i = 0; i < payload.placements.length; i++) {
				if (payload.found[i]) continue;
				const target = cleanWord(payload.placements[i].word).toLowerCase();
				if (target === norm || target === normRev) {
					foundIndex = i;
					break;
				}
			}

			if (foundIndex >= 0) {
				// Marca palavra como encontrada e pinta células
				const found = payload.found.slice();
				found[foundIndex] = true;
				const foundCells = payload.foundCells.slice();
				path.forEach(p => {
					foundCells[p] = true;
				});
				const { masked, score } = atualizarMaskedEScore(found, state.errors);

				let status = state.status;
				if (found.every(Boolean)) status = "won";

				setState(prev => ({
					...prev,
					masked,
					score,
					status,
					payload: { ...prev.payload, found, foundCells, firstIndex: null },
				}));
				return;
			}
			// Não encontrou
			const errors = state.errors + 1;
			const { masked, score } = atualizarMaskedEScore(payload.found, errors);
			setState(prev => ({
				...prev,
				errors,
				masked,
				score,
				payload: { ...prev.payload, firstIndex: null },
			}));
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
