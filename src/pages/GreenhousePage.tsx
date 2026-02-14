import { useParams } from 'react-router-dom';
import greenhousePages from '../data/greenhousePages.json';
import type { GreenhousePage as GreenhousePageType } from '../types';

export default function GreenhousePage() {
  const { '*': wildcard } = useParams();
  const url = `/greenhouse/${wildcard}`;
  const page = (greenhousePages as GreenhousePageType[]).find((p) => p.url === url);

  if (!page) {
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
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
}
