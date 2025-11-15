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
		d="M6 9C6 10.5913 6.63214 12.1174 7.75736 13.2426C8.88258 14.3679 10.4087 15 12 15C13.5913 15 15.1174 14.3679 16.2426 13.2426C17.3679 12.1174 18 10.5913 18 9V4H6V9Z"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<path
		d="M6 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V7C2 7.79565 2.31607 8.55871 2.87868 9.12132C3.44129 9.68393 4.20435 10 5 10H6"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<path
		d="M18 4H20C20.5304 4 21.0391 4.21071 21.4142 4.58579C21.7893 4.96086 22 5.46957 22 6V7C22 7.79565 21.6839 8.55871 21.1213 9.12132C20.5587 9.68393 19.7956 10 19 10H18"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<path
		d="M9 15V19H15V15"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<path
		d="M8 19H16C16.5304 19 17.0391 19.2107 17.4142 19.5858C17.7893 19.9609 18 20.4696 18 21V22H6V21C6 20.4696 6.21071 19.9609 6.58579 19.5858C6.96086 19.2107 7.46957 19 8 19Z"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</svg>
