// СОСТОЯНИЕ ИГРЫ
let gameState = {
    clubName: '',
    coins: 1000,
    energy: 25,
    mainSquad: [],
    subs: [],
    reserve: [],
    tactics: '4-3-3',
    currentTour: 0,
    leagueTable: [],
    schedule: [],
    marketPlayers: [],
    packStep: 1,
    tutorialStep: 0
};

// ТАКТИЧЕСКИЕ СХЕМЫ (Координаты top, left в %)
const formations = {
    '4-3-3': [
        {t:88, l:50}, // Вратарь
        {t:72, l:15}, {t:75, l:38}, {t:75, l:62}, {t:72, l:85}, // Защита
        {t:50, l:25}, {t:52, l:50}, {t:50, l:75}, // Полузащита
        {t:25, l:20}, {t:20, l:50}, {t:25, l:80}  // Нападение
    ],
    '4-4-2': [
        {t:88, l:50},
        {t:72, l:15}, {t:75, l:38}, {t:75, l:62}, {t:72, l:85},
        {t:48, l:15}, {t:50, l:38}, {t:50, l:62}, {t:48, l:85},
        {t:22, l:35}, {t:22, l:65}
    ],
    '3-5-2': [
        {t:88, l:50},
        {t:75, l:25}, {t:78, l:50}, {t:75, l:75},
        {t:50, l:10}, {t:52, l:30}, {t:52, l:50}, {t:52, l:70}, {t:50, l:90},
        {t:22, l:35}, {t:22, l:65}
    ],
    '5-3-2': [
        {t:88, l:50},
        {t:72, l:10}, {t:75, l:30}, {t:78, l:50}, {t:75, l:70}, {t:72, l:90},
        {t:50, l:25}, {t:52, l:50}, {t:50, l:75},
        {t:22, l:35}, {t:22, l:65}
    ]
};

// Генератор футболистов (только мужские лица)
function generatePlayer(pos = null) {
    const positions = ['ГК', 'ЗЩ', 'ПЗ', 'НАП'];
    const chosenPos = pos || positions[Math.floor(Math.random() * positions.length)];
    const names = ['Смирнов', 'Иванов', 'Петров', 'Модрич', 'Силва', 'Мартинес', 'Мюллер', 'Гарсия', 'Кейн', 'Коста', 'Родриго'];
    const randomSeed = Math.floor(Math.random() * 899999) + 100000;
    
    return {
        id: 'p_' + Math.random().toString(36).substr(2, 7),
        name: names[Math.floor(Math.random() * names.length)],
        position: chosenPos,
        skill: Math.floor(Math.random() * 25) + 65,
        injured: false,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=m_${randomSeed}&eyebrows=variant01,variant02,variant03,variant04,variant05`
    };
}

// 1. ИНИЦИАЛИЗАЦИЯ КЛУБА
function initClub() {
    const input = document.getElementById('club-name-input').value.trim();
    if (!input) return alert('Пожалуйста, введите название клуба!');
    
    gameState.clubName = input;
    document.getElementById('club-display-name').innerText = input;
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('pack-screen').style.display = 'flex';
}

// 2. РАСПАКОВКА ЛУТБОКСОВ
function openCurrentPack() {
    const chest = document.getElementById('chest');
    chest.classList.add('chest-shake');

    setTimeout(() => {
        chest.classList.remove('chest-shake');
        chest.style.display = 'none';

        const container = document.getElementById('pack-results');
        container.innerHTML = '';
        container.style.display = 'grid';

        const count = (gameState.packStep === 1) ? 11 : 7;
        for (let i = 0; i < count; i++) {
            const p = generatePlayer();
            if (gameState.packStep === 1) gameState.mainSquad.push(p);
            else gameState.subs.push(p);

            container.innerHTML += `
                <div class="player-card">
                    <img src="${p.avatar}">
                    <div class="p-name">${p.name}</div>
                    <div class="p-pos">${p.position} (${p.skill})</div>
                </div>
            `;
        }
        document.getElementById('pack-next-btn').style.display = 'block';
    }, 1000);
}

function nextPackStep() {
    if (gameState.packStep === 1) {
        gameState.packStep = 2;
        document.getElementById('pack-title').innerText = "Второй пак: Запасные игроки";
        document.getElementById('pack-subtitle').innerText = "Откройте сундук, чтобы получить 7 запасных";
        document.getElementById('chest').style.display = 'inline-block';
        document.getElementById('pack-results').style.display = 'none';
        document.getElementById('pack-next-btn').style.display = 'none';
    } else {
        document.getElementById('pack-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        initLeagueAndMarket();
        startTutorial();
    }
}

// 3. ИНТЕРАКТИВНОЕ ОБУЧЕНИЕ
const tutorialSteps = [
    { title: "🏟️ Раздел Матч", text: "Здесь вы играете матчи. Выбирайте тактическую схему и управляйте игрой!" },
    { title: "📋 Раздел Состав", text: "Состав делится на Основу (11), Запасных (7) и Резерв. Травмированные игроки автозаменяются из Запасных." },
    { title: "🏆 Раздел Лига", text: "Здесь находится таблица из 20 клубов и календарь расписания на 38 туров." },
    { title: "🛒 Раздел Рынок", text: "Покупайте и продавайте футболистов для усиления команды." },
    { title: "🎁 Раздел Магазин", text: "Покупайте новые паки с игроками за монеты, которые вы зарабатываете в матчах." }
];

function startTutorial() {
    gameState.tutorialStep = 0;
    showTutorialStep();
}

function showTutorialStep() {
    const step = tutorialSteps[gameState.tutorialStep];
    if (!step) {
        document.getElementById('tutorial-overlay').style.display = 'none';
        renderAll();
        return;
    }
    document.getElementById('tut-title').innerText = step.title;
    document.getElementById('tut-text').innerText = step.text;
    document.getElementById('tutorial-overlay').style.display = 'flex';
}

function nextTutorialStep() {
    gameState.tutorialStep++;
    showTutorialStep();
}

// 4. ИНИЦИАЛИЗАЦИЯ ЛИГИ И РЫНКА
function initLeagueAndMarket() {
    const botClubs = ['ФК Милан', 'Бавария', 'Реал Мадрид', 'ПСЖ', 'Барселона', 'Манчестер Сити', 'Ювентус', 'Челси', 'Ливерпуль', 'Интер', 'Боруссия Д', 'Атлетико', 'Арсенал', 'Наполи', 'Аякс', 'Бенфика', 'Порту', 'Фейеноорд', 'Спортинг'];
    
    gameState.leagueTable = botClubs.map(name => ({ name, points: 0, played: 0 }));
    gameState.leagueTable.push({ name: gameState.clubName, points: 0, played: 0 });

    // Генерация календаря на 38 туров
    for (let i = 1; i <= 38; i++) {
        const opp = botClubs[Math.floor(Math.random() * botClubs.length)];
        gameState.schedule.push({ tour: i, opponent: opp, result: 'Предстоит' });
    }

    // Генерация игроков на рынке
    for (let i = 0; i < 6; i++) {
        gameState.marketPlayers.push(generatePlayer());
    }
}

// 5. ОТРЕСОВКА ИНТЕРФЕЙСА
function renderPitch() {
    const pitch = document.getElementById('pitch');
    // Удаляем прошлых игроков с поля
    const oldPlayers = pitch.querySelectorAll('.pitch-player');
    oldPlayers.forEach(el => el.remove());

    const coords = formations[gameState.tactics];
    gameState.mainSquad.forEach((p, index) => {
        if (index >= 11) return;
        const pos = coords[index];
        const playerEl = document.createElement('div');
        playerEl.className = 'pitch-player';
        playerEl.style.top = pos.t + '%';
        playerEl.style.left = pos.l + '%';

        playerEl.innerHTML = `
            ${p.injured ? '<span class="injury-icon">✚</span>' : ''}
            <img src="${p.avatar}" class="player-avatar">
            <div class="player-name-tag">${p.name} (${p.position})</div>
        `;
        pitch.appendChild(playerEl);
    });
}

function renderSquadTab() {
    const renderList = (containerId, list) => {
        const c = document.getElementById(containerId);
        c.innerHTML = list.length === 0 ? '<p style="color:#64748b; font-size:12px;">Пусто</p>' : '';
        list.forEach(p => {
            c.innerHTML += `
                <div class="player-card">
                    ${p.injured ? '<span class="injury-icon">✚</span>' : ''}
                    <img src="${p.avatar}">
                    <div class="p-name">${p.name}</div>
                    <div class="p-pos">${p.position} | ⚡ ${p.skill}</div>
                </div>
            `;
        });
    };

    renderList('main-squad-container', gameState.mainSquad);
    renderList('subs-squad-container', gameState.subs);
    renderList('reserve-squad-container', gameState.reserve);
}

function renderLeagueTab() {
    // Сортировка таблицы по очкам
    gameState.leagueTable.sort((a, b) => b.points - a.points);
    const tbody = document.getElementById('league-table-body');
    tbody.innerHTML = '';

    gameState.leagueTable.forEach((item, index) => {
        const isMy = item.name === gameState.clubName;
        let zoneClass = '';
        if (index < 2) zoneClass = 'zone-up';
        if (index >= 17) zoneClass = 'zone-down';

        tbody.innerHTML += `
            <tr class="${isMy ? 'my-club' : ''} ${zoneClass}">
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.played}</td>
                <td><b>${item.points}</b></td>
            </tr>
        `;
    });

    const scheduleList = document.getElementById('schedule-container');
    scheduleList.innerHTML = '';
    gameState.schedule.forEach(s => {
        scheduleList.innerHTML += `
            <div class="schedule-item">
                <span>Тур ${s.tour}: vs <b>${s.opponent}</b></span>
                <span>${s.result}</span>
            </div>
        `;
    });
}

function renderMarketTab() {
    const c = document.getElementById('market-container');
    c.innerHTML = '';
    gameState.marketPlayers.forEach((p, idx) => {
        const price = p.skill * 10;
        c.innerHTML += `
            <div class="player-card">
                <img src="${p.avatar}">
                <div class="p-name">${p.name}</div>
                <div class="p-pos">${p.position} | ⚡ ${p.skill}</div>
                <button class="btn btn-green" style="margin-top:5px; padding:4px;" onclick="buyPlayer(${idx})">${price} 🪙</button>
            </div>
        `;
    });
}

function renderAll() {
    document.getElementById('coins-val').innerText = gameState.coins;
    document.getElementById('energy-val').innerText = gameState.energy;
    
    if (gameState.schedule[gameState.currentTour]) {
        document.getElementById('scoreboard').innerText = `${gameState.clubName}  vs  ${gameState.schedule[gameState.currentTour].opponent}`;
    }

    renderPitch();
    renderSquadTab();
    renderLeagueTab();
    renderMarketTab();
}

// 6. СИМУЛЯЦИЯ МАТЧА И АВТОЗАМЕНЫ
async function startMatchSimulation() {
    if (gameState.energy < 5) return alert('Недостаточно энергии!');
    if (gameState.currentTour >= 38) return alert('Сезон окончен!');

    gameState.energy -= 5;
    const opp = gameState.schedule[gameState.currentTour].opponent;
    const log = document.getElementById('match-log');
    log.innerHTML = `Матч с ${opp} начался!<br>`;

    let myGoals = 0;
    let oppGoals = 0;

    for (let minute = 15; minute <= 90; minute += 25) {
        await new Promise(r => setTimeout(r, 1200));

        const rand = Math.random();
        if (rand > 0.6) {
            myGoals++;
            showBanner(`⚽ ГОЛ! ${gameState.clubName} (${myGoals}:${oppGoals})`);
            log.innerHTML += `${minute}' ⚽ ГОЛ в ворота ${opp}!<br>`;
        } else if (rand < 0.3) {
            oppGoals++;
            showBanner(`⚽ ГОЛ! ${opp} (${myGoals}:${oppGoals})`);
            log.innerHTML += `${minute}' ⚽ ${opp} забивает гол (${myGoals}:${oppGoals})<br>`;
        } else if (rand > 0.45 && rand < 0.55) {
            // ТРАВМА И АВТОЗАМЕНА ИЗ ЗАПАСА
            showBanner(`🚑 ТРАВМА!`);
            const injuredIndex = Math.floor(Math.random() * gameState.mainSquad.length);
            const injuredPlayer = gameState.mainSquad[injuredIndex];
            injuredPlayer.injured = true;

            log.innerHTML += `${minute}' 🚑 Травма у игрока ${injuredPlayer.name}!`;

            if (gameState.subs.length > 0) {
                const subPlayer = gameState.subs.shift(); // Берем из запаса
                gameState.mainSquad[injuredIndex] = subPlayer;
                gameState.reserve.push(injuredPlayer); // Травмированного отправляем в резерв
                log.innerHTML += ` Автозамена: вышел ${subPlayer.name}.<br>`;
            } else {
                log.innerHTML += ` Запасных нет, команда в меньшинстве!<br>`;
            }
            renderPitch();
        }
        log.scrollTop = log.scrollHeight;
    }

    // Итоги матча
    await new Promise(r => setTimeout(r, 1000));
    const pts = myGoals > oppGoals ? 3 : (myGoals === oppGoals ? 1 : 0);
    gameState.coins += myGoals > oppGoals ? 150 : 50;

    gameState.schedule[gameState.currentTour].result = `${myGoals}:${oppGoals}`;
    
    // Обновляем таблицу
    const myTableEntry = gameState.leagueTable.find(t => t.name === gameState.clubName);
    if (myTableEntry) { myTableEntry.points += pts; myTableEntry.played++; }

    log.innerHTML += `<b>Финальный свисток! Счет: ${myGoals}:${oppGoals}</b><br>`;
    gameState.currentTour++;
    renderAll();
}

function showBanner(text) {
    const b = document.getElementById('match-banner');
    b.innerText = text;
    b.style.display = 'block';
    setTimeout(() => { b.style.display = 'none'; }, 1800);
}

// 7. РЫНОК И МАГАЗИН
function buyPlayer(idx) {
    const p = gameState.marketPlayers[idx];
    const price = p.skill * 10;
    if (gameState.coins < price) return alert('Недостаточно монет!');

    gameState.coins -= price;
    gameState.reserve.push(p);
    gameState.marketPlayers.splice(idx, 1);
    renderAll();
    alert(`Игрок ${p.name} куплен и отправлен в Резерв!`);
}

function buyStorePack(type, price) {
    if (gameState.coins < price) return alert('Недостаточно монет!');
    gameState.coins -= price;

    const count = type === 'bronze' ? 1 : (type === 'silver' ? 3 : 5);
    for (let i = 0; i < count; i++) {
        gameState.reserve.push(generatePlayer());
    }
    renderAll();
    alert(`Вы успешно купили ${type} пак! Игроки добавлены в Резерв.`);
}

function changeFormation(val) {
    gameState.tactics = val;
    renderPitch();
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    document.getElementById('nav-' + tabId.replace('-tab', '')).classList.add('active');
}

// Запуск при загрузке страницы
document.getElementById('setup-screen').style.display = 'flex';
        
