// ==========================================
// CONFIGURACIÓN DE SUPABASE Y AUTENTICACIÓN
// ==========================================
const SUPABASE_URL = 'https://wapczrprddrcakvowsox.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_zGXT9svqCACV-H7uGzOFOw_DxbSmpn3';

// Inicializar cliente de Supabase de forma segura
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const GOOGLE_CLIENT_ID =
  '695556528337-katrqu8atnal1d2j9ud3t9jpjhajjhgb.apps.googleusercontent.com';
var ADMIN_EMAIL = 'correadediego30@gmail.com';

// ESTADO GLOBAL
let currentUser = localStorage.getItem('username') || '';
let currentUserEmail = localStorage.getItem('user_email') || ADMIN_EMAIL;
let currentEnglishLevel = 'PreA1';
let currentSubject = 'matematicas';
let currentLanguage = localStorage.getItem('app_language') || 'es';

// ==========================================
// DICCIONARIO DE TRADUCCIONES (I18N) COMPLETO
// ==========================================
const TRANSLATIONS = {
  es: {
    nav_conocenos: "🚀 Conócenos",
    nav_recompensas: "🎁 Recompensas",
    nav_aprendizaje: "🧠 Aprendizaje",
    nav_marketplace: "🛒 Marketplace",
    nav_configuracion: "⚙️ Configuración",
    nav_insignias: "🏅 Insignias",
    nav_inventario: "🎒 Inventario",
    group_inicio: "🌟 Inicio",
    group_estudio: "📚 Estudio",
    group_cuenta: "👤 Cuenta",
    welcome_title: "Bienvenido a Supernova Studios",
    welcome_subtitle: "Descubre nuestra misión, visión y únete a nuestra comunidad oficial.",
    mision_title: "Nuestra Misión",
    mision_desc: "Democratizar la educación técnica y práctica mediante la creación de herramientas digitales accesibles, verídicas e interactivas que potencien el talento autodidacta a nivel global.",
    vision_title: "Nuestra Visión (2030)",
    vision_desc: "Consolidarnos como la plataforma de referencia nacional en aprendizaje adaptativo, transformando la forma en que millones de personas adquieren habilidades clave.",
    discord_title: "Comunidad Oficial",
    discord_text: "Únete a nuestro servidor para resolver dudas, ver anuncios directos y colaborar con otros miembros.",
    discord_btn: "Unirse a Discord",
    rewards_title: "Centro de Recompensas",
    rewards_subtitle: "Mantén tu racha diaria y acumula tokens por tu tiempo de estudio en la plataforma.",
    box_daily_title: "Recompensas Diarias",
    box_daily_sub: "Inicia sesión a diario.",
    box_time_title: "Tiempo de Navegación",
    box_time_sub: "Gana recompensas navegando cierto tiempo.",
    learn_title: "Centro de Aprendizaje",
    learn_subtitle: "Selecciona una materia para acceder a módulos estructurados con teoría, ejemplos y evaluadores interactivos.",
    subject_label: "Materia: ",
    subject_default: "-- Selecciona una Materia --",
    subject_math: "Matemáticas",
    store_title: "Marketplace",
    store_subtitle: "Canjea tus recursos acumulados por ventajas exclusivas para tu cuenta.",
    item1_title: "Protector de Racha",
    item1_desc: "Evita perder tu racha diaria si olvidas ingresar un día. (Máximo 3 acumulables).",
    item1_btn: "Comprar (3,000 Tokens 🪙)",
    item2_title: "Cofre Estelar Menor",
    item2_desc: "Trueque exclusivo de recursos para veteranos del conocimiento.",
    item2_btn: "Intercambiar (5 ⭐ por 800 🪙)",
    config_title: "Configuración de Usuario",
    config_subtitle: "Gestiona tu apodo público, revisa tu cuenta vinculada y controla tu sesión.",
    account_data_title: "Datos de la Cuenta",
    logout_btn: "Cerrar Sesión",
    label_username: "Nombre de usuario (Público): ",
    label_email: "Correo Electrónico (Privado): ",
    label_lang: "Idioma de la Plataforma: ",
    version_badge: "Supernova Studios • Versión Beta",
    badges_title: "Insignias y Emblemas",
    badges_subtitle: "Desbloquea logros por tu constancia y reclama recompensas adicionales.",
    badges_card_title: "Tus Logros",
    inventory_title: "Mi Inventario",
    inventory_subtitle: "Revisa los artículos especiales y recursos acumulados en tu cuenta.",
    inventory_card_title: "Recursos y Artículos Activos",
    inv_streak: "Racha Diaria",
    inv_tokens: "Tokens",
    inv_stars: "Estrellas de Racha",
    inv_shield: "Protector de Racha"
  },
  en: {
    nav_conocenos: "🚀 About Us",
    nav_recompensas: "🎁 Rewards",
    nav_aprendizaje: "🧠 Learning",
    nav_marketplace: "🛒 Marketplace",
    nav_configuracion: "⚙️ Settings",
    nav_insignias: "🏅 Badges",
    nav_inventario: "🎒 Inventory",
    group_inicio: "🌟 Home",
    group_estudio: "📚 Study",
    group_cuenta: "👤 Account",
    welcome_title: "Welcome to Supernova Studios",
    welcome_subtitle: "Discover our mission, vision and join our official community.",
    mision_title: "Our Mission",
    mision_desc: "Democratize technical and practical education by creating accessible, truthful, and interactive digital tools that empower self-taught talent globally.",
    vision_title: "Our Vision (2030)",
    vision_desc: "Establish ourselves as the national benchmark platform in adaptive learning, transforming how millions of people acquire key skills.",
    discord_title: "Official Community",
    discord_text: "Join our server to solve doubts, see direct announcements, and collaborate with other members.",
    discord_btn: "Join Discord",
    rewards_title: "Rewards Center",
    rewards_subtitle: "Maintain your daily streak and accumulate tokens for your study time on the platform.",
    box_daily_title: "Daily Rewards",
    box_daily_sub: "Log in daily.",
    box_time_title: "Browsing Time",
    box_time_sub: "Earn rewards by browsing for a certain time.",
    learn_title: "Learning Center",
    learn_subtitle: "Select a subject to access structured modules with theory, examples, and interactive evaluators.",
    subject_label: "Subject: ",
    subject_default: "-- Select a Subject --",
    subject_math: "Mathematics",
    store_title: "Marketplace",
    store_subtitle: "Redeem your accumulated resources for exclusive advantages for your account.",
    item1_title: "Streak Shield",
    item1_desc: "Avoid losing your daily streak if you forget to log in for a day. (Maximum 3 accumulable).",
    item1_btn: "Buy (3,000 Tokens 🪙)",
    item2_title: "Minor Star Chest",
    item2_desc: "Exclusive resource trade for knowledge veterans.",
    item2_btn: "Exchange (5 ⭐ for 800 🪙)",
    config_title: "User Settings",
    config_subtitle: "Manage your public nickname, check your linked account, and control your session.",
    account_data_title: "Account Data",
    logout_btn: "Log Out",
    label_username: "Username (Public): ",
    label_email: "Email (Private): ",
    label_lang: "Platform Language: ",
    version_badge: "Supernova Studios • Beta Version",
    badges_title: "Badges and Emblems",
    badges_subtitle: "Unlock achievements for your consistency and claim additional rewards.",
    badges_card_title: "Your Achievements",
    inventory_title: "My Inventory",
    inventory_subtitle: "Check special items and accumulated resources in your account.",
    inventory_card_title: "Resources and Active Items",
    inv_streak: "Daily Streak",
    inv_tokens: "Tokens",
    inv_stars: "Streak Stars",
    inv_shield: "Streak Shield"
  }
};

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

function generateDefaultUsername() {
  const randomId = Math.floor(1000 + Math.random() * 9000);
  return `Usuario_${randomId}`;
}

// ==========================================
// SINCRONIZACIÓN SEGURA CON SUPABASE (NUBE)
// ==========================================
async function syncUserDataWithDB(userData) {
  try {
    if (!supabaseClient || !currentUserEmail) return;

    // 1. Preparar datos a actualizar en la nube
    const payload = {
      email: currentUserEmail,
      username: currentUser,
      updated_at: new Date().toISOString()
    };

    if (userData.streak !== undefined) payload.streak = userData.streak;
    if (userData.tokens !== undefined) payload.tokens = userData.tokens;
    if (userData.stars !== undefined) payload.stars = userData.stars;
    if (userData.shield_count !== undefined) payload.shield_count = userData.shield_count;
    if (userData.weekly_reward_day !== undefined) payload.weekly_reward_day = userData.weekly_reward_day;
    if (userData.claimed_daily_days !== undefined) payload.claimed_daily_days = userData.claimed_daily_days;
    if (userData.last_claim_date !== undefined) payload.last_claim_date = userData.last_claim_date;
    if (userData.last_login_date !== undefined) payload.last_login_date = userData.last_login_date;

    // 2. Guardar localmente como respaldo rápido
    if (userData.streak !== undefined) localStorage.setItem('user_streak', userData.streak.toString());
    if (userData.tokens !== undefined) localStorage.setItem('user_tokens', userData.tokens.toString());
    if (userData.stars !== undefined) localStorage.setItem('user_stars', userData.stars.toString());
    if (userData.shield_count !== undefined) localStorage.setItem('shield_count', userData.shield_count.toString());

    // 3. Enviar a Supabase (Upsert basado en el correo electrónico)
    const { error } = await supabaseClient
      .from('profiles')
      .upsert(payload, { onConflict: 'email' });

    if (error) {
      console.warn('Error sincronizando con Supabase:', error.message);
    } else {
      console.log('Datos sincronizados en la nube (Supabase) con éxito.');
    }

    updateUIStats();
  } catch (err) {
    console.error('Excepción en syncUserDataWithDB:', err);
  }
}

async function fetchUserDataFromDB(email) {
  try {
    if (!supabaseClient || !email) return null;

    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.warn('Error obteniendo perfil de Supabase:', error.message);
      return null;
    }

    if (data) {
      // Cargar datos al navegador
      localStorage.setItem('username', data.username || currentUser);
      localStorage.setItem('user_email', data.email);
      localStorage.setItem('user_streak', (data.streak || 0).toString());
      localStorage.setItem('user_tokens', (data.tokens || 0).toString());
      localStorage.setItem('user_stars', (data.stars || 0).toString());
      localStorage.setItem('shield_count', (data.shield_count || 0).toString());
      localStorage.setItem('weekly_reward_day', (data.weekly_reward_day || 1).toString());
      localStorage.setItem('claimed_daily_days', JSON.stringify(data.claimed_daily_days || []));
      if (data.last_claim_date) localStorage.setItem('last_claim_date', data.last_claim_date);
      if (data.last_login_date) localStorage.setItem('last_login_date', data.last_login_date);

      currentUser = data.username || currentUser;
      updateUIStats();
    }
    return data;
  } catch (err) {
    console.error('Excepción al consultar Supabase:', err);
    return null;
  }
}

// ==========================================
// GESTIÓN DE IDIOMA (I18N)
// ==========================================
function changeLanguage(lang) {
  if (lang !== 'es' && lang !== 'en') return;
  currentLanguage = lang;
  localStorage.setItem('app_language', lang);
  
  const langSelect = document.getElementById('language-select');
  if (langSelect) langSelect.value = lang;

  applyLanguageTexts();
  console.log(`Idioma cambiado a: ${lang}`);
}

function applyLanguageTexts() {
  const t = TRANSLATIONS[currentLanguage];
  if (!t) return;

  const btnConocenos = document.getElementById('sub-btn-conocenos');
  const btnRecompensas = document.getElementById('sub-btn-recompensas');
  const btnAprendizaje = document.querySelector('[onclick*="tab-learn"]');
  const btnMarketplace = document.querySelector('[onclick*="tab-store"]');
  const btnConfig = document.getElementById('sub-btn-perfil-config');
  const btnInsignias = document.getElementById('sub-btn-perfil-insignias');
  const btnInventario = document.getElementById('sub-btn-perfil-inventario');

  if (btnConocenos) btnConocenos.textContent = t.nav_conocenos;
  if (btnRecompensas) btnRecompensas.textContent = t.nav_recompensas;
  if (btnAprendizaje) btnAprendizaje.textContent = t.nav_aprendizaje;
  if (btnMarketplace) btnMarketplace.textContent = t.nav_marketplace;
  if (btnConfig) btnConfig.textContent = t.nav_configuracion;
  if (btnInsignias) btnInsignias.textContent = t.nav_insignias;
  if (btnInventario) btnInventario.textContent = t.nav_inventario;

  const groupTitles = document.querySelectorAll('.sidebar-group-title');
  if (groupTitles.length >= 3) {
    groupTitles[0].textContent = t.group_inicio;
    groupTitles[1].textContent = t.group_estudio;
    groupTitles[2].textContent = t.group_cuenta;
  }

  const tabConocenos = document.querySelector('#tab-conocenos h2');
  const tabConocenosSub = document.querySelector('#tab-conocenos .subtitle');
  if (tabConocenos) tabConocenos.textContent = t.welcome_title;
  if (tabConocenosSub) tabConocenosSub.textContent = t.welcome_subtitle;

  const misionTitle = document.querySelector('.mv-card:nth-child(1) .mv-title');
  const misionDesc = document.querySelector('.mv-card:nth-child(1) .mv-desc');
  const visionTitle = document.querySelector('.mv-card:nth-child(2) .mv-title');
  const visionDesc = document.querySelector('.mv-card:nth-child(2) .mv-desc');
  if (misionTitle) misionTitle.textContent = t.mision_title;
  if (misionDesc) misionDesc.textContent = t.mision_desc;
  if (visionTitle) visionTitle.textContent = t.vision_title;
  if (visionDesc) visionDesc.textContent = t.vision_desc;

  const discordTitle = document.querySelector('.discord-title');
  const discordText = document.querySelector('.discord-text');
  const discordBtn = document.querySelector('.btn-discord');
  if (discordTitle) discordTitle.textContent = t.discord_title;
  if (discordText) discordText.textContent = t.discord_text;
  if (discordBtn) {
    const svgHTML = discordBtn.querySelector('svg')?.outerHTML || '';
    discordBtn.innerHTML = svgHTML + ' ' + t.discord_btn;
  }

  const tabRecom = document.querySelector('#tab-recompensas h2');
  const tabRecomSub = document.querySelector('#tab-recompensas .subtitle');
  if (tabRecom) tabRecom.textContent = t.rewards_title;
  if (tabRecomSub) tabRecomSub.textContent = t.rewards_subtitle;

  const rewardsBoxes = document.querySelectorAll('#tab-recompensas .rewards-box');
  if (rewardsBoxes.length >= 2) {
    const box1Title = rewardsBoxes[0].querySelector('.rewards-box-title');
    const box1Sub = rewardsBoxes[0].querySelector('.rewards-box-subtitle');
    if (box1Title) box1Title.textContent = t.box_daily_title;
    if (box1Sub) box1Sub.textContent = t.box_daily_sub;

    const box2Title = rewardsBoxes[1].querySelector('.rewards-box-title');
    const box2Sub = rewardsBoxes[1].querySelector('.rewards-box-subtitle');
    if (box2Title) box2Title.textContent = t.box_time_title;
    if (box2Sub) box2Sub.textContent = t.box_time_sub;
  }

  const tabLearn = document.querySelector('#tab-learn h2');
  const tabLearnSub = document.querySelector('#tab-learn .subtitle');
  if (tabLearn) tabLearn.textContent = t.learn_title;
  if (tabLearnSub) tabLearnSub.textContent = t.learn_subtitle;

  const subjectLabel = document.querySelector('.subject-selection label');
  const optDefault = document.querySelector('#subject-dropdown option[value=""]');
  const optMath = document.querySelector('#subject-dropdown option[value="matematicas"]');
  if (subjectLabel) subjectLabel.textContent = t.subject_label;
  if (optDefault) optDefault.textContent = t.subject_default;
  if (optMath) optMath.textContent = t.subject_math;

  const tabStore = document.querySelector('#tab-store h2');
  const tabStoreSub = document.querySelector('#tab-store .subtitle');
  if (tabStore) tabStore.textContent = t.store_title;
  if (tabStoreSub) tabStoreSub.textContent = t.store_subtitle;

  const storeCards = document.querySelectorAll('.store-card');
  if (storeCards.length >= 2) {
    storeCards[0].querySelector('h3').textContent = t.item1_title;
    storeCards[0].querySelector('p').textContent = t.item1_desc;
    storeCards[0].querySelector('.btn-primary').textContent = t.item1_btn;

    storeCards[1].querySelector('h3').textContent = t.item2_title;
    storeCards[1].querySelector('p').textContent = t.item2_desc;
    storeCards[1].querySelector('.btn-primary').textContent = t.item2_btn;
  }

  const tabConfig = document.querySelector('#tab-perfil-config h2');
  const tabConfigSub = document.querySelector('#tab-perfil-config .subtitle');
  if (tabConfig) tabConfig.textContent = t.config_title;
  if (tabConfigSub) tabConfigSub.textContent = t.config_subtitle;

  const accountCardTitle = document.querySelector('.config-card h3');
  const logoutBtn = document.querySelector('.btn-logout-header');
  if (accountCardTitle) accountCardTitle.textContent = t.account_data_title;
  if (logoutBtn) logoutBtn.textContent = t.logout_btn;

  const labels = document.querySelectorAll('.config-card .form-group label');
  if (labels.length >= 3) {
    labels[0].textContent = t.label_username;
    labels[1].textContent = t.label_email;
    labels[2].textContent = t.label_lang;
  }

  const versionBadge = document.getElementById('app-version-badge');
  if (versionBadge) versionBadge.textContent = t.version_badge;

  const tabBadges = document.querySelector('#tab-perfil-insignias h2');
  const tabBadgesSub = document.querySelector('#tab-perfil-insignias .subtitle');
  if (tabBadges) tabBadges.textContent = t.badges_title;
  if (tabBadgesSub) tabBadgesSub.textContent = t.badges_subtitle;

  const badgesCardTitle = document.querySelector('.badges-card h3');
  if (badgesCardTitle) badgesCardTitle.textContent = t.badges_card_title;

  const tabInv = document.querySelector('#tab-perfil-inventario h2');
  const tabInvSub = document.querySelector('#tab-perfil-inventario .subtitle');
  if (tabInv) tabInv.textContent = t.inventory_title;
  if (tabInvSub) tabInvSub.textContent = t.inventory_subtitle;

  const invCardTitle = document.querySelector('.inventory-card h3');
  if (invCardTitle) invCardTitle.textContent = t.inventory_card_title;

  const invItems = document.querySelectorAll('.inventory-item');
  if (invItems.length >= 4) {
    invItems[0].querySelector('.item-info strong').textContent = t.inv_streak;
    invItems[1].querySelector('.item-info strong').textContent = t.inv_tokens;
    invItems[2].querySelector('.item-info strong').textContent = t.inv_stars;
    invItems[3].querySelector('.item-info strong').textContent = t.inv_shield;
  }
}

// ==========================================
// INICIALIZACIÓN DEL DOCUMENTO (DOM READY)
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Script de Supernova Studios inicializado.');
  const welcomeScreen = document.getElementById('welcome-screen');
  const usernameInput = document.getElementById('username');
  const userEmailInput = document.getElementById('user-email');
  const langSelect = document.getElementById('language-select');

  if (langSelect) {
    langSelect.value = currentLanguage;
  }
  applyLanguageTexts();

  if (!currentUser) {
    currentUser = generateDefaultUsername();
    localStorage.setItem('username', currentUser);
  }

  if (localStorage.getItem('user_logged_in') === 'true' && currentUserEmail) {
    if (welcomeScreen) {
      welcomeScreen.classList.add('hidden-screen');
      welcomeScreen.style.display = 'none';
    }
    // Sincronizar datos frescos desde Supabase
    await fetchUserDataFromDB(currentUserEmail);

    if (usernameInput) usernameInput.value = localStorage.getItem('username') || currentUser;
    if (userEmailInput) userEmailInput.value = currentUserEmail;
    if (typeof calculateDailyStreak === 'function') calculateDailyStreak();
  } else {
    if (welcomeScreen) {
      welcomeScreen.classList.remove('hidden-screen');
      welcomeScreen.style.display = 'flex';
    }
  }

  initGoogleSignIn();
  updateUIStats();
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

async function handleGoogleCredentialResponse(response) {
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
    await completeLogin(googleUserName, email);
  } catch (e) {
    console.error('Error procesando credenciales de Google:', e);
    await completeLogin(generateDefaultUsername(), ADMIN_EMAIL);
  }
}

async function loginManual() {
  const input = document.getElementById('manual-user-input');
  const val = input ? input.value.trim() : '';
  const assignedUser = val ? val : generateDefaultUsername();
  const email = val && val.includes('@') ? val : ADMIN_EMAIL;
  await completeLogin(assignedUser, email);
}

async function completeLogin(name, email) {
  currentUser = name;
  currentUserEmail = email || ADMIN_EMAIL;
  localStorage.setItem('username', currentUser);
  localStorage.setItem('user_email', currentUserEmail);
  localStorage.setItem('user_logged_in', 'true');

  // Buscar si ya existe en Supabase
  const existingUser = await fetchUserDataFromDB(currentUserEmail);
  if (!existingUser) {
    // Si es nuevo usuario, crear registro inicial en la nube
    await syncUserDataWithDB({
      username: currentUser,
      email: currentUserEmail,
      streak: 1,
      tokens: 0,
      stars: 0,
      shield_count: 0
    });
  }

  const usernameInput = document.getElementById('username');
  const userEmailInput = document.getElementById('user-email');
  const welcomeScreen = document.getElementById('welcome-screen');

  if (usernameInput) usernameInput.value = localStorage.getItem('username') || currentUser;
  if (userEmailInput) userEmailInput.value = currentUserEmail;
  if (welcomeScreen) {
    welcomeScreen.classList.add('hidden-screen');
    welcomeScreen.style.display = 'none';
  }

  if (typeof calculateDailyStreak === 'function') calculateDailyStreak();
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
// FUNCIONES AUXILIARES GLOBALES DE ESTADÍSTICAS
// ==========================================
function updateUIStats() {
  let streak = localStorage.getItem('user_streak') || '0';
  let tokens = localStorage.getItem('user_tokens') || '0';
  let stars = localStorage.getItem('user_stars') || '0';
  let shields = localStorage.getItem('shield_count') || '0';

  const streakElem = document.getElementById('streak-days');
  const tokensElem = document.getElementById('user-tokens');
  const starsElem = document.getElementById('user-stars');
  const shieldDisplay = document.getElementById('shield-count-display');

  if (streakElem) streakElem.innerText = streak;
  if (tokensElem) tokensElem.innerText = parseInt(tokens, 10).toLocaleString();
  if (starsElem) starsElem.innerText = stars;
  if (shieldDisplay) shieldDisplay.innerText = `Cantidad: ${shields} / 3`;
}