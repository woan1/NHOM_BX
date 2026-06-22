import { useEffect, useState } from "react";
import api from "./api";

function AdminProductPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    description: "",
    stock: "",
    category_id: "",
  });

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
      alert("Không tải được danh sách sản phẩm");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      image: "",
      description: "",
      stock: "",
      category_id: "",
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      price: Number(formData.price),
      image: formData.image,
      description: formData.description,
      stock: Number(formData.stock),
      category_id: Number(formData.category_id),
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, productData);
        alert("Cập nhật sản phẩm thành công");
      } else {
        await api.post("/products", productData);
        alert("Thêm sản phẩm thành công");
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Lỗi lưu sản phẩm:", error);
      alert("Lưu sản phẩm thất bại. Kiểm tra lại dữ liệu.");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);

    setFormData({
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description || "",
      stock: product.stock,
      category_id: product.category_id,
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa sản phẩm này?");

    if (!confirmDelete) return;

    try {
      await api.delete(`/products/${id}`);
      alert("Xóa sản phẩm thành công");
      fetchProducts();
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      alert("Xóa sản phẩm thất bại");
    }
  };

  return (
    <div style={{ padding: "30px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center" }}>Admin - Quản lý sản phẩm</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: "700px",
          margin: "30px auto",
          padding: "25px",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          display: "grid",
          gap: "15px",
        }}
      >
        <h2>{editingId ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>

        <input
          name="name"
          placeholder="Tên sản phẩm"
          value={formData.name}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <input
          name="price"
          type="number"
          placeholder="Giá"
          value={formData.price}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <input
          name="image"
          placeholder="Link hình ảnh"
          value={formData.image}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <textarea
          name="description"
          placeholder="Mô tả sản phẩm"
          value={formData.description}
          onChange={handleChange}
          style={{ ...inputStyle, height: "80px" }}
        />

        <input
          name="stock"
          type="number"
          placeholder="Số lượng tồn kho"
          value={formData.stock}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <select
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          required
          style={inputStyle}
        >
          <option value="">Chọn danh mục</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", gap: "10px" }}>
          <button type="submit" style={primaryButtonStyle}>
            {editingId ? "Cập nhật" : "Thêm sản phẩm"}
          </button>

          {editingId && (
            <button type="button" onClick={resetForm} style={secondaryButtonStyle}>
              Hủy sửa
            </button>
          )}
        </div>
      </form>

      <div
        style={{
          maxWidth: "1000px",
          margin: "30px auto",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2>Danh sách sản phẩm</h2>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#111", color: "white" }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Tên</th>
              <th style={thStyle}>Danh mục</th>
              <th style={thStyle}>Giá</th>
              <th style={thStyle}>Kho</th>
              <th style={thStyle}>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td style={tdStyle}>{product.id}</td>
                <td style={tdStyle}>{product.name}</td>
                <td style={tdStyle}>{product.category}</td>
                <td style={tdStyle}>{product.price.toLocaleString()} VNĐ</td>
                <td style={tdStyle}>{product.stock}</td>
                <td style={tdStyle}>
                  <button onClick={() => handleEdit(product)} style={editButtonStyle}>
                    Sửa
                  </button>

                  <button onClick={() => handleDelete(product.id)} style={deleteButtonStyle}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "12px",
  border: "1px solid #ccc",
  borderRadius: "6px",
};

const primaryButtonStyle = {
  padding: "12px 20px",
  backgroundColor: "black",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  padding: "12px 20px",
  backgroundColor: "#777",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const editButtonStyle = {
  padding: "8px 12px",
  marginRight: "8px",
  backgroundColor: "#f0ad4e",
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

const thStyle = {
  padding: "12px",
  border: "1px solid #ddd",
};

const tdStyle = {
  padding: "12px",
  border: "1px solid #ddd",
  textAlign: "center",
};

export default AdminProductPage;