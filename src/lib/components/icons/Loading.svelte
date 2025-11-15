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
	<path
		d="M12 2C13.3132 2 14.6136 2.25866 15.8268 2.7612C17.0401 3.26375 18.1425 4.00035 19.0711 4.92893C19.9997 5.85752 20.7363 6.95991 21.2388 8.17317C21.7413 9.38643 22 10.6868 22 12"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
	/>
	<path
		d="M12 22C10.6868 22 9.38643 21.7413 8.17317 21.2388C6.95991 20.7363 5.85752 19.9997 4.92893 19.0711C4.00035 18.1425 3.26375 17.0401 2.7612 15.8268C2.25866 14.6136 2 13.3132 2 12"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-dasharray="2 4"
	/>
</svg>
