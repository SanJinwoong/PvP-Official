<script lang="ts">
	interface Props {
		class?: string;
		size?: number;
	}
	
	let { class: className = '', size = 24 }: Props = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	class={className}
>
	<circle cx="12" cy="8" r="5" stroke="currentColor" stroke-width="2" />
	<path
		d="M3 21C3 17.134 7.029 14 12 14C16.971 14 21 17.134 21 21"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
	/>
</svg>
