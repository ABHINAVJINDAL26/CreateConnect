import Navbar from './Navbar';
import '../App.css';

function Layout({ children, activePage, onPageChange, onLogout, isAuthenticated }) {
  if (!isAuthenticated()) {
    return <>{children}</>;
  }

  return (
    <div className="layout">
      <Navbar activePage={activePage} onPageChange={onPageChange} onLogout={onLogout} />
      <main className="layout-main">{children}</main>
    </div>
  );
}

export default Layout;
