import { Route, Routes } from "react-router";
import SetupPage from "./pages/SetupPage";
import NotFoundPage from "./pages/NotFoundPage";

function PlaceholderPage({ title }) {
  return (
    <main className="placeholder-page">
      <div>
        <h1>{title}</h1>
        <p>This page will be created in Phase 11.</p>
      </div>
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<SetupPage />} />

      <Route
        path="/login"
        element={<PlaceholderPage title="Login" />}
      />

      <Route
        path="/register"
        element={<PlaceholderPage title="Create account" />}
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;