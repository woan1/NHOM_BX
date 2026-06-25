import { useEffect, useState } from "react";
import api from "./api";

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders/my-orders");
      setOrders(response.data);
      setError("");
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
      setError("Bạn cần đăng nhập để xem lịch sử đơn hàng.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div style={{ padding: "40px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center" }}>Lịch sử đơn hàng</h1>

      {error && <h3 style={{ color: "red", textAlign: "center" }}>{error}</h3>}

      {orders.length === 0 && !error ? (
        <p style={{ textAlign: "center" }}>Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div style={{ maxWidth: "900px", margin: "30px auto" }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "10px",
                marginBottom: "20px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              <h2>Đơn hàng #{order.id}</h2>
              <p>Trạng thái: {order.status}</p>
              <p>Người nhận: {order.shipping_name}</p>
              <p>SĐT: {order.shipping_phone}</p>
              <p>Địa chỉ: {order.shipping_address}</p>
              <h3>Tổng tiền: {order.total_price.toLocaleString()} VNĐ</h3>

              <hr />

              {order.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                  }}
                >
                  <span>
                    {item.product_name} x {item.quantity}
                  </span>

                  <strong>{item.subtotal.toLocaleString()} VNĐ</strong>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderHistoryPage;