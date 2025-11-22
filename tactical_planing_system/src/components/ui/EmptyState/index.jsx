/**
 * EmptyState - Reusable empty state component
 * 
 * Displays a message when there's no content to show
 */

import './EmptyState.scss';

export default function EmptyState({ title, subtitle, action }) {
  return (
    <div className="empty-state">
      <p className="empty-state__title">{title}</p>
      {subtitle && <p className="empty-state__subtitle">{subtitle}</p>}
      {action && (
        <div className="empty-state__action">
          {action}
        </div>
      )}
    </div>
  );
}

