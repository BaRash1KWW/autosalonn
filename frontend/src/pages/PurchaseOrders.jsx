import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Helmet } from 'react-helmet-async'

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [models, setModels] = useState([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const initialForm = { supplier_id: '', model_id: '', quantity: 1, unit_price: '', order_date: '', expected_date: '' }
  const [formData, setFormData] = useState(initialForm)

  const fetchData = async () => {
    // Загружаем заказы с привязкой к поставщикам
    const { data: ordData } = await supabase.from('purchase_orders').select(`
      id, order_date, expected_date, status, total_amount,
      suppliers ( name )
    `).order('id', { ascending: false })
    if (ordData) setOrders(ordData)

    // Загружаем справочники для формы
    const { data: supData } = await supabase.from('suppliers').select('id, name')
    if (supData) setSuppliers(supData)

    const { data: modData } = await supabase.from('models').select(`
      id, name, brands ( name )
    `)
    if (modData) setModels(modData)
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // 1. Создаем сам заказ
    const { data: orderData, error: orderError } = await supabase.from('purchase_orders').insert([{
      supplier_id: Number(formData.supplier_id),
      order_date: formData.order_date,
      expected_date: formData.expected_date || null,
      status: 'Создан',
      total_amount: Number(formData.quantity) * Number(formData.unit_price)
    }]).select()

    if (orderError) {
      alert(orderError.message)
      setLoading(false)
      return
    }

    // 2. Создаем позицию заказа (связываем заказ и модель)
    if (orderData && orderData.length > 0) {
      await supabase.from('purchase_order_items').insert([{
        purchase_order_id: orderData[0].id,
        model_id: Number(formData.model_id),
        quantity: Number(formData.quantity),
        unit_price: Number(formData.unit_price)
      }])
    }

    setIsFormOpen(false)
    setFormData(initialForm)
    fetchData()
    setLoading(false)
  }

  return (
    <>
      <Helmet><title>Заказы поставщикам - AutoSalon</title></Helmet>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Заказы поставщикам</h1>
        <button onClick={() => setIsFormOpen(!isFormOpen)} className="bg-blue-600 text-white px-5 py-2 rounded-lg">
          {isFormOpen ? 'Отмена' : '+ Новый заказ'}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
          <h2 className="text-lg font-bold mb-4">Создание заказа</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm mb-1">Поставщик</label>
              <select required value={formData.supplier_id} onChange={e => setFormData({...formData, supplier_id: e.target.value})} className="w-full border p-2 rounded bg-white">
                <option value="">Выберите поставщика</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Модель автомобиля</label>
              <select required value={formData.model_id} onChange={e => setFormData({...formData, model_id: e.target.value})} className="w-full border p-2 rounded bg-white">
                <option value="">Выберите модель</option>
                {models.map(m => <option key={m.id} value={m.id}>{m.brands?.name} {m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Количество</label>
              <input required type="number" min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm mb-1">Цена за единицу, ₽</label>
              <input required type="number" min="0" value={formData.unit_price} onChange={e => setFormData({...formData, unit_price: e.target.value})} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm mb-1">Дата заказа</label>
              <input required type="date" value={formData.order_date} onChange={e => setFormData({...formData, order_date: e.target.value})} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm mb-1">Ожидаемая дата</label>
              <input type="date" value={formData.expected_date} onChange={e => setFormData({...formData, expected_date: e.target.value})} className="w-full border p-2 rounded" />
            </div>
            <div className="col-span-2 flex justify-end pt-4 border-t">
              <button disabled={loading} type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg">
                {loading ? 'Создание...' : 'Создать заказ'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm">
            <tr>
              <th className="p-4">№</th>
              <th className="p-4">Поставщик</th>
              <th className="p-4">Дата</th>
              <th className="p-4">Ожидаемая</th>
              <th className="p-4">Сумма</th>
              <th className="p-4">Статус</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-medium">{o.id}</td>
                <td className="p-4">{o.suppliers?.name}</td>
                <td className="p-4">{new Date(o.order_date).toLocaleDateString('ru-RU')}</td>
                <td className="p-4">{o.expected_date ? new Date(o.expected_date).toLocaleDateString('ru-RU') : '—'}</td>
                <td className="p-4 font-bold text-green-600">{o.total_amount?.toLocaleString('ru-RU')} ₽</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded text-xs">{o.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}