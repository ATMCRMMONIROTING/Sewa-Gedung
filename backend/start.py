import os
import sys

if len(sys.argv) > 1:
    db_path = sys.argv[1]
else:
    db_path = "app.db"

os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"

os.environ["SECRET_KEY"] = "4f6b3a8e2c7d49a8f39ddf5e14f12387c6e45a2ef9cce6be2adf439a7bde9e45"

import uvicorn
from app.main import app

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
