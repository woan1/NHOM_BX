import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";
import { useCart } from "./CartContext";

function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    shipping_name: "",
    shipping_phone: "",
    shipping_address: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Bạn cần đăng nhập trước khi thanh toán.");
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      alert("Giỏ hàng đang trống.");
      navigate("/products");
      return;
    }

    const orderData = {
      ...formData,
      items: cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
    };

    try {
      await api.post("/orders", orderData);

      alert("Đặt hàng thành công!");
      clearCart();
      navigate("/orders");
    } catch (error) {
      console.error("Lỗi đặt hàng:", error);
      alert("Đặt hàng thất bại. Kiểm tra đăng nhập hoặc số lượng tồn kho.");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h1>Thanh toán</h1>
        <p>Giỏ hàng đang trống.</p>

        <Link to="/products">
          <button style={buttonStyle}>Tiếp tục mua sắm</button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center" }}>Thanh toán</h1>

      <form
        onSubmit={handleCheckout}
        style={{
          width: "450px",
          margin: "30px auto",
          padding: "25px",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <input
          name="shipping_name"
          placeholder="Họ tên người nhận"
          value={formData.shipping_name}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <input
          name="shipping_phone"
          placeholder="Số điện thoại"
          value={formData.shipping_phone}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <textarea
          name="shipping_address"
          placeholder="Địa chỉ giao hàng"
          value={formData.shipping_address}
          onChange={handleChange}
          required
          style={{ ...inputStyle, height: "90px" }}
        />

        <h3>Tổng tiền: {cartTotal.toLocaleString()} VNĐ</h3>

        <button type="submit" style={buttonStyle}>
          Xác nhận đặt hàng
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  padding: "12px",
  border: "1px solid #ccc",
  borderRadius: "6px",
};

const buttonStyle = {
  padding: "12px 20px",
  backgroundColor: "black",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

export default CheckoutPage;