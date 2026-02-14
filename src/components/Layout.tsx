import { useRef, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { BASE } from '../config';

export default function Layout() {
  const checkboxRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.checked = false;
    }
  }, [location.pathname]);

  // Scroll to top on route change (#16)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Close sidebar when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const checkbox = checkboxRef.current;
      const sidebar = sidebarRef.current;
      const target = e.target as HTMLElement;
      const toggle = document.querySelector('.sidebar-toggle');

      if (
        !checkbox?.checked ||
        sidebar?.contains(target) ||
        target === checkbox ||
        target === toggle ||
        toggle?.contains(target)
      ) {
        return;
      }

      checkbox.checked = false;
    }

    document.addEventListener('click', handleClick, false);
    return () => document.removeEventListener('click', handleClick, false);
  }, []);

  return (
    <>
      <input
        type="checkbox"
        className="sidebar-checkbox"
        id="sidebar-checkbox"
        ref={checkboxRef}
      />

      <div className="sidebar" id="sidebar" ref={sidebarRef}>
        <div className="sidebar-item">
          <p>食虫植物 素人栽培 備忘録</p>
        </div>

        <Sidebar />

        <div className="sidebar-item">
          <p>&copy; {new Date().getFullYear()}. All rights reserved.</p>
        </div>
      </div>

      <div className="wrap">
        <div className="masthead">
          <div className="container">
            <h3 className="masthead-title">
              <Link to={`${BASE}/`} title="Home">
                aristo
              </Link>
            </h3>
          </div>
        </div>

        <div className="container content">
          <Outlet />
        </div>
      </div>

      <label
        htmlFor="sidebar-checkbox"
        className="sidebar-toggle"
        aria-label="メニューを開く"
      ></label>
    </>
  );
}
