// DATA DE LECCIONES: ENTREVISTA LABORAL
if (typeof entrevistaData === 'undefined') {
    var entrevistaData = {};
}

entrevistaData['MODULO_1'] = [
    {
        id: 'ent_1',
        title: '1. Fundamentos e Importancia de la Entrevista Laboral',
        summary: 'Entiende el concepto clave de la entrevista formal y su relevancia en los procesos de Selección de Recursos Humanos.',
        grammar: 'Conceptos Clave: Interacción Bilateral, Evaluación de Desempeño, Fit Cultural, Verificación Curricular.',
        examples: [
            'Definición formal: Diálogo estructurado para medir idoneidad técnica y actitudinal.',
            'Objetivo de Recursos Humanos: Reducir la tasa de rotación y minimizar costos por errores de contratación.',
            'Objetivo del Candidato: Demostrar valor diferencial, experiencia relevante y alineación de objetivos.'
        ],
        vocabulary: [
            { word: 'Recursos Humanos', phonetic: 'rē-ˈkȯrs-əz hyü-mənz', trans: 'Área encargada de la selección, contratación y gestión del personal.' },
            { word: 'Fit Cultural', phonetic: 'fit kuhl-cher-uhl', trans: 'Grado de alineación entre los valores del candidato y la empresa.' },
            { word: 'Hoja de Vida / CV', phonetic: 'kuh-rik-yuh-luhm vee-tay', trans: 'Documento que resume la trayectoria académica y laboral.' },
            { word: 'Idoneidad', phonetic: 'i-doi-nei-dad', trans: 'Capacidad y aptitud para desempeñar adecuadamente una función.' },
            { word: 'Rotación de Personal', phonetic: 'ro-ta-syon', trans: 'Métrica que mide la frecuencia con la que los empleados abandonan la empresa.' }
        ],
        links: [
            { label: 'Servicio Público de Empleo (SENA)', url: 'https://ape.sena.edu.co' },
            { label: 'Organización Internacional del Trabajo (OIT)', url: 'https://www.ilo.org' }
        ]
    },
    {
        id: 'ent_2',
        title: '2. Clases y Tipología de Entrevistas Laborales',
        summary: 'Conoce los distintos formatos de entrevista: estructurada, semiestructurada, grupal y por competencias.',
        description: 'Las organizaciones emplean diversos esquemas metodológicos dependiendo del rol a cubrir. Identificar la estructura de la entrevista permite al candidato preparar respuestas estratégicas.',
        grammar: 'Estructuras: Estructurada (preguntas fijas), No estructurada (libre), Semiestructurada (mixta), Grupal (dinámica colectiva), Por Competencias (método STAR).',
        examples: [
            'Estructurada: "Todos los postulantes responden exactamente las mismas 5 preguntas".',
            'Por Competencias: "Cuéntame una situación donde resolviste un conflicto en tu equipo de trabajo (Método STAR: Situación, Tarea, Acción, Resultado)".',
            'Grupal: "Se asigna un problema de negocio a un grupo de 5 candidatos para observar liderazgo y trabajo en equipo".'
        ],
        vocabulary: [
            { word: 'Estructurada', phonetic: 'es-truk-tu-ra-da', trans: 'Entrevista con preguntas estandarizadas y predefinidas.' },
            { word: 'Semiestructurada', phonetic: 'se-mi-es-truk-tu-ra-da', trans: 'Combina una guía de preguntas base con repreguntas fluidas.' },
            { word: 'Método STAR', phonetic: 's-t-a-r', trans: 'Técnica de respuesta basada en Situación, Tarea, Acción y Resultado.' },
            { word: 'Entrevista Grupal', phonetic: 'en-tre-vis-ta gru-pal', trans: 'Evaluación simultánea de varios postulantes en interacción.' },
            { word: 'Hard & Soft Skills', phonetic: 'hard - soft skils', trans: 'Habilidades técnicas vs. habilidades blandas/interpersonales.' }
        ],
        links: [
            { label: 'Guía de Selección por Competencias - Harvard Business Review', url: 'https://hbr.org' },
            { label: 'Portal Educativo SENA CIES', url: 'http://www.sena.edu.co' }
        ]
    },
    {
        id: 'ent_3',
        title: '3. Lenguaje Corporal, Protocolo y Saludo',
        summary: 'Domina la comunicación no verbal, el protocolo de saludo formal y la proyección de seguridad.',
        description: 'Más del 60% de la comunicación en una entrevista es no verbal. La postura corporal, el contacto visual, la entonación y el saludo inicial dictan la primera impresión estratégica.',
        grammar: 'Protocolo de Saludo: Apretón de manos firme, contacto visual directo, postura recta, sonrisa profesional y tono de voz moderado.',
        examples: [
            'Correcto: Apretón de manos profesional con mirada directa y postura erguida.',
            'Incorrecto: Evitar el contacto visual, cruzar los brazos defensivamente o saludar con exceso de confianza informal (como abrazos o palmadas sin confianza).',
            'Manejo del tono: Hablar de manera fluida, clara, modulada y sin atropellar las palabras.'
        ],
        vocabulary: [
            { word: 'Contacto Visual', phonetic: 'kon-tak-to vi-su-al', trans: 'Mirada constante y natural que demuestra honestidad y firmeza.' },
            { word: 'Apretón de Manos', phonetic: 'a-pre-ton de ma-nos', trans: 'Saludo corporativo estándar que transmite confianza profesional.' },
            { word: 'Lenguaje No Verbal', phonetic: 'leng-wa-he no ver-bal', trans: 'Gestos, posturas y movimientos corporales que acompañan el discurso.' },
            { word: 'Prosemia', phonetic: 'pro-se-mya', trans: 'Uso y gestión del espacio físico e interpersonal.' },
            { word: 'Asertividad', phonetic: 'a-ser-ti-vi-dad', trans: 'Capacidad de expresar ideas con claridad, seguridad y respeto.' }
        ],
        links: [
            { label: 'Protocolo e Imagen Profesional (SENA)', url: 'https://www.sena.edu.co' }
        ]
    },
    {
        id: 'ent_4',
        title: '4. Código de Vestimenta e Imagen Profesional',
        summary: 'Pautas formales de presentación personal para proyectar idoneidad y respeto corporativo.',
        description: 'La vestimenta debe alinearse con la cultura organizacional de la empresa objetivo, priorizando la sobriedad, la pulcritud y el profesionalismo.',
        grammar: 'Reglas Generales: Usar tonos neutros o claros, accesorios sobrios, aseo impecable. Evitar ropa deportiva, sombreros, estampados escandalosos o perfumes intensos.',
        examples: [
            'Hombres: Camisa formal de manga larga (de preferencia clara), pantalón de vestir, calzado de vestir limpio y peinado adecuado.',
            'Mujeres: Blusa o camisa formal, pantalón o falda de corte institucional, zapatos cerrados/elegantes y maquillaje discreto.',
            'A evitar estrictamente: Gorras, pantalones cortos, camisas deportivas sin cuello, ropa excesivamente ajustada o accesorios muy llamativos.'
        ],
        vocabulary: [
            { word: 'Código Formal', phonetic: 'ko-di-go for-mal', trans: 'Estándar de vestimenta ejecutiva/empresarial tradicional.' },
            { word: 'Business Casual', phonetic: 'biz-nis ka-zhu-uhl', trans: 'Vestimenta profesional semiformal pero proyectada y pulcra.' },
            { word: 'Pulcritud', phonetic: 'pul-kri-tud', trans: 'Aseo, limpieza e higiene personal impecable.' },
            { word: 'Sobriedad', phonetic: 'so-brie-dad', trans: 'Estilo discreto y profesional sin extravagancias.' },
            { word: 'Presentación Personal', phonetic: 'pre-sen-ta-syon', trans: 'Aspecto global e imagen externa proyectada en el ámbito laboral.' }
        ],
        links: [
            { label: 'Consejos de Carrera y Empleabilidad - Mintrabajo', url: 'https://www.mintrabajo.gov.co' }
        ]
    },
    {
        id: 'ent_5',
        title: '5. Buenas Prácticas y Recomendaciones Pre y Post Entrevista',
        summary: 'Estrategias operativas clave para la preparación previa, desarrollo y seguimiento de la entrevista.',
        description: 'El éxito de una entrevista depende en un 80% de la preparación previa: investigar la empresa, practicar la exposición sintética de la experiencia y mantener puntualidad rigurosa.',
        grammar: 'Secuencia recomendada: Investigar empresa -> Llegar 10-15 min antes -> Silenciar móvil -> Escuchar activamente -> Agradecer el espacio.',
        examples: [
            'Puntualidad: Presentarse en el sitio o conectarse al enlace virtual entre 10 y 15 minutos antes de la hora acordada.',
            'Investigación previa: Conocer la misión, visión, servicios y cultura de la empresa antes de la cita.',
            'Cierre profesional: Agradecer el tiempo brindado y reiterar el interés explícito en el puesto.'
        ],
        vocabulary: [
            { word: 'Puntualidad', phonetic: 'pun-tua-li-dad', trans: 'Llegada anticipada o a tiempo que denota compromiso.' },
            { word: 'Investigación de Entorno', phonetic: 'in-ves-ti-ga-syon', trans: 'Estudio previo sobre la empresa, competidores y el rol.' },
            { word: 'Escucha Activa', phonetic: 'es-ku-cha ak-ti-va', trans: 'Atención total a las preguntas antes de formular respuestas.' },
            { word: 'Feedback', phonetic: 'fid-bak', trans: 'Retroalimentación sobre el desarrollo del proceso de selección.' },
            { word: 'Seguimiento', phonetic: 'se-gui-myen-to', trans: 'Comunicación posterior para consultar el estado de la candidatura.' }
        ],
        links: [
            { label: 'Red de Empleo SENA', url: 'https://agenciapublicadeempleo.sena.edu.co' }
        ]
    },
    {
        id: 'ent_6',
        title: '6. Simulación Practica y Juego de Roles (Roleplay)',
        summary: 'Taller de aplicación práctica para simular una entrevista estructurada real.',
        description: 'Técnica práctica donde los participantes asumen los roles de Entrevistador (Recursos Humanos) y Candidato, aplicando listas de chequeo sobre desempeño y comunicación.',
        grammar: 'Pasos de ejecución: 1. Definición de Empresa y Cargo -> 2. Elaboración de 5 preguntas técnicas/conductuales -> 3. Ejecución del Roleplay -> 4. Evaluación mediante Lista de Chequeo.',
        examples: [
            'Empresa: Empresa de Soluciones Tecnológicas SENA CIES.',
            'Cargo evaluado: Analista de Soporte Técnico Jr.',
            'Evaluación: Medir manejo de nervios, orden conceptual, claridad de ideas y respuesta bajo presión.'
        ],
        vocabulary: [
            { word: 'Roleplay', phonetic: 'rool-plei', trans: 'Técnica de simulación dramática de situaciones reales.' },
            { word: 'Lista de Chequeo', phonetic: 'lis-ta de che-ke-o', trans: 'Instrumento de evaluación con criterios observables.' },
            { word: 'Feedback Constructivo', phonetic: 'fid-bak kon-struk-ti-vo', trans: 'Retroalimentación enfocada en áreas de mejora.' },
            { word: 'Desempeño', phonetic: 'de-sem-pe-ño', trans: 'Nivel de ejecución de las responsabilidades asignadas.' },
            { word: 'Sintaxis de Respuesta', phonetic: 'sin-tak-sis', trans: 'Estructura clara y lógica en la formulación de oraciones y argumentos.' }
        ],
        links: [
            { label: 'Portal Oficial SENA', url: 'https://www.sena.edu.co' },
            { label: 'Servicio Público de Empleo Colombia', url: 'https://www.serviciodeempleo.gov.co' }
        ]
    }
];