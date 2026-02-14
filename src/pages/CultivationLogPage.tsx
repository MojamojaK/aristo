import { useParams } from 'react-router-dom';
import cultivationLogs from '../data/cultivationLogs.json';
import imageManifest from '../data/imageManifest.json';
import type { CultivationLog, ContentItem } from '../types';

const manifest = imageManifest as Record<string, string[]>;

function findImages(genus: string, imageId: string, date: string): string[] {
  const key = `${genus}/${imageId}/${date}`;
  return manifest[key] || [];
}

function ImageGallery({
  genus,
  item,
  date,
}: {
  genus: string;
  item: ContentItem;
  date: string;
}) {
  if (item.auto_image) {
    const imagePaths = findImages(genus, item.auto_image.id, date);
    if (imagePaths.length === 0) return null;
    return (
      <span>
        {imagePaths.map((path, idx) => (
          <span key={path}>
            {item.auto_image?.line_breaks?.includes(idx) && <br />}
            <a href={path} target="_blank" rel="noreferrer">
              <img className="log-image" src={path} alt="" />
            </a>
          </span>
        ))}
      </span>
    );
  }

  if (item.local_images) {
    return (
      <span>
        {item.local_images.map((imagePath) => {
          const key = imagePath.replace(/\.[^.]+$/, '');
          const paths = manifest[key] || [`/aristo/assets/images/${imagePath}`];
          return paths.map((path) => (
            <a key={path} href={path} target="_blank" rel="noreferrer">
              <img className="log-image" src={path} alt="" />
            </a>
          ));
        })}
      </span>
    );
  }

  return null;
}

export default function CultivationLogPage() {
  const { slug } = useParams<{ slug: string }>();
  const log = (cultivationLogs as CultivationLog[]).find((l) => l.slug === slug);

  if (!log) {
    return (
      <>
        <h1>Page not found</h1>
        <p>The cultivation log &quot;{slug}&quot; could not be found.</p>
      </>
    );
  }

  return (
    <>
      <h1>{log.name}</h1>

      {log.alias && <h2>{log.alias}</h2>}

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
