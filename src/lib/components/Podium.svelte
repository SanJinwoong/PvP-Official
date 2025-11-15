<script lang="ts">
	import type { Participant } from '$lib/stores/websocket';

	interface Props {
		participants: Participant[];
		pairs: any[];
	}

	let { participants, pairs }: Props = $props();

	// Calcular podio basado en victorias
	const podium = $derived.by(() => {
		const winCounts = new Map<string, number>();

		// Contar victorias
		for (const pair of pairs) {
			if (pair.winner) {
				winCounts.set(pair.winner, (winCounts.get(pair.winner) || 0) + 1);
			}
		}

		// Ordenar por victorias
		const sorted = participants
			.map((p) => ({
				participant: p,
				wins: winCounts.get(p.id) || 0
			}))
			.filter((item) => item.wins > 0)
			.sort((a, b) => b.wins - a.wins);

		return sorted.slice(0, 3); // Top 3
	});
</script>

<div class="bg-white rounded-2xl p-6 shadow-lg">
	<h2 class="text-2xl font-bold text-center mb-6 text-gray-800">🏆 Podio Final</h2>

	{#if podium.length === 0}
		<p class="text-center text-gray-500">No hay resultados aún</p>
	{:else}
		<div class="flex items-end justify-center gap-4">
			<!-- Segundo lugar -->
			{#if podium[1]}
				<div class="flex flex-col items-center">
					<div class="text-4xl mb-2">🥈</div>
					<img
						src={podium[1].participant.avatar}
						alt={podium[1].participant.name}
						class="w-20 h-20 rounded-full border-4 border-gray-400 mb-2"
					/>
					<div class="text-sm font-semibold text-gray-800 text-center">
						{podium[1].participant.name}
					</div>
					<div class="text-xs text-gray-500">{podium[1].wins} victorias</div>
					<div class="w-24 h-24 bg-gray-400 rounded-t-lg mt-2 flex items-center justify-center">
						<span class="text-2xl font-bold text-white">2</span>
					</div>
				</div>
			{/if}

			<!-- Primer lugar -->
			{#if podium[0]}
				<div class="flex flex-col items-center">
					<div class="text-5xl mb-2 animate-bounce">🏆</div>
					<img
						src={podium[0].participant.avatar}
						alt={podium[0].participant.name}
						class="w-24 h-24 rounded-full border-4 border-yellow-400 mb-2 shadow-lg"
					/>
					<div class="text-lg font-bold text-gray-800 text-center">
						{podium[0].participant.name}
					</div>
					<div class="text-sm text-gray-500">{podium[0].wins} victorias</div>
					<div class="w-24 h-32 bg-yellow-400 rounded-t-lg mt-2 flex items-center justify-center">
						<span class="text-3xl font-bold text-white">1</span>
					</div>
				</div>
			{/if}

			<!-- Tercer lugar -->
			{#if podium[2]}
				<div class="flex flex-col items-center">
					<div class="text-3xl mb-2">🥉</div>
					<img
						src={podium[2].participant.avatar}
						alt={podium[2].participant.name}
						class="w-16 h-16 rounded-full border-4 border-orange-600 mb-2"
					/>
					<div class="text-xs font-semibold text-gray-800 text-center">
						{podium[2].participant.name}
					</div>
					<div class="text-xs text-gray-500">{podium[2].wins} victorias</div>
					<div class="w-24 h-16 bg-orange-600 rounded-t-lg mt-2 flex items-center justify-center">
						<span class="text-xl font-bold text-white">3</span>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
