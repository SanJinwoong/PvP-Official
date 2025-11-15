<script lang="ts">
	interface Props {
		avatar: string;
		size?: 'small' | 'medium' | 'large';
		editable?: boolean;
		onchange?: (avatar: string) => void;
	}

	let { avatar, size = 'large', editable = true, onchange }: Props = $props();

	let currentAvatar = $state(avatar);
	let fileInput = $state<HTMLInputElement>();

	$effect(() => {
		currentAvatar = avatar;
	});

	const sizeClasses = {
		small: 'w-12 h-12',
		medium: 'w-24 h-24',
		large: 'w-32 h-32'
	};

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (!file) return;

		if (!file.type.startsWith('image/')) {
			alert('Por favor selecciona una imagen');
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const result = e.target?.result as string;
			currentAvatar = result;
			onchange?.(result);
		};
		reader.readAsDataURL(file);
	}

	function triggerFileInput() {
		if (editable && fileInput) {
			fileInput.click();
		}
	}
</script>

<div class="flex flex-col items-center gap-2">
	<button
		type="button"
		class="relative {sizeClasses[size]} rounded-full overflow-hidden border-4 border-white shadow-lg {editable ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-default'}"
		onclick={triggerFileInput}
		disabled={!editable}
	>
		<img src={currentAvatar} alt="Avatar" class="w-full h-full object-cover" />
		{#if editable}
			<div
				class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-8 w-8 text-white"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
					/>
				</svg>
			</div>
		{/if}
	</button>

	{#if editable}
		<input
			bind:this={fileInput}
			type="file"
			accept="image/*"
			class="hidden"
			onchange={handleFileSelect}
		/>
	{/if}
</div>
