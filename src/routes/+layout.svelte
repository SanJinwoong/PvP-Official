<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount, onDestroy } from 'svelte';
	import { startAutoCleanup, stopAutoCleanup } from '$lib/cleanup';

	let { children } = $props();

	onMount(() => {
		// Iniciar limpieza automática de salas inactivas
		startAutoCleanup();
	});

	onDestroy(() => {
		stopAutoCleanup();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
