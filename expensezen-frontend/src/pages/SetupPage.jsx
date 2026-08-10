import { useEffect, useState } from "react";
import { Activity, CircleCheck, CircleX, WalletCards } from "lucide-react";
import { Link } from "react-router";
import { checkBackendHealth } from "../api/healthService";

function SetupPage() {
  const [status, setStatus] = useState("checking");
  const [backendData, setBackendData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function verifyBackend() {
      try {
        const data = await checkBackendHealth();

        if (active) {
          setBackendData(data);
          setStatus("connected");
        }
      } catch (error) {
        if (active) {
          setStatus("disconnected");
          setErrorMessage(
            error.response?.data?.message ||
              "Could not connect to the ExpenseZen backend.",
          );
        }
      }
    }

    verifyBackend();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="setup-page">
      <section className="setup-card">
        <div className="brand">
          <div className="brand-icon">
            <WalletCards size={30} />
          </div>

          <div>
            <h1>ExpenseZen</h1>
            <p>Track smarter. Spend better.</p>
          </div>
        </div>

        <div className={`connection-box ${status}`}>
          {status === "checking" && (
            <>
              <Activity className="spin" />
              <div>
                <h2>Connecting to backend</h2>
                <p>Checking the Spring Boot API...</p>
              </div>
            </>
          )}

          {status === "connected" && (
            <>
              <CircleCheck />
              <div>
                <h2>Frontend and backend connected</h2>
                <p>{backendData?.message}</p>
              </div>
            </>
          )}

          {status === "disconnected" && (
            <>
              <CircleX />
              <div>
                <h2>Backend connection failed</h2>
                <p>{errorMessage}</p>
              </div>
            </>
          )}
        </div>

        <div className="setup-information">
          <div>
            <span>Frontend</span>
            <strong>React + Vite</strong>
          </div>

          <div>
            <span>Backend</span>
            <strong>Spring Boot</strong>
          </div>

          <div>
            <span>Database</span>
            <strong>MySQL</strong>
          </div>
        </div>

        <div className="setup-actions">
          <Link to="/login" className="primary-button">
            Login
          </Link>

          <Link to="/register" className="secondary-button">
            Create account
          </Link>
        </div>

        <p className="phase-note">
          Login and registration pages will be developed in Phase 11.
        </p>
      </section>
    </main>
  );
}

export default SetupPage;