<script lang="ts">
	import Trophy from './icons/Trophy.svelte';
	
	interface Props {
		message?: string;
	}
	
	let { message = 'Cargando...' }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center gap-6 py-8">
	<!-- Trofeo flotante animado -->
	<div class="relative">
		<!-- Glow effect -->
		<div class="absolute inset-0 bg-amber-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
		
		<!-- Trofeo flotante -->
		<div class="relative w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex items-center justify-center shadow-2xl animate-float">
			<Trophy class="text-white drop-shadow-lg" size={48} />
		</div>
		
		<!-- Partículas orbitando -->
		<div class="absolute inset-0 animate-spin-slow">
			<div class="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-400 rounded-full shadow-lg animate-pulse"></div>
		</div>
		<div class="absolute inset-0 animate-spin-reverse">
			<div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-400 rounded-full shadow-lg animate-pulse"></div>
		</div>
		<div class="absolute inset-0 animate-spin-slow" style="animation-delay: 0.5s">
			<div class="absolute top-1/2 left-0 -translate-y-1/2 w-2.5 h-2.5 bg-blue-300 rounded-full shadow-lg animate-pulse"></div>
		</div>
	</div>
	
	<!-- Mensaje -->
	<div class="text-center space-y-2">
		<p class="text-xl font-bold text-gray-900 animate-pulse">{message}</p>
		<div class="flex gap-1.5 justify-center">
			<div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0s"></div>
			<div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.15s"></div>
			<div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.3s"></div>
		</div>
	</div>
</div>

<style>
	@keyframes float {
		0%, 100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-20px);
		}
	}
	
	@keyframes spin-slow {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
	
	@keyframes spin-reverse {
		from {
			transform: rotate(360deg);
		}
		to {
			transform: rotate(0deg);
		}
	}
	
	.animate-float {
		animation: float 3s ease-in-out infinite;
	}
	
	.animate-spin-slow {
		animation: spin-slow 4s linear infinite;
	}
	
	.animate-spin-reverse {
		animation: spin-reverse 6s linear infinite;
	}
</style>
