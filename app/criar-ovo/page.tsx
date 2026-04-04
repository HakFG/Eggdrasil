'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function CriarOvo() {
  const [nomeOvo, setNomeOvo] = useState('')
  const [customizacao, setCustomizacao] = useState('')
  const [listaIngredientes, setListaIngredientes] = useState<any[]>([])
  const [selecionados, setSelecionados] = useState<any[]>([])

useEffect(() => {
  supabase.from('ingredientes').select('*').then(({ data }: { data: any }) => setListaIngredientes(data || []))
}, [])

  const adicionarIngrediente = () => {
    setSelecionados([...selecionados, { ingrediente_id: '', quantidade: 0, preco: 0 }])
  }

  async function finalizarOvo() {
    const { data: ovo } = await supabase.from('ovos').insert([{ nome: nomeOvo, customizacao }]).select().single()
    
    const itens = selecionados.map(s => ({
      ovo_id: ovo.id,
      ingrediente_id: s.ingrediente_id,
      quantidade: s.quantidade,
      preco_pago: s.preco
    }))

    await supabase.from('itens_ovo').insert(itens)
    alert('Ovo de Páscoa criado com sucesso!')
  }

  return (
    <div className="p-8 max-w-2xl mx-auto pb-32">
      <h1 className="text-3xl font-bold mb-6">Criar Novo Ovo 🥚</h1>
      <input 
        className="w-full border-2 p-3 rounded mb-4 text-xl" 
        placeholder="Nome do Ovo (ex: Ovo de Pistache)"
        onChange={e => setNomeOvo(e.target.value)}
      />

      <div className="bg-gray-50 p-4 rounded-lg mb-6 text-black">
        <h2 className="font-bold mb-2">Ingredientes e Custos</h2>
        {selecionados.map((item, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <select 
              className="flex-1 p-2 border rounded text-black"
              onChange={e => {
                const newArr = [...selecionados]
                newArr[index].ingrediente_id = e.target.value
                setSelecionados(newArr)
              }}
            >
              <option>Selecione...</option>
              {listaIngredientes.map(ing => (
                <option key={ing.id} value={ing.id}>{ing.emoji} {ing.nome}</option>
              ))}
            </select>
            <input 
              type="number" placeholder="Qtd" className="w-20 p-2 border rounded"
              onChange={e => {
                const newArr = [...selecionados]
                newArr[index].quantidade = Number(e.target.value)
                setSelecionados(newArr)
              }}
            />
            <input 
              type="number" placeholder="R$ Custo" className="w-24 p-2 border rounded"
              onChange={e => {
                const newArr = [...selecionados]
                newArr[index].preco = Number(e.target.value)
                setSelecionados(newArr)
              }}
            />
          </div>
        ))}
        <button onClick={adicionarIngrediente} className="text-blue-600 font-bold">+ Adicionar Item</button>
      </div>

      <textarea 
        className="w-full border p-3 rounded mb-4 text-black" 
        placeholder="Customização (ex: Casca cravejada, laço dourado...)"
        onChange={e => setCustomizacao(e.target.value)}
      />

      <button onClick={finalizarOvo} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold text-lg">
        Salvar Ovo no Eggdrasil
      </button>
    </div>
  )
}