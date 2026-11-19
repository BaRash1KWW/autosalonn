import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'


import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Cars from './pages/Cars'
import Customers from './pages/Customers'
import Employees from './pages/Employees'
import Layout from './components/Layout'
import Sales from './pages/Sales'
import Service from './pages/Service'
import Suppliers from './pages/Suppliers'
import PurchaseOrders from './pages/PurchaseOrders'
import Catalog from './pages/Catalog'
import Settings from './pages/Settings'

function ProtectedRoute({ session, children }) {
  if (!session) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-slate-500">Загрузка приложения...</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/login" element={session ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={session ? <Navigate to="/" /> : <Register />} />

        {/* Защищенные маршруты (только после входа) */}
        <Route path="/" element={
          <ProtectedRoute session={session}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="cars" element={<Cars />} />
          <Route path="customers" element={<Customers />} />
          <Route path="employees" element={<Employees />} />
          <Route path="sales" element={<Sales />} />
          <Route path="service-records" element={<Service />} />   
          <Route path="suppliers" element={<Suppliers />} />  
          <Route path="purchase-orders" element={<PurchaseOrders />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="settings" element={<Settings />} />     
        </Route>

        {/* Если адрес не найден — кидаем на главную */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}