<script lang="ts">
	import { onMount } from 'svelte';
	import confetti from 'canvas-confetti';
	import type { Participant } from '$lib/stores/websocket';

	interface Props {
		winner: Participant;
		onClose?: () => void;
	}

	let { winner, onClose }: Props = $props();

	onMount(() => {
		// Explosión de confetti
		const duration = 3000;
		const end = Date.now() + duration;

		const interval = setInterval(() => {
			if (Date.now() > end) {
				clearInterval(interval);
				return;
			}

			confetti({
				particleCount: 2,
				angle: 60,
				spread: 55,
				origin: { x: 0 },
				colors: ['#9333ea', '#ec4899', '#ef4444']
			});

			confetti({
				particleCount: 2,
				angle: 120,
				spread: 55,
				origin: { x: 1 },
				colors: ['#9333ea', '#ec4899', '#ef4444']
			});
		}, 50);

		// Confetti grande inicial
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 },
			colors: ['#9333ea', '#ec4899', '#ef4444', '#fbbf24']
		});

		return () => {
			clearInterval(interval);
		};
	});
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
	<!-- Overlay -->
	<div class="absolute inset-0 bg-black bg-opacity-70"></div>

	<!-- Content -->
	<div class="relative bg-white rounded-3xl p-8 max-w-md w-full text-center animate-scaleIn">
		<!-- Trofeo animado -->
		<div class="text-8xl mb-4 animate-bounce">🏆</div>

		<!-- Avatar del ganador -->
		<div class="flex justify-center mb-4">
			<img
				src={winner.avatar}
				alt={winner.name}
				class="w-32 h-32 rounded-full border-4 border-yellow-400 shadow-2xl"
			/>
		</div>

		<!-- Nombre -->
		<h1 class="text-4xl font-bold text-gray-800 mb-2">¡GANADOR!</h1>
		<p class="text-2xl font-semibold text-purple-600 mb-6">{winner.name}</p>

		<!-- Estrellas -->
		<div class="flex justify-center gap-2 mb-6">
			<span class="text-3xl animate-pulse">⭐</span>
			<span class="text-3xl animate-pulse" style="animation-delay: 0.2s">⭐</span>
			<span class="text-3xl animate-pulse" style="animation-delay: 0.4s">⭐</span>
		</div>

		{#if onClose}
			<button
				onclick={onClose}
				class="px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
			>
				Continuar
			</button>
		{/if}
	</div>
</div>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes scaleIn {
		from {
			transform: scale(0.8);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	.animate-fadeIn {
		animation: fadeIn 0.3s ease-out;
	}

	.animate-scaleIn {
		animation: scaleIn 0.5s ease-out;
	}
</style>
