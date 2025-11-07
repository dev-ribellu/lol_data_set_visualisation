const ddragonVersion = '14.23.1';

document.addEventListener('DOMContentLoaded', function() {
    // Configuration initiale
    const chartContainer = document.getElementById('bubble-chart');
    const chart = echarts.init(chartContainer);
    const kcPlayers = ['Canna', 'Yike', 'Vladi', 'Caliste', 'Targamas'];
    let currentPlayer = 'Canna';

    // Mapping des noms de champions pour Data Dragon
    const championNameMapping = {
    "K'Sante": "KSante",
    "Kai'Sa": "Kaisa",
    "Rek'Sai": "RekSai",
    "Cho'Gath": "Chogath",
    "Vel'Koz": "Velkoz",
    "Kha'Zix": "Khazix",
    "Renata_Glasc": "Renata", // Ajout pour Renata Glasc
    "Miss_Fortune": "MissFortune", // Ajout pour Miss Fortune
    "Xin_Zhao": "XinZhao" // Ajout pour Xin Zhao
};

    // Couleurs des bordures pour différents rôles
    const roleColors = {
        'TOP': '#ff4757',
        'JUNGLE': '#2ed573',
        'MID': '#ffa502',
        'ADC': '#1e90ff',
        'SUPPORT': '#5352ed'
    };

    // Fonction utilitaire pour calculer la taille des bulles
    function calculateSize(kda) {
        const kdaValue = parseFloat(kda);
        if (isNaN(kdaValue)) return 40;
        return Math.max(40, Math.min(120, kdaValue * 8));
    }

    // Fonction pour obtenir l'URL de l'image du champion
    function getChampionImageUrl(champion) {
        const formattedName = championNameMapping[champion] || champion.replace(/[^a-zA-Z]/g, '');
        return `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${formattedName}.png`;
    }

    // Fonction principale pour créer les données des joueurs
    function createPlayerData(playerName) {
        if (!window.matchData || !Array.isArray(window.matchData)) {
            console.error('Données invalides');
            return [];
        }

        const playerGames = window.matchData.filter(game => 
            game && game.Player === playerName && game.Team === 'KC'
        );

        const championStats = {};

        // Traitement des données par champion
        playerGames.forEach(game => {
            const champion = game.Champion;
            if (!championStats[champion]) {
                championStats[champion] = {
                    gamesPlayed: 0,
                    kills: 0,
                    deaths: 0,
                    assists: 0,
                    role: game.Role
                };
            }

            championStats[champion].gamesPlayed++;
            championStats[champion].kills += Number(game.Kills || 0);
            championStats[champion].deaths += Number(game.Deaths || 0);
            championStats[champion].assists += Number(game.Assists || 0);
        });

        // Conversion en format pour ECharts
        return Object.entries(championStats).map(([champion, stats]) => {
            const avgKills = stats.kills / stats.gamesPlayed;
            const avgDeaths = stats.deaths / stats.gamesPlayed || 1;
            const avgAssists = stats.assists / stats.gamesPlayed;
            const avgKDA = (avgKills + avgAssists) / avgDeaths;

            return {
                name: champion,
                value: avgKDA.toFixed(2),
                symbolSize: calculateSize(avgKDA),
                symbol: `image://${getChampionImageUrl(champion)}`,
                symbolKeepAspect: false, // Permet à l'image de remplir tout le symbole
                itemStyle: {
                    borderColor: roleColors[stats.role] || '#ffffff',
                    borderWidth: 3,
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                },
                label: {
                    show: true,
                    position: 'bottom',
                    distance: 5,
                    color: '#ffffff',
                    fontSize: 12
                },
                tooltip: {
                    formatter: function(params) {
                        return `
                            <strong>${champion}</strong><br/>
                            Role: ${stats.role}<br/>
                            Parties jouées: ${stats.gamesPlayed}<br/>
                            KDA: ${avgKDA.toFixed(2)}<br/>
                            K/D/A moyens: ${avgKills.toFixed(1)}/${avgDeaths.toFixed(1)}/${avgAssists.toFixed(1)}
                        `;
                    }
                }
            };
        });
    }

    // Création des boutons de sélection des joueurs
    function createPlayerButtons() {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'player-buttons';
        
        kcPlayers.forEach(player => {
            const btn = document.createElement('button');
            btn.textContent = player;
            btn.onclick = () => {
                currentPlayer = player;
                updateChart(player);
            };
            buttonContainer.appendChild(btn);
        });

        document.querySelector('.graph-container')?.appendChild(buttonContainer);
    }

    // Mise à jour du graphique
    function updateChart(playerName) {
        if (!chartContainer || !chart) return;

        try {
            const data = createPlayerData(playerName);
            if (data.length === 0) return;

            const option = {
                title: {
                    text: `Champions joués par ${playerName}`,
                    textStyle: {
                        color: '#ffffff',
                        fontSize: 16,
                        fontFamily: 'Cairo'
                    }
                },
                tooltip: {
                    show: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    borderColor: '#ffffff',
                    borderStyle: 'solid',
                    borderWidth: 1,
                    textStyle: {
                        color: '#ffffff'
                    }
                },
                itemStyle: {
                    borderColor: '#ffffff',
                    borderWidth: 3,
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                },
                backgroundColor: 'transparent',
                series: [{
                    type: 'graph',
                    layout: 'force',
                    data: data,
                    force: {
                        repulsion: [400,500],
                        gravity: 0.1,
                        edgeLength: 100,
                        friction: 0.6,
                        layoutAnimation: true,
                        preventOverlap: true,
                        nodeSpacing: 30
                    },
                    roam: true,
                    draggable: true,
                    nodeScaleRatio: 0.6,
                    emphasis: {
                        scale: true,
                        focus: 'adjacency'
                    }
                }]
                

            };

            chart.setOption(option, true);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du graphique:', error);
        }
    }

    // Gestion du redimensionnement
    window.addEventListener('resize', () => {
        chart?.resize();
    });

    // Chargement initial des données
    fetch('LEC_Winter_Season_2025.json')
        .then(response => response.json())
        .then(data => {
            window.matchData = data;
            createPlayerButtons();
            updateChart(currentPlayer);
        })
        .catch(error => {
            console.error('Erreur de chargement:', error);
            chartContainer.innerHTML = 'Erreur de chargement des données';
        });
});