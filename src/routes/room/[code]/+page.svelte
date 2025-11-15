<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { wsStore, isAdmin, currentUser, winner } from '$lib/stores/websocket';
	import ParticipantList from '$lib/components/ParticipantList.svelte';
	import BracketView from '$lib/components/BracketView.svelte';
	import ProfessionalBracket from '$lib/components/ProfessionalBracket.svelte';
	import AdminControls from '$lib/components/AdminControls.svelte';
	import WinAnimation from '$lib/components/WinAnimation.svelte';
	import PairWinAnimation from '$lib/components/PairWinAnimation.svelte';
	import Podium from '$lib/components/Podium.svelte';
	import LoadingAnimation from '$lib/components/LoadingAnimation.svelte';

	const roomCode = $page.params.code as string;

	let showFinalWinner = $state(false);
	let pairWinner = $state<any>(null);
	let shownWinners = new Set<string>(); // Track winners we've already shown
	let lastTournamentWinner = $state<string | null>(null); // Track last tournament's winner ID

	onMount(() => {
		const unsubscribe = wsStore.subscribe(($ws) => {
			// Redirigir si no hay sala después de cargar
			if ($ws.connected && !$ws.room) {
				setTimeout(() => {
					goto('/');
				}, 2000);
			}

			// Mostrar ganador final cada vez que haya un nuevo ganador
			if ($ws.room?.tournamentFinished && $winner && $winner.id !== lastTournamentWinner) {
				lastTournamentWinner = $winner.id;
				
				setTimeout(() => {
					showFinalWinner = true;
				}, 1000);
			}
			
			// Resetear animación cuando el torneo se resetee
			if (!$ws.room?.tournamentFinished && lastTournamentWinner !== null) {
				lastTournamentWinner = null;
				showFinalWinner = false;
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

	function handleOrganize(mode: '1v1' | '4-players' = '1v1', doubleMatchForBye: boolean = false) {
		wsStore.organizePairs(roomCode, mode, doubleMatchForBye);
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

	function handleReset() {
		// Resetear estado de animación
		showFinalWinner = false;
		lastTournamentWinner = null;
		shownWinners.clear();
		
		wsStore.resetTournament(roomCode);
	}

	function handleLeave() {
		wsStore.leaveRoom();
		goto('/');
	}
	
	function handleCloseWinnerAnimation() {
		showFinalWinner = false;
	}
</script>

<svelte:head>
	<title>Sala {roomCode} - PvP Arena</title>
</svelte:head>

{#if !$wsStore.room}
	<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-3xl p-12 shadow-xl border border-gray-100">
			<LoadingAnimation message="Conectando a la sala" />
		</div>
	</div>
{:else}
	<div class="min-h-screen bg-gray-50 p-4 md:p-6">
		<!-- Header Premium -->
		<div class="max-w-7xl mx-auto mb-6">
			<div class="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-4">
						<div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
							<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
						</div>
						<div>
							<h1 class="text-2xl font-black text-gray-900">Sala {roomCode}</h1>
							<p class="text-sm text-gray-500 font-medium mt-0.5">
								{$wsStore.room.participants.length} / {$wsStore.room.maxParticipants} participantes activos
							</p>
						</div>
					</div>

					<div class="flex gap-3">
						<button
							onclick={copyRoomCode}
							class="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all hover:scale-105 flex items-center gap-2"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
							</svg>
							<span class="hidden sm:inline">Copiar código</span>
						</button>
						<button
							onclick={handleLeave}
							class="px-5 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all hover:scale-105 flex items-center gap-2"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
							</svg>
							<span class="hidden sm:inline">Salir</span>
						</button>
					</div>
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
							hasBracket={$wsStore.room.bracket !== null && $wsStore.room.bracket.rounds && $wsStore.room.bracket.rounds.length > 0}
							tournamentStarted={$wsStore.room.tournamentStarted}
							tournamentFinished={$wsStore.room.tournamentFinished}
							participantCount={$wsStore.room.participants.length}
							tournamentMode={$wsStore.room.bracket?.mode || '1v1'}
							onOrganize={handleOrganize}
							onShuffle={handleShuffle}
							onStart={handleStart}
							onReset={handleReset}
						/>
					</div>
				{/if}
			</div>

		<!-- Columna derecha: Brackets -->
		<div class="lg:col-span-2">
			{#if $wsStore.room.bracket && $wsStore.room.bracket.rounds && $wsStore.room.bracket.rounds.length > 0}
				<!-- Nuevo sistema de brackets profesional -->
				<ProfessionalBracket
					rounds={$wsStore.room.bracket.rounds}
					participants={$wsStore.room.participants}
					isAdmin={$isAdmin}
					tournamentStarted={$wsStore.room.tournamentStarted}
					tournamentMode={$wsStore.room.bracket.mode || '1v1'}
					onMarkWinner={handleMarkWinner}
				/>
			{:else}
				<!-- Sistema antiguo de brackets (fallback) -->
				<BracketView
					pairs={$wsStore.room.pairs}
					participants={$wsStore.room.participants}
					isAdmin={$isAdmin}
					tournamentStarted={$wsStore.room.tournamentStarted}
					onMarkWinner={handleMarkWinner}
				/>
			{/if}				{#if !$wsStore.room.tournamentStarted && $wsStore.room.pairs.length === 0 && !$isAdmin}
					<div class="bg-white rounded-3xl p-12 shadow-xl text-center border border-gray-100">
						<LoadingAnimation message="Esperando al administrador" />
						<p class="text-gray-500 mt-4">
							El admin organizará los enfrentamientos pronto
						</p>
					</div>
				{/if}

				{#if !$wsStore.room.tournamentStarted && $wsStore.room.pairs.length > 0 && !$isAdmin}
					<div class="bg-white rounded-3xl p-12 shadow-xl text-center border border-gray-100">
						<div class="w-20 h-20 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center animate-pulse">
							<svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<p class="text-xl font-bold text-gray-900 mb-2">
							¡Todo listo para comenzar!
						</p>
						<p class="text-gray-500">
							Esperando a que el admin inicie el torneo
						</p>
					</div>
				{/if}

				{#if $wsStore.room.tournamentFinished}
					<div class="mt-4">
						<Podium 
							participants={$wsStore.room.participants} 
							pairs={$wsStore.room.pairs}
							bracket={$wsStore.room.bracket}
						/>
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
	<WinAnimation winner={$winner} onClose={handleCloseWinnerAnimation} />
{/if}

<!-- Notificación de error -->
{#if $wsStore.error}
	<div class="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
		❌ {$wsStore.error}
	</div>
{/if}
