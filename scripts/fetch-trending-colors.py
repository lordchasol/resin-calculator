import json
import os
from datetime import datetime

MONTH_FR = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
]

# Fallback minimal si l'appel Claude échoue
FALLBACK_COLOR_CATALOG = {
    "mocha color": {
        "name": "Mocha Mousse",
        "hex": "#A07850",
        "vibe": "Chaleur terreuse et confort automnal",
        "source": "Pantone 2025",
        "resin_tip": "Mélanger avec de la poudre bronze pour un effet velours mat.",
        "default_score": 72,
    },
    "sage green color": {
        "name": "Sage Green",
        "hex": "#87A878",
        "vibe": "Nature, sérénité et minimalisme",
        "source": "Pinterest Trends",
        "resin_tip": "Combiner avec du blanc nacré pour un effet brume matinale.",
        "default_score": 65,
    },
    "butter yellow color": {
        "name": "Butter Yellow",
        "hex": "#F5E06E",
        "vibe": "Soleil doux et optimisme",
        "source": "Pinterest Trends",
        "resin_tip": "Idéal pour les pièces de décoration lumineuses en été.",
        "default_score": 58,
    },
    "clay color": {
        "name": "Clay",
        "hex": "#C4856A",
        "vibe": "Terracotta moderne et artisanal",
        "source": "Pantone",
        "resin_tip": "Associer avec du doré pour un rendu luxe méditerranéen.",
        "default_score": 55,
    },
    "digital lavender": {
        "name": "Digital Lavender",
        "hex": "#C2A9CE",
        "vibe": "Tech, rêve et douceur futuriste",
        "source": "WGSN 2025",
        "resin_tip": "Superposer avec du violet foncé pour créer de la profondeur.",
        "default_score": 60,
    },
    "peach fuzz color": {
        "name": "Peach Fuzz",
        "hex": "#FFBE98",
        "vibe": "Douceur pastel & chaleur printanière",
        "source": "Pantone 2024",
        "resin_tip": "Parfait en fond translucide avec des pigments irisés dorés.",
        "default_score": 62,
    },
    "midnight blue color": {
        "name": "Midnight Blue",
        "hex": "#1B2A4A",
        "vibe": "Profondeur mystérieuse",
        "source": "Pantone",
        "resin_tip": "Ajouter des paillettes argentées pour un effet nuit étoilée.",
        "default_score": 50,
    },
}


def fetch_catalog_from_claude(month_label: str) -> dict | None:
    """Appelle Claude Haiku pour générer les 7 couleurs tendance du mois.
    Retourne un dict au format COLOR_CATALOG, ou None si l'appel échoue."""
    import anthropic

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ANTHROPIC_API_KEY manquante — fallback catalog")
        return None

    client = anthropic.Anthropic(api_key=api_key)

    system_prompt = (
        "Tu es un expert en tendances couleurs pour l'artisanat créatif "
        "(résine époxy, bijoux, décoration). Tu connais Pantone, Pinterest Palette, "
        "les runways de mode, et les tendances déco intérieure."
    )
    user_prompt = (
        f"Génère 7 couleurs tendance pour {month_label} adaptées à la résine époxy.\n"
        "Basé sur les vraies sources : Pantone, Pinterest Palette, tendances mode SS/AW, "
        "déco intérieure.\n"
        "Retourne UNIQUEMENT un JSON valide sans markdown :\n"
        '{\n'
        '  "colors": [\n'
        '    {\n'
        '      "name": "Nom de la couleur",\n'
        '      "hex": "#XXXXXX",\n'
        '      "vibe": "courte description ambiance",\n'
        '      "source": "Source réelle ex: Pantone 2026, Pinterest Palette SS26",\n'
        '      "resin_tip": "conseil spécifique pour utilisation en résine",\n'
        '      "default_score": 85\n'
        '    }\n'
        '  ]\n'
        '}'
    )

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        messages=[{"role": "user", "content": user_prompt}],
        system=system_prompt,
    )

    raw = message.content[0].text.strip()
    parsed = json.loads(raw)
    colors = parsed["colors"]

    # Convertir la liste en dict keyword → metadata pour compatibilité avec pytrends
    catalog = {}
    for color in colors:
        # Construire un keyword de recherche à partir du nom
        keyword = color["name"].lower().replace(" ", " ") + " color"
        catalog[keyword] = {
            "name": color["name"],
            "hex": color["hex"],
            "vibe": color["vibe"],
            "source": color["source"],
            "resin_tip": color["resin_tip"],
            "default_score": int(color.get("default_score", 50)),
        }

    print(f"Claude OK — {len(catalog)} couleurs générées")
    return catalog


def enrich_with_pytrends(catalog: dict) -> list | None:
    """Enrichit chaque couleur du catalog avec le vrai score pytrends.
    Si pytrends score > 5, l'utilise ; sinon garde default_score de Claude."""
    from pytrends.request import TrendReq

    keywords = list(catalog.keys())
    pytrends = TrendReq(hl="fr-FR", tz=60)
    pytrends.build_payload(keywords, cat=0, timeframe="today 3-m", geo="FR")
    df = pytrends.interest_over_time()

    if df.empty:
        return None

    colors = []
    for kw, meta in catalog.items():
        raw_score = int(df[kw].mean()) if kw in df.columns else None
        score = raw_score if (raw_score is not None and raw_score > 5) else meta["default_score"]
        colors.append({k: v for k, v in {**meta, "trending_score": score}.items() if k != "default_score"})

    colors.sort(key=lambda c: c["trending_score"] or 0, reverse=True)
    return colors


def main():
    now = datetime.now()
    month_label = f"{MONTH_FR[now.month - 1]} {now.year}"

    # 1. Obtenir le catalogue de couleurs (Claude ou fallback)
    catalog = None
    try:
        catalog = fetch_catalog_from_claude(month_label)
    except Exception as exc:
        print(f"Claude indisponible : {exc}")

    if not catalog:
        catalog = FALLBACK_COLOR_CATALOG
        print("Utilisation du COLOR_CATALOG de fallback")

    # 2. Enrichir avec pytrends
    colors = None
    data_source = "Claude · Pantone · Pinterest"
    try:
        colors = enrich_with_pytrends(catalog)
        if colors:
            data_source = "Claude · Google Trends · Pantone · Pinterest"
            print(f"pytrends OK — scores enrichis")
    except Exception as exc:
        print(f"pytrends indisponible : {exc}")

    # 3. Si pytrends n'a rien donné, construire depuis le catalog avec default_score
    if not colors:
        colors = [
            {k: v for k, v in {**meta, "trending_score": meta["default_score"]}.items() if k != "default_score"}
            for meta in catalog.values()
        ]
        colors.sort(key=lambda c: c["trending_score"] or 0, reverse=True)

    output = {
        "month": month_label,
        "data_source": data_source,
        "colors": colors,
    }

    out_path = os.path.join(os.path.dirname(__file__), "..", "public", "trending-colors.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"Écrit : {len(colors)} couleurs pour {month_label} ({data_source})")


if __name__ == "__main__":
    main()
