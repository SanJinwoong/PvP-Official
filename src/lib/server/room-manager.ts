import { nanoid } from 'nanoid';

export interface Participant {
	id: string;
	name: string;
	avatar: string; // dataURL
	isAdmin: boolean;
	isConnected: boolean;
}

export interface Pair {
	id: string;
	participant1: string; // participant id
	participant2: string | null; // null for bye
	winner: string | null;
	isActive: boolean;
}

export interface Room {
	code: string;
	maxParticipants: number;
	participants: Map<string, Participant>;
	adminId: string;
	pairs: Pair[];
	tournamentStarted: boolean;
	tournamentFinished: boolean;
	currentPairIndex: number;
	createdAt: Date;
}

class RoomManager {
	private rooms: Map<string, Room> = new Map();

	generateRoomCode(): string {
		let code: string;
		do {
			code = nanoid(6).toUpperCase();
		} while (this.rooms.has(code));
		return code;
	}

	createRoom(maxParticipants: number, adminId: string, adminName: string, adminAvatar: string): Room {
		const code = this.generateRoomCode();
		const admin: Participant = {
			id: adminId,
			name: adminName,
			avatar: adminAvatar,
			isAdmin: true,
			isConnected: true
		};

		const room: Room = {
			code,
			maxParticipants: Math.min(Math.max(maxParticipants, 2), 20),
			participants: new Map([[adminId, admin]]),
			adminId,
			pairs: [],
			tournamentStarted: false,
			tournamentFinished: false,
			currentPairIndex: -1,
			createdAt: new Date()
		};

		this.rooms.set(code, room);
		return room;
	}

	getRoom(code: string): Room | undefined {
		return this.rooms.get(code);
	}

	joinRoom(code: string, participantId: string, name: string, avatar: string): { success: boolean; error?: string; room?: Room } {
		const room = this.rooms.get(code);
		if (!room) {
			return { success: false, error: 'Sala no encontrada' };
		}

		if (room.participants.size >= room.maxParticipants) {
			return { success: false, error: 'Sala llena' };
		}

		if (room.tournamentStarted) {
			return { success: false, error: 'El torneo ya comenzó' };
		}

		const participant: Participant = {
			id: participantId,
			name,
			avatar,
			isAdmin: false,
			isConnected: true
		};

		room.participants.set(participantId, participant);
		return { success: true, room };
	}

	leaveRoom(code: string, participantId: string): void {
		const room = this.rooms.get(code);
		if (!room) return;

		room.participants.delete(participantId);

		// Si el admin se va y quedan participantes, asignar nuevo admin
		if (participantId === room.adminId && room.participants.size > 0) {
			const newAdmin = Array.from(room.participants.values())[0];
			newAdmin.isAdmin = true;
			room.adminId = newAdmin.id;
		}

		// Si la sala queda vacía, eliminarla
		if (room.participants.size === 0) {
			this.rooms.delete(code);
		}
	}

	organizePairs(code: string, adminId: string): { success: boolean; error?: string; pairs?: Pair[] } {
		const room = this.rooms.get(code);
		if (!room) {
			return { success: false, error: 'Sala no encontrada' };
		}

		if (room.adminId !== adminId) {
			return { success: false, error: 'No autorizado' };
		}

		if (room.participants.size < 2) {
			return { success: false, error: 'Se necesitan al menos 2 participantes' };
		}

		const participantIds = Array.from(room.participants.keys());
		const shuffled = this.shuffleArray([...participantIds]);
		const pairs: Pair[] = [];

		for (let i = 0; i < shuffled.length; i += 2) {
			pairs.push({
				id: nanoid(8),
				participant1: shuffled[i],
				participant2: shuffled[i + 1] || null, // bye si es impar
				winner: null,
				isActive: false
			});
		}

		room.pairs = pairs;
		room.currentPairIndex = -1;
		room.tournamentStarted = false;

		return { success: true, pairs };
	}

	shufflePairs(code: string, adminId: string): { success: boolean; error?: string; pairs?: Pair[] } {
		const room = this.rooms.get(code);
		if (!room) {
			return { success: false, error: 'Sala no encontrada' };
		}

		if (room.adminId !== adminId) {
			return { success: false, error: 'No autorizado' };
		}

		if (room.tournamentStarted) {
			return { success: false, error: 'El torneo ya comenzó' };
		}

		return this.organizePairs(code, adminId);
	}

	startTournament(code: string, adminId: string): { success: boolean; error?: string } {
		const room = this.rooms.get(code);
		if (!room) {
			return { success: false, error: 'Sala no encontrada' };
		}

		if (room.adminId !== adminId) {
			return { success: false, error: 'No autorizado' };
		}

		if (room.pairs.length === 0) {
			return { success: false, error: 'Primero debes organizar los enfrentamientos' };
		}

		room.tournamentStarted = true;
		room.currentPairIndex = 0;
		
		if (room.pairs[0]) {
			room.pairs[0].isActive = true;
			
			// Si el primer par tiene bye, auto-avanzar
			if (room.pairs[0].participant2 === null) {
				room.pairs[0].winner = room.pairs[0].participant1;
				this.advanceToNextPair(room);
			}
		}

		return { success: true };
	}

	markWinner(code: string, adminId: string, pairId: string, winnerId: string): { success: boolean; error?: string; pair?: Pair } {
		const room = this.rooms.get(code);
		if (!room) {
			return { success: false, error: 'Sala no encontrada' };
		}

		if (room.adminId !== adminId) {
			return { success: false, error: 'No autorizado' };
		}

		const pair = room.pairs.find(p => p.id === pairId);
		if (!pair) {
			return { success: false, error: 'Enfrentamiento no encontrado' };
		}

		if (!pair.isActive) {
			return { success: false, error: 'Este enfrentamiento no está activo' };
		}

		if (winnerId !== pair.participant1 && winnerId !== pair.participant2) {
			return { success: false, error: 'Ganador inválido' };
		}

		pair.winner = winnerId;
		pair.isActive = false;

		this.advanceToNextPair(room);

		return { success: true, pair };
	}

	private advanceToNextPair(room: Room): void {
		// Buscar el siguiente par sin ganador
		let nextIndex = room.currentPairIndex + 1;
		
		while (nextIndex < room.pairs.length) {
			const nextPair = room.pairs[nextIndex];
			
			if (!nextPair.winner) {
				// Si tiene bye, auto-avanzar
				if (nextPair.participant2 === null) {
					nextPair.winner = nextPair.participant1;
					nextIndex++;
					continue;
				}
				
				// Activar este par
				nextPair.isActive = true;
				room.currentPairIndex = nextIndex;
				return;
			}
			
			nextIndex++;
		}

		// Si no hay más pares, el torneo terminó
		room.tournamentFinished = true;
		room.currentPairIndex = room.pairs.length;
	}

	private shuffleArray<T>(array: T[]): T[] {
		const result = [...array];
		for (let i = result.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[result[i], result[j]] = [result[j], result[i]];
		}
		return result;
	}

	getRoomState(code: string): Room | undefined {
		return this.rooms.get(code);
	}

	getAllRooms(): Room[] {
		return Array.from(this.rooms.values());
	}
}

export const roomManager = new RoomManager();
