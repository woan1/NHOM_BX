from sqlalchemy import inspect, text

from app.db import engine


def show_order_columns():
    inspector = inspect(engine)

    columns = inspector.get_columns("orders")

    print("\nCác cột hiện tại của bảng orders:")

    for column in columns:
        print("-", column["name"])


def run_migration():
    print("Đang kiểm tra database...")

    statements = [
        """
        ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS product_total
        INTEGER NOT NULL DEFAULT 0
        """,
        """
        ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS shipping_fee
        INTEGER NOT NULL DEFAULT 0
        """,
        """
        ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS shipping_province
        VARCHAR
        """,
        """
        ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS shipping_district
        VARCHAR
        """,
        """
        ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS shipping_ward
        VARCHAR
        """,
        """
        UPDATE orders
        SET product_total = COALESCE(total_price, 0)
        WHERE product_total = 0
        """,
        """
        UPDATE orders
        SET shipping_fee = 0
        WHERE shipping_fee IS NULL
        """,
    ]

    with engine.begin() as connection:
        for index, statement in enumerate(
            statements,
            start=1,
        ):
            print(f"Đang chạy câu lệnh {index}...")

            connection.execute(text(statement))

    print("\nCập nhật database thành công.")

    show_order_columns()


if __name__ == "__main__":
    run_migration()