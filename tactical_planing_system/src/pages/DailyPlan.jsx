import { useState, useMemo } from 'react';
import { usePlanning } from '../features/planing/PlanningContext';
import { IMPORTANCE } from '../config/constants';

export default function DailyPlan() {
  const { tasks, addTask, updateTask, deleteTask } = usePlanning();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    rt: '',
    idl: '',
    il: IMPORTANCE.MEDIUM,
  });

  // Get tasks for selected date
  const filteredTasks = useMemo(() => {
    const targetDate = new Date(selectedDate);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    return tasks
      .filter((task) => {
        const taskDate = new Date(task.idl);
        return taskDate >= targetDate && taskDate < nextDay;
      })
      .sort((a, b) => {
        // Sort by IL ASC, then IDL ASC
        if (a.il !== b.il) return a.il - b.il;
        return new Date(a.idl) - new Date(b.idl);
      });
  }, [tasks, selectedDate]);

  const getImportanceLabel = (il) => {
    const labels = {
      [IMPORTANCE.MUST]: 'Must',
      [IMPORTANCE.HIGH]: 'High',
      [IMPORTANCE.MEDIUM]: 'Medium',
      [IMPORTANCE.OPTIONAL]: 'Optional',
    };
    return labels[il] || 'Unknown';
  };

  const getImportanceColor = (il) => {
    const colors = {
      [IMPORTANCE.MUST]: 'bg-red-100 text-red-800 border-red-300',
      [IMPORTANCE.HIGH]: 'bg-orange-100 text-orange-800 border-orange-300',
      [IMPORTANCE.MEDIUM]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      [IMPORTANCE.OPTIONAL]: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[il] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const handleOpenForm = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        rt: task.rt.toString(),
        idl: new Date(task.idl).toISOString().slice(0, 16), // Format for datetime-local
        il: task.il,
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        rt: '',
        idl: new Date(selectedDate).toISOString().slice(0, 16),
        il: IMPORTANCE.MEDIUM,
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
    setFormData({
      title: '',
      rt: '',
      idl: '',
      il: IMPORTANCE.MEDIUM,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.rt || !formData.idl) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingTask) {
      updateTask(editingTask.id, {
        title: formData.title.trim(),
        rt: parseFloat(formData.rt),
        idl: new Date(formData.idl),
        il: parseInt(formData.il),
      });
    } else {
      addTask({
        title: formData.title.trim(),
        rt: parseFloat(formData.rt),
        idl: new Date(formData.idl),
        il: parseInt(formData.il),
      });
    }

    handleCloseForm();
  };

  const handleDelete = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };

  const totalRT = filteredTasks.reduce((sum, task) => sum + task.rt, 0);

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Plan</h1>
          <p className="text-gray-600">Manage your tasks with RT, IDL, and IL</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          ➕ Add Task
        </button>
      </div>

      {/* Date Selector */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <label htmlFor="date-selector" className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <input
          type="date"
          id="date-selector"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900">{filteredTasks.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Required Time (RT)</p>
            <p className="text-2xl font-bold text-gray-900">{totalRT.toFixed(1)}h</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Average RT per Task</p>
            <p className="text-2xl font-bold text-gray-900">
              {filteredTasks.length > 0 ? (totalRT / filteredTasks.length).toFixed(1) : 0}h
            </p>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">No tasks for this date</p>
            <button
              onClick={() => handleOpenForm()}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Create your first task →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">{task.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        ⏱️ <strong>RT:</strong> {task.rt}h
                      </span>
                      <span className="flex items-center gap-1">
                        📅 <strong>Deadline:</strong>{' '}
                        {new Date(task.idl).toLocaleDateString()}{' '}
                        {new Date(task.idl).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getImportanceColor(
                        task.il
                      )}`}
                    >
                      {getImportanceLabel(task.il)}
                    </span>
                    <button
                      onClick={() => handleOpenForm(task)}
                      className="text-blue-600 hover:text-blue-800 px-2 py-1 text-sm font-medium"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-red-600 hover:text-red-800 px-2 py-1 text-sm font-medium"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="rt" className="block text-sm font-medium text-gray-700 mb-1">
                    Required Time (RT) in hours *
                  </label>
                  <input
                    type="number"
                    id="rt"
                    value={formData.rt}
                    onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.5"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="idl" className="block text-sm font-medium text-gray-700 mb-1">
                    Ideal Deadline (IDL) *
                  </label>
                  <input
                    type="datetime-local"
                    id="idl"
                    value={formData.idl}
                    onChange={(e) => setFormData({ ...formData, idl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="il" className="block text-sm font-medium text-gray-700 mb-1">
                    Importance Level (IL) *
                  </label>
                  <select
                    id="il"
                    value={formData.il}
                    onChange={(e) => setFormData({ ...formData, il: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value={IMPORTANCE.MUST}>Level 1 - Must (Emergencies, Finals)</option>
                    <option value={IMPORTANCE.HIGH}>Level 2 - High (Long-term goals, Projects)</option>
                    <option value={IMPORTANCE.MEDIUM}>Level 3 - Medium (Side missions, Hobbies)</option>
                    <option value={IMPORTANCE.OPTIONAL}>Level 4 - Optional (Mood-dependent)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {editingTask ? 'Update Task' : 'Add Task'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
