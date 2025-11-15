<script lang="ts">
	import { onMount } from 'svelte';
	import confetti from 'canvas-confetti';
	import type { Participant } from '$lib/stores/websocket';

	interface Props {
		participant: Participant;
	}

	let { participant }: Props = $props();

	onMount(() => {
		// Mini explosión de confetti
		confetti({
			particleCount: 50,
			spread: 60,
			origin: { y: 0.7 },
			colors: ['#10b981', '#34d399', '#fbbf24']
		});
	});
</script>

<div class="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
	<div class="bg-white rounded-2xl p-6 shadow-2xl animate-popIn">
		<div class="flex items-center gap-4">
			<img
				src={participant.avatar}
				alt={participant.name}
				class="w-16 h-16 rounded-full border-2 border-green-400"
			/>
			<div>
				<div class="text-sm text-gray-600">Ganador</div>
				<div class="text-xl font-bold text-gray-800">{participant.name}</div>
			</div>
			<div class="text-3xl">🏆</div>
		</div>
	</div>
</div>

<style>
	@keyframes popIn {
		0% {
			transform: scale(0);
			opacity: 0;
		}
		50% {
			transform: scale(1.1);
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.animate-popIn {
		animation: popIn 0.5s ease-out;
	}
</style>
