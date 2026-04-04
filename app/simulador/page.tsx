'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Simulador() {
  const [ovos,          setOvos]          = useState<any[]>([])
  const [ovoSelecionado,setOvoSelecionado] = useState<any>(null)
  const [quantidade,    setQuantidade]     = useState(1)
  const [concluidos,    setConcluidos]     = useState<string[]>([])
  const [enviando,      setEnviando]       = useState(false)

  useEffect(() => {
    supabase.from('ovos').select(`
      *, itens_ovo(id, quantidade, preco_pago, ingredientes(id, nome, emoji, unidade))
    `).then(({ data }) => setOvos(data || []))
  }, [])

  const selecionar = (id: string) => {
    setOvoSelecionado(ovos.find(o => o.id === id) || null)
    setConcluidos([])
  }

  const toggleItem = (itemId: string) =>
    setConcluidos(prev =>
      prev.includes(itemId) ? prev.filter(i => i !== itemId) : [...prev, itemId]
    )

  const custo    = ovoSelecionado?.itens_ovo?.reduce((a: number, c: any) => a + c.preco_pago, 0) || 0
  const itens    = ovoSelecionado?.itens_ovo || []
  const progresso = itens.length > 0 ? (concluidos.length / itens.length) * 100 : 0

  async function registrarProducao() {
    if (!ovoSelecionado) return
    setEnviando(true)
    const { error } = await supabase.from('producao_logs').insert([{
      ovo_id:     ovoSelecionado.id,
      quantidade,
      custo_total: custo * quantidade,
    }])
    if (!error) {
      setConcluidos([])
      setQuantidade(1)
      alert('Lote registrado com sucesso! 🎉')
    }
    setEnviando(false)
  }

  return (
    <div className="max-w-xl mx-auto px-5 pt-8 pb-8">

      {/* ── Header ── */}
      <header className="mb-8 animate-fade-up" style={{ animationFillMode: 'both' }}>
        <p className="section-label mb-1">produção ativa</p>
        <h1 className="font-display text-4xl font-black italic" style={{ color: 'var(--egg-choco)' }}>
          Laboratório
        </h1>
        <p className="text-sm font-medium mt-1" style={{ color: 'var(--egg-muted)' }}>
          Simule e registre seu lote de produção
        </p>
      </header>

      {/* ── Seletor de ovo ── */}
      <div
        className="card-egg p-6 mb-6 animate-fade-up"
        style={{ animationDelay: '60ms', animationFillMode: 'both' }}
      >
        <p className="section-label mb-1.5">Projeto em Execução</p>
        <select
          className="input-egg text-base font-semibold"
          onChange={e => selecionar(e.target.value)}
        >
          <option value="">Selecione um ovo...</option>
          {ovos.map(o => (
            <option key={o.id} value={o.id}>{o.nome}</option>
          ))}
        </select>
      </div>

      {ovoSelecionado && (
        <div className="space-y-5">

          {/* ── Módulo 1: Planejamento do lote ── */}
          <section
            className="rounded-3xl p-7 relative overflow-hidden animate-fade-up"
            style={{ background: 'var(--grad-warm)', color: 'var(--egg-cream)', animationDelay: '100ms', animationFillMode: 'both' }}
          >
            <span className="absolute -top-6 -right-6 text-9xl opacity-10 select-none pointer-events-none" aria-hidden>📊</span>

            <p className="section-label mb-5" style={{ color: 'rgba(255,248,238,0.5)' }}>Planejamento de Lote</p>

            {/* Contador de quantidade */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className="flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{ background: 'rgba(0,0,0,0.25)' }}
              >
                <button
                  onClick={() => setQuantidade(q => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center font-black text-lg transition-colors"
                  style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--egg-cream)' }}
                >−</button>
                <span className="stat-number text-2xl w-10 text-center" style={{ color: 'var(--egg-gold-lt)' }}>
                  {quantidade}
                </span>
                <button
                  onClick={() => setQuantidade(q => q + 1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center font-black text-lg transition-colors"
                  style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--egg-cream)' }}
                >+</button>
              </div>
              <p className="text-sm font-medium" style={{ color: 'rgba(255,248,238,0.7)' }}>
                {quantidade === 1 ? 'ovo para produzir' : 'ovos para produzir'}
              </p>
            </div>

            {/* Shopping list */}
            <div
              className="rounded-2xl p-5 mb-6"
              style={{ background: 'rgba(0,0,0,0.3)' }}
            >
              <p className="section-label mb-3" style={{ color: 'rgba(255,248,238,0.4)' }}>Insumos Necessários</p>
              {itens.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between py-2">
                  <span className="text-sm" style={{ color: 'rgba(255,248,238,0.8)' }}>
                    {item.ingredientes?.emoji} {item.ingredientes?.nome}
                  </span>
                  <span className="stat-number text-sm" style={{ color: 'var(--egg-gold-lt)' }}>
                    {(item.quantidade * quantidade).toLocaleString()}{' '}
                    <span className="text-[9px] opacity-60">{item.ingredientes?.unidade}</span>
                  </span>
                </div>
              ))}
            </div>

            {/* Totais */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="section-label mb-1" style={{ color: 'rgba(255,248,238,0.45)' }}>Custo do Lote</p>
                <p className="stat-number text-2xl" style={{ color: '#6EE7A0' }}>
                  R$ {(custo * quantidade).toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="section-label mb-1" style={{ color: 'rgba(255,248,238,0.45)' }}>Preço Unitário</p>
                <p className="stat-number text-xl" style={{ color: 'rgba(255,248,238,0.75)' }}>
                  R$ {ovoSelecionado.preco_venda?.toFixed(2) || '—'}
                </p>
              </div>
            </div>
          </section>

          {/* ── Módulo 2: Jogo de produção ── */}
          <section
            className="card-egg p-7 animate-fade-up"
            style={{ animationDelay: '180ms', animationFillMode: 'both' }}
          >
            {/* Progresso header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="section-label mb-0.5">Status da Montagem</p>
                <p className="font-display font-bold text-lg italic" style={{ color: 'var(--egg-choco)' }}>
                  {ovoSelecionado.nome}
                </p>
              </div>
              <div
                className="px-4 py-2 rounded-full text-xs font-black"
                style={{
                  background: progresso === 100 ? '#ECFDF5' : 'var(--egg-blush)',
                  color: progresso === 100 ? '#059669' : 'var(--egg-brown)',
                }}
              >
                {Math.round(progresso)}% ✓
              </div>
            </div>

            {/* Visualizador do ovo */}
            <div className="flex justify-center mb-8">
              <div
                className="relative overflow-hidden flex flex-col-reverse"
                style={{
                  width: 120,
                  height: 160,
                  borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                  border: '5px solid var(--egg-shell)',
                  background: 'var(--egg-cream)',
                  boxShadow: 'inset 0 4px 16px rgba(44,24,16,0.07)',
                }}
              >
                {/* Preenchimento */}
                <div
                  className="transition-all duration-700 ease-out flex flex-wrap content-start justify-center pt-2 gap-0.5 px-2"
                  style={{
                    height: `${progresso}%`,
                    background: 'linear-gradient(180deg, #A0522D 0%, #6B3A2A 100%)',
                    boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  {itens.map((it: any) => (
                    <span
                      key={it.id}
                      className="text-sm transition-all duration-500"
                      style={{
                        opacity:    concluidos.includes(it.id) ? 1 : 0,
                        transform:  concluidos.includes(it.id) ? 'scale(1)' : 'scale(0)',
                        display:    'inline-block',
                      }}
                    >
                      {it.ingredientes?.emoji}
                    </span>
                  ))}
                </div>
                {progresso === 0 && (
                  <span
                    className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase tracking-wider"
                    style={{ color: 'rgba(155,133,117,0.5)' }}
                  >Vazio</span>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="progress-bar-track mb-6">
              <div className="progress-bar-fill" style={{ width: `${progresso}%` }} />
            </div>

            {/* Checklist */}
            <div className="space-y-2 mb-6">
              {itens.map((item: any) => {
                const done = concluidos.includes(item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 text-left active:scale-[0.98]"
                    style={
                      done
                        ? { background: '#ECFDF5', borderColor: '#A7F3D0' }
                        : { background: 'var(--egg-cream)', borderColor: 'transparent' }
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all duration-300"
                        style={{
                          background: done ? '#D1FAE5' : '#fff',
                          transform:  done ? 'rotate(10deg)' : 'none',
                          boxShadow:  done ? 'none' : '0 2px 8px rgba(44,24,16,0.07)',
                        }}
                      >
                        {item.ingredientes?.emoji}
                      </div>
                      <div>
                        <p
                          className="font-black text-xs uppercase tracking-tight leading-none mb-0.5"
                          style={{ color: done ? '#059669' : 'var(--egg-choco)', textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.5 : 1 }}
                        >
                          {item.ingredientes?.nome}
                        </p>
                        <p className="section-label">
                          {(item.quantidade * quantidade).toLocaleString()} {item.ingredientes?.unidade}
                        </p>
                      </div>
                    </div>
                    <div
                      className="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                      style={
                        done
                          ? { background: '#059669', borderColor: '#059669', transform: 'scale(1.1)' }
                          : { background: 'transparent', borderColor: 'rgba(200,134,10,0.25)' }
                      }
                    >
                      {done && <span className="text-white text-[10px] font-bold">✓</span>}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Botão de finalização */}
            {progresso === 100 && (
              <div className="animate-fade-up" style={{ animationFillMode: 'both' }}>
                <button
                  disabled={enviando}
                  onClick={registrarProducao}
                  className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  style={{
                    background: '#1D4B2E',
                    color:      '#6EE7A0',
                    boxShadow:  '0 8px 32px rgba(29,75,46,0.3)',
                    opacity:    enviando ? 0.6 : 1,
                  }}
                >
                  {enviando ? 'Processando...' : '✨ Confirmar Produção e Salvar'}
                </button>
                <p className="text-center section-label mt-3">
                  Isso atualizará seu dashboard de investimento
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      {!ovoSelecionado && (
        <div className="text-center py-20">
          <span className="text-5xl mb-4 block animate-float">🧪</span>
          <p className="font-display font-bold text-xl italic mb-1" style={{ color: 'var(--egg-choco)' }}>
            Pronto para produzir?
          </p>
          <p className="text-sm" style={{ color: 'var(--egg-muted)' }}>
            Selecione um ovo acima para começar
          </p>
        </div>
      )}
    </div>
  )
}