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
      className="rounded-3xl p-5 flex flex-col gap-2 relative overflow-hidden"
      style={{ background: styles.bg }}
    >
      <span className="absolute -bottom-5 -right-5 text-6xl opacity-10 select-none pointer-events-none" aria-hidden>🥚</span>
      <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: styles.subText }}>{label}</p>
      <p className="text-xl font-bold leading-none" style={{ color: styles.text }}>{value}</p>
      {sub && <p className="text-[9px] font-medium" style={{ color: styles.subText }}>{sub}</p>}
    </div>
  )
}

function OvoCard({ ovo }: { ovo: any }) {
  const custo  = ovo.itens_ovo?.reduce((a: number, c: any) => a + c.preco_pago, 0) || 0
  const preco  = ovo.preco_venda || 0
  const margem = custo > 0 ? preco / custo : 0
  const pct    = custo > 0 ? Math.min((custo / preco) * 100, 100) : 0

  let badge: { label: string; color: string; bg: string }
  if (margem >= 3) {
    badge = { label: '● Ótima margem', color: '#166534', bg: '#DCFCE7' }
  } else if (margem >= 2) {
    badge = { label: '● Margem ok', color: '#854D0E', bg: '#FEF9C3' }
  } else {
    badge = { label: '● Risco de prejuízo', color: '#991B1B', bg: '#FEE2E2' }
  }

  return (
    <Link href={`/ovo/${ovo.id}`}>
      <div className="bg-white rounded-2xl p-4 cursor-pointer transition-all hover:shadow-lg border" style={{ borderColor: 'rgba(200,134,10,0.15)' }}>
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: '#FEF3C7' }}
          >🥚</div>
          <span className="text-[10px] font-black px-2 py-1 rounded-full" style={{ background: badge.bg, color: badge.color }}>
            {badge.label}
          </span>
        </div>
        <h3 className="font-bold text-base mb-1" style={{ color: '#2C1810' }}>
          {ovo.nome}
        </h3>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold" style={{ color: '#C8860A' }}>
            R$ {preco.toFixed(2)}
          </span>
          <span className="text-[10px] font-medium" style={{ color: '#A8A29E' }}>venda</span>
          <span className="text-[10px]" style={{ color: '#D6D3D1' }}>·</span>
          <span className="text-[10px] font-medium" style={{ color: '#A8A29E' }}>
            custo R$ {custo.toFixed(2)}
          </span>
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-wider mb-1.5" style={{ color: '#A8A29E' }}>saúde financeira</p>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#C8860A' }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px]" style={{ color: '#A8A29E' }}>custo</span>
            <span className="text-[8px]" style={{ color: '#A8A29E' }}>preço de venda</span>
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
    <>
      {/* Container principal com padding inferior extra para não ficar atrás da navegação */}
      <div className="max-w-2xl mx-auto px-5 pt-6 pb-32">
        
        {/* Header simplificado */}
        <header className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#A8A29E' }}>temporada ativa</p>
          <h1 className="text-5xl font-black italic mb-1" style={{ color: '#2C1810' }}>
            Eggdrasil
          </h1>
          <p className="text-sm font-medium" style={{ color: '#A8A29E' }}>
            Visão geral do seu negócio em tempo real
          </p>
        </header>

        {/* Stats grid */}
        <section className="grid grid-cols-2 gap-3 mb-4">
          <StatCard label="Total Investido" value={`R$ ${investimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} sub="em produções" accent="dark" />
          <StatCard label="Receita Real" value={`R$ ${receitaReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} sub="vendas confirmadas" accent="green" />
          <StatCard label="Lucro Real" value={`R$ ${lucroReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} sub={`ROI ${((receitaReal / (investimento || 1)) * 100).toFixed(0)}%`} accent="gold" />
          <StatCard label="Vendas Potenciais" value={`R$ ${faturamentoPotencial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} sub="se tudo for vendido" accent="teal" />
        </section>

        {/* Atalho para vendas */}
        <Link href="/vendas">
          <div
            className="rounded-2xl p-5 mb-4 flex items-center justify-between cursor-pointer transition-all hover:opacity-80"
            style={{
              background: '#FEF3C7',
              border: '1px solid rgba(200,134,10,0.2)',
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛒</span>
              <div>
                <p className="font-bold text-sm" style={{ color: '#2C1810' }}>Registrar Vendas</p>
                <p className="text-[10px] font-medium" style={{ color: '#A8A29E' }}>Confirme os ovos que foram vendidos</p>
              </div>
            </div>
            <span className="text-lg" style={{ color: '#C8860A' }}>→</span>
          </div>
        </Link>

        {/* Ações */}
        <div className="flex items-center justify-between mb-8 px-1">
          <button
            onClick={handleReset}
            className="text-[9px] font-black uppercase tracking-wider transition-colors hover:text-red-600"
            style={{ color: '#A8A29E' }}
          >
            🗑️ Resetar Temporada
          </button>
          <button
            onClick={gerarRelatorio}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all hover:shadow-md bg-white border"
            style={{ borderColor: 'rgba(200,134,10,0.2)', color: '#2C1810' }}
          >
            📄 Fechar Mês
          </button>
        </div>

        {/* Catálogo */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider mb-0.5" style={{ color: '#A8A29E' }}>produtos cadastrados</p>
              <h2 className="font-bold text-2xl italic" style={{ color: '#2C1810' }}>Catálogo</h2>
            </div>
            <Link href="/criar-ovo">
              <button className="px-5 py-3 rounded-full text-xs font-black uppercase tracking-wider bg-amber-700 text-white shadow-md">
                + Novo
              </button>
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <span className="text-4xl animate-pulse">🥚</span>
              <p className="text-[10px] font-medium" style={{ color: '#A8A29E' }}>Sincronizando...</p>
            </div>
          ) : ovos.length === 0 ? (
            <div className="rounded-2xl p-12 text-center border-2 border-dashed" style={{ borderColor: 'rgba(200,134,10,0.2)' }}>
              <span className="text-5xl mb-4 block">🥚</span>
              <p className="font-bold text-xl mb-2" style={{ color: '#2C1810' }}>Nenhum ovo cadastrado</p>
              <p className="text-sm" style={{ color: '#A8A29E' }}>Crie sua primeira receita para começar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {ovos.map((ovo) => (
                <OvoCard key={ovo.id} ovo={ovo} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}