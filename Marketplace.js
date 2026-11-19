
// ==========================================
// STORE / MARKETPLACE (TRUEQUE SEGURO EN MODO LOCAL)
// ==========================================
async function buyItem(itemKey, cost) {
  let currentTokens = parseInt(localStorage.getItem('user_tokens') || '0', 10);
  let currentStars = parseInt(localStorage.getItem('user_stars') || '0', 10);

  // Validación si el costo es un objeto (Trueque de Estrellas por Tokens)
  if (typeof cost === 'object' && cost !== null) {
    const costStars = cost.stars || 0;      // Estrellas que entrega el usuario
    const rewardTokens = cost.tokens || 0;   // Tokens que recibe el usuario

    if (currentStars < costStars) {
      alert(`No tienes suficientes estrellas. Necesitas ${costStars} ⭐ para este trueque.`);
      return;
    }

    // Modo local optimizado y blindado
    currentStars -= costStars;
    currentTokens += rewardTokens;
    localStorage.setItem('user_tokens', currentTokens.toString());
    localStorage.setItem('user_stars', currentStars.toString());
    alert(`¡Trueque realizado con éxito! Has entregado ${costStars} ⭐ y recibido ${rewardTokens.toLocaleString()} 🪙.`);
    updateUIStats();
    syncUserDataWithDB({ tokens: currentTokens, stars: currentStars });
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