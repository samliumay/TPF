/**
 * Sidebar - Navigation sidebar component
 * 
 * Displays the main navigation menu in a vertical sidebar layout.
 * Highlights the active route based on current location.
 * Uses centralized ROUTES config (no hardcoded paths).
 * 
 * Features:
 * - Responsive: Hidden on mobile, visible on desktop
 * - Active route highlighting with vertical accent bar
 * - Collapsible sections with sub-items
 * - Icon support for visual navigation (SVG icons)
 * - Fixed positioning for always-visible navigation
 * - Theme toggle button at the bottom (sun/moon icons)
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import { useTheme } from '../../contexts/ThemeContext';

// Simple SVG Icon Components
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 10L10 3L17 10M4 10V16H7V12H13V16H16V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M3 8H17" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M7 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M13 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const LightbulbIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2C7 2 4.5 4.5 4.5 7.5C4.5 9.5 5.5 11.2 7 12.2V15.5H13V12.2C14.5 11.2 15.5 9.5 15.5 7.5C15.5 4.5 13 2 10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 18V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7 18H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const DiamondIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 3L3 10L10 17L17 10L10 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 2V4M10 16V18M18 10H16M4 10H2M15.657 4.343L14.243 5.757M5.757 14.243L4.343 15.657M15.657 15.657L14.243 14.243M5.757 5.757L4.343 4.343" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 10L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 2V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M10 16V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M18 10H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M4 10H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M15.657 4.343L14.243 5.757" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5.757 14.243L4.343 15.657" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M15.657 15.657L14.243 14.243" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5.757 5.757L4.343 4.343" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.293 13.293C16.378 14.208 15.085 14.763 13.642 14.763C10.64 14.763 8.237 12.36 8.237 9.358C8.237 7.914 8.792 6.622 9.707 5.707C6.914 6.697 5 9.505 5 12.763C5 16.765 8.235 20 12.237 20C15.495 20 18.303 18.086 19.293 15.293C18.378 16.208 17.086 16.763 15.642 16.763C12.64 16.763 10.237 14.36 10.237 11.358C10.237 9.914 10.792 8.622 11.707 7.707L17.293 13.293Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);

export default function Sidebar() {
  const location = useLocation();
  const { toggleTheme, isDark } = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    planning: location.pathname.startsWith('/planning'),
    observations: location.pathname.startsWith('/observations'),
    diamond: location.pathname.startsWith('/diamond'),
    settings: location.pathname.startsWith('/settings'),
  });

  /**
   * Check if a route path is currently active
   */
  const isActive = (path) => location.pathname === path;

  /**
   * Check if any sub-item in a section is active
   */
  const isSectionActive = (items) => {
    return items.some(item => isActive(item.path));
  };

  /**
   * Toggle section expansion
   */
  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Navigation structure with collapsible sections
  const navItems = [
    {
      type: 'link',
      path: ROUTES.HOME,
      label: 'Dashboard',
      icon: <HomeIcon />,
    },
    {
      type: 'section',
      key: 'planning',
      label: 'Planning',
      icon: <CalendarIcon />,
      items: [
        { path: ROUTES.PLANNING.ALL_TASKS, label: 'All Tasks' },
        { path: ROUTES.PLANNING.DAILY_TASKS, label: 'Daily Tasks' },
        { path: ROUTES.PLANNING.ADD_TASK, label: 'Add Task' },
        { path: ROUTES.PLANNING.TASK_TREE, label: 'Task Tree View' },
        { path: ROUTES.PLANNING.TASK_CONFIGURATION, label: 'Task Configuration' },
      ],
    },
    {
      type: 'section',
      key: 'observations',
      label: 'Observations',
      icon: <LightbulbIcon />,
      items: [
        { path: ROUTES.OBSERVATIONS.CURRENT, label: 'Current Observations' },
        { path: ROUTES.OBSERVATIONS.WAITING_FOR_ANALYSIS, label: 'Waiting for Analysis' },
        { path: ROUTES.OBSERVATIONS.ALL, label: 'All Observations' },
        { path: ROUTES.OBSERVATIONS.ANALYSIS, label: 'Analysis Page' },
      ],
    },
    {
      type: 'section',
      key: 'diamond',
      label: 'Diamond System',
      icon: <DiamondIcon />,
      items: [
        { path: ROUTES.DIAMOND.DIAGRAM, label: 'Diamond Diagram' },
        { path: ROUTES.DIAMOND.ADD_ENTITY, label: 'Add Entity' },
        { path: ROUTES.DIAMOND.ALL_ENTITIES, label: 'All Entities' },
      ],
    },
    {
      type: 'section',
      key: 'settings',
      label: 'Settings',
      icon: <SettingsIcon />,
      items: [
        { path: ROUTES.SETTINGS.COLOR, label: 'Color Settings' },
        { path: ROUTES.SETTINGS.EMERGENCY, label: 'Emergency Settings' },
      ],
    },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar__nav">
        <ul className="sidebar__list">
          {navItems.map((item, index) => {
            if (item.type === 'link') {
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`sidebar__link ${isActive(item.path) ? 'sidebar__link--active' : ''}`}
                  >
                    <span className="sidebar__icon">{item.icon}</span>
                    <span className="sidebar__label">{item.label}</span>
                  </Link>
                </li>
              );
            }

            if (item.type === 'section') {
              const isExpanded = expandedSections[item.key] || false;
              const hasActiveItem = isSectionActive(item.items);

              return (
                <li key={item.key}>
                  <button
                    onClick={() => toggleSection(item.key)}
                    className={`sidebar__section ${hasActiveItem ? 'sidebar__section--active' : ''}`}
                  >
                    <div className="sidebar__section-header">
                      <span className="sidebar__icon">{item.icon}</span>
                      <span className="sidebar__label">{item.label}</span>
                    </div>
                    <span className="sidebar__chevron">
                      {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </span>
                  </button>
                  {isExpanded && (
                    <ul className="sidebar__sub-list">
                      {item.items.map((subItem) => (
                        <li key={subItem.path}>
                          <Link
                            to={subItem.path}
                            className={`sidebar__sub-link ${isActive(subItem.path) ? 'sidebar__sub-link--active' : ''}`}
                          >
                            {subItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }

            return null;
          })}
        </ul>
      </nav>
      
      {/* Theme Toggle Button at Bottom */}
      <div className="sidebar__footer">
        <button
          onClick={toggleTheme}
          className="sidebar__theme-toggle"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span className="sidebar__theme-icon">
            {isDark ? <SunIcon /> : <MoonIcon />}
          </span>
          <span className="sidebar__theme-text">
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>
      </div>
    </aside>
  );
}

