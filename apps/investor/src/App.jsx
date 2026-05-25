import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence }   from 'framer-motion'
import { useAuth }           from '@/hooks/useAuth'
import { useAuthStore }      from '@/store/auth.store'
import { Loader }            from '@/components/common/Loader'
import { AuthLayout }        from '@/layouts/AuthLayout'
import { AppLayout }         from '@/layouts/AppLayout'

import { InviteCodePage }    from '@/pages/auth/InviteCode.page'
import { RegisterPage }      from '@/pages/auth/Register.page'
import { LoginPage }         from '@/pages/auth/Login.page'
import { DashboardPage }     from '@/pages/dashboard/Dashboard.page'
import { InvestmentsPage }   from '@/pages/investments/Investments.page'
import { FleetDetailPage }   from '@/pages/fleet/FleetDetail.page'
import { NotificationsPage } from '@/pages/notifications/Notifications.page'
import { ProfilePage }       from '@/pages/profile/Profile.page'

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuthStore()
  if (isLoading) return <Loader fullscreen />
  if (!user)     return <Navigate to="/login" replace />
  return children
}

function GuestRoute({ children }) {
  const { user, isLoading } = useAuthStore()
  if (isLoading) return <Loader fullscreen />
  if (user)      return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const { isLoading } = useAuth()

  if (isLoading) return <Loader fullscreen />

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/invite"   element={<GuestRoute><InviteCodePage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
            <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
          </Route>

          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard"     element={<DashboardPage />} />
            <Route path="/investments"   element={<InvestmentsPage />} />
            <Route path="/fleet/:id"     element={<FleetDetailPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile"       element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}