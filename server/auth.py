# server/auth.py

import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

# ---------------- CONFIG ----------------

SECRET_KEY = os.getenv("JWT_SECRET", "supersecretkey123")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# 🔥 Use bcrypt_sha256 to avoid 72-byte limit issue
pwd_context = CryptContext(
    schemes=["bcrypt_sha256"],
    deprecated="auto"
)

# ---------------- PASSWORD UTILS ----------------

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify password against hash.
    Safe against long password issues.
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        print("⚠️ Password verification error:", str(e))
        return False


def get_password_hash(password: str) -> str:
    """
    Hash password securely.
    """
    return pwd_context.hash(password)

# ---------------- JWT UTILS ----------------

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT token with expiration.
    """
    to_encode = data.copy()

    expire = datetime.utcnow() + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decode JWT token safely.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload

    except JWTError as e:
        print("⚠️ JWT decode error:", str(e))
        return None