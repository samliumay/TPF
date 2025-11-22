/**
 * DiamondSystem - Entity evaluation and management page
 * 
 * The Diamond System evaluates entities (people, institutions) in the user's life.
 * Each entity has an EP (Evaluation Point) score (0-100) that determines its Level.
 * 
 * Level Hierarchy:
 * - Level 1 (90-100): Critical (Family, Life-savers) - Almost never drops below 90
 * - Level 2 (75-90): Very Important (Close friends, Partner) - Can drop to L3, never rise to L1
 * - Level 3 (50-75): Positive (Good colleagues, acquaintances) - Standard entry point
 * - Level 4 (20-50): Neutral/Negative (Indifferent, minor conflicts)
 * - Level 5 (<20): Hostile (Enemies, irreversible damage) - Blacklisted
 * 
 * Features:
 * - Add/Edit/Delete entities
 * - Update EP scores with automatic level calculation
 * - Level transition rule enforcement
 * - Visual hierarchy display with color coding
 * - Statistics: Total entities, Average EP, Count by level
 * 
 * Entity Properties:
 * - Name: Entity name (required)
 * - Type: 'person' or 'institution' (required)
 * - EP: Evaluation Point 0-100 (required, determines level)
 * - Notes: Optional additional information
 */

import { useState, useMemo } from 'react';
import { useDiamond } from '../../features/diamond/DiamondContext';
import { ENTITY_LEVELS } from '../../config/constants';
import './DiamondSystem.scss';

export default function DiamondSystem() {
  const {
    entities,
    addEntity,
    updateEntityEP,
    updateEntity,
    deleteEntity,
    entitiesByLevel,
    getStatistics,
    getLevelInfo,
  } = useDiamond();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'person',
    ep: '50',
    notes: '',
  });

  const stats = getStatistics;

  const getLevelColor = (levelId) => {
    const colors = {
      1: 'bg-red-100 border-red-300 text-red-800',
      2: 'bg-orange-100 border-orange-300 text-orange-800',
      3: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      4: 'bg-gray-100 border-gray-300 text-gray-800',
      5: 'bg-black border-black text-white',
    };
    return colors[levelId] || colors[4];
  };

  const getLevelBadgeColor = (levelId) => {
    const colors = {
      1: 'bg-red-500',
      2: 'bg-orange-500',
      3: 'bg-yellow-500',
      4: 'bg-gray-500',
      5: 'bg-black',
    };
    return colors[levelId] || colors[4];
  };

  const handleOpenForm = (entity = null, level = null) => {
    if (entity) {
      setEditingEntity(entity);
      setFormData({
        name: entity.name,
        type: entity.type,
        ep: entity.ep.toString(),
        notes: entity.notes || '',
      });
    } else {
      setEditingEntity(null);
      const defaultEP = level ? getLevelInfo(level).min + 5 : 50;
      setFormData({
        name: '',
        type: 'person',
        ep: defaultEP.toString(),
        notes: '',
      });
    }
    setSelectedLevel(level);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingEntity(null);
    setSelectedLevel(null);
    setFormData({ name: '', type: 'person', ep: '50', notes: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Please enter an entity name');
      return;
    }

    const ep = parseFloat(formData.ep);
    if (isNaN(ep) || ep < 0 || ep > 100) {
      alert('EP must be between 0 and 100');
      return;
    }

    if (editingEntity) {
      try {
        updateEntityEP(editingEntity.id, ep, editingEntity.level);
        updateEntity(editingEntity.id, {
          name: formData.name.trim(),
          type: formData.type,
          notes: formData.notes.trim(),
        });
        handleCloseForm();
      } catch (error) {
        alert(error.message);
      }
    } else {
      addEntity({
        name: formData.name.trim(),
        type: formData.type,
        ep: ep,
        notes: formData.notes.trim(),
      });
      handleCloseForm();
    }
  };

  const handleEPChange = (entityId, newEP, currentLevel) => {
    try {
      updateEntityEP(entityId, newEP, currentLevel);
    } catch (error) {
      alert(error.message);
    }
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
            <h1 className="page__title">Diamond System</h1>
            <p className="page__subtitle">
              Evaluate entities (people, institutions) with EP (Evaluation Point) and Levels
            </p>
          </div>
          <button
            onClick={() => handleOpenForm()}
            className="btn btn--primary"
          >
            ➕ Add Entity
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="card mb-6">
        <h2 className="card__title mb-4">Statistics</h2>
        <div className="grid grid--cols-1 grid--md-cols-4 grid--gap-4">
          <div>
            <p className="text-sm text--gray-600">Total Entities</p>
            <p className="text-2xl font-bold text--gray-900">{stats.total}</p>
          </div>
          <div>
            <p className="text-sm text--gray-600">Average EP</p>
            <p className="text-2xl font-bold text--gray-900">
              {stats.averageEP.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-sm text--gray-600">Level 1 (Critical)</p>
            <p className="text-2xl font-bold text--red-600">{stats.byLevel[1] || 0}</p>
          </div>
          <div>
            <p className="text-sm text--gray-600">Level 2 (Very Important)</p>
            <p className="text-2xl font-bold text--orange-600">{stats.byLevel[2] || 0}</p>
          </div>
        </div>
      </div>

      {/* Diamond Hierarchy Visualization */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text--gray-800 mb-4">Diamond Hierarchy</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((levelId) => {
            const levelInfo = getLevelInfo(levelId);
            const levelEntities = entitiesByLevel[levelId] || [];

            return (
              <div
                key={levelId}
                className={`border border--2 rounded-lg p-4 ${getLevelColor(levelId)}`}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-full ${getLevelBadgeColor(
                        levelId
                      )} flex items-center justify-center text-white font-bold`}
                    >
                      {levelId}
                    </span>
                    <div>
                      <h3 className="font-bold text-lg">
                        Level {levelId} - {levelInfo.label}
                      </h3>
                      <p className="text-sm opacity-80">
                        EP Range: {levelInfo.min}-{levelInfo.max}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {levelEntities.length} entity{levelEntities.length !== 1 ? 'ies' : 'y'}
                    </span>
                    <button
                      onClick={() => handleOpenForm(null, levelId)}
                      className="bg-white bg-opacity-50 hover--bg-opacity-100 px-3 py-1 rounded text-sm font-medium transition-colors"
                    >
                      ➕ Add to Level {levelId}
                    </button>
                  </div>
                </div>

                {/* Level Rules */}
                <div className="mb-3 text-sm opacity-75">
                  {levelId === 1 && 'Almost never drops below 90'}
                  {levelId === 2 && 'Can drop to L3 but never rise to L1'}
                  {levelId === 3 && 'Standard entry point for good entities'}
                  {levelId === 4 && 'Entities we don\'t care about'}
                  {levelId === 5 && 'Blacklisted entities'}
                </div>

                {/* Entities in this level */}
                {levelEntities.length > 0 ? (
                  <div className="grid grid--cols-1 grid--md-cols-2 grid--lg-cols-3 grid--gap-3 mt-4">
                    {levelEntities.map((entity) => (
                      <div
                        key={entity.id}
                        className="bg-white bg-opacity-80 rounded-lg p-3 border border-opacity-50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text--gray-900">{entity.name}</h4>
                            <p className="text-xs text--gray-600 capitalize">{entity.type}</p>
                          </div>
                          <button
                            onClick={() => handleDelete(entity.id)}
                            className="text--red-600 hover--text-red-800 text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text--gray-600">EP:</label>
                          <input
                            type="number"
                            value={entity.ep}
                            onChange={(e) =>
                              handleEPChange(entity.id, e.target.value, entity.level)
                            }
                            min="0"
                            max="100"
                            step="1"
                            className="w-16 px-2 py-1 border border--gray-300 rounded text-sm font-bold"
                          />
                          <span className="text-xs text--gray-600">
                            ({levelInfo.min}-{levelInfo.max})
                          </span>
                        </div>
                        {entity.notes && (
                          <p className="text-xs text--gray-600 mt-2 line-clamp-2">
                            {entity.notes}
                          </p>
                        )}
                        <button
                          onClick={() => handleOpenForm(entity)}
                          className="text-xs text--primary-600 hover--text-primary-800 mt-2"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm opacity-60 italic mt-2">No entities in this level</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Entity Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text--gray-900 mb-4">
              {editingEntity ? 'Edit Entity' : 'Add New Entity'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text--gray-700 mb-1">
                    Entity Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form__input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text--gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="form__select"
                    required
                  >
                    <option value="person">Person</option>
                    <option value="institution">Institution</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text--gray-700 mb-1">
                    Evaluation Point (EP) * (0-100)
                  </label>
                  <input
                    type="number"
                    value={formData.ep}
                    onChange={(e) => setFormData({ ...formData, ep: e.target.value })}
                    className="form__input"
                    min="0"
                    max="100"
                    step="1"
                    required
                  />
                  {selectedLevel && (
                    <p className="text-xs text--gray-500 mt-1">
                      Level {selectedLevel} range: {getLevelInfo(selectedLevel).min}-
                      {getLevelInfo(selectedLevel).max}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text--gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="form__textarea"
                    rows="3"
                    placeholder="Additional notes about this entity..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="btn btn--primary flex-1"
                >
                  {editingEntity ? 'Update Entity' : 'Add Entity'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="btn btn--secondary flex-1"
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

