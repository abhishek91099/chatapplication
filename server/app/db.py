from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from app.models.model import Base
from app.config import Config

engine = create_engine(Config.SQLALCHEMY_DATABASE_URI)
db_session = scoped_session(sessionmaker(bind=engine, autocommit=False, autoflush=False))

# Only run once (e.g., during app initialization)
Base.metadata.create_all(bind=engine)
