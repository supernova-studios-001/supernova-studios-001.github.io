// ==========================================
// SISTEMA DE RECOMPENSAS DIARIAS
// ==========================================
const DAILY_REWARDS_CONFIG = [
  { day: 1, tokens: 30, stars: 0 },
  { day: 2, tokens: 40, stars: 0 },
  { day: 3, tokens: 50, stars: 0 },
  { day: 4, tokens: 60, stars: 0 },
  { day: 5, tokens: 70, stars: 0 },
  { day: 6, tokens: 90, stars: 0 },
  { day: 7, tokens: 120, stars: 1 }
];

function initDailyStreakSystem() {
  const todayStr = new Date().toISOString().split('T')[0];
  let lastLoginDate = localStorage.getItem('last_login_date');
  let currentDayInCycle = parseInt(localStorage.getItem('weekly_reward_day') || '1', 10);
  let claimedDays = JSON.parse(localStorage.getItem('claimed_daily_days') || '[]');
  let shieldCount = parseInt(localStorage.getItem('shield_count') || '0', 10);
  let streak = parseInt(localStorage.getItem('user_streak') || '0', 10);

  if (lastLoginDate !== todayStr) {
    if (lastLoginDate) {
      const dLast = new Date(lastLoginDate + 'T00:00:00Z');
      const dToday = new Date(todayStr + 'T00:00:00Z');
      const diffDays = Math.round((dToday - dLast) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak += 1;
      } else if (diffDays > 1) {
        if (shieldCount > 0) {
          shieldCount -= 1;
          localStorage.setItem('shield_count', shieldCount.toString());
          streak += 1;
        } else {
          streak = 1;
          currentDayInCycle = 1;
          claimedDays = [];
        }
      }
    } else {
      streak = 1;
      currentDayInCycle = 1;
    }

    localStorage.setItem('last_login_date', todayStr);
    localStorage.setItem('user_streak', streak.toString());
  }

  if (typeof updateUIStats === 'function') updateUIStats();
  renderWeeklyRewards();
}

function calculateDailyStreak() {
  initDailyStreakSystem();
}

function renderWeeklyRewards() {
  const gridContainer = document.getElementById('bing-rewards-grid');
  if (!gridContainer) return;

  const currentDayInCycle = parseInt(localStorage.getItem('weekly_reward_day') || '1', 10);
  const claimedDays = JSON.parse(localStorage.getItem('claimed_daily_days') || '[]');
  const todayStr = new Date().toISOString().split('T')[0];
  const lastClaimDate = localStorage.getItem('last_claim_date');
  const alreadyClaimedToday = (lastClaimDate === todayStr);

  let htmlBuffer = '';
  for (let i = 1; i <= 7; i++) {
    const reward = DAILY_REWARDS_CONFIG[i - 1];
    let icon = `+${reward.tokens} 🪙`;
    if (i === 7) icon = `⭐ +${reward.tokens} 🪙`;

    let btnClass = 'bing-reward-btn';
    let isDisabled = 'disabled';
    let clickAction = '';
    let subText = `Día ${i}`;

    if (claimedDays.includes(i)) {
      btnClass += ' claimed';
      icon = '✓ Reclamado';
    } else if (i === currentDayInCycle && !alreadyClaimedToday) {
      btnClass += ' available today';
      isDisabled = '';
      clickAction = `onclick="claimDailyReward(${i})"`;
    } else {
      btnClass += ' locked';
    }

    htmlBuffer += `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
        <button type="button" class="${btnClass}" ${isDisabled} ${clickAction}>
          <span style="font-size: 0.75rem; color: #94a3b8;">${subText}</span>
          <span>${icon}</span>
        </button>
      </div>`;
  }
  gridContainer.innerHTML = htmlBuffer;
}

function claimDailyReward(dayNumber) {
  const todayStr = new Date().toISOString().split('T')[0];
  let lastClaimDate = localStorage.getItem('last_claim_date');

  if (lastClaimDate === todayStr) return;

  const reward = DAILY_REWARDS_CONFIG[dayNumber - 1];
  if (!reward) return;

  let tokens = parseInt(localStorage.getItem('user_tokens') || '0', 10);
  let stars = parseInt(localStorage.getItem('user_stars') || '0', 10);
  let claimedDays = JSON.parse(localStorage.getItem('claimed_daily_days') || '[]');
  let currentDayInCycle = parseInt(localStorage.getItem('weekly_reward_day') || '1', 10);

  tokens += reward.tokens;
  stars += reward.stars;

  claimedDays.push(dayNumber);
  localStorage.setItem('claimed_daily_days', JSON.stringify(claimedDays));
  localStorage.setItem('last_claim_date', todayStr);
  localStorage.setItem('user_tokens', tokens.toString());
  localStorage.setItem('user_stars', stars.toString());

  let nextDay = currentDayInCycle + 1;
  if (nextDay > 7) {
    nextDay = 1;
    localStorage.setItem('claimed_daily_days', JSON.stringify([]));
  }
  localStorage.setItem('weekly_reward_day', nextDay.toString());

  if (typeof updateUIStats === 'function') updateUIStats();
  renderWeeklyRewards();

  let streak = parseInt(localStorage.getItem('user_streak') || '0', 10);
  let shieldCount = parseInt(localStorage.getItem('shield_count') || '0', 10);
  if (typeof syncUserDataWithDB === 'function') {
    syncUserDataWithDB({ streak, tokens, stars, shield_count: shieldCount });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initDailyStreakSystem();
});

// ==========================================
// SISTEMA DE RECOMPENSAS POR TIEMPO DE NAVEGACIÓN
// ==========================================
const TIME_REWARDS_CONFIG = [
  { id: 1, minReq: 5,  tokens: 10, label: '5 min' },
  { id: 2, minReq: 10, tokens: 20, label: '10 min' },
  { id: 3, minReq: 20, tokens: 30, label: '20 min' },
  { id: 4, minReq: 30, tokens: 40, label: '30 min' },
  { id: 5, minReq: 40, tokens: 50, label: '40 min' },
  { id: 6, minReq: 50, tokens: 60, label: '50 min' },
  { id: 7, minReq: 60, tokens: 70, label: '1 hr' }
];

let navigatedSecondsToday = 0;
let claimedTimeRewardsToday = [];
let navigationTimer = null;

function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function loadTimeNavigationState() {
  const todayStr = getTodayDateString();
  const lastNavDate = localStorage.getItem('sn_nav_date');

  if (lastNavDate !== todayStr) {
    navigatedSecondsToday = 0;
    claimedTimeRewardsToday = [];
    localStorage.setItem('sn_nav_date', todayStr);
    localStorage.setItem('sn_nav_seconds', '0');
    localStorage.setItem('sn_nav_claimed', JSON.stringify([]));
  } else {
    navigatedSecondsToday = parseInt(localStorage.getItem('sn_nav_seconds') || '0', 10);
    claimedTimeRewardsToday = JSON.parse(localStorage.getItem('sn_nav_claimed') || '[]');
  }

  updateTimeDisplay();
  renderTimeRewardsGrid();
}

function updateTimeDisplay() {
  const displayEl = document.getElementById('time-navigated-display');
  if (!displayEl) return;

  const mins = Math.floor(navigatedSecondsToday / 60);
  const secs = navigatedSecondsToday % 60;
  displayEl.textContent = `${mins}m ${secs}s`;
}

function startTimeNavigationTracker() {
  loadTimeNavigationState();

  if (navigationTimer) clearInterval(navigationTimer);

  navigationTimer = setInterval(() => {
    const todayStr = getTodayDateString();
    if (localStorage.getItem('sn_nav_date') !== todayStr) {
      loadTimeNavigationState();
    }

    navigatedSecondsToday++;
    localStorage.setItem('sn_nav_seconds', navigatedSecondsToday.toString());

    updateTimeDisplay();
    renderTimeRewardsGrid();
  }, 1000);
}

function renderTimeRewardsGrid() {
  const container = document.getElementById('time-rewards-grid');
  if (!container) return;

  const totalMinutes = Math.floor(navigatedSecondsToday / 60);

  container.innerHTML = TIME_REWARDS_CONFIG.map(step => {
    const isClaimed = claimedTimeRewardsToday.includes(step.id);
    const isUnlocked = totalMinutes >= step.minReq;

    let statusClass = 'locked';
    let btnText = `+${step.tokens} 🪙`;
    let subText = step.label;

    if (isClaimed) {
      statusClass = 'claimed';
      btnText = '✓ OK';
    } else if (isUnlocked) {
      statusClass = 'available';
    }

    return `
      <button 
        type="button" 
        class="bing-reward-btn ${statusClass}" 
        onclick="claimTimeReward(${step.id})"
        ${!isUnlocked || isClaimed ? 'disabled' : ''}
        title="${step.label} (${step.tokens} tokens)"
      >
        <span style="font-size: 0.72rem; opacity: 0.8;">${subText}</span>
        <span>${btnText}</span>
      </button>
    `;
  }).join('');
}

function claimTimeReward(rewardId) {
  const reward = TIME_REWARDS_CONFIG.find(r => r.id === rewardId);
  if (!reward) return;

  const totalMinutes = Math.floor(navigatedSecondsToday / 60);
  if (totalMinutes < reward.minReq) return;
  if (claimedTimeRewardsToday.includes(rewardId)) return;

  claimedTimeRewardsToday.push(rewardId);
  localStorage.setItem('sn_nav_claimed', JSON.stringify(claimedTimeRewardsToday));

  let tokens = parseInt(localStorage.getItem('user_tokens') || '0', 10);
  tokens += reward.tokens;
  localStorage.setItem('user_tokens', tokens.toString());

  if (typeof updateUIStats === 'function') updateUIStats();
  if (typeof syncUserDataWithDB === 'function') {
    syncUserDataWithDB({ tokens });
  }
  renderTimeRewardsGrid();
}

document.addEventListener('DOMContentLoaded', () => {
  startTimeNavigationTracker();
});