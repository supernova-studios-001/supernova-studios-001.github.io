// ==========================================
// CENTRO DE APRENDIZAJE Y MATERIAS (MATEMÁTICAS)
// ==========================================

let currentSubject = '';
let currentMathLevel = 'basica'; // 'basica' o 'algebra'

// Base de datos de Matemáticas (8 Temas Iniciales Fundamentales)
const mathLessonsData = {
  basica: [
    {
      id: 1,
      title: "1. Los Números Naturales y el Sistema Decimal",
      summary: "Concepto de números naturales, representación en la recta numérica y valor posicional.",
      grammar: "Los números naturales son los que usamos para contar: 1, 2, 3, 4, 5... Nuestro sistema es decimal porque se agrupa de 10 en 10 (Unidades, Decenas y Centenas).",
      examples: [
        "Recta numérica: Los números crecen ordenadamente hacia la derecha.",
        "Valor posicional: En el número 485, el 5 son unidades, el 8 son decenas (80) y el 4 son centenas (400)."
      ]
    },
    {
      id: 2,
      title: "2. Adición (Suma) de Números Naturales",
      summary: "Reunir o agrupar cantidades y sus propiedades fundamentales.",
      grammar: "La suma consiste en juntar dos o más cantidades (sumandos) para obtener un total. Sus propiedades principales son la conmutativa (el orden no altera la suma) y la asociativa.",
      examples: [
        "Suma simple: 12 + 8 = 20",
        "Propiedad conmutativa: 5 + 3 es exactamente igual a 3 + 5 (resultado 8)."
      ]
    },
    {
      id: 3,
      title: "3. Sustracción (Resta) de Números Naturales",
      summary: "Operación de quitar, sustraer o hallar la diferencia entre cantidades.",
      grammar: "La resta es la operación inversa de la suma. Consta de un Minuendo (cantidad inicial) al que se le quita un Sustraendo para obtener la Diferencia.",
      examples: [
        "Resta básica: 15 - 6 = 9",
        "Aplicación: Si tienes 20 fichas y pierdes 7, te quedan 13 fichas."
      ]
    },
    {
      id: 4,
      title: "4. Multiplicación Básica",
      summary: "La multiplicación como suma abreviada y sus propiedades.",
      grammar: "Multiplicar es sumar un mismo número (multiplicando) tantas veces como indica el multiplicador. El resultado se llama producto.",
      examples: [
        "Suma abreviada: 4 x 3 es equivalente a sumar 4 + 4 + 4 = 12",
        "Elemento absorbente: Cualquier número multiplicado por 0 da como resultado 0 (9 x 0 = 0)."
      ]
    },
    {
      id: 5,
      title: "5. División Exacta e Inexacta",
      summary: "Repartir una cantidad en partes iguales, cociente y residuo.",
      grammar: "La división reparte un Dividendo entre un Divisor. Si el residuo es 0, la división es exacta; si sobra algo menor que el divisor, es inexacta.",
      examples: [
        "División exacta: 20 ÷ 4 = 5 (porque 5 x 4 = 20, residuo 0).",
        "División inexacta: 17 ÷ 5 = 3 (con residuo 2, ya que 3 x 5 = 15 y faltan 2 para 17)."
      ]
    },
    {
      id: 6,
      title: "6. Operaciones Combinadas y Jerarquía",
      summary: "Orden estricto para resolver sumas, restas, multiplicaciones y divisiones.",
      grammar: "La jerarquía indica que primero se resuelven paréntesis, luego multiplicaciones y divisiones de izquierda a derecha, y finalmente sumas y restas.",
      examples: [
        "Ejemplo: 5 + 3 x 2. Primero se multiplica 3 x 2 = 6, y luego se suma 5 + 6 = 11."
      ]
    },
    {
      id: 7,
      title: "7. Múltiplos y Divisores",
      summary: "Relación de los números a través de tablas de multiplicar y divisiones exactas.",
      grammar: "Los múltiplos de un número se obtienen multiplicándolo por los naturales (infinitos). Los divisores son los números que lo dividen exactamente (finitos).",
      examples: [
        "Múltiplos de 4: 4, 8, 12, 16, 20...",
        "Divisores de 12: 1, 2, 3, 4, 6 y 12."
      ]
    },
    {
      id: 8,
      title: "8. Mínimo Común Múltiplo (MCM) y Máximo Común Divisor (MCD)",
      summary: "Hallar el menor múltiplo común y el mayor divisor común entre números.",
      grammar: "El MCM es el menor múltiplo compartido (excluyendo el cero). El MCD es el mayor divisor común entre dos o más números.",
      examples: [
        "MCM de 2 y 3: Los múltiplos comunes menores coinciden en el 6.",
        "MCD de 8 y 12: Los divisores comunes son 1, 2 y 4, siendo el 4 el mayor."
      ]
    }
  ],
  algebra: [
    // Espacio reservado para futuros temas de álgebra inicial
  ]
};

function handleSubjectChange(subject) {
  currentSubject = subject;
  const mathMod = document.getElementById('matematicas-module');
  const comingSoon = document.getElementById('subject-coming-soon');

  closeTopicDisplay();

  if (subject === 'matematicas') {
    if (comingSoon) comingSoon.style.display = 'none';
    if (mathMod) mathMod.style.display = 'block';
    selectMathLevel(currentMathLevel || 'basica');
  } else {
    if (mathMod) mathMod.style.display = 'none';
    if (comingSoon) comingSoon.style.display = subject ? 'block' : 'none';
  }
}

// MÓDULO DE MATEMÁTICAS
function selectMathLevel(level) {
  currentMathLevel = level;
  const targetKey = String(level).trim().toLowerCase();
  const buttons = document.querySelectorAll('#matematicas-module .btn-level');

  buttons.forEach(btn => {
    let btnLevel = btn.getAttribute('data-level');
    if (!btnLevel) {
      const text = btn.innerText.trim().toLowerCase();
      if (text.includes('fundamentos') || text.includes('básica') || text.includes('basica')) btnLevel = 'basica';
      else if (text.includes('álgebra') || text.includes('algebra')) btnLevel = 'algebra';
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
  if (levelTitle) levelTitle.innerText = level === 'basica' ? 'Temas Disponibles: Fundamentos y Aritmética' : 'Temas Disponibles: Álgebra Inicial';

  closeTopicDisplay();
  renderMathTopics(targetKey, mathLessonsData);
}

function renderMathTopics(key, dataSource) {
  const grid = document.getElementById('topics-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const lessons = typeof dataSource !== 'undefined' && dataSource[key] ? dataSource[key] : [];

  if (lessons.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; color: var(--text-secondary); text-align:center; padding: 20px;">Próximamente más contenidos disponibles en este nivel.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();
  lessons.forEach(lesson => {
    const card = document.createElement('div');
    card.className = 'topic-card';
    card.onclick = () => loadMathTopicContent(lesson.id, key, dataSource);
    card.innerHTML = `
      <h5 style="margin-bottom: 6px; font-size:1rem; color:var(--text-primary);">${escapeHTML(lesson.title)}</h5>
      <p style="font-size:0.85rem; color:var(--text-secondary);">${escapeHTML(lesson.summary)}</p>`;
    fragment.appendChild(card);
  });
  grid.appendChild(fragment);
}

function loadMathTopicContent(topicId, key, dataSource) {
  const topicsListSection = document.getElementById('topics-list-section');
  const topicContentDisplay = document.getElementById('topic-content-display');
  const topicLoader = document.getElementById('topic-loader');

  if (topicsListSection) topicsListSection.style.display = 'none';
  if (topicContentDisplay) topicContentDisplay.style.display = 'none';
  if (topicLoader) topicLoader.style.display = 'block';

  setTimeout(() => {
    if (topicLoader) topicLoader.style.display = 'none';
    const source = dataSource || mathLessonsData;
    const searchKey = key || currentMathLevel;
    const lessons = source[searchKey] || [];

    const lesson = lessons.find(l => l.id === topicId);
    if (!lesson) return;

    const articleContainer = document.getElementById('topic-article');
    if (articleContainer) {
      articleContainer.innerHTML = buildLessonHTML(lesson);
    }
    if (topicContentDisplay) topicContentDisplay.style.display = 'block';
  }, 300);
}

function closeTopicDisplay() {
  const topicContentDisplay = document.getElementById('topic-content-display');
  const topicLoader = document.getElementById('topic-loader');
  const topicsListSection = document.getElementById('topics-list-section');

  if (topicContentDisplay) topicContentDisplay.style.display = 'none';
  if (topicLoader) topicLoader.style.display = 'none';
  if (topicsListSection) topicsListSection.style.display = 'block';
}

function buildLessonHTML(lesson) {
  return `
    <h3 style="font-size: 1.4rem; margin-bottom: 8px;">${escapeHTML(lesson.title)}</h3>
    <p style="color:var(--text-secondary); margin-bottom: 16px;">${escapeHTML(lesson.summary || '')}</p>
    
    ${
      lesson.grammar
        ? `<div class="lesson-section" style="margin-bottom: 20px;">
            <h4 style="margin-bottom: 8px; color:var(--accent-blue, #38bdf8);">Conceptos y Fundamentos</h4>
            <p style="line-height:1.5;">${escapeHTML(lesson.grammar).replace(/\n/g, '<br>')}</p>
          </div>`
        : ''
    }

    ${
      lesson.examples && lesson.examples.length > 0
        ? `<div class="lesson-section" style="margin-bottom: 20px;">
            <h4 style="margin-bottom: 8px; color:var(--accent-blue, #38bdf8);">Ejemplos Prácticos Explicados</h4>
            ${lesson.examples
              .map(
                ex =>
                  `<div class="example-box" style="padding: 10px; margin-bottom:8px; border-left:3px solid var(--accent-blue, #38bdf8); border-radius: 4px; background: rgba(56, 189, 248, 0.05);">${escapeHTML(
                    ex
                  )}</div>`
              )
              .join('')}
          </div>`
        : ''
    }
  `;
}

// Funciones de seguridad auxiliares por si no están definidas en global
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}