'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

function StatCard({
  label, value, sub, accent, delay = 0
}: { label: string; value: string; sub?: string; accent: 'dark' | 'gold' | 'green' | 'teal'; delay?: number }) {
  const styles = {
    dark:  { bg: '#2C1810', text: '#F5C842',  subText: 'rgba(255,248,238,0.45)' },
    gold:  { bg: '#C8860A', text: '#FFF8EE',  subText: 'rgba(255,248,238,0.6)'  },
    green: { bg: '#1D4B2E', text: '#6EE7A0',  subText: 'rgba(110,231,160,0.55)' },
    teal:  { bg: '#1A3A4A', text: '#7DD3FC',  subText: 'rgba(125,211,252,0.5)'  },
  }[accent]

  return (
    <div
      className="animate-fade-up rounded-3xl p-5 flex flex-col gap-2 relative overflow-hidden"
      style={{ background: styles.bg, animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <span className="absolute -bottom-5 -right-5 text-6xl opacity-10 select-none pointer-events-none" aria-hidden>🥚</span>
      <p className="section-label" style={{ color: styles.subText }}>{label}</p>
      <p className="stat-number text-xl leading-none" style={{ color: styles.text }}>{value}</p>
      {sub && <p className="text-[10px] font-medium" style={{ color: styles.subText }}>{sub}</p>}
    </div>
  )
}

function OvoCard({ ovo }: { ovo: any }) {
  const custo  = ovo.itens_ovo?.reduce((a: number, c: any) => a + c.preco_pago, 0) || 0
  const preco  = ovo.preco_venda || 0
  const margem = custo > 0 ? preco / custo : 0
  const pct    = custo > 0 ? Math.min((custo / preco) * 100, 100) : 0

  let badge: { label: string; cls: string }
  if (margem >= 3)      badge = { label: '● Ótima margem',      cls: 'badge-green'  }
  else if (margem >= 2) badge = { label: '● Margem ok',         cls: 'badge-yellow' }
  else                  badge = { label: '● Risco de prejuízo', cls: 'badge-red'    }

  return (
    <Link href={`/ovo/${ovo.id}`}>
      <div className="card-egg p-5 cursor-pointer group">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-300 group-hover:scale-110"
            style={{ background: 'var(--egg-blush)' }}
          >🥚</div>
          <span className={`badge ${badge.cls}`}>{badge.label}</span>
        </div>
        <h3 className="font-display font-bold text-lg leading-tight mb-1" style={{ color: 'var(--egg-choco)' }}>
          {ovo.nome}
        </h3>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="stat-number text-lg" style={{ color: 'var(--egg-gold)' }}>
            R$ {preco.toFixed(2)}
          </span>
          <span className="section-label">venda</span>
          <span className="text-stone-300 text-xs mx-1">·</span>
          <span className="text-xs font-medium" style={{ color: 'var(--egg-muted)' }}>
            custo R$ {custo.toFixed(2)}
          </span>
        </div>
        <div>
          <p className="section-label mb-1.5">saúde financeira</p>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px]" style={{ color: 'var(--egg-muted)' }}>custo</span>
            <span className="text-[9px]" style={{ color: 'var(--egg-muted)' }}>preço de venda</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function Home() {
  const [ovos,      setOvos]      = useState<any[]>([])
  const [producoes, setProducoes] = useState<any[]>([])
  const [vendas,    setVendas]    = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)

  async function fetchData() {
    setLoading(true)
    const [ovosRes, prodRes, vendasRes] = await Promise.all([
      supabase.from('ovos').select('*, itens_ovo(preco_pago)').order('created_at', { ascending: false }),
      supabase.from('producao_logs').select('*, ovos(nome, preco_venda)'),
      supabase.from('vendas_logs').select('*'),
    ])
    setOvos(ovosRes.data     || [])
    setProducoes(prodRes.data || [])
    setVendas(vendasRes.data  || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const investimento         = producoes.reduce((a, p) => a + p.custo_total, 0)
  const faturamentoPotencial = producoes.reduce((a, p) => a + (p.ovos?.preco_venda || 0) * p.quantidade, 0)
  const receitaReal          = vendas.reduce((a, v) => a + v.receita_total, 0)
  const lucroReal            = receitaReal - investimento

  const gerarRelatorio = () => {
    if (producoes.length === 0) return alert('Nenhuma produção registrada.')
    const data = new Date().toLocaleDateString('pt-BR')
    const resumo = producoes.reduce((acc: any, p: any) => {
      const n = p.ovos?.nome || 'Indefinido'
      acc[n] = (acc[n] || 0) + p.quantidade
      return acc
    }, {})
    let txt = `🥚 RELATÓRIO EGGDRASIL — ${data}\n${'─'.repeat(34)}\n\n📦 PRODUÇÃO:\n`
    Object.entries(resumo).forEach(([n, q]) => { txt += `  • ${n}: ${q} un\n` })
    txt += `\n💰 FINANCEIRO:\n`
    txt += `  • Investimento      : R$ ${investimento.toFixed(2)}\n`
    txt += `  • Receita Real      : R$ ${receitaReal.toFixed(2)}\n`
    txt += `  • Lucro Real        : R$ ${lucroReal.toFixed(2)}\n`
    txt += `  • Vendas Potenciais : R$ ${faturamentoPotencial.toFixed(2)}\n`
    txt += `  • ROI               : ${((receitaReal / (investimento || 1)) * 100).toFixed(0)}%\n`
    txt += `\n${'─'.repeat(34)}\nGerado por Eggdrasil Labs ✨`
    navigator.clipboard.writeText(txt)
    alert('Relatório copiado! 📋')
  }

  const handleReset = async () => {
    if (!confirm('Isso apagará todos os logs de produção. Continuar?')) return
    await supabase.from('producao_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    fetchData()
  }

  return (
    <div className="max-w-2xl mx-auto px-5 pt-8">

      {/* ── Header ── */}
      <header className="mb-10 animate-fade-up" style={{ animationFillMode: 'both' }}>
        <p className="section-label mb-2">temporada ativa</p>
        <h1 className="font-display text-5xl font-black italic leading-none mb-1 shimmer-text">
          Eggdrasil
        </h1>
        <p className="text-sm font-medium" style={{ color: 'var(--egg-muted)' }}>
          Visão geral do seu negócio em tempo real
        </p>
      </header>

      {/* ── Stats grid 2x2 ── */}
      <section className="grid grid-cols-2 gap-3 mb-4">
        <StatCard label="Total Investido"    value={`R$ ${investimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}         sub="em produções"          accent="dark"  delay={80}  />
        <StatCard label="Receita Real"       value={`R$ ${receitaReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}           sub="vendas confirmadas"    accent="green" delay={140} />
        <StatCard label="Lucro Real"         value={`R$ ${lucroReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}             sub={`ROI ${((receitaReal / (investimento || 1)) * 100).toFixed(0)}%`} accent="gold" delay={200} />
        <StatCard label="Vendas Potenciais"  value={`R$ ${faturamentoPotencial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}  sub="se tudo for vendido"   accent="teal"  delay={260} />
      </section>

      {/* ── Atalho para vendas ── */}
      <Link href="/vendas">
        <div
          className="animate-fade-up rounded-3xl p-5 mb-4 flex items-center justify-between cursor-pointer group transition-all"
          style={{
            background: 'var(--egg-blush)',
            border: '1px solid rgba(200,134,10,0.15)',
            animationDelay: '300ms',
            animationFillMode: 'both',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl group-hover:scale-110 transition-transform">🛒</span>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--egg-choco)' }}>Registrar Vendas</p>
              <p className="section-label">Confirme os ovos que foram vendidos</p>
            </div>
          </div>
          <span className="text-lg transition-transform group-hover:translate-x-1" style={{ color: 'var(--egg-caramel)' }}>→</span>
        </div>
      </Link>

      {/* ── Ações ── */}
      <div
        className="flex items-center justify-between mb-8 px-1 animate-fade-up"
        style={{ animationDelay: '340ms', animationFillMode: 'both' }}
      >
        <button
          onClick={handleReset}
          className="text-[9px] font-black uppercase tracking-widest transition-colors"
          style={{ color: 'var(--egg-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#DC2626')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--egg-muted)')}
        >
          🗑️ Resetar Temporada
        </button>
        <button
          onClick={gerarRelatorio}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
          style={{ background: '#fff', border: '1px solid rgba(200,134,10,0.2)', color: 'var(--egg-choco)', boxShadow: '0 2px 8px rgba(44,24,16,0.07)' }}
        >
          📄 Fechar Mês
        </button>
      </div>

      {/* ── Catálogo ── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="section-label mb-0.5">produtos cadastrados</p>
            <h2 className="font-display font-bold text-2xl italic" style={{ color: 'var(--egg-choco)' }}>Catálogo</h2>
          </div>
          <Link href="/criar-ovo">
            <button className="btn-primary text-xs px-5 py-3">+ Novo</button>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <span className="text-4xl animate-float">🥚</span>
            <p className="section-label">Sincronizando...</p>
          </div>
        ) : ovos.length === 0 ? (
          <div className="rounded-3xl p-12 text-center border-2 border-dashed" style={{ borderColor: 'rgba(200,134,10,0.2)' }}>
            <span className="text-5xl mb-4 block animate-float">🥚</span>
            <p className="font-display font-bold text-xl mb-2" style={{ color: 'var(--egg-choco)' }}>Nenhum ovo cadastrado</p>
            <p className="text-sm" style={{ color: 'var(--egg-muted)' }}>Crie sua primeira receita para começar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ovos.map((ovo, i) => (
              <div key={ovo.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}>
                <OvoCard ovo={ovo} />
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="h-6" />
    </div>
  )
}