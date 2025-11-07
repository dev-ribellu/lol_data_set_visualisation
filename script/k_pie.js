/* filepath: c:\Users\pietr\OneDrive\Bureau\Dossier_travail\Corte\S3\SAE_data\lol_data_set_visualisation\script\k_pie.js */
document.addEventListener('DOMContentLoaded', function() {
    console.log('k_pie.js chargé !');
    
    const kcPlayers = ['Canna', 'Yike', 'Vladi', 'Caliste', 'Targamas'];
    
    const roleColors = {
        'TOP': '#ff4757',
        'JUNGLE': '#2ed573',
        'MID': '#ffa502',
        'ADC': '#1e90ff',
        'SUPPORT': '#5352ed'
    };

    // Descriptions des joueurs
    const playerDescriptions = {
        'Canna': 'Toplaner coréen expérimenté, ancien joueur de T1. Connu pour sa polyvalence et sa solide présence en early game.',
        'Yike': 'Jungler talentueux avec un excellent contrôle de vision. Spécialiste du macro-jeu et des rotations stratégiques.',
        'Vladi': 'Midlaner européen prometteur avec un style agressif. Excellent en teamfight et dans les situations clutch.',
        'Caliste': 'ADC français avec un positioning exemplaire. Réputé pour sa sécurité et sa constance en late game.',
        'Targamas': 'Support expérimenté et shotcaller de l\'équipe. Maître des engages et du roaming stratégique.'
    };

    // Descriptions des métriques
    const metricDescriptions = {
        'Early Game Impact': 'Mesure la capacité à avoir un impact positif en début de partie. Calculé sur le ratio kills+assists vs deaths dans les 15 premières minutes.',
        'Vision Control Impact': 'Évalue l\'efficacité du contrôle de vision. Basé sur le placement/destruction de wards, les wards de contrôle et le vision score par minute.',
        'Team Fight Excellence': 'Indique les performances en combat d\'équipe. Calculé sur le pourcentage de games avec un KDA supérieur à 2.',
        'Positioning Mastery': 'Mesure la sécurité et le positioning. Basé sur le pourcentage de games avec 3 deaths ou moins.',
        'Playmaking Success': 'Évalue la capacité à créer des opportunités. Calculé sur la constance des assists par rapport à la moyenne personnelle.'
    };

    // Variable globale pour stocker les données des joueurs
    let globalPlayerStats = {};

    // Fonction pour créer un tooltip
    function createTooltip(text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        document.body.appendChild(tooltip);
        return tooltip;
    }

    // Fonction pour afficher le tooltip
    function showTooltip(event, text, isPlayerName = false) {
        let tooltip = document.querySelector('.tooltip.show');
        if (!tooltip) {
            tooltip = createTooltip(text);
        } else {
            tooltip.textContent = text;
        }
        
        tooltip.classList.add('show');
        
        const rect = event.target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        // Ajouter le scroll pour obtenir la position absolue
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        let left = rect.left + scrollLeft + rect.width / 2 - tooltipRect.width / 2;
        let top = rect.top + scrollTop - tooltipRect.height; // Position absolue avec scroll
        
        // Ajustements pour rester dans la viewport
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        if (top < scrollTop + 10) { // Vérifier par rapport au scroll aussi
            top = rect.bottom + scrollTop + 5; // Position en bas avec scroll
        }

        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }

    // Fonction pour masquer le tooltip
    function hideTooltip() {
        const tooltip = document.querySelector('.tooltip.show');
        if (tooltip) {
            tooltip.classList.remove('show');
            setTimeout(() => {
                if (tooltip && !tooltip.classList.contains('show')) {
                    tooltip.remove();
                }
            }, 300);
        }
    }

    // Fonction pour extraire les stats des joueurs KC depuis le JSON
    function extractKCPlayerStats(data) {
        const playerStats = {};
        const kcGames = data.filter(game => game && game.Team === 'KC');
        
        kcPlayers.forEach(playerName => {
            const playerGames = kcGames.filter(game => game.Player === playerName);
            
            if (playerGames.length > 0) {
                const totalGames = playerGames.length;
                const role = playerGames[0].Role;
                
                let metricName, value;
                
                if (playerName === 'Canna') {
                    const goodEarlyGames = playerGames.filter(game => 
                        Number(game.Kills || 0) + Number(game.Assists || 0) > 0 && 
                        Number(game.Deaths || 0) <= 2
                    ).length;
                    metricName = 'Early Game Impact';
                    value = Math.round((goodEarlyGames / totalGames) * 100);
                    
                } else if (playerName === 'Yike') {
                    // Vision Control Impact - Calculé à partir des stats de vision
                    let totalVisionScore = 0;
                    let totalWardsPlaced = 0;
                    let totalWardsDestroyed = 0;
                    let totalControlWards = 0;
                    let totalVSPM = 0;
                    
                    playerGames.forEach(game => {
                        totalVisionScore += Number(game['Vision Score'] || 0);
                        totalWardsPlaced += Number(game['Wards placed'] || 0);
                        totalWardsDestroyed += Number(game['Wards destroyed'] || 0);
                        totalControlWards += Number(game['Control Wards Purchased'] || 0);
                        totalVSPM += Number(game.VSPM || 0);
                    });
                    
                    // Moyennes par game
                    const avgVisionScore = totalVisionScore / totalGames;
                    const avgWardsPlaced = totalWardsPlaced / totalGames;
                    const avgWardsDestroyed = totalWardsDestroyed / totalGames;
                    const avgControlWards = totalControlWards / totalGames;
                    const avgVSPM = totalVSPM / totalGames;
                    
                    // Calcul du Vision Control Impact
                    const visionEfficiency = Math.min((avgWardsDestroyed / Math.max(avgWardsPlaced, 1)) * 100, 100);
                    const controlWardImpact = Math.min(avgControlWards * 8, 100);
                    const visionScoreImpact = Math.min((avgVisionScore / 60) * 100, 100);
                    const vspmImpact = Math.min((avgVSPM / 1.5) * 100, 100);
                    
                    // Vision Control Impact final (moyenne pondérée)
                    const visionControlImpact = Math.round(
                        (visionEfficiency * 0.25 +      
                         controlWardImpact * 0.30 +     
                         visionScoreImpact * 0.25 +     
                         vspmImpact * 0.20)             
                    );
                    
                    metricName = 'Vision Control Impact';
                    value = Math.min(Math.max(visionControlImpact, 0), 100);
                    
                } else if (playerName === 'Vladi') {
                    const goodKDAGames = playerGames.filter(game => {
                        const kda = (Number(game.Kills || 0) + Number(game.Assists || 0)) / Math.max(Number(game.Deaths || 0), 1);
                        return kda >= 2;
                    }).length;
                    metricName = 'Team Fight Excellence';
                    value = Math.round((goodKDAGames / totalGames) * 100);
                    
                } else if (playerName === 'Caliste') {
                    const safePlaysGames = playerGames.filter(game => Number(game.Deaths || 0) <= 3).length;
                    metricName = 'Positioning Mastery';
                    value = Math.round((safePlaysGames / totalGames) * 100);
                    
                } else if (playerName === 'Targamas') {
                    const avgAssists = playerGames.reduce((sum, game) => sum + Number(game.Assists || 0), 0) / totalGames;
                    const goodAssistGames = playerGames.filter(game => Number(game.Assists || 0) >= avgAssists).length;
                    metricName = 'Playmaking Success';
                    value = Math.round((goodAssistGames / totalGames) * 100);
                }
                
                // Calculer d'autres stats pour l'affichage
                const avgKDA = playerGames.reduce((sum, game) => {
                    const kda = (Number(game.Kills || 0) + Number(game.Assists || 0)) / Math.max(Number(game.Deaths || 0), 1);
                    return sum + kda;
                }, 0) / totalGames;

                const winRate = (playerGames.filter(game => game.Result === 'Win').length / totalGames) * 100;
                
                playerStats[playerName] = {
                    metric: metricName,
                    value: Math.min(Math.max(value, 0), 100),
                    role: role,
                    color: roleColors[role] || '#ffffff',
                    totalGames: totalGames,
                    avgKDA: avgKDA,
                    winRate: winRate
                };
            }
        });
        
        return playerStats;
    }

    // Fonction pour afficher les stats d'un joueur
    function displayPlayerStats(playerName) {
        const container = document.getElementById('player-stats-container');
        const stats = globalPlayerStats[playerName];
        
        if (!stats) {
            container.innerHTML = `
                <h3 class="player-stats-title">Joueur non trouvé</h3>
                <p class="player-stats-subtitle">Données indisponibles pour ${playerName}</p>
            `;
            return;
        }

        container.innerHTML = `
            <div class="player-individual-stats">
                <div class="player-info-header" style="border-left-color: ${stats.color};">
                    <div>
                        <h3 class="player-stats-title has-tooltip">${playerName}</h3>
                        <span class="player-role-badge" style="background-color: ${stats.color};">${stats.role}</span>
                    </div>
                </div>
                
                <div class="player-stats-grid">
                    <div class="stat-item">
                        <div class="stat-label">Games Played</div>
                        <div class="stat-value">${stats.totalGames}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Win Rate</div>
                        <div class="stat-value">${stats.winRate.toFixed(1)}%</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Avg KDA</div>
                        <div class="stat-value">${stats.avgKDA.toFixed(2)}</div>
                    </div>
                    <div class="stat-item has-tooltip">
                        <div class="stat-label">${stats.metric}</div>
                        <div class="stat-value" style="color: ${stats.color};">${stats.value}%</div>
                    </div>
                </div>
                
                <div id="player-pie-${playerName.toLowerCase()}" class="player-pie-chart ${playerName.toLowerCase()}"></div>
            </div>
        `;

        // Ajouter les event listeners pour les tooltips
        const playerTitle = container.querySelector('.player-stats-title.has-tooltip');
        const metricStat = container.querySelector('.stat-item.has-tooltip');

        if (playerTitle) {
            playerTitle.addEventListener('mouseenter', (e) => {
                showTooltip(e, playerDescriptions[playerName] || 'Description non disponible', true);
            });
            playerTitle.addEventListener('mouseleave', hideTooltip);
        }

        if (metricStat) {
            metricStat.addEventListener('mouseenter', (e) => {
                showTooltip(e, metricDescriptions[stats.metric] || 'Description non disponible', false);
            });
            metricStat.addEventListener('mouseleave', hideTooltip);
        }

        // Créer le graphique pie pour ce joueur
        createPlayerPieChart(playerName, stats);
    }

        
    
        
    
        
    
        // ...existing code jusqu'à createPlayerPieChart...
    
    function createPlayerPieChart(playerName, stats) {
        const containerId = `player-pie-${playerName.toLowerCase()}`;
        const container = document.getElementById(containerId);
        
        if (!container) return;
    
        const chart = echarts.init(container);
        
        // Redéfinir les descriptions ici pour qu'elles soient accessibles
        const metricDescriptions = {
            'Early Game Impact': 'Mesure la capacité à avoir un impact positif en début de partie. Calculé sur le ratio kills+assists vs deaths dans les 15 premières minutes.',
            'Vision Control Impact': 'Évalue l\'efficacité du contrôle de vision. Basé sur le placement/destruction de wards, les wards de contrôle et le vision score par minute.',
            'Team Fight Excellence': 'Indique les performances en combat d\'équipe. Calculé sur le pourcentage de games avec un KDA supérieur à 2.',
            'Positioning Mastery': 'Mesure la sécurité et le positioning. Basé sur le pourcentage de games avec 3 deaths ou moins.',
            'Playmaking Success': 'Évalue la capacité à créer des opportunités. Calculé sur la constance des assists par rapport à la moyenne personnelle.'
        };
        
        const option = {
            title: {
                text: stats.metric,
                left: 'center',
                top: '5%',
                textStyle: {
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: 'bold',
                    fontFamily: 'Cairo',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.9)'
                }
            },
            backgroundColor: 'transparent',
            // Désactiver le tooltip ECharts
            tooltip: { show: false },
            series: [
                // Fond gris
                {
                    type: 'pie',
                    radius: ['40%', '60%'],
                    center: ['50%', '55%'],
                    startAngle: 90,
                    silent: true,
                    itemStyle: {
                        color: 'rgba(80, 80, 80, 0.3)',
                        borderColor: 'rgba(80, 80, 80, 0.5)',
                        borderWidth: 2
                    },
                    label: { show: false },
                    data: [{ value: 100 }]
                },
                // Progress principal
                {
                    type: 'pie',
                    radius: ['40%', '60%'],
                    center: ['50%', '55%'],
                    startAngle: 90,
                    clockwise: true,
                    itemStyle: {
                        borderRadius: 8,
                        shadowBlur: 25,
                        shadowColor: stats.color + '90',
                        shadowOffsetX: 0,
                        shadowOffsetY: 8,
                        borderColor: stats.color,
                        borderWidth: 4
                    },
                    label: { show: false },
                    data: [
                        {
                            value: stats.value,
                            name: stats.metric,
                            itemStyle: {
                                color: {
                                    type: 'linear',
                                    x: 0, y: 0, x2: 1, y2: 1,
                                    colorStops: [
                                        { offset: 0, color: stats.color },
                                        { offset: 1, color: stats.color + 'E0' }
                                    ]
                                }
                            }
                        },
                        {
                            value: 100 - stats.value,
                            name: 'empty',
                            itemStyle: { color: 'transparent' }
                        }
                    ]
                }
            ],
            graphic: [
                {
                    type: 'rect',
                    style: {
                        fill: 'rgba(0, 0, 0, 0.7)',
                        stroke: 'none'
                    },
                    shape: {
                        x: -45,
                        y: -25,
                        width: 90,
                        height: 50,
                        r: 10
                    },
                    left: 'center',
                    top: '50%',
                    z: 9
                },
                {
                    type: 'text',
                    style: {
                        text: `${stats.value}%`,
                        fontSize: 28,
                        fontWeight: 'bold',
                        fill: '#ffffff',
                        textAlign: 'center',
                        textShadow: '3px 3px 6px rgba(0,0,0,1)'
                    },
                    left: 'center',
                    top: '50%',
                    z: 10
                }
            ]
        };
    
        chart.setOption(option);
        
        // Ajouter le tooltip personnalisé avec le même système
        chart.getZr().on('mousemove', function(e) {
            // Calculer si on est sur la zone colorée du pie
            const center = [container.offsetWidth * 0.5, container.offsetHeight * 0.55];
            const radius = [container.offsetWidth * 0.4 * 0.4, container.offsetWidth * 0.6 * 0.4]; // Approximation des rayons
            
            const dx = e.offsetX - center[0];
            const dy = e.offsetY - center[1];
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Si on est dans la zone du donut
            if (distance >= radius[0] && distance <= radius[1]) {
                // Calculer l'angle pour voir si on est sur la partie colorée
                const angle = Math.atan2(dy, dx) * 180 / Math.PI + 90; // +90 car startAngle = 90
                const normalizedAngle = angle < 0 ? angle + 360 : angle;
                const percentAngle = (stats.value / 100) * 360;
                
                if (normalizedAngle <= percentAngle) {
                    // On est sur la zone colorée, afficher le tooltip
                    const mouseEvent = {
                        clientX: e.event.clientX,
                        clientY: e.event.clientY,
                        target: container
                    };
                    showTooltip(mouseEvent, metricDescriptions[stats.metric] || 'Description non disponible');
                    container.style.cursor = 'pointer';
                } else {
                    hideTooltip();
                    container.style.cursor = 'default';
                }
            } else {
                hideTooltip();
                container.style.cursor = 'default';
            }
        });
        
        chart.getZr().on('mouseout', function() {
            hideTooltip();
            container.style.cursor = 'default';
        });
        
        setTimeout(() => chart.resize(), 100);
    }
    
    // ...existing code pour le reste...
    
    
    
    
    
    

    // Exposer la fonction globalement pour k_Bubble.js
    window.showPlayerStats = displayPlayerStats;

    // Chargement des données
    fetch('LEC_Winter_Season_2025.json')
        .then(response => response.json())
        .then(data => {
            globalPlayerStats = extractKCPlayerStats(data);
            console.log('Stats des joueurs chargées:', globalPlayerStats);
        })
        .catch(error => {
            console.error('Erreur de chargement:', error);
            // Données de fallback
            globalPlayerStats = {
                'Canna': { metric: 'Early Game Impact', value: 44, role: 'TOP', color: '#ff4757', totalGames: 10, avgKDA: 2.1, winRate: 60 },
                'Yike': { metric: 'Vision Control Impact', value: 78, role: 'JUNGLE', color: '#2ed573', totalGames: 10, avgKDA: 2.8, winRate: 70 },
                'Vladi': { metric: 'Team Fight Excellence', value: 67, role: 'MID', color: '#ffa502', totalGames: 10, avgKDA: 2.4, winRate: 65 },
                'Caliste': { metric: 'Positioning Mastery', value: 89, role: 'ADC', color: '#1e90ff', totalGames: 10, avgKDA: 3.2, winRate: 80 },
                'Targamas': { metric: 'Playmaking Success', value: 67, role: 'SUPPORT', color: '#5352ed', totalGames: 10, avgKDA: 1.9, winRate: 55 }
            };
        });
});