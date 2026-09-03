import os

os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+psycopg://gravity:gravity_dev_password@localhost:5432/gravity_siem_test",
)

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.database import Base
from app.seed import seed_rules


@pytest.fixture()
def db_session():
    engine = create_engine(settings.database_url, future=True)
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(bind=engine, future=True)
    session = TestingSession()
    seed_rules(session)
    try:
        yield session
    finally:
        session.rollback()
        for table in reversed(Base.metadata.sorted_tables):
            session.execute(table.delete())
        session.commit()
        session.close()