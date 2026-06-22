from sqlalchemy import Column, Integer, String
from database import Base

class ProjectDB(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    location = Column(String)