import React, { useEffect, useState ,useRef} from 'react';
import axios from 'axios';
import {
  Users, FolderOpen, CheckSquare, Clock, Activity,
  AlertCircle, Calendar, TimerReset, ListTodo
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Chart from 'chart.js/auto';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth(); // ✅ use auth loading state
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [issues, setIssues] = useState([]);

  const coordinatorTaskChartRef = useRef(null);
const logReviewChartRef = useRef(null);

const backendUrl = import.meta.env.VITE_BACKEND_URL;


  const role = user?.role?.toLowerCase();

  useEffect(() => {
    if (!user || authLoading) return; // ✅ wait for user to load

    const fetchDashboardData = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/dashboard/stats`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        setStats(res.data);
        setLoading(false);

        // Draw charts
        if (role === 'admin') {
          drawPieChart(res.data.roleDistribution);
          drawBarChart(res.data.projectStatus, 'projectBar');
        } else if (role === 'team lead') {
          drawBarChart(res.data.taskProgress, 'teamProgress');
        } else if (role === 'employee') {
          drawBarChart(res.data.weeklyHours, 'employeeChart');
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, authLoading, role]);

useEffect(() => {
  // 1. Destroy old chart if exists
  if (coordinatorTaskChartRef.current) {
    coordinatorTaskChartRef.current.destroy();
  }

  if (logReviewChartRef.current) {
    logReviewChartRef.current.destroy();
  }

  const ctx1 = document.getElementById('coordinatorTaskChart');
  const ctx2 = document.getElementById('logReviewChart');

  // 2. Create new charts and store instance in ref
  if (ctx1) {
    coordinatorTaskChartRef.current = new Chart(ctx1, {
      type: 'doughnut',
      data: {
        labels: ['In Progress', 'Pending', 'Completed'],
        datasets: [{
          data: [stats.tasksInProgress, stats.tasksPending, stats.tasksCompleted],
          backgroundColor: ['#6366F1', '#FBBF24', '#10B981'],
        }],
      },
    });
  }

  if (ctx2) {
    logReviewChartRef.current = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: stats.reviewedDates || [],
        datasets: [{
          label: 'Logs Reviewed',
          data: stats.logsReviewedPerDay || [],
          backgroundColor: '#3B82F6',
        }],
      },
    });
  }
}, [stats]);



  const drawPieChart = (data) => {
    const canvas = document.getElementById('adminPie');
    if (!canvas) return;
    new Chart(canvas, {
      type: 'pie',
      data: {
        labels: Object.keys(data),
        datasets: [{
          label: 'Users',
          data: Object.values(data),
          backgroundColor: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'],
        }]
      },
    });
  };

  const drawBarChart = (data, canvasId) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: Object.keys(data),
        datasets: [{
          label: 'Count',
          data: Object.values(data),
          backgroundColor: '#6366F1',
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
      }
    });
  };

  const cardData = {
    admin: [
  { title: 'Total Projects', value: stats.totalProjects, icon: FolderOpen, color: 'bg-indigo-500' },
  { title: 'Active Projects', value: stats.activeProjects, icon: FolderOpen, color: 'bg-green-500' },
  { title: 'Pending Projects', value: stats.totalProjects-stats.completedProjects, icon: Clock, color: 'bg-yellow-500' },
  { title: 'Completed Projects', value: stats.completedProjects, icon: CheckSquare, color: 'bg-purple-500' },
  { title: 'in-progress Project', value: stats.inProgressProjects, icon: Activity, color: 'bg-pink-500' },
  { title: 'hold projects', value: stats.holdProjects, icon: Users, color: 'bg-blue-500' }
],
    'team lead': [
      { title: 'Tasks Assigned', value: stats.tasksAssigned, icon: ListTodo, color: 'bg-blue-400' },
      { title: 'Tasks Completed', value: stats.tasksCompleted, icon: CheckSquare, color: 'bg-green-500' },
      { title: 'Tasks Pending', value: stats.tasksPending, icon: AlertCircle, color: 'bg-yellow-500' },

    ],
    coordinator: [
      { title: 'Upcoming Deadlines', value: stats.deadlinesThisWeek, icon: Clock, color: 'bg-yellow-400' },
      { title: 'Issues Reported', value: stats.issuesReported, icon: AlertCircle, color: 'bg-red-400' },
      { title: 'Team Logs Reviewed', value: stats.logsReviewed, icon: TimerReset, color: 'bg-blue-500' },
    ],
    employee: [
  { title: 'No. of Projects (Assigned)', value: stats.userTotalProjects, icon: Activity, color: 'bg-indigo-500' },
  { title: 'Completed Projects', value: stats.userCompletedProjects, icon: Activity, color: 'bg-green-500' },
  { title: 'In Progress Projects', value: stats.userInProgressProjects, icon: Activity, color: 'bg-yellow-500' },
]
  };

  const getChartSection = () => {
    switch (role) {
      case 'admin':
        return (
          <>
            <div className="card p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">User Role Distribution</h3>
              <div className="h-54"><canvas id="adminPie" /></div>
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Project Status Overview</h3>
              <div className="h-64"><canvas id="projectBar" /></div>
            </div>
          </>
        );
      case 'team lead':
        return (
          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Team Task Progress</h3>
            <div className="h-64"><canvas id="teamProgress" /></div>
          </div>
        );

        case 'coordinator':
  return (
    <>
      {/* Task Distribution Pie */}
      <div className="card p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Task Distribution</h3>
        <div className="h-54">
          <canvas id="coordinatorTaskChart" />
        </div>
      </div>

      {/* Logs Reviewed Bar Chart */}
      <div className="card p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Reviewed Team Logs</h3>
        <div className="h-64">
          <canvas id="logReviewChart" />
        </div>
      </div>

      {/* Issues Overview */}
      <div className="card p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Recent Reported Issues</h3>
        <ul className="divide-y divide-gray-200">
          {(issues || []).slice(0, 4).map((issue, index) => (
            <li key={index} className="py-3 flex justify-between text-sm text-gray-700">
              <span>{issue.title}</span>
              <span className="text-red-500 font-medium">{issue.status}</span>
            </li>
          ))}
          {(!issues || issues.length === 0) && (
            <li className="text-gray-400 italic">No issues reported recently.</li>
          )}
        </ul>
      </div>
    </>
  );
      case 'employee':
        return (
          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Weekly Hours Log</h3>
            <div className="h-64"><canvas id="employeeChart" /></div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading || authLoading) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner size="xl" /></div>;
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Here's your overview as <strong>{role}</strong>.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cardData[role]?.map((card, i) => (
          <div key={i} className="card p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{card.value}</p>
            </div>
            <div className={`w-12 h-12 ${card.color} rounded-full flex items-center justify-center`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {getChartSection()}
      </div>
    </div>
  );
};

export default Dashboard;