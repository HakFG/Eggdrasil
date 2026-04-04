'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase' // Certifique-se de ter esse arquivo configurado

const emojis = ['🍫', '🥛', '🍬', '🍓', '🥥', '🍯', '🥚', '🥜']

export default function Ingredientes() {
  const [nome, setNome] = useState('')
  const [unidade, setUnidade] = useState('g')
  const [emoji, setEmoji] = useState('🍫')

  async function salvar() {
    await supabase.from('ingredientes').insert([{ nome, unidade, emoji }])
    alert('Ingrediente salvo!')
    setNome('')
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Novo Ingrediente</h1>
      <div className="space-y-4">
        <input 
          className="w-full border p-2 rounded text-black" 
          placeholder="Nome (ex: Chocolate Belga)" 
          value={nome}
          onChange={e => setNome(e.target.value)}
        />
        <select className="w-full border p-2 rounded text-black" value={unidade} onChange={e => setUnidade(e.target.value)}>
          <option value="g">Gramas (g)</option>
          <option value="ml">Mililitros (ml)</option>
          <option value="un">Unidade (un)</option>
          <option value="kg">Quilos (kg)</option>
        </select>
        <div className="grid grid-cols-4 gap-2">
          {emojis.map(e => (
            <button 
              key={e} 
              onClick={() => setEmoji(e)}
              className={`text-2xl p-2 rounded ${emoji === e ? 'bg-yellow-200' : 'bg-gray-100'}`}
            >
              {e}
            </button>
          ))}
        </div>
        <button onClick={salvar} className="w-full bg-green-500 text-white p-3 rounded font-bold">
          Registrar Ingrediente {emoji}
        </button>
      </div>
    </div>
  )
}