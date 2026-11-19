import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [stats, setStats] = useState({ cars: 0, customers: 0, sales: 0, revenue: 0 })
  const [recentSales, setRecentSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Запрашиваем данные параллельно
        const [
          { count: cars },
          { count: customers },
          { count: sales },
          { data: salesData }
        ] = await Promise.all([
          supabase.from('cars').select('*', { count: 'exact', head: true }),
          supabase.from('customers').select('*', { count: 'exact', head: true }),
          supabase.from('sales').select('*', { count: 'exact', head: true }),
          // Запрашиваем ВСЕ продажи, чтобы посчитать общую выручку
          supabase.from('sales').select(`
            id, sale_date, sale_price, contract_number,
            cars ( vin, models ( name, brands ( name ) ) ),
            customers ( full_name )
          `).order('id', { ascending: false })
        ])

        // Считаем общую выручку от ВСЕХ проданных автомобилей
        let totalRevenue = 0
        if (salesData && salesData.length > 0) {
          totalRevenue = salesData.reduce((sum, sale) => sum + Number(sale.sale_price), 0)
        }

        // Берем только 5 последних продаж для отображения в таблице
        const recentSales = salesData ? salesData.slice(0, 5) : []

        setStats({
          cars: cars || 0,
          customers: customers || 0,
          sales: sales || 0,
          revenue: totalRevenue
        })
        setRecentSales(recentSales)
      } catch (error) {
        console.error('Ошибка загрузки дашборда:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Загрузка данных...
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Обзор - AutoSalon</title>
        <meta name="description" content="Панель управления автосалоном: статистика, последние продажи и быстрый доступ." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Добро пожаловать!</h1>
        <p className="text-slate-500 mt-1">Главные показатели и последние операции автосалона.</p>
      </div>

      {/* Карточки со статистикой */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Автомобили */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Автомобили</div>
              <div className="text-3xl font-bold text-blue-600">{stats.cars}</div>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg text-xl">◈</div>
          </div>
          <div className="text-xs text-slate-400 mt-4">Всего в системе</div>
        </div>

        {/* Клиенты */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Клиенты</div>
              <div className="text-3xl font-bold text-purple-600">{stats.customers}</div>
            </div>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg text-xl">♙</div>
          </div>
          <div className="text-xs text-slate-400 mt-4">Зарегистрировано</div>
        </div>

        {/* Сделки */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Сделки</div>
              <div className="text-3xl font-bold text-orange-500">{stats.sales}</div>
            </div>
            <div className="p-2 bg-orange-50 text-orange-500 rounded-lg text-xl">↗</div>
          </div>
          <div className="text-xs text-slate-400 mt-4">Оформлено продаж</div>
        </div>

        {/* Выручка (Общая сумма всех продаж) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Выручка</div>
              <div className="text-3xl font-bold text-green-600">
                {stats.revenue.toLocaleString('ru-RU')} ₽
              </div>
            </div>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg text-xl">₽</div>
          </div>
          <div className="text-xs text-slate-400 mt-4">Общая сумма всех сделок</div>
        </div>
      </div>

      {/* Последние продажи и быстрый доступ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Таблица последних продаж */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Последние продажи</h2>
              <p className="text-sm text-slate-500">Недавно оформленные сделки</p>
            </div>
            <Link to="/sales" className="text-sm text-blue-600 hover:underline">Все продажи →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="p-4 font-medium">Договор</th>
                  <th className="p-4 font-medium">Автомобиль</th>
                  <th className="p-4 font-medium">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.length === 0 ? (
                  <tr><td colSpan="3" className="p-6 text-center text-slate-500">Продаж пока нет.</td></tr>
                ) : (
                  recentSales.map(sale => (
                    <tr key={sale.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="p-4">
                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded font-medium">
                          {sale.contract_number || `№${sale.id}`}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800">
                          {sale.cars?.models?.brands?.name} {sale.cars?.models?.name}
                        </div>
                        <div className="text-xs text-slate-500">{sale.customers?.full_name}</div>
                      </td>
                      <td className="p-4 font-bold text-slate-700">
                        {Number(sale.sale_price).toLocaleString('ru-RU')} ₽
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Быстрый доступ */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Быстрый доступ</h2>
          <div className="space-y-3">
            <Link to="/cars" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl">＋</div>
              <div>
                <div className="font-medium text-slate-800">Добавить автомобиль</div>
                <div className="text-xs text-slate-500">Новая позиция в каталоге</div>
              </div>
            </Link>
            <Link to="/customers" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xl">♙</div>
              <div>
                <div className="font-medium text-slate-800">Новый клиент</div>
                <div className="text-xs text-slate-500">Создать карточку клиента</div>
              </div>
            </Link>
            <Link to="/sales" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center text-xl">↗</div>
              <div>
                <div className="font-medium text-slate-800">Оформить продажу</div>
                <div className="text-xs text-slate-500">Создать новую сделку</div>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </>
  )
}