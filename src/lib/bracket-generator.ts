/**
 * Sistema profesional de generación de brackets de eliminación simple
 * Implementa algoritmo estándar de torneos deportivos
 */

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
}

/**
 * Calcula la siguiente potencia de 2 mayor o igual al número dado
 */
function nextPowerOf2(n: number): number {
	return Math.pow(2, Math.ceil(Math.log2(n)));
}

/**
 * Calcula cuántos BYEs se necesitan
 */
function calculateByes(participantCount: number): number {
	const bracketSize = nextPowerOf2(participantCount);
	return bracketSize - participantCount;
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
 * Usa el algoritmo estándar de "seeding" para distribuir BYEs equitativamente
 */
export function generateBracket(participants: Participant[]): Bracket {
	const participantCount = participants.length;
	
	if (participantCount < 2) {
		throw new Error('Se necesitan al menos 2 participantes para crear un bracket');
	}

	const bracketSize = nextPowerOf2(participantCount);
	const byeCount = calculateByes(participantCount);
	const totalRounds = Math.log2(bracketSize);

	// Algoritmo de seeding estándar: participantes con mejores "seeds" enfrentan BYEs
	// Mezclamos aleatoriamente los participantes
	const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
	
	// Creamos array con participantes + BYEs
	const seeds: (Participant | null)[] = [...shuffledParticipants];
	
	// Agregamos BYEs al final
	for (let i = 0; i < byeCount; i++) {
		seeds.push(null);
	}

	// Distribuir BYEs de manera equitativa (algoritmo estándar de brackets)
	// Los BYEs se colocan en posiciones específicas para balance
	const firstRoundSeeds: (Participant | null)[] = [];
	const half = bracketSize / 2;
	
	for (let i = 0; i < half; i++) {
		firstRoundSeeds.push(seeds[i]);
		firstRoundSeeds.push(seeds[bracketSize - 1 - i]);
	}

	// Crear primera ronda con los emparejamientos
	const firstRoundMatches: Match[] = [];
	let matchCounter = 1;

	for (let i = 0; i < firstRoundSeeds.length; i += 2) {
		const p1 = firstRoundSeeds[i];
		const p2 = firstRoundSeeds[i + 1];

		const match: Match = {
			id: crypto.randomUUID(),
			participant1: p1?.id || null,
			participant2: p2?.id || null,
			winner: null,
			isActive: false,
			matchNumber: matchCounter++
		};

		// Si hay un BYE, el ganador es automático
		if (!p1 && p2) {
			match.winner = p2.id;
		} else if (p1 && !p2) {
			match.winner = p1.id;
		}

		firstRoundMatches.push(match);
	}

	// Activar el primer partido que no tenga ganador automático
	const firstActiveMatch = firstRoundMatches.find(m => !m.winner);
	if (firstActiveMatch) {
		firstActiveMatch.isActive = true;
	}

	// Crear todas las rondas (vacías excepto la primera)
	const rounds: Round[] = [];
	
	for (let r = 1; r <= totalRounds; r++) {
		const matchesInRound = bracketSize / Math.pow(2, r);
		const matches: Match[] = r === 1 ? firstRoundMatches : [];

		// Para rondas posteriores, crear matches vacíos (se llenarán con ganadores)
		if (r > 1) {
			for (let m = 0; m < matchesInRound; m++) {
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
			isComplete: false
		});
	}

	// Marcar rondas con solo BYEs como completas
	rounds.forEach(round => {
		const allMatchesHaveWinners = round.matches.every(m => m.winner !== null);
		if (allMatchesHaveWinners) {
			round.isComplete = true;
		}
	});

	return {
		rounds,
		totalParticipants: participantCount,
		currentRound: 0, // Primera ronda (0-indexed)
		currentMatch: 0
	};
}

/**
 * Avanza el bracket cuando se marca un ganador
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
			const winners = currentRound.matches.map((m: Match) => m.winner);

			// Emparejar ganadores en la siguiente ronda
			for (let i = 0; i < winners.length; i += 2) {
				const nextMatchIndex = Math.floor(i / 2);
				if (nextRound.matches[nextMatchIndex]) {
					nextRound.matches[nextMatchIndex].participant1 = winners[i];
					nextRound.matches[nextMatchIndex].participant2 = winners[i + 1] || null;
				}
			}

			// Activar el primer match de la siguiente ronda
			if (nextRound.matches[0]) {
				nextRound.matches[0].isActive = true;
				newBracket.currentRound = currentRoundIndex + 1;
				newBracket.currentMatch = 0;
			}
		}
	} else {
		// Activar el siguiente match en la ronda actual
		const nextMatch = currentRound.matches.find((m: Match) => !m.winner && !m.isActive);
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
