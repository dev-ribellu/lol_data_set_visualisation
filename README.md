# LEC Winter Season 2025 - Analyses Statistiques

Ce projet propose une visualisation interactive des statistiques des joueurs de la LEC (League of Legends European Championship) pour la saison d'hiver 2025, en se concentrant sur l'équipe Karmine Corp (KC). Il permet d'explorer les performances individuelles des joueurs à travers différents graphiques et métriques.

## Fonctionnalités

*   **Écran de chargement personnalisé** pour une meilleure expérience utilisateur.
*   **Performance par Joueur (Bubble Chart)** : Visualise les champions joués par chaque joueur de la KC, avec la taille des bulles représentant le KDA moyen sur ce champion. Les bulles intègrent les icônes des champions et des bordures colorées selon le rôle.
*   **Statistiques Détaillées par Joueur (Donut Charts & Infos Clés)** : En cliquant sur un joueur, une section dédiée affiche ses statistiques globales (parties jouées, taux de victoire, KDA moyen) ainsi qu'un graphique en anneau (donut chart) représentant une métrique clé spécifique à son rôle (ex: Impact en début de partie pour le Toplaner, Contrôle de vision pour le Jungler). Des descriptions interactives sont disponibles pour chaque métrique.
*   **Comparaison des Joueurs KC (Radar Chart)** : Un graphique radar offre une analyse multidimensionnelle des performances moyennes des joueurs de la KC sur des indicateurs clés tels que le KDA, le CSPM (Creep Score per Minute), le pourcentage d'or gagné, le pourcentage de dégâts infligés et le KP% (Kill Participation Percentage). Des interrupteurs permettent de filtrer les joueurs à afficher.
*   **Interface Réactive** : Les graphiques s'adaptent automatiquement au redimensionnement de la fenêtre.

## Technologies Utilisées

*   **HTML5** : Structure de la page web.
*   **CSS3** : Styles personnalisés (`style/index.css`, `style/k_Bubble.css`, `style/k_pie.css`, `style/k_radar.css`), Google Fonts (Cairo) pour la typographie.
*   **JavaScript (ES6+)** : Logique de l'application, traitement des données et interactions.
*   **ECharts (v5.4.3)** : Bibliothèque graphique puissante pour la création des visualisations interactives (Bubble Chart, Radar Chart, Donut Charts).
*   **League of Legends Data Dragon (v14.23.1)** : Utilisation des ressources (icônes de champions) pour enrichir les visualisations.

## Installation et Utilisation

Ce projet est une application web statique.

1.  **Cloner le dépôt ou télécharger les fichiers :**
    ```bash
    git clone <URL_DU_DEPOT>
    cd lol_data_set_visualisation
    ```
    (Remplacez `<URL_DU_DEPOT>` par l'URL réelle de votre dépôt si ce n'est pas un projet local unique).

2.  **Placer le fichier de données :**
    Assurez-vous que le fichier de données JSON `LEC_Winter_Season_2025.json` se trouve à la racine du projet ou dans un chemin accessible par les scripts. Ce fichier contient l'ensemble des données des matchs utilisées pour générer les graphiques.

3.  **Ouvrir `index.html` :**
    Il suffit d'ouvrir le fichier `index.html` dans votre navigateur web préféré. Aucune installation de serveur n'est nécessaire pour visualiser l'application localement, bien qu'un serveur local puisse être utilisé pour des raisons de développement (par exemple, avec Live Server pour VS Code).

## Structure du Projet
├── index.html                  # Page HTML principale

├── style/

│   ├── index.css               # Styles généraux

│   ├── k_Bubble.css            # Styles spécifiques au Bubble Chart

│   ├── k_pie.css               # Styles spécifiques aux Donut Charts et stats joueurs

│   └── k_radar.css             # Styles spécifiques au Radar Chart

├── script/

│   ├── k_Bubble.js             # Logique JavaScript pour le Bubble Chart

│   ├── k_pie.js                # Logique JavaScript pour les stats et Donut Charts joueurs

│   └── k_radar.js              # Logique JavaScript pour le Radar Chart

├── images/

│   └── k_logo.png              # Favicon

└── LEC_Winter_Season_2025.json # Fichier de données des matchs (à fournir)
## Contributeurs

*   dev-ribellu
