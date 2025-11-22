/**
 * FilterBar - Reusable filter bar component
 * 
 * Displays filter controls in a consistent layout
 */

import './FilterBar.scss';

export default function FilterBar({ children, className = '' }) {
  return (
    <div className={`filter-bar ${className}`}>
      {children}
    </div>
  );
}

