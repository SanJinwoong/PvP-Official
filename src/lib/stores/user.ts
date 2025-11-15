import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface UserProfile {
	name: string;
	avatar: string;
}

const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iIzk0YTNiOCIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9Ijg1IiByPSIzNSIgZmlsbD0iI2ZmZiIvPjxlbGxpcHNlIGN4PSIxMDAiIGN5PSIxNzAiIHJ4PSI2MCIgcnk9IjQ1IiBmaWxsPSIjZmZmIi8+PC9zdmc+';

function createUserStore() {
	const defaultProfile: UserProfile = {
		name: '',
		avatar: DEFAULT_AVATAR
	};

	// Cargar del localStorage si existe
	const stored = browser ? localStorage.getItem('userProfile') : null;
	const initial = stored ? JSON.parse(stored) : defaultProfile;

	const { subscribe, set, update } = writable<UserProfile>(initial);

	return {
		subscribe,
		setName: (name: string) => {
			update(profile => {
				const newProfile = { ...profile, name };
				if (browser) {
					localStorage.setItem('userProfile', JSON.stringify(newProfile));
				}
				return newProfile;
			});
		},
		setAvatar: (avatar: string) => {
			update(profile => {
				const newProfile = { ...profile, avatar };
				if (browser) {
					localStorage.setItem('userProfile', JSON.stringify(newProfile));
				}
				return newProfile;
			});
		},
		reset: () => {
			set(defaultProfile);
			if (browser) {
				localStorage.removeItem('userProfile');
			}
		}
	};
}

export const userProfile = createUserStore();
