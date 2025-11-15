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

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
	<!-- Elementos decorativos de fondo -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<!-- Círculos decorativos azules -->
		<div class="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
		<div class="absolute top-20 right-20 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
		<div class="absolute -bottom-10 left-1/3 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
	</div>

	<!-- Contenedor principal con grid -->
	<div class="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative z-10">
		<!-- Columna izquierda: Imágenes decorativas -->
		<div class="hidden lg:flex flex-col gap-6">
			<div class="relative group">
				<div class="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
				<div class="relative bg-white rounded-3xl p-2 shadow-2xl">
					<img src="https://i.pravatar.cc/400?img=33" alt="Competitor 1" class="w-full h-48 object-cover rounded-2xl" />
				</div>
			</div>
			<div class="relative group ml-8">
				<div class="absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl transform -rotate-3 group-hover:-rotate-6 transition-transform duration-300"></div>
				<div class="relative bg-white rounded-3xl p-2 shadow-2xl">
					<img src="https://i.pravatar.cc/400?img=68" alt="Competitor 2" class="w-full h-48 object-cover rounded-2xl" />
				</div>
			</div>
		</div>

		<!-- Columna central: Formulario principal -->
		<div class="w-full max-w-md mx-auto">
			<!-- Tarjeta principal -->
			<div class="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 space-y-6">
				<!-- Título -->
				<div class="text-center">
					<div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
						<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h1 class="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">PvP Arena</h1>
					<p class="text-gray-600 font-medium">Crea tu perfil y comienza a competir</p>
				</div>

				<!-- Avatar -->
				<div class="flex justify-center">
					<AvatarUpload {avatar} onchange={handleAvatarChange} />
				</div>

				<!-- Nombre -->
				<div>
					<label for="name" class="block text-sm font-bold text-gray-700 mb-2">
						Tu nombre
					</label>
					<input
						id="name"
						type="text"
						bind:value={name}
						oninput={handleNameChange}
						placeholder="Ingresa tu nombre"
						class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-center text-lg font-semibold"
						maxlength="20"
					/>
				</div>

				<!-- Botones principales -->
				<div class="space-y-3 pt-4">
					<button
						onclick={openCreateModal}
						class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
						</svg>
						Crear Sala
					</button>

					<button
						onclick={openJoinModal}
						class="w-full bg-white text-blue-600 font-bold py-4 rounded-xl border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-400 transition-all flex items-center justify-center gap-2"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
						</svg>
						Unirse a Sala
					</button>
				</div>

				<!-- Nota -->
				<div class="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
					<div class="flex items-center justify-center gap-2">
						<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
						</svg>
						<span>Los datos son volátiles</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Columna derecha: Más imágenes decorativas -->
		<div class="hidden lg:flex flex-col gap-6">
			<div class="relative group mr-8">
				<div class="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-3xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
				<div class="relative bg-white rounded-3xl p-2 shadow-2xl">
					<img src="https://i.pravatar.cc/400?img=12" alt="Competitor 3" class="w-full h-48 object-cover rounded-2xl" />
				</div>
			</div>
			<div class="relative group">
				<div class="absolute inset-0 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-3xl transform -rotate-3 group-hover:-rotate-6 transition-transform duration-300"></div>
				<div class="relative bg-white rounded-3xl p-2 shadow-2xl">
					<img src="https://i.pravatar.cc/400?img=56" alt="Competitor 4" class="w-full h-48 object-cover rounded-2xl" />
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Modal Crear Sala -->
{#if showCreateModal}
	<div
		role="button"
		tabindex="0"
		class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
		onclick={() => (showCreateModal = false)}
		onkeydown={(e) => e.key === 'Escape' && (showCreateModal = false)}
	>
		<div
			role="dialog"
			tabindex="-1"
			class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform transition-all"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="text-center mb-6">
				<div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
					<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
				</div>
				<h2 class="text-2xl font-black text-gray-900">Crear Sala</h2>
				<p class="text-sm text-gray-500 mt-1">Configura tu torneo</p>
			</div>

			<div class="mb-6">
				<label for="maxParticipants" class="block text-sm font-bold text-gray-700 mb-2">
					Máximo de participantes
				</label>
				<input
					id="maxParticipants"
					type="number"
					bind:value={maxParticipants}
					min="2"
					max="20"
					class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-center text-lg font-semibold"
				/>
				<p class="text-xs text-gray-500 mt-2 text-center">Entre 2 y 20 jugadores</p>
			</div>

			<div class="flex gap-3">
				<button
					onclick={() => (showCreateModal = false)}
					class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
				>
					Cancelar
				</button>
				<button
					onclick={handleCreateRoom}
					class="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
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
		class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
		onclick={() => (showJoinModal = false)}
		onkeydown={(e) => e.key === 'Escape' && (showJoinModal = false)}
	>
		<div
			role="dialog"
			tabindex="-1"
			class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform transition-all"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="text-center mb-6">
				<div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
					<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
					</svg>
				</div>
				<h2 class="text-2xl font-black text-gray-900">Unirse a Sala</h2>
				<p class="text-sm text-gray-500 mt-1">Ingresa el código de 6 dígitos</p>
			</div>

			<div class="mb-6">
				<label for="roomCode" class="block text-sm font-bold text-gray-700 mb-2">
					Código de sala
				</label>
				<input
					id="roomCode"
					type="text"
					bind:value={roomCode}
					placeholder="ABC123"
					class="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all uppercase text-center text-3xl font-black tracking-widest"
					maxlength="6"
				/>
			</div>

			<div class="flex gap-3">
				<button
					onclick={() => (showJoinModal = false)}
					class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
				>
					Cancelar
				</button>
				<button
					onclick={handleJoinRoom}
					class="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
				>
					Unirse
				</button>
			</div>
		</div>
	</div>
{/if}

{#if $wsStore.error}
	<div class="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
		❌ {$wsStore.error}
	</div>
{/if}

<style>
	@keyframes blob {
		0%, 100% {
			transform: translate(0px, 0px) scale(1);
		}
		33% {
			transform: translate(30px, -50px) scale(1.1);
		}
		66% {
			transform: translate(-20px, 20px) scale(0.9);
		}
	}
	
	.animate-blob {
		animation: blob 7s infinite;
	}
	
	.animation-delay-2000 {
		animation-delay: 2s;
	}
	
	.animation-delay-4000 {
		animation-delay: 4s;
	}
</style>
