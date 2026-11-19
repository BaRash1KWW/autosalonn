import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useState, useEffect } from 'react'

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserEmail(user.email)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const menuItems = [
    { path: '/', label: 'Обзор', icon: '▦' },
    { path: '/cars', label: 'Автомобили', icon: '◈' },
    { path: '/customers', label: 'Клиенты', icon: '♙' },
    { path: '/sales', label: 'Продажи', icon: '↗' },
    { path: '/employees', label: 'Сотрудники', icon: '♧' },
    { path: '/service-records', label: 'Сервис', icon: '⚙' },
    { path: '/suppliers', label: 'Поставщики', icon: '▤' },
    { path: '/purchase-orders', label: 'Заказы', icon: '☷' },     
    { path: '/catalog', label: 'Марки и Модели', icon: '◇' },     
    { path: '/settings', label: 'Настройки', icon: '⚙' },      
  ]

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* Боковое меню */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-blue-400">AutoSalon</h1>
          <p className="text-xs text-slate-400 mt-1">Система управления</p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = item.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.path)

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="mb-3 px-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Пользователь</p>
            <p className="text-sm text-slate-300 truncate">{userEmail || 'Загрузка...'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
          >
            Выйти
          </button>
        </div>
      </aside>

      {/* Основной контент */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center">
          <h2 className="text-sm font-medium text-slate-500">Панель управления</h2>
          <span className="text-sm text-slate-700 font-medium bg-slate-100 px-3 py-1 rounded-full">Администратор</span>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet /> {/* Сюда будут вставляться страницы */}
        </div>
      </main>
    </div>
  )
}