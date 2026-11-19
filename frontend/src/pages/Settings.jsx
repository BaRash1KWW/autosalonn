import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Helmet } from 'react-helmet-async'

export default function Settings() {
  const [statuses, setStatuses] = useState([])
  const [positions, setPositions] = useState([])
  const [newStatus, setNewStatus] = useState('')
  const [newPosition, setNewPosition] = useState({ name: '', salary: '' })

  const fetchData = async () => {
    const { data: st } = await supabase.from('car_statuses').select('*')
    if (st) setStatuses(st)
    const { data: pos } = await supabase.from('positions').select('*')
    if (pos) setPositions(pos)
  }

  useEffect(() => { fetchData() }, [])

  const addStatus = async (e) => {
    e.preventDefault()
    await supabase.from('car_statuses').insert([{ name: newStatus }])
    setNewStatus('')
    fetchData()
  }

  const addPosition = async (e) => {
    e.preventDefault()
    await supabase.from('positions').insert([{ 
      name: newPosition.name, 
      base_salary: Number(newPosition.salary) 
    }])
    setNewPosition({ name: '', salary: '' })
    fetchData()
  }

  return (
    <>
      <Helmet><title>Настройки - AutoSalon</title></Helmet>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Статусы */}
        <div>
          <h2 className="text-xl font-bold mb-4">Статусы автомобилей</h2>
          <form onSubmit={addStatus} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-4 flex gap-2">
            <input required placeholder="Новый статус" value={newStatus} onChange={e => setNewStatus(e.target.value)} className="border p-2 rounded flex-1" />
            <button type="submit" className="bg-blue-600 text-white px-4 rounded">Добавить</button>
          </form>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <ul>
              {statuses.map(s => (
                <li key={s.id} className="p-4 border-b border-slate-100 font-medium text-slate-700">{s.name}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Должности */}
        <div>
          <h2 className="text-xl font-bold mb-4">Должности сотрудников</h2>
          <form onSubmit={addPosition} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-4 flex gap-2">
            <input required placeholder="Должность" value={newPosition.name} onChange={e => setNewPosition({...newPosition, name: e.target.value})} className="border p-2 rounded flex-1" />
            <input required type="number" placeholder="Оклад" value={newPosition.salary} onChange={e => setNewPosition({...newPosition, salary: e.target.value})} className="border p-2 rounded w-32" />
            <button type="submit" className="bg-green-600 text-white px-4 rounded">Добавить</button>
          </form>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <ul>
              {positions.map(p => (
                <li key={p.id} className="p-4 border-b border-slate-100 flex justify-between">
                  <span className="font-medium text-slate-700">{p.name}</span>
                  <span className="text-green-600 font-bold">{p.base_salary.toLocaleString('ru-RU')} ₽</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}