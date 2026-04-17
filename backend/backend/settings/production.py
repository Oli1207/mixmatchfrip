"""
Django settings — PRODUCTION
Usage : DJANGO_SETTINGS_MODULE=backend.settings.production

Variables d'environnement OBLIGATOIRES en plus de celles de base :
  ALLOWED_HOSTS_LIST   ex: "monsite.ca,www.monsite.ca"
  CORS_ORIGINS_LIST    ex: "https://monsite.ca,https://www.monsite.ca"
  CSRF_ORIGINS_LIST    ex: "https://monsite.ca"
"""

from .base import *  # noqa: F401, F403
from environs import env as _env

# ── Mode debug (désactiver après avoir résolu les 500) ───────────────────────
# Mettre DEBUG=True dans .env temporairement pour voir les erreurs Python
import os as _os
DEBUG = _os.environ.get('DEBUG', 'False').lower() in ('true', '1', 'yes')

# ── Hôtes autorisés (fournis par variable d'env) ──────────────────────────────
_hosts_raw = _env.str('ALLOWED_HOSTS_LIST', default='localhost')
ALLOWED_HOSTS = [h.strip() for h in _hosts_raw.split(',') if h.strip()]

# ── CORS ─────────────────────────────────────────────────────────────────────
_cors_raw = _env.str('CORS_ORIGINS_LIST', default='')
CORS_ALLOWED_ORIGINS = [o.strip() for o in _cors_raw.split(',') if o.strip()]
CORS_ALLOW_CREDENTIALS = True

# ── CSRF ─────────────────────────────────────────────────────────────────────
_csrf_raw = _env.str('CSRF_ORIGINS_LIST', default='')
CSRF_TRUSTED_ORIGINS = [o.strip() for o in _csrf_raw.split(',') if o.strip()]

# ── Sécurité HTTPS ────────────────────────────────────────────────────────────
# NOTE: Sur cPanel/LWS, Apache gère le SSL — ne pas rediriger via Django
# (SECURE_SSL_REDIRECT=True causerait une boucle infinie)
SECURE_SSL_REDIRECT             = False
SECURE_HSTS_SECONDS             = 31536000   # 1 an
SECURE_HSTS_INCLUDE_SUBDOMAINS  = True
SECURE_HSTS_PRELOAD             = True
SECURE_PROXY_SSL_HEADER         = ('HTTP_X_FORWARDED_PROTO', 'https')

SESSION_COOKIE_SECURE   = True
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SECURE      = True

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
