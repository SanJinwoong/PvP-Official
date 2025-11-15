<script lang="ts">
	import type { Participant } from '$lib/stores/websocket';
	import type { Bracket } from '$lib/bracket-generator';
	import Trophy from './icons/Trophy.svelte';
	import Star from './icons/Star.svelte';

	interface Props {
		participants: Participant[];
		pairs?: any[];
		bracket?: Bracket | null;
	}

	let { participants, pairs = [], bracket = null }: Props = $props();

	// Calcular podio basado en victorias
	const podium = $derived.by(() => {
		const winCounts = new Map<string, number>();

		// Si tenemos bracket profesional, contar victorias desde ahí
		if (bracket && bracket.rounds && bracket.rounds.length > 0) {
			for (const round of bracket.rounds) {
				for (const match of round.matches) {
					if (match.winner) {
						winCounts.set(match.winner, (winCounts.get(match.winner) || 0) + 1);
					}
				}
			}
		} else {
			// Fallback al sistema antiguo de pairs
			for (const pair of pairs) {
				if (pair.winner) {
					winCounts.set(pair.winner, (winCounts.get(pair.winner) || 0) + 1);
				}
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

<div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
	<div class="flex items-center justify-center gap-3 mb-8">
		<Trophy class="text-amber-500" size={32} />
		<h2 class="text-3xl font-bold text-gray-900">Podio Final</h2>
	</div>

	{#if podium.length === 0}
		<div class="text-center py-12">
			<div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
				<Trophy class="text-gray-400" size={32} />
			</div>
			<p class="text-gray-500 font-medium">No hay resultados aún</p>
		</div>
	{:else}
		<div class="flex items-end justify-center gap-6 mb-6">
			<!-- Segundo lugar -->
			{#if podium[1]}
				<div class="flex flex-col items-center animate-[slideUp_0.6s_ease-out_0.2s_both]">
					<div class="relative mb-3">
						<div class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-lg z-10">
							<span class="text-white font-bold text-sm">2</span>
						</div>
						<img
							src={podium[1].participant.avatar}
							alt={podium[1].participant.name}
							class="w-20 h-20 rounded-full border-4 border-gray-300 shadow-lg object-cover"
						/>
					</div>
					<div class="text-center mb-2">
						<div class="text-base font-bold text-gray-900">{podium[1].participant.name}</div>
						<div class="flex items-center justify-center gap-1 text-gray-600 text-sm">
							<Star class="text-gray-400" size={14} />
							<span>{podium[1].wins} {podium[1].wins === 1 ? 'victoria' : 'victorias'}</span>
						</div>
					</div>
					<div class="w-28 h-28 bg-gradient-to-b from-gray-200 to-gray-400 rounded-t-2xl shadow-inner flex items-center justify-center">
						<div class="text-4xl font-black text-white opacity-30">2</div>
					</div>
				</div>
			{/if}

			<!-- Primer lugar - GANADOR -->
			{#if podium[0]}
				<div class="flex flex-col items-center animate-[slideUp_0.6s_ease-out] relative">
					<!-- Brillo premium del ganador -->
					<div class="absolute -inset-4 bg-gradient-to-b from-amber-200/20 to-transparent rounded-3xl blur-xl"></div>
					
					<div class="relative mb-3 z-10">
						<div class="absolute -inset-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 rounded-full blur opacity-75 animate-pulse"></div>
						<div class="relative">
							<div class="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl z-10 animate-bounce">
								<Trophy class="text-white" size={20} />
							</div>
							<img
								src={podium[0].participant.avatar}
								alt={podium[0].participant.name}
								class="w-28 h-28 rounded-full border-4 border-amber-400 shadow-2xl object-cover relative"
							/>
						</div>
					</div>
					<div class="text-center mb-3 relative z-10">
						<div class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600">
							{podium[0].participant.name}
						</div>
						<div class="flex items-center justify-center gap-1 mt-1">
							<Star class="text-amber-500" size={16} />
							<span class="text-amber-700 font-semibold">{podium[0].wins} {podium[0].wins === 1 ? 'victoria' : 'victorias'}</span>
						</div>
					</div>
					<div class="relative w-32 h-36 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 rounded-t-3xl shadow-2xl flex items-center justify-center overflow-hidden">
						<div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
						<div class="text-6xl font-black text-white opacity-40">1</div>
						<div class="absolute top-2 left-2">
							<Star class="text-amber-200" size={20} />
						</div>
						<div class="absolute bottom-2 right-2">
							<Star class="text-amber-200" size={16} />
						</div>
					</div>
				</div>
			{/if}

			<!-- Tercer lugar -->
			{#if podium[2]}
				<div class="flex flex-col items-center animate-[slideUp_0.6s_ease-out_0.4s_both]">
					<div class="relative mb-3">
						<div class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg z-10">
							<span class="text-white font-bold text-sm">3</span>
						</div>
						<img
							src={podium[2].participant.avatar}
							alt={podium[2].participant.name}
							class="w-16 h-16 rounded-full border-4 border-orange-400 shadow-lg object-cover"
						/>
					</div>
					<div class="text-center mb-2">
						<div class="text-sm font-bold text-gray-900">{podium[2].participant.name}</div>
						<div class="flex items-center justify-center gap-1 text-gray-600 text-xs">
							<Star class="text-orange-400" size={12} />
							<span>{podium[2].wins} {podium[2].wins === 1 ? 'victoria' : 'victorias'}</span>
						</div>
					</div>
					<div class="w-24 h-20 bg-gradient-to-b from-orange-300 to-orange-500 rounded-t-2xl shadow-inner flex items-center justify-center">
						<div class="text-3xl font-black text-white opacity-30">3</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
