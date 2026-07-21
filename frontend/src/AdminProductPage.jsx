import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api";

function AdminProductPage() {
  let currentUser = null;

  try {
    currentUser = JSON.parse(localStorage.getItem("currentUser"));
  } catch (error) {
    console.error("Không đọc được currentUser:", error);
  }

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Chuyển lỗi API thành nội dung dễ đọc
  const getApiError = (error) => {
    const status = error.response?.status;
    const responseData = error.response?.data;

    let detail =
      responseData?.detail ||
      responseData?.message ||
      error.message ||
      "Không xác định được lỗi";

    if (Array.isArray(detail)) {
      detail = detail
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          if (item?.msg) {
            const field = Array.isArray(item.loc)
              ? item.loc.join(" → ")
              : "";

            return field
              ? `${field}: ${item.msg}`
              : item.msg;
          }

          return JSON.stringify(item);
        })
        .join("\n");
    } else if (typeof detail === "object") {
      detail = JSON.stringify(detail, null, 2);
    }

    return {
      status: status || "Không xác định",
      detail,
    };
  };

  const loadProducts = async () => {
    try {
      const response = await api.get("/products");

      setProducts(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);

      const apiError = getApiError(error);

      alert(
        "KHÔNG TẢI ĐƯỢC SẢN PHẨM\n\n" +
          `Mã lỗi: ${apiError.status}\n` +
          `Chi tiết: ${apiError.detail}`
      );
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get("/categories");

      setCategories(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);

      const apiError = getApiError(error);

      alert(
        "KHÔNG TẢI ĐƯỢC DANH MỤC\n\n" +
          `Mã lỗi: ${apiError.status}\n` +
          `Chi tiết: ${apiError.detail}`
      );
    }
  };

  const formatPrice = (price) => {
    const numberPrice = Number(price);

    if (!Number.isFinite(numberPrice)) {
      return "0 đ";
    }

    return numberPrice.toLocaleString("vi-VN") + " đ";
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn đúng tệp hình ảnh.");
      event.target.value = "";
      return;
    }

    // Giới hạn ảnh tối đa 5 MB
    const maximumSize = 5 * 1024 * 1024;

    if (file.size > maximumSize) {
      alert("Dung lượng ảnh không được vượt quá 5 MB.");
      event.target.value = "";
      return;
    }

    if (previewImage?.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }

    const imagePreviewUrl = URL.createObjectURL(file);

    setImageFile(file);
    setPreviewImage(imagePreviewUrl);
  };

  const uploadImage = async () => {
    // Khi sửa sản phẩm và không chọn ảnh mới,
    // tiếp tục sử dụng ảnh cũ.
    if (!imageFile) {
      return formData.image;
    }

    const imageData = new FormData();
    imageData.append("file", imageFile);

    /*
      Không cần tự đặt Content-Type.
      Trình duyệt sẽ tự tạo multipart/form-data
      kèm boundary chính xác.
    */
    const response = await api.post(
      "/upload-image",
      imageData
    );

    const imageUrl =
      response.data?.image ||
      response.data?.image_url ||
      response.data?.url;

    if (!imageUrl) {
      throw new Error(
        "Backend đã nhận ảnh nhưng không trả về đường dẫn ảnh."
      );
    }

    return imageUrl;
  };

  const resetForm = () => {
    if (previewImage?.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }

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

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("authToken")
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const name = formData.name.trim();
    const description = formData.description.trim();

    if (
      !name ||
      formData.price === "" ||
      !description ||
      formData.stock === "" ||
      formData.category_id === ""
    ) {
      alert("Vui lòng nhập đầy đủ thông tin sản phẩm.");
      return;
    }

    const token = getToken();

    if (!token) {
      alert(
        "Không tìm thấy token đăng nhập.\n\n" +
          "Bạn hãy đăng xuất và đăng nhập lại bằng tài khoản ADMIN."
      );
      return;
    }

    const price = Number(formData.price);
    const stock = Number(formData.stock);
    const categoryId = Number(formData.category_id);

    if (!Number.isFinite(price) || price <= 0) {
      alert("Giá sản phẩm phải là số lớn hơn 0.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      alert(
        "Số lượng kho phải là số nguyên và không được nhỏ hơn 0."
      );
      return;
    }

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      alert("Danh mục sản phẩm không hợp lệ.");
      return;
    }

    setIsSubmitting(true);

    let imageUrl = "";

    // Bước 1: tải ảnh lên backend
    try {
      imageUrl = await uploadImage();
    } catch (error) {
      console.error("Lỗi tải ảnh:", error);

      const apiError = getApiError(error);

      alert(
        "TẢI ẢNH THẤT BẠI\n\n" +
          `Mã lỗi: ${apiError.status}\n` +
          `Chi tiết: ${apiError.detail}`
      );

      setIsSubmitting(false);
      return;
    }

    if (!imageUrl) {
      alert("Vui lòng chọn ảnh sản phẩm.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name,
      price,
      image: imageUrl,
      description,
      stock,
      category_id: categoryId,
    };

    // Bước 2: lưu sản phẩm vào PostgreSQL
    try {
      if (editingId) {
        await api.put(
          `/products/${editingId}`,
          payload
        );

        alert(
          "Cập nhật sản phẩm thành công vào PostgreSQL!"
        );
      } else {
        await api.post("/products", payload);

        alert(
          "Thêm sản phẩm thành công vào PostgreSQL!"
        );
      }

      resetForm();
      await loadProducts();
    } catch (error) {
      console.error("Lỗi lưu sản phẩm:", error);

      const apiError = getApiError(error);

      let suggestion = "";

      if (apiError.status === 401) {
        suggestion =
          "\n\nBạn chưa đăng nhập hoặc token đã hết hạn. " +
          "Hãy đăng xuất và đăng nhập lại.";
      } else if (apiError.status === 403) {
        suggestion =
          "\n\nTài khoản hiện tại không có quyền ADMIN.";
      } else if (apiError.status === 404) {
        suggestion =
          "\n\nKhông tìm thấy API. Hãy kiểm tra đường dẫn backend.";
      } else if (apiError.status === 422) {
        suggestion =
          "\n\nDữ liệu gửi lên chưa đúng định dạng backend yêu cầu.";
      } else if (apiError.status === 500) {
        suggestion =
          "\n\nBackend hoặc PostgreSQL đang xảy ra lỗi.";
      }

      alert(
        `${editingId ? "CẬP NHẬT" : "THÊM"} SẢN PHẨM THẤT BẠI\n\n` +
          `Mã lỗi: ${apiError.status}\n` +
          `Chi tiết: ${apiError.detail}` +
          suggestion
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    if (previewImage?.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }

    setEditingId(product.id);
    setImageFile(null);
    setPreviewImage(product.image || "");

    setFormData({
      name: product.name || "",
      price: product.price ?? "",
      image: product.image || "",
      description: product.description || "",
      stock: product.stock ?? "",
      category_id: product.category_id ?? "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa sản phẩm này?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);

      alert(
        "Xóa sản phẩm thành công khỏi PostgreSQL!"
      );

      await loadProducts();
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);

      const apiError = getApiError(error);

      alert(
        "XÓA SẢN PHẨM THẤT BẠI\n\n" +
          `Mã lỗi: ${apiError.status}\n` +
          `Chi tiết: ${apiError.detail}`
      );
    }
  };

  const getCategoryName = (product) => {
    if (
      product.category &&
      typeof product.category === "string"
    ) {
      return product.category;
    }

    if (
      product.category &&
      typeof product.category === "object"
    ) {
      return (
        product.category.name ||
        product.category.id ||
        product.category_id
      );
    }

    const category = categories.find(
      (item) =>
        Number(item.id) === Number(product.category_id)
    );

    return category?.name || product.category_id || "Chưa có";
  };

  if (
    !currentUser ||
    String(currentUser.role).toUpperCase() !== "ADMIN"
  ) {
    return (
      <div style={styles.page}>
        <h1>Bạn không có quyền truy cập trang Admin</h1>

        <Link to="/login">
          <button style={styles.submitButton}>
            Đăng nhập admin
          </button>
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
            Shop
            <span style={{ color: "#1769ff" }}>
              Hub
            </span>
          </h1>
        </Link>

        <nav style={styles.nav}>
          <Link style={styles.navLink} to="/">
            Trang chủ
          </Link>

          <Link style={styles.navLink} to="/products">
            Sản phẩm
          </Link>

          <Link
            style={styles.activeLink}
            to="/admin/products"
          >
            Quản lý sản phẩm
          </Link>

          <Link
            style={styles.navLink}
            to="/admin/dashboard"
          >
            Dashboard
          </Link>
        </nav>
      </header>

      <section style={styles.titleBox}>
        <h1 style={styles.title}>
          Admin - Quản lý sản phẩm
        </h1>

        <p style={styles.subtitle}>
          Thêm, sửa, xóa sản phẩm. Dữ liệu được lưu
          thật vào PostgreSQL.
        </p>
      </section>

      <section style={styles.grid}>
        <form
          onSubmit={handleSubmit}
          style={styles.formBox}
        >
          <h2>
            {editingId
              ? "Cập nhật sản phẩm"
              : "Thêm sản phẩm mới"}
          </h2>

          <label style={styles.label}>
            Tên sản phẩm
          </label>

          <input
            style={styles.input}
            name="name"
            placeholder="Ví dụ: iPad Air M2"
            value={formData.name}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          <label style={styles.label}>
            Danh mục
          </label>

          <select
            style={styles.input}
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="">
              -- Chọn danh mục --
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>

          <label style={styles.label}>
            Giá sản phẩm
          </label>

          <input
            style={styles.input}
            name="price"
            type="number"
            min="1"
            placeholder="Ví dụ: 12900000"
            value={formData.price}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          <label style={styles.label}>
            Số lượng kho
          </label>

          <input
            style={styles.input}
            name="stock"
            type="number"
            min="0"
            step="1"
            placeholder="Ví dụ: 100"
            value={formData.stock}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          <label style={styles.label}>
            Ảnh sản phẩm
          </label>

          <input
            style={styles.input}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isSubmitting}
          />

          {(previewImage || formData.image) && (
            <div style={styles.previewBox}>
              <img
                src={previewImage || formData.image}
                alt="Xem trước sản phẩm"
                style={styles.previewImage}
                onError={(event) => {
                  event.currentTarget.src =
                    "https://dummyimage.com/300x200/eef6ff/1769ff&text=ShopHub";
                }}
              />
            </div>
          )}

          <label style={styles.label}>
            Mô tả sản phẩm
          </label>

          <textarea
            style={styles.textarea}
            name="description"
            placeholder="Nhập mô tả sản phẩm"
            value={formData.description}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          <button
            type="submit"
            style={{
              ...styles.submitButton,
              opacity: isSubmitting ? 0.65 : 1,
              cursor: isSubmitting
                ? "not-allowed"
                : "pointer",
            }}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Đang lưu..."
              : editingId
                ? "Lưu cập nhật"
                : "Thêm sản phẩm"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              style={styles.cancelBtn}
              disabled={isSubmitting}
            >
              Hủy sửa
            </button>
          )}
        </form>

        <div style={styles.listBox}>
          <h2>Danh sách sản phẩm</h2>

          <p>
            Tổng sản phẩm:{" "}
            <b>{products.length}</b>
          </p>

          <div style={styles.productList}>
            {products.length === 0 && (
              <p style={styles.emptyText}>
                Chưa có sản phẩm trong cơ sở dữ liệu.
              </p>
            )}

            {products.map((product) => (
              <div
                key={product.id}
                style={styles.productItem}
              >
                <div style={styles.productImageBox}>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={styles.productImage}
                    onError={(event) => {
                      event.currentTarget.src =
                        "https://dummyimage.com/300x200/eef6ff/1769ff&text=ShopHub";
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={styles.productName}>
                    {product.name}
                  </h3>

                  <p style={styles.productText}>
                    Danh mục:{" "}
                    {getCategoryName(product)}
                  </p>

                  <p style={styles.productPrice}>
                    {formatPrice(product.price)}
                  </p>

                  <p style={styles.productText}>
                    Kho: {product.stock} sản phẩm
                  </p>
                </div>

                <div style={styles.actions}>
                  <button
                    type="button"
                    onClick={() =>
                      handleEdit(product)
                    }
                    style={styles.editButton}
                  >
                    Sửa
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(product.id)
                    }
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
    boxSizing: "border-box",
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
    background:
      "linear-gradient(120deg, #eef6ff, #ffffff)",
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
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    height: "90px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "15px",
    resize: "none",
    boxSizing: "border-box",
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
    boxSizing: "border-box",
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
    flexShrink: 0,
  },

  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: "8px",
    boxSizing: "border-box",
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

  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    padding: "30px 0",
  },
};

export default AdminProductPage;