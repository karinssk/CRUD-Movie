import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../models/StoreContext';
import { Role } from '../types';

const PERMISSIONS: { label: string; roles: Role[] }[] = [
  { label: 'View movies',   roles: ['MANAGER', 'TEAMLEADER', 'FLOORSTAFF'] },
  { label: 'Add movies',    roles: ['MANAGER', 'TEAMLEADER', 'FLOORSTAFF'] },
  { label: 'Edit movies',   roles: ['MANAGER', 'TEAMLEADER', 'FLOORSTAFF'] },
  { label: 'Delete movies', roles: ['MANAGER'] },
];

export default observer(function Navbar() {
  const { auth } = useStore();
  const navigate  = useNavigate();
  const [showPerms, setShowPerms] = useState(false);

  function handleLogout() {
    auth.logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <span className="navbar-brand">Movie Manager</span>
      {auth.isAuthenticated && (
        <div className="navbar-right">
          <span className="navbar-user">
            {auth.username}
            <span
              className={`role-chip role-${auth.role?.toLowerCase()}`}
              onMouseEnter={() => setShowPerms(true)}
              onMouseLeave={() => setShowPerms(false)}
              style={{ position: 'relative', cursor: 'default' }}
            >
              {auth.role}
              {showPerms && auth.role && (
                <div className="perms-popover">
                  <p className="perms-title">Permissions</p>
                  <ul className="perms-list">
                    {PERMISSIONS.map((p) => {
                      const allowed = p.roles.includes(auth.role as Role);
                      return (
                        <li key={p.label} className={`perms-item ${allowed ? 'allowed' : 'denied'}`}>
                          {allowed
                            ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          }
                          {p.label}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </span>
          </span>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Log out
          </button>
        </div>
      )}
    </nav>
  );
});
