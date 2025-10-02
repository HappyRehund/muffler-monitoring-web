import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/auth-context";
import LoginPage from "./pages/login-page";
import ProtectedRoute from "./components/protected-route";
import Layout from "./components/layout";
import IncidentsListPage from "./pages/incidents-list-page";
import IncidentDetailPage from "./pages/incident-detail-page";


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/incidents" replace />} />
            <Route path="incidents" element={<IncidentsListPage />} />
            <Route path="incidents/:id" element={<IncidentDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;