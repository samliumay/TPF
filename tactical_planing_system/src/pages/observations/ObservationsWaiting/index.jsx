/**
 * ObservationsWaiting - View observations waiting for analysis
 * 
 * Displays observations that have completed their 2-day buffer period
 * and are ready to be analyzed or converted to tasks.
 */

import { useState, useMemo } from 'react';
import { useObservations } from '../../../features/observations/ObservationsContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../config/routes';
import './ObservationsWaiting.scss';

export default function ObservationsWaiting() {
  const { observations, getReadyForAnalysis, deleteObservation } = useObservations();
  const navigate = useNavigate();

  const readyForAnalysis = useMemo(() => getReadyForAnalysis(), [getReadyForAnalysis]);

  const handleDelete = (observationId) => {
    if (window.confirm('Are you sure you want to delete this observation?')) {
      deleteObservation(observationId);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Observations Waiting for Analysis</h1>
        <p className="page__subtitle">
          These observations have completed their 2-day buffer period. Review and decide their fate.
        </p>
      </div>

      <div className="card">
        <h2 className="card__title mb-4">
          Ready for Analysis ({readyForAnalysis.length})
        </h2>
        {readyForAnalysis.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state__title">No observations waiting for analysis</p>
            <p className="empty-state__subtitle">
              Observations that complete their 2-day buffer will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {readyForAnalysis.map((obs) => (
              <div key={obs.id} className="observation-card border border--gray-300 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="text--gray-900 mb-2 font-medium">{obs.content}</p>
                    <span className="text-xs text--gray-500">
                      Caught: {formatDate(obs.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`${ROUTES.OBSERVATIONS.ANALYSIS}?id=${obs.id}`)}
                    className="btn btn--primary"
                  >
                    📊 Analyze
                  </button>
                  <button
                    onClick={() => handleDelete(obs.id)}
                    className="btn btn--danger"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

