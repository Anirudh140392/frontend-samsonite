import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Mock data generator
const generateMockData = (keyword, timePeriod, shift, date) => {
  const baseMultiplier = keyword === 'All' ? 1 : 0.8 + Math.random() * 0.4;
  const timeMultiplier = timePeriod === 'Morning' ? 1.1 : timePeriod === 'Evening' ? 0.9 : 1;
  const shiftMultiplier = 1 + (shift - 2) * 0.05;
  
  const overallSOS = (15.7 * baseMultiplier * timeMultiplier * shiftMultiplier).toFixed(2);
  const organicSOS = (12.74 * baseMultiplier * timeMultiplier * shiftMultiplier).toFixed(2);
  const adSOS = (2.96 * baseMultiplier * timeMultiplier * shiftMultiplier).toFixed(2);
  
  const vsShift3Overall = ((overallSOS - 15.7) / 15.7 * 100).toFixed(2);
  const vsShift3Organic = ((organicSOS - 12.74) / 12.74 * 100).toFixed(2);
  const vsShift3Ad = ((adSOS - 2.96) / 2.96 * 100).toFixed(2);
  
  return {
    overallSOS: parseFloat(overallSOS),
    organicSOS: parseFloat(organicSOS),
    adSOS: parseFloat(adSOS),
    vsShift3Overall: parseFloat(vsShift3Overall),
    vsShift3Organic: parseFloat(vsShift3Organic),
    vsShift3Ad: parseFloat(vsShift3Ad)
  };
};

const generateTableData = (keyword, timePeriod, shift, date) => {
 const searchTerms = [
  {
    id: 1,
    term: "lip balm",
    campaigns: 8,
    clicks: 1200,
    impressions: 54000,
    imprShare: "∞",
    organicSOV: "12%",
    spends: 24647.8,
    spendsChange: -62,
    sales: 11217,
    salesChange: -75,
    ctr: 0.9,
    ctrChange: -75,
    adType: "SP",
    totalImpr: 54000,
    organicRank: 0.5,
    roas: 0.5,
    roasChange: -33.3,
  },
  {
    id: 2,
    term: "face wash man",
    campaigns: 7,
    clicks: 850,
    impressions: 31200,
    imprShare: "∞",
    organicSOV: "8%",
    spends: 21635.6,
    spendsChange: 9.4,
    sales: 16991.8,
    salesChange: 15.5,
    ctr: 0.2,
    ctrChange: -52.3,
    adType: "SP",
    totalImpr: 31200,
    organicRank: 0.8,
    roas: 0.8,
    roasChange: 6.8,
  },
  {
    id: 3,
    term: "nivea face wash for men",
    campaigns: 4,
    clicks: 2100,
    impressions: 88000,
    imprShare: "∞",
    organicSOV: "16%",
    spends: 15731.3,
    spendsChange: -53.6,
    sales: 39175.8,
    salesChange: -67.7,
    ctr: 4.4,
    ctrChange: 12.2,
    adType: "SP",
    totalImpr: 88000,
    organicRank: 2.5,
    roas: 2.5,
    roasChange: -30.4,
  },
  {
    id: 4,
    term: "lip balm spf 50",
    campaigns: 6,
    clicks: 650,
    impressions: 28900,
    imprShare: "∞",
    organicSOV: "5%",
    spends: 12460.3,
    spendsChange: -46.1,
    sales: 4819,
    salesChange: -64.3,
    ctr: 0.8,
    ctrChange: -4.5,
    adType: "SP",
    totalImpr: 28900,
    organicRank: 0.4,
    roas: 0.4,
    roasChange: -32.8,
  },
  {
    id: 5,
    term: "lip balm for dark lips",
    campaigns: 6,
    clicks: 440,
    impressions: 21400,
    imprShare: "∞",
    organicSOV: "4%",
    spends: 7472.3,
    spendsChange: -33.3,
    sales: 2005.4,
    salesChange: -31.7,
    ctr: 0.8,
    ctrChange: -20.4,
    adType: "SP",
    totalImpr: 21400,
    organicRank: 0.3,
    roas: 0.3,
    roasChange: 3.9,
  },
  {
    id: 6,
    term: "garnier men facewash",
    campaigns: 4,
    clicks: 980,
    impressions: 47200,
    imprShare: "∞",
    organicSOV: "10%",
    spends: 7189.4,
    spendsChange: -27.4,
    sales: 7997.2,
    salesChange: -49.7,
    ctr: 0.3,
    ctrChange: -19.4,
    adType: "SP",
    totalImpr: 47200,
    organicRank: 1.1,
    roas: 1.1,
    roasChange: 26.1,
  },
  {
    id: 7,
    term: "nivea face wash",
    campaigns: 4,
    clicks: 1600,
    impressions: 69000,
    imprShare: "∞",
    organicSOV: "14%",
    spends: 3688.7,
    spendsChange: -27.4,
    sales: 10303.5,
    salesChange: -23.8,
    ctr: 1.9,
    ctrChange: 4.5,
    adType: "SP",
    totalImpr: 69000,
    organicRank: 2.8,
    roas: 2.8,
    roasChange: 4.9,
  },
  {
    id: 8,
    term: "face wash",
    campaigns: 7,
    clicks: 300,
    impressions: 15200,
    imprShare: "∞",
    organicSOV: "3%",
    spends: 3269.7,
    spendsChange: -10,
    sales: 386.5,
    salesChange: -90.3,
    ctr: 0.5,
    ctrChange: -23.7,
    adType: "SP",
    totalImpr: 15200,
    organicRank: 0.1,
    roas: 0.1,
    roasChange: -89,
  },
  {
    id: 9,
    term: "nivea moisturizer cream",
    campaigns: 6,
    clicks: 480,
    impressions: 24100,
    imprShare: "∞",
    organicSOV: "6%",
    spends: 2816.2,
    spendsChange: -50.6,
    sales: 1686.5,
    salesChange: -80.8,
    ctr: 0.2,
    ctrChange: 35.7,
    adType: "SP",
    totalImpr: 24100,
    organicRank: 0.6,
    roas: 0.6,
    roasChange: -61.3,
  },
  {
    id: 10,
    term: "retinol face serum",
    campaigns: 1,
    clicks: 190,
    impressions: 7200,
    imprShare: "∞",
    organicSOV: "2%",
    spends: 2794.8,
    spendsChange: -41,
    sales: 640.7,
    salesChange: -50.7,
    ctr: 0.3,
    ctrChange: -82.8,
    adType: "SP",
    totalImpr: 7200,
    organicRank: 0.2,
    roas: 0.2,
    roasChange: 64.3,
  },
];


  const multiplier = keyword === 'All' ? 1 : 0.7 + Math.random() * 0.6;
  const timeMultiplier = timePeriod === 'Morning' ? 1.2 : timePeriod === 'Evening' ? 0.8 : 1;
  const shiftMultiplier = 1 + (shift - 2) * 0.1;
  
  return searchTerms.map(item => {
    const changeMultiplier = multiplier * timeMultiplier * shiftMultiplier;
    const ctrChange = ((changeMultiplier - 1) * 100 - 53.3).toFixed(1);
    const adChange = ((changeMultiplier - 1) * 100 - 4.6).toFixed(1);
    const roasChange = ((changeMultiplier - 1) * 100 - 33.8).toFixed(1);
    
    return {
      ...item,
      ctrChange: parseFloat(ctrChange),
      adChange: parseFloat(adChange),
      roasChange: parseFloat(roasChange),
      organicRank: 0,
      organicRankChange: 0
    };
  });
};

const MetricCard = ({ title, value, change, subtitle }) => {
  const isPositive = change > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  
  return (
    <div className="metric-card">
      <div className="metric-title">{title}</div>
      <div className="metric-value">{value}%</div>
      <div className="metric-change">
        <TrendIcon 
          size={30} 
          color={isPositive ? '#16a34a' : '#dc2626'} 
        />
        <span style={{ color: isPositive ? '#16a34a' : '#dc2626' }}>
          {change > 0 ? '+' : ''}{change}% {subtitle}
        </span>
      </div>
    </div>
  );
};

const Visibility = () => {
  const [filters, setFilters] = useState({
    keyword: 'All',
    timePeriod: 'All',
    shift: 3,
    date: '2024-12-10'
  });
  
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const metricsData = useMemo(() => 
    generateMockData(filters.keyword, filters.timePeriod, filters.shift, filters.date),
    [filters]
  );
  
  const tableData = useMemo(() =>
    generateTableData(filters.keyword, filters.timePeriod, filters.shift, filters.date),
    [filters]
  );
  
  return (
    <div className="dashboard">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .dashboard {
          padding: 24px;
          background-color: #f5f5f5;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        
        .header {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 24px;
          color: #1a1a1a;
        }
        
        .filters {
  display: grid;
 grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

        
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .filter-label {
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }
        
        .filter-select {
          padding: 8px 12px;
          border: 1px solid #d0d0d0;
          border-radius: 4px;
          background: white;
          font-size: 14px;
          min-width: 150px;
          cursor: pointer;
        }
        
        .filter-select:focus {
          outline: 2px solid #1976d2;
          outline-offset: 0;
        }
        
        .metrics-container {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
          overflow-x: auto;
        }
        
        .metric-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          min-width: 400px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        
        }
        
        .metric-title {
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }
        
        .metric-value {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 8px;
          color: #1a1a1a;
        }
        
        .metric-change {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .section-title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 16px;
          color: #1a1a1a;
        }
        
        .table-container {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th {
          background: #f5f5f5;
          padding: 12px 16px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
        }
        
        td {
          padding: 12px 16px;
          border-top: 1px solid #e0e0e0;
          font-size: 14px;
        }
        
        tr:hover {
          background: #f9f9f9;
        }
        
        .search-term {
          color: #1976d2;
          cursor: pointer;
        }
        
        .search-term:hover {
          text-decoration: underline;
        }
        
        .metric-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .change-value {
          font-weight: 500;
        }
        
        .base-value {
          font-size: 12px;
          color: #666;
        }
        
        .chip {
          display: inline-block;
          padding: 4px 12px;
          background: #e3f2fd;
          color: #1976d2;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .change-with-icon {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .positive {
          color: #16a34a;
        }
        
        .negative {
          color: #dc2626;
        }
        
        .warning {
          color: #f59e0b;
        }
        
        th:nth-child(n+2) {
          text-align: center;
        }
        
        td:nth-child(n+2) {
          text-align: center;
        }
      `}</style>
      
      <div className="header">SOS ANALYSIS</div>
      
      <div className="filters">
        <div className="filter-group">
          <label className="filter-label">Brand</label>
          <select 
            className="filter-select"
            value={filters.keyword}
            onChange={(e) => handleFilterChange('keyword', e.target.value)}
          >
            <option value="All">All</option>
            <option value="ARISTOCRAT">ARISTOCRAT</option>
            <option value="Mokobara">Mokobara</option>
            <option value="NASHER MILES">NASHER MILES</option>
            <option value="SAFARI">SAFARI</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label className="filter-label">Keyword</label>
          <select 
            className="filter-select"
            value={filters.keyword}
            onChange={(e) => handleFilterChange('keyword', e.target.value)}
          >
            <option value="All">All</option>
            <option value="trolley bag">trolley bag</option>
            <option value="vip trolley">vip trolley</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label className="filter-label">Time Period</label>
          <select 
            className="filter-select"
            value={filters.timePeriod}
            onChange={(e) => handleFilterChange('timePeriod', e.target.value)}
          >
            <option value="All">All</option>
            <option value="Morning">Morning</option>
            <option value="Evening">Evening</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label className="filter-label">Shift</label>
          <select 
            className="filter-select"
            value={filters.shift}
            onChange={(e) => handleFilterChange('shift', parseInt(e.target.value))}
          >
            <option value={1}>Shift 1</option>
            <option value={2}>Shift 2</option>
            <option value={3}>Shift 3</option>
            <option value={4}>Shift 4</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label className="filter-label">Date</label>
          <select 
            className="filter-select"
            value={filters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
          >
            <option value="2024-12-10">Wednesday, December 10</option>
            <option value="2024-12-09">Tuesday, December 09</option>
            <option value="2024-12-08">Monday, December 08</option>
          </select>
        </div>
      </div>
      
      <div className="metrics-container">
        <MetricCard 
          title="Overall SOS"
          value={metricsData.overallSOS}
          change={metricsData.vsShift3Overall}
          subtitle="vs Shift 3"
        />
        <MetricCard 
          title="Organic SOS"
          value={metricsData.organicSOS}
          change={metricsData.vsShift3Organic}
          subtitle="vs Shift 3"
        />
        <MetricCard 
          title="Ad SOS"
          value={metricsData.adSOS}
          change={metricsData.vsShift3Ad}
          subtitle="vs Shift 3"
        />
      </div>
      
      <div className="section-title">Search Term Analytics</div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>SEARCH TERM</th>
              <th>CAMPAIGNS</th>
              <th>CTR</th>
              <th>AD TYPE</th>
              <th>TOTAL IMPR.</th>
              <th>ORGANIC RANK</th>
              <th>ROAS</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index}>
                <td>
                  <span className="search-term">{row.term}</span>
                </td>
              
                 <td>
                  <span className="campaigns">{row.campaigns}</span>
                </td>
                <td>
                  <div className="metric-cell">
                    <span className={`change-value ${row.ctrChange > 0 ? 'positive' : 'negative'}`}>
                      {row.ctrChange > 0 ? '+' : ''}{row.ctrChange}%
                    </span>
                    <span className="base-value">{row.ctr}%</span>
                  </div>
                </td>
                <td>
                  <span className="chip">{row.adType}</span>
                </td>
                <td>
                  <div className="metric-cell">
                    <span className="change-value warning">0% -</span>
                    <span className="base-value">{row.impr}</span>
                  </div>
                </td>
                <td>
                  <div className="metric-cell">
                    <span className="change-value warning">0% -</span>
                    <span className="base-value">{row.organicRank}</span>
                  </div>
                </td>
                <td>
                  <div className="metric-cell">
                    <div className="change-with-icon">
                      <span className={`change-value ${row.roasChange > 0 ? 'positive' : 'negative'}`}>
                        {row.roasChange > 0 ? '+' : ''}{row.roasChange}%
                      </span>
                      {row.roasChange > 0 ? 
                        <TrendingUp size={16} color="#16a34a" /> : 
                        <TrendingDown size={16} color="#dc2626" />
                      }
                    </div>
                    <span className="base-value">{row.roas}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Visibility;