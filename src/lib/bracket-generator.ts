/**
 * Sistema profesional de generación de brackets de eliminación simple
 * Implementa algoritmo estándar de torneos deportivos
 */

export type TournamentMode = '1v1' | '4-players';

export interface Participant {
	id: string;
	name: string;
	avatar: string;
	isAdmin: boolean;
	isConnected: boolean;
}

export interface Match {
	id: string;
	participant1: string | null; // null = BYE
	participant2: string | null;
	participant3?: string | null; // Para modo 4 jugadores
	participant4?: string | null; // Para modo 4 jugadores
	winner: string | null;
	isActive: boolean;
	matchNumber: number; // Número de partido dentro de la ronda
}

export interface Round {
	roundNumber: number; // 1 = Primera ronda, 2 = Semifinales, etc.
	roundName: string; // "Primera Ronda", "Semifinales", "Final"
	matches: Match[];
	isComplete: boolean;
}

export interface Bracket {
	rounds: Round[];
	totalParticipants: number;
	currentRound: number;
	currentMatch: number;
	mode: TournamentMode;
	doubleMatchForBye?: boolean; // Nueva opción: si el BYE juega 2 veces
}

/**
 * Obtiene el nombre de la ronda según el número de participantes
 */
function getRoundName(roundNumber: number, totalRounds: number): string {
	const roundsFromEnd = totalRounds - roundNumber;
	
	if (roundsFromEnd === 0) return 'Final';
	if (roundsFromEnd === 1) return 'Semifinales';
	if (roundsFromEnd === 2) return 'Cuartos de Final';
	if (roundsFromEnd === 3) return 'Octavos de Final';
	
	return `Ronda ${roundNumber}`;
}

/**
 * Genera un bracket completo de eliminación simple
 * Modo 1v1: cada match es 1 vs 1, si hay número impar, uno recibe BYE (pasa automáticamente)
 * Modo 4-players: cada match es 4 jugadores, solo 1 pasa a la siguiente ronda
 */
export function generateBracket(
	participants: Participant[], 
	mode: TournamentMode = '1v1',
	doubleMatchForBye: boolean = false
): Bracket {
	if (mode === '1v1') {
		return generate1v1Bracket(participants, doubleMatchForBye);
	} else {
		return generate4PlayersBracket(participants);
	}
}

/**
 * Genera bracket 1v1 tradicional
 * Si hay número impar de participantes, uno recibe BYE automático
 * Si doubleMatchForBye = true, el que queda sin pareja juega 2 veces contra random
 */
function generate1v1Bracket(participants: Participant[], doubleMatchForBye: boolean = false): Bracket {
	const participantCount = participants.length;
	
	if (participantCount < 2) {
		throw new Error('Se necesitan al menos 2 participantes para crear un bracket');
	}

	// Mezclar participantes aleatoriamente
	const shuffled = [...participants].sort(() => Math.random() - 0.5);

	// Crear primera ronda: emparejar de 2 en 2
	const firstRoundMatches: Match[] = [];
	let matchCounter = 1;
	let i = 0;
	let byePlayer: Participant | null = null;

	while (i < shuffled.length) {
		const p1 = shuffled[i];
		const p2 = shuffled[i + 1] || null; // Si es impar, p2 es null (BYE)

		// Si doubleMatchForBye está activo y es impar
		if (!p2 && doubleMatchForBye && shuffled.length > 1) {
			// El jugador sin pareja jugará 2 veces
			byePlayer = p1;
			i += 1;
			continue; // No crear match todavía
		}

		const match: Match = {
			id: crypto.randomUUID(),
			participant1: p1.id,
			participant2: p2?.id || null,
			winner: null,
			isActive: false,
			matchNumber: matchCounter++
		};

		// Si hay BYE (solo 1 participante) y NO está activa la opción de doble pelea
		if (!p2 && !doubleMatchForBye) {
			match.winner = p1.id;
		}

		firstRoundMatches.push(match);
		i += 2; // Avanzar de 2 en 2
	}

	// Si hay byePlayer (modo doble pelea), crear 2 matches para él
	if (byePlayer && firstRoundMatches.length >= 1) {
		// Seleccionar 2 oponentes al azar de los que ya están en peleas
		const availableOpponents = shuffled.filter(p => p.id !== byePlayer.id);
		
		// Mezclar y tomar 2
		const randomOpponents = availableOpponents.sort(() => Math.random() - 0.5).slice(0, 2);
		
		// Crear 2 matches para el byePlayer
		for (const opponent of randomOpponents) {
			const match: Match = {
				id: crypto.randomUUID(),
				participant1: byePlayer.id,
				participant2: opponent.id,
				winner: null,
				isActive: false,
				matchNumber: matchCounter++
			};
			firstRoundMatches.push(match);
		}
	}

	// Activar el primer match que no tenga ganador automático
	const firstActiveMatch = firstRoundMatches.find(m => !m.winner);
	if (firstActiveMatch) {
		firstActiveMatch.isActive = true;
	}

	// Calcular número total de rondas
	const totalRounds = Math.ceil(Math.log2(participantCount));

	// Crear todas las rondas
	const rounds: Round[] = [];
	
	for (let r = 1; r <= totalRounds; r++) {
		const matchesInPreviousRound = r === 1 ? firstRoundMatches.length : rounds[r - 2].matches.length;
		const matchesInThisRound = Math.ceil(matchesInPreviousRound / 2);
		
		const matches: Match[] = r === 1 ? firstRoundMatches : [];

		// Para rondas posteriores, crear matches vacíos
		if (r > 1) {
			for (let m = 0; m < matchesInThisRound; m++) {
				matches.push({
					id: crypto.randomUUID(),
					participant1: null,
					participant2: null,
					winner: null,
					isActive: false,
					matchNumber: m + 1
				});
			}
		}

		rounds.push({
			roundNumber: r,
			roundName: getRoundName(r, totalRounds),
			matches,
			isComplete: r === 1 && matches.every(m => m.winner !== null)
		});
	}

	return {
		rounds,
		totalParticipants: participantCount,
		currentRound: 0,
		currentMatch: 0,
		mode: '1v1',
		doubleMatchForBye: doubleMatchForBye
	};
}

/**
 * Genera bracket estilo Mario Kart: 4 jugadores por match, solo 1 pasa
 */
function generate4PlayersBracket(participants: Participant[]): Bracket {
	const participantCount = participants.length;
	
	if (participantCount < 2) {
		throw new Error('Se necesitan al menos 2 participantes para crear un bracket');
	}

	// Mezclar participantes
	const shuffled = [...participants].sort(() => Math.random() - 0.5);

	// Crear primera ronda: grupos de 4
	const firstRoundMatches: Match[] = [];
	let matchCounter = 1;
	let i = 0;

	while (i < shuffled.length) {
		const p1 = shuffled[i];
		const p2 = shuffled[i + 1] || null;
		const p3 = shuffled[i + 2] || null;
		const p4 = shuffled[i + 3] || null;

		// Determinar cuántos jugadores reales hay
		const realPlayers = [p1, p2, p3, p4].filter(p => p !== null);

		const match: Match = {
			id: crypto.randomUUID(),
			participant1: p1.id,
			participant2: p2?.id || null,
			participant3: p3?.id || null,
			participant4: p4?.id || null,
			winner: null,
			isActive: false,
			matchNumber: matchCounter++
		};

		// Si solo hay 1 jugador, pasa automáticamente (BYE)
		if (realPlayers.length === 1) {
			match.winner = p1.id;
		}

		firstRoundMatches.push(match);
		i += 4; // Avanzar de 4 en 4
	}

	// Activar el primer match que no tenga ganador automático
	const firstActiveMatch = firstRoundMatches.find(m => !m.winner);
	if (firstActiveMatch) {
		firstActiveMatch.isActive = true;
	}

	// Calcular número de rondas (cada ronda divide por 4 el número de participantes)
	let currentParticipants = participantCount;
	let roundCount = 0;
	while (currentParticipants > 1) {
		currentParticipants = Math.ceil(currentParticipants / 4);
		roundCount++;
	}

	// Crear todas las rondas
	const rounds: Round[] = [];
	
	for (let r = 1; r <= roundCount; r++) {
		const matchesInPreviousRound = r === 1 ? firstRoundMatches.length : rounds[r - 2].matches.length;
		const winnersFromPrevious = matchesInPreviousRound; // Un ganador por match
		const matchesInThisRound = Math.ceil(winnersFromPrevious / 4);
		
		const matches: Match[] = r === 1 ? firstRoundMatches : [];

		// Para rondas posteriores, crear matches vacíos
		if (r > 1) {
			for (let m = 0; m < matchesInThisRound; m++) {
				matches.push({
					id: crypto.randomUUID(),
					participant1: null,
					participant2: null,
					participant3: null,
					participant4: null,
					winner: null,
					isActive: false,
					matchNumber: m + 1
				});
			}
		}

		rounds.push({
			roundNumber: r,
			roundName: getRoundName(r, roundCount),
			matches,
			isComplete: r === 1 && matches.every(m => m.winner !== null)
		});
	}

	return {
		rounds,
		totalParticipants: participantCount,
		currentRound: 0,
		currentMatch: 0,
		mode: '4-players'
	};
}

/**
 * Avanza el bracket cuando se marca un ganador
 * Funciona para ambos modos: 1v1 y 4-players
 */
export function advanceBracket(bracket: Bracket, matchId: string, winnerId: string): Bracket {
	const newBracket = JSON.parse(JSON.stringify(bracket)); // Deep clone
	
	let matchFound = false;
	let currentRoundIndex = -1;
	let currentMatchIndex = -1;

	// Encontrar el match y marcarlo con el ganador
	for (let r = 0; r < newBracket.rounds.length; r++) {
		const round = newBracket.rounds[r];
		const matchIndex = round.matches.findIndex((m: Match) => m.id === matchId);
		
		if (matchIndex !== -1) {
			round.matches[matchIndex].winner = winnerId;
			round.matches[matchIndex].isActive = false;
			matchFound = true;
			currentRoundIndex = r;
			currentMatchIndex = matchIndex;
			break;
		}
	}

	if (!matchFound) return bracket;

	const currentRound = newBracket.rounds[currentRoundIndex];
	
	// Verificar si todos los matches de esta ronda están completos
	const allMatchesComplete = currentRound.matches.every((m: Match) => m.winner !== null);
	
	if (allMatchesComplete) {
		currentRound.isComplete = true;

		// Si no es la última ronda, poblar la siguiente ronda con los ganadores
		if (currentRoundIndex < newBracket.rounds.length - 1) {
			const nextRound = newBracket.rounds[currentRoundIndex + 1];
			const winners = currentRound.matches.map((m: Match) => m.winner).filter((w: string | null) => w !== null);

			if (newBracket.mode === '1v1') {
				// Modo 1v1: emparejar ganadores de 2 en 2
				for (let i = 0; i < winners.length; i += 2) {
					const nextMatchIndex = Math.floor(i / 2);
					if (nextRound.matches[nextMatchIndex]) {
						nextRound.matches[nextMatchIndex].participant1 = winners[i];
						nextRound.matches[nextMatchIndex].participant2 = winners[i + 1] || null;
						
						// Si solo hay 1 participante (BYE), gana automáticamente
						if (!winners[i + 1]) {
							nextRound.matches[nextMatchIndex].winner = winners[i];
						}
					}
				}
			} else {
				// Modo 4-players: emparejar ganadores de 4 en 4
				for (let i = 0; i < winners.length; i += 4) {
					const nextMatchIndex = Math.floor(i / 4);
					if (nextRound.matches[nextMatchIndex]) {
						nextRound.matches[nextMatchIndex].participant1 = winners[i] || null;
						nextRound.matches[nextMatchIndex].participant2 = winners[i + 1] || null;
						nextRound.matches[nextMatchIndex].participant3 = winners[i + 2] || null;
						nextRound.matches[nextMatchIndex].participant4 = winners[i + 3] || null;
						
						// Si solo hay 1 participante (BYE), gana automáticamente
						const realPlayers = [winners[i], winners[i + 1], winners[i + 2], winners[i + 3]].filter(p => p !== null);
						if (realPlayers.length === 1) {
							nextRound.matches[nextMatchIndex].winner = winners[i];
						}
					}
				}
			}

			// Activar el primer match sin ganador de la siguiente ronda
			const nextActiveMatch = nextRound.matches.find((m: Match) => !m.winner && m.participant1 !== null);
			if (nextActiveMatch) {
				nextActiveMatch.isActive = true;
				newBracket.currentRound = currentRoundIndex + 1;
				newBracket.currentMatch = nextRound.matches.indexOf(nextActiveMatch);
			}
		}
	} else {
		// Activar el siguiente match en la ronda actual
		const nextMatch = currentRound.matches.find((m: Match) => !m.winner && !m.isActive && m.participant1 !== null);
		if (nextMatch) {
			nextMatch.isActive = true;
			newBracket.currentMatch = currentRound.matches.indexOf(nextMatch);
		}
	}

	return newBracket;
}

/**
 * Verifica si el torneo está completo
 */
export function isTournamentComplete(bracket: Bracket): boolean {
	const finalRound = bracket.rounds[bracket.rounds.length - 1];
	return finalRound.isComplete && finalRound.matches[0]?.winner !== null;
}

/**
 * Obtiene el ganador del torneo
 */
export function getTournamentWinner(bracket: Bracket): string | null {
	if (!isTournamentComplete(bracket)) return null;
	const finalRound = bracket.rounds[bracket.rounds.length - 1];
	return finalRound.matches[0]?.winner || null;
}
