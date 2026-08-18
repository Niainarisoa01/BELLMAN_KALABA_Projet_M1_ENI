# Analyse technique initiale

## État observé

Le dépôt est une application statique en HTML, CSS et JavaScript ES modules destinée à la visualisation de l’algorithme de Bellman-Kalaba. Les pages principales sont `index.html`, `MinBellman.html`, `MaxBellman.html` et trois pages d’exemples. Le dernier commit public est `489a189`.

## Problèmes bloquants

1. Plusieurs classes utilisées dans les modules ne sont pas importées : `BellmanKalabaAlgorithm` n’est pas importée dans `src/main.js`, `Sommet` n’est pas importée dans `src/core/BellmanKalaba.js` ni dans `src/controllers/InteractionManager.js`, et `Lien` n’est pas importée dans `src/utils/GraphLoader.js`. Avec des modules ES natifs, ces références ne sont pas partagées automatiquement entre fichiers.
2. La logique métier est fortement couplée aux `alert()` et `prompt()`, ce qui bloque l’interface et ne fournit ni validation UX ni messages persistants.
3. Le moteur initialise l’algorithme en arrière-plan mais ne valide pas correctement les graphes cycliques, les coûts invalides, les liens parallèles ou les cas source/puits impossibles.
4. La détection des chemins multiples est partielle : les égalités alimentent `suivants`, mais le rendu et le chemin principal restent basés sur `suivant`, avec une notification simplifiée.
5. Les pages interactives dupliquent le shell HTML et la logique d’état des boutons, et utilisent des IDs génériques (`btn1` à `btn8`) peu explicites.
6. Les résultats sont communiqués par une alerte et ne sont pas présentés sous forme de tableau de calcul, de coût total, de liste de chemins ou d’état détaillé.
7. Le projet ne fournit pas d’export/import de graphe, de réinitialisation claire, de raccourcis, de tests automatisés ou de documentation de modèle de données.

## Cible de la refonte

Construire une application professionnelle de type laboratoire pédagogique de recherche opérationnelle, avec un shell unifié, une interface accessible, une édition de graphe sans `prompt`, un moteur Bellman-Kalaba déterministe, une validation explicite des graphes orientés acycliques, un mode minimisation/maximisation, la détection des optimums multiples, une animation des étapes, un panneau de résultats, des exemples, et l’import/export JSON.

## Choix UX

Le design cible utilise une interface sombre bleu nuit pour la navigation et le canvas, des cartes claires pour les résultats, une accentuation cyan pour les actions, orange pour l’optimum et vert/rouge pour les états. Le canvas reste utilisable sur mobile grâce à une mise en page en colonnes qui devient empilée sous 960px.

## Validation intermédiaire

La nouvelle page `MinBellman.html` se charge correctement dans le navigateur avec le nouveau shell OptiGraph Lab, sans erreur visible de module. L’ajout d’un sommet par clic fonctionne et met automatiquement le premier sommet en origine. Le canevas, la barre d’outils et le panneau de résultats sont rendus dans une interface sombre responsive.

Le flux d’ajout de sommets et l’activation des outils fonctionnent. La validation de la sélection d’une destination nécessite un test d’événements canvas plus précis, car un clic synthétique sur la zone a été interprété de manière ambiguë par l’outil de navigation ; le code d’interaction reste à vérifier par inspection d’état et tests directs.

## Validation du solveur

Le scénario `ExempleMin.html` se charge avec 10 sommets et 13 arcs. L’exécution affiche une valeur optimale de 18, deux chemins optimaux (`1 → 3 → 4 → 6 → 8 → 10` et `1 → 3 → 4 → 7 → 9 → 10`) et les valeurs de Bellman pour chaque sommet. Les arcs du chemin sont progressivement colorés en orange dans le canevas. Cette validation confirme le fonctionnement du moteur, de la détection d’égalité et de la présentation des résultats.

Le scénario `ExempleMax.html` valide également le mode maximisation : le solveur retourne une valeur de 30 et le chemin critique `1 → 2 → 4 → 6 → 7 → 9 → 10`, avec coloration des arcs et affichage des valeurs intermédiaires.

Le cas `ExempleCheminsMultiples.html` est validé : 6 sommets, 8 arcs, valeur minimale 15, et deux chemins optimaux sont affichés (`1 → 2 → 3 → 6` et `1 → 4 → 5 → 6`).

## Ajustement d’identité visuelle

La palette active a été convertie vers un système vert et blanc : forêt pour la navigation et les panneaux, vert moyen pour les actions et les chemins optimaux, menthe pour les accents, blanc et vert très pâle pour le landing. Le rendu navigateur du landing et du laboratoire confirme une cohérence visuelle générale et l’absence de toute marque générative visible dans les pages actives.

## Réseau complexe et organisation automatique

Un nouvel exemple `ExempleComplexe.html` contient 18 sommets et 39 arcs, organisés automatiquement en niveaux topologiques. Le solveur valide le modèle et retourne une valeur minimale de 19 avec le chemin `1 → 3 → 6 → 10 → 13 → 16 → 18`. L’interface expose maintenant le bouton **Organiser automatiquement**, qui répartit les sommets de gauche à droite selon leurs dépendances. En cas de cycle, une grille de secours est utilisée et l’utilisateur reçoit une instruction claire pour supprimer l’arc responsable avant de relancer la résolution.

## Animation du calcul

Le calcul animé est validé dans le navigateur sur le réseau complexe. Le panneau affiche l’étape courante (`Étape 2 / 18`), le sommet traité (`Sommet 17`), la formule `min(7 + V(18) = 7) = 7`, ainsi que les commandes **Pause** et **Afficher le résultat**. Le sommet actif est entouré et marqué `EN COURS`, tandis que les valeurs déjà traitées et les arcs évalués restent visibles.

## Exemple complexe par défaut

La page principale `MinBellman.html` charge maintenant automatiquement le réseau complexe de 18 sommets et 39 arcs. Le panneau indique « Exemple complexe chargé », l’origine est le sommet 1 et la destination le sommet 18. Le calcul animé démarre directement et affiche les étapes de propagation avec une valeur optimale finale de 19.

## Réseau 120 sommets et défilement

Le réseau par défaut contient 120 sommets et 124 arcs. Le solveur doit produire cinq chemins de coût minimal égal à 24. Le panneau inférieur est rendu après un canevas de 620 px ; le document atteint environ 1100 px de hauteur. La feuille de style a été renforcée avec un défilement vertical explicite et un panneau de résultats sans `max-height` afin de conserver les valeurs et les cinq chemins accessibles.

## Validation du défilement vertical

Après l’ajout de 180 px d’espace inférieur, le navigateur signale désormais un contenu sous le viewport et permet le défilement jusqu’au bas de la page. Le panneau **Analyse de la résolution** reste accessible sous le canevas, même avec les 120 sommets affichés.

## Validation du réseau à cinq solutions

Le laboratoire charge 120 sommets et 124 arcs. Le calcul animé atteint l’étape `6 / 120` avec la formule `min(1 + V(117) = 1) = 1`, puis le résultat affiche **Plusieurs solutions optimales**, une valeur de 24 et exactement cinq chemins distincts, chacun de coût 24. Les valeurs de Bellman sont visibles pour les 120 sommets. La console du navigateur ne signale aucune erreur.
