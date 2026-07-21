import os
import sys

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.orm_models import Category, Order, OrderItem, Product, User


# =========================================================
# CẤU HÌNH DATABASE
# =========================================================

LOCAL_DATABASE_URL = os.getenv("LOCAL_DATABASE_URL")
RAILWAY_DATABASE_URL = os.getenv("RAILWAY_DATABASE_URL")


def normalize_url(url: str) -> str:
    """
    Chuyển postgres:// thành postgresql:// để SQLAlchemy sử dụng.
    """
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)

    return url


if not LOCAL_DATABASE_URL:
    print("Lỗi: Chưa thiết lập LOCAL_DATABASE_URL.")
    sys.exit(1)

if not RAILWAY_DATABASE_URL:
    print("Lỗi: Chưa thiết lập RAILWAY_DATABASE_URL.")
    sys.exit(1)


LOCAL_DATABASE_URL = normalize_url(LOCAL_DATABASE_URL)
RAILWAY_DATABASE_URL = normalize_url(RAILWAY_DATABASE_URL)


# =========================================================
# TẠO KẾT NỐI DATABASE
# =========================================================

local_engine = create_engine(
    LOCAL_DATABASE_URL,
    pool_pre_ping=True,
)

railway_engine = create_engine(
    RAILWAY_DATABASE_URL,
    pool_pre_ping=True,
)

LocalSession = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=local_engine,
)

RailwaySession = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=railway_engine,
)


# =========================================================
# XỬ LÝ HÌNH ẢNH
# =========================================================

def convert_image_url(image_url: str | None) -> str | None:
    """
    Ảnh localhost sẽ không thể hiển thị trên website đã deploy.
    Tạm thay bằng ảnh placeholder.
    """

    if not image_url:
        return image_url

    if "localhost" in image_url or "127.0.0.1" in image_url:
        return "https://placehold.co/600x400?text=ShopHub+Product"

    return image_url


# =========================================================
# ĐỒNG BỘ ID SEQUENCE POSTGRESQL
# =========================================================

def reset_sequence(db, table_name: str) -> None:
    """
    Đồng bộ bộ đếm ID sau khi chèn dữ liệu có ID thủ công.
    """

    db.execute(
        text(
            f"""
            SELECT setval(
                pg_get_serial_sequence('{table_name}', 'id'),
                COALESCE((SELECT MAX(id) FROM {table_name}), 1),
                true
            )
            """
        )
    )


# =========================================================
# CHUYỂN TOÀN BỘ DỮ LIỆU
# =========================================================

def migrate_all() -> None:
    local_db = LocalSession()
    railway_db = RailwaySession()

    try:
        print("Đang đọc dữ liệu PostgreSQL local...")

        local_categories = (
            local_db.query(Category)
            .order_by(Category.id)
            .all()
        )

        local_products = (
            local_db.query(Product)
            .order_by(Product.id)
            .all()
        )

        local_users = (
            local_db.query(User)
            .order_by(User.id)
            .all()
        )

        local_orders = (
            local_db.query(Order)
            .order_by(Order.id)
            .all()
        )

        local_order_items = (
            local_db.query(OrderItem)
            .order_by(OrderItem.id)
            .all()
        )

        print("")
        print("Dữ liệu tìm thấy ở local:")
        print(f"- Categories: {len(local_categories)}")
        print(f"- Products: {len(local_products)}")
        print(f"- Users: {len(local_users)}")
        print(f"- Orders: {len(local_orders)}")
        print(f"- Order items: {len(local_order_items)}")

        # =================================================
        # KIỂM TRA DỮ LIỆU RAILWAY
        # =================================================

        railway_counts = {
            "categories": railway_db.query(Category).count(),
            "products": railway_db.query(Product).count(),
            "users": railway_db.query(User).count(),
            "orders": railway_db.query(Order).count(),
            "order_items": railway_db.query(OrderItem).count(),
        }

        print("")
        print("Dữ liệu hiện có trên Railway:")

        for table_name, count in railway_counts.items():
            print(f"- {table_name}: {count}")

        # Categories được phép có sẵn.
        # Các bảng còn lại phải trống để tránh trùng dữ liệu.
        if (
            railway_counts["products"] > 0
            or railway_counts["users"] > 0
            or railway_counts["orders"] > 0
            or railway_counts["order_items"] > 0
        ):
            print("")
            print("Railway đã có dữ liệu sản phẩm, người dùng hoặc đơn hàng.")
            print("Script dừng để tránh tạo dữ liệu trùng.")
            print("Không có dữ liệu nào được thay đổi.")
            return

        # =================================================
        # 1. CATEGORIES
        # =================================================

        print("")
        print("1/5 - Đang chuyển categories...")

        for row in local_categories:
            existing_category = (
                railway_db.query(Category)
                .filter(Category.id == row.id)
                .first()
            )

            if existing_category:
                existing_category.name = row.name
                print(
                    f"- Category ID {row.id} đã tồn tại, "
                    f"đã cập nhật tên: {row.name}"
                )
            else:
                railway_db.add(
                    Category(
                        id=row.id,
                        name=row.name,
                    )
                )

                print(
                    f"- Đã thêm category ID {row.id}: {row.name}"
                )

        railway_db.flush()

        # =================================================
        # 2. PRODUCTS
        # =================================================

        print("")
        print("2/5 - Đang chuyển products...")

        for row in local_products:
            railway_db.add(
                Product(
                    id=row.id,
                    name=row.name,
                    price=row.price,
                    image=convert_image_url(row.image),
                    description=row.description,
                    stock=row.stock,
                    category_id=row.category_id,
                )
            )

        railway_db.flush()

        print(f"- Đã thêm {len(local_products)} sản phẩm.")

        # =================================================
        # 3. USERS
        # =================================================

        print("")
        print("3/5 - Đang chuyển users...")

        for row in local_users:
            railway_db.add(
                User(
                    id=row.id,
                    name=row.name,
                    email=row.email,
                    hashed_password=row.hashed_password,
                    role=row.role,
                )
            )

        railway_db.flush()

        print(f"- Đã thêm {len(local_users)} người dùng.")

        # =================================================
        # 4. ORDERS
        # =================================================

        print("")
        print("4/5 - Đang chuyển orders...")

        for row in local_orders:
            railway_db.add(
                Order(
                    id=row.id,
                    user_id=row.user_id,
                    user_email=row.user_email,
                    total_price=row.total_price,
                    status=row.status,
                    shipping_name=row.shipping_name,
                    shipping_phone=row.shipping_phone,
                    shipping_address=row.shipping_address,
                    payment_method=row.payment_method,
                    payment_status=row.payment_status,
                    vnp_txn_ref=row.vnp_txn_ref,
                    vnp_transaction_no=row.vnp_transaction_no,
                    vnp_response_code=row.vnp_response_code,
                    paid_at=row.paid_at,
                    note=row.note,
                    created_at=row.created_at,
                )
            )

        railway_db.flush()

        print(f"- Đã thêm {len(local_orders)} đơn hàng.")

        # =================================================
        # 5. ORDER ITEMS
        # =================================================

        print("")
        print("5/5 - Đang chuyển order_items...")

        for row in local_order_items:
            railway_db.add(
                OrderItem(
                    id=row.id,
                    order_id=row.order_id,
                    product_id=row.product_id,
                    quantity=row.quantity,
                    price=row.price,
                    product_name=row.product_name,
                    product_image=convert_image_url(
                        row.product_image
                    ),
                    product_category=row.product_category,
                )
            )

        railway_db.flush()

        print(
            f"- Đã thêm {len(local_order_items)} chi tiết đơn hàng."
        )

        # =================================================
        # ĐỒNG BỘ SEQUENCE
        # =================================================

        print("")
        print("Đang đồng bộ bộ đếm ID...")

        for table_name in [
            "categories",
            "products",
            "users",
            "orders",
            "order_items",
        ]:
            reset_sequence(railway_db, table_name)

        railway_db.commit()

        # =================================================
        # KIỂM TRA SAU KHI CHUYỂN
        # =================================================

        final_counts = {
            "categories": railway_db.query(Category).count(),
            "products": railway_db.query(Product).count(),
            "users": railway_db.query(User).count(),
            "orders": railway_db.query(Order).count(),
            "order_items": railway_db.query(OrderItem).count(),
        }

        print("")
        print("==========================================")
        print("CHUYỂN TOÀN BỘ DỮ LIỆU THÀNH CÔNG")
        print("==========================================")

        for table_name, count in final_counts.items():
            print(f"- {table_name}: {count}")

    except Exception as error:
        railway_db.rollback()

        print("")
        print("==========================================")
        print("CHUYỂN DỮ LIỆU THẤT BẠI")
        print("==========================================")
        print(f"Lỗi: {error}")
        print("")
        print("Railway đã rollback.")
        print("Dữ liệu trong lần chạy này chưa được lưu.")

        sys.exit(1)

    finally:
        local_db.close()
        railway_db.close()


if __name__ == "__main__":
    migrate_all()