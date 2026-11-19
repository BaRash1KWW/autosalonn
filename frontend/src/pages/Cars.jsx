import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Helmet } from 'react-helmet-async'

export default function Cars() {
  const [cars, setCars] = useState([])
  const [models, setModels] = useState([])
  const [statuses, setStatuses] = useState([])
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null) // Если null - создаем новую, иначе - редактируем
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const initialFormState = {
    vin: '', year: '', color: '', list_price: '', model_id: '', status_id: ''
  }
  const [formData, setFormData] = useState(initialFormState)

  const fetchData = async () => {
    // 1. Загружаем машины
    const { data: carsData, error: carsError } = await supabase.from('cars').select(`
      id, vin, year, color, list_price, model_id, status_id,
      models ( name, brands ( name ) ),
      car_statuses ( name )
    `).order('id', { ascending: false })
    
    if (carsError) console.error(carsError)
    else setCars(carsData)

    // 2. Загружаем модели (для выпадающего списка)
    const { data: modelsData } = await supabase.from('models').select(`
      id, name, brands ( name )
    `)
    if (modelsData) setModels(modelsData)

    // 3. Загружаем статусы (для выпадающего списка)
    const { data: statusesData } = await supabase.from('car_statuses').select('*')
    if (statusesData) setStatuses(statusesData)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Обработка отправки формы (Создание или Обновление)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      vin: formData.vin,
      year: Number(formData.year),
      color: formData.color,
      list_price: Number(formData.list_price),
      model_id: Number(formData.model_id),
      status_id: Number(formData.status_id)
    }

    let dbError;

    if (editingId) {
      // Обновление существующей записи
      const { error } = await supabase.from('cars').update(payload).eq('id', editingId)
      dbError = error
    } else {
      // Создание новой
      const { error } = await supabase.from('cars').insert([payload])
      dbError = error
    }

    if (dbError) {
      setError(dbError.message)
    } else {
      // Успех! Закрываем форму и обновляем данные
      closeForm()
      fetchData()
    }
    setLoading(false)
  }

  // Открытие формы для редактирования
  const handleEditClick = (car) => {
    setFormData({
      vin: car.vin,
      year: car.year,
      color: car.color,
      list_price: car.list_price,
      model_id: car.model_id,
      status_id: car.status_id
    })
    setEditingId(car.id)
    setIsFormOpen(true)
    setError(null)
  }

  // Закрытие и сброс формы
  const closeForm = () => {
    setIsFormOpen(false)
    setEditingId(null)
    setFormData(initialFormState)
    setError(null)
  }

  // Удаление
  const handleDelete = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить этот автомобиль?')) return
    
    const { error } = await supabase.from('cars').delete().eq('id', id)
    if (error) {
      alert('Ошибка удаления: ' + error.message)
    } else {
      fetchData()
    }
  }

  return (
    <>
      <Helmet>
        <title>Автомобили - AutoSalon</title>
        <meta name="description" content="Управление каталогом автомобилей автосалона." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Автомобили</h1>
          <p className="text-sm text-slate-500">Каталог всех машин в базе данных</p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            + Добавить машину
          </button>
        )}
      </div>

      {/* Форма добавления/редактирования */}
      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            {editingId ? 'Редактировать автомобиль' : 'Новый автомобиль'}
          </h2>
          
          {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">VIN</label>
              <input required value={formData.vin} onChange={e => setFormData({...formData, vin: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="17 символов" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Год выпуска</label>
              <input required type="number" min="1980" max="2035" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Цвет</label>
              <input required value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Цена, ₽</label>
              <input required type="number" min="0" value={formData.list_price} onChange={e => setFormData({...formData, list_price: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Модель</label>
              <select required value={formData.model_id} onChange={e => setFormData({...formData, model_id: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="" disabled>Выберите модель</option>
                {models.map(m => (
                  <option key={m.id} value={m.id}>{m.brands?.name} {m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Статус</label>
              <select required value={formData.status_id} onChange={e => setFormData({...formData, status_id: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="" disabled>Выберите статус</option>
                {statuses.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-2 pt-4 border-t border-slate-100">
              <button type="button" onClick={closeForm} className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">
                Отмена
              </button>
              <button disabled={loading} type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition shadow-sm disabled:opacity-50">
                {loading ? 'Сохранение...' : (editingId ? 'Сохранить изменения' : 'Добавить в базу')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Таблица */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500 font-medium">
              <tr>
                <th className="p-4">Автомобиль</th>
                <th className="p-4">VIN</th>
                <th className="p-4">Год</th>
                <th className="p-4">Цена</th>
                <th className="p-4">Статус</th>
                <th className="p-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {cars.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">В базе пока нет машин.</td>
                </tr>
              ) : (
                cars.map(car => (
                  <tr key={car.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{car.models?.brands?.name} {car.models?.name}</div>
                      <div className="text-xs text-slate-500">{car.color}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 font-mono">{car.vin}</td>
                    <td className="p-4">{car.year}</td>
                    <td className="p-4 font-bold text-green-600">{car.list_price.toLocaleString('ru-RU')} ₽</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {car.car_statuses?.name}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-3">
                      <button onClick={() => handleEditClick(car)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Изменить
                      </button>
                      <button onClick={() => handleDelete(car.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}