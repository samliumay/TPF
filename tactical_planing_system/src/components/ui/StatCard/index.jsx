/**
 * StatCard - Individual statistic card component
 * 
 * Displays a single statistic with label and value
 * Value can be a string, number, or React node
 */

import './StatCard.scss';

export default function StatCard({ label, value, className = '' }) {
  return (
    <div className={`stat-card ${className}`}>
      <p className="stat-card__label">{label}</p>
      <div className="stat-card__value">{value}</div>
    </div>
  );
}

