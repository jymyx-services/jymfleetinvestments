import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence }  from 'framer-motion'
import { useAuth }          from './hooks/useAuth'
import { useAuthStore }     from './store/auth.store'
import { Loader }           from './components/common/Loader'
import { AdminLayout }      from './layouts/AdminLayout'

import { LoginPage }        from './pages/auth/Login.page'
import { DashboardPage }    from './pages/dashboard/Dashboard.page'
import { FleetsPage }       from './pages/fleets/Fleets.page'
import { EarningsPage }     from './pages/earnings/Earnings.page'
import { InvestorsPage }    from './pages/investors/Investors.page'
import { InviteCodesPage }  from './pages/invite-codes/InviteCodes.page'
import { UnitSalesPage }    from './pages/unit-sales/UnitSales.page'

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuthStore()
  if (isLoading) return <Loader fullscreen />
  if (!user)     return <Navigate to="/admin/login" replace />
  return children
}

function GuestRoute({ children }) {
  const { user, isLoading } = useAuthStore()
  if (isLoading) return <Loader fullscreen />
  if (user)      return <Navigate to="/admin/dashboard" replace />
  return children
}

export default function App() {
  const { isLoading } = useAuth()
  if (isLoading) return <Loader fullscreen />

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/admin/login"
            element={<GuestRoute><LoginPage /></GuestRoute>} />

          <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route path="/admin/dashboard"    element={<DashboardPage />} />
            <Route path="/admin/fleets"       element={<FleetsPage />} />
            <Route path="/admin/earnings"     element={<EarningsPage />} />
            <Route path="/admin/investors"    element={<InvestorsPage />} />
            <Route path="/admin/invite-codes" element={<InviteCodesPage />} />
            <Route path="/admin/unit-sales"   element={<UnitSalesPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}