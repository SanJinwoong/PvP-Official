<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import AvatarUpload from '$lib/components/AvatarUpload.svelte';
	import { userProfile } from '$lib/stores/user';
	import { wsStore } from '$lib/stores/websocket';

	let name = $state('');
	let avatar = $state($userProfile.avatar);
	let showCreateModal = $state(false);
	let showJoinModal = $state(false);
	let maxParticipants = $state(8);
	let roomCode = $state('');

	onMount(() => {
		name = $userProfile.name;
		avatar = $userProfile.avatar;

		// Suscribirse a cambios en la sala solo para redirección
		const unsubscribe = wsStore.subscribe(($ws) => {
			if ($ws.room) {
				goto(`/room/${$ws.room.code}`);
			}
		});

		return () => {
			unsubscribe();
		};
	});

	function handleNameChange(event: Event) {
		const input = event.target as HTMLInputElement;
		name = input.value;
		userProfile.setName(name);
	}

	function handleAvatarChange(newAvatar: string) {
		avatar = newAvatar;
		userProfile.setAvatar(newAvatar);
	}

	function openCreateModal() {
		if (!name.trim()) {
			alert('Por favor ingresa tu nombre');
			return;
		}
		showCreateModal = true;
	}

	function openJoinModal() {
		if (!name.trim()) {
			alert('Por favor ingresa tu nombre');
			return;
		}
		showJoinModal = true;
	}

	function handleCreateRoom() {
		if (!name.trim()) {
			alert('Por favor ingresa tu nombre');
			return;
		}
		wsStore.createRoom(maxParticipants, name, avatar);
		showCreateModal = false;
	}

	function handleJoinRoom() {
		if (!name.trim() || !roomCode.trim()) {
			alert('Por favor completa todos los campos');
			return;
		}
		wsStore.joinRoom(roomCode.toUpperCase(), name, avatar);
		showJoinModal = false;
	}
</script>

<svelte:head>
	<title>PvP Arena - Sala de Batallas</title>
</svelte:head>

<div class="min-h-screen relative overflow-hidden flex items-center justify-center">
	<!-- Imagen de fondo con overlay -->
	<div class="absolute inset-0">
		<!-- Imagen de fondo -->
		<img 
			src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop" 
			alt="Gaming background" 
			class="w-full h-full object-cover"
		/>
		<!-- Overlay gradiente oscuro -->
		<div class="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-indigo-900/90 to-blue-800/95"></div>
		
		<!-- Efectos de luz -->
		<div class="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse"></div>
		<div class="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full filter blur-3xl animate-pulse" style="animation-delay: 1s"></div>
	</div>

	<!-- Contenido principal -->
	<div class="relative z-10 w-full max-w-md mx-auto p-6">
		<!-- Logo y título -->
		<div class="text-center mb-8">
			<div class="inline-block mb-6">
				<div class="w-20 h-20 mx-auto rounded-full bg-white flex items-center justify-center shadow-2xl">
					<svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				</div>
			</div>
			<h1 class="text-5xl font-black text-white mb-3 tracking-tight">PvP Arena</h1>
			<p class="text-blue-200 text-lg font-medium">Never Lost. Discover New Battles.</p>
		</div>

		<!-- Card de login -->
		<div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl space-y-6">
			<!-- Avatar -->
			<div class="flex justify-center mb-2">
				<AvatarUpload {avatar} onchange={handleAvatarChange} />
			</div>

			<!-- Input de nombre -->
			<div>
				<input
					id="name"
					type="text"
					bind:value={name}
					oninput={handleNameChange}
					placeholder="Tu nombre"
					class="w-full px-6 py-4 bg-white/90 backdrop-blur-sm rounded-2xl border-0 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all text-center text-lg font-semibold text-gray-900 placeholder-gray-400 shadow-lg"
					maxlength="20"
				/>
			</div>

			<!-- Botones -->
			<div class="space-y-3 pt-2">
				<button
					onclick={openCreateModal}
					class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 px-6 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 text-lg"
				>
					CREAR SALA
				</button>

				<button
					onclick={openJoinModal}
					class="w-full bg-white/10 backdrop-blur-sm text-white font-bold py-4 px-6 rounded-full border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-200 text-lg"
				>
					UNIRSE A SALA
				</button>
			</div>

			<!-- Texto inferior -->
			<p class="text-center text-white/60 text-sm pt-4 border-t border-white/10">
				Salas temporales • Batallas épicas
			</p>
		</div>

		<!-- Info adicional -->
		<div class="text-center mt-6">
			<p class="text-blue-200/70 text-xs flex items-center justify-center gap-2">
				<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
				</svg>
				Los datos son volátiles y se reinician con el servidor
			</p>
		</div>
	</div>
</div>

<!-- Modal Crear Sala -->
{#if showCreateModal}
	<div
		role="button"
		tabindex="0"
		class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50"
		onclick={() => (showCreateModal = false)}
		onkeydown={(e) => e.key === 'Escape' && (showCreateModal = false)}
	>
		<div
			role="dialog"
			tabindex="-1"
			class="bg-gradient-to-br from-blue-900/95 to-indigo-900/95 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-sm w-full shadow-2xl transform transition-all"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="text-center mb-6">
				<div class="w-16 h-16 mx-auto mb-4 rounded-full bg-white flex items-center justify-center shadow-lg">
					<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
				</div>
				<h2 class="text-2xl font-black text-white mb-2">CREAR SALA</h2>
				<p class="text-sm text-blue-200">Configura tu torneo épico</p>
			</div>

			<div class="mb-6">
				<label for="maxParticipants" class="block text-sm font-bold text-white/80 mb-3 text-center">
					Máximo de participantes
				</label>
				<input
					id="maxParticipants"
					type="number"
					bind:value={maxParticipants}
					min="2"
					max="20"
					class="w-full px-6 py-4 bg-white/90 backdrop-blur-sm rounded-2xl border-0 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all text-center text-2xl font-black text-gray-900 shadow-lg"
				/>
				<p class="text-xs text-blue-200/70 mt-3 text-center">Entre 2 y 20 jugadores</p>
			</div>

			<div class="flex gap-3">
				<button
					onclick={() => (showCreateModal = false)}
					class="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm text-white font-bold rounded-full border-2 border-white/30 hover:bg-white/20 transition-all"
				>
					Cancelar
				</button>
				<button
					onclick={handleCreateRoom}
					class="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
				>
					Crear
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal Unirse -->
{#if showJoinModal}
	<div
		role="button"
		tabindex="0"
		class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50"
		onclick={() => (showJoinModal = false)}
		onkeydown={(e) => e.key === 'Escape' && (showJoinModal = false)}
	>
		<div
			role="dialog"
			tabindex="-1"
			class="bg-gradient-to-br from-blue-900/95 to-indigo-900/95 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-sm w-full shadow-2xl transform transition-all"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="text-center mb-6">
				<div class="w-16 h-16 mx-auto mb-4 rounded-full bg-white flex items-center justify-center shadow-lg">
					<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
					</svg>
				</div>
				<h2 class="text-2xl font-black text-white mb-2">UNIRSE</h2>
				<p class="text-sm text-blue-200">Ingresa el código de 6 dígitos</p>
			</div>

			<div class="mb-6">
				<input
					id="roomCode"
					type="text"
					bind:value={roomCode}
					placeholder="ABC123"
					class="w-full px-6 py-5 bg-white/90 backdrop-blur-sm rounded-2xl border-0 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all uppercase text-center text-4xl font-black tracking-widest text-gray-900 placeholder-gray-400 shadow-lg"
					maxlength="6"
				/>
			</div>

			<div class="flex gap-3">
				<button
					onclick={() => (showJoinModal = false)}
					class="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm text-white font-bold rounded-full border-2 border-white/30 hover:bg-white/20 transition-all"
				>
					Cancelar
				</button>
				<button
					onclick={handleJoinRoom}
					class="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
				>
					Unirse
				</button>
			</div>
		</div>
	</div>
{/if}

{#if $wsStore.error}
	<div class="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-full shadow-2xl z-50 backdrop-blur-xl border border-red-400">
		<div class="flex items-center gap-2">
			<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
				<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
			</svg>
			<span class="font-semibold">{$wsStore.error}</span>
		</div>
	</div>
{/if}
