let gameState = {
    clubName: '',
    coins: 1000,
    mainSquad: [],
    subs: [],
    reserve: [],
    leagueTable: [],
    schedule: [],
    currentTour: 0,
    tactics: '4-3-3'
};

function initClub() {
    const name = document.getElementById('club-name-input').value;
    if (!name) return alert('Введите название!');
    gameState.clubName = name;
    document.getElementById('club-display').innerText = name;
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('pack-screen').style.display = 'flex';
    openPackStep(1);
}

function openPackStep(step) {
    const content = document.getElementById('pack-content');
    content.innerHTML = '';
    const count = (step === 1) ? 11 : 7;
    for(let i=0; i<count; i++) {
        const p = generatePlayer();
        if (step === 1) gameState.mainSquad.push(p);
        else gameState.subs.push(p);
        content.innerHTML += `<div class="card" style="position:static">${p.name}<img src="${p.avatar}" class="player-avatar"></div>`;
    }
}

function nextPackStep() {
    const modal = document.getElementById('pack-modal');
    if (modal.dataset.step !== 'done') {
        modal.dataset.step = 'done';
        openPackStep(2);
        document.getElementById('pack-title').innerText = 'Запасные (7 игроков)';
    } else {
        document.getElementById('pack-screen').style.display = 'none';
        startTutorial();
    }
}

function generatePlayer() {
    const id = Math.random().toString(36).substr(2, 9);
    const names = ['Иванов', 'Петров', 'Смирнов', 'Гарсия', 'Силва', 'Мюллер'];
    return {
        id,
        name: names[Math.floor(Math.random()*names.length)],
        position: ['GK', 'DF', 'MF', 'FW'][Math.floor(Math.random()*4)],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}&accessoriesProbability=0&style=circle&hair=shortHairShortFlat`
    };
}

function startTutorial() {
    const overlay = document.getElementById('tutorial-overlay');
    overlay.style.display = 'flex';
    // Logic for tutorial highlighting can be expanded here
}

function nextTutorial() {
    document.getElementById('tutorial-overlay').style.display = 'none';
    initLeague();
    renderAll();
}

function initLeague() {
    const teams = ['Милан', 'Бавария', 'Реал', 'ПСЖ', 'Барселона', 'МЮ', 'Сити', 'Арсенал', 'Ювентус', 'Челси', 'Ливерпуль', 'Интер', 'Атлетико', 'Боруссия', 'Бенфика', 'Порту', 'Аякс', 'Рома', 'Наполи', gameState.clubName];
    gameState.leagueTable = teams.map(name => ({ name, points: 0 }));
    // Generate simple schedule
    gameState.schedule = teams.filter(t => t !== gameState.clubName).map(t => ({ opponent: t, played: false }));
}

async function playMatch() {
    const opp = gameState.schedule[gameState.currentTour].opponent;
    document.getElementById('match-header').innerText = `${gameState.clubName} vs ${opp}`;
    const log = document.getElementById('match-log');
    log.innerHTML = `Матч против ${opp} начался!<br>`;

    // Simple match simulation
    for(let i=0; i<3; i++) {
        await new Promise(r => setTimeout(r, 1000));
        if (Math.random() > 0.7) {
            triggerOverlay("⚽ ГОЛ!", "#ffd700");
            log.innerHTML += `${gameState.clubName} забил!<br>`;
        } else if (Math.random() > 0.8) {
            triggerOverlay("🚑 ТРАВМА!", "red");
            let injured = gameState.mainSquad[0];
            log.innerHTML += `Травма: ${injured.name}. Замена!<br>`;
            // Smart auto-sub
            if (gameState.subs.length > 0) {
                let sub = gameState.subs.pop();
                gameState.mainSquad[0] = sub;
                renderPitch();
            }
        }
    }
    gameState.currentTour++;
    renderAll();
}

function triggerOverlay(text, color) {
    const ov = document.getElementById('match-event-overlay');
    ov.innerText = text;
    ov.style.color = color;
    ov.style.display = 'block';
    setTimeout(() => ov.style.display = 'none', 2000);
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
}

function renderPitch() {
    const pitch = document.getElementById('pitch');
    pitch.innerHTML = '';
    gameState.mainSquad.forEach((p, i) => {
        const el = document.createElement('div');
        el.className = 'card';
        el.style.top = (20 + (i*5)) + '%';
        el.style.left = '50%';
        el.innerHTML = `<img src="${p.avatar}" class="player-avatar">${p.name}`;
        pitch.appendChild(el);
    });
}

function renderAll() {
    renderPitch();
    // Render squad
    const squadList = document.getElementById('main-squad-list');
    squadList.innerHTML = gameState.mainSquad.map(p => `<div class="card" style="position:static">${p.name}</div>`).join('');
    // Render league table...
}

// Initial setup
document.getElementById('setup-screen').style.display = 'flex';
