<script lang="ts">
	import type { Pair, Participant } from '$lib/stores/websocket';

	interface Props {
		pairs: Pair[];
		participants: Participant[];
		isAdmin: boolean;
		tournamentStarted: boolean;
		onMarkWinner?: (pairId: string, winnerId: string) => void;
	}

	let { pairs, participants, isAdmin, tournamentStarted, onMarkWinner }: Props = $props();

	function getParticipant(id: string | null): Participant | null {
		if (!id) return null;
		return participants.find((p) => p.id === id) || null;
	}
</script>

<div class="bg-white rounded-2xl p-4 shadow-lg">
	<h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
		<span>⚔️</span>
		<span>Bracket del Torneo</span>
	</h2>

	{#if pairs.length === 0}
		<div class="text-center py-12 text-gray-500">
			<div class="text-4xl mb-2">🎲</div>
			<p>El admin debe organizar los enfrentamientos</p>
		</div>
	{:else}
		<div class="space-y-6">
			{#each pairs as pair, index (pair.id)}
				{@const participant1 = getParticipant(pair.participant1)}
				{@const participant2 = getParticipant(pair.participant2)}
				{@const isActive = pair.isActive}
				{@const hasWinner = !!pair.winner}

				<!-- Bracket estilo llave -->
				<div class="relative transition-all duration-300 {isActive ? 'scale-105' : ''}">
					<!-- Número de pelea -->
					<div class="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
						<span class="px-3 py-1 rounded-full text-xs font-bold shadow-md {isActive ? 'bg-purple-500 text-white' : hasWinner ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}">
							PELEA #{index + 1}
						</span>
					</div>

					<!-- Contenedor de la llave -->
					<div class="relative border-4 rounded-2xl overflow-hidden {isActive ? 'border-purple-500 shadow-xl shadow-purple-200' : hasWinner ? 'border-green-400 shadow-lg' : 'border-gray-300'}">
						<!-- Participante 1 -->
						{#if participant1}
							<div class="relative flex items-center gap-3 p-4 {pair.winner === participant1.id ? 'bg-gradient-to-r from-green-400 to-green-500' : isActive ? 'bg-purple-50' : 'bg-white'}">
								<!-- Borde izquierdo de la llave -->
								<div class="absolute left-0 top-0 bottom-0 w-1 {pair.winner === participant1.id ? 'bg-yellow-400' : isActive ? 'bg-purple-500' : 'bg-gray-300'}"></div>
								
								<img
									src={participant1.avatar}
									alt={participant1.name}
									class="w-12 h-12 rounded-full object-cover border-2 {pair.winner === participant1.id ? 'border-yellow-400 shadow-lg' : 'border-gray-300'}"
								/>
								<div class="flex-1">
									<div class="font-bold {pair.winner === participant1.id ? 'text-white' : 'text-gray-800'}">{participant1.name}</div>
								</div>
								{#if pair.winner === participant1.id}
									<span class="text-3xl animate-bounce">🏆</span>
								{/if}
								{#if isActive && isAdmin && !hasWinner}
									<button
										onclick={() => onMarkWinner?.(pair.id, participant1.id)}
										class="px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-lg hover:bg-green-600 transition-all hover:scale-105 shadow-md"
									>
										✓ Ganó
									</button>
								{/if}
							</div>
						{/if}

						<!-- Línea divisoria VS -->
						<div class="relative h-12 flex items-center justify-center {isActive ? 'bg-purple-100' : 'bg-gray-100'}">
							<div class="absolute left-0 top-0 bottom-0 w-1 {isActive ? 'bg-purple-500' : 'bg-gray-300'}"></div>
							<div class="absolute right-0 top-0 bottom-0 w-1 {isActive ? 'bg-purple-500' : 'bg-gray-300'}"></div>
							<span class="text-lg font-black {isActive ? 'text-purple-600' : 'text-gray-500'}">VS</span>
						</div>

						<!-- Participante 2 -->
						{#if participant2}
							<div class="relative flex items-center gap-3 p-4 {pair.winner === participant2.id ? 'bg-gradient-to-r from-green-400 to-green-500' : isActive ? 'bg-purple-50' : 'bg-white'}">
								<!-- Borde izquierdo de la llave -->
								<div class="absolute left-0 top-0 bottom-0 w-1 {pair.winner === participant2.id ? 'bg-yellow-400' : isActive ? 'bg-purple-500' : 'bg-gray-300'}"></div>
								
								<img
									src={participant2.avatar}
									alt={participant2.name}
									class="w-12 h-12 rounded-full object-cover border-2 {pair.winner === participant2.id ? 'border-yellow-400 shadow-lg' : 'border-gray-300'}"
								/>
								<div class="flex-1">
									<div class="font-bold {pair.winner === participant2.id ? 'text-white' : 'text-gray-800'}">{participant2.name}</div>
								</div>
								{#if pair.winner === participant2.id}
									<span class="text-3xl animate-bounce">🏆</span>
								{/if}
								{#if isActive && isAdmin && !hasWinner}
									<button
										onclick={() => onMarkWinner?.(pair.id, participant2.id)}
										class="px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-lg hover:bg-green-600 transition-all hover:scale-105 shadow-md"
									>
										✓ Ganó
									</button>
								{/if}
							</div>
						{:else}
							<div class="relative flex items-center justify-center p-4 bg-yellow-50">
								<div class="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400"></div>
								<span class="text-sm font-semibold text-yellow-700">⭐ BYE - Pasa automáticamente</span>
							</div>
						{/if}

						<!-- Estado activo -->
						{#if isActive && !hasWinner}
							<div class="bg-purple-500 py-2">
								<p class="text-center text-white text-sm font-bold animate-pulse">
									⚔️ BATALLA EN CURSO ⚔️
								</p>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
