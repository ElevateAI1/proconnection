import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'serif-display': ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'], // Elegant serif para títulos
				'sans-geometric': ['Inter', 'Space Grotesk', 'system-ui', 'sans-serif'], // Sans geométrica limpia
				'playfair': ['Playfair Display', 'serif'],
				'inter': ['Inter', 'sans-serif'],
				'crimson': ['Crimson Text', 'serif'],
			},
			colors: {
				// Paleta salud mental - Colores principales
				'blue-soft': '#6CAFF0',        // Azul suave
				'celeste-gray': '#AFC7DA',     // Celeste grisáceo
				'gray-light': '#E8EAED',       // Gris neutro claro
				'white-warm': '#FDFDFB',       // Blanco cálido
				// Colores de acento
				'blue-petrol': '#3E5F78',      // Azul petróleo suave
				'green-mint': '#B9E4C9',       // Verde menta tenue
				'peach-pale': '#F7D2C4',       // Durazno pálido
				// Colores de apoyo
				'lavender-soft': '#C9C2E6',    // Lavanda suave
				'sand-light': '#E6DCC5',       // Arena clara
				'gray-warm': '#B5B5B5',        // Gris medio cálido
				// Legacy colors for backwards compatibility
				'cream': '#FDFDFB',
				'charcoal': '#3E5F78',
				'purple': '#C9C2E6',
				'emerald': '#B9E4C9',
				'gold': '#E6DCC5',
				'gold-light': '#E6DCC5',
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-in-scale': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'shine': {
					'0%': {
						backgroundPosition: '0% 50%'
					},
					'50%': {
						backgroundPosition: '100% 50%'
					},
					'100%': {
						backgroundPosition: '0% 50%'
					}
			},
				'text-shine': {
					'0%': {
						backgroundPosition: '-200% center'
					},
					'100%': {
						backgroundPosition: '200% center'
					}
				},
				'text-reveal': {
					'0%': {
						opacity: '0',
						transform: 'translateY(100%)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'card-enter': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.95) translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1) translateY(0)'
					}
				},
				'particle-dust': {
					'0%, 100%': {
						transform: 'translate(0, 0) rotate(0deg)',
						opacity: '0.3'
					},
					'50%': {
						transform: 'translate(20px, -20px) rotate(180deg)',
						opacity: '0.6'
					}
				},
				'gradient-shift': {
					'0%, 100%': {
						backgroundPosition: '0% 50%'
					},
					'25%': {
						backgroundPosition: '100% 50%'
					},
					'50%': {
						backgroundPosition: '100% 100%'
					},
					'75%': {
						backgroundPosition: '0% 100%'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in-up': 'fade-in-up 0.8s ease-out',
				'fade-in-scale': 'fade-in-scale 0.6s ease-out',
				'shine': 'shine 3s ease-in-out infinite',
				'text-reveal': 'text-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
				'card-enter': 'card-enter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
				'particle-dust': 'particle-dust 20s ease-in-out infinite',
				'rotate-y-6': 'rotate-y-6 0.3s ease-out',
				'rotate-y-2': 'rotate-y-2 0.3s ease-out',
				'gradient-shift': 'gradient-shift 30s ease-in-out infinite',
				'text-shine': 'text-shine 4s ease-in-out infinite'
			},
			backgroundImage: {
				'premium-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				'gold-gradient': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
				'luxury-gradient': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
				'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
			},
			boxShadow: {
				'premium': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
				'luxury': '0 20px 40px -4px rgba(0, 0, 0, 0.1), 0 8px 16px -4px rgba(0, 0, 0, 0.06)',
				'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
				'inner-glow': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
