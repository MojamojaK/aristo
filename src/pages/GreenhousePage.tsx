import { useParams } from 'react-router-dom';
import greenhousePages from '../data/greenhousePages.json';
import { usePageTitle } from '../hooks/usePageTitle';
import type { GreenhousePage as GreenhousePageType } from '../types';

export default function GreenhousePage() {
  const { '*': wildcard } = useParams();
  const url = `/greenhouse/${wildcard}`;
  const page = (greenhousePages as GreenhousePageType[]).find((p) => p.url === url);

  usePageTitle(page?.title);

  if (!page) {
    if (import.meta.env.DEV) {
      console.warn(`[GreenhousePage] No page found for URL: ${url}`);
    }
    return (
      <>
        <h1>Page not found</h1>
        <p>The greenhouse page could not be found.</p>
      </>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">{page.title}</h1>
      {/* Content is build-time generated HTML from author-controlled markdown */}
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
}
