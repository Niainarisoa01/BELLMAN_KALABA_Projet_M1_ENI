# OptiGraph Lab

**OptiGraph Lab** est une application web pédagogique consacrée à la recherche opérationnelle. Elle permet de construire un graphe orienté, d’identifier un chemin de coût minimal ou une valeur maximale, puis de visualiser la propagation des valeurs de Bellman-Kalaba et les solutions optimales.

Le projet a été réalisé dans le cadre du **Master 1 à l’ENI** et a été refondu pour proposer une expérience de laboratoire plus professionnelle, plus robuste et plus directement exploitable en cours, en travaux pratiques ou en démonstration.

## Fonctionnalités principales

L’application propose un éditeur graphique avec création de sommets par clic, création d’arcs par glisser-déposer, déplacement des sommets, modification des poids, suppression d’éléments et sélection explicite de l’origine et de la destination. Les poids peuvent être entiers, décimaux ou négatifs lorsque le graphe reste acyclique.

Le solveur prend en charge deux objectifs. Le mode **MIN** recherche le chemin de coût total minimal, tandis que le mode **MAX** recherche la valeur maximale associée au chemin critique. Lorsque plusieurs chemins ont la même valeur optimale, ils sont tous présentés dans le panneau de résultat et leurs arcs sont mis en évidence dans le canevas.

Les résultats comprennent la valeur optimale, le chemin principal, la liste des chemins équivalents, le nombre d’étapes de propagation et les valeurs calculées pour chaque sommet. Le modèle est conservé localement dans le navigateur et peut être exporté ou importé au format JSON.

## Démarrage local

Le projet ne nécessite ni framework ni installation de dépendances. La page principale charge par défaut un scénario guidé de 27 sommets et plusieurs niveaux de décision. Ce cas est volontairement plus lisible pour une première prise en main : l’utilisateur peut suivre les étapes de modélisation, de définition des extrémités et de résolution animée. Le scénario avancé de 120 sommets et 124 arcs reste disponible dans `Exemple120.html` et conserve ses cinq solutions optimales de valeur 24.

 Un serveur HTTP local est recommandé pour servir les modules JavaScript ES natifs.

```bash
git clone https://github.com/Niainarisoa01/BELLMAN_KALABA_Projet_M1_ENI.git
cd BELLMAN_KALABA_Projet_M1_ENI
python3 -m http.server 8000
```

Ouvrez ensuite [http://localhost:8000/](http://localhost:8000/) dans un navigateur moderne. Sous Windows, le fichier `start_server.bat` peut également être utilisé.

## Parcours disponibles

| Page | Usage |
| --- | --- |
| `index.html` | Accueil et présentation du laboratoire |
| `MinBellman.html` | Modélisation libre en minimisation |
| `MaxBellman.html` | Modélisation libre en maximisation |
| `ExempleMin.html` | Graphe préchargé pour le plus court chemin |
| `ExempleMax.html` | Graphe préchargé pour le chemin critique |
| `ExempleCheminsMultiples.html` | Cas d’étude avec deux solutions optimales |
| `ExempleComplexe.html` | Réseau de 18 sommets et 39 arcs à résoudre |
| `Exemple27.html` | Scénario guidé par défaut de 27 sommets |
| `Exemple120.html` | Réseau avancé de 120 sommets avec cinq solutions optimales de coût égal |

## Utilisation de l’éditeur

Sélectionnez un outil dans le panneau latéral, puis interagissez avec le canevas. Le bouton **Ajouter un sommet** crée un sommet à l’emplacement du clic. Avec **Ajouter un arc**, glissez depuis le sommet source vers le sommet destination ; une fenêtre non bloquante permet alors de saisir le poids. Les outils **Origine** et **Destination** définissent les extrémités du problème.

Le parcours conseillé commence par le scénario guidé de 27 sommets. Le panneau de gauche présente trois étapes : modéliser, définir l’origine et la destination, puis résoudre. Le bouton **Organiser automatiquement** répartit ensuite les sommets par niveaux topologiques, depuis les sources vers les destinations, afin de rendre les arcs et les dépendances lisibles. Le laboratoire est verticalement défilable : le canevas reste stable et le panneau inférieur contient les résultats, les cinq chemins et les valeurs de Bellman de tous les sommets. Après un clic sur **Exécuter Bellman-Kalaba**, le calcul est présenté comme une animation : le sommet courant, les arcs candidats, la formule de propagation et la valeur obtenue sont affichés étape par étape. L’animation peut être mise en pause, reprise ou interrompue avec **Afficher le résultat**. Lorsqu’un cycle est présent, l’application bascule en placement en grille et signale que le cycle doit être supprimé avant le calcul. Le bouton **Centrer le graphe** relance également cette organisation.

Les raccourcis clavier suivants accélèrent l’édition : `N` pour un sommet, `L` pour un arc, `M` pour déplacer, `E` pour modifier un poids, `D` pour supprimer, `S` pour l’origine et `T` pour la destination. `Ctrl/Cmd + Z` annule la dernière action et `Ctrl/Cmd + Shift + Z` la rétablit.

## Hypothèse algorithmique

Le moteur travaille sur des **graphes orientés acycliques**. Cette hypothèse est adaptée aux réseaux de projet et aux graphes de précédence étudiés avec Bellman-Kalaba. Avant le calcul, l’application valide les sommets, les poids, les boucles et la présence de cycles. Un message explicite est affiché lorsqu’aucun chemin ne relie l’origine à la destination ou lorsqu’un modèle ne respecte pas l’hypothèse acyclique.

Pour chaque sommet, le solveur agrège les arcs sortants et conserve la meilleure valeur atteignable vers la destination. En cas d’égalité numérique, les prédécesseurs équivalents sont conservés afin de reconstruire plusieurs chemins optimaux, dans la limite de 200 chemins affichables pour éviter une explosion combinatoire de l’interface.

## Architecture

Le projet reste volontairement léger et sans dépendance de compilation. `src/main.js` regroupe le modèle de graphe, le solveur Bellman-Kalaba, le rendu Canvas, les interactions, l’historique, l’import/export et la synchronisation de l’interface. `css/responsive.css` contient les tokens visuels, le shell de navigation, le laboratoire, la page d’accueil, les états de résultat et les règles responsive.

Les anciens modules de l’implémentation initiale sont conservés dans `src/core`, `src/models`, `src/controllers`, `src/view` et `src/utils` comme archive de transition. Les pages actuelles utilisent le nouveau bootstrap autonome `src/main.js`, ce qui supprime les erreurs d’imports ES modules présentes dans la version initiale.

## Tests

Les tests déterministes du solveur couvrent la minimisation, la maximisation, les solutions multiples, la détection de cycle et l’absence de chemin.

```bash
node test/solver.test.mjs
node --check src/main.js
```

La suite attend le message `solver tests: 5 scénarios validés`.

## Format JSON

L’export contient le mode utilisé, la date d’export, les sommets, les arcs, l’origine et la destination. Un exemple minimal suit cette structure :

```json
{
  "application": "OptiGraph Lab",
  "version": 2,
  "mode": "min",
  "nodes": [{ "id": 1, "x": 120, "y": 160 }],
  "edges": [{ "id": 1, "from": 1, "to": 2, "weight": 5 }],
  "startId": 1,
  "endId": 2
}
```

## Limites connues et évolutions possibles

La version actuelle est une application côté client : les modèles sont stockés dans le navigateur et aucun espace de collaboration distant n’est fourni. Une prochaine version pourrait proposer une matrice d’adjacence éditable, un export de rapport PDF, des scénarios pédagogiques guidés, une comparaison avec Dijkstra ou CPM, ainsi qu’un stockage partagé pour les travaux de groupe.

## Auteur et licence

Projet M1 ENI, initialement réalisé par **Niaina Nomenjanahary**. Refonte et professionnalisation du laboratoire : **OptiGraph Lab**. © 2025–2026.
