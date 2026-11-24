"""Firebase authentication module for TaskPilot."""

import json
import os
import urllib.request

import firebase_admin
from firebase_admin import auth, credentials
from google.auth import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

_service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY")
_project_id = os.getenv("FIREBASE_PROJECT_ID", "gen-lang-client-0405702773")

_firebase_admin_initialized = False

if _service_account_path and os.path.isfile(_service_account_path):
    try:
        _cred = credentials.Certificate(_service_account_path)
        firebase_admin.initialize_app(_cred, options={"projectId": _project_id})
        _firebase_admin_initialized = True
    except Exception:
        pass
else:
    try:
        firebase_admin.initialize_app(options={"projectId": _project_id})
        _firebase_admin_initialized = True
    except Exception:
        pass

_bearer_scheme = HTTPBearer()

# Cache Google public x509 certs
_certs_cache = None


def _get_google_certs():
    global _certs_cache
    if not _certs_cache:
        certs_url = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
        with urllib.request.urlopen(certs_url, timeout=10) as resp:
            _certs_cache = json.loads(resp.read().decode("utf-8"))
    return _certs_cache


def verify_token(id_token: str) -> dict:
    """Verify a Firebase ID token and return the decoded claims.

    Args:
        id_token: The Firebase ID token string.

    Returns:
        Decoded token dictionary.

    Raises:
        HTTPException: 401 if the token is invalid or expired.
    """
    # 1. Try Firebase Admin SDK verification
    if _firebase_admin_initialized:
        try:
            return auth.verify_id_token(id_token)
        except Exception:
            pass

    # 2. Cryptographic JWT signature verification against Google's public keys
    try:
        certs = _get_google_certs()
        claims = jwt.decode(
            id_token,
            certs=certs,
            audience=_project_id,
        )
        if claims.get("iss") != f"https://securetoken.google.com/{_project_id}":
            raise ValueError(f"Invalid issuer: {claims.get('iss')}")
        return claims
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {exc}",
        )


async def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
) -> dict:
    """FastAPI dependency that extracts and verifies the Bearer token."""
    return verify_token(creds.credentials)
