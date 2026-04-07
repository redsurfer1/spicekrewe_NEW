import { Navigate } from 'react-router-dom';

/** Narrow model: legacy specialty hire URL → talent directory. */
export default function HireCulinaryConsultantPage() {
  return <Navigate to="/talent" replace />;
}
