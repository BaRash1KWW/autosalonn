import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Helmet } from 'react-helmet-async'

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const initialForm = { name: '', contact_person: '', phone: '', email: '', address: '' }
  const [formData, setFormData] = useState(initialForm)

  const fetchSuppliers = async () => {
    const { data } = await supabase.from('suppliers').select('*').order('id', { ascending: false })
    if (data) setSuppliers(data)
  }

  useEffect(() => { fetchSuppliers() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('suppliers').insert([formData])

    if (error) {
      alert(error.message)
    } else {
      setIsFormOpen(false)
      setFormData(initialForm)
      fetchSuppliers()
    }
    setLoading(false)
  }

  return (
    <>
      <Helmet>
        <title>Поставщики - AutoSalon</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Поставщики</h1>
          <p className="text-sm text-slate-500">Список партнеров и контактные лица</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          {isFormOpen ? 'Отмена' : '+ Добавить поставщика'}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Новый поставщик</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Название организации</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Контактное лицо</label>
              <input value={formData.contact_person} onChange={e => setFormData({...formData, contact_person: e.target.value})} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Телефон</label>
              <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Адрес</label>
              <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border p-2 rounded" />
            </div>
            <div className="md:col-span-2 flex justify-end pt-4 border-t border-slate-100">
              <button disabled={loading} type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
                {loading ? 'Сохранение...' : 'Сохранить поставщика'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm">
            <tr>
              <th className="p-4">Название</th>
              <th className="p-4">Контактное лицо</th>
              <th className="p-4">Телефон</th>
              <th className="p-4">Email</th>
              <th className="p-4">Адрес</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map(sup => (
              <tr key={sup.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-medium">{sup.name}</td>
                <td className="p-4 text-slate-600">{sup.contact_person || '—'}</td>
                <td className="p-4 text-slate-600">{sup.phone || '—'}</td>
                <td className="p-4 text-slate-600">{sup.email || '—'}</td>
                <td className="p-4 text-slate-600 truncate max-w-xs">{sup.address || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}