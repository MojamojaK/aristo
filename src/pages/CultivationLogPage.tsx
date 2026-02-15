import { useParams } from 'react-router-dom';
import cultivationLogs from '../data/cultivationLogs.json';
import { resolveAutoImages, resolveLocalImages } from '../utils/imageResolver';
import { usePageTitle } from '../hooks/usePageTitle';
import type {
  CultivationLog,
  ContentItem,
  NativeHabitat,
  CultivationEnvironment,
  CultivationNote,
  SellerDescription,
} from '../types';

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

function NoteTree({ notes }: { notes: CultivationNote[] }) {
  return (
    <ul>
      {notes.map((note, i) => (
        <li key={i}>
          {note.text}
          {note.children && <NoteTree notes={note.children} />}
        </li>
      ))}
    </ul>
  );
}

function CultivationField({
  label,
  note,
}: {
  label: string;
  note: CultivationNote;
}) {
  return (
    <li>
      {label}: {note.text}
      {note.children && <NoteTree notes={note.children} />}
    </li>
  );
}

function NativeHabitatSection({ habitat }: { habitat: NativeHabitat }) {
  return (
    <>
      <h3>自生地</h3>
      <ul>
        {habitat.locations.map((loc, i) => (
          <li key={i}>
            {loc.name}
            {loc.maps.length > 0 && (
              <ul>
                {loc.maps.map((src, j) => (
                  <li key={j}>
                    <iframe
                      src={src}
                      width="100%"
                      height={loc.maps.length > 1 ? '250' : '450'}
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`${loc.name} map ${j + 1}`}
                    />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
        {habitat.elevation && <li>標高: {habitat.elevation}</li>}
        {habitat.temperature && <li>温度: {habitat.temperature}</li>}
      </ul>
    </>
  );
}

function CultivationEnvironmentSection({
  env,
}: {
  env: CultivationEnvironment;
}) {
  return (
    <>
      <h3>栽培環境</h3>
      <ul>
        {env.temperatureTheory !== undefined && (
          <li>温度理論値: {env.temperatureTheory}</li>
        )}
        {env.temperature && (
          <CultivationField label="温度" note={env.temperature} />
        )}
        {env.humidity && (
          <CultivationField label="空中湿度" note={env.humidity} />
        )}
        {env.soil && <CultivationField label="用土" note={env.soil} />}
        {env.light && <CultivationField label="日照" note={env.light} />}
      </ul>
    </>
  );
}

function SellerDescriptionSection({ desc }: { desc: SellerDescription }) {
  return (
    <>
      <h3>販売者情報</h3>
      <ul>
        <li>
          以下、{desc.source}より引用
          <blockquote>
            {desc.quote.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </blockquote>
        </li>
        {desc.notes.map((note, i) => (
          <li key={i}>{note}</li>
        ))}
      </ul>
    </>
  );
}

export default function CultivationLogPage() {
  const { slug } = useParams<{ slug: string }>();
  const log = (cultivationLogs as CultivationLog[]).find(
    (l) => l.slug === slug,
  );

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
    logData.entries.map((entry) => entry.date),
  );
  const lastUpdated = allDates.length > 0 ? allDates.sort().reverse()[0] : null;

  return (
    <>
      <h1>{log.name}</h1>

      {log.alias && <h2>{log.alias}</h2>}

      {lastUpdated && <p className="post-date">最終更新: {lastUpdated}</p>}

      {log.nativeHabitat ||
      log.cultivationEnvironment ||
      log.sellerDescription ? (
        <>
          <h2>特徴</h2>
          {log.nativeHabitat && (
            <NativeHabitatSection habitat={log.nativeHabitat} />
          )}
          {log.cultivationEnvironment && (
            <CultivationEnvironmentSection env={log.cultivationEnvironment} />
          )}
          {log.sellerDescription && (
            <SellerDescriptionSection desc={log.sellerDescription} />
          )}
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
                )),
              )}
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
}
