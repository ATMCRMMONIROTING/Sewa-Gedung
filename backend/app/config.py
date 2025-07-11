import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path, override=False)  # keep existing env vars

DATABASE_URL = os.environ.get("DATABASE_URL")  # read actual runtime value
SECRET_KEY = os.environ.get("SECRET_KEY")