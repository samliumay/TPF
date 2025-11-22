/**
 * Layout - Main layout wrapper component
 * 
 * Provides the classic layout structure:
 * - Navigation bar at the top (fixed)
 * - Sidebar on the left (fixed) for navigation (desktop only)
 * - Main content area in the center (with left margin for sidebar on desktop)
 * 
 * Layout Structure:
 * ┌─────────────────────────────────┐
 * │         Navbar (Top)            │
 * ├──────────┬──────────────────────┤
 * │          │                      │
 * │ Sidebar  │   Page Content       │
 * │ (Left)   │   (Center)           │
 * │          │                      │
 * └──────────┴──────────────────────┘
 * 
 * Responsive Behavior:
 * - Desktop (md+): Sidebar visible, content offset by sidebar width
 * - Mobile: Sidebar hidden, content full width
 * 
 * Uses React Router's <Outlet> to render child routes.
 */

import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="layout">
      {/* Top Navigation Bar - Fixed at top */}
      <Navbar />
      
      {/* Sidebar Navigation - Fixed on left, hidden on mobile */}
      <Sidebar />
      
      {/* Main Content Area 
          - Desktop: offset by sidebar width (256px = w-64)
          - Mobile: full width (no offset)
          - Top padding to account for fixed navbar (64px = h-16)
      */}
      <main className="layout__main">
        <div className="layout__content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

