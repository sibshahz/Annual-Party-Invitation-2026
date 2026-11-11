import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { InvitationView } from './components/pages/InvitationView';
import { NotFoundView } from './components/pages/NotFoundView';

/**
 * Defensive redirect preserving query parameters when mistyped URL /chieft-guest is visited.
 */
function ChiefGuestAliasRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/chief-guest${search}`} replace />;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<InvitationView editionSlug="overview" />} />
      <Route path="/chief-guest" element={<InvitationView editionSlug="chief-guest" />} />
      <Route path="/chieft-guest" element={<ChiefGuestAliasRedirect />} />
      <Route path="/farewell" element={<InvitationView editionSlug="farewell" />} />
      <Route path="/welcome" element={<InvitationView editionSlug="welcome" />} />
      <Route path="*" element={<NotFoundView />} />
    </Routes>
  );
}

export default App;

