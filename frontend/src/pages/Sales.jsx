import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Helmet } from 'react-helmet-async'

export default function Sales() {
  const [sales, setSales] = useState([])
  const [cars, setCars] = useState([])
  const [customers, setCustomers] = useState([])
  const [employees, setEmployees] = useState([])
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const initialForm = {
    car_id: '', customer_id: '', employee_id: '', sale_date: '', sale_price: '', payment_method: 'Наличные', contract_number: ''
  }
  const [formData, setFormData] = useState(initialForm)

  const fetchData = async () => {
    // 1. Загружаем продажи (с привязкой к машинам и клиентам)
    const { data: salesData } = await supabase.from('sales').select(`
      id, sale_date, sale_price, payment_method, contract_number,
      cars ( vin, models ( name, brands ( name ) ) ),
      customers ( full_name )
    `).order('id', { ascending: false })
    if (salesData) setSales(salesData)

    // 2. Загружаем только те машины, которые "В наличии"
    const { data: carsData } = await supabase.from('cars').select(`
      id, vin, list_price, models ( name, brands ( name ) )
    `).eq('status_id', 1) // 1 = "В наличии"
    if (carsData) setCars(carsData)

    // 3. Загружаем клиентов и сотрудников для выпадающих списков
    const { data: custData } = await supabase.from('customers').select('id, full_name')
    if (custData) setCustomers(custData)

    const { data: empData } = await supabase.from('employees').select('id, full_name')
    if (empData) setEmployees(empData)
  }

  useEffect(() => { fetchData() }, [])

  // При выборе машины автоматически подставляем её цену
  const handleCarChange = (e) => {
    const selectedCarId = e.target.value
    const selectedCar = cars.find(c => c.id === Number(selectedCarId))
    setFormData({
      ...formData,
      car_id: selectedCarId,
      sale_price: selectedCar ? selectedCar.list_price : ''
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // 1. Создаем запись о продаже
    const { error: saleError } = await supabase.from('sales').insert([{
      car_id: Number(formData.car_id),
      customer_id: Number(formData.customer_id),
      employee_id: Number(formData.employee_id),
      sale_date: formData.sale_date,
      sale_price: Number(formData.sale_price),
      payment_method: formData.payment_method,
      contract_number: formData.contract_number
    }])

    if (saleError) {
      setError(saleError.message)
      setLoading(false)
      return
    }

    // 2. Меняем статус машины на "Продан" (id=2)
    await supabase.from('cars').update({ status_id: 2 }).eq('id', formData.car_id)

    // Успех!
    setIsFormOpen(false)
    setFormData(initialForm)
    fetchData()
    setLoading(false)
  }

  return (
    <>
      <Helmet>
        <title>Продажи - AutoSalon</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Продажи</h1>
          <p className="text-sm text-slate-500">История оформленных сделок</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          {isFormOpen ? 'Отмена' : '+ Оформить продажу'}
        </button>
      </div>

      {/* Форма продажи */}
      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Новая сделка</h2>
          
          {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
          {cars.length === 0 && <div className="bg-yellow-50 text-yellow-700 p-3 rounded mb-4 text-sm">Нет доступных автомобилей (все проданы или на сервисе).</div>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Автомобиль</label>
              <select required value={formData.car_id} onChange={handleCarChange} className="w-full border p-2 rounded bg-white">
                <option value="">Выберите автомобиль из наличия</option>
                {cars.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.models?.brands?.name} {c.models?.name} (VIN: {c.vin}) — {c.list_price.toLocaleString('ru-RU')} ₽
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Клиент</label>
              <select required value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: e.target.value})} className="w-full border p-2 rounded bg-white">
                <option value="">Выберите клиента</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Менеджер</label>
              <select required value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})} className="w-full border p-2 rounded bg-white">
                <option value="">Кто оформил?</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Дата продажи</label>
              <input required type="date" value={formData.sale_date} onChange={e => setFormData({...formData, sale_date: e.target.value})} className="w-full border p-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Цена продажи, ₽</label>
              <input required type="number" value={formData.sale_price} onChange={e => setFormData({...formData, sale_price: e.target.value})} className="w-full border p-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Способ оплаты</label>
              <select value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})} className="w-full border p-2 rounded bg-white">
                <option value="Наличные">Наличные</option>
                <option value="Банковский перевод">Банковский перевод</option>
                <option value="Кредит">Кредит</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Номер договора</label>
              <input required value={formData.contract_number} onChange={e => setFormData({...formData, contract_number: e.target.value})} className="w-full border p-2 rounded" placeholder="ДП-2025-XXX" />
            </div>

            <div className="md:col-span-2 flex justify-end pt-4 border-t border-slate-100">
              <button disabled={loading || cars.length === 0} type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
                {loading ? 'Оформление...' : 'Оформить сделку'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Таблица продаж */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm">
            <tr>
              <th className="p-4">Договор</th>
              <th className="p-4">Автомобиль</th>
              <th className="p-4">Клиент</th>
              <th className="p-4">Дата</th>
              <th className="p-4">Сумма</th>
              <th className="p-4">Оплата</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(sale => (
              <tr key={sale.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-4">
                  <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded font-medium">{sale.contract_number}</span>
                </td>
                <td className="p-4 font-medium">{sale.cars?.models?.brands?.name} {sale.cars?.models?.name}</td>
                <td className="p-4 text-slate-600">{sale.customers?.full_name}</td>
                <td className="p-4 text-slate-600">{new Date(sale.sale_date).toLocaleDateString('ru-RU')}</td>
                <td className="p-4 font-bold text-green-600">{sale.sale_price.toLocaleString('ru-RU')} ₽</td>
                <td className="p-4 text-sm text-slate-500">{sale.payment_method}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}