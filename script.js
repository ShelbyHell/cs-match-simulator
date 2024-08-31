const roleBonuses = {
    'Sniper': 0,
    'Captain': 0,
    'IGL-AWP': 0,
    'Entry-Fragger': 0,
    'Entry-Fragger-2': 0,
    'Lurker': 0,
    'Support Player': 0
};

const mapBonuses = {
    'Mirage': 0,
    'Dust 2': 0,
    'Train': 0,
    'Overpass': 0,
    'Anubis': 0,
    'Nuke': 0,
    'Ancient': 0,
	'Cache': 0,
	'Cobblestone': 0
};

const ratingRanges = {
    13: {
        0: { winner: [7.0, 8.8], loser: [2.2, 3.2] },
        1: { winner: [6.5, 8.0], loser: [2.8, 3.9] },
        2: { winner: [6.3, 7.6], loser: [3, 4.25] },
        3: { winner: [6.3, 7.5], loser: [3.15, 4.4] },
        4: { winner: [6.2, 7.2], loser: [3.2, 4.5] },
        5: { winner: [6.1, 7.0], loser: [3.5, 4.6] },
        6: { winner: [5.9, 6.7], loser: [3.7, 4.6] },
        7: { winner: [5.7, 6.5], loser: [3.8, 5.0] },
        8: { winner: [5.4, 6], loser: [4, 5.0] },
        9: { winner: [5.1, 5.8], loser: [4.3, 5.1] },
        10: { winner: [4.95, 5.8], loser: [4.55, 5.3] },
        11: { winner: [4.9, 5.5], loser: [4.7, 5.5] }
    }
};

let watchMatchMode = false;
let commentaryEnabled = false;
let currentRoundIndex = 0;
let currentMapIndex = 0;

const commentaryTemplates = {
    roundStart: [
        "Раунд {roundNumber} начинается!",
        "Команды готовятся к {roundNumber} раунду.",
        "Посмотрим, что произойдет в {roundNumber} раунде."
    ],
    pistolRound: [
        "Это важный пистолетный раунд!",
        "Пистолетный раунд может определить ход половины матча.",
        "Команды начинают с пистолетов. Кто возьмет раннее преимущество?"
    ],
    closeRound: [
        "{winningTeam} едва выигрывает этот раунд!",
        "Невероятно близкий раунд! {winningTeam} берет верх.",
        "Какая напряженная концовка! {winningTeam} справляется."
    ],
    dominatingRound: [
        "{winningTeam} полностью доминирует в этом раунде!",
        "Впечатляющее выступление от {winningTeam} в этом раунде.",
        "{winningTeam} не оставляет шансов противнику!"
    ],
    comebackPotential: [
        "{losingTeam} нужно что-то менять, иначе матч может быстро закончиться.",
        "Есть ли у {losingTeam} шанс на камбэк?",
        "{losingTeam} в сложной ситуации. Смогут ли они выбраться?"
    ],
    matchPoint: [
        "Это матч-пойнт для {winningTeam}!",
        "{winningTeam} в шаге от победы.",
        "Сможет ли {losingTeam} отыграться или {winningTeam} закончит матч?"
    ],
    overtimeStart: [
        "Мы идем в овертайм! Какая игра!",
        "Ни одна из команд не уступает. Начинается овертайм!",
        "Дополнительные раунды определят победителя этого матча."
    ],
    finalResult: [
        "{winningTeam} побеждает со счетом {score}!",
        "Невероятное зрелище! {winningTeam} выигрывает {score}.",
        "Поздравляем {winningTeam} с победой {score} в этом матче!"
    ]
};

function addSettingsIcon() {
    const settingsIcon = document.createElement('div');
    settingsIcon.innerHTML = '⚙️';
    settingsIcon.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        font-size: 24px;
        cursor: pointer;
        z-index: 1000;
    `;
    document.body.appendChild(settingsIcon);

    const settingsPanel = document.createElement('div');
    settingsPanel.id = 'settings-panel';
    settingsPanel.style.cssText = `
        position: fixed;
        top: 40px;
        left: 10px;
        background-color: #2a475e;
        padding: 10px;
        border-radius: 5px;
        display: none;
        z-index: 1000;
    `;
    settingsPanel.innerHTML = `
        <label>
            <input type="checkbox" id="watch-match-toggle">
            Я предпочитаю посмотреть матч
        </label>
        <label>
            Скорость показа раундов (мс):
            <input type="range" id="round-speed" min="300" max="3000" step="100" value="1500">
            <span id="round-speed-value">1500</span>
        </label>
        <label>
            <input type="checkbox" id="disable-css-toggle">
            Отключить CSS
        </label>
        <label>
            <input type="checkbox" id="enable-commentary">
            Включить комментарии
        </label>
    `;
    document.body.appendChild(settingsPanel);

    settingsIcon.addEventListener('click', () => {
        settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('watch-match-toggle').addEventListener('change', (e) => {
        watchMatchMode = e.target.checked;
    });

    const roundSpeedInput = document.getElementById('round-speed');
    const roundSpeedValue = document.getElementById('round-speed-value');
    roundSpeedInput.addEventListener('input', (e) => {
        roundSpeedValue.textContent = e.target.value;
    });

    document.getElementById('disable-css-toggle').addEventListener('change', toggleCSS);
    
    document.getElementById('enable-commentary').addEventListener('change', (e) => {
        commentaryEnabled = e.target.checked;
    });
}

function generateCommentary(type, data) {
    if (!commentaryEnabled) return '';
    const templates = commentaryTemplates[type];
    if (!templates) return '';
    const template = templates[Math.floor(Math.random() * templates.length)];
    return template.replace(/\{(\w+)\}/g, (_, key) => data[key] || '');
}

function addCommentaryToRound(round, team1Name, team2Name, currentScore) {
    if (!commentaryEnabled) return '';
    let commentary = '';
    commentary += generateCommentary('roundStart', { roundNumber: round.roundNumber }) + ' ';
    
    if (round.roundNumber === 1 || round.roundNumber === 13) {
        commentary += generateCommentary('pistolRound', {}) + ' ';
    }
    
    if (round.isClose) {
        commentary += generateCommentary('closeRound', { winningTeam: round.winner }) + ' ';
    } else if (round.isDominating) {
        commentary += generateCommentary('dominatingRound', { winningTeam: round.winner }) + ' ';
    } else {
        commentary += `${round.winner} выигрывает этот раунд. `;
    }
    
    const [team1Score, team2Score] = currentScore;
    const scoreDifference = Math.abs(team1Score - team2Score);
    
    if (scoreDifference >= 5) {
        const losingTeam = team1Score < team2Score ? team1Name : team2Name;
        commentary += generateCommentary('comebackPotential', { losingTeam }) + ' ';
    }
    
    if (team1Score === 15 || team2Score === 15) {
        const winningTeam = team1Score === 15 ? team1Name : team2Name;
        const losingTeam = team1Score === 15 ? team2Name : team1Name;
        commentary += generateCommentary('matchPoint', { winningTeam, losingTeam }) + ' ';
    }
    
    if (round.isOvertimeStart) {
        commentary += generateCommentary('overtimeStart', {}) + ' ';
    }
    
    commentary += `Текущий счёт: ${team1Name} ${team1Score} - ${team2Score} ${team2Name}. `;
    
    return commentary.trim();
}

function generateFinalCommentary(winner, score) {
    if (!commentaryEnabled) return '';
    return generateCommentary('finalResult', { winningTeam: winner, score });
}

function toggleCSS(e) {
    const stylesheet = document.getElementById('main-styles');
    if (e.target.checked) {
        stylesheet.disabled = true;
    } else {
        stylesheet.disabled = false;
    }
}

function getPlayerData(containerId) {
    const container = document.getElementById(containerId);
    const inputs = container.querySelectorAll('.player-input');
    return Array.from(inputs).map(input => {
        const nickname = input.querySelector('input[type="text"]').value;
        const rating = parseFloat(input.querySelector('input[type="number"]').value);
        const role = input.querySelector('label').textContent.replace(':', '');
        return { nickname, rating, role };
    });
}

function calculateTotalScore(mapScores) {
    return mapScores.reduce((total, score) => [total[0] + score[0], total[1] + score[1]], [0, 0]);
}

function simulateMatch() {
    currentRoundIndex = 0;
    currentMapIndex = 0;

    const seriesType = document.getElementById('series-type').value;
    const mapSelectMode = document.getElementById('map-select-mode').value;
    const team1Name = document.getElementById('team1-name').value;
    const team2Name = document.getElementById('team2-name').value;

    let mapsToPlay;
    if (seriesType === 'BO1') {
        mapsToPlay = 1;
    } else if (seriesType === 'BO3') {
        mapsToPlay = 3;
    } else {
        mapsToPlay = 5;
    }

    let maps;
    if (mapSelectMode === 'manual') {
        maps = Array.from(document.querySelectorAll('.map-select')).map(select => select.value);
    } else {
        const allMaps = Object.keys(mapBonuses);
        maps = [];
        while (maps.length < mapsToPlay) {
            const randomMap = allMaps[Math.floor(Math.random() * allMaps.length)];
            if (!maps.includes(randomMap)) {
                maps.push(randomMap);
            }
        }
    }

    let team1Score = 0;
    let team2Score = 0;
    let allRounds = [];
    let allPlayerStats = [];
    let mapScores = [];
    let allCommentaries = [];

    for (let i = 0; i < mapsToPlay; i++) {
        const map = maps[i];
        const { rounds, team1MapScore, team2MapScore, playerStats, commentary } = simulateSingleMap(team1Name, team2Name, map);
        
        mapScores.push([team1MapScore, team2MapScore]);

        if (team1MapScore > team2MapScore) {
            team1Score++;
        } else {
            team2Score++;
        }

        allRounds.push({ map, rounds, team1MapScore, team2MapScore });
        allPlayerStats.push(playerStats);
        allCommentaries.push(commentary);

        if ((seriesType === 'BO3' && (team1Score === 2 || team2Score === 2)) ||
            (seriesType === 'BO5' && (team1Score === 3 || team2Score === 3))) {
            break;
        }
    }

    const [totalTeam1Score, totalTeam2Score] = calculateTotalScore(mapScores);
    const winner = team1Score > team2Score ? team1Name : team2Name;
    const loser = team1Score > team2Score ? team2Name : team1Name;
    let winnerScore, loserScore;

    if (seriesType === 'BO1') {
        winnerScore = team1Score > team2Score ? totalTeam1Score : totalTeam2Score;
        loserScore = team1Score > team2Score ? totalTeam2Score : totalTeam1Score;
    } else {
        winnerScore = Math.max(team1Score, team2Score);
        loserScore = Math.min(team1Score, team2Score);
    }

    if (watchMatchMode) {
        displayResultSlowly(allRounds, allPlayerStats, winner, loser, winnerScore, loserScore, team1Name, team2Name, maps, seriesType, mapScores, allCommentaries);
    } else {
        displayResult(`<h2>${winner} wins ${winnerScore}-${loserScore}</h2>`);
        displayRounds(allRounds);
        const averagePlayerStats = calculateAveragePlayerStats(allPlayerStats);
        displayPlayerStats(averagePlayerStats.team1, averagePlayerStats.team2, team1Name, team2Name);
        displayMapStats(allPlayerStats, team1Name, team2Name, maps);
        generateResultImage(winner, loser, winnerScore, loserScore, averagePlayerStats.team1, averagePlayerStats.team2, maps, seriesType, mapScores);
    }
}

function simulateSingleMap(team1Name, team2Name, map) {
    const mapBonus = mapBonuses[map];

    let team1Players = getPlayerData('team1-players');
    let team2Players = getPlayerData('team2-players');

    function applyMapBonus(players, bonus) {
        players.forEach(player => {
            player.adjustedRating = player.rating * 2.6 + bonus;
            if (roleBonuses[player.role] !== undefined) {
                player.adjustedRating += roleBonuses[player.role];
            }
            if (player.role === 'Captain' || player.role === 'IGL-AWP') {
                player.adjustedRating *= 0.98;
            }
        });
    }

    function calculateTotalRating(players) {
        return players.reduce((sum, player) => sum + player.adjustedRating, 0);
    }

    let team1Score = 0;
    let team2Score = 0;
    let rounds = [];
    let roundNumber = 1;
    let firstRoundWinner = null;
    let thirteenthRoundWinner = null;
    const pistolRoundBonus = 1.1;

    function simulateRound(isOvertime = false, overtimePhase = 0) {
        if (roundNumber <= 12 || (isOvertime && overtimePhase % 2 === 0)) {
            applyMapBonus(team1Players, mapBonus);
            applyMapBonus(team2Players, 0);
        } else {
            applyMapBonus(team1Players, 0);
            applyMapBonus(team2Players, mapBonus);
        }

        let team1TotalRating = calculateTotalRating(team1Players);
        let team2TotalRating = calculateTotalRating(team2Players);

        let team1AdjustedRating = Math.pow(team1TotalRating, 2);
        let team2AdjustedRating = Math.pow(team2TotalRating, 2);
        
        const isPistolRound = roundNumber === 1 || roundNumber === 13;
        const isPostPistolRound = roundNumber === 2 || roundNumber === 14;

        if (isPistolRound) {
            if (team1TotalRating > team2TotalRating) {
                team1AdjustedRating *= 2;
            } else {
                team2AdjustedRating *= 2;
            }
        }

        if (isPostPistolRound) {
            if ((roundNumber === 2 && firstRoundWinner === 1) || (roundNumber === 14 && thirteenthRoundWinner === 1)) {
                team1AdjustedRating *= 3;
            } else if ((roundNumber === 2 && firstRoundWinner === 2) || (roundNumber === 14 && thirteenthRoundWinner === 2)) {
                team2AdjustedRating *= 3;
            }
        }

        if (roundNumber <= 12 && firstRoundWinner) {
            if (firstRoundWinner === 1) {
                team1AdjustedRating *= pistolRoundBonus;
            } else {
                team2AdjustedRating *= pistolRoundBonus;
            }
        }

        if (roundNumber > 12 && roundNumber <= 24 && thirteenthRoundWinner) {
            if (thirteenthRoundWinner === 1) {
                team1AdjustedRating *= pistolRoundBonus;
            } else {
                team2AdjustedRating *= pistolRoundBonus;
            }
        }

        const totalRating = team1AdjustedRating + team2AdjustedRating;
        const team1Probability = team1AdjustedRating / totalRating;
        const roundWinner = Math.random() < team1Probability ? 1 : 2;
    const winningTeam = roundWinner === 1 ? team1Name : team2Name;

    if (roundWinner === 1) {
        team1Score++;
    } else {
        team2Score++;
    }

        if (roundNumber === 1) {
            firstRoundWinner = roundWinner;
        }

        if (roundNumber === 13) {
            thirteenthRoundWinner = roundWinner;
        }

        const isClose = Math.abs(team1AdjustedRating - team2AdjustedRating) / Math.max(team1AdjustedRating, team2AdjustedRating) < 0.1;
        const isDominating = Math.abs(team1AdjustedRating - team2AdjustedRating) / Math.max(team1AdjustedRating, team2AdjustedRating) > 0.3;

        let roundDescription = `Round ${roundNumber}: ${roundWinner === 1 ? team1Name : team2Name} wins (${team1Score}-${team2Score})`;
        if (!isOvertime) {
            if (isPistolRound) {
                roundDescription = `[PISTOL] ${roundDescription}`;
            } else if (isPostPistolRound) {
                roundDescription = `[POST-PISTOL] ${roundDescription}`;
            }
        }
        
        const roundData = {
        roundNumber,
        winner: winningTeam,
        isClose,
        isDominating,
        isOvertimeStart: isOvertime && overtimePhase === 0
    };
    
    const roundCommentary = addCommentaryToRound(roundData, team1Name, team2Name, [team1Score, team2Score]);
    
    rounds.push({ description: roundDescription, commentary: roundCommentary });
    roundNumber++;
}

    while ((team1Score < 13 && team2Score < 13) && roundNumber <= 24) {
        simulateRound();
    }

    if (team1Score === 12 && team2Score === 12) {
        rounds.push({ description: "First Overtime (MR3)", commentary: generateCommentary('overtimeStart', {}) });

        function simulateOvertime(maxRounds, scoreToReach) {
            let overtimePhase = 0;
            for (let i = 0; i < maxRounds; i++) {
                simulateRound(true, overtimePhase);
                overtimePhase++;
                if (Math.max(team1Score, team2Score) >= scoreToReach) {
                    return true;
                }
            }
            return false;
        }

        if (!simulateOvertime(6, 16)) {
            rounds.push({ description: "Second Overtime (MR2)", commentary: generateCommentary('overtimeStart', {}) });
            if (!simulateOvertime(4, 18)) {
                let overtimeRound = 3;
                while (true) {
                    rounds.push({ description: `Overtime ${overtimeRound} (MR1)`, commentary: generateCommentary('overtimeStart', {}) });
                    let startScore = [team1Score, team2Score];
                    simulateRound(true, 0);
                    simulateRound(true, 1);
                    if (Math.abs(team1Score - startScore[0]) === 2 || Math.abs(team2Score - startScore[1]) === 2) {
                        break;
                    }
                    overtimeRound++;
                }
            }
        }
    }

    const winner = team1Score > team2Score ? team1Name : team2Name;
    const loser = team1Score > team2Score ? team2Name : team1Name;
    const winnerScore = Math.max(team1Score, team2Score);
    const loserScore = Math.min(team1Score, team2Score);

    const ratingKey = team1Score >= 16 || team2Score >= 16 ? 11 : Math.min(loserScore, 11);
    const winnerRatingRange = ratingRanges[13][ratingKey].winner;
    const loserRatingRange = ratingRanges[13][ratingKey].loser;

    const winningTeamPlayers = team1Score > team2Score ? team1Players : team2Players;
    const losingTeamPlayers = team1Score > team2Score ? team2Players : team1Players;

    const winningTeamRatings = distributeRatings(winningTeamPlayers, winnerRatingRange);
    const losingTeamRatings = distributeRatings(losingTeamPlayers, loserRatingRange);

    const finalCommentary = generateFinalCommentary(winner, `${winnerScore}-${loserScore}`);

    return {
        rounds,
        team1MapScore: team1Score,
        team2MapScore: team2Score,
        playerStats: {
            team1: team1Score > team2Score ? winningTeamRatings : losingTeamRatings,
            team2: team2Score > team1Score ? winningTeamRatings : losingTeamRatings
        },
        commentary: finalCommentary
    };
}

function distributeRatings(players, ratingRange) {
    const totalTeamRating = players.reduce((sum, player) => sum + player.adjustedRating, 0);
    const overallRating = ratingRange[0] + (ratingRange[1] - ratingRange[0]) * Math.random();

    return players.map(player => {
        const playerWeight = player.adjustedRating / totalTeamRating;
        const baseRating = overallRating * playerWeight;
        const randomFactor = (Math.random() * 0.15 - 0.075) * 1.77;
        let adjustedRating = baseRating + (baseRating * randomFactor);
        return {
            ...player,
            matchRating: Math.max(0.19, Math.min(2.56, adjustedRating))
        };
    }).sort((a, b) => b.matchRating - a.matchRating);
}

function displayResult(result) {
    document.getElementById('result').innerHTML = result;
}

function displayRounds(allRounds) {
    const roundsContainer = document.getElementById('rounds');
    const commentaryContainer = document.getElementById('commentary-container');
    roundsContainer.innerHTML = '';
    commentaryContainer.innerHTML = '';
    
    allRounds.forEach((mapResult, index) => {
        roundsContainer.innerHTML += `<h3>Map ${index + 1}: ${mapResult.map}</h3>`;
        roundsContainer.innerHTML += `<p>Final Score: ${mapResult.team1MapScore} - ${mapResult.team2MapScore}</p>`;
        mapResult.rounds.forEach((round) => {
            const roundDiv = document.createElement('div');
            roundDiv.className = round.description.includes('Overtime') ? 'round overtime-start' : 'round';
            roundDiv.textContent = round.description;
            roundsContainer.appendChild(roundDiv);
            
            if (commentaryEnabled && round.commentary) {
                const commentaryDiv = document.createElement('div');
                commentaryDiv.className = 'commentary';
                commentaryDiv.textContent = round.commentary;
                commentaryContainer.appendChild(commentaryDiv);
            }
        });
    });
}

function calculateAveragePlayerStats(allPlayerStats) {
    const averageStats = { team1: [], team2: [] };

    ['team1', 'team2'].forEach(team => {
        const players = allPlayerStats[0][team].map(player => player.nickname);
        players.forEach(playerName => {
            const playerStats = allPlayerStats.map(mapStats => 
                mapStats[team].find(p => p.nickname === playerName)
            );
            const averageRating = playerStats.reduce((sum, stat) => sum + stat.matchRating, 0) / playerStats.length;
            averageStats[team].push({
                nickname: playerName,
                matchRating: averageRating
            });
        });
        averageStats[team].sort((a, b) => b.matchRating - a.matchRating);
    });

    return averageStats;
}

function displayPlayerStats(team1Players, team2Players, team1Name, team2Name) {
    const playerStats = document.getElementById('player-stats');
    let statsHtml = '<div class="stats-container">';

    [
        { name: team1Name, players: team1Players },
        { name: team2Name, players: team2Players }
    ].forEach(team => {
        statsHtml += `
            <div class="team-stats">
                <h3>${team.name} Player Stats</h3>
                ${team.players.map(player => `
                    <div class="player-stat">
                        <span>${player.nickname}</span>
                        <span>${player.matchRating.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    });

    statsHtml += '</div>';
    playerStats.innerHTML = statsHtml;
}

function displayMapStats(allPlayerStats, team1Name, team2Name, maps) {
    const mapStatsContainer = document.getElementById('map-stats');
    let mapStatsHtml = '<h3>Map Statistics</h3>';

    allPlayerStats.forEach((mapStats, index) => {
        mapStatsHtml += `<h4>Map ${index + 1}: ${maps[index]}</h4>`;
        mapStatsHtml += '<div class="stats-container">';
        [
            { name: team1Name, players: mapStats.team1 },
            { name: team2Name, players: mapStats.team2 }
        ].forEach(team => {
            mapStatsHtml += `
                <div class="team-stats">
                    <h5>${team.name}</h5>
                    ${team.players.map(player => `
                        <div class="player-stat">
                            <span>${player.nickname}</span>
                            <span>${player.matchRating.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        });
        mapStatsHtml += '</div>';
    });

    mapStatsContainer.innerHTML = mapStatsHtml;
}

function generateResultImage(winner, loser, winnerScore, loserScore, team1Players, team2Players, maps, seriesType, mapScores) {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 450;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#003300';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#006600';
    ctx.lineWidth = 2;
    const startY = 80;
    const lineHeight = 60;
    for (let i = 0; i < 5; i++) {
        const y = startY + i * lineHeight;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 24px "San Francisco"';
    ctx.textAlign = 'center';

    const team1Name = document.getElementById('team1-name').value;
    const team2Name = document.getElementById('team2-name').value;

    if (seriesType === 'BO1') {
        ctx.fillText(`${team1Name.toUpperCase()} (${team1Name === winner ? winnerScore : loserScore})`, canvas.width / 4, 40);
        ctx.fillText(`${team2Name.toUpperCase()} (${team2Name === winner ? winnerScore : loserScore})`, 3 * canvas.width / 4, 40);
    } else {
        const team1Wins = mapScores.filter(score => score[0] > score[1]).length;
        const team2Wins = mapScores.filter(score => score[1] > score[0]).length;
        ctx.fillText(`${team1Name.toUpperCase()} (${team1Wins})`, canvas.width / 4, 40);
        ctx.fillText(`${team2Name.toUpperCase()} (${team2Wins})`, 3 * canvas.width / 4, 40);
    }

    ctx.font = '18px "San Francisco"';
    const statsDistanceFromCenter = 300;
    const verticalOffset = -37;

    function drawTeamStats(players, startX, isLeftTeam) {
        players.forEach((player, index) => {
            const y = startY + index * lineHeight + lineHeight / 2 + verticalOffset;
            ctx.fillStyle = '#00FF00';
            ctx.textAlign = isLeftTeam ? 'right' : 'left';
            ctx.fillText(player.nickname, isLeftTeam ? startX - statsDistanceFromCenter : startX + statsDistanceFromCenter, y);
            ctx.fillStyle = '#00FF00';
            ctx.textAlign = isLeftTeam ? 'left' : 'right';
            ctx.fillText(player.matchRating.toFixed(2), isLeftTeam ? startX - statsDistanceFromCenter + 40 : startX + statsDistanceFromCenter - 40, y);
        });
    }

    drawTeamStats(team1Players, canvas.width / 2, true);
    drawTeamStats(team2Players, canvas.width / 2, false);

    const allPlayers = [...team1Players, ...team2Players];
    const mvp = allPlayers.reduce((max, player) => max.matchRating > player.matchRating ? max : player);

    ctx.fillStyle = '#00FF00';
    ctx.font = '20px "San Francisco"';
    ctx.textAlign = 'center';

    let mapScoresText = mapScores.map((score, index) => {
        const team1Score = score[0];
        const team2Score = score[1];
        return `${maps[index]}: ${team1Score}-${team2Score}`;
    }).join(', ');

    ctx.fillText(`Series: ${seriesType}`, canvas.width / 2, canvas.height - 90);
    ctx.fillText(`Maps: ${mapScoresText}`, canvas.width / 2, canvas.height - 60);
    ctx.fillText(`MVP: ${mvp.nickname} (${mvp.matchRating.toFixed(2)})`, canvas.width / 2, canvas.height - 30);

    const dataUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    downloadLink.download = `${winner}-${loser}_${winnerScore}-${loserScore}_${seriesType}.png`;
    downloadLink.textContent = 'Download Match Result Image';
    downloadLink.className = 'download-button';

    const resultContainer = document.getElementById('result');
    resultContainer.appendChild(downloadLink);
}

function swapTeams() {
    const team1Name = document.getElementById('team1-name');
    const team2Name = document.getElementById('team2-name');
    [team1Name.value, team2Name.value] = [team2Name.value, team1Name.value];

    const team1Players = document.getElementById('team1-players');
    const team2Players = document.getElementById('team2-players');
    const team1Inputs = team1Players.querySelectorAll('.player-input');
    const team2Inputs = team2Players.querySelectorAll('.player-input');

    team1Inputs.forEach((input, index) => {
        const team1Nickname = input.querySelector('input[type="text"]').value;
        const team1Rating = input.querySelector('input[type="number"]').value;
        const team2Nickname = team2Inputs[index].querySelector('input[type="text"]').value;
        const team2Rating = team2Inputs[index].querySelector('input[type="number"]').value;

        input.querySelector('input[type="text"]').value = team2Nickname;
        input.querySelector('input[type="number"]').value = team2Rating;
        team2Inputs[index].querySelector('input[type="text"]').value = team1Nickname;
        team2Inputs[index].querySelector('input[type="number"]').value = team1Rating;
    });
}

function exportTeam(team) {
    const teamName = document.getElementById(`team${team}-name`).value;
    const lineupType = document.getElementById(`lineup-select-team${team}`).value;
    const players = getPlayerData(`team${team}-players`);
    const data = { teamName, lineupType, players };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${teamName}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importTeam(event, team) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = JSON.parse(e.target.result);
        document.getElementById(`team${team}-name`).value = data.teamName;
        
        if (data.lineupType) {
            document.getElementById(`lineup-select-team${team}`).value = data.lineupType;
            updateRoles(`team${team}`);
        }
        
        const playerInputs = document.querySelectorAll(`#team${team}-players .player-input`);
        data.players.forEach((player, index) => {
            playerInputs[index].querySelector('input[type="text"]').value = player.nickname;
            playerInputs[index].querySelector('input[type="number"]').value = player.rating;
        });
    };
    reader.readAsText(file);
}

function updateRoles(teamId) {
    const lineupType = document.getElementById(`lineup-select-${teamId}`).value;
    const roles = {
        'classic': ['Sniper', 'Captain', 'Entry-Fragger', 'Lurker', 'Support Player'],
        'igl-awp': ['IGL-AWP', 'Entry-Fragger', 'Entry-Fragger-2', 'Lurker', 'Support Player'],
        'no-awp': ['Captain', 'Entry-Fragger', 'Entry-Fragger-2', 'Lurker', 'Support Player']
    };

    const selectedRoles = roles[lineupType];

    const playerInputs = document.querySelectorAll(`#${teamId}-players .player-input`);
    playerInputs.forEach((input, index) => {
        const label = input.querySelector('label');
        label.textContent = `${selectedRoles[index]}:`;
    });
}

function updateMapSelects() {
    const seriesType = document.getElementById('series-type').value;
    const mapSelectMode = document.getElementById('map-select-mode').value;
    const mapSelectsContainer = document.getElementById('map-selects');
    mapSelectsContainer.innerHTML = '';

    if (mapSelectMode === 'manual') {
        const mapsCount = seriesType === 'BO1' ? 1 : seriesType === 'BO3' ? 3 : 5;
        for (let i = 0; i < mapsCount; i++) {
            const select = document.createElement('select');
            select.className = 'map-select';
            Object.keys(mapBonuses).forEach(map => {
                const option = document.createElement('option');
                option.value = map;
                option.textContent = map;
                select.appendChild(option);
            });
            mapSelectsContainer.appendChild(select);
        }
    }
}

function displayResultSlowly(allRounds, allPlayerStats, winner, loser, winnerScore, loserScore, team1Name, team2Name, maps, seriesType, mapScores, allCommentaries) {
    displayResult(`<h2>Match in progress...</h2>`);
    document.getElementById('rounds').innerHTML = '';
    document.getElementById('player-stats').innerHTML = '';
    document.getElementById('map-stats').innerHTML = '';
    
    const commentaryContainer = document.getElementById('commentary-container');
    commentaryContainer.innerHTML = '';

    function displayNextRound() {
        if (!watchMatchMode) {
            finalizeSeries();
            return;
        }

        const roundSpeed = parseInt(document.getElementById('round-speed').value);

        if (currentMapIndex < allRounds.length) {
            const currentMap = allRounds[currentMapIndex];
            if (currentRoundIndex === 0) {
                document.getElementById('rounds').innerHTML += `<h3>Map ${currentMapIndex + 1}: ${currentMap.map}</h3>`;
            }
            if (currentRoundIndex < currentMap.rounds.length) {
                const roundDiv = document.createElement('div');
                roundDiv.className = 'round';
                roundDiv.textContent = currentMap.rounds[currentRoundIndex].description;
                document.getElementById('rounds').appendChild(roundDiv);
                
                if (commentaryEnabled) {
                    const commentaryDiv = document.createElement('div');
                    commentaryDiv.className = 'commentary';
                    commentaryDiv.textContent = currentMap.rounds[currentRoundIndex].commentary;
                    commentaryContainer.appendChild(commentaryDiv);
                }
                
                currentRoundIndex++;
                setTimeout(displayNextRound, roundSpeed);
            } else {
                const mapResultDiv = document.createElement('div');
                mapResultDiv.className = 'map-result';
                mapResultDiv.textContent = `Final Score: ${currentMap.team1MapScore} - ${currentMap.team2MapScore}`;
                document.getElementById('rounds').appendChild(mapResultDiv);

                displayMapStats([allPlayerStats[currentMapIndex]], team1Name, team2Name, [maps[currentMapIndex]]);

                currentRoundIndex = 0;
                currentMapIndex++;

                let currentScore;
                if (seriesType === 'BO1') {
                    const [currentTeam1Score, currentTeam2Score] = calculateTotalScore(mapScores.slice(0, currentMapIndex));
                    currentScore = `${team1Name} ${currentTeam1Score} - ${currentTeam2Score} ${team2Name}`;
                } else {
                    const team1Wins = mapScores.slice(0, currentMapIndex).filter(score => score[0] > score[1]).length;
                    const team2Wins = mapScores.slice(0, currentMapIndex).filter(score => score[1] > score[0]).length;
                    currentScore = `${team1Name} ${team1Wins} - ${team2Wins} ${team2Name}`;
                }
                displayResult(`<h2>Current Score: ${currentScore}</h2>`);

                const requiredWins = seriesType === 'BO1' ? 1 : seriesType === 'BO3' ? 2 : 3;
                if (currentMapIndex < allRounds.length && mapScores.slice(0, currentMapIndex).filter(score => score[0] > score[1]).length < requiredWins && 
                    mapScores.slice(0, currentMapIndex).filter(score => score[1] > score[0]).length < requiredWins) {
                    setTimeout(displayNextRound, roundSpeed);
                } else {
                    finalizeSeries();
                }
            }
        } else {
            finalizeSeries();
        }
    }

    function finalizeSeries() {
        displayResult(`<h2>${winner} wins ${winnerScore}-${loserScore}</h2>`);
        const averagePlayerStats = calculateAveragePlayerStats(allPlayerStats);
        displayPlayerStats(averagePlayerStats.team1, averagePlayerStats.team2, team1Name, team2Name);
        displayMapStats(allPlayerStats, team1Name, team2Name, maps);
        generateResultImage(winner, loser, winnerScore, loserScore, averagePlayerStats.team1, averagePlayerStats.team2, maps, seriesType, mapScores);
    }

    displayNextRound();
}

document.addEventListener('DOMContentLoaded', function() {
    addSettingsIcon();
    document.getElementById('simulate').addEventListener('click', simulateMatch);
    document.getElementById('swap-teams').addEventListener('click', swapTeams);
    document.getElementById('export-team1').addEventListener('click', () => exportTeam(1));
    document.getElementById('export-team2').addEventListener('click', () => exportTeam(2));
    document.getElementById('import-team1').addEventListener('change', (event) => importTeam(event, 1));
    document.getElementById('import-team2').addEventListener('change', (event) => importTeam(event, 2));
    document.getElementById('lineup-select-team1').addEventListener('change', () => updateRoles('team1'));
    document.getElementById('lineup-select-team2').addEventListener('change', () => updateRoles('team2'));
    document.getElementById('series-type').addEventListener('change', updateMapSelects);
    document.getElementById('map-select-mode').addEventListener('change', updateMapSelects);
    document.getElementById('watch-match-toggle').addEventListener('change', (e) => {
        watchMatchMode = e.target.checked;
    });
    updateRoles('team1');
    updateRoles('team2');
    updateMapSelects();
});
