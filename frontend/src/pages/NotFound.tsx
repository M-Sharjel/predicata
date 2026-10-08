import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="card">
      <div className="state">
        <span className="ico tone-gray"><Compass size={22} aria-hidden /></span>
        <h3>Page not found</h3>
        <p>The page you are looking for does not exist.</p>
        <Link className="btn btn-primary" to="/dashboard">Back to Overview</Link>
      </div>
    </div>
  );
}
