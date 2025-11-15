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
		<span>Enfrentamientos</span>
	</h2>

	{#if pairs.length === 0}
		<div class="text-center py-12 text-gray-500">
			<div class="text-4xl mb-2">🎲</div>
			<p>El admin debe organizar los enfrentamientos</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each pairs as pair, index (pair.id)}
				{@const participant1 = getParticipant(pair.participant1)}
				{@const participant2 = getParticipant(pair.participant2)}
				{@const isActive = pair.isActive}
				{@const hasWinner = !!pair.winner}

				<div
					class="border-2 rounded-xl p-4 transition-all {isActive
						? 'border-purple-500 bg-purple-50 shadow-lg'
						: hasWinner
							? 'border-gray-200 bg-gray-50 opacity-60'
							: 'border-gray-200 bg-white'}"
				>
					<!-- Número del enfrentamiento -->
					<div class="text-xs font-semibold text-gray-500 mb-3">
						Enfrentamiento #{index + 1}
					</div>

					<!-- Participante 1 -->
					{#if participant1}
						<div
							class="flex items-center gap-3 p-3 rounded-lg mb-2 {pair.winner === participant1.id
								? 'bg-green-100 border-2 border-green-400'
								: 'bg-gray-50'}"
						>
							<img
								src={participant1.avatar}
								alt={participant1.name}
								class="w-10 h-10 rounded-full object-cover"
							/>
							<div class="flex-1">
								<div class="font-semibold text-gray-800">{participant1.name}</div>
							</div>
							{#if pair.winner === participant1.id}
								<span class="text-2xl">🏆</span>
							{/if}
							{#if isActive && isAdmin && !hasWinner}
								<button
									onclick={() => onMarkWinner?.(pair.id, participant1.id)}
									class="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
								>
									Ganador
								</button>
							{/if}
						</div>
					{/if}

					<!-- VS -->
					<div class="text-center text-xs font-bold text-gray-400 my-1">VS</div>

					<!-- Participante 2 -->
					{#if participant2}
						<div
							class="flex items-center gap-3 p-3 rounded-lg {pair.winner === participant2.id
								? 'bg-green-100 border-2 border-green-400'
								: 'bg-gray-50'}"
						>
							<img
								src={participant2.avatar}
								alt={participant2.name}
								class="w-10 h-10 rounded-full object-cover"
							/>
							<div class="flex-1">
								<div class="font-semibold text-gray-800">{participant2.name}</div>
							</div>
							{#if pair.winner === participant2.id}
								<span class="text-2xl">🏆</span>
							{/if}
							{#if isActive && isAdmin && !hasWinner}
								<button
									onclick={() => onMarkWinner?.(pair.id, participant2.id)}
									class="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
								>
									Ganador
								</button>
							{/if}
						</div>
					{:else}
						<div class="flex items-center justify-center p-3 rounded-lg bg-yellow-50 border border-yellow-200">
							<span class="text-sm text-yellow-700">BYE - Pasa automáticamente</span>
						</div>
					{/if}

					<!-- Estado -->
					{#if isActive && !hasWinner}
						<div class="mt-3 text-center">
							<span class="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
								⏳ En progreso
							</span>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
