import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { worklogService } from '../services/worklogService';
import userService from '../services/userService';
import { toast } from 'react-hot-toast';

const WorkLogs = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [logs, setLogs] = useState([]);

  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const [filteredTasks, setFilteredTasks] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [working, setWorking] = useState(false);
  const [todayTimeSpent, setTodayTimeSpent] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsRes, tasksRes, usersRes, logsRes] = await Promise.all([
        projectService.getProjects(),
        taskService.getTasks(),
        userService.getUsers(),
        user.role === 'Employee'
          ? worklogService.getUserLogs()
          : worklogService.getAllWorkLogs()
      ]);

      setProjects(projectsRes.projects || projectsRes);
      setAllTasks(tasksRes);
      setAllUsers(usersRes);
      setLogs(logsRes);

      if (user.role === 'Employee') {
        const savedStart = localStorage.getItem(`startTime_${user.id}`);
        const savedProject = localStorage.getItem(`selectedProject_${user.id}`);
        const savedTask = localStorage.getItem(`selectedTask_${user.id}`);

        if (savedStart && savedProject && savedTask) {
          setStartTime(parseInt(savedStart));
          setSelectedProject(savedProject);
          setSelectedTask(savedTask);
          setWorking(true);
        }

        const today = new Date().toDateString();
        let todayTotal = 0, total = 0;

        logsRes.forEach(log => {
          if (log.userId !== user.id) return;
          const logDate = new Date(log.date).toDateString();
          const mins = (log.todayTimeSpent || []).reduce((a, b) => a + b, 0);
          if (logDate === today) todayTotal += mins;
          total += mins;
        });

        setTodayTimeSpent(todayTotal);
        setTotalTimeSpent(total);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load worklog data.');
    }
  };

  useEffect(() => {
    if (selectedProject) {
      setFilteredTasks(allTasks.filter(t => t.projectId === selectedProject));
    } else {
      setFilteredTasks([]);
    }
  }, [selectedProject, allTasks]);

  const handleStart = () => {
    if (!selectedProject || !selectedTask) {
      toast.error('Please select project and task!');
      return;
    }

    const now = Date.now();
    setStartTime(now);
    setWorking(true);

    localStorage.setItem(`startTime_${user.id}`, now.toString());
    localStorage.setItem(`selectedProject_${user.id}`, selectedProject);
    localStorage.setItem(`selectedTask_${user.id}`, selectedTask);
  };

  const handleStop = async () => {
    const endTime = Date.now();
    const minutes = Math.round((endTime - startTime) / 60000);
    const today = new Date().toDateString();

    try {
      const userLogs = await worklogService.getUserLogs();
      const existing = userLogs.find(log =>
        log.userId === user.id &&
        log.projectId === selectedProject &&
        log.taskId === selectedTask &&
        new Date(log.date).toDateString() === today
      );

      if (existing) {
        await worklogService.updateWorkLog(existing._id, {
          endDate: new Date(),
          todayTimeSpent: minutes
        });
      } else {
        await worklogService.logWork({
          userId: user.id,
          projectId: selectedProject,
          taskId: selectedTask,
          startDate: new Date(startTime),
          endDate: new Date(),
          todayTimeSpent: [minutes],
          date: new Date()
        });
      }

      toast.success(`Logged ${minutes} minutes.`);
      setStartTime(null);
      setWorking(false);

      localStorage.removeItem(`startTime_${user.id}`);
      localStorage.removeItem(`selectedProject_${user.id}`);
      localStorage.removeItem(`selectedTask_${user.id}`);
      loadData();
    } catch (error) {
      toast.error('Failed to stop and log time.');
    }
  };

  const formatTime = (mins) => {
    const hr = Math.floor(mins / 60);
    const min = mins % 60;
    return `${hr ? `${hr}h ` : ''}${min}m`;
  };

  const filteredLogs = logs.filter(log => {
    if (user.role === 'Employee' && log.userId !== user.id) return false;
    if (user.role === 'Team Lead' && !projects.some(p => p._id === log.projectId)) return false;
    if (selectedProject && log.projectId !== selectedProject) return false;
    if (selectedTask && log.taskId !== selectedTask) return false;
    if (selectedUser && log.userId !== selectedUser) return false;
    if (dateRange.from && new Date(log.date) < new Date(dateRange.from)) return false;
    if (dateRange.to && new Date(log.date) > new Date(dateRange.to)) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">📋 Work Logs</h2>

      {/* 🔍 Filters (Team Lead / Coordinator / Admin) */}
      {user.role !== 'Employee' && (
        <form
          onSubmit={e => {
            e.preventDefault();
            loadData();
          }}
          className="grid grid-cols-1 md:grid-cols-6 gap-4"
        >
          <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="input">
            <option value="">All Projects</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>

          <select value={selectedTask} onChange={e => setSelectedTask(e.target.value)} className="input">
            <option value="">All Tasks</option>
            {filteredTasks.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
          </select>

          <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className="input">
            <option value="">All Employees</option>
            {allUsers.map(u => <option key={u._id} value={u._id}>{u.name || u.email}</option>)}
          </select>

          {(user.role === 'Admin' || user.role === 'Coordinator') && (
            <>
              <input type="date" className="input" onChange={e => setDateRange({ ...dateRange, from: e.target.value })} />
              <input type="date" className="input" onChange={e => setDateRange({ ...dateRange, to: e.target.value })} />
            </>
          )}

          <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">
            🔍 Filter Logs
          </button>
        </form>
      )}

      {/* 🕒 Employee - Time Track View */}
       {user.role === 'Employee' && (
        <>
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-lg border rounded-lg p-6 text-center">
          <h2 className="text-lg font-medium text-gray-600">Today’s Time Spent</h2>
          <p className="text-3xl text-indigo-600 font-bold mt-2">{formatTime(todayTimeSpent)}</p>
        </div>
        <div className="bg-white shadow-lg border rounded-lg p-6 text-center">
          <h2 className="text-lg font-medium text-gray-600">Total Time Spent</h2>
          <p className="text-3xl text-green-600 font-bold mt-2">{formatTime(totalTimeSpent)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
  <select
    value={selectedProject}
    onChange={(e) => {
      setSelectedProject(e.target.value)
      setSelectedTask('')
      localStorage.setItem(`selectedProject_${user.id}`, e.target.value)
    }}
    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md p-2 w-full"
  >
    <option value="">Select Project</option>
    {projects.map(p => (
      <option key={p._id} value={p._id}>
        {p.name || p.title || 'Untitled'}
      </option>
    ))}
  </select>

  <select
    value={selectedTask}
    onChange={(e) => {
      setSelectedTask(e.target.value)
      localStorage.setItem(`selectedTask_${user.id}`, e.target.value)
    }}
    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md p-2 w-full"
    disabled={!selectedProject}
  >
    <option value="">Select Task</option>
    {filteredTasks.map(t => (
      <option key={t._id} value={t._id}>
        {t.title}
      </option>
    ))}
  </select>
</div>


      {/* Buttons */}
      <div className="flex gap-4">
        {!working ? (
          <button
            onClick={handleStart}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            ▶️ Start Work Now
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            ✅ Complete Work
          </button>
        )}
      </div>



        </>
      )} 

      {/* 📊 WorkLog Table */}
      <div className="overflow-x-auto mt-6">
        <table className="table-auto w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th>Employee</th>
              <th>Project</th>
              <th>Task</th>
              <th>Date</th>
              <th>Time Spent</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log._id}>
                <td>{allUsers.find(u => u._id === log.userId)?.name || 'Unknown'}</td>
                <td>{projects.find(p => p._id === log.projectId)?.name || 'Unknown'}</td>
                <td>{allTasks.find(t => t._id === log.taskId)?.title || 'Unknown'}</td>
                <td>{new Date(log.date).toLocaleDateString()}</td>
                <td>{formatTime((log.todayTimeSpent || []).reduce((a, b) => a + b, 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkLogs;