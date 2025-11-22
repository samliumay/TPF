import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../config/routes';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: ROUTES.HOME, label: 'Dashboard' },
    { path: ROUTES.DAILY_PLAN, label: 'Daily Plan' },
    { path: ROUTES.OBSERVATION_INPUT, label: 'Observations' },
    { path: ROUTES.DIAMOND_VIEW, label: 'Diamond System' },
    { path: ROUTES.SETTINGS, label: 'Settings' },
  ];

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold">PF-D System</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive(link.path)
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

