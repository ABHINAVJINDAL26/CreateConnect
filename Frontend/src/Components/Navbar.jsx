import { useAuth } from '../Context/AuthContext';
import '../App.css';

function Navbar({ activePage, onPageChange, onLogout }) {
  const { currentUser } = useAuth();

  return (
    <nav className="dashboard-nav">
      <div className="nav-left">
        <h2 className="nav-title">🚀 AssetVault</h2>
      </div>
      
      <div className="menu-items">
        <button
          type="button"
          className={`btn nav-btn ${activePage === 'home' ? 'active' : ''}`}
          onClick={() => onPageChange('home')}
        >
          Home
        </button>
        <button
          type="button"
          className={`btn nav-btn ${activePage === 'create-asset' ? 'active' : ''}`}
          onClick={() => onPageChange('create-asset')}
        >
          +Create Asset
        </button>
        <button
          type="button"
          className={`btn nav-btn ${activePage === 'my-assets' ? 'active' : ''}`}
          onClick={() => onPageChange('my-assets')}
        >
          My Assets
        </button>
        <button
          type="button"
          className={`btn nav-btn ${activePage === 'about' ? 'active' : ''}`}
          onClick={() => onPageChange('about')}
        >
          About
        </button>
      </div>

      <div className="nav-right">
        <span className="user-name">Hi, {currentUser?.name || 'User'}</span>
        <button type="button" className="btn btn-logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
