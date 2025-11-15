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

<div class="min-h-screen bg-linear-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
	<div class="max-w-md w-full">
		<!-- Tarjeta principal -->
		<div class="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
			<!-- Título -->
			<div class="text-center">
				<h1 class="text-4xl font-bold text-gray-800 mb-2">⚔️ PvP Arena</h1>
				<p class="text-gray-600">Crea tu perfil y comienza a competir</p>
			</div>

			<!-- Avatar -->
			<div class="flex justify-center">
				<AvatarUpload {avatar} onchange={handleAvatarChange} />
			</div>

			<!-- Nombre -->
			<div>
				<label for="name" class="block text-sm font-medium text-gray-700 mb-2">
					Tu nombre
				</label>
				<input
					id="name"
					type="text"
					bind:value={name}
					oninput={handleNameChange}
					placeholder="Ingresa tu nombre"
					class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-center text-lg font-semibold"
					maxlength="20"
				/>
			</div>

			<!-- Botones principales -->
			<div class="space-y-3 pt-4">
				<button
					onclick={openCreateModal}
					class="w-full bg-linear-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
				>
					🎮 Crear Sala
				</button>

				<button
					onclick={openJoinModal}
					class="w-full bg-gray-100 text-gray-800 font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors"
				>
					🚪 Unirse a Sala
				</button>
			</div>

			<!-- Nota -->
			<div class="text-center text-xs text-gray-500 pt-4 border-t">
				⚠️ Los datos son volátiles y se perderán al reiniciar el servidor
			</div>
		</div>
	</div>
</div>

<!-- Modal Crear Sala -->
{#if showCreateModal}
	<div
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
		onclick={() => (showCreateModal = false)}
	>
		<div
			class="bg-white rounded-2xl p-6 max-w-sm w-full"
			onclick={(e) => e.stopPropagation()}
		>
			<h2 class="text-2xl font-bold mb-4">Crear Sala</h2>

			<div class="mb-4">
				<label for="maxParticipants" class="block text-sm font-medium text-gray-700 mb-2">
					Máximo de participantes (2-20)
				</label>
				<input
					id="maxParticipants"
					type="number"
					bind:value={maxParticipants}
					min="2"
					max="20"
					class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
				/>
			</div>

			<div class="flex gap-3">
				<button
					onclick={() => (showCreateModal = false)}
					class="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
				>
					Cancelar
				</button>
				<button
					onclick={handleCreateRoom}
					class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
		onclick={() => (showJoinModal = false)}
	>
		<div
			class="bg-white rounded-2xl p-6 max-w-sm w-full"
			onclick={(e) => e.stopPropagation()}
		>
			<h2 class="text-2xl font-bold mb-4">Unirse a Sala</h2>

			<div class="mb-4">
				<label for="roomCode" class="block text-sm font-medium text-gray-700 mb-2">
					Código de sala
				</label>
				<input
					id="roomCode"
					type="text"
					bind:value={roomCode}
					placeholder="Ej: ABC123"
					class="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none uppercase text-center text-2xl font-bold tracking-wider"
					maxlength="6"
				/>
			</div>

			<div class="flex gap-3">
				<button
					onclick={() => (showJoinModal = false)}
					class="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
				>
					Cancelar
				</button>
				<button
					onclick={handleJoinRoom}
					class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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

