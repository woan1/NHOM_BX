import { Link } from "react-router-dom";
import { useCart } from "./CartContext";

function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h1>Giỏ hàng</h1>
        <p>Giỏ hàng của bạn đang trống.</p>

        <Link to="/products">
          <button style={primaryButtonStyle}>Tiếp tục mua sắm</button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center" }}>Giỏ hàng</h1>

      <div
        style={{
          maxWidth: "900px",
          margin: "30px auto",
          backgroundColor: "white",
          padding: "25px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        {cartItems.map((item) => (
          <div
            key={item.id}
            style={{
              display: "grid",
              gridTemplateColumns: "100px 1fr 160px 120px 100px",
              gap: "15px",
              alignItems: "center",
              borderBottom: "1px solid #ddd",
              padding: "15px 0",
            }}
          >
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: "100px",
                height: "80px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />

            <div>
              <h3>{item.name}</h3>
              <p>{item.category}</p>
              <p>{item.price.toLocaleString()} VNĐ</p>
            </div>

            <div>
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                style={smallButtonStyle}
              >
                -
              </button>

              <span style={{ margin: "0 12px", fontWeight: "bold" }}>
                {item.quantity}
              </span>

              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                style={smallButtonStyle}
              >
                +
              </button>
            </div>

            <strong>
              {(item.price * item.quantity).toLocaleString()} VNĐ
            </strong>

            <button
              onClick={() => removeFromCart(item.id)}
              style={deleteButtonStyle}
            >
              Xóa
            </button>
          </div>
        ))}

        <div style={{ textAlign: "right", marginTop: "25px" }}>
          <h2>Tổng tiền: {cartTotal.toLocaleString()} VNĐ</h2>

          <button onClick={clearCart} style={secondaryButtonStyle}>
            Xóa giỏ hàng
          </button>

          <Link to="/checkout">
            <button style={primaryButtonStyle}>Thanh toán</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

const primaryButtonStyle = {
  padding: "12px 20px",
  backgroundColor: "black",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  marginLeft: "10px",
};

const secondaryButtonStyle = {
  padding: "12px 20px",
  backgroundColor: "#777",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const smallButtonStyle = {
  padding: "6px 12px",
  backgroundColor: "#111",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const deleteButtonStyle = {
  padding: "8px 12px",
  backgroundColor: "#d9534f",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default CartPage;