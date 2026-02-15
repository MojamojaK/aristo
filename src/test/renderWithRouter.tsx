import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type { ReactElement } from 'react';

/**
 * Render a component inside a MemoryRouter with a route pattern.
 * Useful for testing pages that use useParams or useLocation.
 */
export function renderWithRouter(
  ui: ReactElement,
  {
    path = '/',
    initialEntry = '/',
  }: {
    path?: string;
    initialEntry?: string;
  } = {},
) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path={path} element={ui} />
      </Routes>
    </MemoryRouter>,
  );
}
