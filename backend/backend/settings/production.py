"""
Django settings — PRODUCTION
Usage : DJANGO_SETTINGS_MODULE=backend.settings.production
"""

from .base import *  # noqa: F401, F403
import os

# ── Mode debug ────────────────────────────────────────────────────────────────
# Mettre DEBUG=True dans .env pour voir les erreurs Python en clair
DEBUG = os.environ.get('DEBUG', 'False').lower() in ('true', '1', 'yes')

# ── Hôtes autorisés ───────────────────────────────────────────────────────────
_hosts_raw = os.environ.get(
    'ALLOWED_HOSTS_LIST',
    'mixmatchfrip.com,www.mixmatchfrip.com,backend.mixmatchfrip.com'
)
ALLOWED_HOSTS = [h.strip() for h in _hosts_raw.split(',') if h.strip()]

# ── CORS ─────────────────────────────────────────────────────────────────────
_cors_raw = os.environ.get(
    'CORS_ORIGINS_LIST',
    'https://mixmatchfrip.com,https://www.mixmatchfrip.com'
)
CORS_ALLOWED_ORIGINS  = [o.strip() for o in _cors_raw.split(',') if o.strip()]
CORS_ALLOW_CREDENTIALS = True

# ── CSRF ─────────────────────────────────────────────────────────────────────
_csrf_raw = os.environ.get(
    'CSRF_ORIGINS_LIST',
    'https://mixmatchfrip.com,https://www.mixmatchfrip.com'
)
CSRF_TRUSTED_ORIGINS = [o.strip() for o in _csrf_raw.split(',') if o.strip()]

# ── Sécurité HTTPS ────────────────────────────────────────────────────────────
# Sur cPanel/LWS, Apache gère le SSL — Django ne doit PAS rediriger
SECURE_SSL_REDIRECT            = False
SECURE_HSTS_SECONDS            = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD            = True
SECURE_PROXY_SSL_HEADER        = ('HTTP_X_FORWARDED_PROTO', 'https')

SESSION_COOKIE_SECURE  = True
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SECURE     = True

# ── Journalisation ────────────────────────────────────────────────────────────
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'root': {
        'handlers': ['console'],
        'level': 'WARNING',
    },
}
