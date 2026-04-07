import { Navigate } from 'react-router-dom';

/** Narrow model: legacy specialty hire URL → talent directory. */
export default function HireFoodStylistPage() {
  return <Navigate to="/talent" replace />;
}
