import './globals.css'
import Link from 'next/link'
import { Metadata } from 'next'

// ── Metadados Consolidados (PWA + SEO) ──
export const metadata: Metadata = {
  title: 'Eggdrasil — Fábrica de Ovos de Páscoa',
  description: 'Gestão inteligente de ovos de páscoa artesanais',
  manifest: '/manifest.json',
  themeColor: '#78350f',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Eggdrasil',
  },
  // Ícones específicos para garantir que apareça bonito no iOS
  icons: {
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
}

const NAV_ITEMS = [
  { href: '/',          emoji: '📊', label: 'Overview'  },
  { href: '/criar-ovo',   emoji: '🥚', label: 'Criar Ovo' },
  { href: '/ingredientes',emoji: '🍯', label: 'Insumos'   },
  { href: '/simulador',   emoji: '🧪', label: 'Lab'       },
  { href: '/vendas',      emoji: '🛒', label: 'Vendas'    },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <head>
        {/* Tags extras para mobile */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased bg-stone-50" style={{ paddingBottom: '88px' }}>
        <main className="min-h-screen">
          {children}
        </main>

        {/* ── Barra de Navegação Premium ── */}
        <nav className="nav-bar fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-stone-200 z-50">
          <div className="max-w-lg mx-auto flex justify-around items-center h-20 px-2">
            {NAV_ITEMS.map(({ href, emoji, label }) => (
              <Link 
                key={href} 
                href={href} 
                className="flex flex-col items-center gap-1 group relative px-3 py-1 flex-1"
              >
                {/* Bolinha de destaque ao hover */}
                <span
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-amber-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  aria-hidden
                />
                
                <span className="text-xl relative z-10 transition-transform duration-200 group-hover:scale-125 group-hover:-translate-y-1">
                  {emoji}
                </span>
                
                <span
                  className="text-[9px] font-black uppercase tracking-widest relative z-10 transition-colors duration-200 text-stone-400 group-hover:text-amber-900"
                >
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </nav>
      </body>
    </html>
  )
}