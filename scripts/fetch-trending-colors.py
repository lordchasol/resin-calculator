import json
import os
from datetime import datetime

MONTH_FR = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
]

# Données éditoriales fixes (toujours incluses)
EDITORIAL_COLORS = [
    {
        "name": "Peach Fuzz",
        "hex": "#FFBE98",
        "vibe": "Douceur pastel & chaleur printanière",
        "source": "Pantone 2024",
        "resin_tip": "Parfait en fond translucide avec des pigments irisés dorés.",
        "trending_score": None,
    },
    {
        "name": "Midnight Blue",
        "hex": "#1B2A4A",
        "vibe": "Profondeur mystérieuse",
        "source": "Pantone",
        "resin_tip": "Ajouter des paillettes argentées pour un effet nuit étoilée.",
        "trending_score": None,
    },
]

# Couleurs à suivre sur Google Trends → chacune mappée à ses métadonnées
TREND_KEYWORDS = {
    "mocha color": {
        "name": "Mocha Mousse",
        "hex": "#A07850",
        "vibe": "Chaleur terreuse et confort automnal",
        "source": "Google Trends · Pantone 2025",
        "resin_tip": "Mélanger avec de la poudre bronze pour un effet velours mat.",
    },
    "sage green color": {
        "name": "Sage Green",
        "hex": "#87A878",
        "vibe": "Nature, sérénité et minimalisme",
        "source": "Google Trends · Pinterest",
        "resin_tip": "Combiner avec du blanc nacré pour un effet brume matinale.",
    },
    "butter yellow color": {
        "name": "Butter Yellow",
        "hex": "#F5E06E",
        "vibe": "Soleil doux et optimisme",
        "source": "Google Trends · Pinterest",
        "resin_tip": "Idéal pour les pièces de décoration lumineuses en été.",
    },
    "clay color": {
        "name": "Clay",
        "hex": "#C4856A",
        "vibe": "Terracotta moderne et artisanal",
        "source": "Google Trends · Pantone",
        "resin_tip": "Associer avec du doré pour un rendu luxe méditerranéen.",
    },
    "digital lavender": {
        "name": "Digital Lavender",
        "hex": "#C2A9CE",
        "vibe": "Tech, rêve et douceur futuriste",
        "source": "Google Trends · WGSN 2025",
        "resin_tip": "Superposer avec du violet foncé pour créer de la profondeur.",
    },
}

FALLBACK_COLORS = [
    {
        "name": "Mocha Mousse",
        "hex": "#A07850",
        "vibe": "Chaleur terreuse et confort automnal",
        "source": "Pantone 2025",
        "resin_tip": "Mélanger avec de la poudre bronze pour un effet velours mat.",
        "trending_score": None,
    },
    {
        "name": "Sage Green",
        "hex": "#87A878",
        "vibe": "Nature, sérénité et minimalisme",
        "source": "Pinterest Trends",
        "resin_tip": "Combiner avec du blanc nacré pour un effet brume matinale.",
        "trending_score": None,
    },
    {
        "name": "Butter Yellow",
        "hex": "#F5E06E",
        "vibe": "Soleil doux et optimisme",
        "source": "Pinterest Trends",
        "resin_tip": "Idéal pour les pièces de décoration lumineuses en été.",
        "trending_score": None,
    },
    {
        "name": "Clay",
        "hex": "#C4856A",
        "vibe": "Terracotta moderne et artisanal",
        "source": "Pantone",
        "resin_tip": "Associer avec du doré pour un rendu luxe méditerranéen.",
        "trending_score": None,
    },
    {
        "name": "Digital Lavender",
        "hex": "#C2A9CE",
        "vibe": "Tech, rêve et douceur futuriste",
        "source": "WGSN 2025",
        "resin_tip": "Superposer avec du violet foncé pour créer de la profondeur.",
        "trending_score": None,
    },
]


def fetch_with_pytrends():
    from pytrends.request import TrendReq

    keywords = list(TREND_KEYWORDS.keys())
    pytrends = TrendReq(hl="fr-FR", tz=60)
    pytrends.build_payload(keywords, cat=0, timeframe="today 3-m", geo="FR")
    df = pytrends.interest_over_time()

    if df.empty:
        return None

    colors = []
    for kw, meta in TREND_KEYWORDS.items():
        score = int(df[kw].mean()) if kw in df.columns else None
        colors.append({**meta, "trending_score": score})

    # Trier par score décroissant (None en dernier)
    colors.sort(key=lambda c: c["trending_score"] or 0, reverse=True)

    return colors + EDITORIAL_COLORS


def main():
    now = datetime.now()
    month_label = f"{MONTH_FR[now.month - 1]} {now.year}"

    colors = None
    data_source = "fallback"

    try:
        colors = fetch_with_pytrends()
        if colors:
            data_source = "Google Trends · Pantone · Pinterest"
            print(f"pytrends OK — {len(colors)} couleurs")
    except Exception as exc:
        print(f"pytrends indisponible : {exc}")

    if not colors:
        colors = FALLBACK_COLORS + EDITORIAL_COLORS
        data_source = "fallback · Pantone · Pinterest"
        print("Utilisation des données de référence")

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
