import React, { useState, useMemo } from "react";

/* ----------------------------------------------
   MOCK DATA GENERATORS
---------------------------------------------- */
const generateMockData = (keyword, timePeriod, shift, date) => {
  const baseMultiplier = keyword === "All" ? 1 : 0.8 + Math.random() * 0.4;
  const timeMultiplier =
    timePeriod === "Morning" ? 1.1 : timePeriod === "Evening" ? 0.9 : 1;
  const shiftMultiplier = 1 + (shift - 2) * 0.05;

  const overallSOS = (
    15.7 *
    baseMultiplier *
    timeMultiplier *
    shiftMultiplier
  ).toFixed(2);

  const organicSOS = (
    12.74 *
    baseMultiplier *
    timeMultiplier *
    shiftMultiplier
  ).toFixed(2);

  const adSOS = (
    2.96 *
    baseMultiplier *
    timeMultiplier *
    shiftMultiplier
  ).toFixed(2);

  return {
    overallSOS: parseFloat(overallSOS),
    organicSOS: parseFloat(organicSOS),
    adSOS: parseFloat(adSOS),
    vsShift3Overall: (
      ((overallSOS - 15.7) / 15.7) *
      100
    ).toFixed(2),
    vsShift3Organic: (
      ((organicSOS - 12.74) / 12.74) *
      100
    ).toFixed(2),
    vsShift3Ad: (((adSOS - 2.96) / 2.96) * 100).toFixed(2),
  };
};

/* ----------------------------------------------
   SEARCH TERM TABLE DATA (HARDCODED)
---------------------------------------------- */
const generateTableData = (keyword, timePeriod, shift, date) => {
  const baseData = [
    { term: "lip balm", campaigns: 8, spends: 24647.8, sales: 11217, ctr: 0.9, adType: "SP", totalImpr: 0, organicRank: 0.5, organicSOV: 0, roas: 0.5, imprShare: 0 },
    { term: "face wash man", campaigns: 7, spends: 21635.6, sales: 16991.8, ctr: 0.2, adType: "SP", totalImpr: 0, organicRank: 0.8, organicSOV: 0, roas: 0.8, imprShare: 0 },
    { term: "nivea face wash for men", campaigns: 4, spends: 15731.3, sales: 39175.8, ctr: 4.4, adType: "SP", totalImpr: 0, organicRank: 2.5, organicSOV: 0, roas: 2.5, imprShare: 0 },
    { term: "lip balm spf 50", campaigns: 6, spends: 12460.3, sales: 4819, ctr: 0.8, adType: "SP", totalImpr: 0, organicRank: 0.4, organicSOV: 0, roas: 0.4, imprShare: 0 },
    { term: "lip balm for dark lips", campaigns: 6, spends: 7472.3, sales: 2005.4, ctr: 0.8, adType: "SP", totalImpr: 0, organicRank: 0.3, organicSOV: 0, roas: 0.3, imprShare: 0 },
    { term: "garnier men facewash", campaigns: 4, spends: 7189.4, sales: 7997.2, ctr: 0.3, adType: "SP", totalImpr: 0, organicRank: 1.1, organicSOV: 0, roas: 1.1, imprShare: 0 },
    { term: "nivea face wash", campaigns: 4, spends: 3688.7, sales: 10303.5, ctr: 1.9, adType: "SP", totalImpr: 0, organicRank: 2.8, organicSOV: 0, roas: 2.8, imprShare: 0 },
    { term: "nivea face wash men", campaigns: 1, spends: 3301.4, sales: 11547.5, ctr: 4.7, adType: "SB", totalImpr: 0, organicRank: 3.5, organicSOV: 0, roas: 3.5, imprShare: 0 },
    { term: "face wash", campaigns: 7, spends: 3269.7, sales: 386.5, ctr: 0.5, adType: "SP", totalImpr: 0, organicRank: 0.1, organicSOV: 0, roas: 0.1, imprShare: 0 },
    { term: "nivea moisturizer cream", campaigns: 6, spends: 2816.2, sales: 1686.5, ctr: 0.2, adType: "SP", totalImpr: 0, organicRank: 0.6, organicSOV: 0, roas: 0.6, imprShare: 0 },
    { term: "retinol face serum", campaigns: 1, spends: 2794.8, sales: 640.7, ctr: 0.3, adType: "SP", totalImpr: 0, organicRank: 0.2, organicSOV: 0, roas: 0.2, imprShare: 0 },
    { term: "lip balm dry lips", campaigns: 6, spends: 2766.8, sales: 1150, ctr: 0.9, adType: "SP", totalImpr: 0, organicRank: 0.4, organicSOV: 0, roas: 0.4, imprShare: 0 },
  ];

  return baseData.map((item) => ({
    ...item,
    ctrChange: -53.3,
    spendsChange: -62,
    salesChange: -75,
    roasChange: -33.8,
  }));
};

/* ----------------------------------------------
   TREND ICONS
---------------------------------------------- */
const TrendingUp = ({ size = 14 }) => (
  <span style={{ color: "#16a34a", fontSize: size }}>▲</span>
);

const TrendingDown = ({ size = 14 }) => (
  <span style={{ color: "#dc2626", fontSize: size }}>▼</span>
);

/* ----------------------------------------------
   FORMAT NUMBER
---------------------------------------------- */
const formatNumber = (num) =>
  num?.toLocaleString("en-US", { maximumFractionDigits: 1 });

/* ----------------------------------------------
   MAIN COMPONENT
---------------------------------------------- */
const Dashboard = () => {
  const [filters, setFilters] = useState({
    brand: "All",
    keyword: "All",
    timePeriod: "All",
    shift: 3,
    date: "2024-12-10",
  });

  const tableData = useMemo(
    () =>
      generateTableData(
        filters.keyword,
        filters.timePeriod,
        filters.shift,
        filters.date
      ),
    [filters]
  );

  return (
    <div style={{ padding: 20 }}>
      {/* ------------------------- TABLE ------------------------- */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ minWidth: 180 }}>SEARCH TERM</th>
              <th style={{ minWidth: 120 }}># CAMPAIGNS</th>
              <th style={{ minWidth: 140 }}>IMPR. % SHARE</th>
              <th style={{ minWidth: 140 }}>ORGANIC SOV</th>
              <th style={{ minWidth: 130 }}>↓ SPENDS</th>
              <th style={{ minWidth: 120 }}>SALES</th>
              <th style={{ minWidth: 110 }}>CTR</th>
              <th style={{ minWidth: 110 }}>AD TYPE</th>
              <th style={{ minWidth: 130 }}>TOTAL IMPR.</th>
              <th style={{ minWidth: 130 }}>ORGANIC RANK</th>
              <th style={{ minWidth: 110 }}>ROAS</th>
            </tr>
          </thead>

          <tbody>
            {tableData.map((row, idx) => (
              <tr key={idx}>
                <td>{row.term}</td>
                <td>{row.campaigns}</td>

                <td>
                  <div className="cell-content">
                    <span style={{ color: "#f59e0b" }}>∞</span>
                    <span className="base-value">0% -</span>
                  </div>
                </td>

                <td>
                  <div className="cell-content">
                    <span>0%</span>
                    <span className="base-value">0% -</span>
                  </div>
                </td>

                <td>
                  <div className="cell-content">
                    <span className="negative">{row.spendsChange}% <TrendingDown /></span>
                    <span className="base-value">₹ {formatNumber(row.spends)}</span>
                  </div>
                </td>

                <td>
                  <div className="cell-content">
                    <span className="negative">{row.salesChange}% <TrendingDown /></span>
                    <span className="base-value">₹ {formatNumber(row.sales)}</span>
                  </div>
                </td>

                <td>
                  <div className="cell-content">
                    <span className="negative">{row.ctrChange}%</span>
                    <span className="base-value">{row.ctr}%</span>
                  </div>
                </td>

                <td><span className="chip">{row.adType}</span></td>

                <td>
                  <div className="cell-content">
                    <span className="warning">0% -</span>
                    <span className="base-value">{row.totalImpr}</span>
                  </div>
                </td>

                <td>
                  <div className="cell-content">
                    <span className="warning">0% -</span>
                    <span className="base-value">{row.organicRank}</span>
                  </div>
                </td>

                <td>
                  <div className="cell-content">
                    <span className="negative">{row.roasChange}% <TrendingDown /></span>
                    <span className="base-value">{row.roas}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* styles */}
      <style>{`
        .table-container {
          background: white;
          border-radius: 8px;
          overflow-x: auto;
          overflow-y: hidden;
          white-space: nowrap;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          margin-top: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1400px;
        }
        th {
          padding: 10px;
          font-size: 11px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }
        td {
          padding: 10px;
          border-bottom: 1px solid #f3f4f6;
          font-size: 13px;
        }
        .cell-content {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .base-value {
          font-size: 11px;
          color: #6b7280;
        }
        .negative { color: #dc2626; font-weight: 600; }
        .chip {
          background: #dbeafe;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
          color: #1e40af;
        }
        .warning { color: #f59e0b; }
      `}</style>
    </div>
  );
};

export default Dashboard;
