import { Link } from "react-router-dom";
import { useCart } from "./CartContext";

function ProjectCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div
      style={{
        width: "240px",
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "16px",
        backgroundColor: "white",
        boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
      }}
    >
      <img
        src={product.image}
        alt={product.name}
        style={{
          width: "100%",
          height: "160px",
          objectFit: "cover",
          borderRadius: "8px",
        }}
      />

      <h3>{product.name}</h3>

      <p>
        <b>Danh mục:</b> {product.category}
      </p>

      <p>
        <b>Giá:</b> {product.price.toLocaleString()} VNĐ
      </p>

      <button
        onClick={() => {
          addToCart(product);
          alert("Đã thêm vào giỏ hàng!");
        }}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#111",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "8px",
        }}
      >
        Thêm vào giỏ hàng
      </button>

      <Link to={`/products/${product.id}`}>
        <button
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#555",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Xem chi tiết
        </button>
      </Link>
    </div>
  );
}

export default ProjectCard;