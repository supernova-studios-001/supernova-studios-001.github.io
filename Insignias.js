// ==========================================
// SISTEMA DE INSIGNIAS Y EMBLEMAS
// ==========================================
const BADGES_CONFIG = [
  {
    id: 'badge_1_day',
    title: 'Nuevo Jugador',
    req: '1 día de racha',
    reward: '+30 🪙',
    tokens: 30,
    stars: 0,
    icon: '🌱',
    checkUnlock: () => parseInt(localStorage.getItem('user_streak') || '0', 10) >= 1
  },
  {
    id: 'badge_3_days',
    title: 'Persistente',
    req: '3 días de racha',
    reward: '+90 🪙',
    tokens: 90,
    stars: 0,
    icon: '🔥',
    checkUnlock: () => parseInt(localStorage.getItem('user_streak') || '0', 10) >= 3
  },
  {
    id: 'badge_7_days',
    title: 'Semana Perfecta',
    req: '7 días de racha',
    reward: '+120 🪙 + 1 ⭐',
    tokens: 120,
    stars: 1,
    icon: '⭐',
    checkUnlock: () => parseInt(localStorage.getItem('user_streak') || '0', 10) >= 7
  },
  {
    id: 'badge_15_days',
    title: 'Guerrero Estelar',
    req: '15 días de racha',
    reward: '+2 ⭐',
    tokens: 0,
    stars: 2,
    icon: '🛡️',
    checkUnlock: () => parseInt(localStorage.getItem('user_streak') || '0', 10) >= 15
  },
  {
    id: 'badge_30_days',
    title: 'Maestro del Cosmos',
    req: '1 mes de racha',
    reward: '+500 🪙 + 3 ⭐',
    tokens: 500,
    stars: 3,
    icon: '🌌',
    checkUnlock: () => parseInt(localStorage.getItem('user_streak') || '0', 10) >= 30
  },
  {
    id: 'badge_90_days',
    title: 'Leyenda de Supernova',
    req: '3 meses de racha',
    reward: '+1,500 🪙 + 5 ⭐',
    tokens: 1500,
    stars: 5,
    icon: '👑',
    checkUnlock: () => parseInt(localStorage.getItem('user_streak') || '0', 10) >= 90
  },
  {
    id: 'badge_180_days',
    title: 'Titán del Saber',
    req: '6 meses de racha',
    reward: '+3,000 🪙 + 10 ⭐',
    tokens: 3000,
    stars: 10,
    icon: '⚡',
    checkUnlock: () => parseInt(localStorage.getItem('user_streak') || '0', 10) >= 180
  }
];

let currentBadgeFilter = 'all';

function getClaimedBadges() {
  try {
    return JSON.parse(localStorage.getItem('claimed_badges') || '[]');
  } catch (e) {
    return [];
  }
}

function setBadgeFilter(filterType) {
  currentBadgeFilter = filterType;

  document.querySelectorAll('.badge-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filterType);
  });

  renderUserBadges();
}

function claimBadgeReward(badgeId) {
  const badge = BADGES_CONFIG.find(b => b.id === badgeId);
  if (!badge || !badge.checkUnlock()) return;

  const claimed = getClaimedBadges();
  if (claimed.includes(badgeId)) return;

  const currentTokens = parseInt(localStorage.getItem('user_tokens') || '0', 10);
  const currentStars = parseInt(localStorage.getItem('user_stars') || '0', 10);

  const newTokens = currentTokens + (badge.tokens || 0);
  const newStars = currentStars + (badge.stars || 0);

  localStorage.setItem('user_tokens', newTokens.toString());
  localStorage.setItem('user_stars', newStars.toString());

  claimed.push(badgeId);
  localStorage.setItem('claimed_badges', JSON.stringify(claimed));

  if (typeof syncUserDataWithDB === 'function') {
    syncUserDataWithDB({ tokens: newTokens, stars: newStars });
  } else if (typeof updateUIStats === 'function') {
    updateUIStats();
  }

  renderUserBadges();
}

function renderUserBadges() {
  const container = document.getElementById('user-badges-list');
  if (!container) return;

  const claimed = getClaimedBadges();

  // Calcular contadores para los botones de filtro
  const earnedCount = BADGES_CONFIG.filter(b => b.checkUnlock()).length;
  const incompleteCount = BADGES_CONFIG.length - earnedCount;

  const countAllEl = document.getElementById('count-badges-all');
  const countEarnedEl = document.getElementById('count-badges-earned');
  const countIncompleteEl = document.getElementById('count-badges-incomplete');

  if (countAllEl) countAllEl.textContent = BADGES_CONFIG.length;
  if (countEarnedEl) countEarnedEl.textContent = earnedCount;
  if (countIncompleteEl) countIncompleteEl.textContent = incompleteCount;

  // Filtrar según la pestaña activa
  const filteredBadges = BADGES_CONFIG.filter(badge => {
    const isUnlocked = badge.checkUnlock();
    if (currentBadgeFilter === 'earned') return isUnlocked;
    if (currentBadgeFilter === 'incomplete') return !isUnlocked;
    return true;
  });

  if (filteredBadges.length === 0) {
    const emptyMsg =
      currentBadgeFilter === 'earned'
        ? 'Aún no has completado ninguna insignia. ¡Mantén tu racha diaria para desbloquearlas!'
        : '¡Increíble! Ya has completado todas las insignias disponibles.';
    container.innerHTML = `<div class="badges-empty-state">${emptyMsg}</div>`;
    return;
  }

  container.innerHTML = filteredBadges.map(badge => {
    const isUnlocked = badge.checkUnlock();
    const isClaimed = claimed.includes(badge.id);

    let itemClass = 'badge-item locked';
    let buttonHTML = `<button type="button" class="badge-claim-btn locked" disabled>Bloqueado</button>`;

    if (isClaimed) {
      itemClass = 'badge-item claimed';
      buttonHTML = `<button type="button" class="badge-claim-btn claimed" disabled>✓ Reclamado</button>`;
    } else if (isUnlocked) {
      itemClass = 'badge-item unlocked';
      buttonHTML = `<button type="button" class="badge-claim-btn ready" onclick="claimBadgeReward('${badge.id}')">Reclamar</button>`;
    }

    return `
      <div class="${itemClass}">
        <div class="badge-left-group">
          <div class="badge-icon-box">${badge.icon}</div>
          <div class="badge-info-box">
            <div class="badge-title">${badge.title}</div>
            <div class="badge-req">${badge.req} <span class="badge-reward">(${badge.reward})</span></div>
          </div>
        </div>
        ${buttonHTML}
      </div>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderUserBadges();
});