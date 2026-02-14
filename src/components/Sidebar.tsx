import { useState, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import genuses from '../data/genuses.json';
import cultivationLogs from '../data/cultivationLogs.json';
import greenhousePages from '../data/greenhousePages.json';
import type { Genus, CultivationLog } from '../types';
import { BASE } from '../config';

function AccordionItem({
  label,
  children,
  isActive,
  onToggle,
}: {
  label: string;
  children: React.ReactNode;
  isActive: boolean;
  onToggle: () => void;
}) {
  function handleKeyDown(e: React.KeyboardEvent) {
    const button = e.currentTarget as HTMLElement;
    const li = button.parentElement;
    if (!li) return;

    if (e.key === 'Escape' && isActive) {
      e.preventDefault();
      onToggle();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = li.nextElementSibling;
      const focusable = next?.querySelector<HTMLElement>('button, a');
      focusable?.focus();
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = li.previousElementSibling;
      const focusable = prev?.querySelector<HTMLElement>('button, a');
      focusable?.focus();
    }
  }

  return (
    <li className={isActive ? 'active' : ''}>
      <button
        type="button"
        className="sidebar-nav-item"
        aria-expanded={isActive}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        onKeyDown={handleKeyDown}
      >
        {label}
      </button>
      <ul
        className={isActive ? 'show-dropdown' : ''}
        style={{ display: isActive ? 'block' : 'none' }}
      >
        {children}
      </ul>
    </li>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const [openGenus, setOpenGenus] = useState<string | null>(null);
  const [openSubCat, setOpenSubCat] = useState<string | null>(null);
  const [openEnv, setOpenEnv] = useState<string | null>(null);
  const [cultivationListOpen, setCultivationListOpen] = useState(false);
  const [greenhouseOpen, setGreenhouseOpen] = useState(false);
  const [purchasingOpen, setPurchasingOpen] = useState(false);

  const logs = cultivationLogs as CultivationLog[];
  const typedGenuses = genuses as Genus[];

  // Derive open accordion state from current route (#10)
  useEffect(() => {
    if (currentPath.startsWith(`${BASE}/cultivation_logs/`)) {
      const slug = currentPath.replace(`${BASE}/cultivation_logs/`, '');
      const log = logs.find((l) => l.slug === slug);
      if (log) {
        setCultivationListOpen(true);
        setOpenGenus(log.genus);
        setOpenSubCat(log.sub_category);
        setOpenEnv(log.environment);
        return;
      }
    }
    if (currentPath.startsWith(`${BASE}/greenhouse`)) {
      setGreenhouseOpen(true);
      return;
    }
    if (currentPath.startsWith(`${BASE}/purchasing`)) {
      setPurchasingOpen(true);
      return;
    }
  }, [currentPath, logs]);

  const getLogsForEnv = useCallback(
    (genusName: string, subCatName: string, envName: string) =>
      logs.filter(
        (log) =>
          log.genus === genusName &&
          log.sub_category === subCatName &&
          log.environment === envName,
      ),
    [logs],
  );

  return (
    <nav
      className="sidebar-nav"
      id="accordian"
      role="navigation"
      aria-label="サイトナビゲーション"
    >
      <ul className="show-dropdown">
        <li>
          <Link
            className={`sidebar-nav-item${currentPath === BASE + '/' || currentPath === BASE ? ' active' : ''}`}
            to={`${BASE}/`}
          >
            Home
          </Link>
        </li>

        <AccordionItem
          label="栽培リスト"
          isActive={cultivationListOpen}
          onToggle={() => {
            setCultivationListOpen(!cultivationListOpen);
            if (cultivationListOpen) {
              setOpenGenus(null);
              setOpenSubCat(null);
              setOpenEnv(null);
            }
          }}
        >
          {typedGenuses.map((genus) => (
            <AccordionItem
              key={genus.name}
              label={genus.header}
              isActive={openGenus === genus.name}
              onToggle={() => {
                setOpenGenus(openGenus === genus.name ? null : genus.name);
                setOpenSubCat(null);
                setOpenEnv(null);
              }}
            >
              {genus.sub_categories.map((subCat) => (
                <AccordionItem
                  key={subCat.name}
                  label={subCat.header}
                  isActive={openSubCat === subCat.name}
                  onToggle={() => {
                    setOpenSubCat(
                      openSubCat === subCat.name ? null : subCat.name,
                    );
                    setOpenEnv(null);
                  }}
                >
                  {subCat.environments.map((env) => {
                    const envLogs = getLogsForEnv(
                      genus.name,
                      subCat.name,
                      env.name,
                    );
                    return (
                      <AccordionItem
                        key={env.name}
                        label={env.header}
                        isActive={openEnv === env.name}
                        onToggle={() => {
                          setOpenEnv(openEnv === env.name ? null : env.name);
                        }}
                      >
                        {envLogs.map((log) => (
                          <li key={log.slug}>
                            <Link
                              to={`${BASE}/cultivation_logs/${log.slug}`}
                              className="sidebar-nav-item"
                            >
                              {log.name}
                              {log.alias ? ` (${log.alias})` : ''}
                              {log.logs.length === 0 ? ' (Coming Soon)' : ''}
                            </Link>
                          </li>
                        ))}
                      </AccordionItem>
                    );
                  })}
                </AccordionItem>
              ))}
            </AccordionItem>
          ))}
        </AccordionItem>

        <AccordionItem
          label="温室"
          isActive={greenhouseOpen}
          onToggle={() => setGreenhouseOpen(!greenhouseOpen)}
        >
          {greenhousePages.map((page) => (
            <li key={page.slug}>
              <Link to={`${BASE}${page.url}`} className="sidebar-nav-item">
                {page.title}
              </Link>
            </li>
          ))}
        </AccordionItem>

        <AccordionItem
          label="入手方法"
          isActive={purchasingOpen}
          onToggle={() => setPurchasingOpen(!purchasingOpen)}
        >
          <li>
            <Link to={`${BASE}/purchasing/retail`} className="sidebar-nav-item">
              販売業者
            </Link>
          </li>
        </AccordionItem>

        <li>
          <span className="sidebar-nav-item">Currently v1.0.0</span>
        </li>
      </ul>
    </nav>
  );
}
