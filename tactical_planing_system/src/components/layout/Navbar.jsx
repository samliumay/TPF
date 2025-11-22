/**
 * Navbar - Top navigation bar component
 * 
 * Displays the application branding and title at the top.
 * Navigation links are now in the Sidebar component.
 * This provides a classic layout: navbar at top, sidebar on left, content in center.
 * 
 * Supports dark mode with appropriate color classes.
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../config/routes';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <div className="flex items-center justify-between w-full">
          <h1 className="navbar__title">PF-D Planning System</h1>
          <div className="flex items-center gap-4">
            {user && (
              <span className="navbar__user" style={{ color: 'var(--color-gray-300)', fontSize: '0.875rem' }}>
                {user.name || user.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="btn btn--danger"
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

