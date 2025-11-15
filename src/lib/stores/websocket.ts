import { writable, derived } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { supabase } from '$lib/supabase';

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

	// Guardar clientId
	if (typeof window !== 'undefined' && !savedClientId && initialState.clientId) {
		localStorage.setItem('pvp_client_id', initialState.clientId);
	}

	async function createRoom(maxParticipants: number, name: string, avatar: string) {
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
			store.update(s => ({ ...s, error: error.message }));
			return;
		}

		if (typeof window !== 'undefined') {
			localStorage.setItem('pvp_room_code', roomCode);
		}
		subscribeToRoom(roomCode);
	}

	async function joinRoom(code: string, name: string, avatar: string) {
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

		const participants = [...room.participants, {
			id: clientId,
			name,
			avatar,
			isAdmin: false,
			isConnected: true
		}];

		await supabase
			.from('rooms')
			.update({ participants })
			.eq('code', code);

		if (typeof window !== 'undefined') {
			localStorage.setItem('pvp_room_code', code);
		}
		subscribeToRoom(code);
	}

	async function fetchRoomData(roomCode: string) {
		const { data: room, error } = await supabase
			.from('rooms')
			.select('*')
			.eq('code', roomCode)
			.single();

		if (error || !room) {
			console.warn('Sala no encontrada:', roomCode);
			return;
		}

		store.update(s => ({
			...s,
			connected: true,
			room: {
				code: room.code,
				maxParticipants: room.max_participants,
				participants: room.participants,
				adminId: room.admin_id,
				pairs: room.pairs,
				tournamentStarted: room.tournament_started,
				tournamentFinished: room.tournament_finished,
				currentPairIndex: room.current_pair_index
			}
		}));
	}

	function subscribeToRoom(roomCode: string) {
		// Limpiar polling anterior si existe
		if (pollingInterval) {
			clearInterval(pollingInterval);
		}

		// Fetch inicial
		fetchRoomData(roomCode);

		// Polling cada 2 segundos
		pollingInterval = setInterval(() => {
			fetchRoomData(roomCode);
		}, 2000);

		store.update(s => ({ ...s, connected: true }));
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

	async function organizePairs(roomCode: string) {
		const { data: room } = await supabase
			.from('rooms')
			.select('*')
			.eq('code', roomCode)
			.single();

		if (!room) return;

		const participants = [...room.participants];
		const shuffled = shuffleArray(participants);
		const pairs = [];

		for (let i = 0; i < shuffled.length; i += 2) {
			pairs.push({
				id: crypto.randomUUID(),
				participant1: shuffled[i].id,
				participant2: shuffled[i + 1]?.id || null,
				winner: null,
				isActive: false
			});
		}

		await supabase
			.from('rooms')
			.update({ pairs })
			.eq('code', roomCode);
	}

	async function shufflePairs(roomCode: string) {
		const { data: room } = await supabase
			.from('rooms')
			.select('*')
			.eq('code', roomCode)
			.single();

		if (!room || room.tournament_started) return;

		const participants = [...room.participants];
		const shuffled = shuffleArray(participants);
		const pairs = [];

		for (let i = 0; i < shuffled.length; i += 2) {
			pairs.push({
				id: crypto.randomUUID(),
				participant1: shuffled[i].id,
				participant2: shuffled[i + 1]?.id || null,
				winner: null,
				isActive: false
			});
		}

		await supabase
			.from('rooms')
			.update({ pairs })
			.eq('code', roomCode);
	}

	async function startTournament(roomCode: string) {
		const { data: room } = await supabase
			.from('rooms')
			.select('*')
			.eq('code', roomCode)
			.single();

		if (!room || room.pairs.length === 0) return;

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
	}

	async function markWinner(roomCode: string, pairId: string, winnerId: string) {
		const { data: room } = await supabase
			.from('rooms')
			.select('*')
			.eq('code', roomCode)
			.single();

		if (!room) return;

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

		store.update(s => ({
			...s,
			lastWinner: { participantId: winnerId, pairId }
		}));

		setTimeout(() => {
			store.update(s => ({ ...s, lastWinner: null }));
		}, 3000);
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
		markWinner
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
	const lastPair = $ws.room.pairs[$ws.room.pairs.length - 1];
	if (!lastPair?.winner) return null;
	return $ws.room.participants.find(p => p.id === lastPair.winner) || null;
});
