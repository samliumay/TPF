/**
 * PageHeader - Reusable page header component
 * 
 * Displays page title, subtitle, and optional action button
 */

import './PageHeader.scss';

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div className="page-header__content">
        <div>
          <h1 className="page-header__title">{title}</h1>
          {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        </div>
        {action && (
          <div className="page-header__action">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

