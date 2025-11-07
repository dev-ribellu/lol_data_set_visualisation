document.addEventListener('DOMContentLoaded', function() {
    console.log('line.js chargé !');
    
    // Fonction pour convertir le temps en minutes
    function timeToMinutes(timeString) {
        if (!timeString) return 0;
        const parts = timeString.split(':');
        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;
        const seconds = parseInt(parts[2]) || 0;
        return hours * 60 + minutes + seconds / 60;
    }
    
    // Fonction pour extraire les données d'avantage gold moyennes par tranche de temps
    function extractAverageGoldAdvantage(data) {
        const kcGames = data.filter(game => game && game.Team && (game.Team === 'KC' || game.Team.includes('KC')));
        
        if (kcGames.length === 0) {
            console.warn('Aucun match KC trouvé');
            return [];
        }
        
        // Grouper par match et moment temporel
        const timeSlots = {}; // time -> [advantages]
        const gameDurations = [];
        
        // Traiter chaque partie
        const gameGroups = {};
        kcGames.forEach(game => {
            const gameId = `${game.Date}_${game.No_Game || 'unknown'}`;
            if (!gameGroups[gameId]) {
                gameGroups[gameId] = [];
            }
            gameGroups[gameId].push(game);
        });
        
        Object.values(gameGroups).forEach(gameData => {
            if (gameData.length === 0) return;
            
            // Calculer l'avantage gold pour ce moment de la partie
            let kcGold = 0;
            let enemyGold = 0;
            
            gameData.forEach(player => {
                const gold = Number(player.Golds || player.Gold || 0);
                if (player.Team === 'KC') {
                    kcGold += gold;
                } else {
                    enemyGold += gold;
                }
            });
            
            const gameTime = timeToMinutes(gameData[0].Time);
            const goldAdvantage = kcGold - enemyGold;
            
            if (gameTime > 0) {
                gameDurations.push(gameTime);
                
                // Créer des slots de 2 minutes
                const timeSlot = Math.floor(gameTime / 2) * 2;
                
                if (!timeSlots[timeSlot]) {
                    timeSlots[timeSlot] = [];
                }
                timeSlots[timeSlot].push(goldAdvantage);
            }
        });
        
        // Calculer la durée moyenne
        const avgDuration = gameDurations.length > 0 
            ? gameDurations.reduce((sum, duration) => sum + duration, 0) / gameDurations.length 
            : 35; // Fallback à 35 minutes
        
        // Créer les données moyennes par tranche de temps
        const goldAdvantageData = [];
        const maxTime = Math.ceil(avgDuration);
        
        for (let time = 0; time <= maxTime; time += 2) {
            const advantages = timeSlots[time] || [];
            const avgAdvantage = advantages.length > 0 
                ? advantages.reduce((sum, adv) => sum + adv, 0) / advantages.length 
                : 0;
            
            goldAdvantageData.push({
                time: time,
                advantage: avgAdvantage,
                sampleSize: advantages.length
            });
        }
        
        return goldAdvantageData;
    }
    
    // Fonction pour créer le graphique d'area chart
    function createGoldAdvantageChart(data) {
        const container = document.getElementById('gold-line-chart');
        if (!container) return;
        
        const chart = echarts.init(container);
        
        const goldData = extractAverageGoldAdvantage(data);
        
        if (goldData.length === 0) {
            console.error('Aucune donnée disponible pour le graphique');
            return;
        }
        
        // Préparer les données
        const timePoints = goldData.map(point => point.time + ' min');
        const advantageValues = goldData.map(point => point.advantage);
        
        const option = {
            backgroundColor: 'transparent',
            title: {
                text: 'Évolution moyenne de l\'avantage Gold - KC',
                left: 'center',
                top: '3%',
                textStyle: {
                    color: '#ffffff',
                    fontSize: 18,
                    fontWeight: 'bold',
                    fontFamily: 'Cairo'
                }
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
                textStyle: {
                    color: '#ffffff',
                    fontFamily: 'Cairo'
                },
                formatter: function(params) {
                    if (params.length > 0) {
                        const point = params[0];
                        const advantage = point.value;
                        const time = point.name;
                        const dataIndex = point.dataIndex;
                        const sampleSize = goldData[dataIndex]?.sampleSize || 0;
                        
                        const status = advantage >= 0 ? 'Avantage KC' : 'Désavantage KC';
                        const color = advantage >= 0 ? '#4FC3F7' : '#FF5252';
                        
                        return `
                            <div style="padding: 12px;">
                                <div style="color: ${color}; font-weight: bold; font-size: 14px;">${status}</div>
                                <div style="margin: 5px 0;">Temps: ${time}</div>
                                <div style="margin: 5px 0;">Différence moyenne: ${Math.abs(advantage).toLocaleString()} gold</div>
                                <div style="color: rgba(255,255,255,0.7); font-size: 12px;">Échantillon: ${sampleSize} parties</div>
                            </div>
                        `;
                    }
                    return '';
                }
            },
            grid: {
                left: '8%',
                right: '8%',
                bottom: '12%',
                top: '18%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: timePoints,
                boundaryGap: false,
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.3)',
                        width: 2
                    }
                },
                axisTick: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.3)'
                    }
                },
                axisLabel: {
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: 12,
                    fontFamily: 'Cairo'
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        type: 'dashed'
                    }
                }
            },
            yAxis: {
                type: 'value',
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.3)',
                        width: 2
                    }
                },
                axisTick: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.3)'
                    }
                },
                axisLabel: {
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: 12,
                    fontFamily: 'Cairo',
                    formatter: function(value) {
                        if (value === 0) return '0';
                        return value > 0 ? '+' + (value / 1000).toFixed(1) + 'k' : (value / 1000).toFixed(1) + 'k';
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        type: 'dashed'
                    }
                }
            },
            series: [
                {
                    name: 'Avantage Gold Moyen',
                    type: 'line',
                    data: advantageValues,
                    smooth: true,
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                                { 
                                    offset: 0, 
                                    color: function(params) {
                                        return advantageValues[Math.floor(params.percent * (advantageValues.length - 1))] >= 0 
                                            ? 'rgba(79, 195, 247, 0.6)' 
                                            : 'rgba(255, 82, 82, 0.6)';
                                    }
                                },
                                { 
                                    offset: 1, 
                                    color: function(params) {
                                        return advantageValues[Math.floor(params.percent * (advantageValues.length - 1))] >= 0 
                                            ? 'rgba(79, 195, 247, 0.1)' 
                                            : 'rgba(255, 82, 82, 0.1)';
                                    }
                                }
                            ]
                        }
                    },
                    lineStyle: {
                        width: 3,
                        color: function(params) {
                            const value = advantageValues[params.dataIndex];
                            return value >= 0 ? '#4FC3F7' : '#FF5252';
                        }
                    },
                    itemStyle: {
                        color: function(params) {
                            return params.value >= 0 ? '#4FC3F7' : '#FF5252';
                        },
                        borderColor: '#ffffff',
                        borderWidth: 2
                    },
                    symbol: 'circle',
                    symbolSize: 6,
                    emphasis: {
                        scale: true,
                        symbolSize: 10
                    }
                }
            ]
        };
        
        // Ajouter la ligne de référence à 0
        option.series.push({
            name: 'Ligne d\'égalité',
            type: 'line',
            markLine: {
                silent: true,
                symbol: 'none',
                data: [{
                    yAxis: 0,
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        type: 'solid',
                        width: 2
                    },
                    label: {
                        show: true,
                        position: 'insideEndTop',
                        formatter: 'Égalité',
                        color: '#ffffff',
                        fontSize: 12,
                        fontFamily: 'Cairo'
                    }
                }]
            }
        });
        
        chart.setOption(option);
        
        // Responsive
        window.addEventListener('resize', function() {
            chart.resize();
        });
        
        console.log('Graphique d\'avantage gold créé avec', goldData.length, 'tranches de temps');
        console.log('Données:', goldData);
    }
    
    // Chargement des données
    fetch('LEC_Winter_Season_2025.json')
        .then(response => response.json())
        .then(data => {
            createGoldAdvantageChart(data);
        })
        .catch(error => {
            console.error('Erreur de chargement:', error);
            
            // Données de test pour développement
            const testData = [];
            for (let i = 0; i <= 40; i += 2) {
                testData.push({
                    time: i,
                    advantage: Math.sin(i * 0.1) * 3000 + Math.random() * 1000,
                    sampleSize: 5
                });
            }
            
            const container = document.getElementById('gold-line-chart');
            if (container) {
                const chart = echarts.init(container);
                chart.setOption({
                    backgroundColor: 'transparent',
                    title: {
                        text: 'Données de test - Évolution Gold KC',
                        left: 'center',
                        textStyle: { color: '#ffffff' }
                    },
                    xAxis: {
                        type: 'category',
                        data: testData.map(d => d.time + ' min'),
                        axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } },
                        axisLabel: { color: 'rgba(255, 255, 255, 0.9)' }
                    },
                    yAxis: {
                        type: 'value',
                        axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } },
                        axisLabel: { color: 'rgba(255, 255, 255, 0.9)' }
                    },
                    series: [{
                        type: 'line',
                        data: testData.map(d => d.advantage),
                        areaStyle: { color: 'rgba(79, 195, 247, 0.3)' },
                        lineStyle: { color: '#4FC3F7' }
                    }]
                });
            }
        });
});