/**
 * Navbar - Top navigation bar component
 * 
 * Displays the application branding and title at the top.
 * Navigation links are now in the Sidebar component.
 * This provides a classic layout: navbar at top, sidebar on left, content in center.
 * 
 * Supports dark mode with appropriate color classes.
 */

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar__container">
        <div className="flex items-center">
          <h1 className="navbar__title">PF-D Planning System</h1>
        </div>
      </div>
    </nav>
  );
}

