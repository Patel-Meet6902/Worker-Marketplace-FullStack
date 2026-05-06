from sqlalchemy import create_engine,text
from sqlalchemy.orm import sessionmaker,declarative_base

Database_URl = "postgresql+psycopg://postgres:6902@localhost:5432/workers_marketplace"

engine = create_engine(Database_URl,echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


