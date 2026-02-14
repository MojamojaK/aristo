import { Link } from 'react-router-dom';
import { BASE } from '../config';

export default function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', margin: '10px auto', maxWidth: '600px' }}>
      <h1 style={{ margin: '30px 0', fontSize: '4em', lineHeight: 1, letterSpacing: '-1px' }}>
        404
      </h1>
      <p><strong>Page not found :(</strong></p>
      <p>The requested page could not be found.</p>
      <p style={{ marginTop: '2rem' }}>
        <Link to={`${BASE}/`} style={{ fontSize: '1.2em' }}>
          ホームに戻る
        </Link>
      </p>
    </div>
  );
}
