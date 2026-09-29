import base64
import zlib

from cryptography.fernet import Fernet

from app.core.config import settings

if not settings.ENCRYPTION_KEY:
    raise RuntimeError("ENCRYPTION_KEY is not configured")


cipher = Fernet(settings.ENCRYPTION_KEY.encode())


def encrypt_text(text: str) -> str:
    """
    Compress text first, then encrypt it.
    """

    compressed_data = zlib.compress(
        text.encode("utf-8"),
        level=9,
    )

    encrypted_data = cipher.encrypt(compressed_data)

    return base64.urlsafe_b64encode(encrypted_data).decode("utf-8")


def decrypt_text(encrypted_text: str) -> str:
    """
    Decode, decrypt and decompress text.
    """

    encrypted_data = base64.urlsafe_b64decode(encrypted_text.encode("utf-8"))

    compressed_data = cipher.decrypt(encrypted_data)

    original_text = zlib.decompress(compressed_data).decode("utf-8")

    return original_text
