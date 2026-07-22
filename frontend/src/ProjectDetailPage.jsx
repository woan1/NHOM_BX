import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  useEffect,
  useState,
} from "react";

import api from "./api";
import { useCart } from "./CartContext";
import {
  recordProductView,
} from "./analytics";

const FALLBACK_IMAGE =
  "https://dummyimage.com/600x400/eef6ff/1769ff&text=ShopHub";

function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    addToCart,
    cartCount,
  } = useCart();

  const [product, setProduct] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  let currentUser = null;

  try {
    const savedUser =
      localStorage.getItem(
        "currentUser"
      );

    currentUser = savedUser
      ? JSON.parse(savedUser)
      : null;
  } catch (error) {
    console.error(
      "Lỗi đọc currentUser:",
      error
    );

    localStorage.removeItem(
      "currentUser"
    );
  }

  // =========================
  // LẤY CHI TIẾT SẢN PHẨM
  // =========================
  useEffect(() => {
    let isMounted = true;

    const fetchProductDetail =
      async () => {
        if (!id) {
          if (isMounted) {
            setProduct(null);

            setErrorMessage(
              "Mã sản phẩm không hợp lệ."
            );

            setLoading(false);
          }

          return;
        }

        try {
          if (isMounted) {
            setLoading(true);
            setErrorMessage("");
            setProduct(null);
          }

          const response =
            await api.get(
              `/products/${id}`
            );

          if (!isMounted) {
            return;
          }

          if (
            response.data &&
            response.data.id
          ) {
            setProduct(
              response.data
            );
          } else {
            setProduct(null);

            setErrorMessage(
              "Dữ liệu sản phẩm không hợp lệ."
            );
          }
        } catch (detailError) {
          console.error(
            "Lỗi lấy chi tiết sản phẩm:",
            detailError.response
              ?.data ||
              detailError.message
          );

          try {
            const listResponse =
              await api.get(
                "/products"
              );

            const productList =
              Array.isArray(
                listResponse.data
              )
                ? listResponse.data
                : listResponse.data
                    ?.products || [];

            const foundProduct =
              productList.find(
                (item) =>
                  String(item.id) ===
                  String(id)
              );

            if (!isMounted) {
              return;
            }

            if (foundProduct) {
              setProduct(
                foundProduct
              );
            } else {
              setProduct(null);

              setErrorMessage(
                "Không tìm thấy sản phẩm có mã này."
              );
            }
          } catch (listError) {
            console.error(
              "Lỗi lấy danh sách sản phẩm:",
              listError.response
                ?.data ||
                listError.message
            );

            if (isMounted) {
              setProduct(null);

              setErrorMessage(
                "Không thể kết nối đến máy chủ để tải sản phẩm."
              );
            }
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

    fetchProductDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // =========================
  // GHI NHẬN LƯỢT XEM
  // =========================
  useEffect(() => {
    if (!product?.id) {
      return;
    }

    recordProductView(
      product.id
    );
  }, [product?.id]);

  const getImageUrl = (
    productData
  ) => {
    const image =
      productData?.image_url ||
      productData?.image;

    if (!image) {
      return FALLBACK_IMAGE;
    }

    if (
      image.startsWith(
        "http://"
      ) ||
      image.startsWith(
        "https://"
      )
    ) {
      return image;
    }

    if (
      image.startsWith(
        "/uploads"
      )
    ) {
      return (
        `${api.defaults.baseURL}` +
        `${image}`
      );
    }

    if (
      image.startsWith(
        "/images"
      )
    ) {
      return image;
    }

    return image;
  };

  const getCategoryName = (
    productData
  ) => {
    if (
      typeof productData
        ?.category ===
        "object" &&
      productData?.category !==
        null
    ) {
      return (
        productData.category
          .name || "Khác"
      );
    }

    return (
      productData
        ?.category_name ||
      productData?.category ||
      "Khác"
    );
  };

  const formatPrice = (
    price
  ) => {
    return (
      `${Number(
        price || 0
      ).toLocaleString(
        "vi-VN"
      )} đ`
    );
  };

  const handleAddToCart =
    () => {
      if (!product) {
        return;
      }

      const stock = Number(
        product.stock ?? 0
      );

      if (stock <= 0) {
        alert(
          "Sản phẩm đã hết hàng."
        );

        return;
      }

      addToCart(product);

      alert(
        `Đã thêm "${product.name}" vào giỏ hàng`
      );
    };

  const handleImageError = (
    event
  ) => {
    event.currentTarget.onerror =
      null;

    event.currentTarget.src =
      FALLBACK_IMAGE;
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <Header
          currentUser={
            currentUser
          }
          cartCount={
            cartCount
          }
        />

        <div
          style={styles.emptyBox}
        >
          <h2>
            Đang tải chi tiết
            sản phẩm...
          </h2>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={styles.page}>
        <Header
          currentUser={
            currentUser
          }
          cartCount={
            cartCount
          }
        />

        <div
          style={styles.emptyBox}
        >
          <h1>
            Không tìm thấy sản
            phẩm
          </h1>

          <p>
            {errorMessage ||
              "Sản phẩm này không tồn tại hoặc đã bị xóa."}
          </p>

          <button
            type="button"
            style={
              styles.backBtn
            }
            onClick={() =>
              navigate(
                "/products"
              )
            }
          >
            Quay lại sản phẩm
          </button>
        </div>
      </div>
    );
  }

  const stock = Number(
    product.stock ?? 0
  );

  const outOfStock =
    stock <= 0;

  return (
    <div style={styles.page}>
      <Header
        currentUser={
          currentUser
        }
        cartCount={
          cartCount
        }
      />

      <section
        style={
          styles.detailBox
        }
      >
        <div
          style={
            styles.imageBox
          }
        >
          <img
            src={getImageUrl(
              product
            )}
            alt={
              product.name ||
              "Sản phẩm ShopHub"
            }
            style={
              styles.productImg
            }
            onError={
              handleImageError
            }
          />
        </div>

        <div
          style={
            styles.infoBox
          }
        >
          <span
            style={
              styles.category
            }
          >
            {getCategoryName(
              product
            )}
          </span>

          <h1
            style={
              styles.productName
            }
          >
            {product.name}
          </h1>

          <p
            style={
              styles.description
            }
          >
            {product.description ||
              "Chưa có mô tả sản phẩm."}
          </p>

          <p
            style={
              styles.price
            }
          >
            {formatPrice(
              product.price
            )}
          </p>

          <p
            style={
              styles.stock
            }
          >
            Kho: {stock} sản
            phẩm
          </p>

          <div
            style={
              styles.actions
            }
          >
            <button
              type="button"
              style={{
                ...styles.cartBtn,

                opacity:
                  outOfStock
                    ? 0.6
                    : 1,

                cursor:
                  outOfStock
                    ? "not-allowed"
                    : "pointer",
              }}
              onClick={
                handleAddToCart
              }
              disabled={
                outOfStock
              }
            >
              {outOfStock
                ? "Hết hàng"
                : "Thêm vào giỏ hàng"}
            </button>

            <button
              type="button"
              style={
                styles.backBtn
              }
              onClick={() =>
                navigate(
                  "/products"
                )
              }
            >
              Quay lại sản phẩm
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Header({
  currentUser,
  cartCount,
}) {
  const isAdmin =
    currentUser?.role ===
      "admin" ||
    currentUser?.role ===
      "ADMIN";

  return (
    <header
      style={styles.header}
    >
      <Link
        to="/"
        style={styles.logo}
      >
        <div
          style={
            styles.logoBox
          }
        >
          S
        </div>

        <h1
          style={
            styles.logoText
          }
        >
          Shop
          <span
            style={{
              color:
                "#1769ff",
            }}
          >
            Hub
          </span>
        </h1>
      </Link>

      <nav
        style={styles.nav}
      >
        <Link
          style={
            styles.navLink
          }
          to="/"
        >
          Trang chủ
        </Link>

        <Link
          style={
            styles.activeLink
          }
          to="/products"
        >
          Sản phẩm
        </Link>

        <Link
          style={
            styles.navLink
          }
          to="/cart"
        >
          Giỏ hàng 🛒 (
          {cartCount})
        </Link>

        <Link
          style={
            styles.navLink
          }
          to="/orders"
        >
          Đơn hàng 🧾
        </Link>

        {isAdmin && (
          <Link
            style={
              styles.navLink
            }
            to="/admin/products"
          >
            Admin
          </Link>
        )}
      </nav>
    </header>
  );
}

const styles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    padding:
      "0 115px 40px",
    backgroundColor:
      "#ffffff",
    color: "#111827",
    boxSizing:
      "border-box",
  },

  header: {
    height: "78px",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "space-between",
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
    backgroundColor:
      "#1769ff",
    color: "white",
    borderRadius: "10px",
    fontSize: "26px",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "center",
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
    borderBottom:
      "3px solid #1769ff",
    paddingBottom: "24px",
  },

  detailBox: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "45px",
    marginTop: "80px",
    border:
      "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "35px",
    boxShadow:
      "0 8px 22px rgba(0,0,0,0.04)",
  },

  imageBox: {
    backgroundColor:
      "#f3f8ff",
    borderRadius: "12px",
    height: "420px",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "center",
  },

  productImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: "25px",
    boxSizing:
      "border-box",
  },

  infoBox: {
    display: "flex",
    flexDirection:
      "column",
    justifyContent:
      "center",
  },

  category: {
    display:
      "inline-block",
    width: "fit-content",
    backgroundColor:
      "#dbeafe",
    color: "#1769ff",
    padding: "7px 15px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "700",
    marginBottom: "15px",
  },

  productName: {
    fontSize: "38px",
    margin:
      "0 0 15px",
  },

  description: {
    fontSize: "17px",
    lineHeight: "1.6",
    color: "#6b7280",
    marginBottom: "20px",
  },

  price: {
    color: "#1769ff",
    fontSize: "30px",
    fontWeight: "800",
    marginBottom: "10px",
  },

  stock: {
    color: "#4b5563",
    fontSize: "16px",
    marginBottom: "25px",
  },

  actions: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
  },

  cartBtn: {
    backgroundColor:
      "#1769ff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "14px 24px",
    fontWeight: "700",
    fontSize: "16px",
  },

  backBtn: {
    backgroundColor:
      "#111827",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "14px 24px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "16px",
  },

  emptyBox: {
    marginTop: "100px",
    textAlign: "center",
    padding: "60px",
    border:
      "1px solid #e5e7eb",
    borderRadius: "12px",
    color: "#111827",
  },
};

export default ProjectDetailPage;