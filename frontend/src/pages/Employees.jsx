import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Helmet } from 'react-helmet-async'

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [positions, setPositions] = useState([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  
  const [formData, setFormData] = useState({ 
    full_name: '', position_id: '', phone: '', email: '', hire_date: '' 
  })
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    // Загружаем сотрудников вместе с названием их должности
    const { data: empData } = await supabase.from('employees').select(`
      id, full_name, phone, email, hire_date,
      positions ( name )
    `).order('id', { ascending: false })
    
    if (empData) setEmployees(empData)

    // Загружаем список должностей для выпадающего списка
    const { data: posData } = await supabase.from('positions').select('*')
    if (posData) setPositions(posData)
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const payload = {
      ...formData,
      position_id: Number(formData.position_id)
    }

    const { error } = await supabase.from('employees').insert([payload])
    
    if (error) alert(error.message)
    else {
      setIsFormOpen(false)
      setFormData({ full_name: '', position_id: '', phone: '', email: '', hire_date: '' })
      fetchData()
    }
    setLoading(false)
  }

  return (
    <>
      <Helmet>
        <title>Сотрудники - AutoSalon</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Сотрудники</h1>
        <button onClick={() => setIsFormOpen(!isFormOpen)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          {isFormOpen ? 'Отмена' : '+ Добавить сотрудника'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 grid grid-cols-2 gap-4">
          <input required placeholder="ФИО" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="border p-2 rounded" />
          <select required value={formData.position_id} onChange={e => setFormData({...formData, position_id: e.target.value})} className="border p-2 rounded bg-white">
            <option value="">Выберите должность</option>
            {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input placeholder="Телефон" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="border p-2 rounded" />
          <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="border p-2 rounded" />
          <input required type="date" value={formData.hire_date} onChange={e => setFormData({...formData, hire_date: e.target.value})} className="border p-2 rounded col-span-2" />
          <button disabled={loading} type="submit" className="col-span-2 bg-green-600 text-white p-2 rounded hover:bg-green-700">
            {loading ? 'Сохранение...' : 'Сохранить сотрудника'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm">
            <tr>
              <th className="p-4">ФИО</th>
              <th className="p-4">Должность</th>
              <th className="p-4">Телефон</th>
              <th className="p-4">Дата приема</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-medium">{emp.full_name}</td>
                <td className="p-4 text-blue-600 font-medium text-sm">{emp.positions?.name || '—'}</td>
                <td className="p-4 text-slate-600">{emp.phone || '—'}</td>
                <td className="p-4 text-slate-600">{new Date(emp.hire_date).toLocaleDateString('ru-RU')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}