const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        if (type === 'whistle') {
            osc.frequency.setValueAtTime(800, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            osc.start(); osc.stop(audioCtx.currentTime + 0.3);
        } else if (type === 'goal') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.5);
            gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
            osc.start(); osc.stop(audioCtx.currentTime + 0.5);
        }
    } catch(e) {}
}

const NATIONALITIES = [
    { country: 'Россия', flag: '🇷🇺', names: ['Иванов', 'Смирнов', 'Кузнецов', 'Попов'] },
    { country: 'Германия', flag: '🇩🇪', names: ['Шмидт', 'Мюллер', 'Шнайдер', 'Вебер'] },
    { country: 'Португалия', flag: '🇵🇹', names: ['Силва', 'Фернандеш', 'Кошта', 'Невеш'] },
    { country: 'Испания', flag: '🇪🇸', names: ['Гарсия', 'Торрес', 'Лопес', 'Мартинес'] },
    { country: 'Бразилия', flag: '🇧🇷', names: ['Силва', 'Сантос', 'Оливейра', 'Лима'] }
];

const POSITIONS = ['GK', 'CB', 'LB', 'RB', 'CM', 'LM', 'RM', 'CAM', 'ST'];

let gameState = {
    coins: 1000, gram: 0, energy: 25, level: 1, division: 3, tour: 1, formation: '4-3-3',
    dailySilverPacks: 5, dailyGoldPacks: 2, lastResetDate: new Date().toDateString(),
    mainSquad: [], reserve: [], market: [], leagueTable: []
};

let selectedPlayerId = null;

function saveGame() { localStorage.setItem('myFootballLeague_v3', JSON.stringify(gameState)); }

function loadGame() {
    const saved = localStorage.getItem('myFootballLeague_v3');
    if (saved) {
        try {
            gameState = JSON.parse(saved);
            if (gameState.lastResetDate !== new Date().toDateString()) {
                gameState.dailySilverPacks = 5; gameState.dailyGoldPacks = 2;
                gameState.lastResetDate = new Date().toDateString();
            }
        } catch(e) { initStarterSquad(); initLeagueTable(); }
    } else { initStarterSquad(); initLeagueTable(); }
}

function resetProgress() {
    if (confirm('Сбросить весь прогресс?')) {
        localStorage.removeItem('myFootballLeague_v3');
        initStarterSquad(); initLeagueTable(); saveGame(); updateUI();
    }
}

function generatePlayer(minRating = 55, maxRating = 69, specificPos = null) {
    const nat = NATIONALITIES[Math.floor(Math.random() * NATIONALITIES.length)];
    const name = nat.names[Math.floor(Math.random() * nat.names.length)];
    const pos = specificPos || POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
    const baseRating = Math.floor(Math.random() * (maxRating - minRating + 1)) + minRating;
    
    let tier = 'bronze';
    if (baseRating >= 90) tier = 'legendary';
    else if (baseRating >= 80) tier = 'gold';
    else if (baseRating >= 70) tier = 'silver';

    return {
        id: 'p_' + Math.random().toString(36).substr(2, 9),
        name, country: nat.country, flag: nat.flag, position: pos,
        baseRating, stars: 0, tier, injury: 0, stamina: 100
    };
}

function getPlayerRating(player) { return player.baseRating + player.stars; }

function initStarterSquad() {
    gameState.mainSquad = [
        generatePlayer(60, 68, 'GK'), generatePlayer(58, 65, 'LB'), generatePlayer(58, 65, 'CB'),
        generatePlayer(58, 65, 'CB'), generatePlayer(58, 65, 'RB'), generatePlayer(58, 65, 'CM'),
        generatePlayer(58, 65, 'CM'), generatePlayer(58, 65, 'CAM'), generatePlayer(58, 65, 'LM'),
        generatePlayer(58, 65, 'ST'), generatePlayer(58, 65, 'RM')
    ];
    gameState.reserve = [generatePlayer(55, 62, 'GK'), generatePlayer(55, 62, 'CM'), generatePlayer(55, 62, 'ST')];
}

function initLeagueTable() {
    const botTeams = ['Заря', 'Мюнхен', 'Реал', 'Наполи', 'Лион', 'Порту', 'Аякс', 'Милан', 'Челси', 'Севилья'];
    gameState.leagueTable = [{ name: 'Вы (Ваш Клуб)', w: 0, d: 0, l: 0, pts: 0, isUser: true }];
    botTeams.forEach(t => gameState.leagueTable.push({ name: 'ФК ' + t, w: 0, d: 0, l: 0, pts: 0, isUser: false }));
}

function getTeamPower() {
    if (!gameState.mainSquad.length) return 0;
    const sum = gameState.mainSquad.reduce((acc, p) => acc + getPlayerRating(p), 0);
    return Math.round(sum / gameState.mainSquad.length);
}

function updateUI() {
    document.getElementById('coins').innerText = gameState.coins;
    document.getElementById('gram').innerText = gameState.gram;
    document.getElementById('energy').innerText = gameState.energy;
    document.getElementById('level').innerText = gameState.level;
    document.getElementById('league-div').innerText = gameState.division;
    document.getElementById('current-tour').innerText = gameState.tour;
    document.getElementById('silver-limit').innerText = gameState.dailySilverPacks;
    document.getElementById('gold-limit').innerText = gameState.dailyGoldPacks;

    renderPitch(); renderSquadLists(); renderLeagueTable(); renderMarket();
}

function renderPitch() {
    const pitch = document.getElementById('pitch');
    if (!pitch) return;
    pitch.querySelectorAll('.player-position').forEach(c => c.remove());
    document.getElementById('team-power').innerText = getTeamPower();

    const layout = getFormationCoordinates(gameState.formation);
    
    gameState.mainSquad.forEach((player, index) => {
        if (index < 11) {
            const pos = layout[index] || { top: 50, left: 50 };
            const el = document.createElement('div');
            el.className = 'player-position';
            el.style.top = (pos.top * 0.45 + 50) + '%';
            el.style.left = pos.left + '%';
            el.id = 'card_' + player.id;
            el.innerHTML = renderCardHTML(player);
            pitch.appendChild(el);
        }
    });

    for (let i = 0; i < 11; i++) {
        const pos = layout[i] || { top: 50, left: 50 };
        const el = document.createElement('div');
        el.className = 'player-position';
        el.style.top = ((100 - pos.top) * 0.45) + '%';
        el.style.left = (100 - pos.left) + '%';
        el.innerHTML = `<div class="card opponent"><div class="card-rating">?</div><div>⚽ Соперник</div></div>`;
        pitch.appendChild(el);
    }
}

function getFormationCoordinates(fmt) {
    return [
        {top: 88, left: 50}, {top: 70, left: 15}, {top: 72, left: 38}, {top: 72, left: 62}, {top: 70, left: 85},
        {top: 45, left: 25}, {top: 48, left: 50}, {top: 45, left: 75}, {top: 20, left: 20}, {top: 15, left: 50}, {top: 20, left: 80}
    ];
}

function renderCardHTML(player) {
    const stars = '★'.repeat(player.stars);
    const isSelected = selectedPlayerId === player.id;
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(player.id)}`;
    const status = player.injury > 0 ? `🏥${player.injury}` : '';

    return `
        <div class="card tier-${player.tier} ${isSelected ? 'selected' : ''}" onclick="handlePlayerClick('${player.id}')">
            <div class="card-rating">${getPlayerRating(player)}</div>
            <div class="card-status">${status}</div>
            <img src="${avatarUrl}" class="card-avatar" />
            <div><b>${player.name}</b></div>
            <div class="card-pos">${player.position}</div>
            <div class="card-stars">${stars}</div>
        </div>
    `;
}

function handlePlayerClick(id) {
    if (!selectedPlayerId) selectedPlayerId = id;
    else if (selectedPlayerId === id) selectedPlayerId = null;
    else { swapPlayers(selectedPlayerId, id); selectedPlayerId = null; }
    updateUI();
}

function swapPlayers(id1, id2) {
    let loc1 = findPlayerLoc(id1), loc2 = findPlayerLoc(id2);
    if (loc1 && loc2) {
        let temp = loc1.arr[loc1.idx];
        loc1.arr[loc1.idx] = loc2.arr[loc2.idx];
        loc2.arr[loc2.idx] = temp;
        saveGame();
    }
}

function findPlayerLoc(id) {
    let idx = gameState.mainSquad.findIndex(p => p.id === id);
    if (idx !== -1) return { arr: gameState.mainSquad, idx };
    idx = gameState.reserve.findIndex(p => p.id === id);
    if (idx !== -1) return { arr: gameState.reserve, idx };
    return null;
}

function autoArrangeByPosition() {
    const posOrder = { 'GK': 1, 'LB': 2, 'CB': 3, 'RB': 4, 'LM': 5, 'CM': 6, 'RM': 7, 'CAM': 8, 'ST': 9 };
    gameState.mainSquad.sort((a, b) => (posOrder[a.position] || 10) - (posOrder[b.position] || 10));
    saveGame(); updateUI();
}

function healAllPlayers() {
    if (gameState.coins < 100) { alert('Недостаточно монет!'); return; }
    gameState.coins -= 100;
    gameState.mainSquad.forEach(p => p.injury = 0);
    gameState.reserve.forEach(p => p.injury = 0);
    saveGame(); updateUI();
}

function renderSquadLists() {
    const mainContainer = document.getElementById('main-squad-list');
    const reserveContainer = document.getElementById('reserve-list');
    if (!mainContainer || !reserveContainer) return;
    mainContainer.innerHTML = ''; reserveContainer.innerHTML = '';

    gameState.mainSquad.forEach((p) => { mainContainer.innerHTML += renderCardHTML(p); });
    gameState.reserve.forEach((p) => { reserveContainer.innerHTML += renderCardHTML(p); });
}

async function playMatch() {
    if (gameState.energy < 1) { alert('Нет энергии ⚡!'); return; }
    if (gameState.mainSquad.some(p => p.injury > 0)) { alert('В составе есть травмированные!'); return; }

    gameState.energy -= 1;
    document.getElementById('play-btn').disabled = true;
    playSound('whistle');

    const log = document.getElementById('match-log');
    log.innerHTML = '<b>1-й Тайм начался!</b><br>';

    let userGoals = 0, oppGoals = 0;
    const userPower = getTeamPower();
    const opponentPower = 60 + (gameState.division * 3);

    for (let i = 0; i < 2; i++) {
        await new Promise(r => setTimeout(r, 2000));
        if (Math.random() * (userPower + opponentPower) < userPower) {
            userGoals++;
            const scorer = gameState.mainSquad[Math.floor(Math.random() * gameState.mainSquad.length)];
            log.innerHTML += `23' ⚽ <b>ГОЛ!</b> ${scorer.flag} ${scorer.name}! (${userGoals}:${oppGoals})<br>`;
            highlightCard(scorer.id, 'highlight-goal'); playSound('goal');
        } else {
            oppGoals++;
            log.innerHTML += `38' ⚽ <b>ГОЛ Соперника!</b> (${userGoals}:${oppGoals})<br>`;
        }
    }

    document.getElementById('halftime-score').innerText = `${userGoals} - ${oppGoals}`;
    document.getElementById('halftime-banner').style.display = 'block';
    log.innerHTML += `<br><b>--- ПЕРЕРЫВ ---</b><br>`;
    await new Promise(r => setTimeout(r, 1800));
    document.getElementById('halftime-banner').style.display = 'none';

    log.innerHTML += `<b>2-й Тайм начался!</b><br>`;
    for (let i = 0; i < 2; i++) {
        await new Promise(r => setTimeout(r, 2000));
        if (Math.random() > 0.5) {
            if (Math.random() * (userPower + opponentPower) < userPower) {
                userGoals++;
                const scorer = gameState.mainSquad[Math.floor(Math.random() * gameState.mainSquad.length)];
                log.innerHTML += `67' ⚽ <b>ГОЛ!</b> ${scorer.flag} ${scorer.name}! (${userGoals}:${oppGoals})<br>`;
                highlightCard(scorer.id, 'highlight-goal'); playSound('goal');
            } else {
                oppGoals++;
                log.innerHTML += `81' ⚽ <b>ГОЛ Соперника!</b> (${userGoals}:${oppGoals})<br>`;
            }
        } else {
            log.innerHTML += `75' 🟨 Желтая карточка.<br>`;
        }
    }

    playSound('whistle');
    let userTeam = gameState.leagueTable.find(t => t.isUser);
    if (userGoals > oppGoals) {
        log.innerHTML += `<br><b>ПОБЕДА ${userGoals}:${oppGoals}! +3 очка, +30 🪙</b>`;
        userTeam.w += 1; userTeam.pts += 3; gameState.coins += 30;
    } else if (userGoals === oppGoals) {
        log.innerHTML += `<br><b>Ничья ${userGoals}:${oppGoals}. +1 очко, +15 🪙</b>`;
        userTeam.d += 1; userTeam.pts += 1; gameState.coins += 15;
    } else {
        log.innerHTML += `<br><b>Поражение ${userGoals}:${oppGoals}. +5 🪙</b>`;
        userTeam.l += 1; gameState.coins += 5;
    }

    gameState.mainSquad.forEach(p => {
        if (p.injury > 0) p.injury--;
        if (Math.random() < 0.06) { p.injury = Math.floor(Math.random() * 4) + 1; alert(`🏥 ${p.name} травмирован на ${p.injury} матчей!`); }
    });

    simulateBotMatches();
    gameState.tour += 1;
    if (gameState.tour > 38) finishSeason();

    document.getElementById('play-btn').disabled = false;
    saveGame(); updateUI();
}

function highlightCard(id, className) {
    const el = document.getElementById('card_' + id);
    if (el) {
        el.classList.add(className);
        setTimeout(() => el.classList.remove(className), 2000);
    }
}

function simulateBotMatches() {
    gameState.leagueTable.forEach(team => {
        if (!team.isUser) {
            const res = Math.random();
            if (res > 0.5) { team.w += 1; team.pts += 3; }
            else if (res > 0.25) { team.d += 1; team.pts += 1; }
            else { team.l += 1; }
        }
    });
    gameState.leagueTable.sort((a, b) => b.pts - a.pts);
}

function renderLeagueTable() {
    const body = document.getElementById('league-table-body');
    if (!body) return; body.innerHTML = '';
    gameState.leagueTable.forEach((team, idx) => {
        let rowClass = (idx < 2) ? 'promo' : (idx >= 8 ? 'relegation' : '');
        body.innerHTML += `<tr class="${rowClass}"><td>${idx + 1}</td><td>${team.isUser ? '<b>' + team.name + '</b>' : team.name}</td><td>${team.w}</td><td>${team.d}</td><td>${team.l}</td><td><b>${team.pts}</b></td></tr>`;
    });
}

function finishSeason() {
    const userIndex = gameState.leagueTable.findIndex(t => t.isUser);
    let rewardPack = null;
    let msg = `Сезон завершен! Место: ${userIndex + 1}.\n`;

    if (userIndex === 0) {
        rewardPack = generatePlayer(80, 95);
        gameState.coins += 500; gameState.gram += 50;
        msg += `🎉 ЧЕМПИОН! Награда: Золотой Пак, 500🪙 и 50💎!`;
    } else if (userIndex === 1) {
        rewardPack = generatePlayer(70, 85);
        gameState.coins += 300; gameState.gram += 25;
        msg += `🥈 2 место! Награда: Серебряный Пак, 300🪙 и 25💎!`;
    } else {
        rewardPack = generatePlayer(55, 75);
        msg += `Награда: Бронзовый Пак.`;
    }

    if (rewardPack) gameState.reserve.push(rewardPack);
    alert(msg);
    gameState.tour = 1; initLeagueTable();
}

function buyPack(type, price) {
    if (type === 'silver' && gameState.dailySilverPacks <= 0) { alert('Лимит исчерпан!'); return; }
    if (type === 'gold' && gameState.dailyGoldPacks <= 0) { alert('Лимит исчерпан!'); return; }
    if (gameState.coins < price) { alert('Недостаточно монет!'); return; }

    gameState.coins -= price;
    if (type === 'silver') gameState.dailySilverPacks--;
    if (type === 'gold') gameState.dailyGoldPacks--;

    let rand = Math.random() * 100;
    let player;
    if (type === 'gold') {
        player = (rand < 3) ? generatePlayer(90, 95) : generatePlayer(78, 88);
    } else if (type === 'silver') {
        player = (rand < 1) ? generatePlayer(90, 94) : (rand < 40 ? generatePlayer(80, 87) : generatePlayer(70, 79));
    } else {
        player = (rand < 0.1) ? generatePlayer(90, 92) : generatePlayer(50, 69);
    }

    gameState.reserve.push(player);
    alert(`🎉 Игрок: ${player.flag} ${player.name} (${player.position}, Рейтинг: ${player.baseRating})!`);
    saveGame(); updateUI();
}

function refreshMarket() {
    if (!gameState.market.length) {
        gameState.market = [generatePlayer(65, 75), generatePlayer(70, 82), generatePlayer(78, 88)];
    }
}

function renderMarket() {
    const marketContainer = document.getElementById('market-list');
    if (!marketContainer) return; marketContainer.innerHTML = '';
    gameState.market.forEach((p, idx) => {
        const price = getPlayerRating(p) * 15;
        marketContainer.innerHTML += renderCardHTML(p) + `<button onclick="buyFromMarket(${idx}, ${price})" style="font-size:9px;">Купить (${price}🪙)</button>`;
    });
}

function buyFromMarket(index, price) {
    if (gameState.coins < price) { alert('Недостаточно монет!'); return; }
    gameState.coins -= price;
    const p = gameState.market.splice(index, 1)[0];
    gameState.reserve.push(p);
    saveGame(); updateUI();
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if (window.event && window.event.target) window.event.target.classList.add('active');
}

loadGame(); refreshMarket(); updateUI();
      
