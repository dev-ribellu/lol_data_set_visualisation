let radarChart = null;
let allPlayersData = [];

async function createRadarChart() {
    const response = await fetch('LEC_Winter_Season_2025.json');
    const data = await response.json();
    
    // Filtrer les joueurs KC
    const kcPlayers = data.filter(p => p.Team === 'KC');
    
    // Mapping des rôles par joueur KC
    const playerRoles = {
        'Canna': 'TOP',
        'Yike': 'JUNGLE',
        'Vladi': 'MID',
        'Caliste': 'ADC',
        'Targamas': 'SUPPORT'
    };
    
    // Couleurs des rôles (mêmes que k_Bubble.js)
    const roleColors = {
        'TOP': '#ff4757',
        'JUNGLE': '#2ed573',
        'MID': '#ffa502',
        'ADC': '#ffffff',
        'SUPPORT': '#5352ed'
    };
    
    // Calculer les moyennes par joueur
    const playerStats = {};
    
    kcPlayers.forEach(match => {
        const player = match.Player;
        if (!playerStats[player]) {
            playerStats[player] = {
                kda: [],
                cspm: [],
                goldShare: [],
                dmgShare: [],
                kp: []
            };
        }
        
        // Vérifier et ajouter les valeurs seulement si elles existent
        if (match.KDA !== undefined && match.KDA !== null && !isNaN(match.KDA)) {
            playerStats[player].kda.push(parseFloat(match.KDA));
        }
        if (match.CSM !== undefined && match.CSM !== null && !isNaN(match.CSM)) {
            playerStats[player].cspm.push(parseFloat(match.CSM));
        }
        if (match['GOLD%'] !== undefined && match['GOLD%'] !== null) {
            playerStats[player].goldShare.push(parseFloat(match['GOLD%']));
        }
        if (match['DMG%'] !== undefined && match['DMG%'] !== null) {
            playerStats[player].dmgShare.push(parseFloat(match['DMG%']));
        }
        if (match['KP%'] !== undefined && match['KP%'] !== null) {
            playerStats[player].kp.push(parseFloat(match['KP%']));
        }
    });
    
    // Calculer les moyennes (avec gestion des tableaux vides)
    allPlayersData = Object.keys(playerStats).map(name => ({
        name: name,
        role: playerRoles[name],
        kda: playerStats[name].kda.length > 0 ? avg(playerStats[name].kda) : 0,
        cspm: playerStats[name].cspm.length > 0 ? avg(playerStats[name].cspm) : 0,
        goldShare: playerStats[name].goldShare.length > 0 ? avg(playerStats[name].goldShare) * 100 : 0,
        dmgShare: playerStats[name].dmgShare.length > 0 ? avg(playerStats[name].dmgShare) * 100 : 0,
        kp: playerStats[name].kp.length > 0 ? avg(playerStats[name].kp) * 100 : 0
    }));
    
    // Initialiser le graphique
    radarChart = echarts.init(document.getElementById('radar-chart'));
    updateRadarChart(allPlayersData, roleColors);
    
    // Ajouter les event listeners sur les toggles
    setupToggleListeners(roleColors);
    
    // Responsive
    window.addEventListener('resize', () => radarChart.resize());
}

function updateRadarChart(players, roleColors, animation = true) {
    // Calculer les max dynamiquement
    const maxKDA = Math.max(...allPlayersData.map(p => p.kda), 5) * 1.2;
    const maxCSPM = Math.max(...allPlayersData.map(p => p.cspm), 10) * 1.2;
    const maxGoldShare = Math.max(...allPlayersData.map(p => p.goldShare), 30) * 1.2;
    const maxDmgShare = Math.max(...allPlayersData.map(p => p.dmgShare), 30) * 1.2;
    const maxKP = Math.max(...allPlayersData.map(p => p.kp), 80) * 1.2;
    
    const option = {
        backgroundColor: 'transparent',
        animation: animation,
        animationDuration: 800,
        animationEasing: 'cubicOut',
        tooltip: {
            show: true,
            trigger: 'item',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            borderColor: '#c89b3c',
            borderWidth: 2,
            textStyle: { 
                color: '#fff',
                fontSize: 13
            },
            formatter: function(params) {
                const player = params.name;
                const values = params.value;
                const role = players.find(p => p.name === player)?.role || '';
                const color = roleColors[role] || '#ffffff';
                
                return `<div style="border-left: 3px solid ${color}; padding-left: 8px;">
                        <strong style="font-size: 14px;">${player}</strong> 
                        <span style="color: ${color};">(${role})</span><br/>
                        <span style="color: #c89b3c;">KDA:</span> ${values[0].toFixed(2)}<br/>
                        <span style="color: #c89b3c;">CS/M:</span> ${values[1].toFixed(2)}<br/>
                        <span style="color: #c89b3c;">Gold%:</span> ${values[2].toFixed(1)}%<br/>
                        <span style="color: #c89b3c;">DMG%:</span> ${values[3].toFixed(1)}%<br/>
                        <span style="color: #c89b3c;">KP%:</span> ${values[4].toFixed(1)}%
                        </div>`;
            }
        },
        legend: {
            show: false
        },
        radar: {
            indicator: [
                { name: 'KDA', max: maxKDA },
                { name: 'CS/M', max: maxCSPM },
                { name: 'Gold%', max: maxGoldShare },
                { name: 'DMG%', max: maxDmgShare },
                { name: 'KP%', max: maxKP }
            ],
            center: ['50%', '50%'],
            radius: '65%',
            axisName: {
                color: '#fff',
                fontSize: 14,
                fontWeight: 'bold'
            },
            splitArea: {
                areaStyle: {
                    color: ['rgba(200, 155, 60, 0.1)', 'rgba(200, 155, 60, 0.2)']
                }
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.2)'
                }
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.2)'
                }
            }
        },
        series: [{
            type: 'radar',
            emphasis: {
                lineStyle: {
                    width: 4
                }
            },
            animation: animation,
            animationDuration: 800,
            animationEasing: 'cubicOut',
            data: players.map((player) => {
                const color = roleColors[player.role] || '#ffffff';
                return {
                    value: [
                        player.kda,
                        player.cspm,
                        player.goldShare,
                        player.dmgShare,
                        player.kp
                    ],
                    name: player.name,
                    areaStyle: {
                        color: hexToRgba(color, 0.3)
                    },
                    lineStyle: {
                        color: color,
                        width: 3
                    },
                    symbol: 'circle',
                    symbolSize: 8,
                    itemStyle: {
                        color: color
                    }
                };
            })
        }]
    };
    
    radarChart.setOption(option, true); // true = fusionner avec l'ancienne option
}

function setupToggleListeners(roleColors) {
    const toggleItems = document.querySelectorAll('.toggle-item');
    
    toggleItems.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        const playerName = item.dataset.player;
        
        checkbox.addEventListener('change', function() {
            // Filtrer les joueurs actifs
            const activePlayers = allPlayersData.filter(player => {
                const toggle = document.querySelector(`.toggle-item[data-player="${player.name}"] input`);
                return toggle && toggle.checked;
            });
            
            // Mettre à jour le graphique avec animation
            updateRadarChart(activePlayers, roleColors, true);
        });
    });
}

function avg(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// Convertir hex en rgba
function hexToRgba(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', createRadarChart);