import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "./api";

function AdminDashboardPage() {
  const navigate = useNavigate();

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser"));
    } catch (error) {
      console.error("Không thể đọc currentUser:", error);
      return null;
    }
  }, []);

  const [stats, setStats] = useState({
    total_products: 0,
    total_orders: 0,
    total_users: 0,
    total_revenue: 0,
  });

  const [revenueType, setRevenueType] = useState("month");
  const [revenueData, setRevenueData] = useState([]);

  const [trafficType, setTrafficType] = useState("day");
  const [trafficData, setTrafficData] = useState([]);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatPrice = (price) => {
    return `${Number(price || 0).toLocaleString("vi-VN")} đ`;
  };

  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString("vi-VN");
  };

  const isAdmin = ["ADMIN", "admin"].includes(currentUser?.role);

  const getTodayPeriod = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const trafficSummary = useMemo(() => {
    const totalWebsiteVisits = trafficData.reduce(
      (total, item) => total + Number(item.website_visits || 0),
      0
    );

    const totalOrderViews = trafficData.reduce(
      (total, item) => total + Number(item.order_views || 0),
      0
    );

    const todayItem =
      trafficType === "day"
        ? trafficData.find((item) => item.period === getTodayPeriod())
        : null;

    return {
      totalWebsiteVisits,
      totalOrderViews,
      visitsToday: Number(todayItem?.website_visits || 0),
    };
  }, [trafficData, trafficType]);

  useEffect(() => {
    if (!currentUser || !isAdmin) {
      alert("Bạn không có quyền truy cập trang Admin Dashboard.");
      navigate("/");
      return;
    }

    fetchDashboardData();
  }, [revenueType, trafficType]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [statsRes, revenueRes, trafficRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get(`/dashboard/revenue?group_by=${revenueType}`),
        api.get(`/dashboard/traffic?group_by=${trafficType}`),
      ]);

      setStats(statsRes.data || {});

      setRevenueData(
        Array.isArray(revenueRes.data) ? revenueRes.data : []
      );

      setTrafficData(
        Array.isArray(trafficRes.data)
          ? trafficRes.data
          : Array.isArray(trafficRes.data?.traffic)
          ? trafficRes.data.traffic
          : []
      );

      try {
        const ordersRes = await api.get("/orders");

        const orderList = Array.isArray(ordersRes.data)
          ? ordersRes.data
          : Array.isArray(ordersRes.data?.orders)
          ? ordersRes.data.orders
          : [];

        setOrders(orderList.slice(0, 5));
      } catch (ordersError) {
        console.error("Lỗi tải đơn hàng mới:", ordersError);
        setOrders([]);
      }
    } catch (error) {
      console.error("Lỗi tải Dashboard:", error);

      if (error.response?.status === 401) {
        alert(
          "Bạn chưa đăng nhập hoặc token đã hết hạn. Vui lòng đăng nhập lại."
        );
      } else if (error.response?.status === 403) {
        alert("Tài khoản của bạn không có quyền ADMIN.");
      } else {
        alert(
          "Không tải được Dashboard. Hãy kiểm tra backend và token Admin."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const buttonStyle = (isActive) => ({
    ...styles.filterBtn,
    ...(isActive ? styles.activeFilterBtn : {}),
  });

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <Link to="/" style={styles.logo}>
          <div style={styles.logoBox}>S</div>

          <h1 style={styles.logoText}>
            Shop<span style={{ color: "#1769ff" }}>Hub</span>
          </h1>
        </Link>

        <nav style={styles.nav}>
          <Link style={styles.navLink} to="/">
            Trang chủ
          </Link>

          <Link style={styles.navLink} to="/products">
            Sản phẩm
          </Link>

          <Link style={styles.activeLink} to="/admin/dashboard">
            Dashboard
          </Link>

          <Link style={styles.navLink} to="/admin/products">
            Quản lý sản phẩm
          </Link>

          <Link style={styles.navLink} to="/admin/orders">
            Quản lý đơn hàng
          </Link>
        </nav>
      </header>

      <section style={styles.titleBox}>
        <h1 style={styles.title}>Admin Dashboard</h1>

        <p style={styles.subtitle}>
          Tổng quan sản phẩm, đơn hàng, người dùng, doanh thu và lượt truy cập.
        </p>
      </section>

      {loading ? (
        <div style={styles.emptyBox}>
          <h2>Đang tải dữ liệu Dashboard...</h2>
        </div>
      ) : (
        <>
          <section style={styles.statsGrid}>
            <div style={styles.statCard}>
              <span style={styles.icon}>📦</span>
              <div>
                <p style={styles.statLabel}>Tổng sản phẩm</p>
                <h2 style={styles.statValue}>
                  {formatNumber(stats.total_products)}
                </h2>
              </div>
            </div>

            <div style={styles.statCard}>
              <span style={styles.icon}>🧾</span>
              <div>
                <p style={styles.statLabel}>Tổng đơn hàng</p>
                <h2 style={styles.statValue}>
                  {formatNumber(stats.total_orders)}
                </h2>
              </div>
            </div>

            <div style={styles.statCard}>
              <span style={styles.icon}>👤</span>
              <div>
                <p style={styles.statLabel}>Tổng người dùng</p>
                <h2 style={styles.statValue}>
                  {formatNumber(stats.total_users)}
                </h2>
              </div>
            </div>

            <div style={styles.statCard}>
              <span style={styles.icon}>💰</span>
              <div>
                <p style={styles.statLabel}>Tổng doanh thu</p>
                <h2 style={styles.statValue}>
                  {formatPrice(stats.total_revenue)}
                </h2>
              </div>
            </div>

            <div style={styles.statCard}>
              <span style={styles.icon}>🌐</span>
              <div>
                <p style={styles.statLabel}>Tổng lượt truy cập</p>
                <h2 style={styles.statValue}>
                  {formatNumber(trafficSummary.totalWebsiteVisits)}
                </h2>
              </div>
            </div>

            <div style={styles.statCard}>
              <span style={styles.icon}>📅</span>
              <div>
                <p style={styles.statLabel}>Truy cập hôm nay</p>
                <h2 style={styles.statValue}>
                  {trafficType === "day"
                    ? formatNumber(trafficSummary.visitsToday)
                    : "Chọn Ngày"}
                </h2>
              </div>
            </div>

            <div style={styles.statCard}>
              <span style={styles.icon}>👁️</span>
              <div>
                <p style={styles.statLabel}>Lượt xem đơn hàng</p>
                <h2 style={styles.statValue}>
                  {formatNumber(trafficSummary.totalOrderViews)}
                </h2>
              </div>
            </div>
          </section>

          <section style={styles.contentGrid}>
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <h2 style={styles.panelTitle}>Doanh thu</h2>

                <div style={styles.filterGroup}>
                  <button
                    type="button"
                    onClick={() => setRevenueType("day")}
                    style={buttonStyle(revenueType === "day")}
                  >
                    Ngày
                  </button>

                  <button
                    type="button"
                    onClick={() => setRevenueType("month")}
                    style={buttonStyle(revenueType === "month")}
                  >
                    Tháng
                  </button>

                  <button
                    type="button"
                    onClick={() => setRevenueType("year")}
                    style={buttonStyle(revenueType === "year")}
                  >
                    Năm
                  </button>
                </div>
              </div>

              {revenueData.length === 0 ? (
                <p style={styles.muted}>Chưa có dữ liệu doanh thu.</p>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>
                          {revenueType === "day"
                            ? "Ngày"
                            : revenueType === "year"
                            ? "Năm"
                            : "Tháng"}
                        </th>
                        <th style={styles.th}>Doanh thu sản phẩm</th>
                        <th style={styles.th}>Phí vận chuyển</th>
                        <th style={styles.th}>Tổng thu</th>
                      </tr>
                    </thead>

                    <tbody>
                      {revenueData.map((item) => (
                        <tr key={item.period}>
                          <td style={styles.td}>{item.period}</td>

                          <td style={styles.td}>
                            {formatPrice(item.revenue)}
                          </td>

                          <td style={styles.td}>
                            {formatPrice(item.shipping_fee)}
                          </td>

                          <td style={styles.td}>
                            <strong>
                              {formatPrice(
                                item.total_collected ??
                                  Number(item.revenue || 0) +
                                    Number(item.shipping_fee || 0)
                              )}
                            </strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <h2 style={styles.panelTitle}>Thống kê truy cập</h2>

                <div style={styles.filterGroup}>
                  <button
                    type="button"
                    onClick={() => setTrafficType("day")}
                    style={buttonStyle(trafficType === "day")}
                  >
                    Ngày
                  </button>

                  <button
                    type="button"
                    onClick={() => setTrafficType("month")}
                    style={buttonStyle(trafficType === "month")}
                  >
                    Tháng
                  </button>

                  <button
                    type="button"
                    onClick={() => setTrafficType("year")}
                    style={buttonStyle(trafficType === "year")}
                  >
                    Năm
                  </button>
                </div>
              </div>

              {trafficData.length === 0 ? (
                <p style={styles.muted}>
                  Chưa có dữ liệu lượt truy cập.
                </p>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>
                          {trafficType === "day"
                            ? "Ngày"
                            : trafficType === "year"
                            ? "Năm"
                            : "Tháng"}
                        </th>

                        <th style={styles.th}>Lượt truy cập</th>
                        <th style={styles.th}>Lượt xem đơn hàng</th>
                      </tr>
                    </thead>

                    <tbody>
                      {trafficData.map((item) => (
                        <tr key={item.period}>
                          <td style={styles.td}>{item.period}</td>

                          <td style={styles.td}>
                            {formatNumber(item.website_visits)}
                          </td>

                          <td style={styles.td}>
                            {formatNumber(item.order_views)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <section style={{ ...styles.panel, marginTop: "22px" }}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Đơn hàng mới</h2>

              <Link to="/admin/orders" style={styles.viewAll}>
                Xem tất cả
              </Link>
            </div>

            {orders.length === 0 ? (
              <p style={styles.muted}>Chưa có đơn hàng nào.</p>
            ) : (
              <div style={styles.orderList}>
                {orders.map((order) => (
                  <div key={order.id} style={styles.orderItem}>
                    <div>
                      <h3 style={styles.orderTitle}>DH{order.id}</h3>

                      <p style={styles.orderText}>
                        Khách hàng: {order.shipping_name || "Chưa có"}
                      </p>

                      <p style={styles.orderText}>
                        Trạng thái: {order.status || "Đang xử lý"}
                      </p>
                    </div>

                    <strong style={styles.orderPrice}>
                      {formatPrice(
                        order.total_amount ||
                          order.total_price ||
                          order.total
                      )}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    padding: "0 70px 40px",
    backgroundColor: "#ffffff",
    color: "#111827",
    boxSizing: "border-box",
  },

  header: {
    minHeight: "78px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    flexWrap: "wrap",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
    color: "black",
  },

  logoBox: {
    width: "42px",
    height: "42px",
    backgroundColor: "#1769ff",
    color: "white",
    borderRadius: "10px",
    fontSize: "26px",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "800",
  },

  nav: {
    display: "flex",
    alignItems: "center",
    gap: "22px",
    flexWrap: "wrap",
  },

  navLink: {
    color: "black",
    textDecoration: "none",
    fontWeight: "600",
  },

  activeLink: {
    color: "#1769ff",
    textDecoration: "none",
    fontWeight: "700",
    borderBottom: "3px solid #1769ff",
    paddingBottom: "8px",
  },

  titleBox: {
    background: "linear-gradient(120deg, #eef6ff, #ffffff)",
    borderRadius: "12px",
    padding: "35px 40px",
    marginTop: "15px",
    marginBottom: "22px",
  },

  title: {
    margin: "0 0 8px",
    fontSize: "34px",
  },

  subtitle: {
    margin: 0,
    color: "#6b7280",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },

  statCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "22px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
    backgroundColor: "#ffffff",
  },

  icon: {
    width: "54px",
    height: "54px",
    minWidth: "54px",
    borderRadius: "14px",
    backgroundColor: "#eef6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
  },

  statLabel: {
    margin: "0 0 6px",
    color: "#6b7280",
    fontWeight: "600",
  },

  statValue: {
    margin: 0,
    fontSize: "26px",
    overflowWrap: "anywhere",
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(430px, 1fr))",
    gap: "22px",
  },

  panel: {
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "24px",
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "14px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },

  panelTitle: {
    margin: 0,
  },

  filterGroup: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  filterBtn: {
    padding: "9px 15px",
    backgroundColor: "#e5e7eb",
    color: "#111827",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "700",
  },

  activeFilterBtn: {
    backgroundColor: "#1769ff",
    color: "#ffffff",
  },

  viewAll: {
    color: "#1769ff",
    fontWeight: "700",
    textDecoration: "none",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "520px",
  },

  th: {
    textAlign: "left",
    padding: "12px",
    backgroundColor: "#f3f8ff",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },

  orderList: {
    display: "grid",
    gap: "12px",
  },

  orderItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "14px",
    backgroundColor: "#f9fafb",
  },

  orderTitle: {
    margin: "0 0 6px",
  },

  orderText: {
    margin: "0 0 4px",
    color: "#6b7280",
  },

  orderPrice: {
    color: "#1769ff",
    whiteSpace: "nowrap",
  },

  muted: {
    color: "#6b7280",
  },

  emptyBox: {
    textAlign: "center",
    padding: "60px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
  },
};

export default AdminDashboardPage;