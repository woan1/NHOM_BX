from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .db import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)

    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    price = Column(Integer, nullable=False)
    image = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    stock = Column(Integer, default=0)

    category_id = Column(
        Integer,
        ForeignKey("categories.id"),
        nullable=True,
    )

    category = relationship("Category", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    role = Column(String, default="user")

    orders = relationship("Order", back_populates="user")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )

    user_email = Column(String, nullable=True)

    total_price = Column(Integer, nullable=False)
    status = Column(String, default="Đang xử lý")

    shipping_name = Column(String, nullable=False)
    shipping_phone = Column(String, nullable=False)
    shipping_address = Column(String, nullable=False)

    # Phương thức thanh toán:
    # "Thanh toán khi nhận hàng" hoặc "VNPAY"
    payment_method = Column(
        String,
        default="Thanh toán khi nhận hàng",
    )

    # Trạng thái thanh toán:
    # PENDING, PAID hoặc FAILED
    payment_status = Column(
        String(20),
        default="PENDING",
        nullable=False,
    )

    # Mã giao dịch ShopHub gửi sang VNPAY
    vnp_txn_ref = Column(
        String(100),
        unique=True,
        nullable=True,
    )

    # Mã giao dịch do VNPAY trả về
    vnp_transaction_no = Column(
        String(100),
        nullable=True,
    )

    # Mã kết quả do VNPAY trả về
    vnp_response_code = Column(
        String(10),
        nullable=True,
    )

    # Thời gian thanh toán thành công
    paid_at = Column(
        DateTime,
        nullable=True,
    )

    note = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    user = relationship("User", back_populates="orders")

    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan",
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)

    order_id = Column(
        Integer,
        ForeignKey("orders.id"),
        nullable=False,
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=True,
    )

    quantity = Column(Integer, nullable=False)
    price = Column(Integer, nullable=False)

    product_name = Column(String, nullable=False)
    product_image = Column(String, nullable=True)
    product_category = Column(String, nullable=True)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")