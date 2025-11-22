/**
 * Card - Reusable card component wrapper
 * 
 * Provides consistent card styling with optional header and footer
 */

import './Card.scss';

export default function Card({ children, className = '', header, footer }) {
  return (
    <div className={`card ${className}`}>
      {header && (
        <div className="card__header">
          {header}
        </div>
      )}
      <div className="card__body">
        {children}
      </div>
      {footer && (
        <div className="card__footer">
          {footer}
        </div>
      )}
    </div>
  );
}

