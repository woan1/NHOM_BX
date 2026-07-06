import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import api from "./api";

function AdminDashboardPage() {
  const [stats, setStats] = useState({
    total_products: 0,
    total_orders: 0,
    total_users: 0,
    total_revenue: 0,
  });

  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      const statsResponse = await api.get("/dashboard/stats");
      const revenueResponse = await api.get("/dashboard/monthly-revenue");

      setStats(statsResponse.data);
      setMonthlyRevenue(revenueResponse.data);
      setError("");
    } catch (err) {
      console.error("Lỗi tải dashboard:", err);
      setError("Bạn cần đăng nhập bằng tài khoản ADMIN để xem dashboard.");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div
      style={{
        padding: "40px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        Admin Dashboard
      </h1>

      {error && (
        <h3 style={{ color: "red", textAlign: "center" }}>{error}</h3>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        <DashboardCard
          title="Total Products"
          value={stats.total_products}
        />

        <DashboardCard
          title="Total Orders"
          value={stats.total_orders}
        />

        <DashboardCard
          title="Total Users"
          value={stats.total_users}
        />

        <DashboardCard
          title="Total Revenue"
          value={`${stats.total_revenue.toLocaleString()} VNĐ`}
        />
      </div>

      <div
        style={{
          backgroundColor: "white",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>Monthly Revenue</h2>

        {monthlyRevenue.length === 0 ? (
          <p>Chưa có dữ liệu doanh thu.</p>
        ) : (
          <div style={{ width: "100%", height: "350px" }}>
            <ResponsiveContainer>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) =>
                    `${Number(value).toLocaleString()} VNĐ`
                  }
                />
                <Bar dataKey="revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardCard({ title, value }) {
  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "25px",
        borderRadius: "12px",
        textAlign: "center",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h3>{title}</h3>

      <h2 style={{ marginTop: "15px" }}>{value}</h2>
    </div>
  );
}

export default AdminDashboardPage;