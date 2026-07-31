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
import "./ProjectDetailPage.css";
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
      <div className="product-detail-page">
        <Header
          currentUser={
            currentUser
          }
          cartCount={
            cartCount
          }
        />

        <div
          className="product-detail-state"
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
      <div className="product-detail-page">
        <Header
          currentUser={
            currentUser
          }
          cartCount={
            cartCount
          }
        />

        <div
          className="product-detail-state"
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
            className="product-detail-back-button"
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
    <div className="product-detail-page">
      <Header
        currentUser={
          currentUser
        }
        cartCount={
          cartCount
        }
      />

      <section
        className="product-detail-card"
      >
        <div className="product-detail-image-panel">
          <span className="product-detail-image-badge">
            ShopHub Authentic
          </span>
          <img
            src={getImageUrl(
              product
            )}
            alt={
              product.name ||
              "Sản phẩm ShopHub"
            }
            className="product-detail-image"
            onError={
              handleImageError
            }
          />
        </div>

        <div className="product-detail-info">
          <span className="product-detail-kicker">
            Sản phẩm chính hãng
          </span>
          <span
            className="product-detail-category"
          >
            {getCategoryName(
              product
            )}
          </span>

          <h1
            className="product-detail-name"
          >
            {product.name}
          </h1>

          <p
            className="product-detail-description"
          >
            {product.description ||
              "Chưa có mô tả sản phẩm."}
          </p>

          <p
            className="product-detail-price"
          >
            {formatPrice(
              product.price
            )}
          </p>

          <p
            className="product-detail-stock-text"
          >
            Kho: {stock} sản
            phẩm
          </p>

          <div
            className="product-detail-actions"
          >
            <button
              type="button"
              className="product-detail-cart-button"
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
              className="product-detail-back-button"
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
      className="product-detail-header"
    >
      <Link
        to="/"
        className="product-detail-logo"
      >
        <div
          className="product-detail-logo-box"
        >
          S
        </div>

        <h1
          className="product-detail-logo-text"
        >
          Shop
          <span
            className="product-detail-logo-highlight"
          >
            Hub
          </span>
        </h1>
      </Link>

      <nav
        className="product-detail-nav"
      >
        <Link
          className="product-detail-nav-link"
          to="/"
        >
          Trang chủ
        </Link>

        <Link
          className="product-detail-nav-link active"
          to="/products"
        >
          Sản phẩm
        </Link>

        <Link
          className="product-detail-nav-link"
          to="/cart"
        >
          Giỏ hàng 🛒 (
          {cartCount})
        </Link>

        <Link
          className="product-detail-nav-link"
          to="/orders"
        >
          Đơn hàng 🧾
        </Link>

        {isAdmin && (
          <Link
            className="product-detail-nav-link"
            to="/admin/products"
          >
            Admin
          </Link>
        )}
      </nav>
    </header>
  );
}


export default ProjectDetailPage;