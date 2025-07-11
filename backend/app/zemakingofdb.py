from .db import Base, engine
from . import models  # This ensures models are registered

print("Creating database...")
Base.metadata.create_all(bind=engine)
print("Database created!")