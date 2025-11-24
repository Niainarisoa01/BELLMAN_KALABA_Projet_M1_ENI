# Projet Bellman-Kalaba

Application web interactive pour la visualisation et la résolution de problèmes de chemin optimal dans un graphe valué, utilisant l'algorithme de Bellman-Kalaba. Ce projet a été réalisé dans le cadre du Master 1 à l'ENI (École Nationale d'Informatique).

## Fonctionnalités

*   **Minimisation** : Recherche du plus court chemin entre deux sommets.
*   **Maximisation** : Recherche du plus long chemin (chemin critique) entre deux sommets.
*   **Visualisation Interactive** :
    *   Création dynamique de sommets et de liens.
    *   Positionnement des sommets par glisser-déposer.
    *   Animation de l'algorithme étape par étape.
    *   Mise en évidence du chemin optimal.
*   **Cas Spéciaux** : Gestion et visualisation des chemins multiples de même coût.

## Installation et Utilisation

1.  Clonez ce dépôt ou téléchargez les fichiers.
2.  **Important** : Pour lancer l'application, double-cliquez sur le fichier `start_server.bat`.
    *   Cela est nécessaire pour éviter les erreurs de sécurité liées aux modules ES6 (CORS) lors de l'exécution locale.
3.  Le navigateur s'ouvrira automatiquement (ou rendez-vous sur `http://localhost:8000`).
3.  Utilisez l'interface pour :
    *   **Ajouter un sommet** : Cliquez sur le bouton "Ajouter un sommet" puis sur la zone de dessin.
    *   **Ajouter un lien** : Cliquez sur "Ajouter un lien", puis sélectionnez le sommet de départ et le sommet d'arrivée. Entrez le coût du lien.
    *   **Choisir Début/Fin** : Sélectionnez les sommets de départ et d'arrivée pour l'algorithme.
    *   **Chercher** : Lancez l'algorithme pour voir le résultat animé.

## Structure du Projet

*   `src/` : Contient le code source JavaScript de l'application (Logique, Vue, Contrôleurs).
*   `css/` : Feuilles de style pour l'interface utilisateur.
*   `*.html` : Pages de l'application (Accueil, Minimisation, Maximisation, Exemples).

## Auteur

**Niaina Nomenjanahary**
*   Année : 2025
*   Projet M1 ENI

## Copyright

© 2025 Niaina Nomenjanahary. Tous droits réservés.
