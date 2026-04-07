import { Navigate } from 'react-router-dom';

/** Narrow model: dynamic /hire/:specialty (e.g. recipe-developer) → talent directory. */
export default function HireSpecialtyPage() {
  return <Navigate to="/talent" replace />;
}
