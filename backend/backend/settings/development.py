"""
Django settings — DÉVELOPPEMENT
Usage : DJANGO_SETTINGS_MODULE=backend.settings.development
"""

from .base import *  # noqa: F401, F403

# ── Mode debug ────────────────────────────────────────────────────────────────
DEBUG = True

# ── Hôtes autorisés ───────────────────────────────────────────────────────────
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '192.168.1.10', '192.168.1.3']

# ── CORS ─────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://192.168.1.10:5173',
    'http://192.168.1.3:5173',
]
CORS_ALLOW_CREDENTIALS = True

# ── CSRF ─────────────────────────────────────────────────────────────────────
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:5173',
    'http://192.168.1.10:5173',
]

# ── Session cookie — Lax fonctionne en HTTP (localhost) ──────────────────────
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SECURE   = False   # True uniquement en HTTPS
