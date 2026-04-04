import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Eggdrasil — Fábrica de Ovos de Páscoa',
  description: 'Gestão inteligente de ovos de páscoa artesanais',
}

const NAV_ITEMS = [
  { href: '/',            emoji: '📊', label: 'Overview'  },
  { href: '/criar-ovo',   emoji: '🥚', label: 'Criar Ovo' },
  { href: '/ingredientes',emoji: '🍯', label: 'Insumos'   },
  { href: '/simulador',   emoji: '🧪', label: 'Lab'       },
  { href: '/vendas',      emoji: '🛒', label: 'Vendas'    },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased" style={{ paddingBottom: '88px' }}>
        <main className="min-h-screen">
          {children}
        </main>

        {/* ── Barra de Navegação Premium ── */}
        <nav className="nav-bar">
          <div className="max-w-lg mx-auto flex justify-around items-center">
            {NAV_ITEMS.map(({ href, emoji, label }) => (
              <Link key={href} href={href} className="flex flex-col items-center gap-1 group relative px-3 py-1">
                {/* Bolinha de destaque ao hover */}
                <span
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  aria-hidden
                />
                <span className="text-xl relative z-10 transition-transform duration-200 group-hover:scale-125 group-hover:-translate-y-0.5">
                  {emoji}
                </span>
                <span
                  className="text-[9px] font-bold uppercase tracking-widest relative z-10 transition-colors duration-200"
                  style={{ color: 'var(--egg-muted)' }}
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