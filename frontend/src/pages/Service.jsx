import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Helmet } from 'react-helmet-async'

export default function Service() {
  const [records, setRecords] = useState([])
  const [cars, setCars] = useState([])
  const [employees, setEmployees] = useState([])
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const initialForm = { car_id: '', employee_id: '', service_date: '', service_type: '', cost: '', description: '' }
  const [formData, setFormData] = useState(initialForm)

  const fetchData = async () => {
    // 1. Загружаем сервисные записи с привязкой к машинам и сотрудникам
    const { data: recData } = await supabase.from('service_records').select(`
      id, service_date, service_type, cost, description,
      cars ( vin, models ( name, brands ( name ) ) ),
      employees ( full_name )
    `).order('id', { ascending: false })
    if (recData) setRecords(recData)

    // 2. Загружаем машины и сотрудников для выпадающих списков
    const { data: carsData } = await supabase.from('cars').select(`
      id, vin, models ( name, brands ( name ) )
    `)
    if (carsData) setCars(carsData)

    const { data: empData } = await supabase.from('employees').select('id, full_name')
    if (empData) setEmployees(empData)
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('service_records').insert([{
      car_id: Number(formData.car_id),
      employee_id: Number(formData.employee_id),
      service_date: formData.service_date,
      service_type: formData.service_type,
      cost: Number(formData.cost),
      description: formData.description
    }])

    if (error) {
      alert(error.message)
    } else {
      setIsFormOpen(false)
      setFormData(initialForm)
      fetchData()
    }
    setLoading(false)
  }

  return (
    <>
      <Helmet>
        <title>Сервис - AutoSalon</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Сервисные записи</h1>
          <p className="text-sm text-slate-500">История ремонтов и технического обслуживания</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          {isFormOpen ? 'Отмена' : '+ Добавить запись'}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Новая запись в сервис</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Автомобиль</label>
              <select required value={formData.car_id} onChange={e => setFormData({...formData, car_id: e.target.value})} className="w-full border p-2 rounded bg-white">
                <option value="">Выберите автомобиль</option>
                {cars.map(c => (
                  <option key={c.id} value={c.id}>{c.models?.brands?.name} {c.models?.name} (VIN: {c.vin})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ответственный сотрудник</label>
              <select required value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})} className="w-full border p-2 rounded bg-white">
                <option value="">Кто выполняет?</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Дата обслуживания</label>
              <input required type="date" value={formData.service_date} onChange={e => setFormData({...formData, service_date: e.target.value})} className="w-full border p-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Тип работ</label>
              <input required value={formData.service_type} onChange={e => setFormData({...formData, service_type: e.target.value})} className="w-full border p-2 rounded" placeholder="Замена масла, диагностика..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Стоимость, ₽</label>
              <input required type="number" min="0" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} className="w-full border p-2 rounded" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Описание работ</label>
              <textarea rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border p-2 rounded resize-none"></textarea>
            </div>

            <div className="md:col-span-2 flex justify-end pt-4 border-t border-slate-100">
              <button disabled={loading} type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
                {loading ? 'Сохранение...' : 'Сохранить запись'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm">
            <tr>
              <th className="p-4">Автомобиль</th>
              <th className="p-4">Дата</th>
              <th className="p-4">Работы</th>
              <th className="p-4">Стоимость</th>
              <th className="p-4">Сотрудник</th>
            </tr>
          </thead>
          <tbody>
            {records.map(rec => (
              <tr key={rec.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-medium">
                  {rec.cars?.models?.brands?.name} {rec.cars?.models?.name}
                </td>
                <td className="p-4 text-slate-600">{new Date(rec.service_date).toLocaleDateString('ru-RU')}</td>
                <td className="p-4">
                  <div className="text-slate-800">{rec.service_type}</div>
                  <div className="text-xs text-slate-500 truncate max-w-xs">{rec.description}</div>
                </td>
                <td className="p-4 font-bold text-slate-700">{rec.cost.toLocaleString('ru-RU')} ₽</td>
                <td className="p-4 text-slate-600">{rec.employees?.full_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}