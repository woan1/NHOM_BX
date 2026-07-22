from app.db import Base, engine
from app.orm_models import VisitLog

print("Đang tạo bảng visit_logs...")

Base.metadata.create_all(bind=engine)

print("Đã tạo bảng visit_logs thành công.")