'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const EMOJIS = [
  '🍫','🥛','🍬','🍓','🥥','🍯','🥚','🥜',
  '🍪','🍦','🍰','🧁','🍮','🍋','🍇','🍒',
  '🍑','🍍','🧂','🧈','🥃','🌾','🍂','✨',
]

const UNIDADES = [
  { label: 'Gramas (g)',    value: 'g'      },
  { label: 'Quilos (kg)',   value: 'kg'     },
  { label: 'Mililitros (ml)', value: 'ml'  },
  { label: 'Litros (L)',    value: 'L'      },
  { label: 'Unidade (un)', value: 'un'     },
  { label: 'Colher (cl)',   value: 'colher' },
  { label: 'Xícara (xc)',   value: 'xícara' },
]

export default function Ingredientes() {
  const [nome,    setNome]    = useState('')
  const [unidade, setUnidade] = useState('g')
  const [emoji,   setEmoji]   = useState('🍫')
  const [lista,   setLista]   = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [hoverId, setHoverId] = useState<string | null>(null)

  const carregar = async () => {
    const { data } = await supabase.from('ingredientes').select('*').order('nome')
    setLista(data || [])
  }
  useEffect(() => { carregar() }, [])

  async function salvar() {
    if (!nome.trim()) return
    setLoading(true)
    await supabase.from('ingredientes').insert([{ nome, unidade, emoji }])
    setNome('')
    setLoading(false)
    carregar()
  }

  async function excluir(id: string) {
    if (!confirm('Remover este insumo?')) return
    await supabase.from('ingredientes').delete().eq('id', id)
    carregar()
  }

  return (
    <div className="max-w-xl mx-auto px-5 pt-8 pb-8">

      {/* ── Header ── */}
      <header className="mb-8 animate-fade-up" style={{ animationFillMode: 'both' }}>
        <p className="section-label mb-1">gestão de estoque</p>
        <h1 className="font-display text-4xl font-black italic" style={{ color: 'var(--egg-choco)' }}>
          Insumos
        </h1>
        <p className="text-sm font-medium mt-1" style={{ color: 'var(--egg-muted)' }}>
          Sua dispensa de ingredientes base
        </p>
      </header>

      {/* ── Formulário ── */}
      <div
        className="card-egg p-8 mb-8 animate-fade-up"
        style={{ animationDelay: '80ms', animationFillMode: 'both' }}
      >
        {/* Emoji selecionado (preview) */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all"
            style={{ background: 'var(--egg-blush)' }}
          >
            {emoji}
          </div>
          <div>
            <p className="font-display font-bold text-xl italic" style={{ color: 'var(--egg-choco)' }}>
              Novo Ingrediente
            </p>
            <p className="section-label">preencha os campos abaixo</p>
          </div>
        </div>

        {/* Nome */}
        <div className="mb-4">
          <p className="section-label mb-1.5">Nome do Ingrediente</p>
          <input
            className="input-egg"
            placeholder="Ex: Chocolate 70%, Leite Ninho..."
            value={nome}
            onChange={e => setNome(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && salvar()}
          />
        </div>

        {/* Unidade */}
        <div className="mb-4">
          <p className="section-label mb-1.5">Unidade de Medida</p>
          <select
            className="input-egg font-medium"
            value={unidade}
            onChange={e => setUnidade(e.target.value)}
          >
            {UNIDADES.map(u => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
        </div>

        {/* Seletor de emojis */}
        <div className="mb-6">
          <p className="section-label mb-2">Ícone Visual</p>
          <div
            className="flex flex-wrap gap-1.5 p-3 rounded-2xl border max-h-28 overflow-y-auto"
            style={{ background: 'var(--egg-cream)', borderColor: 'rgba(200,134,10,0.12)' }}
          >
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 text-lg"
                style={
                  emoji === e
                    ? { background: 'var(--egg-gold)', transform: 'scale(1.15)', boxShadow: '0 4px 12px rgba(200,134,10,0.35)' }
                    : { background: 'transparent' }
                }
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={salvar}
          disabled={loading || !nome.trim()}
          className="btn-primary w-full"
        >
          {loading ? 'Salvando...' : 'Registrar no Inventário'}
        </button>
      </div>

      {/* ── Lista ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <p className="section-label">ingredientes cadastrados</p>
          <span
            className="stat-number text-sm px-3 py-1 rounded-full"
            style={{ background: 'var(--egg-blush)', color: 'var(--egg-brown)' }}
          >{lista.length}</span>
        </div>

        {lista.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-4xl mb-3 block animate-float">🫙</span>
            <p className="text-sm font-medium" style={{ color: 'var(--egg-muted)' }}>
              Dispensa vazia — adicione seus primeiros insumos
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {lista.map((item, i) => (
              <div
                key={item.id}
                className="animate-fade-up flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 group"
                style={{
                  background: hoverId === item.id ? 'var(--egg-blush)' : '#fff',
                  borderColor: 'rgba(200,134,10,0.1)',
                  animationDelay: `${i * 40}ms`,
                  animationFillMode: 'both',
                  boxShadow: 'var(--shadow-card)',
                }}
                onMouseEnter={() => setHoverId(item.id)}
                onMouseLeave={() => setHoverId(null)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all"
                    style={{ background: 'var(--egg-cream)' }}
                  >
                    {item.emoji}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: 'var(--egg-choco)' }}>{item.nome}</p>
                    <p className="section-label">Medida: {item.unidade}</p>
                  </div>
                </div>
                <button
                  onClick={() => excluir(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all"
                  style={{ color: '#DC2626', background: '#FEF2F2' }}
                >
                  Excluir
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}