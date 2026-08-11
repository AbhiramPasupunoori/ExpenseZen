import { useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../../styles/dashboard.css";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="application-shell">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="application-content">
        <Topbar
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <div className="application-page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;