<script lang="ts">
	import Trophy from './icons/Trophy.svelte';
	
	interface Props {
		hasPairs: boolean;
		tournamentStarted: boolean;
		tournamentFinished: boolean;
		participantCount: number;
		onOrganize?: () => void;
		onShuffle?: () => void;
		onStart?: () => void;
		onReset?: () => void;
	}

	let {
		hasPairs,
		tournamentStarted,
		tournamentFinished,
		participantCount,
		onOrganize,
		onShuffle,
		onStart,
		onReset
	}: Props = $props();

	let cooldown = $state(false);

	function handleShuffle() {
		if (cooldown) return;
		
		onShuffle?.();
		
		// Cooldown de 3 segundos
		cooldown = true;
		setTimeout(() => {
			cooldown = false;
		}, 3000);
	}
</script>

<div class="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
	<div class="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
		<div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
			<Trophy class="text-white" size={20} />
		</div>
		<h2 class="text-lg font-bold text-gray-900">Panel de Admin</h2>
	</div>

	{#if tournamentFinished}
		<div class="text-center py-6 space-y-4">
			<div class="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
				<Trophy class="text-amber-600" size={32} />
			</div>
			<div>
				<p class="font-bold text-gray-900 text-lg">¡Torneo Finalizado!</p>
				<p class="text-sm text-gray-500 mt-1">El ganador ha sido coronado</p>
			</div>
			<button
				onclick={onReset}
				class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
				</svg>
				<span>Nuevo Torneo</span>
			</button>
		</div>
	{:else if !hasPairs}
		<!-- No hay enfrentamientos organizados -->
		<div class="space-y-4">
			<div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
				<div class="flex items-center justify-between">
					<span class="text-sm text-gray-600">Participantes</span>
					<span class="text-2xl font-bold text-gray-900">{participantCount}</span>
				</div>
			</div>
			
			{#if participantCount < 2}
				<div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
					<svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
					</svg>
					<p class="text-sm text-amber-800 font-medium">
						Necesitas al menos 2 participantes para comenzar
					</p>
				</div>
			{:else}
				<button
					onclick={onOrganize}
					class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
					</svg>
					<span>Organizar Enfrentamientos</span>
				</button>
			{/if}
		</div>
	{:else if !tournamentStarted}
		<!-- Enfrentamientos organizados pero no iniciados -->
		<div class="space-y-4">
			<div class="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
				<svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
				</svg>
				<p class="text-sm text-green-800 font-medium">Enfrentamientos listos</p>
			</div>
			
			<button
				onclick={handleShuffle}
				disabled={cooldown}
				class="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
				</svg>
				<span>{cooldown ? 'Espera...' : 'Revolver Pares'}</span>
			</button>
			
			<button
				onclick={onStart}
				class="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<span>Empezar Torneo</span>
			</button>
		</div>
	{:else}
		<!-- Torneo en progreso -->
		<div class="text-center py-6">
			<div class="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mb-4">
				<svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
				</svg>
			</div>
			<p class="font-bold text-gray-900">Torneo en progreso</p>
			<p class="text-sm text-gray-500 mt-2">
				Marca al ganador de cada enfrentamiento
			</p>
		</div>
	{/if}
</div>
