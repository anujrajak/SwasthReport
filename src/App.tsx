import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Providers } from '@/components/providers/session-provider'
import { Toaster } from '@/components/ui/sonner'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './pages/DashboardLayout'
import DashboardPage from './pages/DashboardPage'
import PatientsPage from './pages/PatientsPage'
import PatientReportsPage from './pages/PatientReportsPage'
import MakeReportPage from './pages/MakeReportPage'
import LabDetailsPage from './pages/LabDetailsPage'
import ReportsPage from './pages/ReportsPage'

function App() {
  return (
    <Providers>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        storageKey="swasth-theme"
        suppressHydrationWarning
      >
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="patients" element={<PatientsPage />} />
            <Route path="patients/:patientId/reports" element={<PatientReportsPage />} />
            <Route path="make-report" element={<MakeReportPage />} />
            <Route path="lab-details" element={<LabDetailsPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </ThemeProvider>
    </Providers>
  )
}

export default App

