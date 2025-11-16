import { writable, derived, get } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import { generateBracket, advanceBracket, isTournamentComplete, getTournamentWinner, type Bracket } from '$lib/bracket-generator';

export interface Participant {
	id: string;
	name: string;
	avatar: string;
	isAdmin: boolean;
	isConnected: boolean;
}

export interface Pair {
	id: string;
	participant1: string;
	participant2: string | null;
	winner: string | null;
	isActive: boolean;
}

export interface RoomState {
	code: string;
	maxParticipants: number;
	participants: Participant[];
	adminId: string;
	pairs: Pair[];
	bracket: Bracket | null;
	tournamentStarted: boolean;
	tournamentFinished: boolean;
	currentPairIndex: number;
}

interface SupabaseState {
	connected: boolean;
	clientId: string | null;
	room: RoomState | null;
	error: string | null;
	lastWinner: { participantId: string; pairId: string } | null;
}

function createSupabaseStore() {
	const savedClientId = typeof window !== 'undefined' ? localStorage.getItem('pvp_client_id') : null;

	const initialState: SupabaseState = {
		connected: false,
		clientId: savedClientId || (typeof window !== 'undefined' ? crypto.randomUUID() : null),
		room: null,
		error: null,
		lastWinner: null
	};

	const store: Writable<SupabaseState> = writable(initialState);
	let pollingInterval: ReturnType<typeof setInterval> | null = null;
	let consecutiveErrors = 0;
	let lastHeartbeat = Date.now();
	const MAX_ERRORS = 5;
	const HEARTBEAT_INTERVAL = 30000; // 30 segundos

	// Guardar clientId
	if (typeof window !== 'undefined' && !savedClientId && initialState.clientId) {
		localStorage.setItem('pvp_client_id', initialState.clientId);
	}

	async function createRoom(maxParticipants: number, name: string, avatar: string) {
		try {
			const clientId = initialState.clientId!;
			const roomCode = generateRoomCode();
			
			const { data, error } = await supabase
				.from('rooms')
				.insert({
					code: roomCode,
					max_participants: maxParticipants,
					admin_id: clientId,
					participants: [{
						id: clientId,
						name,
						avatar,
						isAdmin: true,
						isConnected: true
					}],
					pairs: [],
					tournament_started: false,
					tournament_finished: false,
					current_pair_index: 0
				})
				.select()
				.single();

			if (error) {
				console.error('Error creating room:', error);
				store.update(s => ({ ...s, error: 'No se pudo crear la sala. Intenta de nuevo.' }));
				return;
			}

			if (typeof window !== 'undefined') {
				localStorage.setItem('pvp_room_code', roomCode);
			}
			subscribeToRoom(roomCode);
		} catch (err) {
			console.error('Network error creating room:', err);
			store.update(s => ({ ...s, error: 'Error de conexión. Verifica tu internet.' }));
		}
	}

	async function joinRoom(code: string, name: string, avatar: string) {
		try {
			const clientId = initialState.clientId!;
			
			const { data: room, error } = await supabase
				.from('rooms')
				.select('*')
				.eq('code', code)
				.single();

			if (error || !room) {
				store.update(s => ({ ...s, error: 'Sala no encontrada' }));
				return;
			}

			// Verificar si ya está llena
			if (room.participants.length >= room.max_participants) {
				store.update(s => ({ ...s, error: 'La sala está llena' }));
				return;
			}

			// Verificar si el usuario ya está en la sala
			const alreadyJoined = room.participants.some((p: Participant) => p.id === clientId);
			if (alreadyJoined) {
				// Solo reconectar
				if (typeof window !== 'undefined') {
					localStorage.setItem('pvp_room_code', code);
				}
				subscribeToRoom(code);
				return;
			}

			const participants = [...room.participants, {
				id: clientId,
				name,
				avatar,
				isAdmin: false,
				isConnected: true
			}];

			const { error: updateError } = await supabase
				.from('rooms')
				.update({ participants })
				.eq('code', code);

			if (updateError) {
				console.error('Error joining room:', updateError);
				store.update(s => ({ ...s, error: 'No se pudo unir a la sala. Intenta de nuevo.' }));
				return;
			}

			if (typeof window !== 'undefined') {
				localStorage.setItem('pvp_room_code', code);
			}
			subscribeToRoom(code);
		} catch (err) {
			console.error('Network error joining room:', err);
			store.update(s => ({ ...s, error: 'Error de conexión. Verifica tu internet.' }));
		}
	}

	async function fetchRoomData(roomCode: string) {
		try {
			const { data: room, error } = await supabase
				.from('rooms')
				.select('*')
				.eq('code', roomCode)
				.single();

			if (error || !room) {
				consecutiveErrors++;
				if (consecutiveErrors >= MAX_ERRORS) {
					store.update(s => ({ ...s, error: 'Conexión perdida. Recarga la página.' }));
					leaveRoom();
				}
				return;
			}

			// Reset error counter on success
			consecutiveErrors = 0;

			store.update(s => ({
				...s,
				connected: true,
				error: null,
				room: {
					code: room.code,
					maxParticipants: room.max_participants,
					participants: room.participants,
					adminId: room.admin_id,
					pairs: room.pairs,
					bracket: room.bracket || null,
					tournamentStarted: room.tournament_started,
					tournamentFinished: room.tournament_finished,
					currentPairIndex: room.current_pair_index
				}
			}));
		} catch (err) {
			consecutiveErrors++;
			console.error('Error fetching room:', err);
			if (consecutiveErrors >= MAX_ERRORS) {
				store.update(s => ({ ...s, error: 'Error de conexión. Verifica tu internet.' }));
				leaveRoom();
			}
		}
	}

	function subscribeToRoom(roomCode: string) {
		// Limpiar polling anterior si existe
		if (pollingInterval) {
			clearInterval(pollingInterval);
		}

		// Reset error counter
		consecutiveErrors = 0;
		lastHeartbeat = Date.now();

		// Fetch inicial
		fetchRoomData(roomCode);

		// Polling cada 3 segundos (reducido para menos carga)
		pollingInterval = setInterval(async () => {
			await fetchRoomData(roomCode);
			
			// Heartbeat: actualizar isConnected cada 30s
			if (Date.now() - lastHeartbeat > HEARTBEAT_INTERVAL) {
				lastHeartbeat = Date.now();
				await updateHeartbeat(roomCode);
			}
		}, 3000);

		store.update(s => ({ ...s, connected: true }));
	}

	async function updateHeartbeat(roomCode: string) {
		try {
			const clientId = initialState.clientId;
			if (!clientId) return;

			const { data: room } = await supabase
				.from('rooms')
				.select('participants')
				.eq('code', roomCode)
				.single();

			if (!room) return;

			// Marcar usuario como conectado
			const participants = room.participants.map((p: Participant) => 
				p.id === clientId ? { ...p, isConnected: true } : p
			);

			await supabase
				.from('rooms')
				.update({ participants })
				.eq('code', roomCode);
		} catch (err) {
			console.error('Heartbeat error:', err);
		}
	}

	async function leaveRoom() {
		if (pollingInterval) {
			clearInterval(pollingInterval);
			pollingInterval = null;
		}
		if (typeof window !== 'undefined') {
			localStorage.removeItem('pvp_room_code');
		}
		store.update(s => ({ ...s, room: null, connected: false }));
	}

	async function organizePairs(
		roomCode: string, 
		mode: '1v1' | '4-players' = '1v1',
		doubleMatchForBye: boolean = false
	) {
		const { data: room } = await supabase
			.from('rooms')
			.select('*')
			.eq('code', roomCode)
			.single();

		if (!room) return;

		// Generar bracket profesional con el modo seleccionado
		const bracket = generateBracket(room.participants, mode, doubleMatchForBye);

		await supabase
			.from('rooms')
			.update({ bracket })
			.eq('code', roomCode);
	}

	async function shufflePairs(roomCode: string) {
		const { data: room } = await supabase
			.from('rooms')
			.select('*')
			.eq('code', roomCode)
			.single();

		if (!room || room.tournament_started) return;

		// Regenerar bracket con nuevo orden (mantener el mismo modo y opciones)
		const currentMode = room.bracket?.mode || '1v1';
		const doubleMatchForBye = room.bracket?.doubleMatchForBye || false;
		const bracket = generateBracket(room.participants, currentMode, doubleMatchForBye);

		await supabase
			.from('rooms')
			.update({ bracket })
			.eq('code', roomCode);
	}

	async function startTournament(roomCode: string) {
		const { data: room } = await supabase
			.from('rooms')
			.select('*')
			.eq('code', roomCode)
			.single();

		if (!room) return;

		// Verificar si hay bracket (nuevo sistema) o pairs (legacy)
		const hasBracket = room.bracket && room.bracket.rounds && room.bracket.rounds.length > 0;
		const hasPairs = room.pairs && room.pairs.length > 0;

		if (!hasBracket && !hasPairs) return;

		if (hasPairs && !hasBracket) {
			// Sistema legacy
			const pairs = room.pairs.map((p: any, i: number) => ({
				...p,
				isActive: i === 0
			}));

			await supabase
				.from('rooms')
				.update({ 
					tournament_started: true,
					pairs,
					current_pair_index: 0
				})
				.eq('code', roomCode);
		} else {
			// Sistema bracket moderno
			await supabase
				.from('rooms')
				.update({ 
					tournament_started: true
				})
				.eq('code', roomCode);
		}
	}

	async function markWinner(roomCode: string, pairId: string, winnerId: string) {
		const { data: room } = await supabase
			.from('rooms')
			.select('*')
			.eq('code', roomCode)
			.single();

		if (!room) return;

		// Si hay bracket, usar el sistema profesional
		if (room.bracket && room.bracket.rounds) {
			const newBracket = advanceBracket(room.bracket, pairId, winnerId);
			const tournamentFinished = isTournamentComplete(newBracket);

			await supabase
				.from('rooms')
				.update({ 
					bracket: newBracket,
					tournament_finished: tournamentFinished
				})
				.eq('code', roomCode);

			// Mostrar animación
			store.update(s => ({
				...s,
				lastWinner: { participantId: winnerId, pairId }
			}));

			setTimeout(() => {
				store.update(s => ({ ...s, lastWinner: null }));
			}, 3000);

			return;
		}

		// Sistema legacy (pairs)
		const pairs = room.pairs.map((p: any) => {
			if (p.id === pairId) {
				return { ...p, winner: winnerId, isActive: false };
			}
			return p;
		});

		const nextIndex = room.current_pair_index + 1;
		const tournamentFinished = nextIndex >= pairs.length;

		if (!tournamentFinished && pairs[nextIndex]) {
			pairs[nextIndex].isActive = true;
		}

		await supabase
			.from('rooms')
			.update({ 
				pairs,
				current_pair_index: nextIndex,
				tournament_finished: tournamentFinished
			})
			.eq('code', roomCode);

		// Mostrar animación solo si no la hemos mostrado para este par
		const currentState = get(store);
		if (currentState.lastWinner?.pairId !== pairId) {
			store.update(s => ({
				...s,
				lastWinner: { participantId: winnerId, pairId }
			}));

			setTimeout(() => {
				store.update(s => ({ ...s, lastWinner: null }));
			}, 3000);
		}
	}

	async function resetTournament(code: string) {
		await supabase
			.from('rooms')
			.update({
				pairs: [],
				bracket: { rounds: [] },
				tournament_started: false,
				tournament_finished: false,
				current_pair_index: 0,
				current_round: 0
			})
			.eq('code', code);
	}

	function generateRoomCode(): string {
		const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
		let code = '';
		for (let i = 0; i < 6; i++) {
			code += chars[Math.floor(Math.random() * chars.length)];
		}
		return code;
	}

	function shuffleArray<T>(array: T[]): T[] {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	return {
		subscribe: store.subscribe,
		createRoom,
		joinRoom,
		leaveRoom,
		organizePairs,
		shufflePairs,
		startTournament,
		markWinner,
		resetTournament,
		clearError: () => store.update(s => ({ ...s, error: null }))
	};
}

export const wsStore = createSupabaseStore();

export const currentUser = derived(wsStore, $ws => {
	if (!$ws.room || !$ws.clientId) return null;
	return $ws.room.participants.find(p => p.id === $ws.clientId) || null;
});

export const isAdmin = derived(wsStore, $ws => {
	if (!$ws.room || !$ws.clientId) return false;
	return $ws.room.adminId === $ws.clientId;
});

export const activePair = derived(wsStore, $ws => {
	if (!$ws.room) return null;
	return $ws.room.pairs.find(p => p.isActive) || null;
});

export const winner = derived(wsStore, $ws => {
	if (!$ws.room || !$ws.room.tournamentFinished) return null;
	
	// Intentar obtener ganador del bracket profesional primero
	if ($ws.room.bracket && $ws.room.bracket.rounds.length > 0) {
		const winnerId = getTournamentWinner($ws.room.bracket);
		if (winnerId) {
			return $ws.room.participants.find(p => p.id === winnerId) || null;
		}
	}
	
	// Fallback al sistema antiguo de pairs
	const lastPair = $ws.room.pairs[$ws.room.pairs.length - 1];
	if (!lastPair?.winner) return null;
	return $ws.room.participants.find(p => p.id === lastPair.winner) || null;
});
