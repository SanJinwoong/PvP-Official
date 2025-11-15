<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { wsStore, isAdmin, currentUser, winner } from '$lib/stores/websocket';
	import ParticipantList from '$lib/components/ParticipantList.svelte';
	import BracketView from '$lib/components/BracketView.svelte';
	import AdminControls from '$lib/components/AdminControls.svelte';
	import WinAnimation from '$lib/components/WinAnimation.svelte';
	import PairWinAnimation from '$lib/components/PairWinAnimation.svelte';
	import Podium from '$lib/components/Podium.svelte';

	const roomCode = $page.params.code as string;

	let showFinalWinner = $state(false);
	let pairWinner = $state<any>(null);
	let shownWinners = new Set<string>(); // Track winners we've already shown

	onMount(() => {
		const unsubscribe = wsStore.subscribe(($ws) => {
			// Redirigir si no hay sala después de cargar
			if ($ws.connected && !$ws.room) {
				setTimeout(() => {
					goto('/');
				}, 2000);
			}

			// Mostrar ganador final
			if ($ws.room?.tournamentFinished && $winner) {
				setTimeout(() => {
					showFinalWinner = true;
				}, 1000);
			}

			// Mostrar animación de par ganador SOLO si no la hemos mostrado antes
			if ($ws.lastWinner && $ws.room) {
				const winnerKey = `${$ws.lastWinner.pairId}-${$ws.lastWinner.participantId}`;
				
				if (!shownWinners.has(winnerKey)) {
					shownWinners.add(winnerKey);
					
					const participant = $ws.room.participants.find(
						(p) => p.id === $ws.lastWinner?.participantId
					);
					if (participant) {
						pairWinner = participant;
						setTimeout(() => {
							pairWinner = null;
						}, 2500);
					}
				}
			}
		});

		return () => {
			unsubscribe();
		};
	});

	onDestroy(() => {
		wsStore.leaveRoom();
	});

	function copyRoomCode() {
		navigator.clipboard.writeText(roomCode);
		alert('Código copiado: ' + roomCode);
	}

	function handleOrganize() {
		wsStore.organizePairs(roomCode);
	}

	function handleShuffle() {
		wsStore.shufflePairs(roomCode);
	}

	function handleStart() {
		wsStore.startTournament(roomCode);
	}

	function handleMarkWinner(pairId: string, winnerId: string) {
		wsStore.markWinner(roomCode, pairId, winnerId);
	}

	function handleLeave() {
		wsStore.leaveRoom();
		goto('/');
	}
</script>

<svelte:head>
	<title>Sala {roomCode} - PvP Arena</title>
</svelte:head>

{#if !$wsStore.room}
	<div class="min-h-screen bg-linear-to-br from-purple-600 to-pink-500 flex items-center justify-center">
		<div class="text-white text-center">
			<div class="text-6xl mb-4 animate-spin">⏳</div>
			<p class="text-xl">Conectando a la sala...</p>
		</div>
	</div>
{:else}
	<div class="min-h-screen bg-linear-to-br from-purple-600 via-pink-500 to-red-500 p-4">
		<!-- Header -->
		<div class="max-w-7xl mx-auto mb-4">
			<div class="bg-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
				<div>
					<h1 class="text-2xl font-bold text-gray-800">Sala: {roomCode}</h1>
					<p class="text-sm text-gray-600">
						{$wsStore.room.participants.length} / {$wsStore.room.maxParticipants} participantes
					</p>
				</div>

				<div class="flex gap-2">
					<button
						onclick={copyRoomCode}
						class="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
					>
						📋 Copiar código
					</button>
					<button
						onclick={handleLeave}
						class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
					>
						🚪 Salir
					</button>
				</div>
			</div>
		</div>

		<!-- Main content -->
		<div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
			<!-- Columna izquierda: Participantes -->
			<div class="lg:col-span-1">
				<ParticipantList
					participants={$wsStore.room.participants}
					adminId={$wsStore.room.adminId}
					currentUserId={$wsStore.clientId}
				/>

				{#if $isAdmin}
					<div class="mt-4">
						<AdminControls
							hasPairs={$wsStore.room.pairs.length > 0}
							tournamentStarted={$wsStore.room.tournamentStarted}
							tournamentFinished={$wsStore.room.tournamentFinished}
							participantCount={$wsStore.room.participants.length}
							onOrganize={handleOrganize}
							onShuffle={handleShuffle}
							onStart={handleStart}
						/>
					</div>
				{/if}
			</div>

			<!-- Columna derecha: Brackets -->
			<div class="lg:col-span-2">
				<BracketView
					pairs={$wsStore.room.pairs}
					participants={$wsStore.room.participants}
					isAdmin={$isAdmin}
					tournamentStarted={$wsStore.room.tournamentStarted}
					onMarkWinner={handleMarkWinner}
				/>

				{#if !$wsStore.room.tournamentStarted && $wsStore.room.pairs.length === 0 && !$isAdmin}
					<div class="bg-white rounded-2xl p-8 shadow-lg text-center mt-4">
						<div class="text-6xl mb-4">⏳</div>
						<p class="text-xl text-gray-600">
							Esperando a que el admin organice los enfrentamientos...
						</p>
					</div>
				{/if}

				{#if !$wsStore.room.tournamentStarted && $wsStore.room.pairs.length > 0 && !$isAdmin}
					<div class="bg-white rounded-2xl p-8 shadow-lg text-center mt-4">
						<div class="text-6xl mb-4">🎮</div>
						<p class="text-xl text-gray-600">
							Esperando a que el admin inicie el torneo...
						</p>
					</div>
				{/if}

				{#if $wsStore.room.tournamentFinished}
					<div class="mt-4">
						<Podium participants={$wsStore.room.participants} pairs={$wsStore.room.pairs} />
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- Animación de par ganador -->
{#if pairWinner}
	<PairWinAnimation participant={pairWinner} />
{/if}

<!-- Animación de ganador final -->
{#if showFinalWinner && $winner}
	<WinAnimation winner={$winner} onClose={() => (showFinalWinner = false)} />
{/if}

<!-- Notificación de error -->
{#if $wsStore.error}
	<div class="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
		❌ {$wsStore.error}
	</div>
{/if}
