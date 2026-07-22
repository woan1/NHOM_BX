from sqlalchemy import text

from app.db import engine


def run_migration():
    print("Đang thêm product_id vào visit_logs...")

    with engine.begin() as connection:
        connection.execute(
            text(
                """
                ALTER TABLE visit_logs
                ADD COLUMN IF NOT EXISTS product_id INTEGER NULL
                """
            )
        )

        connection.execute(
            text(
                """
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_constraint
                        WHERE conname = 'fk_visit_logs_product'
                    ) THEN
                        ALTER TABLE visit_logs
                        ADD CONSTRAINT fk_visit_logs_product
                        FOREIGN KEY (product_id)
                        REFERENCES products(id)
                        ON DELETE SET NULL;
                    END IF;
                END
                $$;
                """
            )
        )

        connection.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS
                ix_visit_logs_product_id
                ON visit_logs(product_id)
                """
            )
        )

    print("Đã thêm product_id thành công.")


if __name__ == "__main__":
    run_migration()