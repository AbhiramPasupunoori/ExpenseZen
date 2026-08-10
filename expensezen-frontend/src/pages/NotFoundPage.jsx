import { Link } from "react-router";

function NotFoundPage() {
  return (
    <main className="not-found-page">
      <div>
        <h1>404</h1>
        <p>The requested ExpenseZen page was not found.</p>

        <Link to="/" className="primary-button">
          Return home
        </Link>
      </div>
    </main>
  );
}

export default NotFoundPage;