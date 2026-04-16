import { useEffect, useState } from "react";
import { getAnalyticsSummary, type AnalyticsSummary } from "../api/analyticsApi";

interface AnalyticsDashboardProps {
  token: string;
  labels: {
    title: string;
    totalViews: string;
    uniqueItems: string;
    totalSearches: string;
    viewsOverTime: string;
    topItems: string;
    topSearches: string;
    noData: string;
  };
}

export function AnalyticsDashboard({ token, labels }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getAnalyticsSummary(token)
      .then((result) => { if (!cancelled) { setData(result); setLoading(false); } })
      .catch(() => { if (!cancelled) { setData(null); setLoading(false); } });
    return () => { cancelled = true; };
  }, [token]);

  if (loading) return <p style={{ color: "var(--text-tertiary)" }}>Loading analytics…</p>;
  if (!data) return <p className="comment-no-auth">{labels.noData}</p>;

  const maxViews = Math.max(...data.viewsOverTime.map((d) => d.count), 1);

  return (
    <div className="analytics-dashboard">
      <div className="analytics-cards">
        <div className="analytics-card">
          <div className="stat-value">{data.totalViews}</div>
          <div className="stat-label">{labels.totalViews}</div>
        </div>
        <div className="analytics-card">
          <div className="stat-value">{data.uniqueItems}</div>
          <div className="stat-label">{labels.uniqueItems}</div>
        </div>
        <div className="analytics-card">
          <div className="stat-value">{data.totalSearches}</div>
          <div className="stat-label">{labels.totalSearches}</div>
        </div>
      </div>

      {data.viewsOverTime.length > 0 && (
        <div className="analytics-chart">
          <h3>{labels.viewsOverTime}</h3>
          <div className="analytics-bars">
            {data.viewsOverTime.map((d) => (
              <div
                key={d.date}
                className="bar"
                style={{ height: `${(d.count / maxViews) * 100}%` }}
                title={`${d.date}: ${d.count}`}
              />
            ))}
          </div>
        </div>
      )}

      {data.topItems.length > 0 && (
        <div className="analytics-chart">
          <h3>{labels.topItems}</h3>
          <table className="analytics-table">
            <thead>
              <tr><th>Item</th><th>Views</th></tr>
            </thead>
            <tbody>
              {data.topItems.map((item) => (
                <tr key={item.item_id}>
                  <td>{item.item_id}</td>
                  <td>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.topSearches.length > 0 && (
        <div className="analytics-chart">
          <h3>{labels.topSearches}</h3>
          <table className="analytics-table">
            <thead>
              <tr><th>Term</th><th>Count</th></tr>
            </thead>
            <tbody>
              {data.topSearches.map((s) => (
                <tr key={s.term}>
                  <td>{s.term}</td>
                  <td>{s.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
