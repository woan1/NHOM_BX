import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api";

function AdminDashboardPage() {
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const [stats, setStats] = useState({
    total_products: 0,
    total_orders: 0,
    total_users: 0,
    total_revenue: 0,
  });

  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("vi-VN") + " đ";
  };

  const isAdmin = ["ADMIN", "admin"].includes(currentUser?.role);

  useEffect(() => {
    if (!currentUser || !isAdmin) {
      alert("Bạn không có quyền truy cập trang Admin Dashboard.");
      navigate("/");
      return;
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const statsRes = await api.get("/dashboard/stats");
      const revenueRes = await api.get("/dashboard/monthly-revenue");
      const ordersRes = await api.get("/orders");

      setStats(statsRes.data);
      setMonthlyRevenue(revenueRes.data);
      setOrders(ordersRes.data.slice(0, 5));
    } catch (error) {
      console.error("Lỗi tải dashboard:", error);

      if (error.response?.status === 401) {
        alert("Bạn chưa đăng nhập hoặc token đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (error.response?.status === 403) {
        alert("Tài khoản của bạn không có quyền ADMIN.");
      } else {
        alert("Không tải được Dashboard. Kiểm tra backend hoặc token admin.");
      }
    } finally {
      setLoading(false);
    }
  };

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
        </nav>
      </header>

      <section style={styles.titleBox}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <p style={styles.subtitle}>
          Tổng quan tình hình sản phẩm, đơn hàng, người dùng và doanh thu.
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
                <h2 style={styles.statValue}>{stats.total_products}</h2>
              </div>
            </div>

            <div style={styles.statCard}>
              <span style={styles.icon}>🧾</span>
              <div>
                <p style={styles.statLabel}>Tổng đơn hàng</p>
                <h2 style={styles.statValue}>{stats.total_orders}</h2>
              </div>
            </div>

            <div style={styles.statCard}>
              <span style={styles.icon}>👤</span>
              <div>
                <p style={styles.statLabel}>Tổng người dùng</p>
                <h2 style={styles.statValue}>{stats.total_users}</h2>
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
          </section>

          <section style={styles.contentGrid}>
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <h2>Doanh thu theo tháng</h2>

                <button onClick={fetchDashboardData} style={styles.refreshBtn}>
                  Làm mới
                </button>
              </div>

              {monthlyRevenue.length === 0 ? (
                <p style={styles.muted}>Chưa có dữ liệu doanh thu.</p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Tháng</th>
                      <th style={styles.th}>Doanh thu</th>
                    </tr>
                  </thead>

                  <tbody>
                    {monthlyRevenue.map((item) => (
                      <tr key={item.month}>
                        <td style={styles.td}>{item.month}</td>
                        <td style={styles.td}>{formatPrice(item.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <h2>Đơn hàng mới</h2>

                <Link to="/admin/orders" style={styles.viewAllLink}>
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
                        {formatPrice(order.total_price || order.total)}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
    padding: "0 115px 40px",
    backgroundColor: "#ffffff",
    color: "#111827",
  },

  header: {
    height: "78px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
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
    gap: "26px",
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
    paddingBottom: "24px",
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
    gridTemplateColumns: "repeat(4, 1fr)",
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
  },

  icon: {
    width: "54px",
    height: "54px",
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
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "22px",
  },

  panel: {
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "24px",
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },

  refreshBtn: {
    padding: "9px 15px",
    backgroundColor: "#111827",
    color: "white",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "700",
  },

  viewAll: {
    color: "#1769ff",
    fontWeight: "700",
    textDecoration: "none",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "12px",
    backgroundColor: "#f3f8ff",
    borderBottom: "1px solid #e5e7eb",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
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