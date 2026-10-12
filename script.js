// ==========================================
// CONFIGURACIÓN DE CONEXIÓN A SUPABASE Y GOOGLE OAUTH
// ==========================================
const SUPABASE_URL = 'https://zqlyzkcpzaxgigkfwls.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbGh6a2NwemF4Z21pZ2tmd2xzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MzAwNjEsImV4cCI6MjEwNTAwNjA2MX0.gb0z7WFuAbn6kxDni7vx3wczRMFLKUFuZyKx-wabcds';

// Inicialización del cliente de Supabase (requiere script CDN en HTML)
const supabaseClient =
  window.supabase && typeof window.supabase.createClient === 'function'
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

const GOOGLE_CLIENT_ID =
  '695556528337-katrqu8atnal1d2j9ud3t9jpjhajjhgb.apps.googleusercontent.com';
var ADMIN_EMAIL = 'correadediego30@gmail.com';

// MAPA DE CONTENIDOS PARA RECURSOS HUMANOS
const hrDataMapping = {
  seleccion: typeof hrSeleccionData !== 'undefined' ? hrSeleccionData : {},
  entrevista:
    typeof hrEntrevistaData !== 'undefined'
      ? hrEntrevistaData
      : typeof entrevistaData !== 'undefined'
      ? entrevistaData
      : {},
  induccion: typeof hrInduccionData !== 'undefined' ? hrInduccionData : {},
  documentacion:
    typeof hrDocumentacionData !== 'undefined' ? hrDocumentacionData : {},
  nomina: typeof hrNominaData !== 'undefined' ? hrNominaData : {},
  sst: typeof hrSSTData !== 'undefined' ? hrSSTData : {}
};

// ESTADO GLOBAL
let currentUser = localStorage.getItem('username') || '';
let currentUserEmail = localStorage.getItem('user_email') || ADMIN_EMAIL;
let currentEnglishLevel = 'B1';
let currentHRTopic = 'seleccion';
let currentSubject = 'english';

// ==========================================
// FUNCIONES DE UTILIDAD Y SEGURIDAD
// ==========================================
function escapeHTML(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sanitizeURL(url) {
  if (!url) return '#';
  const clean = String(url).trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return escapeHTML(clean);
  }
  return '#';
}

function generateDefaultUsername() {
  const randomId = Math.floor(1000 + Math.random() * 9000);
  return `Usuario_${randomId}`;
}

function isUserAdmin(email, name) {
  return (
    email === ADMIN_EMAIL || name === 'AdminSuperNova' || name === 'Admin'
  );
}

// ==========================================
// CONEXIÓN CON SUPABASE (PERSISTENCIA Y SINCRONIZACIÓN REMOTA)
// ==========================================
async function syncUserDataWithDB(userData) {
  try {
    if (!supabaseClient) {
      console.warn('Supabase JS Client no disponible. Modo local activado.');
      updateUIStats();
      return;
    }

    const {
      data: { user }
    } = await supabaseClient.auth.getUser();

    const payload = {
      username: userData.username || currentUser,
      email: userData.email || currentUserEmail,
      streak: parseInt(localStorage.getItem('user_streak') || '0', 10),
      tokens: parseInt(localStorage.getItem('user_tokens') || '0', 10),
      stars: parseInt(localStorage.getItem('user_stars') || '0', 10),
      shield_count: parseInt(localStorage.getItem('shield_count') || '0', 10),
      last_login_date:
        localStorage.getItem('last_login_date') ||
        new Date().toISOString().split('T')[0]
    };

    if (user) {
      payload.id = user.id; // Vinculación UUID con Supabase Auth
    }

    const { data, error } = await supabaseClient
      .from('user_profiles')
      .upsert(payload, { onConflict: 'email' });

    if (error) {
      console.error('Error al sincronizar datos en Supabase:', error.message);
    } else {
      console.log('Datos sincronizados correctamente con Supabase.');
    }
    updateUIStats();
  } catch (err) {
    console.warn('Modo offline / Error de conexión con Supabase:', err);
  }
}

// ==========================================
// CONTADOR REGRESIVO DEL EVENTO DE HALLOWEEN
// ==========================================
function initEventModal() {
  const timerElem = document.getElementById('collab-timer');
  if (!timerElem) return;

  // Fecha límite: 5 de Noviembre a las 23:59:59
  const targetDate = new Date('2026-11-05T23:59:59').getTime();

  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      timerElem.innerText = "¡El evento ha finalizado!";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    timerElem.innerText = `El evento termina en: ${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// ==========================================
// INICIALIZACIÓN DEL DOCUMENTO (DOM READY)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('Script de Supernova Studios inicializado.');
  const welcomeScreen = document.getElementById('welcome-screen');
  const usernameInput = document.getElementById('username');
  const userEmailInput = document.getElementById('user-email');

  if (!currentUser) {
    currentUser = generateDefaultUsername();
    localStorage.setItem('username', currentUser);
  }

  if (localStorage.getItem('user_logged_in') === 'true' && currentUser) {
    if (welcomeScreen) welcomeScreen.style.display = 'none';
    if (usernameInput) usernameInput.value = currentUser;
    if (userEmailInput) userEmailInput.value = currentUserEmail;
    calculateDailyStreak();
  } else {
    if (welcomeScreen) welcomeScreen.style.display = 'flex';
  }

  initGoogleSignIn();
  updateUIStats();
  initEventModal();
});

// ==========================================
// GOOGLE SIGN-IN Y AUTENTICACIÓN
// ==========================================
function initGoogleSignIn() {
  if (window.google && google.accounts) {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredentialResponse,
      auto_select: false
    });
    const btnContainer = document.getElementById('google-btn-container');
    if (btnContainer) {
      google.accounts.id.renderButton(btnContainer, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'continue_with',
        shape: 'rectangular',
        width: 300
      });
    }
  } else {
    setTimeout(initGoogleSignIn, 300);
  }
}

function handleGoogleCredentialResponse(response) {
  try {
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    const googleUserName = payload.name || generateDefaultUsername();
    const email = payload.email || ADMIN_EMAIL;
    completeLogin(googleUserName, email, response.credential);
  } catch (e) {
    console.error('Error procesando credenciales de Google:', e);
    completeLogin(generateDefaultUsername(), ADMIN_EMAIL);
  }
}

function loginManual() {
  const input = document.getElementById('manual-user-input');
  const val = input ? input.value.trim() : '';
  const assignedUser = val ? val : generateDefaultUsername();
  completeLogin(assignedUser, ADMIN_EMAIL);
}

function completeLogin(name, email, idToken = null) {
  currentUser = name;
  currentUserEmail = email || ADMIN_EMAIL;
  localStorage.setItem('username', currentUser);
  localStorage.setItem('user_email', currentUserEmail);
  localStorage.setItem('user_logged_in', 'true');

  const usernameInput = document.getElementById('username');
  const userEmailInput = document.getElementById('user-email');
  const welcomeScreen = document.getElementById('welcome-screen');

  if (usernameInput) usernameInput.value = currentUser;
  if (userEmailInput) userEmailInput.value = currentUserEmail;
  if (welcomeScreen) welcomeScreen.style.display = 'none';

  calculateDailyStreak();
  syncUserDataWithDB({
    username: currentUser,
    email: currentUserEmail,
    id_token: idToken
  });
}

function saveUsername(val) {
  if (val && val.trim()) {
    currentUser = val.trim();
    localStorage.setItem('username', currentUser);
    syncUserDataWithDB({ username: currentUser, email: currentUserEmail });
  }
}

function logout() {
  localStorage.removeItem('user_logged_in');
  localStorage.removeItem('username');
  localStorage.removeItem('user_email');
  location.reload();
}

// ==========================================
// NAVEGACIÓN Y PESTAÑAS
// ==========================================
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  document.querySelectorAll('.nav-btn, .nav-item, .tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  const targetId = tabId.startsWith('tab-') ? tabId : 'tab-' + tabId;
  const activeTab = document.getElementById(targetId);
  if (activeTab) {
    activeTab.classList.add('active');
  }

  const cleanTabId = tabId.replace('tab-', '');
  const activeBtn = document.querySelector(`[onclick="switchTab('${cleanTabId}')"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
}

// ==========================================
// ESTADÍSTICAS Y CALENDARIO MENSUAL DE RACHA (CON HALLOWEEN 1.5x)
// ==========================================
function calculateDailyStreak() {
  let streak = parseInt(localStorage.getItem('user_streak') || '0', 10);
  let tokens = parseInt(localStorage.getItem('user_tokens') || '0', 10);
  let stars = parseInt(localStorage.getItem('user_stars') || '0', 10);
  let shieldCount = parseInt(localStorage.getItem('shield_count') || '0', 10);
  let lastLoginDate = localStorage.getItem('last_login_date');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Comprobar si el evento de Halloween está activo (antes del 5 de Noviembre de 2026)
  const isHalloweenActive = now.getTime() < new Date('2026-11-05T23:59:59').getTime();

  if (!lastLoginDate) {
    streak = 1;
    let baseReward = 20;
    let finalReward = isHalloweenActive ? Math.floor(baseReward * 1.5) : baseReward;
    tokens += finalReward;
    localStorage.setItem('last_login_date', todayStr);
  } else if (lastLoginDate !== todayStr) {
    const dLast = new Date(lastLoginDate + 'T00:00:00Z');
    const dToday = new Date(todayStr + 'T00:00:00Z');
    const diffDays = Math.round((dToday - dLast) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak += 1;
      let baseReward = Math.min(20 + (streak - 1) * 10, 250);
      if (streak % 7 === 0) {
        baseReward += 50;
        stars += 1;
      }
      // Aplicar multiplicador 1.5x durante Halloween
      let finalReward = isHalloweenActive ? Math.floor(baseReward * 1.5) : baseReward;
      tokens += finalReward;
    } else if (diffDays > 1) {
      if (shieldCount > 0) {
        shieldCount -= 1;
        localStorage.setItem('shield_count', shieldCount.toString());
        console.log('¡Protector de racha activado! La racha no se perdió.');
      } else {
        streak = 1;
        let baseReward = 20;
        let finalReward = isHalloweenActive ? Math.floor(baseReward * 1.5) : baseReward;
        tokens += finalReward;
      }
    }
    localStorage.setItem('last_login_date', todayStr);
  }

  localStorage.setItem('user_streak', streak.toString());
  localStorage.setItem('user_tokens', tokens.toString());
  localStorage.setItem('user_stars', stars.toString());
  syncUserDataWithDB({ streak, tokens, stars, shield_count: shieldCount });
  renderMonthlyCalendar();
}

function updateUIStats() {
  let streak = localStorage.getItem('user_streak') || '0';
  let tokens = localStorage.getItem('user_tokens') || '0';
  let stars = localStorage.getItem('user_stars') || '0';
  let shields = localStorage.getItem('shield_count') || '0';

  const streakElem = document.getElementById('streak-days');
  const tokensElem = document.getElementById('user-tokens');
  const starsElem = document.getElementById('user-stars');
  const starsInvElem = document.getElementById('user-stars-inv');
  const shieldDisplay = document.getElementById('shield-count-display');

  if (streakElem) streakElem.innerText = streak;
  if (tokensElem) tokensElem.innerText = parseInt(tokens, 10).toLocaleString();
  if (starsElem) starsElem.innerText = stars;
  if (starsInvElem) starsInvElem.innerText = stars;
  if (shieldDisplay) shieldDisplay.innerText = `Cantidad: ${shields} / 3`;
}

function renderMonthlyCalendar() {
  const gridContainer = document.getElementById('monthly-calendar-grid');
  const monthTitle = document.getElementById('calendar-month-name');
  if (!gridContainer) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDay = now.getDate();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  if (monthTitle) monthTitle.innerText = `${monthNames[month]} ${year}`;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const userStreak = parseInt(localStorage.getItem('user_streak') || '1', 10);
  const startClaimedDay = Math.max(1, todayDay - userStreak + 1);

  // Comprobar si el evento de Halloween está activo para reflejarlo en el calendario
  const isHalloweenActive = now.getTime() < new Date('2026-11-05T23:59:59').getTime();

  let htmlBuffer = '';
  for (let day = 1; day <= daysInMonth; day++) {
    let baseReward = Math.min(20 + (day - 1) * 10, 250);
    let icon = '';
    let extraClass = '';

    if (day % 7 === 0) {
      baseReward += 50;
      icon = '⭐';
      extraClass += ' milestone';
    }

    // Aplicar el multiplicador 1.5x en el texto del calendario si Halloween está activo
    let reward = isHalloweenActive ? Math.floor(baseReward * 1.5) : baseReward;

    if (day >= startClaimedDay && day <= todayDay) {
      extraClass += ' claimed';
      icon = '✔';
    } else if (day < todayDay) {
      extraClass += ' missed';
      icon = '❌';
    }

    if (day === todayDay) {
      extraClass += ' today';
    }

    htmlBuffer += `
      <div class="calendar-card ${extraClass.trim()}">
        <span class="day-number">Día ${day}</span>
        <span class="reward-icon">${icon}</span>
        <span class="reward-tokens">+${reward} Tokens</span>
      </div>`;
  }
  gridContainer.innerHTML = htmlBuffer;
}

// ==========================================
// CENTRO DE APRENDIZAJE Y MATERIAS
// ==========================================
function handleSubjectChange(subject) {
  currentSubject = subject;
  const englishMod = document.getElementById('english-module');
  const hrMod = document.getElementById('hr-module');
  const comingSoon = document.getElementById('subject-coming-soon');

  closeTopicDisplay();
  closeHRTopicDisplay();

  if (subject === 'english') {
    if (comingSoon) comingSoon.style.display = 'none';
    if (hrMod) hrMod.style.display = 'none';
    if (englishMod) englishMod.style.display = 'block';
    selectEnglishLevel(currentEnglishLevel || 'B1');
  } else if (subject === 'hr') {
    if (comingSoon) comingSoon.style.display = 'none';
    if (englishMod) englishMod.style.display = 'none';
    if (hrMod) hrMod.style.display = 'block';
    selectHRTopic(currentHRTopic || 'seleccion');
  } else if (
    ['biology', 'physics', 'chemistry', 'math', 'spanish', 'code'].includes(subject)
  ) {
    if (englishMod) englishMod.style.display = 'none';
    if (hrMod) hrMod.style.display = 'none';
    if (comingSoon) comingSoon.style.display = 'block';
  } else {
    if (englishMod) englishMod.style.display = 'none';
    if (hrMod) hrMod.style.display = 'none';
    if (comingSoon) comingSoon.style.display = 'none';
  }
}

// MÓDULO DE INGLÉS
function selectEnglishLevel(level) {
  currentEnglishLevel = level;
  const targetKey = String(level).trim().toLowerCase();
  const buttons = document.querySelectorAll('#english-module .btn-level');

  buttons.forEach(btn => {
    let btnLevel = btn.getAttribute('data-level');
    if (!btnLevel) {
      const text = btn.innerText.trim().toLowerCase();
      if (text.includes('pre-a1') || text.includes('pre a1')) btnLevel = 'prea1';
      else if (text.includes('a1')) btnLevel = 'a1';
      else if (text.includes('a2')) btnLevel = 'a2';
      else if (text.includes('b1')) btnLevel = 'b1';
      else if (text.includes('b2')) btnLevel = 'b2';
      else if (text.includes('c1')) btnLevel = 'c1';
      else if (text.includes('c2')) btnLevel = 'c2';
      else btnLevel = text;
    } else {
      btnLevel = btnLevel.trim().toLowerCase();
    }

    if (btnLevel === targetKey) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const levelTitle = document.getElementById('level-title');
  if (levelTitle) levelTitle.innerText = `Temas Disponibles Nivel ${level}`;

  closeTopicDisplay();
  renderTopics(
    level,
    typeof englishLessonsData !== 'undefined' ? englishLessonsData : {}
  );
}

function renderTopics(key, dataSource) {
  const grid = document.getElementById('topics-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const lessons =
    typeof dataSource !== 'undefined' && dataSource[key] ? dataSource[key] : [];

  if (lessons.length === 0) {
    grid.innerHTML =
      '<p style="grid-column: 1/-1; color: var(--text-secondary); text-align:center; padding: 20px;">No hay temas disponibles para este módulo por el momento.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();
  lessons.forEach(lesson => {
    const card = document.createElement('div');
    card.className = 'topic-card';
    card.onclick = () => loadTopicContent(lesson.id, key, dataSource);
    card.innerHTML = `
      <h5 style="margin-bottom: 6px; font-size:1rem; color:var(--text-primary);">${escapeHTML(lesson.title)}</h5>
      <p style="font-size:0.85rem; color:var(--text-secondary);">${escapeHTML(lesson.summary)}</p>`;
    fragment.appendChild(card);
  });
  grid.appendChild(fragment);
}

function loadTopicContent(topicId, key, dataSource) {
  const topicsListSection = document.getElementById('topics-list-section');
  const topicContentDisplay = document.getElementById('topic-content-display');
  const topicLoader = document.getElementById('topic-loader');

  if (topicsListSection) topicsListSection.style.display = 'none';
  if (topicContentDisplay) topicContentDisplay.style.display = 'none';
  if (topicLoader) topicLoader.style.display = 'block';

  setTimeout(() => {
    if (topicLoader) topicLoader.style.display = 'none';
    const source =
      dataSource ||
      (typeof englishLessonsData !== 'undefined' ? englishLessonsData : {});
    const searchKey = key || currentEnglishLevel;
    const lessons =
      typeof source !== 'undefined' && source[searchKey] ? source[searchKey] : [];

    const lesson = lessons.find(l => l.id === topicId);
    if (!lesson) return;

    const articleContainer = document.getElementById('topic-article');
    if (articleContainer) {
      articleContainer.innerHTML = buildLessonHTML(lesson);
    }
    if (topicContentDisplay) topicContentDisplay.style.display = 'block';
  }, 400);
}

function closeTopicDisplay() {
  const topicContentDisplay = document.getElementById('topic-content-display');
  const topicLoader = document.getElementById('topic-loader');
  const topicsListSection = document.getElementById('topics-list-section');

  if (topicContentDisplay) topicContentDisplay.style.display = 'none';
  if (topicLoader) topicLoader.style.display = 'none';
  if (topicsListSection) topicsListSection.style.display = 'block';
}

// MÓDULO DE RECURSOS HUMANOS
function selectHRTopic(topicKey) {
  currentHRTopic = topicKey;
  const hrButtons = document.querySelectorAll('#hr-module .btn-level');

  hrButtons.forEach(btn => {
    const onclickAttr = btn.getAttribute('onclick') || '';
    if (onclickAttr.includes(topicKey)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const hrTitles = {
    seleccion: '1. Selección de Candidatos',
    entrevista: '2. Entrevista Laboral',
    induccion: '3. Inducción de Personal',
    documentacion: '4. Documentación y Procesos Técnicos',
    nomina: '5. Nómina y Compensaciones',
    sst: '6. Seguridad y Salud en el Trabajo (SST)'
  };

  const hrTitleElem = document.getElementById('hr-level-title');
  if (hrTitleElem) {
    hrTitleElem.innerText = `Temas Disponibles ${hrTitles[topicKey] || topicKey}`;
  }

  closeHRTopicDisplay();
  renderHRTopics(topicKey);
}

function renderHRTopics(topicKey) {
  const grid = document.getElementById('hr-topics-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const dataSource = hrDataMapping[topicKey] || {};
  let lessons = [];

  if (Array.isArray(dataSource)) {
    lessons = dataSource;
  } else {
    Object.keys(dataSource).forEach(k => {
      if (Array.isArray(dataSource[k])) {
        lessons = lessons.concat(dataSource[k]);
      }
    });
  }

  if (lessons.length === 0) {
    grid.innerHTML =
      '<p style="grid-column: 1/-1; color: var(--text-secondary); text-align:center; padding: 20px;">No hay lecciones cargadas para este módulo por el momento.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();
  lessons.forEach(lesson => {
    const card = document.createElement('div');
    card.className = 'topic-card';
    card.onclick = () => loadHRTopicContent(lesson, topicKey);
    card.innerHTML = `
      <h5 style="margin-bottom: 6px; font-size:1rem; color:var(--text-primary);">${escapeHTML(lesson.title)}</h5>
      <p style="font-size:0.85rem; color:var(--text-secondary);">${escapeHTML(lesson.summary || lesson.description || '')}</p>`;
    fragment.appendChild(card);
  });
  grid.appendChild(fragment);
}

function loadHRTopicContent(lesson, topicKey) {
  const hrTopicsListSection = document.getElementById('hr-topics-list-section');
  const hrTopicContentDisplay = document.getElementById('hr-topic-content-display');
  const hrTopicLoader = document.getElementById('hr-topic-loader');

  if (hrTopicsListSection) hrTopicsListSection.style.display = 'none';
  if (hrTopicContentDisplay) hrTopicContentDisplay.style.display = 'none';
  if (hrTopicLoader) hrTopicLoader.style.display = 'block';

  setTimeout(() => {
    if (hrTopicLoader) hrTopicLoader.style.display = 'none';
    const articleContainer = document.getElementById('hr-topic-article');
    if (articleContainer) {
      articleContainer.innerHTML = buildLessonHTML(lesson);
    }
    if (hrTopicContentDisplay) hrTopicContentDisplay.style.display = 'block';
  }, 400);
}

function closeHRTopicDisplay() {
  const hrTopicContentDisplay = document.getElementById('hr-topic-content-display');
  const hrTopicLoader = document.getElementById('hr-topic-loader');
  const hrTopicsListSection = document.getElementById('hr-topics-list-section');

  if (hrTopicContentDisplay) hrTopicContentDisplay.style.display = 'none';
  if (hrTopicLoader) hrTopicLoader.style.display = 'none';
  if (hrTopicsListSection) hrTopicsListSection.style.display = 'block';
}

function buildLessonHTML(lesson) {
  return `
    <h3 style="font-size: 1.4rem; margin-bottom: 8px;">${escapeHTML(lesson.title)}</h3>
    <p style="color:var(--text-secondary); margin-bottom: 16px;">${escapeHTML(lesson.description || lesson.summary || '')}</p>
    
    ${
      lesson.grammar
        ? `<div class="lesson-section" style="margin-bottom: 20px;">
            <h4 style="margin-bottom: 8px; color:var(--accent-color, #4a90e2);">Conceptos y Fundamentos</h4>
            <p style="line-height:1.5;">${escapeHTML(lesson.grammar).replace(/\n/g, '<br>')}</p>
          </div>`
        : ''
    }

    ${
      lesson.examples && lesson.examples.length > 0
        ? `<div class="lesson-section" style="margin-bottom: 20px;">
            <h4 style="margin-bottom: 8px; color:var(--accent-color, #4a90e2);">Ejemplos Prácticos Explicados</h4>
            ${lesson.examples
              .map(
                ex =>
                  `<div class="example-box" style="padding: 10px; margin-bottom:8px; border-left:3px solid var(--accent-color, #4a90e2); border-radius: 4px; background: rgba(74, 144, 226, 0.05);">${escapeHTML(
                    ex
                  )}</div>`
              )
              .join('')}
          </div>`
        : ''
    }

    ${
      lesson.vocabulary && lesson.vocabulary.length > 0
        ? `<div class="lesson-section" style="margin-bottom: 20px;">
            <h4 style="margin-bottom: 8px; color:var(--accent-color, #4a90e2);">Vocabulario e Indicadores Clave</h4>
            <div class="vocab-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap:10px;">
              ${lesson.vocabulary
                .map(
                  v => `
                <div class="vocab-card" style="padding: 10px; border-radius: 6px; border:1px solid var(--border-color, #333);">
                  <div class="vocab-word" style="font-weight: bold;">${escapeHTML(v.word)}</div>
                  ${
                    v.phonetic
                      ? `<div class="vocab-phonetic" style="font-size:0.8rem; color:var(--text-secondary);">${escapeHTML(v.phonetic)}</div>`
                      : ''
                  }
                  <div class="vocab-trans" style="font-size:0.85rem; color:var(--accent-gold, #ffd700);">${escapeHTML(v.trans || v.translation || '')}</div>
                </div>`
                )
                .join('')}
            </div>
          </div>`
        : ''
    }

    ${
      lesson.links && lesson.links.length > 0
        ? `<div class="lesson-section" style="margin-top: 20px;">
            <h4 style="margin-bottom: 8px; color:var(--accent-color, #4a90e2);">Enlaces Educativos y Fuentes Oficiales</h4>
            <ul style="list-style:none; padding:0;">
              ${lesson.links
                .map(
                  link => `
                <li style="margin-bottom: 6px;">
                  <a href="${sanitizeURL(link.url)}" target="_blank" rel="noopener noreferrer" style="color:var(--accent-gold, #ffd700); text-decoration:underline;">
                    ${escapeHTML(link.label)}
                  </a>
                </li>`
                )
                .join('')}
            </ul>
          </div>`
        : ''
    }
  `;
}

// ==========================================
// STORE / MARKETPLACE (TRUEQUE SEGURO VÍA SUPABASE RPC)
// ==========================================
async function buyItem(itemKey, cost) {
  let currentTokens = parseInt(localStorage.getItem('user_tokens') || '0', 10);
  let currentStars = parseInt(localStorage.getItem('user_stars') || '0', 10);

  // Validación si el costo es un objeto (Trueque seguro de Estrellas por Tokens)
  if (typeof cost === 'object' && cost !== null) {
    const costStars = cost.stars || 0;      // Estrellas que entrega el usuario
    const rewardTokens = cost.tokens || 0;   // Tokens que recibe el usuario

    if (currentStars < costStars) {
      alert(`No tienes suficientes estrellas. Necesitas ${costStars} ⭐ para este trueque.`);
      return;
    }

    // Si Supabase está disponible, validamos y ejecutamos mediante la función segura RPC
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.rpc('exchange_stars_for_tokens', {
          p_email: currentUserEmail,
          p_cost_stars: costStars,
          p_reward_tokens: rewardTokens
        });

        if (error) {
          console.error('Error en la función RPC de Supabase:', error.message);
          alert('Hubo un error al procesar el trueque en el servidor.');
          return;
        }

        if (data && data.success) {
          // Actualizamos el navegador con los valores reales blindados por la base de datos
          localStorage.setItem('user_tokens', data.new_tokens.toString());
          localStorage.setItem('user_stars', data.new_stars.toString());
          alert(data.message + ` Has entregado ${costStars} ⭐ y recibido ${rewardTokens.toLocaleString()} 🪙.`);
          updateUIStats();
        } else {
          alert(data ? data.message : 'No se pudo completar el trueque.');
        }
      } catch (err) {
        console.warn('Error de conexión al procesar trueque seguro:', err);
        alert('Error de red al intentar procesar el trueque.');
      }
    } else {
      // Modo local de respaldo por si no hay cliente disponible
      currentStars -= costStars;
      currentTokens += rewardTokens;
      localStorage.setItem('user_tokens', currentTokens.toString());
      localStorage.setItem('user_stars', currentStars.toString());
      alert(`¡Trueque realizado en modo local! Has entregado ${costStars} ⭐ y recibido ${rewardTokens.toLocaleString()} 🪙.`);
      updateUIStats();
      syncUserDataWithDB({ tokens: currentTokens, stars: currentStars });
    }
    return;
  }

  // Validación tradicional para compras normales con tokens (como el Protector de Racha)
  if (currentTokens < cost) {
    alert('No tienes suficientes tokens para esta compra.');
    return;
  }

  if (itemKey === 'streak_shield') {
    let shields = parseInt(localStorage.getItem('shield_count') || '0', 10);
    if (shields >= 3) {
      alert('Ya posees el límite máximo de Protectores de Racha (3).');
      return;
    }
    shields += 1;
    currentTokens -= cost;
    localStorage.setItem('shield_count', shields.toString());
    localStorage.setItem('user_tokens', currentTokens.toString());
    alert('¡Compra realizada con éxito! Protector de racha añadido.');
    updateUIStats();
    syncUserDataWithDB({ tokens: currentTokens, shield_count: shields });
  }
}
// ==========================================
// MÓDULOS EDUCATIVOS Y PRÁCTICOS DE RRHH
// ==========================================
function openHROfficeDesktop() {
  if (document.getElementById('hr-app-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'hr-app-modal';
  modal.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%);
    background: #0f172a; border: 2px solid #38bdf8; border-radius: 16px;
    width: 90%; max-width: 750px; height: 500px;
    color: #fff; z-index: 99999;
    box-shadow: 0 0 30px rgba(56, 189, 248, 0.3); font-family: sans-serif;
    display: flex; flex-direction: column; overflow: hidden;
  `;
  modal.innerHTML = `
    <div style="background: #1e293b; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155;">
      <span style="font-weight: bold; color: #38bdf8;">Sistema de Gestión Humana Supernova HR</span>
      <button onclick="document.getElementById('hr-app-modal').remove()" style="background: #ef4444; color: #fff; border: none; border-radius: 6px; padding: 5px 12px; cursor: pointer; font-weight: bold;">X Salir</button>
    </div>
    <div style="display: flex; flex: 1; overflow: hidden;">
      <div style="width: 200px; background: #1e293b; padding: 15px; border-right: 1px solid #334155; display: flex; flex-direction: column; gap: 10px;">
        <button onclick="loadHRSubModule('selection')" style="background: #0284c7; color: #fff; border: none; padding: 10px; border-radius: 8px; text-align: left; cursor: pointer;">Selección (CVs)</button>
        <button onclick="loadHRSubModule('payroll')" style="background: #334155; color: #fff; border: none; padding: 10px; border-radius: 8px; text-align: left; cursor: pointer;">Nómina / Pagos</button>
        <button onclick="loadHRSubModule('sst')" style="background: #334155; color: #fff; border: none; padding: 10px; border-radius: 8px; text-align: left; cursor: pointer;">SG-SST / Seguridad</button>
      </div>
      <div id="hr-module-content" style="flex: 1; padding: 20px; overflow-y: auto;"></div>
    </div>
  `;
  document.body.appendChild(modal);
  loadHRSubModule('selection');
}

window.loadHRSubModule = function (type) {
  const content = document.getElementById('hr-module-content');
  if (!content) return;

  if (type === 'selection') {
    content.innerHTML = `
      <h3 style="color: #38bdf8; margin-top: 0;">Módulo de Selección: Evaluar Candidato</h3>
      <p style="color: #94a3b8; font-size: 14px;">Revisa la Hoja de Vida para el puesto de <strong>Coordinador de Logística</strong> (Requiere: Profesional graduado y +2 años de experiencia).</p>
      <div style="background: #1e293b; padding: 15px; border-radius: 10px; border: 1px solid #334155; margin-bottom: 15px;">
        <p><strong>Candidato:</strong> Carlos Mendoza</p>
        <p><strong>Estudios:</strong> Licenciado en Administración</p>
        <p><strong>Experiencia:</strong> 3 años en gestión de inventarios y logística</p>
        <p><strong>Antecedentes:</strong> Verificados (OK)</p>
      </div>
      <div style="display: flex; gap: 10px;">
        <button onclick="evaluateCandidate(true)" style="background: #22c55e; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">✔ Contratar</button>
        <button onclick="evaluateCandidate(false)" style="background: #ef4444; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">X Descartar</button>
      </div>
      <div id="hr-feedback" style="margin-top: 15px; font-weight: bold;"></div>
    `;
  } else if (type === 'payroll') {
    content.innerHTML = `
      <h3 style="color: #38bdf8; margin-top: 0;">Módulo de Nómina: Cálculo Salarial</h3>
      <p style="color: #94a3b8; font-size: 14px;">Calcula el salario neto deduciendo el 4% de Salud y 4% de Pensión sobre el sueldo base ($1,000 USD).</p>
      <p>Sueldo Base: $1,000 USD</p>
      <label style="display: block; margin-bottom: 10px;">Ingresa el valor Neto a pagar: </label>
      <input type="number" id="payroll-input" placeholder="Ej: 920" style="padding: 8px; border-radius: 6px; border: 1px solid #334155; background: #0f172a; color: #fff; width: 150px;">
      <button onclick="checkPayroll()" style="background: #38bdf8; color: #000; border: none; padding: 8px 15px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-left: 10px;">Verificar</button>
      <div id="payroll-feedback" style="margin-top: 15px; font-weight: bold;"></div>
    `;
  } else if (type === 'sst') {
    content.innerHTML = `
      <h3 style="color: #38bdf8; margin-top: 0;">SG-SST: Inspección de Puesto de Trabajo</h3>
      <p style="color: #94a3b8; font-size: 14px;">Marca los riesgos detectados en la oficina de bodega:</p>
      <label style="display: block; margin: 8px 0;"><input type="checkbox" id="risk1"> Cable de alta tensión expuesto en el suelo</label>
      <label style="display: block; margin: 8px 0;"><input type="checkbox" id="risk2"> Silla ergonómica en buen estado</label>
      <label style="display: block; margin: 8px 0;"><input type="checkbox" id="risk3"> Extintor con fecha vencida</label>
      <button onclick="checkSST()" style="background: #22c55e; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 15px;">Emitir Reporte</button>
      <div id="sst-feedback" style="margin-top: 15px; font-weight: bold;"></div>
    `;
  }
};

window.evaluateCandidate = function (isAccepted) {
  const fb = document.getElementById('hr-feedback');
  if (isAccepted) {
    fb.style.color = '#22c55e';
    fb.innerHTML =
      '¡Correcto! El candidato cumple con el perfil académico y el tiempo de experiencia requerido.';
  } else {
    fb.style.color = '#ef4444';
    fb.innerHTML =
      'Incorrecto. El candidato sí cumplía con los 2 años requeridos y la titulación profesional.';
  }
};

window.checkPayroll = function () {
  const val = parseFloat(document.getElementById('payroll-input').value);
  const fb = document.getElementById('payroll-feedback');
  if (val === 920) {
    fb.style.color = '#22c55e';
    fb.innerHTML =
      '¡Excelente! $1,000 - $40 (Salud 4%) - $40 (Pensión 4%) = $920 USD.';
  } else {
    fb.style.color = '#ef4444';
    fb.innerHTML =
      'Respuesta incorrecta. Recuerda descontar en total el 8% de aportes a la seguridad social ($80).';
  }
};

window.checkSST = function () {
  const r1 = document.getElementById('risk1').checked;
  const r2 = document.getElementById('risk2').checked;
  const r3 = document.getElementById('risk3').checked;
  const fb = document.getElementById('sst-feedback');

  if (r1 && !r2 && r3) {
    fb.style.color = '#22c55e';
    fb.innerHTML =
      '¡Reporte Aprobado! Identificaste adecuadamente los 2 factores de riesgo (cable expuesto y extintor vencido).';
  } else {
    fb.style.color = '#ef4444';
    fb.innerHTML =
      'Revisa de nuevo. Solo debes marcar los elementos que representan un PELIGRO para el trabajador.';
  }
};

function openCustomerServiceModule() {
  if (document.getElementById('cafe-app-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'cafe-app-modal';
  modal.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%);
    background: #1c1917; border: 2px solid #f59e0b; border-radius: 16px;
    width: 90%; max-width: 550px; padding: 20px; color: #fff; z-index: 99999;
    box-shadow: 0 0 30px rgba(245, 158, 11, 0.3); font-family: sans-serif;
  `;
  modal.innerHTML = `
    <h3 style="color: #f59e0b; margin-top: 0;">Coffee House Atención de Reclamos</h3>
    <p style="color: #d6d3d1; font-size: 14px;">Un cliente se acerca molesto diciendo que le entregaron el pedido equivocado y tiene prisa.</p>
    <p><strong>¿Cómo respondes aplicando la comunicación asertiva?</strong></p>
    <button onclick="answerCafe(1)" style="display: block; width: 100%; text-align: left; background: #292524; color: #fff; border: 1px solid #44403c; padding: 10px; margin: 8px 0; border-radius: 8px; cursor: pointer;">A. "Cálmese, no es para tanto, espere su turno mientras reviso."</button>
    <button onclick="answerCafe(2)" style="display: block; width: 100%; text-align: left; background: #292524; color: #fff; border: 1px solid #44403c; padding: 10px; margin: 8px 0; border-radius: 8px; cursor: pointer;">B. "Lamento mucho el inconveniente. Permítame su ticket y de inmediato le entrego la orden correcta prioritariamente."</button>
    <div id="cafe-feedback" style="margin-top: 15px; font-weight: bold;"></div>
    <button onclick="document.getElementById('cafe-app-modal').remove()" style="background: #ef4444; color: #fff; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; margin-top: 10px;">Cerrar</button>
  `;
  document.body.appendChild(modal);

  window.answerCafe = function (option) {
    const fb = document.getElementById('cafe-feedback');
    if (option === 2) {
      fb.style.color = '#22c55e';
      fb.innerHTML =
        '¡Excelente! Muestras empatía, asumes la responsabilidad y das solución rápida al cliente.';
    } else {
      fb.style.color = '#ef4444';
      fb.innerHTML =
        'Respuesta incorrecta. Decirle que se calme genera mayor frustración y escala el conflicto.';
    }
  };
}

// Reinicio en cambio de pestaña para el juego 3D
const originalSwitchTab = window.switchTab;
window.switchTab = function (tabName) {
  if (typeof originalSwitchTab === 'function') {
    originalSwitchTab(tabName);
  }
  if (tabName === 'games' || tabName === 'tab-games') {
    const navDropdown = document.getElementById('nav-dropdown');
    if (navDropdown) navDropdown.blur();
    if (typeof init3DGame === 'function') setTimeout(init3DGame, 100);
  }
};