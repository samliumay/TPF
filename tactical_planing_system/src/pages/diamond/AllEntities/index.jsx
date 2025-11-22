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
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import SummaryGrid from '../../../components/ui/SummaryGrid';
import FilterBar from '../../../components/ui/FilterBar';
import EmptyState from '../../../components/ui/EmptyState';
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
      <PageHeader
        title="All Entities"
        subtitle="View and manage all entities in the Diamond System"
        action={
          <button 
            onClick={() => navigate(ROUTES.DIAMOND.ADD_ENTITY)}
            className="btn btn--primary"
          >
            ➕ Add New Entity
          </button>
        }
      />

      {/* Statistics */}
      <Card className="mb-6">
        <SummaryGrid 
          stats={[
            { label: 'Total Entities', value: stats?.total ?? 0 },
            { label: 'Average EP', value: (stats?.averageEP ?? 0).toFixed(1) },
            { 
              label: 'By Level', 
              value: stats?.byLevel ? (
                <div className="text-sm">
                  {Object.entries(stats.byLevel).map(([level, count]) => (
                    <span key={level} className="mr-2">
                      L{level}: {count}
                    </span>
                  ))}
                </div>
              ) : '0'
            },
          ]} 
          columns={3} 
        />
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <FilterBar>
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
        </FilterBar>
      </Card>

      {/* Entities List */}
      <Card>
        {filteredEntities.length === 0 ? (
          <EmptyState
            title="No entities found"
            action={
              <button
                onClick={() => navigate(ROUTES.DIAMOND.ADD_ENTITY)}
                className="text--primary-400 hover--text-primary-300 font-medium"
              >
                Add your first entity →
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredEntities.map((entity) => (
              <div key={entity.id} className="entity-card border border--primary-700 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text--gray-100 mb-2" style={{ fontSize: '1.125rem' }}>
                      {entity.name}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text--gray-300">
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
                      className="text--primary-400 hover--text-primary-300 px-2 py-1 text-sm font-medium"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entity.id)}
                      className="text--red-400 hover--text-red-300 px-2 py-1 text-sm font-medium"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

