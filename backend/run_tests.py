"""
MixMatchFrip — Script de lancement des tests
=============================================
Exécute les tests unitaires Django ET les tests de charge Locust.

Usage
-----
    # Tests unitaires uniquement (rapide, ~10s)
    python run_tests.py unit

    # Tests de charge — interface web sur http://localhost:8089
    python run_tests.py load

    # Tests de charge headless (50 utilisateurs, 60s)
    python run_tests.py load --headless -u 50 -r 5 --run-time 60s

    # Les deux (CI)
    python run_tests.py all
"""

import subprocess
import sys


def run_unit_tests():
    print("\n" + "═" * 60)
    print("  TESTS UNITAIRES (Django)")
    print("═" * 60)
    result = subprocess.run(
        [sys.executable, "manage.py", "test", "api", "--verbosity=2"],
        check=False,
    )
    return result.returncode


def run_load_tests(extra_args: list[str]):
    print("\n" + "═" * 60)
    print("  TESTS DE CHARGE (Locust)")
    print("═" * 60)

    # Vérifie que locust est installé
    try:
        import locust  # noqa: F401
    except ImportError:
        print("\n⚠  Locust n'est pas installé.")
        print("   Installez-le avec :  pip install locust\n")
        return 1

    cmd = [sys.executable, "-m", "locust", "-f", "locustfile.py"] + extra_args
    if not any(a.startswith("--host") for a in extra_args):
        cmd += ["--host", "http://localhost:8000"]

    print(f"Commande : {' '.join(cmd)}\n")
    result = subprocess.run(cmd, check=False)
    return result.returncode


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args or args[0] in ("-h", "--help"):
        print(__doc__)
        sys.exit(0)

    mode = args[0]
    extra = args[1:]

    if mode == "unit":
        sys.exit(run_unit_tests())

    elif mode == "load":
        sys.exit(run_load_tests(extra))

    elif mode == "all":
        code_unit = run_unit_tests()
        if code_unit != 0:
            print("\n❌  Tests unitaires échoués — tests de charge annulés.")
            sys.exit(code_unit)
        sys.exit(run_load_tests(extra))

    else:
        print(f"Mode inconnu : {mode!r}")
        print("Modes valides : unit | load | all")
        sys.exit(1)
