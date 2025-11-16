<script lang="ts">
	import { onMount } from 'svelte';

	let stats = $state<any>(null);
	let loading = $state(true);
	let message = $state('');
	let cleaning = $state(false);

	async function loadStats() {
		loading = true;
		message = ''; // Limpiar mensaje anterior
		try {
			console.log('🔍 Cargando estadísticas...');
			const response = await fetch('/api/db-stats');
			console.log('📡 Response status:', response.status);
			
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
			
			const data = await response.json();
			console.log('📊 Data recibida:', data);
			
			if (!data.success) {
				throw new Error(data.error || 'Error desconocido');
			}
			
			stats = data.stats;
			message = data.message;
			console.log('✅ Estadísticas cargadas:', stats);
		} catch (err: any) {
			console.error('❌ Error cargando estadísticas:', err);
			message = `❌ Error: ${err.message}`;
			stats = null;
		}
		loading = false;
	}

	async function cleanup(minutes: number) {
		if (!confirm(`¿Eliminar salas con más de ${minutes} minutos de inactividad?`)) return;
		
		cleaning = true;
		message = '🧹 Limpiando...';
		
		try {
			const response = await fetch(`/api/db-stats?action=cleanup&minutes=${minutes}`, {
				method: 'POST'
			});
			const data = await response.json();
			message = data.message;
			await loadStats();
		} catch (err) {
			message = '❌ Error en limpieza';
		}
		
		cleaning = false;
	}

	async function deleteAll() {
		if (!confirm('⚠️ ¿ELIMINAR TODAS LAS SALAS? Esta acción no se puede deshacer.')) return;
		if (!confirm('🚨 ¿ESTÁS COMPLETAMENTE SEGURO? Se eliminarán TODAS las salas activas.')) return;
		
		cleaning = true;
		message = '🗑️ Eliminando todo...';
		
		try {
			const response = await fetch('/api/db-stats?action=deleteAll', {
				method: 'POST'
			});
			const data = await response.json();
			message = data.message;
			await loadStats();
		} catch (err) {
			message = '❌ Error eliminando';
		}
		
		cleaning = false;
	}

	onMount(() => {
		loadStats();
	});
</script>

<svelte:head>
	<title>Diagnóstico DB - PvP Arena</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 p-8">
	<div class="max-w-4xl mx-auto">
		<!-- Header -->
		<div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-6">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-black text-gray-900 mb-2">🔍 Diagnóstico de Base de Datos</h1>
					<p class="text-gray-600">Estado actual de Supabase - PvP Arena</p>
				</div>
				<button
					onclick={loadStats}
					disabled={loading}
					class="px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
					</svg>
					{loading ? 'Cargando...' : 'Recargar'}
				</button>
			</div>
		</div>

		<!-- Stats Card -->
		{#if loading}
			<div class="bg-white rounded-3xl p-12 shadow-xl text-center">
				<div class="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
				<p class="text-gray-600 mt-4">Cargando estadísticas...</p>
			</div>
		{:else if stats}
			<div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-6">
				<h2 class="text-2xl font-bold text-gray-900 mb-6">📊 Estadísticas</h2>
				
				<div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
					<div class="bg-gray-50 rounded-2xl p-4 text-center">
						<div class="text-3xl font-black text-gray-900">{stats.total}</div>
						<div class="text-sm text-gray-600 mt-1">Total</div>
					</div>
					
					<div class="bg-green-50 rounded-2xl p-4 text-center">
						<div class="text-3xl font-black text-green-600">{stats.active}</div>
						<div class="text-sm text-gray-600 mt-1">Activas</div>
						<div class="text-xs text-gray-500">&lt;10min</div>
					</div>
					
					<div class="bg-yellow-50 rounded-2xl p-4 text-center">
						<div class="text-3xl font-black text-yellow-600">{stats.stale}</div>
						<div class="text-sm text-gray-600 mt-1">Stale</div>
						<div class="text-xs text-gray-500">10-60min</div>
					</div>
					
					<div class="bg-red-50 rounded-2xl p-4 text-center">
						<div class="text-3xl font-black text-red-600">{stats.dead}</div>
						<div class="text-sm text-gray-600 mt-1">Dead</div>
						<div class="text-xs text-gray-500">1-24hr</div>
					</div>
					
					<div class="bg-purple-50 rounded-2xl p-4 text-center">
						<div class="text-3xl font-black text-purple-600">{stats.ancient}</div>
						<div class="text-sm text-gray-600 mt-1">Ancient</div>
						<div class="text-xs text-gray-500">&gt;24hr</div>
					</div>
				</div>

				{#if message}
					<div class="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-blue-800 text-center">
						{message}
					</div>
				{/if}
			</div>

			<!-- Actions -->
			<div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-6">
				<h2 class="text-2xl font-bold text-gray-900 mb-6">🛠️ Acciones de Limpieza</h2>
				
				<div class="space-y-3">
					<button
						onclick={() => cleanup(5)}
						disabled={cleaning}
						class="w-full px-6 py-4 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
					>
						<span>🧹 Limpiar salas &gt;5 minutos</span>
						<span class="text-sm opacity-90">(Recomendado)</span>
					</button>

					<button
						onclick={() => cleanup(60)}
						disabled={cleaning}
						class="w-full px-6 py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
					>
						<span>🧹 Limpiar salas &gt;60 minutos</span>
						<span class="text-sm opacity-90">(Conservador)</span>
					</button>

					<button
						onclick={() => cleanup(1440)}
						disabled={cleaning}
						class="w-full px-6 py-4 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
					>
						<span>🧹 Limpiar salas &gt;24 horas</span>
						<span class="text-sm opacity-90">(Solo ancient)</span>
					</button>

					<div class="border-t-2 border-gray-200 my-4"></div>

					<button
						onclick={deleteAll}
						disabled={cleaning}
						class="w-full px-6 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
					>
						⚠️ ELIMINAR TODAS LAS SALAS (PELIGROSO)
					</button>
				</div>
			</div>

			<!-- Room List -->
			{#if stats.rooms && stats.rooms.length > 0}
				<div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
					<h2 class="text-2xl font-bold text-gray-900 mb-6">📋 Lista de Salas ({stats.rooms.length})</h2>
					
					<div class="space-y-2 max-h-96 overflow-y-auto">
						{#each stats.rooms as room}
							{@const updated = new Date(room.updated_at)}
							{@const minutesAgo = Math.round((Date.now() - updated.getTime()) / 1000 / 60)}
							{@const statusColor = minutesAgo < 10 ? 'green' : minutesAgo < 60 ? 'yellow' : minutesAgo < 1440 ? 'red' : 'purple'}
							
							<div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
								<div class="flex items-center gap-4">
									<div class="w-3 h-3 rounded-full bg-{statusColor}-500"></div>
									<div>
										<div class="font-bold text-gray-900">{room.code}</div>
										<div class="text-sm text-gray-600">
											{room.participants?.length || 0} / {room.max_participants} participantes
										</div>
									</div>
								</div>
								<div class="text-right">
									<div class="text-sm text-gray-600">
										Hace {minutesAgo < 60 ? `${minutesAgo} min` : minutesAgo < 1440 ? `${Math.round(minutesAgo/60)} hrs` : `${Math.round(minutesAgo/1440)} días`}
									</div>
									<div class="text-xs text-gray-400">
										{updated.toLocaleString('es-ES')}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{:else}
			<!-- Error state -->
			<div class="bg-red-50 border-2 border-red-200 rounded-3xl p-12 shadow-xl text-center">
				<svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<h2 class="text-2xl font-bold text-red-800 mb-2">Error Cargando Datos</h2>
				<p class="text-red-700 mb-6">{message || 'No se pudieron cargar las estadísticas'}</p>
				<button
					onclick={loadStats}
					class="px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all"
				>
					🔄 Reintentar
				</button>
				<div class="mt-6 p-4 bg-white rounded-xl text-left">
					<p class="text-sm text-gray-700 mb-2"><strong>Posibles causas:</strong></p>
					<ul class="text-sm text-gray-600 space-y-1 list-disc list-inside">
						<li>Supabase está caído o muy lento</li>
						<li>Error de conexión a internet</li>
						<li>El servidor necesita reiniciarse</li>
					</ul>
					<p class="text-sm text-gray-700 mt-4"><strong>Abre la consola del navegador (F12) para ver detalles del error.</strong></p>
				</div>
			</div>
		{/if}

		<!-- Back Button -->
		<div class="mt-6 text-center">
			<a href="/" class="inline-block px-8 py-3 bg-gray-600 text-white font-bold rounded-xl hover:bg-gray-700 transition-all">
				← Volver al inicio
			</a>
		</div>
	</div>
</div>
