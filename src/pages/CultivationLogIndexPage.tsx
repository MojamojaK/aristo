import { Link } from 'react-router-dom';
import cultivationLogs from '../data/cultivationLogs.json';
import genuses from '../data/genuses.json';
import { BASE } from '../config';
import { usePageTitle } from '../hooks/usePageTitle';
import type { CultivationLog, Genus } from '../types';

export default function CultivationLogIndexPage() {
  usePageTitle('栽培リスト');
  const logs = cultivationLogs as CultivationLog[];
  const typedGenuses = genuses as Genus[];

  return (
    <>
      <h1>栽培リスト</h1>
      <p>{logs.length}種の食虫植物を栽培中</p>

      {typedGenuses.map((genus) => {
        const genusLogs = logs.filter((log) => log.genus === genus.name);
        if (genusLogs.length === 0) return null;
        return (
          <div key={genus.name}>
            <h2>{genus.header}</h2>
            <table>
              <thead>
                <tr>
                  <th>名前</th>
                  <th>環境</th>
                  <th>記録数</th>
                </tr>
              </thead>
              <tbody>
                {genusLogs.map((log) => (
                  <tr key={log.slug}>
                    <td>
                      <Link to={`${BASE}/cultivation_logs/${log.slug}`}>
                        {log.name}
                        {log.alias ? ` (${log.alias})` : ''}
                      </Link>
                    </td>
                    <td>{log.environment}</td>
                    <td>
                      {log.logs.reduce((sum, l) => sum + l.entries.length, 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </>
  );
}
