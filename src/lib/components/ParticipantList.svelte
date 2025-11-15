<script lang="ts">
	import type { Participant } from '$lib/stores/websocket';
	import User from './icons/User.svelte';

	interface Props {
		participants: Participant[];
		adminId: string;
		currentUserId: string | null;
	}

	let { participants, adminId, currentUserId }: Props = $props();
</script>

<div class="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
	<div class="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
		<div class="w-10 h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-lg">
			<User class="text-white" size={20} />
		</div>
		<h2 class="text-lg font-bold text-gray-900">
			Participantes 
			<span class="text-sm font-normal text-gray-500">({participants.length})</span>
		</h2>
	</div>

	<div class="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
		{#each participants as participant (participant.id)}
			<div
				class="group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 {participant.id === currentUserId
					? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 shadow-md'
					: 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'}"
			>
				<!-- Avatar con badge de admin -->
				<div class="relative flex-shrink-0">
					<div class="w-14 h-14 rounded-full overflow-hidden border-3 {participant.id === currentUserId ? 'border-blue-400' : 'border-white'} shadow-lg">
						<img
							src={participant.avatar}
							alt={participant.name}
							class="w-full h-full object-cover"
						/>
					</div>
					{#if participant.isAdmin}
						<div
							class="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-lg animate-pulse"
							title="Administrador"
						>
							<svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
								<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
							</svg>
						</div>
					{/if}
					
					<!-- Indicador de conexión -->
					<div
						class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white {participant.isConnected
							? 'bg-green-500'
							: 'bg-gray-400'} shadow-sm"
					></div>
				</div>

				<!-- Info del participante -->
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2">
						<span class="font-bold text-gray-900 truncate text-base">
							{participant.name}
						</span>
						{#if participant.id === currentUserId}
							<span class="px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded-full">
								Tú
							</span>
						{/if}
					</div>
					<div class="flex items-center gap-2 mt-1">
						{#if participant.isAdmin}
							<span class="text-xs font-medium text-amber-600">Administrador</span>
						{:else}
							<span class="text-xs text-gray-500">Jugador</span>
						{/if}
						<span class="text-gray-300">•</span>
						<span class="text-xs {participant.isConnected ? 'text-green-600' : 'text-gray-400'} font-medium">
							{participant.isConnected ? 'En línea' : 'Desconectado'}
						</span>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	/* Custom scrollbar */
	.custom-scrollbar::-webkit-scrollbar {
		width: 6px;
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
