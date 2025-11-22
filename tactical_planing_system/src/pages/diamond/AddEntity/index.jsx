/**
 * AddEntity - Dedicated page for adding new entities
 * 
 * Form to add new entities to the Diamond System with all properties.
 */

import { useState, useMemo } from 'react';
import { useDiamond } from '../../../features/diamond/DiamondContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../config/routes';
import { ENTITY_LEVELS } from '../../../config/constants';
import './AddEntity.scss';

export default function AddEntity() {
  const { addEntity, getLevelInfo } = useDiamond();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: 'person',
    ep: '50',
    notes: '',
  });

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

    addEntity({
      name: formData.name.trim(),
      type: formData.type,
      ep: ep,
      notes: formData.notes.trim(),
    });

    alert('Entity added successfully!');
    navigate(ROUTES.DIAMOND.ALL_ENTITIES);
  };

  const levelInfo = useMemo(() => {
    const ep = parseInt(formData.ep);
    const level = ep >= 90 ? 1 :
                  ep >= 75 ? 2 :
                  ep >= 50 ? 3 :
                  ep >= 20 ? 4 : 5;
    return getLevelInfo(level);
  }, [formData.ep, getLevelInfo]);

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Add New Entity</h1>
        <p className="page__subtitle">Add a new person or institution to the Diamond System</p>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="form__group">
              <label htmlFor="name" className="form__label">
                Entity Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form__input"
                placeholder="Enter entity name..."
                required
              />
            </div>

            <div className="form__group">
              <label htmlFor="type" className="form__label">
                Entity Type *
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="form__select"
                required
              >
                <option value="person">Person</option>
                <option value="institution">Institution</option>
              </select>
            </div>

            <div className="form__group">
              <label htmlFor="ep" className="form__label">
                Evaluation Point (EP) * (0-100)
              </label>
              <input
                type="number"
                id="ep"
                value={formData.ep}
                onChange={(e) => setFormData({ ...formData, ep: e.target.value })}
                className="form__input"
                min="0"
                max="100"
                step="1"
                required
              />
              <p className="text-sm text--gray-600 mt-1">
                Current Level: <strong>{levelInfo.label}</strong> ({levelInfo.min}-{levelInfo.max})
              </p>
            </div>

            <div className="form__group">
              <label htmlFor="notes" className="form__label">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="form__textarea"
                placeholder="Additional information about this entity..."
                rows="4"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button type="submit" className="btn btn--primary" style={{ flex: 1 }}>
              Add Entity
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.DIAMOND.ALL_ENTITIES)}
              className="btn btn--secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

