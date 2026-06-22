import { useEffect, useState } from "react";
import api from "./api";
import ProjectCard from "./ProjectCard";

function ProjectList() {
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("All");
  const [sortType, setSortType] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/products");
      setProducts(response.data);
      setError("");
    } catch (err) {
      console.error("Lỗi lấy sản phẩm:", err);
      setError("Không thể tải danh sách sản phẩm từ backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = ["All", ...new Set(products.map((item) => item.category))];

  let filteredProducts = products.filter((product) => {
    const matchSearch = product.name
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const matchCategory = category === "All" || product.category === category;

    return matchSearch && matchCategory;
  });

  if (sortType === "price-asc") {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  }

  if (sortType === "price-desc") {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  }

  if (sortType === "name-asc") {
    filteredProducts = [...filteredProducts].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  if (loading) {
    return <h3 style={{ textAlign: "center" }}>Đang tải sản phẩm...</h3>;
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h3 style={{ color: "red" }}>{error}</h3>
        <button onClick={fetchProducts}>Tải lại</button>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "30px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ textAlign: "center" }}>ShopHub</h1>
      <h2 style={{ textAlign: "center" }}>Danh sách sản phẩm</h2>

      <div
        style={{
          display: "flex",
          gap: "15px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: "25px",
          marginBottom: "30px",
        }}
      >
        <input
          type="text"
          placeholder="Tìm sản phẩm..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            padding: "10px",
            width: "250px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "All" ? "Tất cả danh mục" : cat}
            </option>
          ))}
        </select>

        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        >
          <option value="default">Sắp xếp mặc định</option>
          <option value="price-asc">Giá tăng dần</option>
          <option value="price-desc">Giá giảm dần</option>
          <option value="name-asc">Tên A - Z</option>
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <p style={{ textAlign: "center" }}>Không tìm thấy sản phẩm</p>
      ) : (
        <div
          style={{
            display: "flex",
            gap: "20px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {filteredProducts.map((product) => (
            <ProjectCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectList;