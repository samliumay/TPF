import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePlanning } from '../features/planing/PlanningContext';
import { ROUTES } from '../config/routes';
import { RP_LIMITS, IMPORTANCE } from '../config/constants';

export default function Dashboard() {
  const { tasks, availableTime, setAvailableTime, getTodayTasks, catastrophicWipeOut } = usePlanning();
  
  // Get today's tasks
  const todayTasks = useMemo(() => getTodayTasks(), [getTodayTasks]);

  // Calculate Realism Point
  const realismPoint = useMemo(() => {
    const totalRT = todayTasks.reduce((sum, task) => sum + task.rt, 0);
    return availableTime > 0 ? totalRT / availableTime : 0;
  }, [todayTasks, availableTime]);

  // Get RP status
  const getRPStatus = () => {
    if (realismPoint < RP_LIMITS.SAFE) {
      return { 
        label: 'Safe Zone', 
        emoji: '🟢',
        textColor: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        statusTextColor: 'text-green-800',
        messageColor: 'text-green-700'
      };
    } else if (realismPoint < RP_LIMITS.RISKY) {
      return { 
        label: 'Risky Zone', 
        emoji: '🟡',
        textColor: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        statusTextColor: 'text-yellow-800',
        messageColor: 'text-yellow-700'
      };
    } else {
      return { 
        label: 'Overload', 
        emoji: '🔴',
        textColor: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        statusTextColor: 'text-red-800',
        messageColor: 'text-red-700'
      };
    }
  };

  // Sort tasks: IL ASC, then IDL ASC
  const sortedTasks = useMemo(() => {
    return [...todayTasks].sort((a, b) => {
      if (a.il !== b.il) return a.il - b.il;
      return new Date(a.idl) - new Date(b.idl);
    });
  }, [todayTasks]);

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
      [IMPORTANCE.MUST]: 'bg-red-100 text-red-800',
      [IMPORTANCE.HIGH]: 'bg-orange-100 text-orange-800',
      [IMPORTANCE.MEDIUM]: 'bg-yellow-100 text-yellow-800',
      [IMPORTANCE.OPTIONAL]: 'bg-gray-100 text-gray-800',
    };
    return colors[il] || 'bg-gray-100 text-gray-800';
  };

  const rpStatus = getRPStatus();
  const totalRT = todayTasks.reduce((sum, task) => sum + task.rt, 0);

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Planning Dashboard</h1>
        <p className="text-gray-600">Monitor your daily plan feasibility with Realism Point (RP)</p>
      </div>

      {/* Realism Point Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Realism Point (RP)</h2>
          <span className="text-3xl">{rpStatus.emoji}</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Required Time</p>
            <p className="text-2xl font-bold text-gray-900">{totalRT.toFixed(1)}h</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Available Time</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={availableTime}
                onChange={(e) => setAvailableTime(parseFloat(e.target.value) || 0)}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-lg font-bold"
                min="0"
                step="0.5"
              />
              <span className="text-gray-600">hours</span>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Realism Point</p>
            <p className={`text-2xl font-bold ${rpStatus.textColor}`}>
              {realismPoint.toFixed(2)}
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${rpStatus.bgColor} border-2 ${rpStatus.borderColor}`}>
          <p className={`font-semibold ${rpStatus.statusTextColor}`}>
            Status: {rpStatus.label}
          </p>
          {realismPoint >= RP_LIMITS.OVERLOAD && (
            <p className={`text-sm ${rpStatus.messageColor} mt-2`}>
              ⚠️ Immediate action required: Consider CWA (Catastrophic Wipe Out) or postpone tasks.
            </p>
          )}
          {realismPoint >= RP_LIMITS.SAFE && realismPoint < RP_LIMITS.RISKY && (
            <p className={`text-sm ${rpStatus.messageColor} mt-2`}>
              ⚠️ Tight schedule. Requires focus and minimal distractions.
            </p>
          )}
          {realismPoint < RP_LIMITS.SAFE && (
            <p className={`text-sm ${rpStatus.messageColor} mt-2`}>
              ✓ Plan is realistic with good buffer time.
            </p>
          )}
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Today's Tasks</h2>
          <Link
            to={ROUTES.DAILY_PLAN}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Manage Tasks →
          </Link>
        </div>

        {sortedTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tasks scheduled for today.</p>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map((task) => (
              <div
                key={task.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{task.title}</h3>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>⏱️ RT: {task.rt}h</span>
                      <span>📅 Deadline: {new Date(task.idl).toLocaleDateString()} {new Date(task.idl).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getImportanceColor(
                      task.il
                    )}`}
                  >
                    {getImportanceLabel(task.il)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to={ROUTES.OBSERVATION_INPUT}
          className="bg-blue-600 text-white rounded-lg p-4 hover:bg-blue-700 transition-colors text-center font-medium"
        >
          ➕ Add Observation
        </Link>
        <button
          className="bg-red-600 text-white rounded-lg p-4 hover:bg-red-700 transition-colors font-medium"
          onClick={() => {
            const nonCriticalTasks = tasks.filter((task) => task.il !== IMPORTANCE.MUST);
            if (nonCriticalTasks.length === 0) {
              alert('No non-critical tasks to wipe. All tasks are marked as MUST (Level 1).');
              return;
            }
            
            if (
              window.confirm(
                `Are you sure you want to trigger CWA?\n\nThis will permanently delete ${nonCriticalTasks.length} non-critical task(s) and keep only MUST (Level 1) tasks.\n\nThis action cannot be undone!`
              )
            ) {
              catastrophicWipeOut();
              alert(`CWA executed. ${nonCriticalTasks.length} non-critical task(s) removed. Only critical tasks remain.`);
            }
          }}
        >
          🚨 CWA (Catastrophic Wipe Out)
        </button>
      </div>
    </div>
  );
}

