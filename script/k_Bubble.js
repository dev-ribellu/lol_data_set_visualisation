document.addEventListener('DOMContentLoaded', function() {
    const chartContainer = document.getElementById('bubble-chart');
    const chart = echarts.init(chartContainer);
    
    // Données des joueurs KC
    const kcPlayers = ['Canna', 'Yike', 'Vladi', 'Caliste', 'Targamas'];
    let currentPlayer = 'Canna';

    function updateChartSize() {
        chart.resize();
    }

    function createPlayerData(playerName) {
        // Exemple de données (à remplacer par vos vraies données)
        return [
            {
                name: 'Champion1',
                value: 10,
                symbolSize: 100,
                itemStyle: { color: '#ff7675' }
            },
            {
                name: 'Champion2',
                value: 20,
                symbolSize: 120,
                itemStyle: { color: '#74b9ff' }
            }
        ];
    }

    function updateChart(playerName) {
        const option = {
            title: {
                text: `Champions joués par ${playerName}`,
                textStyle: {
                    color: '#fff',
                    fontSize: 16,
                    fontFamily: 'Cairo'
                }
            },
            tooltip: {
                show: true,
                formatter: '{b}: KDA {c}'
            },
            backgroundColor: 'transparent',
            series: [{
                type: 'graph',
                layout: 'force',
                data: createPlayerData(playerName),
                force: {
                    repulsion: 300,          // Augmenté pour plus d'espacement
                    gravity: 0.1,
                    edgeLength: 250,         // Augmenté pour plus de distance
                    friction: 0.6,
                    layoutAnimation: true
                },
                roam: true,
                draggable: true,
                nodeScaleRatio: 1,          // Corrigé : un seul nodeScaleRatio
                symbolSize: function(value) {
                    // Taille adaptive selon la taille du conteneur
                    const containerWidth = chartContainer.clientWidth;
                    const baseSize = Math.min(containerWidth / 10, 80);
                    return baseSize + value * 2;
                },            // Augmenté pour des bulles plus grandes
                center: ['50%', '50%'],
                scaleLimit: {
                    min: 0.4,
                    max: 2
                },
                label: {
                    show: true,
                    color: '#fff',
                    fontSize: 12
                },
                itemStyle: {
                    borderColor: '#fff',
                    borderWidth: 2,
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.3)'
                }
            }]
        };
        
        chart.setOption(option);
    }

    // Créer les boutons de sélection de joueur
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

    // Ajouter les boutons au container
    document.querySelector('.graph-container').appendChild(buttonContainer);

    // Gestion du responsive
    window.addEventListener('resize', function() {
        updateChartSize();
        updateChart(currentPlayer); // Recalcul des tailles au redimensionnement
    });

    // Initialisation
    updateChart(currentPlayer);
    updateChartSize();
});