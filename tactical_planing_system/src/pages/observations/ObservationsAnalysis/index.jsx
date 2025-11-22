/**
 * ObservationsAnalysis - Analyze observations or convert them to tasks
 * 
 * Provides interface for analyzing observations (adding tags, LI, EP)
 * or converting them to tasks.
 */

import { useState, useEffect } from 'react';
import { useObservations } from '../../../features/observations/ObservationsContext';
import { usePlanning } from '../../../features/planing/PlanningContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IMPORTANCE } from '../../../config/constants';
import { ROUTES } from '../../../config/routes';
import './ObservationsAnalysis.scss';

export default function ObservationsAnalysis() {
  const { observations, analyzeObservation, convertToTask } = useObservations();
  const { addTask } = usePlanning();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const observationId = searchParams.get('id');
  const action = searchParams.get('action'); // 'convert' or null for analyze

  const observation = observations.find(obs => obs.id === parseFloat(observationId));

  const [analysisData, setAnalysisData] = useState({
    tags: '',
    lessonIdentified: '',
    ep: '',
  });

  const [taskFormData, setTaskFormData] = useState({
    title: '',
    rt: '',
    idl: new Date().toISOString().slice(0, 16),
    il: IMPORTANCE.MEDIUM,
  });

  useEffect(() => {
    if (observation) {
      setAnalysisData({
        tags: observation.tags?.join(', ') || '',
        lessonIdentified: observation.lessonIdentified || '',
        ep: observation.ep || '',
      });
      setTaskFormData({
        title: observation.content,
        rt: '',
        idl: new Date().toISOString().slice(0, 16),
        il: IMPORTANCE.MEDIUM,
      });
    }
  }, [observation]);

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!observation) return;

    const tags = analysisData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    analyzeObservation(observation.id, {
      tags,
      lessonIdentified: analysisData.lessonIdentified || null,
      ep: analysisData.ep ? parseFloat(analysisData.ep) : null,
    });

    alert('Observation analyzed successfully!');
    navigate(ROUTES.OBSERVATIONS.ALL);
  };

  const handleConvertToTask = (e) => {
    e.preventDefault();
    if (!observation) return;

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

    convertToTask(observation.id, newTask.id);
    alert('Observation converted to task successfully!');
    navigate(ROUTES.PLANNING.ALL_TASKS);
  };

  if (!observation) {
    return (
      <div className="page">
        <div className="page__header">
          <h1 className="page__title">Observation Not Found</h1>
        </div>
        <div className="card">
          <div className="empty-state">
            <p className="empty-state__title">Observation not found</p>
            <button
              onClick={() => navigate(ROUTES.OBSERVATIONS.ALL)}
              className="btn btn--primary mt-4"
            >
              Back to All Observations
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">
          {action === 'convert' ? 'Convert to Task' : 'Analyze Observation'}
        </h1>
        <p className="page__subtitle">
          {action === 'convert' 
            ? 'Transform this observation into a task' 
            : 'Add tags, lessons, and evaluation points'}
        </p>
      </div>

      <div className="card mb-6">
        <div className="mb-4 p-3 bg--primary-900 rounded-lg border border--primary-700">
          <p className="text--gray-100 font-medium mb-2">Observation:</p>
          <p className="text--gray-200">{observation.content}</p>
          <p className="text-xs text--gray-400 mt-2">Caught: {formatDate(observation.createdAt)}</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {action === 'convert' ? (
          <form onSubmit={handleConvertToTask}>
            <h2 className="card__title mb-4">Convert to Task</h2>
            <div className="space-y-4">
              <div className="form__group">
                <label htmlFor="title" className="form__label">Task Title *</label>
                <input
                  type="text"
                  id="title"
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  className="form__input"
                  required
                />
              </div>
              <div className="form__group">
                <label htmlFor="rt" className="form__label">Required Time (RT) in hours *</label>
                <input
                  type="number"
                  id="rt"
                  value={taskFormData.rt}
                  onChange={(e) => setTaskFormData({ ...taskFormData, rt: e.target.value })}
                  className="form__input"
                  min="0"
                  step="0.5"
                  required
                />
              </div>
              <div className="form__group">
                <label htmlFor="idl" className="form__label">Ideal Deadline (IDL) *</label>
                <input
                  type="datetime-local"
                  id="idl"
                  value={taskFormData.idl}
                  onChange={(e) => setTaskFormData({ ...taskFormData, idl: e.target.value })}
                  className="form__input"
                  required
                />
              </div>
              <div className="form__group">
                <label htmlFor="il" className="form__label">Importance Level (IL) *</label>
                <select
                  id="il"
                  value={taskFormData.il}
                  onChange={(e) => setTaskFormData({ ...taskFormData, il: parseInt(e.target.value) })}
                  className="form__select"
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
              <button type="submit" className="btn btn--success" style={{ flex: 1 }}>
                Convert to Task
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.OBSERVATIONS.WAITING_FOR_ANALYSIS)}
                className="btn btn--secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAnalyze}>
            <h2 className="card__title mb-4">Analyze Observation</h2>
            <div className="space-y-4">
              <div className="form__group">
                <label htmlFor="tags" className="form__label">Tags (comma-separated)</label>
                <input
                  type="text"
                  id="tags"
                  value={analysisData.tags}
                  onChange={(e) => setAnalysisData({ ...analysisData, tags: e.target.value })}
                  className="form__input"
                  placeholder="work, personal, idea"
                />
              </div>
              <div className="form__group">
                <label htmlFor="lessonIdentified" className="form__label">Lesson Identified (LI)</label>
                <textarea
                  id="lessonIdentified"
                  value={analysisData.lessonIdentified}
                  onChange={(e) =>
                    setAnalysisData({ ...analysisData, lessonIdentified: e.target.value })
                  }
                  className="form__textarea"
                  placeholder="What did you learn from this?"
                  rows="3"
                />
              </div>
              <div className="form__group">
                <label htmlFor="ep" className="form__label">Evaluation Point (EP) - Optional</label>
                <input
                  type="number"
                  id="ep"
                  value={analysisData.ep}
                  onChange={(e) => setAnalysisData({ ...analysisData, ep: e.target.value })}
                  className="form__input"
                  placeholder="0-100"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="submit" className="btn btn--primary" style={{ flex: 1 }}>
                Save Analysis
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.OBSERVATIONS.WAITING_FOR_ANALYSIS)}
                className="btn btn--secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

