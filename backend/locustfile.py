"""
MixMatchFrip — Locust Load Testing
====================================
Simule des utilisateurs simultanés sur l'API Django.

Installation
------------
    pip install locust

Lancement (développement local)
--------------------------------
    locust -f locustfile.py --host=http://localhost:8000

    Puis ouvrir http://localhost:8089 dans le navigateur.
    → Entrer le nombre d'utilisateurs et le taux de montée en charge (spawn rate).

Lancement en mode headless (CI / terminal uniquement)
------------------------------------------------------
    locust -f locustfile.py --host=http://localhost:8000 \
        --headless -u 100 -r 10 --run-time 60s

    -u  : nombre total d'utilisateurs simultanés
    -r  : utilisateurs ajoutés par seconde (spawn rate)
    --run-time : durée du test

Lancement sur production
--------------------------
    locust -f locustfile.py --host=https://backend.mixmatchfrip.com \
        --headless -u 200 -r 20 --run-time 120s

Interpréter les résultats
--------------------------
    - RPS (Requests/s) > 50 avec < 500 ms médiane = bon
    - Taux d'échec < 1 % = acceptable
    - P95 < 2 000 ms = expérience utilisateur correcte
    - Si P99 > 5 000 ms ou failures > 5 % → goulot d'étranglement

Scénarios simulés
------------------
    VisitorUser   (60 %) — Navigation anonyme : catalogue, filtres, fiche produit
    CartUser      (30 %) — Panier : ajout, mise à jour, suppression, code promo
    NewsletterUser(10 %) — Newsletter + validation code promo (sans achat)
"""

import random
import string
import uuid

from locust import HttpUser, TaskSet, between, events, task

# Préfixe commun à tous les endpoints
API = "/api/v1"

# ─── Données partagées entre workers ─────────────────────────────────────────

_product_slugs: list[str] = []
_category_slugs: list[str] = []


@events.test_start.add_listener
def fetch_seed_data(environment, **kwargs):
    """Récupère les slugs de produits et catégories au démarrage du test."""
    host = environment.host.rstrip('/')
    import urllib.request, json

    # Produits
    try:
        with urllib.request.urlopen(f"{host}{API}/products/?page_size=50") as resp:
            data = json.loads(resp.read())
            results = data.get('results', data) if isinstance(data, dict) else data
            for p in results:
                if isinstance(p, dict) and p.get('slug'):
                    _product_slugs.append(p['slug'])
        print(f"[Locust] {len(_product_slugs)} product slugs loaded.")
    except Exception as e:
        print(f"[Locust] Could not load products: {e}")

    # Catégories
    try:
        with urllib.request.urlopen(f"{host}{API}/categories/") as resp:
            data = json.loads(resp.read())
            results = data.get('results', data) if isinstance(data, dict) else data
            for c in results:
                if isinstance(c, dict) and c.get('slug'):
                    _category_slugs.append(c['slug'])
        print(f"[Locust] {len(_category_slugs)} category slugs loaded.")
    except Exception as e:
        print(f"[Locust] Could not load categories: {e}")


# ─── Helpers ─────────────────────────────────────────────────────────────────

def random_email() -> str:
    suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"loadtest_{suffix}@example.com"


def random_cart_id() -> str:
    return f"locust_{uuid.uuid4().hex[:12]}"


# ─── TaskSets ────────────────────────────────────────────────────────────────

class BrowsingTasks(TaskSet):
    """Navigation anonyme — catalogue, filtres, fiches produits."""

    @task(3)
    def catalogue_default(self):
        self.client.get(f"{API}/products/", name="products [default]")

    @task(2)
    def catalogue_filtered_category(self):
        if _category_slugs:
            cat = random.choice(_category_slugs)
            self.client.get(
                f"{API}/products/?category={cat}",
                name="products [category filter]",
            )

    @task(2)
    def catalogue_filtered_size(self):
        size = random.choice(['XS', 'S', 'M', 'L', 'XL', 'XXL'])
        self.client.get(
            f"{API}/products/?size={size}",
            name="products [size filter]",
        )

    @task(1)
    def catalogue_search(self):
        term = random.choice(['robe', 'veste', 'manteau', 'jupe', 'dress', 'jacket'])
        self.client.get(
            f"{API}/products/?search={term}",
            name="products [search]",
        )

    @task(2)
    def product_detail(self):
        if _product_slugs:
            slug = random.choice(_product_slugs)
            self.client.get(
                f"{API}/products/{slug}/",
                name="products/<slug>/",
            )

    @task(1)
    def categories_list(self):
        self.client.get(f"{API}/categories/", name="categories/")

    @task(1)
    def catalogue_sorted(self):
        sort = random.choice(['price_asc', 'price_desc', 'newest'])
        self.client.get(
            f"{API}/products/?sort={sort}",
            name="products [sort]",
        )


class CartTasks(TaskSet):
    """Simulation d'un visiteur qui ajoute des articles au panier."""

    def on_start(self):
        self.cart_id = random_cart_id()
        self._add_item_to_cart()

    def _add_item_to_cart(self):
        """Ajoute un produit aléatoire au panier de ce visiteur."""
        if not _product_slugs:
            return
        slug = random.choice(_product_slugs)
        with self.client.get(
            f"{API}/products/{slug}/",
            name="products/<slug>/ [cart prep]",
            catch_response=True,
        ) as resp:
            if resp.status_code == 200:
                try:
                    product_id = resp.json().get('id')
                    if product_id:
                        self.client.post(
                            f"{API}/cart/add/",
                            json={"product_id": product_id, "qty": 1, "cart_id": self.cart_id},
                            name="cart/add/",
                        )
                except Exception:
                    pass

    @task(4)
    def view_cart(self):
        self.client.get(
            f"{API}/cart/?cart_id={self.cart_id}",
            name="cart/ [get]",
        )

    @task(2)
    def add_another_item(self):
        self._add_item_to_cart()

    @task(1)
    def apply_valid_promo(self):
        """Tente d'appliquer un code promo valide (non first_order_only)."""
        self.client.get(
            f"{API}/cart/?cart_id={self.cart_id}",
            name="cart/ [before promo]",
        )
        self.client.post(
            f"{API}/promo/apply/",
            json={"code": "LOCUST10", "cart_id": self.cart_id, "email": random_email()},
            name="promo/apply/ [valid attempt]",
        )

    @task(1)
    def apply_invalid_promo(self):
        """Tente un code promo inexistant — vérifie que le 404/400 est géré proprement."""
        with self.client.post(
            f"{API}/promo/apply/",
            json={"code": "XXXXXXXX", "cart_id": self.cart_id},
            name="promo/apply/ [invalid]",
            catch_response=True,
        ) as resp:
            if resp.status_code in (400, 404):
                resp.success()  # Comportement attendu


class NewsletterTasks(TaskSet):
    """Souscription newsletter — formulaire footer et popup."""

    @task(3)
    def subscribe_footer(self):
        self.client.post(
            f"{API}/newsletter/subscribe/",
            json={"email": random_email(), "source": "footer"},
            name="newsletter/subscribe/ [footer]",
        )

    @task(2)
    def subscribe_popup(self):
        first_names = ["Marie", "Sophie", "Léa", "Emma", "Julie", "Chloe", "Laura", "Alice"]
        self.client.post(
            f"{API}/newsletter/subscribe/",
            json={
                "email": random_email(),
                "first_name": random.choice(first_names),
                "source": "popup_promo",
            },
            name="newsletter/subscribe/ [popup_promo]",
        )

    @task(1)
    def duplicate_subscribe(self):
        """Réinscription avec le même email — doit retourner 200, pas 500."""
        email = "duplicate_test@locust.example.com"
        with self.client.post(
            f"{API}/newsletter/subscribe/",
            json={"email": email, "source": "footer"},
            name="newsletter/subscribe/ [duplicate]",
            catch_response=True,
        ) as resp:
            if resp.status_code in (200, 201):
                resp.success()

    @task(1)
    def invalid_email(self):
        """Email invalide — doit retourner 400, pas 500."""
        with self.client.post(
            f"{API}/newsletter/subscribe/",
            json={"email": "not-an-email", "source": "other"},
            name="newsletter/subscribe/ [invalid email]",
            catch_response=True,
        ) as resp:
            if resp.status_code == 400:
                resp.success()


# ─── User classes (avec weighting) ───────────────────────────────────────────

class VisitorUser(HttpUser):
    """
    60 % du trafic — internaute anonyme qui consulte le catalogue.
    Temps de réflexion : 1–4 secondes (navigation naturelle).
    """
    tasks = [BrowsingTasks]
    weight = 6
    wait_time = between(1, 4)


class CartUser(HttpUser):
    """
    30 % du trafic — visiteur actif qui ajoute des articles au panier.
    Temps de réflexion : 2–6 secondes (lecture, décision d'achat).
    """
    tasks = [CartTasks]
    weight = 3
    wait_time = between(2, 6)


class NewsletterUser(HttpUser):
    """
    10 % du trafic — visiteur qui s'inscrit à la newsletter via popup ou footer.
    Temps de réflexion : 3–8 secondes (lecture du popup, saisie email).
    """
    tasks = [NewsletterTasks]
    weight = 1
    wait_time = between(3, 8)
