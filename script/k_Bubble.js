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
        "Renata_Glasc": "Renata",
        "Miss_Fortune": "MissFortune",
        "Xin_Zhao": "XinZhao"
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
        if (isNaN(kdaValue)) return 60;
        return Math.max(60, Math.min(140, kdaValue * 12));
    }

    // Fonction pour créer un symbole circulaire personnalisé avec l'image du champion
        // Fonction pour créer un symbole circulaire personnalisé avec l'image du champion
    function createChampionSymbol(champion, size, borderColor) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const radius = size / 2;
        
        // Agrandir le canvas pour avoir de la place pour l'ombre
        canvas.width = size + 10;
        canvas.height = size + 10;
        
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function() {
                // Décalage pour centrer avec l'ombre
                const centerX = radius + 5;
                const centerY = radius + 5;
                
                // Dessiner l'ombre d'abord (en bas à gauche)
                ctx.save();
                ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                ctx.shadowBlur = 8;
                ctx.shadowOffsetX = 4;
                ctx.shadowOffsetY = 4;
                
                // Cercle pour l'ombre
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius - 3, 0, 2 * Math.PI);
                ctx.fillStyle = borderColor;
                ctx.fill();
                ctx.restore();
                
                // Dessiner le fond circulaire avec l'image
                ctx.save();
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius - 3, 0, 2 * Math.PI);
                ctx.clip();
                
                // Calculer la taille pour que l'image carrée remplisse le cercle
                const imageSize = size * 1.42;
                const offsetX = centerX - imageSize / 2;
                const offsetY = centerY - imageSize / 2;
                
                // Dessiner l'image en la centrant et l'agrandissant
                ctx.drawImage(img, offsetX, offsetY, imageSize, imageSize);
                ctx.restore();
                
                // Dessiner la bordure par-dessus
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius - 2, 0, 2 * Math.PI);
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = 3;
                ctx.stroke();
                
                resolve(canvas.toDataURL());
            };
            img.onerror = function() {
                // Image par défaut en cas d'erreur
                const centerX = radius + 5;
                const centerY = radius + 5;
                
                // Ombre pour l'image par défaut
                ctx.save();
                ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                ctx.shadowBlur = 8;
                ctx.shadowOffsetX = -4;
                ctx.shadowOffsetY = 4;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius - 3, 0, 2 * Math.PI);
                ctx.fillStyle = '#333333';
                ctx.fill();
                ctx.restore();
                
                // Bordure
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius - 2, 0, 2 * Math.PI);
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = 3;
                ctx.stroke();
                
                resolve(canvas.toDataURL());
            };
            img.src = getChampionImageUrl(champion);
        });
    }

    // Fonction pour obtenir l'URL de l'image du champion
    function getChampionImageUrl(champion) {
        const formattedName = championNameMapping[champion] || champion.replace(/[^a-zA-Z]/g, '');
        return `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${formattedName}.png`;
    }

    // Fonction principale pour créer les données des joueurs
    async function createPlayerData(playerName) {
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

        // Conversion en format pour ECharts avec symboles personnalisés
        const dataPromises = Object.entries(championStats).map(async ([champion, stats]) => {
            const avgKills = stats.kills / stats.gamesPlayed;
            const avgDeaths = stats.deaths / stats.gamesPlayed || 1;
            const avgAssists = stats.assists / stats.gamesPlayed;
            const avgKDA = (avgKills + avgAssists) / avgDeaths;
            const bubbleSize = calculateSize(avgKDA);
            
            const symbolUrl = await createChampionSymbol(
                champion, 
                bubbleSize, 
                roleColors[stats.role] || '#ffffff'
            );

            return {
                name: champion,
                value: avgKDA.toFixed(2),
                symbolSize: bubbleSize,
                symbol: `image://${symbolUrl}`,
                label: {
                    show: true,
                    position: 'bottom',
                    distance: 8,
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: [3, 6],
                    borderRadius: 4
                },
                tooltip: {
                    formatter: function(params) {
                        return `
                            <strong>${champion}</strong><br/>
                            Rôle: ${stats.role}<br/>
                            Parties jouées: ${stats.gamesPlayed}<br/>
                            KDA: ${avgKDA.toFixed(2)}<br/>
                            K/D/A moyens: ${avgKills.toFixed(1)}/${avgDeaths.toFixed(1)}/${avgAssists.toFixed(1)}
                        `;
                    }
                }
            };
        });

        return Promise.all(dataPromises);
    }

    // Création des boutons de sélection des joueurs
    function createPlayerButtons() {
        const existingButtons = document.querySelector('.player-buttons');
        if (existingButtons) {
            existingButtons.remove();
        }

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'player-buttons';
        
        kcPlayers.forEach(player => {
            const btn = document.createElement('button');
            btn.textContent = player;
            btn.className = player === currentPlayer ? 'active' : '';
            btn.onclick = () => {
                currentPlayer = player;
                // Mettre à jour les boutons actifs
                document.querySelectorAll('.player-buttons button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updateChart(player);
            };
            buttonContainer.appendChild(btn);
        });

        document.querySelector('.graph-container')?.appendChild(buttonContainer);
    }

    // Mise à jour du graphique
    async function updateChart(playerName) {
        if (!chartContainer || !chart) return;

        try {
            const data = await createPlayerData(playerName);
            if (data.length === 0) return;

            const option = {
                title: {
                    text: `Champions joués par ${playerName}`,
                    textStyle: {
                        color: '#ffffff',
                        fontSize: 18,
                        fontFamily: 'Cairo',
                        fontWeight: 'bold'
                    },
                    left: 'center',
                    top: 20
                },
                tooltip: {
                    show: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    borderColor: '#ffffff',
                    borderWidth: 1,
                    borderRadius: 8,
                    textStyle: {
                        color: '#ffffff',
                        fontSize: 12
                    },
                    padding: 10
                },
                backgroundColor: 'transparent',
                series: [{
                    type: 'graph',
                    layout: 'force',
                    data: data,
                    force: {
                        repulsion: [100,200],
                        gravity: 0.1,
                        edgeLength: 120,
                        friction: 0.6,
                        layoutAnimation: true,
                        preventOverlap: true,
                        nodeSpacing: 30
                    },
                    roam: true,
                    draggable: true,
                    nodeScaleRatio: 0.6,
                    emphasis: {
                        scale: 1.2,
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