'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Vendas() {
  const [ovos,     setOvos]     = useState<any[]>([])
  const [vendas,   setVendas]   = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState<any>(null)   // ovo selecionado para vender
  const [qtd,      setQtd]      = useState(1)
  const [salvando, setSalvando] = useState(false)
  const [resetModal, setResetModal] = useState(false)

  async function fetchData() {
    setLoading(true)
    const [ovosRes, vendasRes] = await Promise.all([
      supabase.from('ovos').select('*, itens_ovo(preco_pago)').order('nome'),
      supabase.from('vendas_logs').select('*, ovos(nome, preco_venda)').order('created_at', { ascending: false }),
    ])
    setOvos(ovosRes.data   || [])
    setVendas(vendasRes.data || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  async function registrarVenda() {
    if (!modal) return
    setSalvando(true)
    const receita = modal.preco_venda * qtd
    const { error } = await supabase.from('vendas_logs').insert([{
      ovo_id:        modal.id,
      quantidade:    qtd,
      receita_total: receita,
    }])
    if (!error) {
      setModal(null)
      setQtd(1)
      fetchData()
    } else {
      alert('Erro ao registrar venda.')
    }
    setSalvando(false)
  }

  async function resetarVendas() {
    setSalvando(true)
    const { error } = await supabase.from('vendas_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (!error) {
      setResetModal(false)
      fetchData()
      alert('✅ Todas as vendas foram resetadas com sucesso!')
    } else {
      alert('❌ Erro ao resetar vendas.')
    }
    setSalvando(false)
  }

  // ── Métricas ──
  const receitaReal  = vendas.reduce((a, v) => a + v.receita_total, 0)
  const totalVendidos = vendas.reduce((a, v) => a + v.quantidade, 0)

  // Agrupamento por ovo para o ranking
  const rankingMap = vendas.reduce((acc: any, v: any) => {
    const nome = v.ovos?.nome || 'Indefinido'
    acc[nome] = (acc[nome] || 0) + v.quantidade
    return acc
  }, {})
  const ranking = Object.entries(rankingMap)
    .map(([nome, qtd]) => ({ nome, qtd }))
    .sort((a: any, b: any) => b.qtd - a.qtd)

  return (
    <div className="max-w-xl mx-auto px-5 pt-8 pb-32">

      {/* ── Header ── */}
      <header className="mb-8 animate-fade-up" style={{ animationFillMode: 'both' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="section-label mb-1">histórico de vendas</p>
            <h1 className="font-display text-4xl font-black italic" style={{ color: 'var(--egg-choco)' }}>
              Vendas
            </h1>
            <p className="text-sm font-medium mt-1" style={{ color: 'var(--egg-muted)' }}>
              Registre e acompanhe o que foi vendido
            </p>
          </div>
          
          {vendas.length > 0 && (
            <button
              onClick={() => setResetModal(true)}
              className="px-3 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all"
              style={{
                background: '#DC2626',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(220,38,38,0.2)',
              }}
            >
              🗑️ Resetar
            </button>
          )}
        </div>
      </header>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 mb-8 animate-fade-up" style={{ animationDelay: '60ms', animationFillMode: 'both' }}>
        <div className="rounded-3xl p-5" style={{ background: '#1D4B2E' }}>
          <p className="section-label mb-1" style={{ color: 'rgba(110,231,160,0.5)' }}>Receita Real</p>
          <p className="stat-number text-xl" style={{ color: '#6EE7A0' }}>
            R$ {receitaReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] mt-1" style={{ color: 'rgba(110,231,160,0.4)' }}>vendas confirmadas</p>
        </div>
        <div className="rounded-3xl p-5" style={{ background: 'var(--egg-choco)' }}>
          <p className="section-label mb-1" style={{ color: 'rgba(255,248,238,0.4)' }}>Ovos Vendidos</p>
          <p className="stat-number text-xl" style={{ color: 'var(--egg-gold-lt)' }}>
            {totalVendidos} <span className="text-sm font-normal" style={{ color: 'rgba(255,248,238,0.4)' }}>un</span>
          </p>
          <p className="text-[10px] mt-1" style={{ color: 'rgba(255,248,238,0.3)' }}>no total da temporada</p>
        </div>
      </div>

      {/* ── Ranking ── */}
      {ranking.length > 0 && (
        <div className="card-egg p-6 mb-6 animate-fade-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <p className="section-label mb-4">mais vendidos</p>
          <div className="space-y-3">
            {ranking.map(({ nome, qtd }: any, i) => {
              const maxQtd = ranking[0].qtd as number
              const pct    = (qtd / maxQtd) * 100
              return (
                <div key={nome}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black"
                        style={{
                          background: i === 0 ? 'var(--egg-gold)' : 'var(--egg-shell)',
                          color:      i === 0 ? 'var(--egg-choco)' : 'var(--egg-muted)',
                        }}
                      >{i + 1}</span>
                      <span className="text-sm font-bold" style={{ color: 'var(--egg-choco)' }}>{nome}</span>
                    </div>
                    <span className="stat-number text-sm" style={{ color: 'var(--egg-gold)' }}>{qtd} un</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Lista de ovos para registrar venda ── */}
      <div className="mb-6">
        <p className="section-label mb-4">registrar nova venda</p>
        {loading ? (
          <div className="text-center py-12">
            <span className="text-4xl animate-float block mb-3">🥚</span>
            <p className="section-label">Carregando...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {ovos.map((ovo, i) => {
              const jaVendidos = vendas
                .filter(v => v.ovo_id === ovo.id)
                .reduce((a, v) => a + v.quantidade, 0)

              return (
                <div
                  key={ovo.id}
                  className="card-egg p-5 flex items-center justify-between animate-fade-up"
                  style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ background: 'var(--egg-blush)' }}
                    >🥚</div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--egg-choco)' }}>{ovo.nome}</p>
                      <p className="section-label">
                        R$ {ovo.preco_venda?.toFixed(2) || '—'} · {jaVendidos} vendidos
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setModal(ovo); setQtd(1) }}
                    className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all"
                    style={{
                      background: 'var(--egg-choco)',
                      color:      'var(--egg-cream)',
                      boxShadow:  '0 4px 12px rgba(44,24,16,0.2)',
                    }}
                  >
                    Vender
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Histórico de transações ── */}
      {vendas.length > 0 && (
        <div className="card-egg p-6 animate-fade-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <p className="section-label mb-4">histórico de transações</p>
          <div className="space-y-2">
            {vendas.map((v, i) => (
              <div
                key={v.id}
                className="flex items-center justify-between p-3 rounded-2xl"
                style={{ background: 'var(--egg-cream)' }}
              >
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--egg-choco)' }}>
                    {v.ovos?.nome || 'Ovo'}
                  </p>
                  <p className="section-label">
                    {v.quantidade} un · {new Date(v.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className="stat-number text-sm" style={{ color: '#059669' }}>
                  + R$ {v.receita_total.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {vendas.length === 0 && !loading && (
        <div className="text-center py-12">
          <span className="text-5xl mb-4 block animate-float">🛒</span>
          <p className="font-display font-bold text-xl italic mb-1" style={{ color: 'var(--egg-choco)' }}>
            Nenhuma venda ainda
          </p>
          <p className="text-sm" style={{ color: 'var(--egg-muted)' }}>
            Registre sua primeira venda acima
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/* MODAL SIMPLIFICADO - registro de venda */}
      {/* ══════════════════════════════════════ */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Fundo escuro */}
          <div 
            className="absolute inset-0 bg-black/60"
            onClick={() => setModal(null)}
          />
          
          {/* Modal content - mais simples e sem travar */}
          <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="text-center mb-5">
              <div className="text-5xl mb-2">🥚</div>
              <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--egg-choco)' }}>
                {modal.nome}
              </h3>
              <p className="text-sm" style={{ color: 'var(--egg-muted)' }}>
                R$ {modal.preco_venda?.toFixed(2)} por unidade
              </p>
            </div>

            {/* Contador simplificado */}
            <div className="flex items-center justify-between gap-4 mb-5">
              <button
                onClick={() => setQtd(q => Math.max(1, q - 1))}
                className="w-14 h-14 rounded-full text-2xl font-bold bg-gray-100 hover:bg-gray-200 transition-all"
              >
                −
              </button>
              
              <div className="flex-1 text-center">
                <div className="text-5xl font-bold mb-1" style={{ color: 'var(--egg-choco)' }}>
                  {qtd}
                </div>
                <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--egg-muted)' }}>
                  unidades
                </p>
              </div>
              
              <button
                onClick={() => setQtd(q => q + 1)}
                className="w-14 h-14 rounded-full text-2xl font-bold bg-gray-100 hover:bg-gray-200 transition-all"
              >
                +
              </button>
            </div>

            {/* Total */}
            <div className="bg-amber-50 rounded-xl p-4 text-center mb-5">
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--egg-muted)' }}>
                Total da venda
              </p>
              <p className="text-3xl font-bold text-emerald-600">
                R$ {(modal.preco_venda * qtd).toFixed(2)}
              </p>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-gray-100 hover:bg-gray-200 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={registrarVenda}
                disabled={salvando}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all"
                style={{
                  background: salvando ? '#9CA3AF' : '#1D4B2E',
                }}
              >
                {salvando ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/* MODAL de confirmação de reset         */}
      {/* ══════════════════════════════════════ */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60"
            onClick={() => setResetModal(false)}
          />
          
          <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="text-center mb-5">
              <div className="text-6xl mb-3">⚠️</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--egg-choco)' }}>
                Resetar todas as vendas?
              </h3>
              <p className="text-sm mb-2" style={{ color: 'var(--egg-muted)' }}>
                Isso vai apagar TODO o histórico de vendas.
              </p>
              <p className="text-xs font-bold text-red-600">
                Esta ação não pode ser desfeita!
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setResetModal(false)}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-gray-100 hover:bg-gray-200 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={resetarVendas}
                disabled={salvando}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all"
                style={{
                  background: salvando ? '#9CA3AF' : '#DC2626',
                }}
              >
                {salvando ? 'Resetando...' : 'Resetar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}