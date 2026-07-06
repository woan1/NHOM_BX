import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api";

function AdminProductPage() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    description: "",
    stock: "",
    category_id: "",
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (error) {
      console.error(error);
      alert("Không tải được sản phẩm từ PostgreSQL.");
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (error) {
      console.error(error);
      alert("Không tải được danh mục.");
    }
  };

  const formatPrice = (price) => {
    return Number(price).toLocaleString("vi-VN") + " đ";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!imageFile) {
      return formData.image;
    }

    const data = new FormData();
    data.append("file", imageFile);

    const res = await api.post("/upload-image", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data.image;
  };

  const resetForm = () => {
    setEditingId(null);
    setImageFile(null);
    setPreviewImage("");

    setFormData({
      name: "",
      price: "",
      image: "",
      description: "",
      stock: "",
      category_id: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.price ||
      !formData.description ||
      !formData.stock ||
      !formData.category_id
    ) {
      alert("Vui lòng nhập đầy đủ thông tin sản phẩm.");
      return;
    }

    try {
      const imageUrl = await uploadImage();

      if (!imageUrl) {
        alert("Vui lòng chọn ảnh sản phẩm.");
        return;
      }

      const payload = {
        name: formData.name,
        price: Number(formData.price),
        image: imageUrl,
        description: formData.description,
        stock: Number(formData.stock),
        category_id: Number(formData.category_id),
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        alert("Cập nhật sản phẩm thành công vào PostgreSQL!");
      } else {
        await api.post("/products", payload);
        alert("Thêm sản phẩm thành công vào PostgreSQL!");
      }

      resetForm();
      loadProducts();
    } catch (error) {
      console.error(error);
      alert("Lỗi khi lưu sản phẩm vào PostgreSQL. Kiểm tra đã đăng nhập admin chưa.");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setImageFile(null);
    setPreviewImage(product.image || "");

    setFormData({
      name: product.name || "",
      price: product.price || "",
      image: product.image || "",
      description: product.description || "",
      stock: product.stock || "",
      category_id: product.category_id || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa sản phẩm này?");

    if (!confirmDelete) return;

    try {
      await api.delete(`/products/${id}`);
      alert("Xóa sản phẩm thành công khỏi PostgreSQL!");
      loadProducts();
    } catch (error) {
      console.error(error);
      alert("Không xóa được sản phẩm.");
    }
  };

  if (!currentUser || currentUser.role !== "ADMIN") {
    return (
      <div style={styles.page}>
        <h1>Bạn không có quyền truy cập trang Admin</h1>

        <Link to="/login">
          <button style={styles.submitButton}>Đăng nhập admin</button>
        </Link>
      </div>
    );
  }

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

          <Link style={styles.activeLink} to="/admin/products">
            Quản lý sản phẩm
          </Link>

          <Link style={styles.navLink} to="/admin/dashboard">
            Dashboard
          </Link>
        </nav>
      </header>

      <section style={styles.titleBox}>
        <h1 style={styles.title}>Admin - Quản lý sản phẩm</h1>

        <p style={styles.subtitle}>
          Thêm, sửa, xóa sản phẩm. Dữ liệu được lưu thật vào PostgreSQL.
        </p>
      </section>

      <section style={styles.grid}>
        <form onSubmit={handleSubmit} style={styles.formBox}>
          <h2>{editingId ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</h2>

          <label style={styles.label}>Tên sản phẩm</label>
          <input
            style={styles.input}
            name="name"
            placeholder="Ví dụ: iPad Air M2"
            value={formData.name}
            onChange={handleChange}
          />

          <label style={styles.label}>Danh mục</label>
          <select
            style={styles.input}
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
          >
            <option value="">-- Chọn danh mục --</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <label style={styles.label}>Giá sản phẩm</label>
          <input
            style={styles.input}
            name="price"
            type="number"
            placeholder="Ví dụ: 12900000"
            value={formData.price}
            onChange={handleChange}
          />

          <label style={styles.label}>Số lượng kho</label>
          <input
            style={styles.input}
            name="stock"
            type="number"
            placeholder="Ví dụ: 100"
            value={formData.stock}
            onChange={handleChange}
          />

          <label style={styles.label}>Ảnh sản phẩm</label>
          <input
            style={styles.input}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          {(previewImage || formData.image) && (
            <div style={styles.previewBox}>
              <img
                src={previewImage || formData.image}
                alt="Preview"
                style={styles.previewImage}
                onError={(e) => {
                  e.currentTarget.src =
                    "https://dummyimage.com/300x200/eef6ff/1769ff&text=ShopHub";
                }}
              />
            </div>
          )}

          <label style={styles.label}>Mô tả sản phẩm</label>
          <textarea
            style={styles.textarea}
            name="description"
            placeholder="Nhập mô tả sản phẩm"
            value={formData.description}
            onChange={handleChange}
          />

          <button type="submit" style={styles.submitButton}>
            {editingId ? "Lưu cập nhật" : "Thêm sản phẩm"}
          </button>

          {editingId && (
            <button type="button" onClick={resetForm} style={styles.cancelBtn}>
              Hủy sửa
            </button>
          )}
        </form>

        <div style={styles.listBox}>
          <h2>Danh sách sản phẩm</h2>

          <p>
            Tổng sản phẩm: <b>{products.length}</b>
          </p>

          <div style={styles.productList}>
            {products.map((product) => (
              <div key={product.id} style={styles.productItem}>
                <div style={styles.productImageBox}>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={styles.productImage}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://dummyimage.com/300x200/eef6ff/1769ff&text=ShopHub";
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={styles.productName}>{product.name}</h3>

                  <p style={styles.productText}>
                    Danh mục: {product.category || product.category_id}
                  </p>

                  <p style={styles.productPrice}>
                    {formatPrice(product.price)}
                  </p>

                  <p style={styles.productText}>Kho: {product.stock} sản phẩm</p>
                </div>

                <div style={styles.actions}>
                  <button
                    type="button"
                    onClick={() => handleEdit(product)}
                    style={styles.editButton}
                  >
                    Sửa
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    style={styles.deleteButton}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
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
    gap: "28px",
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
    marginBottom: "20px",
  },

  title: {
    margin: "0 0 8px",
    fontSize: "34px",
  },

  subtitle: {
    margin: 0,
    color: "#6b7280",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "420px 1fr",
    gap: "25px",
    alignItems: "start",
  },

  formBox: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
  },

  label: {
    display: "block",
    marginTop: "14px",
    marginBottom: "6px",
    fontWeight: "700",
  },

  input: {
    width: "100%",
    height: "44px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "0 12px",
    fontSize: "15px",
  },

  textarea: {
    width: "100%",
    height: "90px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "15px",
    resize: "none",
  },

  previewBox: {
    marginTop: "12px",
    height: "150px",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    backgroundColor: "#f3f8ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  previewImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    padding: "10px",
  },

  submitButton: {
    width: "100%",
    height: "46px",
    marginTop: "18px",
    backgroundColor: "#1769ff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "800",
    cursor: "pointer",
  },

  cancelBtn: {
    width: "100%",
    height: "46px",
    marginTop: "10px",
    backgroundColor: "#111827",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "800",
    cursor: "pointer",
  },

  listBox: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
  },

  productList: {
    display: "grid",
    gap: "15px",
    marginTop: "15px",
  },

  productItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "14px",
  },

  productImageBox: {
    width: "90px",
    height: "90px",
    backgroundColor: "#f3f8ff",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: "8px",
  },

  productName: {
    margin: "0 0 6px",
    fontSize: "17px",
  },

  productText: {
    margin: "4px 0",
    color: "#6b7280",
  },

  productPrice: {
    margin: "4px 0",
    color: "#1769ff",
    fontWeight: "800",
  },

  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  editButton: {
    padding: "9px 16px",
    backgroundColor: "#1769ff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "700",
  },

  deleteButton: {
    padding: "9px 16px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "700",
  },
};

export default AdminProductPage;