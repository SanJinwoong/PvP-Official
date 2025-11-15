// Design System - PvP Arena
// Inspirado en diseño minimalista premium

export const theme = {
	colors: {
		// Neutrales minimalistas
		background: '#FAFAFA',
		surface: '#FFFFFF',
		surfaceElevated: '#FFFFFF',
		border: '#E5E7EB',
		borderLight: '#F3F4F6',
		
		// Textos
		textPrimary: '#111827',
		textSecondary: '#6B7280',
		textTertiary: '#9CA3AF',
		
		// Colores de acento - Premium
		primary: '#2563EB', // Azul sofisticado
		primaryLight: '#3B82F6',
		primaryDark: '#1E40AF',
		
		// Ganador - Oro premium
		winner: '#F59E0B',
		winnerLight: '#FCD34D',
		winnerDark: '#D97706',
		winnerGradient: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #D97706 100%)',
		
		// Estados
		success: '#10B981',
		successLight: '#34D399',
		error: '#EF4444',
		warning: '#F59E0B',
		
		// Sombras sutiles
		shadow: {
			sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
			md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
			lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
			xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
			winner: '0 20px 40px -5px rgba(245, 158, 11, 0.3)',
		}
	},
	
	spacing: {
		xs: '0.25rem',    // 4px
		sm: '0.5rem',     // 8px
		md: '1rem',       // 16px
		lg: '1.5rem',     // 24px
		xl: '2rem',       // 32px
		'2xl': '3rem',    // 48px
		'3xl': '4rem',    // 64px
	},
	
	borderRadius: {
		sm: '0.375rem',   // 6px
		md: '0.5rem',     // 8px
		lg: '0.75rem',    // 12px
		xl: '1rem',       // 16px
		'2xl': '1.5rem',  // 24px
		full: '9999px',
	},
	
	typography: {
		fontFamily: {
			sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
			display: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
		},
		fontSize: {
			xs: '0.75rem',     // 12px
			sm: '0.875rem',    // 14px
			base: '1rem',      // 16px
			lg: '1.125rem',    // 18px
			xl: '1.25rem',     // 20px
			'2xl': '1.5rem',   // 24px
			'3xl': '1.875rem', // 30px
			'4xl': '2.25rem',  // 36px
			'5xl': '3rem',     // 48px
		},
		fontWeight: {
			normal: '400',
			medium: '500',
			semibold: '600',
			bold: '700',
		}
	},
	
	animation: {
		transition: {
			fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
			base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
			slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
		},
		spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
	}
};
