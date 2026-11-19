import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Helmet } from 'react-helmet-async'

export default function Catalog() {
  const [brands, setBrands] = useState([])
  const [models, setModels] = useState([])
  const [newBrand, setNewBrand] = useState({ name: '', country: '' })
  const [newModel, setNewModel] = useState({ brand_id: '', name: '', body_type: 'Седан' })

  const fetchData = async () => {
    const { data: b } = await supabase.from('brands').select('*').order('name')
    if (b) setBrands(b)
    const { data: m } = await supabase.from('models').select(`
      id, name, body_type, brands ( name )
    `).order('name')
    if (m) setModels(m)
  }

  useEffect(() => { fetchData() }, [])

  const addBrand = async (e) => {
    e.preventDefault()
    await supabase.from('brands').insert([newBrand])
    setNewBrand({ name: '', country: '' })
    fetchData()
  }

  const addModel = async (e) => {
    e.preventDefault()
    await supabase.from('models').insert([{
      brand_id: Number(newModel.brand_id),
      name: newModel.name,
      body_type: newModel.body_type
    }])
    setNewModel({ brand_id: '', name: '', body_type: 'Седан' })
    fetchData()
  }

  return (
    <>
      <Helmet><title>Марки и Модели - AutoSalon</title></Helmet>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Левая колонка: Марки */}
        <div>
          <h2 className="text-xl font-bold mb-4">Марки автомобилей</h2>
          <form onSubmit={addBrand} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-4 flex gap-2">
            <input required placeholder="Название марки" value={newBrand.name} onChange={e => setNewBrand({...newBrand, name: e.target.value})} className="border p-2 rounded flex-1" />
            <input required placeholder="Страна" value={newBrand.country} onChange={e => setNewBrand({...newBrand, country: e.target.value})} className="border p-2 rounded flex-1" />
            <button type="submit" className="bg-blue-600 text-white px-4 rounded">Добавить</button>
          </form>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-sm"><tr><th className="p-3">Название</th><th className="p-3">Страна</th></tr></thead>
              <tbody>
                {brands.map(b => (
                  <tr key={b.id} className="border-t border-slate-100">
                    <td className="p-3 font-medium">{b.name}</td>
                    <td className="p-3 text-slate-600">{b.country}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Правая колонка: Модели */}
        <div>
          <h2 className="text-xl font-bold mb-4">Модели автомобилей</h2>
          <form onSubmit={addModel} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-4 flex flex-wrap gap-2">
            <select required value={newModel.brand_id} onChange={e => setNewModel({...newModel, brand_id: e.target.value})} className="border p-2 rounded bg-white w-full">
              <option value="">Выберите марку</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <input required placeholder="Название модели" value={newModel.name} onChange={e => setNewModel({...newModel, name: e.target.value})} className="border p-2 rounded flex-1" />
            <input required placeholder="Тип кузова" value={newModel.body_type} onChange={e => setNewModel({...newModel, body_type: e.target.value})} className="border p-2 rounded w-24" />
            <button type="submit" className="bg-green-600 text-white px-4 rounded">Добавить</button>
          </form>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-sm"><tr><th className="p-3">Марка</th><th className="p-3">Модель</th><th className="p-3">Кузов</th></tr></thead>
              <tbody>
                {models.map(m => (
                  <tr key={m.id} className="border-t border-slate-100">
                    <td className="p-3 text-slate-600">{m.brands?.name}</td>
                    <td className="p-3 font-medium">{m.name}</td>
                    <td className="p-3 text-slate-500 text-sm">{m.body_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}