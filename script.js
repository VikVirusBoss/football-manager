// --- ЕДИНАЯ СИСТЕМА СОСТОЯНИЯ ИГРЫ (GameState) ---
let gameState = {
    clubName: "Мой Клуб",
    coins: 1000,
    ton: 0.0,
    energy: 25,
    maxEnergy: 25,
    lastEnergyTime: Date.now(),
    formation: "4-3-3",
    tour: 1,
    maxTours: 18,
    squad: [],
    market: [],
    leagueTable: []
};

const NATIONS = [
    { code: 'RU', flag: '🇷🇺' }, { code: 'BR', flag: '🇧🇷' }, { code: 'AR', flag: '🇦🇷' },
    { code: 'FR', flag: '🇫🇷' }, { code: 'DE', flag: '🇩🇪' }, { code: 'ES', flag: '🇪🇸' },
    { code: 'IT', flag: '🇮🇹' }, { code: 'GB', flag: '🇬🇧' }, { code: 'PT', flag: '🇵🇹' },
    { code: 'NL', flag: '🇳🇱' }
];

const FIRST_NAMES = ["Алекс", "Лео", "Марко", "Давид", "Карлос", "Матео", "Лука", "Эрик", "Иван", "Серхио"];
const LAST_NAMES = ["Силва", "Мартинес", "Иванов", "Мюллер", "Родригес", "Бланко", "Коста", "Шмидт", "Росси", "Дюпон"];

// --- 1. ВЕКТОРНЫЙ ГЕНЕРАТОР ЧИБИ-АВАТАРОВ (SVG) ---
function generateMaleAvatarSVG(seed) {
    const hash = String(seed).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const skinTones = ['#ffdbac', '#f1c27d', '#e0ac69', '#8d5524', '#c68642'];
    const hairColors = ['#2c1608', '#4a3728', '#d69d2a', '#a52a2a', '#111111'];
    const jerseyColors = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f1c40f', '#e67e22'];
    
    const skin = skinTones[hash % skinTones.length];
    const hair = hairColors[(hash * 3) % hairColors.length];
    const jersey = jerseyColors[(hash * 7) % jerseyColors.length];
    const hairType = hash % 4;

    let hairSVG = '';
    if (hairType === 0) {
        hairSVG = `<path d="M 20 38 Q 50 10 80 38 Q 50 25 20 38 Z" fill="${hair}" />`; // Короткие
    } else if (hairType === 1) {
        hairSVG = `<path d="M 18 42 Q 50 5 82 42 Q 50 20 18 42 Z" fill="${hair}" /><circle cx="50" cy="20" r="10" fill="${hair}"/>`; // Пышные
    } else if (hairType === 2) {
        hairSVG = `<path d="M 22 36 Q 50 15 78 36 Q 50 28 22 36 Z" fill="${hair}" /><rect x="44" y="14" width="12" height="15" fill="${hair}"/>`; // Ирокез
    } else {
        hairSVG = `<path d="M 20 40 Q 50 12 80 40 Q 65 30 20 40 Z" fill="${hair}" />`; // Челка
    }

    return `
    <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="46" fill="#182030" stroke="${jersey}" stroke-width="3"/>
        <!-- Корпус / Форма -->
        <path d="M 25 85 L 75 85 L 70 62 L 30 62 Z" fill="${jersey}" />
        <path d="M 40 62 L 50 72 L 60 62 Z" fill="#ffffff" opacity="0.3"/>
        <!-- Голова (Большая чиби) -->
        <circle cx="50" cy="46" r="24" fill="${skin}" />
        <!-- Уши -->
        <circle cx="25" cy="46" r="5" fill="${skin}" />
        <circle cx="75" cy="46" r="5" fill="${skin}" />
        <!-- Выразительные чиби-глаза -->
        <ellipse cx="40" cy="44" rx="4" ry="5" fill="#111" />
        <ellipse cx="60" cy="44" rx="4" ry="5" fill="#111" />
        <circle cx="41" cy="42" r="1.5" fill="#fff" />
        <circle cx="61" cy="42" r="1.5" fill="#fff" />
        <!-- Улыбка -->
        <path d="M 44 56 Q 50 60 56 56" stroke="#111" stroke-width="2" fill="none" stroke-linecap="round"/>
        <!-- Прическа -->
        ${hairSVG}
    </svg>`;
}

// --- 2. ГЕНЕРАЦИЯ ИГРОКОВ И ИНИЦИАЛИЗАЦИЯ ---
function generatePlayer(grade = 'bronze') {
    const nation = NATIONS[Math.floor(Math.random() * NATIONS.length)];
    const name = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)] + " " + LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const seed = Math.floor(Math.random() * 1000000);
    
    let minSkill = 50, maxSkill = 65;
    if (grade === 'silver') { minSkill = 66; maxSkill = 78; }
    if (grade === 'gold') { minSkill = 79; maxSkill = 88; }
    if (grade === 'legend') { minSkill = 89; maxSkill = 98; }
    
    const skill = Math.floor(Math.random() * (maxSkill - minSkill + 1)) + minSkill;

    return {
        id: 'p_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        name: name,
        nation: nation.flag,
        skill: skill,
        grade: grade,
        seed: seed,
        priceCoins: skill * 15,
        priceTon: grade === 'legend' ? 1.5 : (grade === 'gold' ? 0.5 : 0)
    };
}

function initNewGame() {
    const input = document.getElementById('club-name-input').value.trim();
    if (input) gameState.clubName = input;

    gameState.squad = [];
    for (let i = 0; i < 11; i++) {
        gameState.squad.push(generatePlayer('bronze'));
    }

    gameState.market = [
        generatePlayer('bronze'),
        generatePlayer('silver'),
        generatePlayer('silver'),
        generatePlayer('gold')
    ];

    initLeagueTable();
    saveGameState();
    document.getElementById('setup-screen').classList.remove('active');
    renderAll();
}

function initLeagueTable() {
    const botClubs = ["Ювентус", "Барселона", "Бавария", "Реал Мадрид", "Челси", "ПСЖ", "Арсенал", "Милан", "Аякс"];
    gameState.leagueTable = [
        { name: gameState.clubName, games: 0, win: 0, draw: 0, loss: 0, goals: 0, points: 0, isUser: true }
    ];

    botClubs.forEach(name => {
        gameState.leagueTable.push({
            name: name, games: 0, win: 0, draw: 0, loss: 0, goals: 0, points: 0, isUser: false
        });
    });
}

// --- 3. ИНТЕРФЕЙС И НАВИГАЦИЯ ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById('tab-' + tabId).classList.add('active');
    const activeBtn = document.querySelector(`.nav-btn[onclick*="${tabId}"]`);
    if (activeBtn) activeBtn.classList.add('active');
}

function renderAll() {
    document.getElementById('coins-val').innerText = gameState.coins;
    document.getElementById('ton-val').innerText = gameState.ton.toFixed(1);
    document.getElementById('energy-val').innerText = gameState.energy;
    document.getElementById('club-display-name').innerText = gameState.clubName;

    renderPitch();
    renderSquad();
    renderMarket();
    renderLeague();
}

function renderPitch() {
    const pitch = document.getElementById('football-pitch');
    pitch.innerHTML = '';
    const active11 = gameState.squad.slice(0, 11);
    
    let power = 0;
    active11.forEach(player => {
        power += player.skill;
        const card = createPlayerCardHTML(player);
        pitch.appendChild(card);
    });

    const squadPowerEl = document.getElementById('squad-power');
    if (squadPowerEl) squadPowerEl.innerText = power;
}

function renderSquad() {
    const grid = document.getElementById('squad-grid');
    grid.innerHTML = '';
    gameState.squad.forEach(player => {
        const card = createPlayerCardHTML(player, true);
        grid.appendChild(card);
    });
}

function renderMarket() {
    const grid = document.getElementById('market-grid');
    grid.innerHTML = '';
    gameState.market.forEach(player => {
        const card = createPlayerCardHTML(player, false, true);
        grid.appendChild(card);
    });
}

function createPlayerCardHTML(player, isSquad = false, isMarket = false) {
    const card = document.createElement('div');
    card.className = `player-card ${player.grade}`;
    card.onclick = () => openCardModal(player, isSquad, isMarket);

    card.innerHTML = `
        <div class="card-rating-badge">${player.skill}</div>
        <div class="card-avatar">${generateMaleAvatarSVG(player.seed)}</div>
        <div class="card-name">${player.nation} ${player.name}</div>
    `;
    return card;
}

// --- 4. ТРАНСФЕРЫ И МАГАЗИН ---
function openCardModal(player, isSquad, isMarket) {
    const modal = document.getElementById('card-modal');
    const render = document.getElementById('modal-card-render');
    const actions = document.getElementById('modal-card-actions');

    render.innerHTML = `
        <div style="width: 100px; height: 100px; margin: 0 auto;">${generateMaleAvatarSVG(player.seed)}</div>
        <h3 style="text-align:center; margin-top:10px;">${player.nation} ${player.name}</h3>
        <p style="text-align:center; color: var(--accent-gold); font-weight:bold;">Навык: ${player.skill} (${player.grade.toUpperCase()})</p>
    `;

    actions.innerHTML = '';
    if (isMarket) {
        const buyBtn = document.createElement('button');
        buyBtn.className = 'btn-primary';
        buyBtn.innerText = player.priceTon > 0 ? `Купить за ${player.priceTon} TON` : `Купить за ${player.priceCoins} 🪙`;
        buyBtn.onclick = () => buyPlayer(player);
        actions.appendChild(buyBtn);
    } else if (isSquad) {
        const sellBtn = document.createElement('button');
        sellBtn.className = 'btn-primary';
        sellBtn.style.background = '#e74c3c';
        sellBtn.innerText = `Продать за ${Math.floor(player.priceCoins * 0.6)} 🪙`;
        sellBtn.onclick = () => sellPlayer(player);
        actions.appendChild(sellBtn);
    }

    modal.classList.add('active');
}

function buyPlayer(player) {
    if (player.priceTon > 0) {
        if (gameState.ton < player.priceTon) return alert("Недостаточно TON!");
        gameState.ton -= player.priceTon;
    } else {
        if (gameState.coins < player.priceCoins) return alert("Недостаточно монет!");
        gameState.coins -= player.priceCoins;
    }

    gameState.market = gameState.market.filter(p => p.id !== player.id);
    gameState.squad.push(player);
    closeModal('card-modal');
    saveGameState();
    renderAll();
}

function sellPlayer(player) {
    if (gameState.squad.length <= 11) return alert("В составе должно оставаться минимум 11 игроков!");
    
    gameState.coins += Math.floor(player.priceCoins * 0.6);
    gameState.squad = gameState.squad.filter(p => p.id !== player.id);
    closeModal('card-modal');
    saveGameState();
    renderAll();
}

function buyChest(type) {
    let cost = type === 'bronze' ? 100 : (type === 'silver' ? 300 : 0.5);
    if (type === 'gold') {
        if (gameState.ton < cost) return alert("Недостаточно TON!");
        gameState.ton -= cost;
    } else {
        if (gameState.coins < cost) return alert("Недостаточно монет!");
        gameState.coins -= cost;
    }

    const rand = Math.random() * 100;
    let grade = 'bronze';
    if (type === 'bronze') grade = rand > 80 ? 'silver' : 'bronze';
    if (type === 'silver') grade = rand > 70 ? 'gold' : (rand > 30 ? 'silver' : 'bronze');
    if (type === 'gold') grade = rand > 60 ? 'legend' : (rand > 15 ? 'gold' : 'silver');

    const newPlayer = generatePlayer(grade);
    gameState.squad.push(newPlayer);
    alert(`Вы получили игрока: ${newPlayer.name} (${newPlayer.skill})!`);
    saveGameState();
    renderAll();
}

// --- 5. МАТЧ И СИМУЛЯЦИЯ ---
function startMatchSimulation() {
    if (gameState.energy < 1) return alert("Недостаточно энергии!");
    gameState.energy -= 1;

    const btn = document.getElementById('start-match-btn');
    btn.disabled = true;
    const log = document.getElementById('match-broadcast');
    log.innerText = "Матч начался! Идёт 1-й тайм...";

    playTone(440, 0.2);

    setTimeout(() => {
        document.getElementById('halftime-banner').classList.add('active');
        setTimeout(() => {
            document.getElementById('halftime-banner').classList.remove('active');
            log.innerText = "Идёт 2-й тайм...";
            
            setTimeout(() => {
                finishMatch();
                btn.disabled = false;
            }, 2500);
        }, 1000);
    }, 2500);
}

function finishMatch() {
    playTone(880, 0.4);
    const userPower = gameState.squad.slice(0, 11).reduce((acc, p) => acc + p.skill, 0);
    const userGoals = Math.floor(Math.random() * 3) + (userPower > 700 ? 1 : 0);
    const botGoals = Math.floor(Math.random() * 3);

    const log = document.getElementById('match-broadcast');
    log.innerText = `Матч завершён! Счет: ${userGoals} - ${botGoals}`;

    const userTable = gameState.leagueTable.find(t => t.isUser);
    userTable.games += 1;
    userTable.goals += userGoals;

    if (userGoals > botGoals) {
        userTable.win += 1; userTable.points += 3;
        gameState.coins += 150;
    } else if (userGoals === botGoals) {
        userTable.draw += 1; userTable.points += 1;
        gameState.coins += 50;
    } else {
        userTable.loss += 1;
    }

    simulateBotMatches();
    gameState.tour += 1;
    saveGameState();
    renderAll();
}

function simulateBotMatches() {
    gameState.leagueTable.forEach(team => {
        if (!team.isUser) {
            team.games += 1;
            const res = Math.random();
            if (res > 0.5) { team.win += 1; team.points += 3; }
            else if (res > 0.25) { team.draw += 1; team.points += 1; }
            else { team.loss += 1; }
        }
    });
    gameState.leagueTable.sort((a, b) => b.points - a.points);
}

function renderLeague() {
    const tbody = document.getElementById('league-tbody');
    tbody.innerHTML = '';
    gameState.leagueTable.forEach((team, idx) => {
        const tr = document.createElement('tr');
        if (team.isUser) tr.style.fontWeight = 'bold';
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${team.name}</td>
            <td>${team.games}</td>
            <td>${team.win}</td>
            <td>${team.draw}</td>
            <td>${team.loss}</td>
            <td>${team.goals}</td>
            <td>${team.points}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --- 6. МОДАЛЬНЫЕ ОКНА И ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function showInfo(type) {
    const modal = document.getElementById('info-modal');
    const title = document.getElementById('info-title');
    const body = document.getElementById('info-body');

    if (type === 'energy') {
        title.innerText = "Энергия";
        body.innerText = "Каждый матч тратит 1 единицу энергии. Энергия восстанавливается со временем.";
    } else if (type === 'tactics') {
        title.innerText = "Тактика";
        body.innerText = "Выбирайте расстановку игроков под стиль соперника.";
    } else {
        title.innerText = "Справка";
        body.innerText = "Собирайте состав, играйте матчи в лиге и покупайте лучших игроков на трансферном рынке.";
    }
    modal.classList.add('active');
}

function playTone(freq, duration) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        osc.frequency.value = freq;
        osc.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch(e) {}
}

// --- 7. СОХРАНЕНИЕ И ЗАГРУЗКА ---
function saveGameState() {
    localStorage.setItem('mfl_game_state', JSON.stringify(gameState));
}

function loadGameState() {
    const saved = localStorage.getItem('mfl_game_state');
    if (saved) {
        try {
            gameState = JSON.parse(saved);
        } catch(e) {}
    } else {
        document.getElementById('setup-screen').classList.add('active');
    }
}

// Запуск при загрузке
window.onload = () => {
    loadGameState();
    renderAll();
};
            
