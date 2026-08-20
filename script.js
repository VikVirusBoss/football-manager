// ==========================================
// 1. БАЗА ДАННЫХ И НАСТРОЙКИ
// ==========================================

const COUNTRIES = [
    { name: 'Россия', flag: '🇷🇺', names: ['Смирнов', 'Иванов', 'Кузнецов', 'Попов', 'Соколов', 'Морозов', 'Волков', 'Алексеев'] },
    { name: 'Бразилия', flag: '🇧🇷', names: ['Силва', 'Сантос', 'Феррейра', 'Оливейра', 'Соуза', 'Родригес', 'Алвес', 'Лима'] },
    { name: 'Аргентина', flag: '🇦🇷', names: ['Месси', 'Гомес', 'Мартинес', 'Лопес', 'Диас', 'Родригес', 'Перес', 'Ромеро'] },
    { name: 'Франция', flag: '🇫🇷', names: ['Дюбуа', 'Моро', 'Лоран', 'Симон', 'Мишель', 'Лефевр', 'Руссо', 'Бертран'] },
    { name: 'Германия', flag: '🇩🇪', names: ['Мюллер', 'Шмидт', 'Шнайдер', 'Фишер', 'Вебер', 'Майер', 'Вагнер', 'Беккер'] },
    { name: 'Испания', flag: '🇪🇸', names: ['Гарсия', 'Родригес', 'Фернандес', 'Лопес', 'Мартинес', 'Санчес', 'Перес', 'Гомес'] },
    { name: 'Англия', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', names: ['Смит', 'Джонс', 'Уильямс', 'Тейлор', 'Браун', 'Уилсон', 'Джонсон', 'Уокер'] },
    { name: 'Нигерия', flag: '🇳🇬', names: ['Окоча', 'Осимхен', 'Кану', 'Оби', 'Муса', 'Авонийи', 'Ивоби', 'Чуквуэзе'] },
    { name: 'Япония', flag: '🇯🇵', names: ['Танака', 'Наката', 'Иноуэ', 'Такахаси', 'Ито', 'Ватанабэ', 'Ямамото', 'Зато'] },
    { name: 'Италия', flag: '🇮🇹', names: [' Росси', 'Руссо', 'Феррари', 'Эспозито', 'Бьянки', 'Романо', 'Коломбо', 'Риччи'] }
];

const POSITIONS = ['ВРТ', 'ЦЗ', 'ПЗ', 'ЛЗ', 'ЦП', 'ЦАП', 'ПП', 'ЛП', 'НАП'];

let gameState = {
    clubName: 'Мой Клуб',
    coins: 1000,
    ton: 0.0,
    energy: 25,
    lastEnergyUpdate: Date.now(),
    squad: [],
    market: [],
    formation: '4-3-3',
    league: {
        tour: 1,
        teams: []
    }
};

// ==========================================
// 2. РЕНДЕР МОДУЛЬНЫХ 2D МУЖСКИХ ЛИЦ (SVG)
// ==========================================

function generateMaleAvatarSVG(seed) {
    const skinTones = ['#f5d0a9', '#e0ac69', '#c68642', '#8d5524', '#523118'];
    const hairColors = ['#1a1a1a', '#4a2c11', '#b5520b', '#d6c585', '#808080'];
    const hairStyles = [
        "M 15 28 Q 32 10 49 28 Q 32 18 15 28 Z", // Короткий спортивный кроп
        "M 14 30 Q 32 5 50 30 Q 32 12 14 30 Z",  // Ежик
        "M 16 26 Q 32 14 48 26 L 50 20 Q 32 8 14 20 Z" // Классический зачес
    ];

    const skin = skinTones[seed % skinTones.length];
    const hair = hairColors[(seed * 3) % hairColors.length];
    const style = hairStyles[(seed * 7) % hairStyles.length];
    const hasBeard = (seed % 3) === 0;

    return `
    <svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="30" fill="none"/>
        <!-- Шея -->
        <rect x="26" y="40" width="12" height="12" fill="${skin}" filter="brightness(0.9)"/>
        <!-- Лицо -->
        <path d="M 18 26 C 18 18, 46 18, 46 26 C 46 42, 38 48, 32 48 C 26 48, 18 42, 18 26 Z" fill="${skin}"/>
        <!-- Глаза -->
        <circle cx="26" cy="28" r="2" fill="#222"/>
        <circle cx="38" cy="28" r="2" fill="#222"/>
        <!-- Брови -->
        <line x1="23" y1="24" x2="29" y2="24" stroke="#222" stroke-width="1.5"/>
        <line x1="35" y1="24" x2="41" y2="24" stroke="#222" stroke-width="1.5"/>
        <!-- Нос -->
        <path d="M 32 28 L 31 33 L 33 33" stroke="rgba(0,0,0,0.3)" stroke-width="1.2" fill="none"/>
        <!-- Рот -->
        <path d="M 28 38 Q 32 40 36 38" stroke="rgba(0,0,0,0.5)" stroke-width="1.5" fill="none"/>
        ${hasBeard ? `<path d="M 20 32 Q 32 50 44 32 Q 32 46 20 32 Z" fill="${hair}" opacity="0.8"/>` : ''}
        <!-- Мужская прическа -->
        <path d="${style}" fill="${hair}"/>
    </svg>`;
}

// ==========================================
// 3. ГЕНЕРАЦИЯ ИГРОКОВ И СУНДУКОВ
// ==========================================

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePlayer(targetGrade = null) {
    // 1. Определение грейда по жестким шансам, если не задан
    if (!targetGrade) {
        const rand = Math.random() * 100;
        if (rand < 1) targetGrade = 'legend';       // 1%
        else if (rand < 6) targetGrade = 'gold';    // 5%
        else if (rand < 21) targetGrade = 'silver'; // 15%
        else targetGrade = 'bronze';                // 79%
    }

    let minOvr = 45, maxOvr = 69;
    if (targetGrade === 'silver') { minOvr = 70; maxOvr = 79; }
    if (targetGrade === 'gold') { minOvr = 80; maxOvr = 89; }
    if (targetGrade === 'legend') { minOvr = 90; maxOvr = 95; }

    const ovr = getRandomInt(minOvr, maxOvr);
    const countryObj = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    
    // Проверка дубликатов фамилий у игрока
    let surname = countryObj.names[Math.floor(Math.random() * countryObj.names.length)];
    const existingSurnames = gameState.squad.map(p => p.name);
    let attempts = 0;
    while (existingSurnames.includes(surname) && attempts < 10) {
        surname = countryObj.names[Math.floor(Math.random() * countryObj.names.length)];
        attempts++;
    }

    const pos = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
    const seed = getRandomInt(10000, 999999);

    return {
        id: 'p_' + Date.now() + '_' + getRandomInt(100, 999),
        name: surname,
        country: countryObj.name,
        flag: countryObj.flag,
        position: pos,
        rating: ovr,
        grade: targetGrade,
        seed: seed,
        stats: {
            speed: Math.min(99, ovr + getRandomInt(-5, 5)),
            shot: Math.min(99, ovr + getRandomInt(-5, 5)),
            pass: Math.min(99, ovr + getRandomInt(-5, 5)),
            phys: Math.min(99, ovr + getRandomInt(-5, 5))
        }
    };
}

function buyChest(type) {
    let costCoins = 0, costTon = 0;
    let grade = 'bronze';

    if (type === 'bronze') {
        costCoins = 100;
        const r = Math.random() * 100;
        grade = (r < 10) ? 'silver' : 'bronze';
    } else if (type === 'silver') {
        costCoins = 300;
        const r = Math.random() * 100;
        if (r < 5) grade = 'gold';
        else if (r < 40) grade = 'silver';
        else grade = 'bronze';
    } else if (type === 'gold') {
        costTon = 0.5;
        const r = Math.random() * 100;
        if (r < 1) grade = 'legend'; // 1%
        else if (r < 16) grade = 'gold'; // 15%
        else if (r < 61) grade = 'silver'; // 45%
        else grade = 'bronze'; // 39%
    }

    if (gameState.coins < costCoins) { alert("Недостаточно монет!"); return; }
    if (gameState.ton < costTon) { alert("Недостаточно TON!"); return; }

    gameState.coins -= costCoins;
    gameState.ton -= costTon;

    const newPlayer = generatePlayer(grade);
    gameState.squad.push(newPlayer);
    saveGame();
    renderAll();

    openCardModal(newPlayer, true);
}

// ==========================================
// 4. ДИВИЗИОН И СИМУЛЯЦИЯ ЛИГИ
// ==========================================

function initLeagueIfEmpty() {
    if (gameState.league.teams.length === 0) {
        const botClubs = ['Локомотив', 'Ювентус', 'Бавария', 'Реал Мадрид', 'Челси', 'ПСЖ', 'Барселона', 'Милан', 'Арсенал'];
        gameState.league.teams = [
            { name: gameState.clubName, isUser: true, played: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }
        ];
        botClubs.forEach(name => {
            gameState.league.teams.push({ name: name, isUser: false, played: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 });
        });
    }
}

function simulateBotMatches() {
    const teams = gameState.league.teams;
    for (let i = 0; i < teams.length; i++) {
        if (teams[i].isUser) continue;
        // Находим случайного соперника боту
        let oppIndex = (i + 1) % teams.length;
        if (teams[oppIndex].isUser) oppIndex = (oppIndex + 1) % teams.length;

        const g1 = getRandomInt(0, 3);
        const g2 = getRandomInt(0, 3);

        teams[i].played++;
        teams[i].gf += g1;
        teams[i].ga += g2;

        if (g1 > g2) { teams[i].w++; teams[i].pts += 3; }
        else if (g1 === g2) { teams[i].d++; teams[i].pts += 1; }
        else { teams[i].l++; }
    }
}

// ==========================================
// 5. ДВИЖОК МАТЧА С ЗВУКАМИ И 5-СЕКУНДНЫМИ ТАЙМАМИ
// ==========================================

function playAudioSignal(freq, type, duration) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
        osc.stop(ctx.currentTime + duration);
    } catch (e) {}
}

function startMatchSimulation() {
    if (gameState.energy < 1) {
        alert("Недостаточно энергии!");
        return;
    }

    gameState.energy--;
    saveGame();
    renderHeader();

    const btn = document.getElementById('start-match-btn');
    btn.disabled = true;
    const broadcast = document.getElementById('match-broadcast');
    
    // Поиск текущего соперника из лиги
    const opp = gameState.league.teams.find(t => !t.isUser) || { name: 'Ювентус' };
    
    let userGoals = 0;
    let oppGoals = 0;

    playAudioSignal(800, 'sine', 0.4); // Свисток к началу
    broadcast.innerHTML = "<b>1-й ТАЙМ НАЧАЛСЯ!</b>";

    // Первый тайм - 5 секунд
    setTimeout(() => {
        if (Math.random() > 0.4) {
            userGoals++;
            const scorer = gameState.squad[getRandomInt(0, Math.min(10, gameState.squad.length - 1))]?.name || 'Нападающий';
            broadcast.innerHTML += `<br>⚽ <b>ГОЛ! ${scorer} забивает за ${gameState.clubName}!</b>`;
            playAudioSignal(523, 'triangle', 0.6);
        }
    }, 2500);

    // Перерыв на 5-й секунде
    setTimeout(() => {
        document.getElementById('halftime-banner').style.display = 'flex';
        playAudioSignal(400, 'sine', 0.3);
    }, 5000);

    // Второй тайм
    setTimeout(() => {
        document.getElementById('halftime-banner').style.display = 'none';
        broadcast.innerHTML += "<br><b>2-й ТАЙМ НАЧАЛСЯ!</b>";
        playAudioSignal(800, 'sine', 0.4);
    }, 6500);

    setTimeout(() => {
        if (Math.random() > 0.5) {
            oppGoals++;
            broadcast.innerHTML += `<br>⚽ <b>ГОЛ! ${opp.name} забивает мяч!</b>`;
            playAudioSignal(220, 'sawtooth', 0.5);
        }
    }, 9000);

    // Финальный свисток (11.5 секунд от старта)
    setTimeout(() => {
        playAudioSignal(800, 'sine', 0.8);
        broadcast.innerHTML += `<br>🏁 <b>ФИНАЛЬНЫЙ СВИСТОК! Итог: ${userGoals}:${oppGoals}</b>`;
        btn.disabled = false;

        // Запись результатов турнира
        const userTeam = gameState.league.teams.find(t => t.isUser);
        if (userTeam) {
            userTeam.played++;
            userTeam.gf += userGoals;
            userTeam.ga += oppGoals;
            if (userGoals > oppGoals) { userTeam.w++; userTeam.pts += 3; gameState.coins += 150; }
            else if (userGoals === oppGoals) { userTeam.d++; userTeam.pts += 1; gameState.coins += 50; }
            else { userTeam.l++; }
        }

        simulateBotMatches();
        gameState.league.tour++;
        saveGame();
        renderAll();
    }, 11500);
}

// ==========================================
// 6. ОТОБРАЖЕНИЕ КАРТОЧЕК И ИНТЕРФЕЙСА
// ==========================================

function renderCardHTML(player) {
    return `
    <div class="fut-card card-${player.grade}" onclick="openCardModalById('${player.id}')">
        <div class="card-top">
            <span class="card-rating">${player.rating}</span>
            <span class="card-pos">${player.position}</span>
            <span class="card-flag">${player.flag}</span>
        </div>
        <div class="card-face">${generateMaleAvatarSVG(player.seed)}</div>
        <div class="card-name">${player.name}</div>
        <div class="card-stats-mini">
            <span>⚡${player.stats.speed}</span>
            <span>⚽${player.stats.shot}</span>
        </div>
    </div>`;
}

function renderAll() {
    renderHeader();
    renderPitch();
    renderSquad();
    renderLeagueTable();
    renderMarket();
}

function renderHeader() {
    document.getElementById('energy-val').innerText = gameState.energy;
    document.getElementById('coins-val').innerText = gameState.coins;
    document.getElementById('ton-val').innerText = gameState.ton.toFixed(1);
    document.getElementById('club-display-name').innerText = gameState.clubName;
}

function renderPitch() {
    const pitch = document.getElementById('football-pitch');
    pitch.innerHTML = '';
    const starters = gameState.squad.slice(0, 11);

    let html = '<div class="pitch-line">';
    starters.forEach((p, idx) => {
        html += renderCardHTML(p);
        if ((idx + 1) % 3 === 0 && idx < 10) html += '</div><div class="pitch-line">';
    });
    html += '</div>';
    pitch.innerHTML = html;
}

function renderSquad() {
    const grid = document.getElementById('squad-grid');
    grid.innerHTML = gameState.squad.map(p => renderCardHTML(p)).join('');
    
    const power = gameState.squad.reduce((acc, p) => acc + p.rating, 0);
    document.getElementById('squad-power').innerText = Math.round(power / (gameState.squad.length || 1));
}

function renderLeagueTable() {
    const tbody = document.getElementById('league-tbody');
    // Сортировка по очкам, затем разнице мячей
    const sorted = [...gameState.league.teams].sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
    
    tbody.innerHTML = sorted.map((t, idx) => `
        <tr class="${t.isUser ? 'user-row' : ''}">
            <td>${idx + 1}</td>
            <td>${t.name}</td>
            <td>${t.played}</td>
            <td>${t.w}</td>
            <td>${t.d}</td>
            <td>${t.l}</td>
            <td>${t.gf - t.ga}</td>
            <td><b>${t.pts}</b></td>
        </tr>
    `).join('');
    
    document.getElementById('league-tour-info').innerText = `Тур ${gameState.league.tour} из 18`;
}

function renderMarket() {
    const grid = document.getElementById('market-grid');
    if (gameState.market.length === 0) {
        grid.innerHTML = '<div style="color:#8e9baa; grid-column: 1/-1;">На рынке нет доступных карточек</div>';
        return;
    }
    grid.innerHTML = gameState.market.map(item => `
        <div style="display:flex; flex-direction:column; align-items:center;">
            ${renderCardHTML(item.player)}
            <button class="btn-buy" style="margin-top:4px;" onclick="buyFromMarket('${item.id}')">
                ${item.priceCoins ? item.priceCoins + ' 🪙' : item.priceTon + ' TON'}
            </button>
        </div>
    `).join('');
}

// ==========================================
// 7. МОДАЛЬНЫЕ ОКНА И TON-ЭКОНОМИКА
// ==========================================

function openCardModalById(id) {
    const player = gameState.squad.find(p => p.id === id);
    if (player) openCardModal(player, false);
}

function openCardModal(player, isNewFromChest = false) {
    const container = document.getElementById('modal-card-render');
    const actions = document.getElementById('modal-card-actions');
    
    container.innerHTML = `
        <div style="display:flex; justify-content:center; margin-bottom:10px;">${renderCardHTML(player)}</div>
        <h3 style="text-align:center">${player.name} (${player.position})</h3>
        <p style="font-size:12px; text-align:center; color:#8e9baa;">Нация: ${player.flag} ${player.country}</p>
        <div style="font-size:12px; margin-top:8px;">
            ⚡ Скорость (СКО): <b>${player.stats.speed}</b><br>
            ⚽ Удар (УДР): <b>${player.stats.shot}</b><br>
            🎯 Пас (ПАС): <b>${player.stats.pass}</b><br>
            💪 Физика (ФИЗ): <b>${player.stats.phys}</b>
        </div>
    `;

    actions.innerHTML = '';

    if (!isNewFromChest) {
        // Логика продажа / рынок по грейдам
        if (player.grade === 'bronze') {
            actions.innerHTML += `<button class="btn-primary" onclick="quickSell('${player.id}', 30)">Продать системе (30 🪙)</button>`;
        } else if (player.grade === 'silver') {
            actions.innerHTML += `<button class="btn-primary" onclick="quickSell('${player.id}', 80)">Продать системе (80 🪙)</button>`;
            actions.innerHTML += `<button class="btn-primary" style="background:#3b82f6; color:#fff" onclick="listToMarket('${player.id}', 'coins', 150)">На рынок (150 🪙)</button>`;
            actions.innerHTML += `<button class="btn-primary" style="background:#ffd700; color:#000" onclick="listToMarket('${player.id}', 'ton', 0.2)">На рынок (0.2 TON)</button>`;
        } else { // Золото и Легенды
            actions.innerHTML += `<button class="btn-primary" onclick="quickSell('${player.id}', 200)">Продать системе (200 🪙)</button>`;
            actions.innerHTML += `<button class="btn-primary" style="background:#ffd700; color:#000" onclick="listToMarket('${player.id}', 'ton', ${player.grade === 'legend' ? 2.0 : 0.8})">На рынок (${player.grade === 'legend' ? '2.0' : '0.8'} TON)</button>`;
        }
    }

    document.getElementById('card-modal').style.display = 'flex';
}

function quickSell(playerId, amount) {
    gameState.squad = gameState.squad.filter(p => p.id !== playerId);
    gameState.coins += amount;
    closeModal('card-modal');
    saveGame();
    renderAll();
}

function listToMarket(playerId, currency, price) {
    const idx = gameState.squad.findIndex(p => p.id === playerId);
    if (idx !== -1) {
        const player = gameState.squad.splice(idx, 1)[0];
        gameState.market.push({
            id: 'm_' + Date.now(),
            player: player,
            priceCoins: currency === 'coins' ? price : null,
            priceTon: currency === 'ton' ? price : null
        });
        closeModal('card-modal');
        saveGame();
        renderAll();
    }
}

function buyFromMarket(marketId) {
    const idx = gameState.market.findIndex(m => m.id === marketId);
    if (idx !== -1) {
        const item = gameState.market[idx];
        if (item.priceCoins && gameState.coins < item.priceCoins) { alert("Недостаточно монет!"); return; }
        if (item.priceTon && gameState.ton < item.priceTon) { alert("Недостаточно TON!"); return; }

        if (item.priceCoins) gameState.coins -= item.priceCoins;
        if (item.priceTon) gameState.ton -= item.priceTon;

        gameState.squad.push(item.player);
        gameState.market.splice(idx, 1);
        saveGame();
        renderAll();
    }
}

// ==========================================
// 8. СПРАВОЧНАЯ СИСТЕМА И ЭНЕРГИЯ
// ==========================================

function showChestInfo(type) {
    const title = document.getElementById('info-title');
    const body = document.getElementById('info-body');

    if (type === 'bronze') {
        title.innerText = "Бронзовый сундук";
        body.innerHTML = "Шансы выпадения:<br>🟫 Бронза (45-69): <b>90%</b><br>⬜ Серебро (70-79): <b>10%</b>";
    } else if (type === 'silver') {
        title.innerText = "Серебряный сундук";
        body.innerHTML = "Шансы выпадения:<br>🟫 Бронза (45-69): <b>60%</b><br>⬜ Серебро (70-79): <b>35%</b><br>🟨 Золото (80-89): <b>5%</b>";
    } else if (type === 'gold') {
        title.innerText = "Золотой сундук";
        body.innerHTML = "Шансы выпадения:<br>🟫 Бронза (45-69): <b>39%</b><br>⬜ Серебро (70-79): <b>45%</b><br>🟨 Золото (80-89): <b>15%</b><br>👑 ЛЕГЕНДА (90-95): <b>1%</b>";
    }
    document.getElementById('info-modal').style.display = 'flex';
}

function showInfo(topic) {
    const title = document.getElementById('info-title');
    const body = document.getElementById('info-body');

    if (topic === 'stats') {
        title.innerText = "Характеристики карточек";
        body.innerHTML = "<b>Общий рейтинг (45-95)</b> — суммарная сила футболиста.<br><br><b>СКО (Скорость)</b> — влияет на атакующие рывки.<br><b>УДР (Удар)</b> — точность и сила реализации.<br><b>ПАС (Пас)</b> — качество передач.<br><b>ФИЗ (Физика)</b> — выносливость и борьба за мяч.";
    } else if (topic === 'tactics') {
        title.innerText = "Тактические схемы";
        body.innerHTML = "Смена расстановки перераспределяет игроков по линиям поля (Защита - Полузащита - Нападение).";
    } else if (topic === 'league') {
        title.innerText = "Правила Дивизиона";
        body.innerHTML = "За победу дается 3 очки, за ничью — 1, за поражение — 0. Параллельно симулируются все матчи соперников!";
    } else if (topic === 'energy') {
        title.innerText = "Энергия";
        body.innerHTML = "1 матч = 1 энергия. Автоматически восстанавливается (+1 каждые 4 минуты).";
    }
    document.getElementById('info-modal').style.display = 'flex';
}

function updateEnergyRegen() {
    const now = Date.now();
    const diffSeconds = Math.floor((now - gameState.lastEnergyUpdate) / 1000);
    const regenInterval = 240; // 4 минуты

    if (diffSeconds >= regenInterval && gameState.energy < 25) {
        const added = Math.floor(diffSeconds / regenInterval);
        gameState.energy = Math.min(25, gameState.energy + added);
        gameState.lastEnergyUpdate = now;
        saveGame();
        renderHeader();
    }
}

// ==========================================
// 9. СОХРАНЕНИЕ И СТАРТ ИГРЫ
// ==========================================

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById('tab-' + tabId).classList.add('active');
    event.target.classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function changeFormation(val) {
    gameState.formation = val;
    saveGame();
    renderPitch();
}

function saveGame() {
    localStorage.setItem('fm_game_state', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('fm_game_state');
    if (saved) {
        gameState = JSON.parse(saved);
        document.getElementById('setup-screen').style.display = 'none';
        initLeagueIfEmpty();
        renderAll();
        return true;
    }
    return false;
}

function initNewGame() {
    const input = document.getElementById('club-name-input').value.trim();
    if (!input) { alert("Введите название клуба!"); return; }
    
    gameState.clubName = input;
    // Стартовые 11 бронзовых игроков
    for (let i = 0; i < 11; i++) {
        gameState.squad.push(generatePlayer('bronze'));
    }
    initLeagueIfEmpty();
    saveGame();
    document.getElementById('setup-screen').style.display = 'none';
    renderAll();
}

// Автозапуск
window.onload = function() {
    if (!loadGame()) {
        document.getElementById('setup-screen').style.display = 'flex';
    }
    setInterval(updateEnergyRegen, 10000); // Проверка восстановления энергии
};
