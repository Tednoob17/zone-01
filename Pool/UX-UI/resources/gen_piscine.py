#!/usr/bin/env python3
"""Build the UX/UI piscine as 42-style bilingual LaTeX modules.

The page watermark is the shared norme_fond_paliers_30.png, drawn inside
the vector frame from fond.tex. Each module gets one free thematic photo
as the cover logo and as the foreword figure. Fonts stay those of training.cls.
"""

import json
import random
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path("/Users/externe2/Downloads/zone-01-main")
SRC = ROOT / "01-edu-repos/UX-UI/subjects"
POOL = ROOT / "Pool/UX-UI"
SVG_DIR = ROOT

UX_PLAY = (
    "UX - Introduction \\& Quest n°1",
    "01Edu",
    "https://www.youtube.com/watch?v=UbE6WMeuvQg&list=PLHyAJ_GrRtf-RAtfngbRrFh1XDTnyXFDe",
)
UI_PLAY = (
    "UI - Introduction \\& Quest n°1",
    "01Edu",
    "https://www.youtube.com/watch?v=UbE6WMeuvQg&list=PLHyAJ_GrRtf-_aBft2jQL4-QAunn2bLvu",
)
AI_PLAY = (
    "Claude AI Enablement piscine",
    "01Edu",
    "https://www.youtube.com/watch?v=M94thLMc6vA&list=PLCiJelRloNB8",
)

SVGS = [
    "stacked-steps-haikei.svg",
    "stacked-steps-haikei(1).svg",
    "stacked-steps-haikei(2).svg",
    "stacked-steps-haikei(3).svg",
    "stacked-steps-haikei(4).svg",
    "stacked-steps-haikei(5).svg",
    "stacked-steps-haikei(6).svg",
    "stacked-steps-haikei(7).svg",
]

# Order is the program-list order, not alphabetical.
MODULES = [
    {
        "dir": "UX-00-athlete-keep-hydrated",
        "src": "ux/athele-keep-hydrated",
        "track": "ux",
        "en": "Athlete, keep hydrated",
        "fr": "Athlète, hydrate-toi",
        "summary_en": "A non-digital answer to how runners drink.",
        "summary_fr": "Une réponse non numérique à la façon dont les coureurs boivent.",
        "ex": [
            "user-interviews", "analytics", "personas", "user-journey",
            "problem-statement", "ideation", "prototyping",
        ],
        "culture_en": (
            "Before the screens, there is the road. \\emph{Chariots of Fire} "
            "(Hugh Hudson, 1981) spends its time on two runners and almost none "
            "on the gadget that will save them. This quest is in that spirit: "
            "the hydration problem is real, and the answer you turn in does not "
            "have to be an application. The film does not tell you what to build. "
            "Neither does this page."
        ),
        "culture_fr": (
            "Avant les écrans, il y a la route. \\emph{Les Chariots de feu} "
            "(Hugh Hudson, 1981) suit deux coureurs et ne s'attarde pas sur "
            "l'objet qui les sauvera. Cette quête est de cet acabit : le problème "
            "d'hydratation est réel, et le rendu n'a pas à être une application. "
            "Le film ne dit pas quoi fabriquer. Cette page non plus."
        ),
    },
    {
        "dir": "UX-01-going-on-holidays",
        "src": "ux/going-on-holidays-with-friends",
        "track": "ux",
        "en": "Going on holidays with friends",
        "fr": "Partir en vacances entre amis",
        "summary_en": "From an interview guide to a prototype of a shared trip.",
        "summary_fr": "D'un guide d'entretien à un prototype de voyage partagé.",
        "ex": [
            "interview-guide", "run-interviews", "affinity-diagram",
            "problem-statement", "ideation", "user-flow", "prototyping",
        ],
        "culture_en": (
            "Monsieur Hulot arrives at the beach with a suitcase and no product "
            "roadmap (\\emph{Les Vacances de Monsieur Hulot}, Jacques Tati, 1953). "
            "The joke of the film is that everyone shares the same shore and nobody "
            "shares the same plan. Your job this quest is to find that mismatch "
            "by talking to people, not to restage Tati."
        ),
        "culture_fr": (
            "Monsieur Hulot arrive à la plage avec une valise et sans feuille de "
            "route (\\emph{Les Vacances de Monsieur Hulot}, Jacques Tati, 1953). "
            "Le film tient sur ceci : tout le monde partage la même grève, personne "
            "ne partage le même programme. Ici, l'écart se trouve en parlant aux "
            "gens, pas en rejouant Tati."
        ),
    },
    {
        "dir": "UX-02-lets-fight-harassment",
        "src": "ux/lets-fight-harassment",
        "track": "ux",
        "en": "Let's fight harassment",
        "fr": "Luttons contre le harcèlement",
        "summary_en": "Research and a public message. The brief is not a script.",
        "summary_fr": "Une recherche et un message public. Le sujet n'est pas un script.",
        "ex": [
            "competitive-analyss", "surveys", "broadcast-stategy", "interviews",
            "personas", "user-journey", "problem-statement",
        ],
        "culture_en": (
            "A poster is a sentence a street can read. A.~M.~Cassandre treated "
            "the poster as a public voice, not as a decoration "
            "(see the posters gathered by the MoMA, \\url{https://www.moma.org/artists/1015}). "
            "This quest asks for that kind of voice: a message aimed at a real "
            "audience. It does not ask you to depict harm, and it does not hand "
            "you the message."
        ),
        "culture_fr": (
            "Une affiche est une phrase qu'une rue peut lire. A.~M.~Cassandre "
            "traitait l'affiche comme une voix publique, pas comme un ornement "
            "(les affiches réunies par le MoMA, \\url{https://www.moma.org/artists/1015}). "
            "Cette quête demande ce genre de voix : un message pour un public réel. "
            "Elle ne demande pas de montrer le mal, et elle ne donne pas le message."
        ),
    },
    {
        "dir": "UX-03-the-olympics",
        "src": "ux/the-olympics",
        "track": "ux",
        "en": "The Olympics",
        "fr": "Les Jeux olympiques",
        "summary_en": "Ideation, flow, prototype, motion, and a test.",
        "summary_fr": "Idéation, parcours, prototype, animation, et un test.",
        "ex": [
            "ideation-a", "ideation-b", "ideation-c", "user-flow",
            "prototyping", "animation", "test",
        ],
        "culture_en": (
            "In 1972 Otl Aicher reduced a Games to a set of pictograms that a "
            "visitor could read without a shared language. Mexico 1968, under "
            "Lance Wyman, had already shown that an identity can be a system "
            "rather than a mascot. Look at the pictures if you want. The "
            "exercises still ask you to ideate, not to trace those signs."
        ),
        "culture_fr": (
            "En 1972, Otl Aicher a réduit des Jeux à des pictogrammes qu'un "
            "visiteur lit sans langue commune. Mexico 1968, avec Lance Wyman, "
            "avait déjà montré qu'une identité peut être un système plutôt "
            "qu'une mascotte. Regarder les images est permis. Les exercices "
            "demandent d'idéer, pas de décalquer ces signes."
        ),
    },
    {
        "dir": "UX-04-music-on",
        "src": "ux/music-on",
        "track": "ux",
        "en": "Music on",
        "fr": "Music on",
        "summary_en": "Heuristics, map, jobs to be done, sorting, wireframes, tests.",
        "summary_fr": "Heuristiques, carte, jobs to be done, tri, wireframes, tests.",
        "ex": [
            "heuristics", "site-map", "jtbd", "card-sorting", "wireframes",
            "test-protocol", "run-5-tests",
        ],
        "culture_en": (
            "Paula Scher's covers for CBS Records are loud on purpose: the "
            "sleeve is the promise, the track is the proof. \\emph{High Fidelity} "
            "(Stephen Frears, 2000) is the other half of the same joke, a man "
            "who sorts records because sorting is how he thinks. This quest "
            "sorts a music service. The film is not the card sort."
        ),
        "culture_fr": (
            "Les pochettes de Paula Scher pour CBS Records sont fortes exprès : "
            "la pochette est la promesse, le morceau est la preuve. "
            "\\emph{High Fidelity} (Stephen Frears, 2000) est l'autre moitié de "
            "la blague, un homme qui classe des disques parce que classer est "
            "sa façon de penser. Cette quête classe un service de musique. "
            "Le film n'est pas le tri de cartes."
        ),
    },
    {
        "dir": "UX-05-sunday-night-movie",
        "src": "ux/sunday-night-movie",
        "track": "ux",
        "en": "Sunday night movie",
        "fr": "Cinéma du dimanche soir",
        "summary_en": "A flow, wireframes, motion, three feature tests, one iteration.",
        "summary_fr": "Un parcours, des wireframes, du mouvement, trois tests, une itération.",
        "ex": [
            "user-flow", "wireframes", "wireframes-animation",
            "test-feature-1", "test-feature-2", "test-feature-3", "iteration",
        ],
        "culture_en": (
            "Saul Bass made the titles of a film do the work of a first scene "
            "(\\emph{Anatomy of a Murder}, 1959, is the usual example). A Sunday "
            "night in front of a screen has the same contract: the first minute "
            "must tell you where you are. The exercises ask you to draw that "
            "minute and then watch someone miss it."
        ),
        "culture_fr": (
            "Saul Bass faisait faire aux génériques le travail d'une première "
            "scène (\\emph{Autopsie d'un meurtre}, 1959, est l'exemple qu'on "
            "cite). Un dimanche soir devant un écran a le même contrat : la "
            "première minute doit dire où l'on est. Les exercices demandent de "
            "dessiner cette minute, puis de regarder quelqu'un la manquer."
        ),
    },
    {
        "dir": "UX-06-seamstress",
        "src": "ux/seamstress",
        "track": "ux",
        "en": "Seamstress",
        "fr": "La couturière",
        "summary_en": "Strategy, empathy, definition, statement, ideas, prototype, test.",
        "summary_fr": "Stratégie, empathie, définition, énoncé, idées, prototype, test.",
        "ex": [
            "ux-strategy", "empathy", "define", "problem-statement",
            "ideation", "prototype", "test",
        ],
        "culture_en": (
            "The Design Council published the double diamond as a map: two "
            "widenings, two narrowings "
            "(\\url{https://www.designcouncil.org.uk/our-resources/the-double-diamond/}). "
            "Charles and Ray Eames liked to say that the details are not the "
            "details, they make the product. This quest walks the diamond. "
            "The map is not the garment."
        ),
        "culture_fr": (
            "Le Design Council a publié le double diamant comme une carte : "
            "deux élargissements, deux resserrements "
            "(\\url{https://www.designcouncil.org.uk/our-resources/the-double-diamond/}). "
            "Charles et Ray Eames aimaient dire que les détails ne sont pas "
            "les détails, ils font le produit. Cette quête suit le diamant. "
            "La carte n'est pas le vêtement."
        ),
    },
    {
        "dir": "UI-00-colors-and-moodboard",
        "src": "ui/colors-and-moodboard",
        "track": "ui",
        "en": "Colors and moodboard",
        "fr": "Couleurs et planche d'ambiance",
        "summary_en": "Color, type, a moodboard, and five interface challenges.",
        "summary_fr": "Couleur, caractère, une planche, et cinq défis d'interface.",
        "ex": [
            "find-the-colors", "color-codes", "color-combinations", "moodboard",
            "typography", "typography-moodboard", "ui-challenge-timer",
            "ui-challenge-watches", "ui-challenge-flight", "ui-challenge-spotify",
            "ui-challenge-bitcoin-dashboard",
        ],
        "culture_en": (
            "Josef Albers spent a book showing that a color is not a chip, "
            "it is what the neighbor does to it (\\emph{Interaction of Color}, "
            "Yale University Press, 1963). Johannes Itten had already made the "
            "same point with paper at the Bauhaus. The challenges that follow "
            "are timed drawings. Albers does not paint them for you."
        ),
        "culture_fr": (
            "Josef Albers a passé un livre à montrer qu'une couleur n'est pas "
            "une pastille, c'est ce que le voisin lui fait (\\emph{Interaction of Color}, "
            "Yale University Press, 1963). Johannes Itten l'avait déjà montré "
            "avec du papier au Bauhaus. Les défis qui suivent sont des dessins "
            "chronométrés. Albers ne les peint pas à votre place."
        ),
    },
    {
        "dir": "UI-01-atomic-design",
        "src": "ui/atomic-design",
        "track": "ui",
        "en": "Atomic design",
        "fr": "Design atomique",
        "summary_en": "From a browse of systems to two libraries with a job.",
        "summary_fr": "D'une revue de systèmes à deux bibliothèques qui ont un métier.",
        "ex": [
            "browsing", "material-design", "design-system-library",
            "library-for-climbing-addicts", "library-for-a-dating-app",
        ],
        "culture_en": (
            "Brad Frost named the ladder atom, molecule, organism, template, "
            "page, and put the essay online "
            "(\\url{https://atomicdesign.bradfrost.com/}). "
            "It is a vocabulary, the way a manual page is a vocabulary. "
            "Naming a button an atom does not design the library."
        ),
        "culture_fr": (
            "Brad Frost a nommé l'échelle atome, molécule, organisme, gabarit, "
            "page, et a mis l'essai en ligne "
            "(\\url{https://atomicdesign.bradfrost.com/}). "
            "C'est un vocabulaire, comme une page de manuel est un vocabulaire. "
            "Appeler un bouton un atome ne dessine pas la bibliothèque."
        ),
    },
    {
        "dir": "UI-02-rules",
        "src": "ui/rules",
        "track": "ui",
        "en": "Rules",
        "fr": "Règles",
        "summary_en": "Grids, states, accessibility, and the small controls people reuse.",
        "summary_fr": "Grilles, états, accessibilité, et les petits contrôles qu'on réutilise.",
        "ex": [
            "grids", "multi-state", "accessbility-website", "accessbility-app",
            "breadcrumbs", "toggle-buttons", "radio-buttons", "calendars",
            "time-pickers", "micro-interactions", "consistency",
        ],
        "culture_en": (
            "Josef Müller-Brockmann wrote \\emph{Grid Systems in Graphic Design} "
            "so that alignment would be a decision and not a habit. Massimo "
            "Vignelli's \\emph{The Vignelli Canon} is the short version of the "
            "same stubbornness. You will draw lines on other people's screens. "
            "The books do not draw them."
        ),
        "culture_fr": (
            "Josef Müller-Brockmann a écrit \\emph{Grid Systems in Graphic Design} "
            "pour que l'alignement soit une décision et non une habitude. "
            "\\emph{The Vignelli Canon} de Massimo Vignelli est la version courte "
            "du même entêtement. Vous tracerez des lignes sur les écrans des "
            "autres. Les livres ne les tracent pas."
        ),
    },
    {
        "dir": "UI-03-building-an-interface",
        "src": "ui/building-an-interface",
        "track": "ui",
        "ai": True,
        "en": "Building an interface",
        "fr": "Construire une interface",
        "summary_en": "A styleguide, a library, screens, motion, and a desirability test.",
        "summary_fr": "Un styleguide, une bibliothèque, des écrans, du mouvement, un test de désirabilité.",
        "ex": [
            "styleguide", "design-system-library", "design-screens",
            "animation", "desirability-testing",
        ],
        "culture_en": (
            "Gary Hustwit's \\emph{Objectified} (2009) films people who argue "
            "about a handle, a toothpick, a chair. The argument is the work. "
            "This quest is that argument, held on screens you draw yourself. "
            "There is a second shelf in the foreword, an AI playlist. It is "
            "there so you know what the tools sound like. It is not a licence "
            "to submit a generated deck."
        ),
        "culture_fr": (
            "\\emph{Objectified} de Gary Hustwit (2009) filme des gens qui se "
            "disputent sur une poignée, un cure-dent, une chaise. La dispute "
            "est le travail. Cette quête est cette dispute, tenue sur des "
            "écrans que vous dessinez. Une seconde étagère est dans l'avant-propos, "
            "une playlist sur l'IA. Elle est là pour entendre comment parlent "
            "les outils. Elle n'autorise pas à rendre un deck généré."
        ),
    },
    {
        "dir": "UI-04-heuristics",
        "src": "ui/heuristics",
        "track": "ui",
        "en": "Heuristics",
        "fr": "Heuristiques",
        "summary_en": "An audit, then recommendations that name the criterion.",
        "summary_fr": "Un audit, puis des recommandations qui nomment le critère.",
        "ex": ["audit", "recommendations"],
        "culture_en": (
            "Steve Krug called the book \\emph{Don't Make Me Think} and then "
            "spent it watching people fail in silence. The title is the culture. "
            "The audit is yours. A list copied from a poster of ten slogans, "
            "with no screen attached, is not the exercise."
        ),
        "culture_fr": (
            "Steve Krug a appelé le livre \\emph{Don't Make Me Think} et l'a "
            "passé à regarder des gens échouer en silence. Le titre est la "
            "culture. L'audit est le vôtre. Une liste copiée d'une affiche de "
            "dix slogans, sans écran attaché, n'est pas l'exercice."
        ),
    },
    {
        "dir": "PR-00-get-a-room",
        "src": "project-get-a-room",
        "track": "both",
        "project": True,
        "en": "Get a room!",
        "fr": "Get a room !",
        "summary_en": "A booking service for a coworking room. UX, then UI.",
        "summary_fr": "Un service de réservation pour un coworking. UX, puis UI.",
        "ex": ["ux", "ui"],
        "culture_en": (
            "Jacques Tati's \\emph{Playtime} (1967) is a building that works "
            "better as a brochure than as a place to sit. Barbara, in this "
            "brief, still runs the chairs with paper. The two parts below are "
            "the mid-fidelity week and the high-fidelity week. The film has "
            "already chosen its ending. You have not."
        ),
        "culture_fr": (
            "\\emph{Playtime} de Jacques Tati (1967) est un immeuble qui "
            "fonctionne mieux en brochure que comme endroit où s'asseoir. "
            "Barbara, dans ce brief, gère encore les chaises avec du papier. "
            "Les deux parties ci-dessous sont la semaine moyenne fidélité et "
            "la semaine haute fidélité. Le film a déjà choisi sa fin. Pas vous."
        ),
    },
    {
        "dir": "PR-01-lets-do-some-sports",
        "src": "project-lets-do-some-sports",
        "track": "both",
        "project": True,
        "en": "Let's do some sports",
        "fr": "Faisons du sport",
        "summary_en": "A sports product, researched, then drawn.",
        "summary_fr": "Un produit de sport, cherché, puis dessiné.",
        "ex": ["ux", "ui"],
        "culture_en": (
            "A sports poster has one job: you should know the event from across "
            "the street. The Olympics pictogram tradition (Aicher, Wyman) is "
            "the cultural neighbor, not the deliverable. Read the brief, meet "
            "the people, then present as if the client were in the room."
        ),
        "culture_fr": (
            "Une affiche de sport a un seul métier : on doit reconnaître "
            "l'épreuve depuis l'autre côté de la rue. La tradition des "
            "pictogrammes olympiques (Aicher, Wyman) est le voisin culturel, "
            "pas le livrable. Lisez le brief, voyez les gens, puis présentez "
            "comme si le client était dans la pièce."
        ),
    },
    {
        "dir": "PR-02-lets-fair-trade",
        "src": "project-lets-fair-trade",
        "track": "both",
        "project": True,
        "en": "Let's fair trade",
        "fr": "Let's fair trade",
        "summary_en": "A fair-trade service. Research first, interface second.",
        "summary_fr": "Un service de commerce équitable. La recherche, puis l'interface.",
        "ex": ["ux", "ui"],
        "culture_en": (
            "The Max Havelaar mark is a label people learned to look for on a "
            "shelf. A label is not a product, and a moodboard is not a "
            "cooperative. The brief in the exercises is the contract. The "
            "label's history is only the reminder that trust is printed."
        ),
        "culture_fr": (
            "La marque Max Havelaar est un signe que les gens ont appris à "
            "chercher sur une étagère. Un signe n'est pas un produit, et une "
            "planche d'ambiance n'est pas une coopérative. Le brief des "
            "exercices est le contrat. L'histoire du signe rappelle seulement "
            "que la confiance s'imprime."
        ),
    },
    {
        "dir": "PR-03-a-table",
        "src": "project-a-table",
        "track": "both",
        "project": True,
        "en": "A table!",
        "fr": "A table !",
        "summary_en": "Four roles in a food delivery service, on mobile and desktop.",
        "summary_fr": "Quatre rôles dans une livraison de repas, mobile et desktop.",
        "ex": ["ux", "ui"],
        "culture_en": (
            "Auguste Escoffier's brigade splits a kitchen so that the sauté "
            "and the pastry do not share a pair of hands. DeliverNow, in this "
            "brief, has the same problem with four roles and one order. "
            "The brigade is a metaphor. It is not the information architecture."
        ),
        "culture_fr": (
            "La brigade d'Auguste Escoffier sépare une cuisine pour que le "
            "saucier et le pâtissier ne partagent pas les mêmes mains. "
            "DeliverNow, dans ce brief, a le même problème avec quatre rôles "
            "et une commande. La brigade est une métaphore. Ce n'est pas "
            "l'architecture de l'information."
        ),
    },
]


def assign_svgs():
    rng = random.Random(42)
    deck = SVGS * 2
    rng.shuffle(deck)
    assert len(deck) == len(MODULES)
    # Each picture is used twice, and the sequence is not one picture repeated.
    assert len(set(deck)) == len(SVGS)
    return dict(zip((m["dir"] for m in MODULES), deck))


def latex_escape(text):
    text = (
        text.replace("\\", "\x00")
        .replace("&", r"\&")
        .replace("%", r"\%")
        .replace("$", r"\$")
        .replace("#", r"\#")
        .replace("_", r"\_")
        .replace("{", r"\{")
        .replace("}", r"\}")
        .replace("~", r"\textasciitilde{}")
        .replace("^", r"\textasciicircum{}")
    )
    return text.replace("\x00", r"\textbackslash{}")


def normalize(text):
    return (
        text.replace("\u201c", '"')
        .replace("\u201d", '"')
        .replace("\u2018", "'")
        .replace("\u2019", "'")
        .replace("\u2014", " --- ")
        .replace("\u2013", "--")
        .replace("\u2026", "...")
        .replace("\u00a0", " ")
        .replace("\u202f", " ")
    )


INLINE = re.compile(
    r"(\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|!\[[^\]]*\]\([^)]+\))"
)


def render_inline(text):
    out = []
    pos = 0
    for match in INLINE.finditer(text):
        out.append(latex_escape(text[pos:match.start()]))
        token = match.group(0)
        if token.startswith("**"):
            out.append(r"\textbf{" + render_inline(token[2:-2]) + "}")
        elif token.startswith("`"):
            out.append(r"\texttt{" + latex_escape(token[1:-1]) + "}")
        elif token.startswith("!["):
            alt, url = re.match(r"!\[([^\]]*)\]\(([^)]+)\)", token).groups()
            if url.startswith("http"):
                out.append(r"\url{" + url + "}")
            else:
                out.append(latex_escape(alt or url))
        elif token.startswith("["):
            label, url = re.match(r"\[([^\]]+)\]\(([^)]+)\)", token).groups()
            out.append(render_inline(label) + r" \url{" + url + "}")
        elif token.startswith("*"):
            out.append(r"\emph{" + render_inline(token[1:-1]) + "}")
        pos = match.end()
    out.append(latex_escape(text[pos:]))
    return "".join(out)


def md_to_tex(md):
    lines = normalize(md).splitlines()
    body = []
    list_stack = []  # indent levels of open lists

    def close_to(indent):
        while list_stack and list_stack[-1] >= indent:
            list_stack.pop()
            body.append(r"\end{itemize}")

    for raw in lines:
        if not raw.strip():
            close_to(0)
            body.append("")
            continue
        if raw.strip() in {"---", "--", "—"}:
            close_to(0)
            body.append(r"\medskip")
            continue
        heading = re.match(r"^(#{1,4})\s+(.*)$", raw.strip())
        if heading:
            close_to(0)
            level = len(heading.group(1))
            title = render_inline(heading.group(2))
            if level == 1:
                continue
            cmd = r"\subsection*" if level == 2 else r"\subsubsection*"
            body.append(cmd + "{" + title + "}")
            continue
        item = re.match(r"^(\s*)[-*]\s+(.*)$", raw)
        if item:
            indent = len(item.group(1).replace("\t", "    "))
            if not list_stack or indent > list_stack[-1]:
                list_stack.append(indent)
                body.append(r"\begin{itemize}")
            else:
                close_to(indent + 1)
            body.append(r"\item " + render_inline(item.group(2)))
            continue
        close_to(0)
        body.append(render_inline(raw.strip()))
    close_to(0)
    text = "\n".join(body)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return text + "\n"


# Exact-line translations for the sentences that repeat across the pool.
# Loaded further from fr_lines.json when present.
FR_LINES = {
    "**Instructions:**": "**Instructions :**",
    "**Resources:**": "**Ressources :**",
    "**Deliverables:**": "**Livrables :**",
    "**Deliverable:**": "**Livrable :**",
    "**Tips:**": "**Pistes :**",
    "**Context:**": "**Contexte :**",
    "**Quote:**": "**Citation :**",
    "**Quotes:**": "**Citations :**",
    "**Guidelines:**": "**Consignes :**",
    "**Tools:**": "**Outils :**",
    "**Criteria:**": "**Critères :**",
    "**Recommended tools:**": "**Outils recommandés :**",
    "**List of websites:**": "**Liste de sites :**",
    "**Questions to ask in the feedback forms**": "**Questions à poser dans les formulaires de retour**",
    "**Phase 1: Mid-project presentation audit**": "**Phase 1 : audit de la présentation intermédiaire**",
    "**Phase 2: Final presentation audit**": "**Phase 2 : audit de la présentation finale**",
    "- Why?": "- Pourquoi ?",
    "- Why ?": "- Pourquoi ?",
    "—": "—",
    "Make sure:": "Vérifiez :",
    "- Make sure:": "- Vérifiez :",
    "- At least 5 people are attending the presentation": "- Au moins 5 personnes assistent à la présentation",
    "- The next steps of the project": "- Les prochaines étapes du projet",
    "- Feedback forms have been shared at the beginning of the presentation": "- Les formulaires de retour ont été distribués au début de la présentation",
    "- You had fun!": "- Vous vous êtes amusés !",
    "- Have fun!": "- Amusez-vous !",
    "- Add a title within all written documents.": "- Ajoutez un titre dans tous les documents écrits.",
    "- Add a title within the file.": "- Ajoutez un titre dans le fichier.",
    "- Add a title within the document.": "- Ajoutez un titre dans le document.",
    "- Pay attention to the global aspect of the deliverables. They must be clear, simple and easy to read. You can get inspiration on canva.com but don’t overload your design with too much details!": "- Soignez l'aspect global des livrables. Ils doivent être clairs, simples et lisibles. Vous pouvez regarder canva.com, sans surcharger le dessin de détails.",
    "- Pay attention to the global aspect of the file. It must be clear, simple and easy to read. You can get inspiration on canva.com but don’t overload your design with too much details!": "- Soignez l'aspect global du fichier. Il doit être clair, simple et lisible. Vous pouvez regarder canva.com, sans surcharger le dessin de détails.",
    "- Pay attention to the global aspect of the document. It must be clear, simple and easy to read. You can get inspiration on canva.com but don’t overload your design with too much details!": "- Soignez l'aspect global du document. Il doit être clair, simple et lisible. Vous pouvez regarder canva.com, sans surcharger le dessin de détails.",
    "- Upload the documents on Github, in a zip folder named “ProjectTitle_Name_FirstName”, with all project deliverables as follows: “Name_FirstName_DeliverableName_Date_VersionNumber”.  For example, the first deliverable can be named as “Doe_John_MidFiPrototype_05242024_V1”.": "- Déposez les documents sur Github, dans un zip nommé « ProjectTitle_Name_FirstName », et chaque livrable ainsi : « Name_FirstName_DeliverableName_Date_VersionNumber ». Exemple : « Doe_John_MidFiPrototype_05242024_V1 ».",
    "- Upload the Figma file on Github, labeled as follows: “Name_FirstName_DeliverableName_Date_VersionNumber”. For example, it can be labeled as “Doe_John_MidFiPrototype_05242024_V1”.": "- Déposez le fichier Figma sur Github, nommé ainsi : « Name_FirstName_DeliverableName_Date_VersionNumber ». Exemple : « Doe_John_MidFiPrototype_05242024_V1 ».",
    "- Upload the PDF document on Github, labeled as follows: “Name_FirstName_DeliverableName_Date_VersionNumber”. For example, it can be labeled as “Doe_John_MidFiPrototype_05242024_V1”.": "- Déposez le PDF sur Github, nommé ainsi : « Name_FirstName_DeliverableName_Date_VersionNumber ». Exemple : « Doe_John_MidFiPrototype_05242024_V1 ».",
    "- The presentation does not exceed 10 minutes": "- La présentation ne dépasse pas 10 minutes",
    "- The presentation does not exceed 15 minutes": "- La présentation ne dépasse pas 15 minutes",
    "Intermediate deliverables:": "Livrables intermédiaires :",
    "“Your mission in any presentation is to inform, educate, and inspire.” Robert Ballard": "« Your mission in any presentation is to inform, educate, and inspire. » Robert Ballard",
    "- The presentation is about the whole UX process, including:": "- La présentation porte sur tout le processus UX, y compris :",
    "- The intial brief": "- Le brief initial",
    "- A project planning, including the UX phases, the tools chosen, the timeline": "- Un planning, avec les phases UX, les outils choisis, le calendrier",
    "- The presentation is about the UI process, including:": "- La présentation porte sur le processus UI, y compris :",
    "- A quick reminder of the previous presentation": "- Un bref rappel de la présentation précédente",
    "- A project planning, including the UI phases, the tools chosen, the timeline": "- Un planning, avec les phases UI, les outils choisis, le calendrier",
    "- A moodboard": "- Une planche d'ambiance",
    "- A styleguide (colors, branding, typography, some elements of the library)": "- Un styleguide (couleurs, marque, typographie, quelques éléments de la bibliothèque)",
    "- The main feedback from usability and desirability testing": "- Les retours principaux des tests d'utilisabilité et de désirabilité",
    "- What do you remember of this presentation?": "- Que retenez-vous de cette présentation ?",
    "- On a scale from 0 to 10, how clear was the speech?": "- De 0 à 10, le discours était-il clair ?",
    "- On a scale from 0 to 10, how engaging was the presentation?": "- De 0 à 10, la présentation était-elle engageante ?",
    "- On a scale from 0 to 10, how coherent was the presentation?": "- De 0 à 10, la présentation était-elle cohérente ?",
    "- On a scale from 0 to 10, how impactful were the visuals?": "- De 0 à 10, les visuels portaient-ils ?",
    "- On a scale from 0 to 10, how clear was the problem?": "- De 0 à 10, le problème était-il clair ?",
    "- On a scale from 0 to 10, how well does the prototype answers the problem?": "- De 0 à 10, le prototype répond-il au problème ?",
    "- What recommendation would you like to make to improve this presentation?": "- Quelle recommandation feriez-vous pour améliorer cette présentation ?",
    "- Prepare a feedback form to send the audience. The form must include at least the questions listed below.": "- Préparez un formulaire de retour pour le public. Il contient au moins les questions listées plus bas.",
    "- You may use the presentation audits to structure your presentations.": "- Vous pouvez vous servir des audits de présentation pour structurer vos présentations.",
    "- Timing: 10 minutes for the presentation and 5 minutes for Q&A.": "- Durée : 10 minutes de présentation et 5 minutes de questions.",
    "- In both presentations, you are presenting to Barbara and her team.": "- Dans les deux présentations, vous parlez à Barbara et à son équipe.",
    "- User research findings from qualitative and quantitative research (persona, figures, etc.)": "- Les résultats de la recherche utilisateur, qualitative et quantitative (persona, chiffres, etc.)",
    "- A problem statement to adapt the initial brief based on the research findings": "- Un énoncé de problème qui ajuste le brief initial d'après la recherche",
    "- An introduction of the concept that came out of the ideation": "- Une introduction du concept sorti de l'idéation",
    "- The animated mid-fidelity prototype (a demo-video)": "- Le prototype moyenne fidélité animé (une vidéo de démo)",
    "- The main feedback from usability testing": "- Les retours principaux du test d'utilisabilité",
    "- The animated high-fidelity prototype (a demo-video)": "- Le prototype haute fidélité animé (une vidéo de démo)",
    "- Figma": "- Figma",
    "- Test your prototypes with at least 5 people.": "- Testez vos prototypes avec au moins 5 personnes.",
    "- You may consider building your UX and UI strategy before jumping in. Remember to question the initial brief with user research.": "- Posez une stratégie UX et UI avant de foncer. Remettez le brief initial en question avec une recherche utilisateur.",
    "- Beware all the steps of the design process: Empathy, Define, Problem Statement, Ideation, Prototype, Test.": "- Respectez les étapes : empathie, définir, énoncé du problème, idéation, prototype, test.",
    "- You must interview or ask real people during the Empathy / User Research and Test phases.": "- Vous devez interroger de vraies personnes pendant l'empathie, la recherche et les tests.",
    "- In both phases, you must test your prototypes with at least 5 people.": "- Dans les deux phases, testez vos prototypes avec au moins 5 personnes.",
    "**Estimated time:** 2 weeks": "**Durée estimée :** 2 semaines",
    "This exercise is to be made individually.": "Cet exercice se fait seul.",
    "- etc.": "- etc.",
    "Here are the recommended steps :": "Voici les étapes recommandées :",
    "Let's be creative!": "Soyons créatifs !",
    "Show a tested high-fidelity prototype.": "Montrez un prototype haute fidélité testé.",
    "Test your wireframes!": "Testez vos wireframes !",
    "Copy this image on Figma": "Copiez cette image dans Figma",
    "- Pictures": "- Des photos",
    "- Pictures of the ongoing workshop": "- Des photos de l'atelier en cours",
    "- Pictures of the ongoing tests": "- Des photos des tests en cours",
    "- You use symbols and variants": "- Vous utilisez des symboles et des variants",
    "- You use overlays": "- Vous utilisez des overlays",
    "- Feel free to get inspiration from existing design systems. Browse Dribble and the Figma community!": "- Inspirez-vous des design systems existants. Parcourez Dribbble et la communauté Figma.",
    "- A Figma file with a copy of the image with Figma elements": "- Un fichier Figma avec une copie de l'image et des éléments Figma",
    "- A PDF document with a Test protocol": "- Un PDF avec un protocole de test",
    "- A PDF document with 3 ideas to improve the prototype based on you users' feedbacks.": "- Un PDF avec 3 idées pour améliorer le prototype d'après les retours.",
    "3. Pick 3 to 5 main topics you need to get information on.": "3. Choisissez 3 à 5 sujets sur lesquels il vous faut de l'information.",
    "- More... as long as it is a South American music label ;-)": "- D'autres... tant que c'est un label de musique sud-américain ;-)",
    "- Low-Fidelity: Paper Prototypes - [Example here](https://miro.medium.com/max/1400/1*5nUfqqA2gjdAYHagjbHA5w.jpeg)": "- Basse fidélité : prototypes papier - [exemple](https://miro.medium.com/max/1400/1*5nUfqqA2gjdAYHagjbHA5w.jpeg)",
    "- Mid-Fidelity: Wireframes - black and white, only the main elements, on digital prototype tools - [Example here](https://miro.medium.com/max/1400/1*eGSfaxwYbxUFomYbyO6GWw.png)": "- Moyenne fidélité : wireframes, noir et blanc, seulement les éléments principaux, sur un outil de prototype - [exemple](https://miro.medium.com/max/1400/1*eGSfaxwYbxUFomYbyO6GWw.png)",
    "- High-Fidelity: Wireframes with color, styles, graphical details, and micro-interactions - [Example here](https://miro.medium.com/max/1400/1*Xn0HSKAvhr4TZzC9lN5udw.gif)": "- Haute fidélité : wireframes avec couleur, styles, détails graphiques et micro-interactions - [exemple](https://miro.medium.com/max/1400/1*Xn0HSKAvhr4TZzC9lN5udw.gif)",
}


def load_maps():
    mapping = dict(FR_LINES)
    extra = POOL / "resources/fond/fr_lines.json"
    if extra.exists():
        mapping.update(json.loads(extra.read_text(encoding="utf-8")))
    return mapping


def translate_md(text, mapping, missing):
    out = []
    for line in text.splitlines():
        key = line.strip()
        if key in mapping:
            indent = line[: len(line) - len(line.lstrip())]
            out.append(indent + mapping[key])
        else:
            if key and not key.startswith("http") and not key.startswith("!["):
                missing.add(key)
            out.append(line)
    return "\n".join(out)


def read_exercise(module, folder):
    path = SRC / module["src"] / folder / "README.md"
    text = path.read_text(encoding="utf-8")
    title = folder.replace("-", " ")
    for line in text.splitlines():
        if line.startswith("# "):
            title = line[2:].strip()
            break
    return title, text


def files_to_turn_in(md, number, lang):
    low = md.lower()
    if lang == "fr":
        if "figma" in low and "pdf" in low:
            kind = "fichier Figma et PDF"
        elif "figma" in low:
            kind = "fichier Figma"
        elif "zip" in low:
            kind = "archive zip"
        else:
            kind = "PDF"
        named = "nomme"
    else:
        if "figma" in low and "pdf" in low:
            kind = "Figma file and PDF"
        elif "figma" in low:
            kind = "Figma file"
        elif "zip" in low:
            kind = "zip archive"
        else:
            kind = "PDF"
        named = "named"
    return f"ex{number}/{kind}, {named} Name_FirstName_DeliverableName_Date_VersionNumber"


def playlist_block(module, lang):
    lines = []
    if lang == "en":
        intro = "Recommended watching. The videos are context. They are not the deliverable."
    else:
        intro = "À regarder. Les vidéos sont un contexte. Elles ne sont pas le livrable."
    lines.append(intro)
    lines.append(r"\begin{itemize}")
    plays = []
    if module["track"] in ("ux", "both"):
        plays.append(UX_PLAY)
    if module["track"] in ("ui", "both"):
        plays.append(UI_PLAY)
    if module.get("ai"):
        plays.append(AI_PLAY)
    for title, author, url in plays:
        who = f", {author}" if author else ""
        lines.append(r"\item " + title + who + r" \url{" + url + "}")
    lines.append(r"\end{itemize}")
    if module.get("ai"):
        if lang == "en":
            lines.append(
                "The last playlist is an AI piscine (\\emph{Claude AI Enablement}). "
                "Watch it if you want to hear how a model is sold as a design assistant. "
                "The files you turn in still have to come from your research, your "
                "screens, and your tests. A generated board that you cannot walk "
                "through does not count."
            )
        else:
            lines.append(
                "La dernière playlist est une piscine d'IA (\\emph{Claude AI Enablement}). "
                "Regardez-la si vous voulez entendre comment on vend un modèle comme "
                "assistant de design. Les fichiers rendus viennent encore de votre "
                "recherche, de vos écrans et de vos tests. Une planche générée que "
                "vous ne savez pas raconter ne compte pas."
            )
    return "\n".join(lines)


def instructions(lang):
    if lang == "en":
        return r"""
\chapter{Instructions}

The foreword is not an exercise. It will not be graded. The exercises start at the next chapter, from the easiest contract to the hardest. A later exercise is not taken into account if an earlier one does not hold.

Only what is in the turn-in directory of an exercise is looked at. Do not add files that the exercise does not name. The name of a deliverable follows the pattern in the exercise: \texttt{Name\_FirstName\_DeliverableName\_Date\_VersionNumber}.

You will not be given the gesture. The examples in an exercise sometimes carry a constraint that the sentence does not repeat. Read them. Your other references are the manual of the tool you picked, the person sitting next to you, and the links printed in the exercise.

The order is the order of the quest. Skipping a step because a later screen looks more interesting produces a screen nobody can explain.

\subsection*{About the pictures}

The mark on the cover is the picture of this module. The pale steps behind the text are the page ground. Neither one is a hint.

\subsection*{About machines that write}

You may use a tool to look up a term, the way you would use a dictionary. You may not replace an interview, a test, or a file with a generated text and sign it. If you cannot point at the person, the screen, or the line you claim, the exercise is not done.
"""
    return r"""
\chapter{Instructions}

L'avant-propos n'est pas un exercice. Il ne sera pas noté. Les exercices commencent au chapitre suivant, du contrat le plus simple au plus dur. Un exercice plus tardif n'est pas pris en compte si un plus tôt ne tient pas.

On ne regarde que ce qui est dans le répertoire de rendu de l'exercice. N'ajoutez pas un fichier que l'exercice ne nomme pas. Le nom d'un livrable suit le motif imprimé dans l'exercice : \texttt{Name\_FirstName\_DeliverableName\_Date\_VersionNumber}.

Le geste ne vous est pas donné. Les exemples d'un exercice portent parfois une contrainte que la phrase ne répète pas. Lisez-les. Vos autres références sont le manuel de l'outil choisi, la personne assise à côté, et les liens imprimés dans l'exercice.

L'ordre est celui de la quête. Sauter une étape parce qu'un écran plus tard semble plus intéressant produit un écran que personne ne sait expliquer.

\subsection*{Des images}

La marque en couverture est l'image de ce module. Les paliers pâles derrière le texte sont le fond de page. Ni l'un ni l'autre n'est un indice.

\subsection*{Des machines qui écrivent}

Vous pouvez vous servir d'un outil pour vérifier un mot, comme d'un dictionnaire. Vous ne pouvez pas remplacer un entretien, un test ou un fichier par un texte généré et le signer. Si vous ne pouvez pas montrer la personne, l'écran ou la ligne que vous avancez, l'exercice n'est pas fait.
"""


JEUNECRACK_REL = "../../resources/jeunecrack.png"
FILI_FOND_REL = "../../resources/fond/fili_fond_30.png"
JEUNECRACK_CREDIT = "JeuneCrack"


def subject_tex(module, lang, image=None, credit=None):
    """Cover has no illustration (empty schoollogo). Image only in foreword."""
    image = image or JEUNECRACK_REL
    credit = credit or JEUNECRACK_CREDIT
    if lang == "en":
        title = module["en"]
        summary = module["summary_en"]
        culture = module["culture_en"]
        fore = "Foreword"
        langswitch = ""
        caption = f"Picture: {credit}"
    else:
        title = module["fr"]
        summary = module["summary_fr"]
        culture = module["culture_fr"]
        fore = "Avant-propos"
        langswitch = "\\setlang{french}\n"
        caption = f"Image : {credit}"
    code = module["dir"].split("-")[0]
    if lang == "fr":
        prereq = "Le module précédent de cette piscine, ou aucun si c'est le premier."
    else:
        prereq = "The previous module of this piscine, or none if this is your first."
    return f"""\\documentclass{{training}}
{langswitch}\\input{{../../resources/latex/fond.tex}}

\\begin{{document}}

\\title{{{latex_escape(title)}}}
\\subtitle{{Piscine UX/UI --- {code}}}
\\member{{Piscine UX/UI}}{{https://github.com/01-edu/UX-UI}}
\\summary{{{latex_escape(summary)}}}
\\version{{1.0}}
\\prerequisite{{{prereq}}}
\\maketitle

\\newpage
\\tableofcontents
\\newpage

{instructions(lang)}

\\chapter{{{fore}}}

{culture}

\\begin{{center}}
\\includegraphics[width=0.78\\textwidth,height=0.32\\textheight,keepaspectratio]{{{image}}}\\\\[0.4em]
{{\\footnotesize {latex_escape(caption)}}}
\\end{{center}}

{playlist_block(module, lang)}

"""


def exercise_chapter(lang, number, title):
    label = "Exercise" if lang == "en" else "Exercice"
    sep = ": " if lang == "en" else " : "
    return (
        f"\\chapter{{{label} {number}{sep}{latex_escape(normalize(title))}}}\n"
        f"\\input{{exercises/{lang}/ex{number}.tex}}\n"
    )


def exercise_tex(number, title, files, body, lang="en"):
    authorize = (
        "Those named in the exercise"
        if lang == "en"
        else "Ceux nommés dans l'exercice"
    )
    return (
        f"\\exnumber{{{number}}}\n"
        f"\\extitle{{{title}}}\n"
        f"\\exfiles{{{files}}}\n"
        f"\\exauthorize{{{authorize}}}\n"
        f"\\makeheaderfiles\n\n"
        f"{body}\n"
    )


def convert_identity(svg_name, dest):
    src = SVG_DIR / svg_name
    subprocess.check_call(
        ["rsvg-convert", "-h", "1200", "-o", str(dest), str(src)]
    )


def makefile(image_rel=None):
    # Shared illustration + shared watermark; cover has neither as schoollogo.
    _ = image_rel
    return f"""TARGETS = en.subject.pdf fr.subject.pdf
DEPS = {JEUNECRACK_REL} {FILI_FOND_REL}
RELPATH = ../../resources/latex/
include $(RELPATH)/Makefile.LaTeX
"""


def main():
    assignment = assign_svgs()
    mapping = load_maps()
    missing = set()
    (POOL / "svg-assignment.txt").write_text(
        "\n".join(
            f"{name}\t{assignment[name]}" for name in (m["dir"] for m in MODULES)
        )
        + "\n",
        encoding="utf-8",
    )
    image_rel = JEUNECRACK_REL
    credit = JEUNECRACK_CREDIT
    for module in MODULES:
        subject = POOL / module["dir"] / "subject"
        for lang in ("en", "fr"):
            (subject / "exercises" / lang).mkdir(parents=True, exist_ok=True)
        (subject / "Makefile").write_text(makefile(image_rel), encoding="utf-8")
        inputs = {"en": [], "fr": []}
        for index, folder in enumerate(module["ex"]):
            number = f"{index:02d}"
            en_title, md = read_exercise(module, folder)
            fr_md = translate_md(md, mapping, missing)
            en_body = md_to_tex(md)
            fr_body = md_to_tex(fr_md)
            # French title: first heading after translation, else the English one.
            fr_title = en_title
            for line in fr_md.splitlines():
                if line.startswith("# "):
                    fr_title = line[2:].strip()
                    break
            turn_en = files_to_turn_in(md, number, "en")
            turn_fr = files_to_turn_in(fr_md, number, "fr")
            (subject / "exercises" / "en" / f"ex{number}.tex").write_text(
                exercise_tex(
                    number,
                    render_inline(normalize(en_title)),
                    latex_escape(turn_en),
                    en_body,
                    lang="en",
                ),
                encoding="utf-8",
            )
            (subject / "exercises" / "fr" / f"ex{number}.tex").write_text(
                exercise_tex(
                    number,
                    render_inline(normalize(fr_title)),
                    latex_escape(turn_fr),
                    fr_body,
                    lang="fr",
                ),
                encoding="utf-8",
            )
            inputs["en"].append(exercise_chapter("en", number, en_title))
            inputs["fr"].append(exercise_chapter("fr", number, fr_title))
        for lang in ("en", "fr"):
            tex = subject_tex(module, lang, image_rel, credit) + "".join(inputs[lang]) + "\\end{document}\n"
            (subject / f"{lang}.subject.tex").write_text(tex, encoding="utf-8")
    missing_path = POOL / "resources/fond/fr_untranslated.txt"
    missing_path.write_text("\n".join(sorted(missing)) + ("\n" if missing else ""), encoding="utf-8")
    print(f"modules {len(MODULES)}")
    print(f"untranslated french lines {len(missing)}")


if __name__ == "__main__":
    main()
