import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { Play, CheckCircle, Circle, LogOut, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [stats, setStats] = useState({ completed_today: 0, streak: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksData, statsData] = await Promise.all([
        api.getTasks(),
        api.getStats()
      ]);
      setTasks(tasksData);
      setStats(statsData);
      setLoading(false);
    } catch (e) {
      console.error(e);
      if (e.message.toLowerCase().includes('authorized')) {
        logout();
      }
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      const created = await api.createTask(newTask);
      setTasks([created, ...tasks]);
      setNewTask('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTask = async (task) => {
    try {
      const updated = await api.updateTask(task.id, { is_completed: !task.is_completed });
      setTasks(tasks.map(t => t.id === task.id ? updated : t));
      fetchData(); // refresh stats
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await api.deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 py-12">
      <div className="glass-card p-6 md:p-8 mb-8 flex justify-between items-center bg-gradient-to-br from-slate-900/60 to-purple-900/20">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 mb-2">Hey, ready to run?</h1>
          <p className="text-slate-400">
            {stats.completed_today} {stats.completed_today === 1 ? 'task' : 'tasks'} completed today 
            <span className="text-purple-400 font-medium ml-2">({stats.streak} day streak 🔥)</span>
          </p>
        </div>
        <button onClick={logout} className="p-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition">
          <LogOut size={20} />
        </button>
      </div>

      <form onSubmit={handleCreateTask} className="flex gap-3 mb-10">
        <input 
          type="text" 
          placeholder="What do we need to start?" 
          className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-100 placeholder:text-slate-500 transition-all shadow-inner"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-5 rounded-xl transition-all shadow-lg hover:shadow-purple-500/20 flex items-center justify-center">
          <Plus size={24} />
        </button>
      </form>

      {loading ? (
        <div className="text-center text-slate-500 animate-pulse mt-12">Loading setup...</div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {tasks.map(task => (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={`glass-card p-4 flex items-center gap-4 transition-all ${task.is_completed ? 'bg-slate-900/40 border-slate-800/50 opacity-60' : 'hover:border-purple-500/30'}`}
              >
                <button 
                  onClick={() => handleToggleTask(task)} 
                  className={`flex-shrink-0 transition-colors ${task.is_completed ? 'text-green-400' : 'text-slate-600 hover:text-purple-400'}`}
                >
                  {task.is_completed ? <CheckCircle size={24} /> : <Circle size={24} />}
                </button>
                
                <span className={`flex-1 text-lg truncate ${task.is_completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                  {task.title}
                </span>

                {!task.is_completed && (
                  <button 
                    onClick={() => navigate(`/focus/${task.id}`, { state: { task } })}
                    className="flex items-center gap-2 bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                  >
                    <Play size={16} fill="currentColor" />
                    Start
                  </button>
                )}
                
                <button 
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-slate-600 hover:text-red-400 p-2 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
            
            {tasks.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-center text-slate-500 py-12"
              >
                No tasks to start... Maybe add one? Just one simple step.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
