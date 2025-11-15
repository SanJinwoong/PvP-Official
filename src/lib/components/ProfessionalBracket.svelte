<script lang="ts">
	import type { Round, Match } from '$lib/bracket-generator';
	import type { Participant } from '$lib/stores/websocket';
	import Trophy from './icons/Trophy.svelte';

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
</script>

<div class="w-full overflow-x-auto custom-scrollbar">
	<div class="inline-flex gap-8 p-6 min-w-full">
		{#each rounds as round, roundIndex (round.roundNumber)}
			<div class="flex flex-col min-w-[320px]">
				<!-- Título de la ronda -->
				<div class="mb-6 text-center">
					<h3 class="text-xl font-black text-gray-900 mb-2">{round.roundName}</h3>
					<div class="flex items-center justify-center gap-2">
						{#if round.isComplete}
							<span class="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1.5">
								<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
								</svg>
								Completa
							</span>
						{:else}
							<span class="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1.5">
								<span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
								En curso
							</span>
						{/if}
					</div>
				</div>

				<!-- Matches de la ronda -->
				<div class="flex flex-col gap-6 flex-1 justify-around">
					{#each round.matches as match (match.id)}
						{@const p1 = getParticipant(match.participant1)}
						{@const p2 = getParticipant(match.participant2)}
						{@const hasWinner = !!match.winner}
						{@const isActive = match.isActive}

						<div class="relative group">
							<!-- Conector a la derecha (hacia siguiente ronda) -->
							{#if roundIndex < rounds.length - 1}
								<div class="absolute left-full top-1/2 w-8 h-0.5 bg-gray-200 hidden xl:block"></div>
							{/if}

							<!-- Card del match -->
							<div class="bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 {isActive
									? 'border-blue-400 shadow-blue-100'
									: hasWinner
									? 'border-green-300 shadow-green-50'
									: 'border-gray-200 hover:border-gray-300'}">
								
								<!-- Header del match -->
								<div class="px-4 py-3 border-b border-gray-100 bg-gradient-to-r {isActive
										? 'from-blue-50 to-transparent'
										: hasWinner
										? 'from-green-50 to-transparent'
										: 'from-gray-50 to-transparent'}">
									<div class="flex items-center justify-between">
										<span class="text-xs font-bold text-gray-600">
											Partido {match.matchNumber}
										</span>
										{#if isActive}
											<span class="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
												<span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
												Activo
											</span>
										{:else if hasWinner}
											<Trophy class="text-green-600" size={14} />
										{/if}
									</div>
								</div>

								<!-- Participantes -->
								<div class="p-3 space-y-2">{#if p1}
										<div class="group/p relative flex items-center gap-3 p-3 rounded-xl transition-all duration-200 {match.winner === p1.id
												? 'bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-300 shadow-md'
												: 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'}">
											<img
												src={p1.avatar}
												alt={p1.name}
												class="w-10 h-10 rounded-full object-cover border-2 {match.winner === p1.id ? 'border-amber-400 shadow-lg' : 'border-white'}"
											/>
											<span class="flex-1 font-semibold text-sm truncate {match.winner === p1.id ? 'text-amber-900' : 'text-gray-900'}">
												{p1.name}
											</span>
											{#if match.winner === p1.id}
												<div class="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
													<Trophy class="text-white" size={14} />
												</div>
											{:else if isActive && isAdmin && tournamentStarted && !hasWinner}
												<button
													onclick={() => onMarkWinner?.(match.id, p1.id)}
													class="opacity-0 group-hover/p:opacity-100 px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition-all"
												>
													Ganador
												</button>
											{/if}
										</div>
									{:else}
										<div class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300">
											<div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
												<span class="text-gray-400 text-xs">?</span>
											</div>
											<span class="flex-1 text-sm text-gray-400 italic">Por determinar</span>
										</div>
									{/if}

									<div class="text-center py-1">
										<span class="text-xs font-bold text-gray-400">VS</span>
									</div>

									{#if p2}
										<div class="group/p relative flex items-center gap-3 p-3 rounded-xl transition-all duration-200 {match.winner === p2.id
												? 'bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-300 shadow-md'
												: 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'}">
											<img
												src={p2.avatar}
												alt={p2.name}
												class="w-10 h-10 rounded-full object-cover border-2 {match.winner === p2.id ? 'border-amber-400 shadow-lg' : 'border-white'}"
											/>
											<span class="flex-1 font-semibold text-sm truncate {match.winner === p2.id ? 'text-amber-900' : 'text-gray-900'}">
												{p2.name}
											</span>
											{#if match.winner === p2.id}
												<div class="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
													<Trophy class="text-white" size={14} />
												</div>
											{:else if isActive && isAdmin && tournamentStarted && !hasWinner}
												<button
													onclick={() => onMarkWinner?.(match.id, p2.id)}
													class="opacity-0 group-hover/p:opacity-100 px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition-all"
												>
													Ganador
												</button>
											{/if}
										</div>
									{:else}
										<div class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300">
											<div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
												<span class="text-gray-400 text-xs">?</span>
											</div>
											<span class="flex-1 text-sm text-gray-400 italic">
												{match.participant1 ? 'BYE - Pasa automático' : 'Por determinar'}
											</span>
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		height: 8px;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: #f3f4f6;
		border-radius: 10px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #d1d5db;
		border-radius: 10px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: #9ca3af;
	}
</style>
