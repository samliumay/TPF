/**
 * AllEntities - View all entities in the Diamond System
 * 
 * Displays all entities with filtering options by level and type.
 */

import { useState, useMemo } from 'react';
import { useDiamond } from '../../../features/diamond/DiamondContext';
import { useNavigate } from 'react-router-dom';
import { ENTITY_LEVELS } from '../../../config/constants';
import { ROUTES } from '../../../config/routes';
import './AllEntities.scss';

export default function AllEntities() {
  const { entities, deleteEntity, getStatistics, entitiesByLevel } = useDiamond();
  const navigate = useNavigate();
  const [levelFilter, setLevelFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');

  const stats = getStatistics;

  const filteredEntities = useMemo(() => {
    if (!entities || !Array.isArray(entities)) {
      return [];
    }

    let filtered = entities.filter(entity => entity && entity.id && entity.level !== undefined);

    if (levelFilter !== null) {
      filtered = filtered.filter(entity => entity.level === levelFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(entity => entity.type === typeFilter);
    }

    return filtered.sort((a, b) => {
      // Sort by level ASC, then EP DESC
      if (a.level !== b.level) return (a.level || 0) - (b.level || 0);
      return (b.ep || 0) - (a.ep || 0);
    });
  }, [entities, levelFilter, typeFilter]);

  const getLevelColor = (levelId) => {
    const colors = {
      1: 'badge badge--red',
      2: 'badge badge--orange',
      3: 'badge badge--yellow',
      4: 'badge badge--gray',
      5: 'badge badge--gray',
    };
    return colors[levelId] || 'badge badge--gray';
  };

  const getLevelLabel = (levelId) => {
    const levels = {
      1: ENTITY_LEVELS.LEVEL_1.label,
      2: ENTITY_LEVELS.LEVEL_2.label,
      3: ENTITY_LEVELS.LEVEL_3.label,
      4: ENTITY_LEVELS.LEVEL_4.label,
      5: ENTITY_LEVELS.LEVEL_5.label,
    };
    return levels[levelId] || 'Unknown';
  };

  const handleDelete = (entityId) => {
    if (window.confirm('Are you sure you want to delete this entity?')) {
      deleteEntity(entityId);
    }
  };

  return (
    <div className="page">
      <div className="page__header">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="page__title">All Entities</h1>
            <p className="page__subtitle">View and manage all entities in the Diamond System</p>
          </div>
          <button 
            onClick={() => navigate(ROUTES.DIAMOND.ADD_ENTITY)}
            className="btn btn--primary"
          >
            ➕ Add New Entity
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="card mb-6">
        <div className="grid grid--cols-1 grid--md-cols-3 grid--gap-4">
          <div>
            <p className="text-sm text--gray-600">Total Entities</p>
            <p className="text-2xl font-bold text--gray-900">{stats?.total ?? 0}</p>
          </div>
          <div>
            <p className="text-sm text--gray-600">Average EP</p>
            <p className="text-2xl font-bold text--gray-900">{(stats?.averageEP ?? 0).toFixed(1)}</p>
          </div>
          <div>
            <p className="text-sm text--gray-600">By Level</p>
            <div className="text-sm text--gray-600 mt-1">
              {stats?.byLevel && Object.entries(stats.byLevel).map(([level, count]) => (
                <span key={level} className="mr-2">
                  L{level}: {count}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="form__label mb-0">Filter by Level:</label>
          <select
            value={levelFilter === null ? '' : levelFilter}
            onChange={(e) => setLevelFilter(e.target.value === '' ? null : parseInt(e.target.value))}
            className="form__select"
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="">All Levels</option>
            <option value={1}>Level 1 - Critical</option>
            <option value={2}>Level 2 - Very Important</option>
            <option value={3}>Level 3 - Positive</option>
            <option value={4}>Level 4 - Neutral</option>
            <option value={5}>Level 5 - Hostile</option>
          </select>

          <label className="form__label mb-0">Filter by Type:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="form__select"
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="all">All Types</option>
            <option value="person">Person</option>
            <option value="institution">Institution</option>
          </select>
        </div>
      </div>

      {/* Entities List */}
      <div className="card">
        {filteredEntities.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state__title">No entities found</p>
            <button
              onClick={() => navigate(ROUTES.DIAMOND.ADD_ENTITY)}
              className="text--primary-600 hover--text-primary-800 font-medium"
            >
              Add your first entity →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntities.map((entity) => (
              <div key={entity.id} className="border border--gray-200 rounded-lg p-4 hover--shadow-md">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text--gray-900 mb-2" style={{ fontSize: '1.125rem' }}>
                      {entity.name}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text--gray-600">
                      <span className="flex items-center gap-1">
                        <strong>Type:</strong> {entity.type === 'person' ? '👤 Person' : '🏢 Institution'}
                      </span>
                      <span className="flex items-center gap-1">
                        <strong>EP:</strong> {entity.ep}
                      </span>
                      {entity.notes && (
                        <span className="flex items-center gap-1">
                          <strong>Notes:</strong> {entity.notes}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={getLevelColor(entity.level)}>
                      Level {entity.level} - {getLevelLabel(entity.level)}
                    </span>
                    <button
                      onClick={() => navigate(`${ROUTES.DIAMOND.DIAGRAM}?entity=${entity.id}`)}
                      className="text--primary-600 hover--text-primary-800 px-2 py-1 text-sm font-medium"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entity.id)}
                      className="text--red-600 hover--text-red-800 px-2 py-1 text-sm font-medium"
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
    </div>
  );
}

