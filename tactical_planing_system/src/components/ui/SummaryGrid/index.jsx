/**
 * SummaryGrid - Grid layout for displaying statistics
 * 
 * Displays multiple StatCard components in a responsive grid
 */

import StatCard from '../StatCard';
import './SummaryGrid.scss';

export default function SummaryGrid({ stats, columns = 3 }) {
  return (
    <div className={`summary-grid summary-grid--cols-${columns}`}>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          label={stat.label}
          value={stat.value}
          className={stat.className}
        />
      ))}
    </div>
  );
}

