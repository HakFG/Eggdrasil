import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white p-6 pb-24">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-amber-900">Eggdrasil Overview</h1>
        <p className="text-gray-500">Gestão de Criações de Ovos</p>
      </div>

      {/* Aqui entrará o componente de lista de ovos que busca do Supabase */}
      <div className="grid gap-4">
        <div className="p-6 border-2 border-dashed rounded-xl text-center text-gray-400">
          Os ovos salvos aparecerão aqui com seus preços e emojis...
        </div>
      </div>

      {/* Barra de Navegação Fixa Embaixo */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-around shadow-2xl">
        <Link href="/ingredientes" className="flex flex-col items-center">
          <span className="text-2xl">🍯</span>
          <span className="text-xs font-bold text-black">Ingredientes</span>
        </Link>
        <Link href="/criar-ovo" className="flex flex-col items-center">
          <span className="text-2xl">➕</span>
          <span className="text-xs font-bold text-black">Criar Ovo</span>
        </Link>
        <Link href="/" className="flex flex-col items-center">
          <span className="text-2xl">📊</span>
          <span className="text-xs font-bold text-black">Overview</span>
        </Link>
      </nav>
    </main>
  )
}