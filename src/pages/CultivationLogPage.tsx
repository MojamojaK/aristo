import { useParams } from 'react-router-dom';
import cultivationLogs from '../data/cultivationLogs.json';
import { resolveAutoImages, resolveLocalImages } from '../utils/imageResolver';
import { usePageTitle } from '../hooks/usePageTitle';
import type { CultivationLog, ContentItem } from '../types';

function ImageGallery({
  genus,
  item,
  date,
  plantName,
}: {
  genus: string;
  item: ContentItem;
  date: string;
  plantName: string;
}) {
  const altText = `${plantName} - ${date}`;

  if (item.auto_image) {
    const imagePaths = resolveAutoImages(genus, item.auto_image.id, date);
    if (imagePaths.length === 0) return null;
    return (
      <span>
        {imagePaths.map((path, idx) => (
          <span key={path}>
            {item.auto_image?.line_breaks?.includes(idx) && <br />}
            <a href={path} target="_blank" rel="noreferrer">
              <img
                className="log-image"
                src={path}
                alt={altText}
                loading="lazy"
                decoding="async"
              />
            </a>
          </span>
        ))}
      </span>
    );
  }

  if (item.local_images) {
    const allPaths = resolveLocalImages(item.local_images);
    return (
      <span>
        {allPaths.map((path) => (
          <a key={path} href={path} target="_blank" rel="noreferrer">
            <img
              className="log-image"
              src={path}
              alt={altText}
              loading="lazy"
              decoding="async"
            />
          </a>
        ))}
      </span>
    );
  }

  return null;
}

export default function CultivationLogPage() {
  const { slug } = useParams<{ slug: string }>();
  const log = (cultivationLogs as CultivationLog[]).find((l) => l.slug === slug);

  usePageTitle(log?.name);

  if (!log) {
    if (import.meta.env.DEV) {
      console.warn(`[CultivationLogPage] No log found for slug: ${slug}`);
    }
    return (
      <>
        <h1>Page not found</h1>
        <p>The cultivation log &quot;{slug}&quot; could not be found.</p>
      </>
    );
  }

  // Compute last updated date from all entries
  const allDates = log.logs.flatMap((logData) =>
    logData.entries.map((entry) => entry.date)
  );
  const lastUpdated = allDates.length > 0
    ? allDates.sort().reverse()[0]
    : null;

  return (
    <>
      <h1>{log.name}</h1>

      {log.alias && <h2>{log.alias}</h2>}

      {lastUpdated && (
        <p className="post-date">最終更新: {lastUpdated}</p>
      )}

      {log.bodyContent ? (
        <>
          <h2>特徴</h2>
          <div dangerouslySetInnerHTML={{ __html: log.bodyContent }} />
        </>
      ) : (
        <h2>準備中</h2>
      )}

      {log.logs.length > 0 && <h2>栽培株</h2>}

      {log.logs.map((logData, logIdx) => (
        <div key={logIdx}>
          <h3>
            {logData.source}
            {logData.propagation ? ` - ${logData.propagation}` : ''}
          </h3>
          <h4>栽培開始日: {logData.start_date}</h4>

          <table>
            <colgroup>
              <col width="17%" />
              <col width="83%" />
            </colgroup>
            <thead>
              <tr className="header">
                <th>日付</th>
                <th>更新内容</th>
              </tr>
            </thead>
            <tbody>
              {logData.entries.map((entry, entryIdx) =>
                entry.contents.map((content, contentIdx) => (
                  <tr key={`${entryIdx}-${contentIdx}`}>
                    {contentIdx === 0 && (
                      <td rowSpan={entry.contents.length}>{entry.date}</td>
                    )}
                    <td>
                      {content.items.map((item, itemIdx) => (
                        <span key={itemIdx}>
                          {itemIdx > 0 && <br />}
                          {item.text && (
                            <span className="text-content">{item.text}</span>
                          )}
                          <ImageGallery
                            genus={log.genus}
                            item={item}
                            date={entry.date}
                            plantName={log.name}
                          />
                        </span>
                      ))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
}
