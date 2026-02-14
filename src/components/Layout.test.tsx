import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import Layout from './Layout';

// Mock Sidebar to keep Layout tests focused
vi.mock('./Sidebar', () => ({
  default: () => <nav data-testid="sidebar-nav">Sidebar</nav>,
}));

function renderLayout(initialEntry = '/aristo/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/aristo/"
            element={<div data-testid="home">Home Page</div>}
          />
          <Route
            path="/aristo/other"
            element={
              <div data-testid="other">
                Other Page
                <Link to="/aristo/">Go Home</Link>
              </div>
            }
          />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('Layout', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the masthead with home link', () => {
    renderLayout();
    const homeLink = screen.getByRole('link', { name: 'aristo' });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/aristo/');
  });

  it('renders the sidebar', () => {
    renderLayout();
    expect(screen.getByTestId('sidebar-nav')).toBeInTheDocument();
  });

  it('renders the outlet content', () => {
    renderLayout();
    expect(screen.getByTestId('home')).toHaveTextContent('Home Page');
  });

  it('renders the sidebar checkbox', () => {
    renderLayout();
    const checkbox = document.getElementById(
      'sidebar-checkbox'
    ) as HTMLInputElement;
    expect(checkbox).toBeInTheDocument();
    expect(checkbox.type).toBe('checkbox');
  });

  it('renders the sidebar toggle label', () => {
    renderLayout();
    const toggle = screen.getByLabelText('メニューを開く');
    expect(toggle).toBeInTheDocument();
  });

  it('renders copyright with current year', () => {
    renderLayout();
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });

  it('closes sidebar on route change', () => {
    renderLayout('/aristo/other');
    const checkbox = document.getElementById(
      'sidebar-checkbox'
    ) as HTMLInputElement;

    // Open sidebar
    checkbox.checked = true;
    expect(checkbox.checked).toBe(true);

    // Navigate to home
    const goHomeLink = screen.getByRole('link', { name: 'Go Home' });
    fireEvent.click(goHomeLink);

    // Sidebar should close
    expect(checkbox.checked).toBe(false);
  });

  it('scrolls to top on route change', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    renderLayout('/aristo/other');

    const goHomeLink = screen.getByRole('link', { name: 'Go Home' });
    fireEvent.click(goHomeLink);

    expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    scrollToSpy.mockRestore();
  });

  it('closes sidebar when clicking outside', () => {
    renderLayout();
    const checkbox = document.getElementById(
      'sidebar-checkbox'
    ) as HTMLInputElement;

    // Open sidebar
    checkbox.checked = true;

    // Click outside the sidebar
    act(() => {
      fireEvent.click(document.querySelector('.wrap')!);
    });

    expect(checkbox.checked).toBe(false);
  });

  it('does not close sidebar when clicking inside sidebar', () => {
    renderLayout();
    const checkbox = document.getElementById(
      'sidebar-checkbox'
    ) as HTMLInputElement;

    // Open sidebar
    checkbox.checked = true;

    // Click inside the sidebar
    act(() => {
      fireEvent.click(screen.getByTestId('sidebar-nav'));
    });

    expect(checkbox.checked).toBe(true);
  });
});
