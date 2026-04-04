'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'

export default function DetalhesOvo() {
  const { id }  = useParams()
  const router  = useRouter()
  const [ovo,   setOvo]   = useState<any>(null)
  const [loading,setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    supabase.from('ovos').select(`
      *, itens_ovo(quantidade, preco_pago, ingredientes(nome, emoji, unidade))
    `).eq('id', id).single()
      .then(({ data, error }) => {
        if (error) router.push('/')
        else setOvo(data)
        setLoading(false)
      })
  }, [id])

  async function excluirOvo() {
    if (!confirm('Apagar este ovo do Eggdrasil?')) return
    const { error } = await supabase.from('ovos').delete().eq('id', id)
    if (!error) { router.push('/'); router.refresh() }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3">
      <span className="text-5xl animate-float">🥚</span>
      <p className="section-label">Buscando na árvore Eggdrasil...</p>
    </div>
  )

  const custo    = ovo?.itens_ovo?.reduce((a: number, c: any) => a + c.preco_pago, 0) || 0
  const preco    = ovo?.preco_venda || 0
  const margem   = custo > 0 ? preco / custo : 0
  const lucro    = preco - custo

  let badgeCls: string, badgeLabel: string
  if (margem >= 3)      { badgeCls = 'badge-green';  badgeLabel = '● Ótima Margem'       }
  else if (margem >= 2) { badgeCls = 'badge-yellow'; badgeLabel = '● Margem Aceitável'   }
  else                  { badgeCls = 'badge-red';    badgeLabel = '● Risco de Prejuízo'  }

  return (
    <div className="max-w-xl mx-auto px-5 pt-8 pb-8">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between mb-8 animate-fade-up" style={{ animationFillMode: 'both' }}>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors"
          style={{ color: 'var(--egg-muted)' }}
        >
          ← Voltar
        </button>
        <button
          onClick={excluirOvo}
          className="text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all"
          style={{ color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA' }}
        >
          Excluir Ovo
        </button>
      </div>

      {/* ── Card principal ── */}
      <div
        className="card-egg p-8 mb-5 animate-fade-up"
        style={{ animationDelay: '80ms', animationFillMode: 'both' }}
      >
        {/* Hero */}
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 animate-float"
            style={{ background: 'var(--egg-blush)', boxShadow: 'inset 0 2px 8px rgba(107,58,42,0.12)' }}
          >🥚</div>
          <span className={`badge ${badgeCls} mb-3`}>{badgeLabel}</span>
          <h1 className="font-display text-3xl font-black italic leading-tight" style={{ color: 'var(--egg-choco)' }}>
            {ovo.nome}
          </h1>
          {ovo.customizacao && (
            <p className="text-sm mt-2 italic" style={{ color: 'var(--egg-muted)' }}>
              {ovo.customizacao}
            </p>
          )}
        </div>

        {/* Linha de separação */}
        <div className="h-px mb-6" style={{ background: 'rgba(200,134,10,0.12)' }} />

        {/* Ficha técnica */}
        <p className="section-label mb-4">Ficha Técnica</p>
        <div className="space-y-2 mb-8">
          {ovo.itens_ovo?.map((item: any, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded-2xl"
              style={{ background: 'var(--egg-cream)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: '#fff', boxShadow: '0 2px 6px rgba(44,24,16,0.06)' }}
                >
                  {item.ingredientes?.emoji || '📦'}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--egg-choco)' }}>
                    {item.ingredientes?.nome || 'Ingrediente Excluído'}
                  </p>
                  <p className="section-label">
                    {item.quantidade}{item.ingredientes?.unidade}
                  </p>
                </div>
              </div>
              <span className="stat-number text-sm" style={{ color: 'var(--egg-gold)' }}>
                R$ {item.preco_pago.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* ── Análise financeira ── */}
        <div
          className="rounded-2xl p-6"
          style={{ background: 'var(--egg-choco)' }}
        >
          <p className="section-label mb-4" style={{ color: 'rgba(255,248,238,0.45)' }}>Análise Financeira</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="section-label mb-1" style={{ color: 'rgba(255,248,238,0.4)' }}>Custo</p>
              <p className="stat-number text-lg" style={{ color: 'var(--egg-gold-lt)' }}>R$ {custo.toFixed(2)}</p>
            </div>
            <div>
              <p className="section-label mb-1" style={{ color: 'rgba(255,248,238,0.4)' }}>Preço de Venda</p>
              <p className="stat-number text-lg" style={{ color: 'var(--egg-cream)' }}>R$ {preco.toFixed(2)}</p>
            </div>
            <div>
              <p className="section-label mb-1" style={{ color: 'rgba(255,248,238,0.4)' }}>Lucro</p>
              <p className="stat-number text-lg" style={{ color: lucro >= 0 ? '#6EE7A0' : '#FCA5A5' }}>
                R$ {lucro.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Barra */}
          {preco > 0 && (
            <div className="mt-5">
              <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min((custo / preco) * 100, 100)}%`,
                    background: 'var(--grad-gold)',
                  }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="section-label" style={{ color: 'rgba(255,248,238,0.35)' }}>custo</span>
                <span className="section-label" style={{ color: 'rgba(255,248,238,0.35)' }}>preço de venda</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-center section-label">Eggdrasil Labs ✨</p>
    </div>
  )
}