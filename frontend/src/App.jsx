import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/UsersPage'
import Projects from './pages/Projects'
import Tasks from './pages/Tasks'
import WorkLogs from './pages/WorkLogs'
import Reports from './pages/Reports'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import Settings from './pages/Settings'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import MyTasks from './pages/MyTasks';

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* 🔔 react-hot-toast */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
            },
          }}
        />

        {/* ✅ react-toastify */}
        <ToastContainer position="top-right" autoClose={3000} />

        <Routes>
          <Route 
            path="/login" 
            element={!user ? <Login /> : <Navigate to="/dashboard" />} 
          />

          <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="/my-tasks" element={<MyTasks />} />
            <Route path="worklogs" element={<WorkLogs />} />
            <Route path="Users" element={<Users />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App