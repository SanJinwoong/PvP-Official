<script lang="ts">
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

<div class="bg-linear-to-r from-purple-600 to-pink-600 rounded-2xl p-4 shadow-lg text-white">
	<h2 class="text-lg font-bold mb-4 flex items-center gap-2">
		<span>👑</span>
		<span>Panel de Admin</span>
	</h2>

	{#if tournamentFinished}
		<div class="text-center py-4 space-y-3">
			<div class="text-3xl mb-2">🎉</div>
			<p class="font-semibold">¡Torneo Finalizado!</p>
			<button
				onclick={onReset}
				class="w-full bg-white text-purple-600 font-bold py-3 rounded-xl hover:bg-opacity-90 transition-all transform hover:scale-105"
			>
				🔄 Nuevo Torneo
			</button>
		</div>
	{:else if !hasPairs}
		<!-- No hay enfrentamientos organizados -->
		<div class="space-y-3">
			<p class="text-sm opacity-90">
				Participantes: {participantCount}
			</p>
			
			{#if participantCount < 2}
				<div class="bg-white bg-opacity-20 rounded-lg p-3 text-sm">
					⚠️ Necesitas al menos 2 participantes para comenzar
				</div>
			{:else}
				<button
					onclick={onOrganize}
					class="w-full bg-white text-purple-600 font-bold py-3 rounded-xl hover:bg-opacity-90 transition-all transform hover:scale-105"
				>
					🎲 Organizar Enfrentamientos
				</button>
			{/if}
		</div>
	{:else if !tournamentStarted}
		<!-- Enfrentamientos organizados pero no iniciados -->
		<div class="space-y-3">
			<p class="text-sm opacity-90">
				Enfrentamientos listos
			</p>
			
			<button
				onclick={handleShuffle}
				disabled={cooldown}
				class="w-full bg-white bg-opacity-20 text-white font-bold py-3 rounded-xl hover:bg-opacity-30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{cooldown ? '⏳ Espera...' : '🔀 Revolver Pares'}
			</button>
			
			<button
				onclick={onStart}
				class="w-full bg-white text-purple-600 font-bold py-3 rounded-xl hover:bg-opacity-90 transition-all transform hover:scale-105"
			>
				🚀 Empezar Torneo
			</button>
		</div>
	{:else}
		<!-- Torneo en progreso -->
		<div class="text-center py-4">
			<div class="text-3xl mb-2">⚔️</div>
			<p class="font-semibold">Torneo en progreso</p>
			<p class="text-sm opacity-90 mt-2">
				Marca al ganador de cada enfrentamiento
			</p>
		</div>
	{/if}
</div>
