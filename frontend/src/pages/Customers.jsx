import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Helmet } from 'react-helmet-async'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({ full_name: '', phone: '', email: '', address: '' })
  const [loading, setLoading] = useState(false)

  const fetchCustomers = async () => {
    const { data } = await supabase.from('customers').select('*').order('id', { ascending: false })
    if (data) setCustomers(data)
  }

  useEffect(() => { fetchCustomers() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('customers').insert([formData])
    
    if (error) alert(error.message)
    else {
      setIsFormOpen(false)
      setFormData({ full_name: '', phone: '', email: '', address: '' })
      fetchCustomers()
    }
    setLoading(false)
  }

  return (
    <>
      <Helmet>
        <title>Клиенты - AutoSalon</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Клиенты</h1>
        <button onClick={() => setIsFormOpen(!isFormOpen)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          {isFormOpen ? 'Отмена' : '+ Добавить клиента'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 grid grid-cols-2 gap-4">
          <input required placeholder="ФИО" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="border p-2 rounded" />
          <input required placeholder="Телефон" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="border p-2 rounded" />
          <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="border p-2 rounded" />
          <input placeholder="Адрес" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="border p-2 rounded" />
          <button disabled={loading} type="submit" className="col-span-2 bg-green-600 text-white p-2 rounded hover:bg-green-700">
            {loading ? 'Сохранение...' : 'Сохранить клиента'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm">
            <tr>
              <th className="p-4">ФИО</th>
              <th className="p-4">Телефон</th>
              <th className="p-4">Email</th>
              <th className="p-4">Адрес</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-medium">{c.full_name}</td>
                <td className="p-4 text-slate-600">{c.phone || '—'}</td>
                <td className="p-4 text-slate-600">{c.email || '—'}</td>
                <td className="p-4 text-slate-600">{c.address || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}