import { Download, FileSpreadsheet, LoaderCircle } from "lucide-react";
import { useState } from "react";

import { downloadTransactionCsv } from "../api/reportService";
import "../styles/reports.css";

function formatDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

function getCurrentMonthRange() {
  const today = new Date();
  const startDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    1,
  );

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(today),
  };
}

function getFilename(contentDisposition, startDate, endDate) {
  const filenameMatch = contentDisposition?.match(
    /filename="?([^";]+)"?/i,
  );

  return (
    filenameMatch?.[1] ||
    `expensezen-transactions-${startDate}-to-${endDate}.csv`
  );
}

function ReportsPage() {
  const initialRange = getCurrentMonthRange();
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);
  const [type, setType] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleDownload(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (endDate < startDate) {
      setErrorMessage("End date cannot be before start date.");
      return;
    }

    setDownloading(true);

    try {
      const response = await downloadTransactionCsv({
        startDate,
        endDate,
        type,
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");

      link.href = url;
      link.download = getFilename(
        response.headers["content-disposition"],
        startDate,
        endDate,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setSuccessMessage("Your CSV report has been downloaded.");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Unable to download the transaction report.",
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="reports-page">
      <section className="reports-page-header">
        <div>
          <div className="reports-title">
            <FileSpreadsheet size={25} />
            <h1>Reports</h1>
          </div>

          <p>
            Download a CSV file of your income and expenses for
            any date range.
          </p>
        </div>
      </section>

      {successMessage && (
        <div className="reports-success" role="status">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="reports-error" role="alert">
          {errorMessage}
        </div>
      )}

      <section className="reports-card">
        <div className="reports-card-heading">
          <div>
            <h2>Transaction export</h2>
            <p>
              Choose a date range and optionally limit the export
              to income or expenses.
            </p>
          </div>
          <span>CSV</span>
        </div>

        <form className="reports-form" onSubmit={handleDownload}>
          <label>
            <span>Start date</span>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              required
            />
          </label>

          <label>
            <span>End date</span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              required
            />
          </label>

          <label>
            <span>Transaction type</span>
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option value="">All transactions</option>
              <option value="INCOME">Income only</option>
              <option value="EXPENSE">Expenses only</option>
            </select>
          </label>

          <button type="submit" disabled={downloading}>
            {downloading ? (
              <LoaderCircle size={19} className="spin" />
            ) : (
              <Download size={19} />
            )}
            {downloading ? "Preparing report" : "Download CSV"}
          </button>
        </form>

        <p className="reports-note">
          Exports can include up to 366 days of transactions.
        </p>
      </section>
    </div>
  );
}

export default ReportsPage;
