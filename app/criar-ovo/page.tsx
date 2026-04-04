'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const OPCOES_VISUAIS = {
  casca:   ['Ao Leite 🍫', 'Branco ⚪', 'Amargo 🌑', 'Pistache 🟢', 'Cravejada 💎', 'Colorida 🌈'],
  recheio: ['Ninho 🥛', 'Nutella 🌰', 'Brigadeiro 🍫', 'Morango 🍓', 'Caramelo 🍯', 'Nenhum ❌'],
  estilo:  ['Laço Simples 🎀', 'Caixa Premium 📦', 'Papel Seda 📄', 'Edição de Luxo ✨'],
}

const STEP_META = [
  { num: 1, title: 'Identidade',    sub: 'Dê um nome ao projeto',      icon: '✏️' },
  { num: 2, title: 'Estética',      sub: 'Defina a aparência visual',   icon: '🎨' },
  { num: 3, title: 'Ficha Técnica', sub: 'Insumos e precificação',      icon: '📐' },
]

export default function CriarOvo() {
  const router = useRouter()
  const [etapa,  setEtapa]  = useState(1)
  const [nome,   setNome]   = useState('')
  const [visual, setVisual] = useState({ casca: 'Ao Leite 🍫', recheio: 'Ninho 🥛', estilo: 'Laço Simples 🎀' })
  const [ingredientes, setIngredientes] = useState<any[]>([])
  const [selecionados, setSelecionados] = useState<any[]>([])
  const [margem, setMargem] = useState(100)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    supabase.from('ingredientes').select('*').then(({ data }) => setIngredientes(data || []))
  }, [])

  const custoTotal   = selecionados.reduce((a, c) => a + (c.preco || 0), 0)
  const precoSugerido = custoTotal * (1 + margem / 100)
  const lucroEstimado = precoSugerido - custoTotal

  const adicionarIngrediente = () =>
    setSelecionados([...selecionados, { ingrediente_id: '', quantidade: 0, preco: 0 }])

  const removerIngrediente = (i: number) =>
    setSelecionados(selecionados.filter((_, idx) => idx !== i))

  const updateItem = (index: number, key: string, value: any) => {
    const next = [...selecionados]
    next[index] = { ...next[index], [key]: value }
    setSelecionados(next)
  }

  async function finalizar() {
    setSalvando(true)
    const customString = `Casca: ${visual.casca} | Recheio: ${visual.recheio} | Estilo: ${visual.estilo}`
    const { data: ovo, error } = await supabase
      .from('ovos')
      .insert([{ nome, customizacao: customString, preco_venda: precoSugerido }])
      .select()
      .single()
    if (error || !ovo) { alert('Erro ao criar ovo'); setSalvando(false); return }

    const itens = selecionados.map(s => ({
      ovo_id: ovo.id,
      ingrediente_id: s.ingrediente_id,
      quantidade: s.quantidade,
      preco_pago: s.preco,
    }))
    await supabase.from('itens_ovo').insert(itens)
    router.push('/')
  }

  return (
    <div className="max-w-xl mx-auto px-5 pt-8 pb-8">

      {/* ── Header ── */}
      <header className="mb-8 animate-fade-up" style={{ animationFillMode: 'both' }}>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest transition-colors"
          style={{ color: 'var(--egg-muted)' }}
        >
          ← Voltar
        </button>
        <p className="section-label mb-1">criação de receita</p>
        <h1 className="font-display text-4xl font-black italic" style={{ color: 'var(--egg-choco)' }}>
          Novo Ovo
        </h1>
      </header>

      {/* ── Steps indicator ── */}
      <div className="flex items-center gap-0 mb-10">
        {STEP_META.map((s, i) => (
          <div key={s.num} className="flex items-center flex-1 last:flex-none">
            {/* Círculo */}
            <button
              onClick={() => s.num < etapa && setEtapa(s.num)}
              className="flex flex-col items-center gap-1 group"
            >
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300"
                style={
                  etapa === s.num
                    ? { background: 'var(--egg-choco)', color: 'var(--egg-cream)', boxShadow: '0 4px 16px rgba(44,24,16,0.3)' }
                    : etapa > s.num
                    ? { background: 'var(--egg-gold)',  color: 'var(--egg-choco)' }
                    : { background: 'rgba(200,134,10,0.12)', color: 'var(--egg-muted)' }
                }
              >
                {etapa > s.num ? '✓' : s.num}
              </span>
              <span
                className="text-[8px] font-black uppercase tracking-widest whitespace-nowrap hidden sm:block"
                style={{ color: etapa === s.num ? 'var(--egg-choco)' : 'var(--egg-muted)' }}
              >
                {s.title}
              </span>
            </button>
            {/* Linha */}
            {i < STEP_META.length - 1 && (
              <div className="flex-1 h-0.5 mx-2" style={{ background: etapa > s.num ? 'var(--egg-gold)' : 'rgba(200,134,10,0.15)' }} />
            )}
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════ */}
      {/* ETAPA 1 — Identidade                         */}
      {/* ══════════════════════════════════════════════ */}
      {etapa === 1 && (
        <section key="e1" className="animate-fade-up" style={{ animationFillMode: 'both' }}>
          <div className="card-egg p-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6"
              style={{ background: 'var(--egg-blush)' }}
            >✏️</div>
            <p className="section-label mb-1">nome comercial</p>
            <h2 className="font-display font-bold text-2xl italic mb-6" style={{ color: 'var(--egg-choco)' }}>
              Qual é o nome do seu ovo?
            </h2>
            <input
              className="input-egg mb-6 text-lg font-semibold"
              placeholder="Ex: Ovo Galáctico de Pistache"
              value={nome}
              onChange={e => setNome(e.target.value)}
              autoFocus
            />
            <button
              disabled={!nome.trim()}
              onClick={() => setEtapa(2)}
              className="btn-primary w-full"
            >
              Próximo: Estética →
            </button>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* ETAPA 2 — Estética                           */}
      {/* ══════════════════════════════════════════════ */}
      {etapa === 2 && (
        <section key="e2" className="animate-fade-up" style={{ animationFillMode: 'both' }}>
          <div className="card-egg p-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6"
              style={{ background: 'var(--egg-blush)' }}
            >🎨</div>
            <p className="section-label mb-1">personalização visual</p>
            <h2 className="font-display font-bold text-2xl italic mb-6" style={{ color: 'var(--egg-choco)' }}>
              Como é a aparência?
            </h2>

            {/* Preview dinâmico */}
            <div
              className="rounded-2xl p-4 mb-6 text-center"
              style={{ background: 'var(--egg-blush)' }}
            >
              <p className="text-3xl mb-1">🥚</p>
              <p className="text-xs font-medium" style={{ color: 'var(--egg-brown)' }}>
                {visual.casca} · {visual.recheio} · {visual.estilo}
              </p>
            </div>

            <div className="space-y-6 mb-8">
              {Object.entries(OPCOES_VISUAIS).map(([key, options]) => (
                <div key={key}>
                  <p className="section-label mb-3">{key}</p>
                  <div className="flex flex-wrap gap-2">
                    {options.map(opt => {
                      const active = visual[key as keyof typeof visual] === opt
                      return (
                        <button
                          key={opt}
                          onClick={() => setVisual({ ...visual, [key]: opt })}
                          className="px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all duration-200"
                          style={
                            active
                              ? { borderColor: 'var(--egg-choco)', background: 'var(--egg-choco)', color: 'var(--egg-cream)' }
                              : { borderColor: 'rgba(200,134,10,0.18)', background: 'transparent', color: 'var(--egg-muted)' }
                          }
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setEtapa(1)} className="btn-ghost flex-1">← Voltar</button>
              <button onClick={() => setEtapa(3)} className="btn-primary flex-[2]">Próximo: Insumos →</button>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* ETAPA 3 — Ficha Técnica                      */}
      {/* ══════════════════════════════════════════════ */}
      {etapa === 3 && (
        <section key="e3" className="animate-fade-up" style={{ animationFillMode: 'both' }}>

          {/* Card de inteligência de preço */}
          <div
            className="rounded-3xl p-6 mb-6 relative overflow-hidden"
            style={{ background: 'var(--grad-warm)', color: 'var(--egg-cream)' }}
          >
            <span
              className="absolute -top-4 -right-4 text-8xl opacity-10 select-none pointer-events-none"
              aria-hidden
            >💰</span>
            <div className="flex items-start justify-between">
              <div>
                <p className="section-label mb-1" style={{ color: 'rgba(255,248,238,0.5)' }}>Preço Sugerido</p>
                <p className="stat-number text-3xl" style={{ color: '#6EE7A0' }}>
                  R$ {precoSugerido.toFixed(2)}
                </p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,248,238,0.55)' }}>
                  Custo: R$ {custoTotal.toFixed(2)} · Lucro: R$ {lucroEstimado.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="section-label mb-2" style={{ color: 'rgba(255,248,238,0.5)' }}>Margem de Lucro</p>
                <div
                  className="flex items-center gap-1 rounded-full px-3 py-1.5"
                  style={{ background: 'rgba(0,0,0,0.25)' }}
                >
                  <input
                    type="number"
                    value={margem}
                    onChange={e => setMargem(Number(e.target.value))}
                    className="w-14 bg-transparent border-none text-center font-black text-lg p-0 focus:outline-none"
                    style={{ color: 'var(--egg-gold-lt)' }}
                  />
                  <span className="font-bold text-sm" style={{ color: 'var(--egg-gold-lt)' }}>%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card de insumos */}
          <div className="card-egg p-8 mb-6">
            <p className="section-label mb-1">insumos da receita</p>
            <h2 className="font-display font-bold text-xl italic mb-6" style={{ color: 'var(--egg-choco)' }}>
              Ingredientes
            </h2>

            <div className="space-y-3 mb-6">
              {selecionados.map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-4 border"
                  style={{ background: 'var(--egg-cream)', borderColor: 'rgba(200,134,10,0.12)' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <select
                      className="input-egg text-sm font-semibold flex-1 mr-2"
                      style={{ padding: '10px 14px' }}
                      value={item.ingrediente_id}
                      onChange={e => updateItem(i, 'ingrediente_id', e.target.value)}
                    >
                      <option value="">Qual ingrediente?</option>
                      {ingredientes.map(ing => (
                        <option key={ing.id} value={ing.id}>
                          {ing.emoji} {ing.nome} ({ing.unidade})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removerIngrediente(i)}
                      className="text-xs font-bold transition-colors"
                      style={{ color: 'var(--egg-muted)' }}
                    >✕</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="section-label mb-1">Quantidade</p>
                      <input
                        type="number"
                        placeholder="0"
                        className="input-egg text-sm"
                        style={{ padding: '10px 14px' }}
                        value={item.quantidade || ''}
                        onChange={e => updateItem(i, 'quantidade', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <p className="section-label mb-1">Custo (R$)</p>
                      <input
                        type="number"
                        placeholder="0.00"
                        className="input-egg text-sm"
                        style={{ padding: '10px 14px', color: '#059669' }}
                        value={item.preco || ''}
                        onChange={e => updateItem(i, 'preco', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={adicionarIngrediente}
              className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-colors border-2 border-dashed"
              style={{ borderColor: 'rgba(200,134,10,0.25)', color: 'var(--egg-muted)' }}
            >
              + Adicionar Insumo
            </button>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setEtapa(2)} className="btn-ghost flex-1">← Voltar</button>
            <button
              onClick={finalizar}
              disabled={salvando}
              className="flex-[2] rounded-full py-4 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              style={{
                background: '#1D4B2E',
                color: '#6EE7A0',
                boxShadow: '0 8px 24px rgba(29,75,46,0.3)',
                opacity: salvando ? 0.6 : 1,
              }}
            >
              {salvando ? 'Salvando...' : '✨ Salvar Receita'}
            </button>
          </div>
        </section>
      )}

      <div className="h-4" />
    </div>
  )
}