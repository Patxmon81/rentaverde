/* ================================================================
   rentaverde.com — main.js
   Vanilla JS — no dependencies
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. STICKY HEADER ────────────────────────────────────────────
  const header = document.getElementById('site-header');

  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }


  // ── 2. HAMBURGER MENU ───────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const primaryNav = document.getElementById('primary-nav');

  if (hamburger && primaryNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', String(!isOpen));
      primaryNav.classList.toggle('nav-open', !isOpen);
    });

    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !primaryNav.contains(e.target)) {
        hamburger.setAttribute('aria-expanded', 'false');
        primaryNav.classList.remove('nav-open');
      }
    });
  }


  // ── 3. FAQ ACCORDION ────────────────────────────────────────────
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    const answer   = item.querySelector('.faq-answer');

    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = question.getAttribute('aria-expanded') === 'true';

      // Close all
      faqItems.forEach((other) => {
        const otherQ = other.querySelector('.faq-question');
        const otherA = other.querySelector('.faq-answer');
        if (otherQ && otherA) {
          otherQ.setAttribute('aria-expanded', 'false');
          otherA.style.maxHeight = '0';
        }
      });

      // Open clicked if it was closed
      if (!isOpen) {
        question.setAttribute('aria-expanded', 'true');
        // Measure natural height via scrollHeight
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });

    // Wrap inner content for padding without breaking max-height animation
    if (!answer.querySelector('.faq-answer__inner')) {
      const inner = document.createElement('div');
      inner.className = 'faq-answer__inner';
      while (answer.firstChild) inner.appendChild(answer.firstChild);
      answer.appendChild(inner);
    }
  });


  // ── 4. SMOOTH SCROLL ────────────────────────────────────────────
  const HEADER_HEIGHT = 72;

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  // ── 5. CALCULADORA DE INTERÉS COMPUESTO (con aportación mensual) ─
  const form        = document.getElementById('compound-form');
  const resultBox   = document.getElementById('calc-result');
  const resultVal   = document.getElementById('calc-value');
  const resultBreak = document.getElementById('calc-breakdown');

  const formatEUR = (n) => new Intl.NumberFormat('es-ES', {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);

  if (form && resultBox && resultVal) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const capital = parseFloat(document.getElementById('capital').value)  || 0;
      const mensual = parseFloat(document.getElementById('mensual').value)  || 0;
      const tasa    = parseFloat(document.getElementById('tasa').value);
      const anos    = parseFloat(document.getElementById('anos').value);

      if (isNaN(tasa) || isNaN(anos) || tasa <= 0 || anos <= 0 || (capital <= 0 && mensual <= 0)) {
        resultBox.removeAttribute('hidden');
        resultVal.textContent = 'Introduce al menos un capital o aportación mensual, rentabilidad y años.';
        resultVal.style.fontSize = '0.9rem';
        resultVal.style.color = '#6B7280';
        if (resultBreak) resultBreak.innerHTML = '';
        return;
      }

      // Monthly compounding — more accurate
      const rMes  = tasa / 100 / 12;
      const nMes  = anos * 12;
      const fv    = capital * Math.pow(1 + rMes, nMes)
                  + (rMes > 0
                      ? mensual * (Math.pow(1 + rMes, nMes) - 1) / rMes
                      : mensual * nMes);

      const totalAportado = capital + mensual * nMes;
      const ganancias     = fv - totalAportado;

      resultVal.style.fontSize = '';
      resultVal.style.color = '';
      resultVal.textContent = formatEUR(fv);

      if (resultBreak) {
        resultBreak.innerHTML = `
          <div class="calc-row">
            <span class="calc-row__label">Capital inicial</span>
            <span class="calc-row__value">${formatEUR(capital)}</span>
          </div>
          <div class="calc-row">
            <span class="calc-row__label">Total aportado mensualmente</span>
            <span class="calc-row__value">${formatEUR(mensual * nMes)}</span>
          </div>
          <div class="calc-row">
            <span class="calc-row__label">Total invertido</span>
            <span class="calc-row__value">${formatEUR(totalAportado)}</span>
          </div>
          <div class="calc-row calc-row--highlight">
            <span class="calc-row__label">Intereses generados</span>
            <span class="calc-row__value">+${formatEUR(ganancias)}</span>
          </div>
        `;
      }

      resultBox.removeAttribute('hidden');
      resultBox.classList.remove('fade-in');
      void resultBox.offsetWidth;
      resultBox.classList.add('fade-in');
    });
  }


  // ── 6. AÑO DINÁMICO EN FOOTER ───────────────────────────────────
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }


  // ── 6b. FECHAS DINÁMICAS EN ESPAÑOL ─────────────────────────────
  const MESES = [
    'enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre'
  ];
  const MESES_CORTOS = [
    'Ene','Feb','Mar','Abr','May','Jun',
    'Jul','Ago','Sep','Oct','Nov','Dic'
  ];

  const _now  = new Date();
  const _mes  = MESES[_now.getMonth()];
  const _mesC = MESES_CORTOS[_now.getMonth()];
  const _ano  = _now.getFullYear();

  // "junio 2026"
  document.querySelectorAll('.js-date-mes-ano').forEach(el => {
    el.textContent = `${_mes} ${_ano}`;
  });

  // "Jun 2026"  (microstat del hero)
  document.querySelectorAll('.js-date-mes-corto-ano').forEach(el => {
    el.textContent = `${_mesC} ${_ano}`;
  });

  // "junio de 2026"  (páginas legales)
  document.querySelectorAll('.js-date-mes-de-ano').forEach(el => {
    el.textContent = `${_mes} de ${_ano}`;
  });


  // ── 7. COOKIE BANNER (RGPD) ─────────────────────────────────────
  const banner          = document.getElementById('cookie-banner');
  const btnAcceptAll    = document.getElementById('cookie-accept-all');
  const btnNecessary    = document.getElementById('cookie-accept-necessary');

  const COOKIE_KEY = 'rv_cookies_accepted';

  const hideBanner = () => {
    if (banner) banner.classList.remove('is-visible');
  };

  if (banner && !localStorage.getItem(COOKIE_KEY)) {
    // Slight delay so the page paint completes first
    setTimeout(() => banner.classList.add('is-visible'), 600);
  }

  if (btnAcceptAll) {
    btnAcceptAll.addEventListener('click', () => {
      localStorage.setItem(COOKIE_KEY, 'all');
      hideBanner();
    });
  }

  if (btnNecessary) {
    btnNecessary.addEventListener('click', () => {
      localStorage.setItem(COOKIE_KEY, 'necessary');
      hideBanner();
    });
  }


  // ── 8. ANIMATED UNDERLINE — INTERSECTION OBSERVER ───────────────
  const underlineEls = document.querySelectorAll('.animated-underline');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    underlineEls.forEach((el) => observer.observe(el));
  } else {
    // Fallback: just add the class immediately
    underlineEls.forEach((el) => el.classList.add('in-view'));
  }


  // ── 9. TEST DE PERFIL INVERSOR ──────────────────────────────────
  const testWrap    = document.getElementById('investor-test');
  const testQWrap   = document.getElementById('test-question');
  const testRWrap   = document.getElementById('test-result');
  const testFill    = document.getElementById('test-progress-fill');
  const testLabel   = document.getElementById('test-progress-label');

  if (testWrap && testQWrap) {

    const PREGUNTAS = [
      {
        q: '¿Cómo describirías tu situación financiera actual?',
        opts: [
          { t: 'Mis gastos igualan o superan mis ingresos cada mes',    s: { fp:3, mi:0, etf:0, re:0, rico:0 } },
          { t: 'Ahorro algo pero sin un sistema claro',                  s: { fp:2, mi:1, etf:0, re:0, rico:0 } },
          { t: 'Ahorro regularmente y tengo fondo de emergencia',        s: { fp:0, mi:2, etf:2, re:0, rico:1 } },
          { t: 'Tengo capital disponible y quiero hacerlo crecer',       s: { fp:0, mi:1, etf:2, re:2, rico:2 } },
        ],
      },
      {
        q: '¿Qué tipo de inversión te interesa más?',
        opts: [
          { t: 'Ordenar mis finanzas y ahorrar de forma inteligente',    s: { fp:3, mi:0, etf:0, re:0, rico:0 } },
          { t: 'Invertir en bolsa, ETFs y mercados financieros',         s: { fp:0, mi:2, etf:3, re:0, rico:0 } },
          { t: 'Comprar inmuebles para alquilar y generar rentas',       s: { fp:0, mi:0, etf:0, re:3, rico:1 } },
          { t: 'Construir un camino hacia la independencia financiera',  s: { fp:0, mi:1, etf:1, re:0, rico:3 } },
        ],
      },
      {
        q: '¿Cuánta experiencia tienes invirtiendo?',
        opts: [
          { t: 'Ninguna, nunca he invertido',                            s: { fp:2, mi:2, etf:0, re:0, rico:0 } },
          { t: 'He hecho algo pero sin una estrategia clara',            s: { fp:1, mi:2, etf:1, re:0, rico:1 } },
          { t: 'Invierto regularmente y tengo cartera formada',          s: { fp:0, mi:1, etf:2, re:1, rico:2 } },
          { t: 'Tengo experiencia y busco especializarme en un área',    s: { fp:0, mi:0, etf:1, re:2, rico:2 } },
        ],
      },
      {
        q: '¿Cuánto capital tienes disponible para invertir ahora mismo?',
        opts: [
          { t: 'Menos de 1.000€',                                        s: { fp:3, mi:1, etf:0, re:0, rico:0 } },
          { t: 'Entre 1.000€ y 10.000€',                                 s: { fp:0, mi:2, etf:2, re:0, rico:1 } },
          { t: 'Entre 10.000€ y 30.000€',                                s: { fp:0, mi:1, etf:2, re:1, rico:2 } },
          { t: 'Más de 30.000€',                                         s: { fp:0, mi:0, etf:1, re:3, rico:2 } },
        ],
      },
      {
        q: '¿Cuál es tu objetivo financiero principal en los próximos 5 años?',
        opts: [
          { t: 'Controlar mi dinero y ahorrar de forma consistente',         s: { fp:3, mi:0, etf:0, re:0, rico:0 } },
          { t: 'Tener una cartera de inversión sólida a largo plazo',        s: { fp:0, mi:2, etf:2, re:0, rico:1 } },
          { t: 'Comprar mi primer inmueble de inversión para alquilar',      s: { fp:0, mi:0, etf:0, re:3, rico:1 } },
          { t: 'Alcanzar la independencia financiera o reducir mi dependencia del trabajo', s: { fp:0, mi:1, etf:1, re:1, rico:3 } },
        ],
      },
    ];

    const RESULTADOS = {
      fp:  {
        badge: 'Mejor punto de partida',
        name:  'Finanzas Personales Inteligentes 2.0',
        desc:  'Tu perfil indica que el paso más importante ahora mismo es ordenar tus finanzas antes de invertir. Este curso te da el sistema, las plantillas y el método para hacerlo de forma definitiva.',
        price: 'Desde 197 US$',
        url:   'finanzas-personales-inteligentes.html',
      },
      mi:  {
        badge: 'El más completo',
        name:  'Mapa del Inversor',
        desc:  'Tienes buena base financiera y estás listo para dar el salto. El Mapa del Inversor cubre ETFs, bolsa, criptomonedas, fiscalidad española y psicología inversora en un solo programa.',
        price: 'Desde 1.597 US$',
        url:   'mapa-del-inversor.html',
      },
      etf: {
        badge: 'Foco en mercados financieros',
        name:  'Inversión en Bolsa y ETFs',
        desc:  'Tu perfil apunta a la inversión indexada a largo plazo. Este curso cubre cómo seleccionar ETFs, qué brókers usar en España y cómo declararlo correctamente en la renta.',
        price: 'Desde 29,90€',
        url:   'inversion-bolsa-etfs.html',
      },
      re:  {
        badge: 'Inversión inmobiliaria',
        name:  'Arlanza Real Estate Academy',
        desc:  'El inmobiliario es tu vía. Este es el curso más completo en español para analizar operaciones reales, negociar con bancos y entender la fiscalidad del alquiler en España.',
        price: 'Desde 289€',
        url:   'arlanza-real-estate-academy.html',
      },
      rico:{
        badge: 'Independencia financiera',
        name:  'El Método RICO',
        desc:  'Buscas la visión completa: múltiples fuentes de ingresos pasivos y un sistema estructurado hacia la independencia financiera adaptado a la realidad española.',
        price: 'Desde 37,50€',
        url:   'metodo-rico.html',
      },
    };

    let puntos = { fp:0, mi:0, etf:0, re:0, rico:0 };
    let preguntaActual = 0;

    const actualizarProgreso = (idx) => {
      const pct = (idx / PREGUNTAS.length) * 100;
      if (testFill)  testFill.style.width  = pct + '%';
      if (testLabel) testLabel.textContent = idx < PREGUNTAS.length
        ? `Pregunta ${idx + 1} de ${PREGUNTAS.length}`
        : 'Resultado';
    };

    const mostrarPregunta = (idx) => {
      actualizarProgreso(idx);
      const p = PREGUNTAS[idx];
      testQWrap.innerHTML = `
        <p class="test-q__text">${p.q}</p>
        <div class="test-q__options">
          ${p.opts.map((o, i) => `<button class="test-q__option" data-i="${i}">${o.t}</button>`).join('')}
        </div>
      `;
      testQWrap.querySelectorAll('.test-q__option').forEach(btn => {
        btn.addEventListener('click', () => {
          const scores = p.opts[parseInt(btn.dataset.i)].s;
          Object.keys(scores).forEach(k => { puntos[k] += scores[k]; });
          preguntaActual++;
          if (preguntaActual < PREGUNTAS.length) {
            mostrarPregunta(preguntaActual);
          } else {
            mostrarResultado();
          }
        });
      });
    };

    const mostrarResultado = () => {
      actualizarProgreso(PREGUNTAS.length);
      const ganador = Object.keys(puntos).reduce((a, b) => puntos[a] >= puntos[b] ? a : b);
      const r = RESULTADOS[ganador];

      testQWrap.setAttribute('hidden', '');
      if (testRWrap) {
        testRWrap.removeAttribute('hidden');
        testRWrap.innerHTML = `
          <p class="test-result__eyebrow">Tu curso recomendado</p>
          <span class="test-result__badge">${r.badge}</span>
          <h3 class="test-result__name">${r.name}</h3>
          <p class="test-result__desc">${r.desc}</p>
          <p class="test-result__price">${r.price} · Acceso de por vida</p>
          <div class="test-result__actions">
            <a href="${r.url}" class="btn btn--primary">Ver análisis completo →</a>
            <button class="test-restart-btn" id="test-restart">Repetir el test</button>
          </div>
        `;
        document.getElementById('test-restart').addEventListener('click', () => {
          puntos = { fp:0, mi:0, etf:0, re:0, rico:0 };
          preguntaActual = 0;
          testRWrap.setAttribute('hidden', '');
          testQWrap.removeAttribute('hidden');
          mostrarPregunta(0);
        });
      }
    };

    // Arrancar
    mostrarPregunta(0);
  }


  // ── 10. CONTACT FORM ─────────────────────────────────────────────
  const contactForm    = document.getElementById('contact-form');
  const contactSuccess = document.getElementById('contact-success');

  if (contactForm && contactSuccess) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name    = document.getElementById('contact-name').value.trim();
      const email   = document.getElementById('contact-email').value.trim();
      const subject = document.getElementById('contact-subject').value;
      const message = document.getElementById('contact-message').value.trim();
      const consent = document.getElementById('contact-consent').checked;

      if (!name || !email || !email.includes('@') || !subject || !message || !consent) return;

      // NOTE: Replace with your backend endpoint (Formspree, Netlify Forms, etc.)
      contactForm.setAttribute('hidden', '');
      contactSuccess.removeAttribute('hidden');
    });
  }


  // ── 11. NEWSLETTER FORM ─────────────────────────────────────────
  const newsletterForm    = document.getElementById('newsletter-form');
  const newsletterSuccess = document.getElementById('newsletter-success');

  if (newsletterForm && newsletterSuccess) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('newsletter-email').value.trim();

      if (!email || !email.includes('@')) {
        document.getElementById('newsletter-email').focus();
        return;
      }

      // NOTE: Replace this block with your email marketing provider (Mailchimp, ConvertKit, etc.)
      newsletterForm.setAttribute('hidden', '');
      newsletterSuccess.removeAttribute('hidden');
    });
  }

});
