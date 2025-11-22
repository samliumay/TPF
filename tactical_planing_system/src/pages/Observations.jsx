/**
 * Observations - Observation catch and analysis page with 2-day buffer system
 * 
 * Implements the impulse control mechanism for ADHD optimization.
 * 
 * Workflow:
 * 1. OB Catch: User logs an observation (idea, event)
 * 2. Buffer Period: System holds observation for 2 days
 * 3. Analysis: After 2 days, user reviews:
 *    - Valuable? -> Add Tags, LI (Lesson Identified), EP (Evaluation Point), or convert to Task
 *    - Not Valuable? -> Delete (DEL)
 * 
 * Status Sections:
 * - In Buffer: Observations waiting for 2-day period (shows days remaining)
 * - Ready for Analysis: Observations that completed buffer (can be analyzed)
 * - Analyzed: Observations that have been reviewed and processed
 * 
 * Actions Available:
 * - Analyze: Add Tags, LI, EP to observation
 * - Convert to Task: Transform observation into a task with RT, IDL, IL
 * - Delete: Remove observation if not valuable
 */

import { useState, useMemo } from 'react';
import { useObservations } from '../features/observations/ObservationsContext';
import { usePlanning } from '../features/planing/PlanningContext';
import { IMPORTANCE } from '../config/constants';

export default function Observations() {
  const {
    observations,
    addObservation,
    getInBuffer,
    getReadyForAnalysis,
    getDaysRemaining,
    analyzeObservation,
    convertToTask,
    deleteObservation,
  } = useObservations();

  const { addTask } = usePlanning();

  const [observationText, setObservationText] = useState('');
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  // Analysis form state
  const [analysisData, setAnalysisData] = useState({
    tags: '',
    lessonIdentified: '',
    ep: '',
  });

  // Convert to task form state
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    rt: '',
    idl: '',
    il: IMPORTANCE.MEDIUM,
  });

  const inBuffer = useMemo(() => getInBuffer(), [getInBuffer]);
  const readyForAnalysis = useMemo(() => getReadyForAnalysis(), [getReadyForAnalysis]);

  const handleOBSubmit = (e) => {
    e.preventDefault();
    if (!observationText.trim()) {
      alert('Please enter an observation');
      return;
    }

    addObservation({ content: observationText });
    setObservationText('');
    alert('Observation caught! It will be held in buffer for 2 days before analysis.');
  };

  const handleOpenAnalysis = (observation) => {
    setSelectedObservation(observation);
    setAnalysisData({
      tags: observation.tags?.join(', ') || '',
      lessonIdentified: observation.lessonIdentified || '',
      ep: observation.ep || '',
    });
    setIsAnalysisModalOpen(true);
  };

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!selectedObservation) return;

    const tags = analysisData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    analyzeObservation(selectedObservation.id, {
      tags,
      lessonIdentified: analysisData.lessonIdentified || null,
      ep: analysisData.ep ? parseFloat(analysisData.ep) : null,
    });

    setIsAnalysisModalOpen(false);
    setSelectedObservation(null);
    setAnalysisData({ tags: '', lessonIdentified: '', ep: '' });
  };

  const handleOpenConvert = (observation) => {
    setSelectedObservation(observation);
    setTaskFormData({
      title: observation.content,
      rt: '',
      idl: new Date().toISOString().slice(0, 16),
      il: IMPORTANCE.MEDIUM,
    });
    setIsConvertModalOpen(true);
  };

  const handleConvertToTask = (e) => {
    e.preventDefault();
    if (!selectedObservation) return;

    if (!taskFormData.title.trim() || !taskFormData.rt || !taskFormData.idl) {
      alert('Please fill in all required task fields');
      return;
    }

    const newTask = addTask({
      title: taskFormData.title.trim(),
      rt: parseFloat(taskFormData.rt),
      idl: new Date(taskFormData.idl),
      il: parseInt(taskFormData.il),
    });

    convertToTask(selectedObservation.id, newTask.id);
    setIsConvertModalOpen(false);
    setSelectedObservation(null);
    setTaskFormData({ title: '', rt: '', idl: '', il: IMPORTANCE.MEDIUM });
    alert('Observation converted to task successfully!');
  };

  const handleDelete = (observationId) => {
    if (window.confirm('Are you sure you want to delete this observation?')) {
      deleteObservation(observationId);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Observations</h1>
        <p className="text-gray-600">
          Catch ideas and events. They'll be held for 2 days before analysis to control impulse.
        </p>
      </div>

      {/* OB Catch Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">OB Catch</h2>
        <form onSubmit={handleOBSubmit}>
          <div className="flex gap-3">
            <textarea
              value={observationText}
              onChange={(e) => setObservationText(e.target.value)}
              placeholder="Enter your observation, idea, or event..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[100px]"
              rows="3"
            />
            <button
              type="submit"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium self-start"
            >
              Catch OB
            </button>
          </div>
        </form>
      </div>

      {/* Ready for Analysis Section */}
      {readyForAnalysis.length > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⏰</span>
            <h2 className="text-xl font-semibold text-yellow-800">
              Ready for Analysis ({readyForAnalysis.length})
            </h2>
          </div>
          <p className="text-sm text-yellow-700 mb-4">
            These observations have completed their 2-day buffer period. Review and decide their fate.
          </p>
          <div className="space-y-3">
            {readyForAnalysis.map((obs) => (
              <div
                key={obs.id}
                className="bg-white border border-yellow-300 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-gray-900 flex-1">{obs.content}</p>
                  <span className="text-xs text-gray-500 ml-4">
                    Caught: {formatDate(obs.createdAt)}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleOpenAnalysis(obs)}
                    className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700 transition-colors"
                  >
                    📊 Analyze
                  </button>
                  <button
                    onClick={() => handleOpenConvert(obs)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    ✅ Convert to Task
                  </button>
                  <button
                    onClick={() => handleDelete(obs.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* In Buffer Section */}
      {inBuffer.length > 0 && (
        <div className="bg-primary-50 border-2 border-primary-200 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⏳</span>
            <h2 className="text-xl font-semibold text-primary-800">
              In Buffer ({inBuffer.length})
            </h2>
          </div>
          <p className="text-sm text-primary-700 mb-4">
            These observations are waiting for their 2-day buffer period to complete.
          </p>
          <div className="space-y-3">
            {inBuffer.map((obs) => {
              const daysRemaining = getDaysRemaining(obs);
              return (
                <div
                  key={obs.id}
                  className="bg-white border border-primary-300 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-gray-900 flex-1">{obs.content}</p>
                    <div className="text-right ml-4">
                      <span className="text-xs text-gray-500 block">
                        Caught: {formatDate(obs.createdAt)}
                      </span>
                      <span className="text-sm font-semibold text-primary-600">
                        {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analyzed Observations */}
      {observations.filter((obs) => obs.status === 'analyzed').length > 0 && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">✓</span>
            <h2 className="text-xl font-semibold text-green-800">
              Analyzed ({observations.filter((obs) => obs.status === 'analyzed').length})
            </h2>
          </div>
          <div className="space-y-3">
            {observations
              .filter((obs) => obs.status === 'analyzed')
              .map((obs) => (
                <div
                  key={obs.id}
                  className="bg-white border border-green-300 rounded-lg p-4"
                >
                  <p className="text-gray-900 mb-2">{obs.content}</p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {obs.tags && obs.tags.length > 0 && (
                      <div className="flex gap-1">
                        <span className="text-gray-600">Tags:</span>
                        {obs.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-primary-100 text-primary-800 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {obs.lessonIdentified && (
                      <span className="text-gray-600">
                        📚 LI: {obs.lessonIdentified}
                      </span>
                    )}
                    {obs.ep !== null && (
                      <span className="text-gray-600">⭐ EP: {obs.ep}</span>
                    )}
                    {obs.convertedToTask && (
                      <span className="text-green-600 font-semibold">✅ Converted to Task</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {observations.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg mb-2">No observations yet</p>
          <p className="text-gray-400 text-sm">
            Start by catching an observation above. It will be held for 2 days before you can analyze it.
          </p>
        </div>
      )}

      {/* Analysis Modal */}
      {isAnalysisModalOpen && selectedObservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analyze Observation</h2>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{selectedObservation.content}</p>
            </div>
            <form onSubmit={handleAnalyze}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={analysisData.tags}
                    onChange={(e) =>
                      setAnalysisData({ ...analysisData, tags: e.target.value })
                    }
                    placeholder="work, personal, idea"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lesson Identified (LI)
                  </label>
                  <textarea
                    value={analysisData.lessonIdentified}
                    onChange={(e) =>
                      setAnalysisData({ ...analysisData, lessonIdentified: e.target.value })
                    }
                    placeholder="What did you learn from this?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Evaluation Point (EP) - Optional
                  </label>
                  <input
                    type="number"
                    value={analysisData.ep}
                    onChange={(e) =>
                      setAnalysisData({ ...analysisData, ep: e.target.value })
                    }
                    placeholder="0-100"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Save Analysis
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAnalysisModalOpen(false);
                    setSelectedObservation(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert to Task Modal */}
      {isConvertModalOpen && selectedObservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Convert to Task</h2>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{selectedObservation.content}</p>
            </div>
            <form onSubmit={handleConvertToTask}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={taskFormData.title}
                    onChange={(e) =>
                      setTaskFormData({ ...taskFormData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Required Time (RT) in hours *
                  </label>
                    <input
                      type="number"
                      value={taskFormData.rt}
                      onChange={(e) =>
                        setTaskFormData({ ...taskFormData, rt: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      min="0"
                      step="0.5"
                      required
                    />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ideal Deadline (IDL) *
                  </label>
                  <input
                    type="datetime-local"
                    value={taskFormData.idl}
                    onChange={(e) =>
                      setTaskFormData({ ...taskFormData, idl: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Importance Level (IL) *
                  </label>
                  <select
                    value={taskFormData.il}
                    onChange={(e) =>
                      setTaskFormData({ ...taskFormData, il: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value={IMPORTANCE.MUST}>Level 1 - Must</option>
                    <option value={IMPORTANCE.HIGH}>Level 2 - High</option>
                    <option value={IMPORTANCE.MEDIUM}>Level 3 - Medium</option>
                    <option value={IMPORTANCE.OPTIONAL}>Level 4 - Optional</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Convert to Task
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsConvertModalOpen(false);
                    setSelectedObservation(null);
                  }}
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
