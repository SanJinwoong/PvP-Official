import type { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { roomManager } from './room-manager';
import type { Room } from './room-manager';

interface ClientConnection {
	ws: WebSocket;
	participantId: string;
	roomCode: string | null;
}

export interface WSMessage {
	type: string;
	payload?: any;
}

class WebSocketManager {
	private wss: WebSocketServer | null = null;
	private clients: Map<string, ClientConnection> = new Map();

	initialize(server: Server) {
		this.wss = new WebSocketServer({ server, path: '/ws' });

		this.wss.on('connection', (ws: WebSocket) => {
			const clientId = this.generateClientId();
			const connection: ClientConnection = {
				ws,
				participantId: clientId,
				roomCode: null
			};

			this.clients.set(clientId, connection);

			ws.on('message', (data: Buffer) => {
				try {
					const message: WSMessage = JSON.parse(data.toString());
					this.handleMessage(clientId, message);
				} catch (error) {
					console.error('Error parsing message:', error);
				}
			});

			ws.on('close', () => {
				const conn = this.clients.get(clientId);
				if (conn?.roomCode) {
					roomManager.leaveRoom(conn.roomCode, clientId);
					this.broadcastToRoom(conn.roomCode, {
						type: 'participant_left',
						payload: { participantId: clientId }
					});
					this.sendRoomState(conn.roomCode);
				}
				this.clients.delete(clientId);
			});

			// Enviar confirmación de conexión
			this.sendToClient(clientId, {
				type: 'connected',
				payload: { clientId }
			});
		});
	}

	private handleMessage(clientId: string, message: WSMessage) {
		const conn = this.clients.get(clientId);
		if (!conn) return;

		switch (message.type) {
			case 'create_room':
				this.handleCreateRoom(clientId, message.payload);
				break;

			case 'join_room':
				this.handleJoinRoom(clientId, message.payload);
				break;

			case 'leave_room':
				this.handleLeaveRoom(clientId);
				break;

			case 'organize_pairs':
				this.handleOrganizePairs(clientId, message.payload);
				break;

			case 'shuffle_pairs':
				this.handleShufflePairs(clientId, message.payload);
				break;

			case 'start_tournament':
				this.handleStartTournament(clientId, message.payload);
				break;

			case 'mark_winner':
				this.handleMarkWinner(clientId, message.payload);
				break;

			case 'get_room_state':
				this.handleGetRoomState(clientId, message.payload);
				break;

			default:
				console.log('Unknown message type:', message.type);
		}
	}

	private handleCreateRoom(clientId: string, payload: any) {
		const { maxParticipants, name, avatar } = payload;
		
		try {
			const room = roomManager.createRoom(maxParticipants, clientId, name, avatar);
			const conn = this.clients.get(clientId);
			if (conn) {
				conn.roomCode = room.code;
			}

			this.sendToClient(clientId, {
				type: 'room_created',
				payload: { room: this.serializeRoom(room) }
			});
		} catch (error) {
			this.sendToClient(clientId, {
				type: 'error',
				payload: { message: 'Error al crear la sala' }
			});
		}
	}

	private handleJoinRoom(clientId: string, payload: any) {
		const { code, name, avatar } = payload;

		const result = roomManager.joinRoom(code, clientId, name, avatar);

		if (!result.success) {
			this.sendToClient(clientId, {
				type: 'error',
				payload: { message: result.error }
			});
			return;
		}

		const conn = this.clients.get(clientId);
		if (conn) {
			conn.roomCode = code;
		}

		this.sendToClient(clientId, {
			type: 'room_joined',
			payload: { room: this.serializeRoom(result.room!) }
		});

		this.broadcastToRoom(code, {
			type: 'participant_joined',
			payload: { participantId: clientId }
		}, clientId);

		this.sendRoomState(code);
	}

	private handleLeaveRoom(clientId: string) {
		const conn = this.clients.get(clientId);
		if (!conn?.roomCode) return;

		const roomCode = conn.roomCode;
		roomManager.leaveRoom(roomCode, clientId);
		conn.roomCode = null;

		this.broadcastToRoom(roomCode, {
			type: 'participant_left',
			payload: { participantId: clientId }
		});

		this.sendRoomState(roomCode);
	}

	private handleOrganizePairs(clientId: string, payload: any) {
		const { roomCode } = payload;
		const result = roomManager.organizePairs(roomCode, clientId);

		if (!result.success) {
			this.sendToClient(clientId, {
				type: 'error',
				payload: { message: result.error }
			});
			return;
		}

		this.broadcastToRoom(roomCode, {
			type: 'pairs_updated',
			payload: { pairs: result.pairs }
		});

		this.sendRoomState(roomCode);
	}

	private handleShufflePairs(clientId: string, payload: any) {
		const { roomCode } = payload;
		const result = roomManager.shufflePairs(roomCode, clientId);

		if (!result.success) {
			this.sendToClient(clientId, {
				type: 'error',
				payload: { message: result.error }
			});
			return;
		}

		this.broadcastToRoom(roomCode, {
			type: 'pairs_updated',
			payload: { pairs: result.pairs }
		});

		this.sendRoomState(roomCode);
	}

	private handleStartTournament(clientId: string, payload: any) {
		const { roomCode } = payload;
		const result = roomManager.startTournament(roomCode, clientId);

		if (!result.success) {
			this.sendToClient(clientId, {
				type: 'error',
				payload: { message: result.error }
			});
			return;
		}

		this.broadcastToRoom(roomCode, {
			type: 'tournament_started',
			payload: {}
		});

		this.sendRoomState(roomCode);
	}

	private handleMarkWinner(clientId: string, payload: any) {
		const { roomCode, pairId, winnerId } = payload;
		const result = roomManager.markWinner(roomCode, clientId, pairId, winnerId);

		if (!result.success) {
			this.sendToClient(clientId, {
				type: 'error',
				payload: { message: result.error }
			});
			return;
		}

		this.broadcastToRoom(roomCode, {
			type: 'pair_finished',
			payload: { 
				pair: result.pair,
				winnerId 
			}
		});

		// Pequeño delay antes de enviar el estado actualizado para las animaciones
		setTimeout(() => {
			this.sendRoomState(roomCode);
		}, 100);
	}

	private handleGetRoomState(clientId: string, payload: any) {
		const { roomCode } = payload;
		this.sendRoomState(roomCode, clientId);
	}

	private sendRoomState(roomCode: string, targetClientId?: string) {
		const room = roomManager.getRoomState(roomCode);
		if (!room) return;

		const message = {
			type: 'room_state',
			payload: { room: this.serializeRoom(room) }
		};

		if (targetClientId) {
			this.sendToClient(targetClientId, message);
		} else {
			this.broadcastToRoom(roomCode, message);
		}
	}

	private sendToClient(clientId: string, message: WSMessage) {
		const conn = this.clients.get(clientId);
		if (conn && conn.ws.readyState === WebSocket.OPEN) {
			conn.ws.send(JSON.stringify(message));
		}
	}

	private broadcastToRoom(roomCode: string, message: WSMessage, excludeClientId?: string) {
		for (const [clientId, conn] of this.clients.entries()) {
			if (conn.roomCode === roomCode && clientId !== excludeClientId) {
				this.sendToClient(clientId, message);
			}
		}
	}

	private serializeRoom(room: Room) {
		return {
			code: room.code,
			maxParticipants: room.maxParticipants,
			participants: Array.from(room.participants.values()),
			adminId: room.adminId,
			pairs: room.pairs,
			tournamentStarted: room.tournamentStarted,
			tournamentFinished: room.tournamentFinished,
			currentPairIndex: room.currentPairIndex
		};
	}

	private generateClientId(): string {
		return Math.random().toString(36).substring(2, 15);
	}
}

export const wsManager = new WebSocketManager();
