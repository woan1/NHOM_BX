import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "./api";
import { useCart } from "./CartContext";

function ProjectDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
      setError("");
    } catch (err) {
      console.error("Lỗi lấy chi tiết sản phẩm:", err);
      setError("Không tìm thấy sản phẩm hoặc backend chưa chạy.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  if (loading) {
    return (
      <h2 style={{ textAlign: "center", padding: "40px" }}>
        Đang tải chi tiết sản phẩm...
      </h2>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2 style={{ color: "red" }}>{error}</h2>
        <Link to="/products">Quay lại danh sách sản phẩm</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>{product.name}</h1>

      <img
        src={product.image}
        alt={product.name}
        style={{
          width: "320px",
          height: "220px",
          objectFit: "cover",
          borderRadius: "10px",
          marginTop: "20px",
        }}
      />

      <h3>Danh mục: {product.category}</h3>
      <h3>Giá: {product.price.toLocaleString()} VNĐ</h3>
      <p>{product.description}</p>
      <p>Số lượng còn lại: {product.stock}</p>

      <button
        onClick={() => {
          addToCart(product);
          alert("Đã thêm vào giỏ hàng!");
        }}
        style={{
          padding: "12px 20px",
          backgroundColor: "black",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginRight: "10px",
        }}
      >
        Thêm vào giỏ hàng
      </button>

      <Link to="/cart">
        <button
          style={{
            padding: "12px 20px",
            backgroundColor: "#444",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Xem giỏ hàng
        </button>
      </Link>

      <Link to="/products">
        <button
          style={{
            padding: "12px 20px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Quay lại
        </button>
      </Link>
    </div>
  );
}

export default ProjectDetailPage;