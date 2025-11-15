<script lang="ts">
	import type { Round, Match } from '$lib/bracket-generator';
	import type { Participant } from '$lib/stores/websocket';

	interface Props {
		rounds: Round[];
		participants: Participant[];
		isAdmin: boolean;
		tournamentStarted?: boolean;
		onMarkWinner?: (matchId: string, winnerId: string) => void;
	}

	let { rounds, participants, isAdmin, tournamentStarted = false, onMarkWinner }: Props = $props();

	function getParticipant(id: string | null): Participant | null {
		if (!id) return null;
		return participants.find((p) => p.id === id) || null;
	}

	function getMatchWidth(totalRounds: number): string {
		// Calcular ancho base según número de rondas
		const baseWidth = 280;
		return `${baseWidth}px`;
	}

	function getMatchHeight(roundNumber: number): string {
		// Aumentar altura según la ronda (más espaciado en rondas avanzadas)
		const baseHeight = 120;
		const multiplier = Math.pow(2, roundNumber - 1);
		return `${baseHeight * multiplier}px`;
	}
</script>

<div class="bracket-container">
	<div class="bracket-scroll">
		<div class="bracket-wrapper">
			{#each rounds as round, roundIndex (round.roundNumber)}
				<div class="bracket-round" style="min-width: {getMatchWidth(rounds.length)}">
					<!-- Título de la ronda -->
					<div class="round-header">
						<h3 class="round-title">{round.roundName}</h3>
						{#if round.isComplete}
							<span class="round-badge complete">✓ Completa</span>
						{:else}
							<span class="round-badge active">● En curso</span>
						{/if}
					</div>

					<!-- Matches de la ronda -->
					<div class="matches-container">
						{#each round.matches as match, matchIndex (match.id)}
							{@const p1 = getParticipant(match.participant1)}
							{@const p2 = getParticipant(match.participant2)}
							{@const hasWinner = !!match.winner}
							{@const isActive = match.isActive}

							<div 
								class="match-wrapper"
								style="min-height: {getMatchHeight(round.roundNumber)}"
							>
								<div class="match-connector-left"></div>
								
								<div class="match-box {isActive ? 'match-active' : ''} {hasWinner ? 'match-complete' : ''}">
									<!-- Número del match -->
									<div class="match-number">
										{#if isActive}
											<span class="pulse">⚔️</span>
										{/if}
										Partido {match.matchNumber}
									</div>

									<!-- Participante 1 -->
									<div class="participant {match.winner === p1?.id ? 'winner' : ''}">
										{#if p1}
											<img src={p1.avatar} alt={p1.name} class="participant-avatar" />
											<span class="participant-name">{p1.name}</span>
											{#if match.winner === p1.id}
												<span class="winner-icon">🏆</span>
											{/if}
											{#if isActive && isAdmin && !hasWinner}
												<button
													onclick={() => onMarkWinner?.(match.id, p1.id)}
													class="win-btn"
												>
													✓
												</button>
											{/if}
										{:else}
											<div class="bye-slot">
												<span class="bye-text">TBD</span>
											</div>
										{/if}
									</div>

									<div class="vs-divider">VS</div>

									<!-- Participante 2 -->
									<div class="participant {match.winner === p2?.id ? 'winner' : ''}">
										{#if p2}
											<img src={p2.avatar} alt={p2.name} class="participant-avatar" />
											<span class="participant-name">{p2.name}</span>
											{#if match.winner === p2.id}
												<span class="winner-icon">🏆</span>
											{/if}
											{#if isActive && isAdmin && !hasWinner}
												<button
													onclick={() => onMarkWinner?.(match.id, p2.id)}
													class="win-btn"
												>
													✓
												</button>
											{/if}
										{:else if !p1}
											<div class="bye-slot">
												<span class="bye-text">BYE</span>
											</div>
										{:else}
											<div class="bye-slot">
												<span class="bye-text">TBD</span>
											</div>
										{/if}
									</div>
								</div>

								{#if roundIndex < rounds.length - 1}
									<div class="match-connector-right"></div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.bracket-container {
		background: white;
		border-radius: 1rem;
		padding: 1.5rem;
		box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
		overflow: hidden;
	}

	.bracket-scroll {
		overflow-x: auto;
		overflow-y: hidden;
		max-width: 100%;
	}

	.bracket-wrapper {
		display: flex;
		gap: 3rem;
		min-width: min-content;
		padding: 1rem;
	}

	.bracket-round {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.round-header {
		text-align: center;
		padding-bottom: 1rem;
		border-bottom: 2px solid #e5e7eb;
	}

	.round-title {
		font-size: 1.125rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 0.5rem;
	}

	.round-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.round-badge.complete {
		background: #dcfce7;
		color: #166534;
	}

	.round-badge.active {
		background: #fef3c7;
		color: #92400e;
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.matches-container {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		flex: 1;
	}

	.match-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.match-box {
		position: relative;
		background: white;
		border: 3px solid #d1d5db;
		border-radius: 0.75rem;
		padding: 0.75rem;
		min-width: 250px;
		transition: all 0.3s ease;
		z-index: 10;
	}

	.match-box.match-active {
		border-color: #8b5cf6;
		background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
		box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
		transform: scale(1.02);
	}

	.match-box.match-complete {
		border-color: #10b981;
		background: #f0fdf4;
	}

	.match-number {
		text-align: center;
		font-size: 0.75rem;
		font-weight: 600;
		color: #6b7280;
		margin-bottom: 0.5rem;
		text-transform: uppercase;
	}

	.pulse {
		animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.participant {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		border-radius: 0.5rem;
		background: #f9fafb;
		transition: all 0.2s;
		position: relative;
	}

	.participant.winner {
		background: linear-gradient(135deg, #fef08a 0%, #fde047 100%);
		border: 2px solid #eab308;
		font-weight: 700;
	}

	.participant-avatar {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 9999px;
		object-fit: cover;
		border: 2px solid white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.participant-name {
		flex: 1;
		font-size: 0.875rem;
		font-weight: 600;
		color: #1f2937;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.winner-icon {
		font-size: 1.5rem;
		animation: bounce 1s ease-in-out infinite;
	}

	.win-btn {
		background: #10b981;
		color: white;
		border: none;
		border-radius: 0.375rem;
		padding: 0.375rem 0.75rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.win-btn:hover {
		background: #059669;
		transform: scale(1.05);
	}

	.vs-divider {
		text-align: center;
		font-size: 0.75rem;
		font-weight: 700;
		color: #9ca3af;
		padding: 0.25rem 0;
	}

	.bye-slot {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 2.5rem;
		opacity: 0.5;
	}

	.bye-text {
		font-size: 0.75rem;
		font-weight: 600;
		color: #9ca3af;
		font-style: italic;
	}

	/* Conectores entre matches */
	.match-connector-left,
	.match-connector-right {
		position: absolute;
		height: 2px;
		background: #d1d5db;
		width: 2rem;
	}

	.match-connector-left {
		right: calc(100% + 0.75rem);
	}

	.match-connector-right {
		left: calc(100% + 0.75rem);
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	@keyframes bounce {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}
</style>
