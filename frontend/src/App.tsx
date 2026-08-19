import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import LoadingScreen from './components/LoadingScreen'
import Dashboard from './pages/Dashboard'

const Home = lazy(() => import('./pages/Home'))
const DashboardHome = lazy(() => import('./pages/dashboard/Home'))
const Business = lazy(() => import('./pages/dashboard/Business'))
const Content = lazy(() => import('./pages/dashboard/Content'))
const Accounts = lazy(() => import('./pages/dashboard/Accounts'))
const Discord = lazy(() => import('./pages/dashboard/Discord'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const NotFound = lazy(() => import('./pages/NotFound'))

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path="business" element={<Business />} />
          <Route path="content" element={<Content />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="discord" element={<Discord />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default App
