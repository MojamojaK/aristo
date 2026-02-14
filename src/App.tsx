import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CultivationLogIndexPage from './pages/CultivationLogIndexPage';
import CultivationLogPage from './pages/CultivationLogPage';
import GreenhousePage from './pages/GreenhousePage';
import RetailPage from './pages/RetailPage';
import NotFoundPage from './pages/NotFoundPage';
import { BASE } from './config';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path={`${BASE}/`} element={<HomePage />} />
          <Route path={`${BASE}/cultivation_logs`} element={<CultivationLogIndexPage />} />
          <Route path={`${BASE}/cultivation_logs/:slug`} element={<CultivationLogPage />} />
          <Route path={`${BASE}/greenhouse/*`} element={<GreenhousePage />} />
          <Route path={`${BASE}/purchasing/retail`} element={<RetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
