import { writable, derived, get } from 'svelte/store';
import type { Writable } from 'svelte/store';

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

interface WebSocketState {
	connected: boolean;
	clientId: string | null;
	room: RoomState | null;
	error: string | null;
	lastWinner: { participantId: string; pairId: string } | null;
}

function createWebSocketStore() {
	// Recuperar clientId y roomCode de localStorage
	const savedClientId = typeof window !== 'undefined' ? localStorage.getItem('pvp_client_id') : null;
	const savedRoomCode = typeof window !== 'undefined' ? localStorage.getItem('pvp_room_code') : null;

	const initialState: WebSocketState = {
		connected: false,
		clientId: savedClientId,
		room: null,
		error: null,
		lastWinner: null
	};

	const store: Writable<WebSocketState> = writable(initialState);
	let ws: WebSocket | null = null;
	let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
	let reconnectAttempts = 0;
	let maxReconnectAttempts = 5;
	let intentionalDisconnect = false;

	function connect() {
		if (ws?.readyState === WebSocket.OPEN) return;

		// Resetear flag de desconexión intencional
		intentionalDisconnect = false;

		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const wsUrl = `${protocol}//${window.location.host}/ws`;

		ws = new WebSocket(wsUrl);

		ws.onopen = () => {
			console.log('✅ WebSocket connected');
			store.update(s => ({ ...s, connected: true, error: null }));
			reconnectAttempts = 0;

			// Si hay un roomCode guardado Y estamos en la página de sala, recuperar estado
			const currentPath = window.location.pathname;
			if (savedRoomCode && currentPath.includes('/room/')) {
				setTimeout(() => {
					console.log('🔄 Recuperando estado de sala:', savedRoomCode);
					send({ type: 'get_room_state', payload: { roomCode: savedRoomCode } });
				}, 500);
			}
		};

		ws.onmessage = (event) => {
			try {
				const message = JSON.parse(event.data);
				handleMessage(message);
			} catch (error) {
				console.error('Error parsing message:', error);
			}
		};

		ws.onerror = (error) => {
			console.error('❌ WebSocket error:', error);
			store.update(s => ({ ...s, error: 'Error de conexión' }));
		};

		ws.onclose = () => {
			console.log('🔌 WebSocket disconnected');
			store.update(s => ({ ...s, connected: false }));

			// Solo reconectar si NO fue intencional y no excedimos intentos
			if (!intentionalDisconnect && reconnectAttempts < maxReconnectAttempts) {
				reconnectAttempts++;
				const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 10000);
				console.log(`🔄 Intentando reconectar... (intento ${reconnectAttempts}/${maxReconnectAttempts}) en ${delay}ms`);
				
				if (!reconnectTimeout) {
					reconnectTimeout = setTimeout(() => {
						reconnectTimeout = null;
						connect();
					}, delay);
				}
			} else if (reconnectAttempts >= maxReconnectAttempts) {
				store.update(s => ({ 
					...s, 
					error: 'No se pudo reconectar. Por favor recarga la página.' 
				}));
			}
		};
	}

	function handleMessage(message: any) {
		switch (message.type) {
			case 'connected':
				const clientId = message.payload.clientId;
				if (typeof window !== 'undefined') {
					localStorage.setItem('pvp_client_id', clientId);
				}
				store.update(s => ({ ...s, clientId }));
				break;

			case 'room_created':
			case 'room_joined':
				const room = message.payload.room;
				if (typeof window !== 'undefined' && room) {
					localStorage.setItem('pvp_room_code', room.code);
				}
				store.update(s => ({ ...s, room, error: null }));
				break;

			case 'room_state':
				store.update(s => ({ ...s, room: message.payload.room }));
				break;

			case 'participant_joined':
			case 'participant_left':
			case 'pairs_updated':
			case 'tournament_started':
				// El estado se actualiza con room_state
				break;

			case 'pair_finished':
				const { winnerId, pair } = message.payload;
				store.update(s => ({ 
					...s, 
					lastWinner: { participantId: winnerId, pairId: pair.id } 
				}));
				
				// Limpiar lastWinner después de 3 segundos
				setTimeout(() => {
					store.update(s => ({ ...s, lastWinner: null }));
				}, 3000);
				break;

			case 'error':
				store.update(s => ({ ...s, error: message.payload.message }));
				setTimeout(() => {
					store.update(s => ({ ...s, error: null }));
				}, 5000);
				break;

			default:
				console.log('Unknown message type:', message.type);
		}
	}

	function send(message: any) {
		if (ws?.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(message));
		} else {
			console.error('WebSocket not connected');
		}
	}

	function disconnect() {
		intentionalDisconnect = true;
		if (ws) {
			ws.close();
		}
		if (reconnectTimeout) {
			clearTimeout(reconnectTimeout);
			reconnectTimeout = null;
		}
	}

	function createRoom(maxParticipants: number, name: string, avatar: string) {
		send({
			type: 'create_room',
			payload: { maxParticipants, name, avatar }
		});
	}

	function joinRoom(code: string, name: string, avatar: string) {
		send({
			type: 'join_room',
			payload: { code, name, avatar }
		});
	}

	function leaveRoom() {
		send({ type: 'leave_room' });
		if (typeof window !== 'undefined') {
			localStorage.removeItem('pvp_room_code');
		}
		store.update(s => ({ ...s, room: null }));
	}

	function organizePairs(roomCode: string) {
		send({
			type: 'organize_pairs',
			payload: { roomCode }
		});
	}

	function shufflePairs(roomCode: string) {
		send({
			type: 'shuffle_pairs',
			payload: { roomCode }
		});
	}

	function startTournament(roomCode: string) {
		send({
			type: 'start_tournament',
			payload: { roomCode }
		});
	}

	function markWinner(roomCode: string, pairId: string, winnerId: string) {
		send({
			type: 'mark_winner',
			payload: { roomCode, pairId, winnerId }
		});
	}

	function getRoomState(roomCode: string) {
		send({
			type: 'get_room_state',
			payload: { roomCode }
		});
	}

	return {
		subscribe: store.subscribe,
		connect,
		disconnect,
		send,
		createRoom,
		joinRoom,
		leaveRoom,
		organizePairs,
		shufflePairs,
		startTournament,
		markWinner,
		getRoomState
	};
}

export const wsStore = createWebSocketStore();

// Derived stores útiles
export const currentUser = derived(wsStore, $ws => {
	if (!$ws.room || !$ws.clientId) return null;
	return $ws.room.participants.find(p => p.id === $ws.clientId) || null;
});

export const isAdmin = derived(currentUser, $user => {
	return $user?.isAdmin || false;
});

export const activePair = derived(wsStore, $ws => {
	if (!$ws.room) return null;
	return $ws.room.pairs.find(p => p.isActive) || null;
});

export const winner = derived(wsStore, $ws => {
	if (!$ws.room?.tournamentFinished) return null;
	
	// El ganador es quien ganó todos sus enfrentamientos
	const winCounts = new Map<string, number>();
	
	for (const pair of $ws.room.pairs) {
		if (pair.winner) {
			winCounts.set(pair.winner, (winCounts.get(pair.winner) || 0) + 1);
		}
	}
	
	// Encontrar al participante con más victorias
	let maxWins = 0;
	let winnerId: string | null = null;
	
	for (const [id, wins] of winCounts.entries()) {
		if (wins > maxWins) {
			maxWins = wins;
			winnerId = id;
		}
	}
	
	if (!winnerId) return null;
	
	return $ws.room.participants.find(p => p.id === winnerId) || null;
});
