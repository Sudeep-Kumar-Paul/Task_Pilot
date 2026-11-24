"""Firebase authentication module for TaskPilot."""

import os

import firebase_admin
from firebase_admin import auth, credentials
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

# Initialize Firebase Admin SDK
_service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY")

if _service_account_path and os.path.isfile(_service_account_path):
    _cred = credentials.Certificate(_service_account_path)
    firebase_admin.initialize_app(_cred)
else:
    # Fall back to Application Default Credentials
    firebase_admin.initialize_app()

_bearer_scheme = HTTPBearer()


def verify_token(id_token: str) -> dict:
    """Verify a Firebase ID token and return the decoded claims.

    Args:
        id_token: The Firebase ID token string.

    Returns:
        Decoded token dictionary.

    Raises:
        HTTPException: 401 if the token is invalid or expired.
    """
    try:
        decoded = auth.verify_id_token(id_token)
        return decoded
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {exc}",
        )


async def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
) -> dict:
    """FastAPI dependency that extracts and verifies the Bearer token.

    Returns:
        Decoded Firebase token dict (contains uid, email, etc.).
    """
    return verify_token(creds.credentials)
