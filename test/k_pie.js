document.addEventListener('DOMContentLoaded', function() {
    console.log('k_pie.js chargé !');
    
    // Vérifier que tous les containers existent et sont visibles
    const kcPlayers = ['Canna', 'Yike', 'Vladi', 'Caliste', 'Targamas'];
    
    kcPlayers.forEach(player => {
        const containerId = `${player.toLowerCase()}-pie`;
        const container = document.getElementById(containerId);
        if (container) {
            console.log(`✅ Container ${containerId} trouvé`, {
                width: container.offsetWidth,
                height: container.offsetHeight,
                visible: container.style.display !== 'none'
            });
        } else {
            console.error(`❌ Container ${containerId} non trouvé`);
        }
    });
    
    // Configuration des joueurs KC
    const roleColors = {
        'TOP': '#ff4757',
        'JUNGLE': '#2ed573',
        'MID': '#ffa502',
        'ADC': '#1e90ff',
        'SUPPORT': '#5352ed'
    };

    // Fonction pour extraire les stats des joueurs KC depuis le JSON
    function extractKCPlayerStats(data) {
        const playerStats = {};
        
        // Filtrer les données pour KC seulement
        const kcGames = data.filter(game => game && game.Team === 'KC');
        console.log(`Trouvé ${kcGames.length} games KC`);
        
        kcPlayers.forEach(playerName => {
            const playerGames = kcGames.filter(game => game.Player === playerName);
            console.log(`${playerName}: ${playerGames.length} games`);
            
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
                    let totalKP = 0;
                    playerGames.forEach(game => {
                        const teamKills = kcGames
                            .filter(g => g.GameID === game.GameID && g.Team === 'KC')
                            .reduce((total, g) => total + Number(g.Kills || 0), 0);
                        const playerKP = (Number(game.Kills || 0) + Number(game.Assists || 0)) / Math.max(teamKills, 1);
                        totalKP += playerKP;
                    });
                    metricName = 'Kill Participation';
                    value = Math.round((totalKP / totalGames) * 100);
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
                
                playerStats[playerName] = {
                    metric: metricName,
                    value: Math.min(Math.max(value, 0), 100),
                    role: role,
                    color: roleColors[role] || '#ffffff',
                    totalGames: totalGames
                };
                
                console.log(`${playerName} stats:`, playerStats[playerName]);
            }
        });
        
        return playerStats;
    }

    // Fonction pour créer un pie chart 3D avec bordure
    function create3DPieChart(playerName, stats, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container non trouvé: ${containerId}`);
            return null;
        }

        console.log(`Initialisation ECharts pour ${playerName} dans container:`, {
            id: containerId,
            width: container.offsetWidth,
            height: container.offsetHeight
        });

        // Force les dimensions si nécessaire
        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
            container.style.width = '300px';
            container.style.height = '350px';
            console.log(`Dimensions forcées pour ${containerId}`);
        }

        const chart = echarts.init(container);
        
        const option = {
            title: {
                text: playerName,
                subtext: `${stats.role} - ${stats.metric}`,
                left: 'center',
                top: '5%',
                textStyle: {
                    color: '#ffffff',
                    fontSize: 18,
                    fontWeight: 'bold',
                    fontFamily: 'Cairo'
                },
                subtextStyle: {
                    color: '#cccccc',
                    fontSize: 12,
                    fontFamily: 'Cairo'
                }
            },
            backgroundColor: 'transparent',
            series: [
                // Fond gris (partie non remplie)
                {
                    type: 'pie',
                    radius: ['45%', '65%'],
                    center: ['50%', '55%'],
                    startAngle: 90,
                    silent: true,
                    itemStyle: {
                        color: 'rgba(80, 80, 80, 0.3)',
                        borderColor: 'rgba(80, 80, 80, 0.5)',
                        borderWidth: 2
                    },
                    label: { show: false },
                    data: [{ value: 100, name: 'background' }]
                },
                // Progress principal (3D effect)
                {
                    type: 'pie',
                    radius: ['45%', '65%'],
                    center: ['50%', '55%'],
                    startAngle: 90,
                    clockwise: true,
                    itemStyle: {
                        borderRadius: 8,
                        shadowBlur: 25,
                        shadowColor: stats.color + '80',
                        shadowOffsetX: 0,
                        shadowOffsetY: 8,
                        borderColor: stats.color,
                        borderWidth: 3
                    },
                    label: { show: false },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 35,
                            shadowColor: stats.color,
                            scale: 1.05
                        }
                    },
                    data: [
                        {
                            value: stats.value,
                            name: 'progress',
                            itemStyle: {
                                color: {
                                    type: 'linear',
                                    x: 0, y: 0, x2: 1, y2: 1,
                                    colorStops: [
                                        { offset: 0, color: stats.color },
                                        { offset: 0.5, color: stats.color + 'E6' },
                                        { offset: 1, color: stats.color + 'CC' }
                                    ]
                                }
                            }
                        },
                        {
                            value: 100 - stats.value,
                            name: 'empty',
                            itemStyle: { 
                                color: 'transparent',
                                borderWidth: 0
                            }
                        }
                    ]
                }
            ],
            graphic: [
                // Pourcentage au centre
                {
                    type: 'text',
                    style: {
                        text: `${stats.value}%`,
                        fontSize: 24,
                        fontWeight: 'bold',
                        fill: '#ffffff',
                        textAlign: 'center',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    },
                    left: 'center',
                    top: '50%',
                    z: 10
                },
                // Rôle
                {
                    type: 'text',
                    style: {
                        text: stats.role,
                        fontSize: 12,
                        fontWeight: '600',
                        fill: stats.color,
                        textAlign: 'center',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                    },
                    left: 'center',
                    top: '60%',
                    z: 10
                }
            ],
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                borderColor: stats.color,
                borderWidth: 2,
                borderRadius: 8,
                textStyle: {
                    color: '#ffffff',
                    fontSize: 14,
                    fontFamily: 'Cairo'
                },
                formatter: function(params) {
                    if (params.name === 'progress') {
                        return `
                            <div style="padding: 8px;">
                                <strong style="color: ${stats.color};">${playerName}</strong><br/>
                                <span style="color: #cccccc;">${stats.metric}</span><br/>
                                <span style="font-size: 18px; font-weight: bold;">${stats.value}%</span><br/>
                                <span style="color: #999; font-size: 12px;">Sur ${stats.totalGames} games</span>
                            </div>
                        `;
                    }
                    return '';
                }
            }
        };

        chart.setOption(option);
        
        // Force le redraw
        setTimeout(() => {
            chart.resize();
        }, 100);
        
        console.log(`📊 Graphique configuré pour ${playerName}`);
        return chart;
    }

    // Test avec données factices d'abord
    function createTestCharts() {
        const testStats = {
            'Canna': { metric: 'Early Game Impact', value: 44, role: 'TOP', color: '#ff4757', totalGames: 10 },
            'Yike': { metric: 'Kill Participation', value: 9, role: 'JUNGLE', color: '#2ed573', totalGames: 10 },
            'Vladi': { metric: 'Team Fight Excellence', value: 67, role: 'MID', color: '#ffa502', totalGames: 10 },
            'Caliste': { metric: 'Positioning Mastery', value: 89, role: 'ADC', color: '#1e90ff', totalGames: 10 },
            'Targamas': { metric: 'Playmaking Success', value: 67, role: 'SUPPORT', color: '#5352ed', totalGames: 10 }
        };
        
        Object.entries(testStats).forEach(([playerName, stats]) => {
            const containerId = `${playerName.toLowerCase()}-pie`;
            create3DPieChart(playerName, stats, containerId);
        });
    }

    // Démarrer directement avec les données de test
    console.log('🧪 Création des graphiques de test...');
    createTestCharts();

    // Chargement des vraies données (commenté pour test)
    /*
    fetch('LEC_Winter_Season_2025.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Données JSON chargées:', data.length, 'entrées');
            
            const playerStats = extractKCPlayerStats(data);
            console.log('Stats des joueurs:', playerStats);
            
            // Créer les graphiques pour chaque joueur
            Object.entries(playerStats).forEach(([playerName, stats]) => {
                const containerId = `${playerName.toLowerCase()}-pie`;
                console.log(`Création du graphique pour ${playerName} dans ${containerId}`);
                
                const chart = create3DPieChart(playerName, stats, containerId);
                if (chart) {
                    console.log(`✅ Graphique créé pour ${playerName}: ${stats.value}%`);
                } else {
                    console.error(`❌ Échec création graphique pour ${playerName}`);
                }
            });
        })
        .catch(error => {
            console.error('Erreur de chargement des données:', error);
            createTestCharts();
        });
    */

    // Gestion du redimensionnement
    window.addEventListener('resize', () => {
        kcPlayers.forEach(player => {
            const containerId = `${player.toLowerCase()}-pie`;
            const chart = echarts.getInstanceByDom(document.getElementById(containerId));
            if (chart) {
                chart.resize();
            }
        });
    });
});