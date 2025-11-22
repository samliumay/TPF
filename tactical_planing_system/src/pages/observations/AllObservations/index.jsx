/**
 * AllObservations - View all observations regardless of status
 * 
 * Displays all observations with filtering options by status.
 */

import { useState, useMemo } from 'react';
import { useObservations } from '../../../features/observations/ObservationsContext';
import './AllObservations.scss';

export default function AllObservations() {
  const { observations, getInBuffer, getReadyForAnalysis, getDaysRemaining } = useObservations();
  const [statusFilter, setStatusFilter] = useState('all');

  const inBuffer = useMemo(() => getInBuffer(), [getInBuffer]);
  const readyForAnalysis = useMemo(() => getReadyForAnalysis(), [getReadyForAnalysis]);

  const filteredObservations = useMemo(() => {
    if (statusFilter === 'all') return observations;
    if (statusFilter === 'buffer') return inBuffer;
    if (statusFilter === 'ready') return readyForAnalysis;
    if (statusFilter === 'analyzed') return observations.filter(obs => obs.status === 'analyzed');
    return observations;
  }, [observations, statusFilter, inBuffer, readyForAnalysis]);

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const getStatusBadge = (observation) => {
    if (observation.status === 'analyzed') {
      return <span className="badge badge--green">Analyzed</span>;
    }
    if (readyForAnalysis.some(obs => obs.id === observation.id)) {
      return <span className="badge badge--yellow">Ready</span>;
    }
    return <span className="badge badge--orange">In Buffer</span>;
  };

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">All Observations</h1>
        <p className="page__subtitle">View all observations across all statuses</p>
      </div>

      {/* Filter */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <label className="form__label mb-0">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form__select"
            style={{ width: 'auto', minWidth: '200px' }}
          >
            <option value="all">All Statuses</option>
            <option value="buffer">In Buffer</option>
            <option value="ready">Ready for Analysis</option>
            <option value="analyzed">Analyzed</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="card mb-6">
        <div className="grid grid--cols-1 grid--md-cols-4 grid--gap-4">
          <div>
            <p className="text-sm text--gray-600">Total Observations</p>
            <p className="text-2xl font-bold text--gray-900">{observations.length}</p>
          </div>
          <div>
            <p className="text-sm text--gray-600">In Buffer</p>
            <p className="text-2xl font-bold text--gray-900">{inBuffer.length}</p>
          </div>
          <div>
            <p className="text-sm text--gray-600">Ready for Analysis</p>
            <p className="text-2xl font-bold text--gray-900">{readyForAnalysis.length}</p>
          </div>
          <div>
            <p className="text-sm text--gray-600">Analyzed</p>
            <p className="text-2xl font-bold text--gray-900">
              {observations.filter(obs => obs.status === 'analyzed').length}
            </p>
          </div>
        </div>
      </div>

      {/* Observations List */}
      <div className="card">
        {filteredObservations.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state__title">No observations found</p>
            <p className="empty-state__subtitle">
              {statusFilter === 'all' 
                ? 'Start by catching an observation.' 
                : `No observations with status: ${statusFilter}`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredObservations.map((obs) => {
              const daysRemaining = inBuffer.some(b => b.id === obs.id) 
                ? getDaysRemaining(obs) 
                : null;
              return (
                <div key={obs.id} className="observation-card border border--primary-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text--gray-100 mb-2">{obs.content}</p>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="text--gray-400">
                          {formatDate(obs.createdAt)}
                        </span>
                        {daysRemaining !== null && (
                          <span className="text--primary-400 font-semibold">
                            {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                          </span>
                        )}
                        {obs.tags && obs.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {obs.tags.map((tag, idx) => (
                              <span key={idx} className="badge badge--gray">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {obs.lessonIdentified && (
                          <span className="text--gray-300">
                            📚 LI: {obs.lessonIdentified}
                          </span>
                        )}
                        {obs.ep !== null && (
                          <span className="text--gray-300">⭐ EP: {obs.ep}</span>
                        )}
                        {obs.convertedToTask && (
                          <span className="text--green-400 font-semibold">✅ Converted to Task</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(obs)}
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

