/**
 * CurrentObservations - View observations currently in buffer
 * 
 * Displays observations that are in the 2-day buffer period, showing days remaining.
 */

import { useState, useMemo } from 'react';
import { useObservations } from '../../../features/observations/ObservationsContext';
import './CurrentObservations.scss';

export default function CurrentObservations() {
  const { observations, addObservation, getInBuffer, getDaysRemaining, deleteObservation } = useObservations();
  const [observationText, setObservationText] = useState('');

  const inBuffer = useMemo(() => getInBuffer(), [getInBuffer]);

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
        <h1 className="page__title">Current Observations</h1>
        <p className="page__subtitle">Observations in buffer - waiting for 2-day period</p>
      </div>

      {/* OB Catch Form */}
      <div className="card mb-6">
        <h2 className="card__title mb-4">OB Catch</h2>
        <form onSubmit={handleOBSubmit}>
          <div className="flex gap-3">
            <textarea
              value={observationText}
              onChange={(e) => setObservationText(e.target.value)}
              placeholder="Enter your observation, idea, or event..."
              className="form__textarea flex-1"
              rows="3"
            />
            <button type="submit" className="btn btn--primary self-start">
              Catch OB
            </button>
          </div>
        </form>
      </div>

      {/* In Buffer Section */}
      <div className="card">
        <h2 className="card__title mb-4">
          In Buffer ({inBuffer.length})
        </h2>
        {inBuffer.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state__title">No observations in buffer</p>
            <p className="empty-state__subtitle">
              Catch an observation above. It will be held for 2 days before you can analyze it.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {inBuffer.map((obs) => {
              const daysRemaining = getDaysRemaining(obs);
              return (
                <div key={obs.id} className="observation-card border border--primary-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text--gray-100 mb-2">{obs.content}</p>
                      <span className="text-xs text--gray-400">
                        Caught: {formatDate(obs.createdAt)}
                      </span>
                    </div>
                    <div className="text-right ml-4">
                      <span className="text-sm font-semibold text--primary-400 block mb-2">
                        {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                      </span>
                      <button
                        onClick={() => handleDelete(obs.id)}
                        className="text--red-400 hover--text-red-300 text-sm font-medium"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

