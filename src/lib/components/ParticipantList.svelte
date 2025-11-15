<script lang="ts">
	import type { Participant } from '$lib/stores/websocket';

	interface Props {
		participants: Participant[];
		adminId: string;
		currentUserId: string | null;
	}

	let { participants, adminId, currentUserId }: Props = $props();
</script>

<div class="bg-white rounded-2xl p-4 shadow-lg">
	<h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
		<span>👥</span>
		<span>Participantes ({participants.length})</span>
	</h2>

	<div class="space-y-2 max-h-96 overflow-y-auto">
		{#each participants as participant (participant.id)}
			<div
				class="flex items-center gap-3 p-3 rounded-xl {participant.id === currentUserId
					? 'bg-purple-100 border-2 border-purple-400'
					: 'bg-gray-50'} transition-all"
			>
				<!-- Avatar -->
				<div class="relative">
					<img
						src={participant.avatar}
						alt={participant.name}
						class="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
					/>
					{#if participant.isAdmin}
						<div
							class="absolute -top-1 -right-1 bg-yellow-400 rounded-full w-5 h-5 flex items-center justify-center text-xs"
							title="Admin"
						>
							👑
						</div>
					{/if}
				</div>

				<!-- Info -->
				<div class="flex-1 min-w-0">
					<div class="font-semibold text-gray-800 truncate">
						{participant.name}
						{#if participant.id === currentUserId}
							<span class="text-xs text-purple-600">(Tú)</span>
						{/if}
					</div>
					{#if participant.isAdmin}
						<div class="text-xs text-gray-500">Administrador</div>
					{/if}
				</div>

				<!-- Estado -->
				<div
					class="w-2 h-2 rounded-full {participant.isConnected ? 'bg-green-400' : 'bg-gray-300'}"
					title={participant.isConnected ? 'Conectado' : 'Desconectado'}
				></div>
			</div>
		{/each}
	</div>
</div>
