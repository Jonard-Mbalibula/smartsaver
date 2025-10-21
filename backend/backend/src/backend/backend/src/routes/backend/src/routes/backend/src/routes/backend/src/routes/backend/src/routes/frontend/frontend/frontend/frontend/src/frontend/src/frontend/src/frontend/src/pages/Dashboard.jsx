import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

function Dashboard() {
  const [feed, setFeed] = useState([]);
  const [metrics, setMetrics] = useState({
    savings: 0,
    loans: 0,
    members: 0
  });

  useEffect(() => {
    axios.get("http://localhost:5000/api/feed").then(res => setFeed(res.data));
    axios.get("http://localhost:5000/api/contributions").then(res => {
      const total = res.data.reduce((sum, c) => sum + c.amount, 0);
      setMetrics(m => ({ ...m, savings: total }));
    });
    axios.get("http://localhost:5000/api/loans").then(res => {
      setMetrics(m => ({ ...m, loans: res.data.length }));
    });
    axios.get("http://localhost:5000/api/members").then(res => {
      setMetrics(m => ({ ...m, members: res.data.length }));
    });
  }, []);

  const data = [
    { name: "Savings", value: metrics.savings },
    { name: "Loans", value: metrics.loans }
  ];
  const COLORS = ["#0088FE", "#FF8042"];

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Total Members: {metrics.members}</p>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={80}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      <h3>Recent Activity</h3>
      <ul>
        {feed.map((f, i) => (
          <li key={i}>
            {f.type} → Member {f.member_id} : {f.amount} ({f.date})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
