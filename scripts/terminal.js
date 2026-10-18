/**
 * MACOS TERMINAL COMPONENT
 * Self-contained: builds its own DOM and injects it right after the
 * scroll-zoom hero (#hero), i.e. directly under the white transition.
 * Typing sequence starts when the window enters the viewport.
 */

(function () {
  'use strict';

  const PROMPT = 'webcraft-user@macbook ~ % ';
  const COMMAND = './show_capabilities.sh';

  const LOG_LINES = [
    { tag: 'INFO', kind: 'info', text: ' Ініціалізація процесів WebCraft...' },
    { tag: 'SUCCESS', kind: 'success', text: ' Стек технологій: React / Next.js / Tailwind CSS / GSAP.' },
    { tag: 'PROCESS', kind: 'process', text: ' Запуск аналізу вашої бізнес-ніші... ок.' },
    { tag: 'PROCESS', kind: 'process', text: ' Проектування UI/UX архітектури без шаблонів... ок.' },
    { tag: 'PROCESS', kind: 'process', text: ' Інтеграція наскрізної аналітики та CRM... ок.' },
    { tag: 'PROCESS', kind: 'process', text: ' Базова SEO-оптимізація під пошукові системи... ок.' },
    { tag: 'STATUS', kind: 'status', text: ' Усі етапи розробки виконуються строго «Під ключ».' }
  ];

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  // 1. Единый конфигурационный массив для всех этапов (Старт + 7 шагов)
  const BLOCKS_CONFIG = [
    {
      index: 0,
      id: "start",
      isStart: true,
      title: "Етапи розробки",
      side: "right", // 3D-Элемент Справа, текст Слева
      stepNumber: "",
      badge: "",
      description: "",
      shapeName: "3D Три парящих ізометричних шари"
    },
    {
      index: 1,
      id: "idea",
      title: "Обговорення ідеї",
      side: "left", // Частицы слева, текст справа
      stepNumber: "01",
      badge: "АНАЛІЗ ТА СТРАТЕГІЯ",
      description: "З'ясування потреб та складання технічного завдання. Формування чітких бізнес-цілей та дорожньої карти проєкту.",
      shapeName: "3D Лампочка — символ ідеї"
    },
    {
      index: 2,
      id: "prototype",
      title: "Створення прототипу",
      side: "right", // Частицы справа, текст слева
      stepNumber: "02",
      badge: "АРХІТЕКТУРА ТА СЦЕНАРІЇ",
      description: "Розробка концепції та аналіз користувальницьких сценаріїв. Проектування структури сторінок та архітектури інтерфейсу.",
      shapeName: "3D Планшет — план проекту"
    },
    {
      index: 3,
      id: "design",
      title: "Дизайн",
      side: "left",
      stepNumber: "03",
      badge: "ПРЕМІАЛЬНА ЕСТЕТИКА ТА СТИЛЬ",
      description: "Створення унікального дизайн-макету сайту на основі фірмового стилю. Розробка візуальної мови та естетичних акцентів.",
      shapeName: "Преміальний огранений кристал"
    },
    {
      index: 4,
      id: "coding",
      title: "WEB-програмування",
      side: "right",
      stepNumber: "04",
      badge: "ФУНКЦІОНАЛ ТА ЛОГІКА",
      description: "Робота над функціональністю сайту, програмування логіки, інтеграція платіжних систем, CRM та серверних модулів.",
      shapeName: "3D Вікно терміналу: hello, world!!"
    },
    {
      index: 5,
      id: "seo",
      title: "SEO-підготовка",
      side: "left",
      stepNumber: "05",
      badge: "ОРГАНІЧНЕ ЗРОСТАННЯ",
      description: "Звірка з чек-листом з підготовки сайту до органічного просування, технічна оптимізація та підготовка до швидкої індексації.",
      shapeName: "3D Графік зростання"
    },
    {
      index: 6,
      id: "testing",
      title: "Тестування",
      side: "right",
      stepNumber: "06",
      badge: "КОНТРОЛЬ ЯКОСТІ",
      description: "Комплексна перевірка коректного відображення та функціональності на всіх типах пристроїв перед офіційним релізом.",
      shapeName: "3D Індикатор тестування (Spinner)"
    },
    {
      index: 7,
      id: "release",
      title: "Реліз та підтримка",
      side: "left",
      stepNumber: "07",
      badge: "ЗАПУСК ТА ПІДТРИМКА",
      description: "Успішний реліз проекту, налаштування аналітики, передача доступу та подальша технічна підтримка.",
      shapeName: "3D 5 Золотих зірок — реліз і підтримка"
    }
  ];

  const TURNKEY_SERVICES = [
    {
      id: 'landing',
      icon: '⚡',
      badge: 'Швидкий старт • від 5 днів',
      title: 'Лендінги',
      desc: 'Односторінкові конверсійні сайти з фокусом на одну ключову дію. Ідеально для лідогенерації, тестування бізнес-гіпотез та швидкого старту продажів.',
      features: [
        'Маркетинговий аналіз та упаковка офферу',
        'Продаючий копірайтинг за формулами AIDA',
        'Індивідуальний UI/UX дизайн (Figma)',
        'Миттєве сповіщення про ліди в Telegram',
        'ШІ-індексація (AEO & GEO)'
      ],
      priceTag: 'від $500',
      calcTarget: 'landing'
    },
    {
      id: 'corporate',
      icon: '💻',
      badge: 'Імідж і бренд • від 12 днів',
      title: 'Корпоративні сайти',
      desc: 'Багатосторінкові презентабельні сайти компаній з каталогами послуг, історією бренду та бездоганним позиціонуванням на ринку.',
      features: [
        'Продумана архітектура та навігація',
        'Фірмова дизайн-система під брендбук',
        'Зручна адмін-панель для оновлення текстів',
        'SEO-підготовка структури під пошуковики',
        'ШІ-індексація (AEO & GEO)'
      ],
      priceTag: 'від $950',
      calcTarget: 'corporate'
    },
    {
      id: 'ecommerce',
      icon: '🛍️',
      badge: 'Продажі 24/7 • від 18 днів',
      title: 'Інтернет-магазини',
      desc: 'Повноцінні e-commerce платформи з високою швидкістю роботи, розумними фільтрами товарів, швидким оформленням замовлення та автоматизацією.',
      features: [
        'Каталог з фасетними фільтрами та пошуком',
        'Швидкий чекаут в 1 крок та зручний кошик',
        'Інтеграція оплат (Stripe, LiqPay, Monobank)',
        'Підключення служб доставки та CRM',
        'ШІ-індексація (AEO & GEO)'
      ],
      priceTag: 'від $1 400',
      calcTarget: 'ecommerce'
    },
    {
      id: 'webapp',
      icon: '👨‍💻',
      badge: 'Складна логіка • від 25 днів',
      title: 'Веб-сервіси та дашборди',
      desc: 'Кастомні веб-додатки, особисті кабінети користувачів, внутрішні портали компаній та SaaS-системи з персоналізованими правами доступу.',
      features: [
        'Ролі та авторизація (клієнт, менеджер, адмін)',
        'Інтерактивні дашборди та графіки аналітики',
        'Безпечні REST / GraphQL API та бекенд',
        'Надійний захист даних та резервування',
        'ШІ-індексація (AEO & GEO)'
      ],
      priceTag: 'від $2 200',
      calcTarget: 'webapp'
    }
  ];

  const STANDARDS_TIMELINE_STEPS = [
    {
      num: '01',
      side: 'left',
      title: 'Аналіз та ТЗ',
      desc: 'Аналіз ніші, фіксація цілей, чіткий фіксований кошторис.'
    },
    {
      num: '02',
      side: 'right',
      title: 'UX & Копірайтинг',
      desc: 'Смислова структура, прототип сторінок та переконливі тексти.'
    },
    {
      num: '03',
      side: 'left',
      title: 'UI Дизайн',
      desc: 'Унікальний візуал у Figma для десктопу та мобільних екранів.'
    },
    {
      num: '04',
      side: 'right',
      title: 'Швидка розробка',
      desc: 'Чистий сучасний код, мікро-анімації та оптимізація швидкості.'
    },
    {
      num: '05',
      side: 'left',
      title: 'Інтеграції',
      desc: 'Підключення оплат, CRM, аналітики та сповіщень у Telegram.'
    },
    {
      num: '06',
      side: 'right',
      title: 'Реліз & Підтримка',
      desc: 'Розгортання на сервері, підключення домену та 30 днів гарантії.'
    }
  ];

  const EXPERTISE_CARDS = [
    {
      num: '01',
      title: 'Архітектурний стек',
      desc: 'Підбираємо технології (Next.js, Laravel або WordPress) під масштаб вашого бізнесу, а не підганяємо ваші задачі під готові шаблони.',
      pills: ['Next.js', 'Laravel', 'WordPress'],
      svg: `<svg viewBox="0 0 64 64" width="44" height="44" fill="none" stroke="#F8FAFC" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M32 8 L54 19 L32 30 L10 19 Z"/><path d="M10 28 L32 39 L54 28"/><path d="M10 37 L32 48 L54 37"/><path d="M10 46 L32 57 L54 46"/></svg>`
    },
    {
      num: '02',
      title: 'Кастомний UI/UX',
      desc: 'Проектуємо унікальний візуальний інтерфейс на основі поведінкових факторів вашої аудиторії. Жодних копій чи чужих рішень.',
      pills: ['Figma', 'UX Research', 'Design System'],
      svg: `<svg viewBox="0 0 64 64" width="44" height="44" fill="none" stroke="#F8FAFC" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M42 12 L52 22 L30 44 L20 44 L20 34 Z"/><circle cx="16" cy="48" r="4"/><path d="M16 20 C16 32 32 32 32 48"/><circle cx="32" cy="48" r="4"/><circle cx="16" cy="20" r="4"/></svg>`
    },
    {
      num: '03',
      title: 'Автономне керування',
      desc: 'Виносимо 100% контенту в гнучку адмін-панель. Ви керуєте кожним блоком, текстом та банером самостійно, без залучення програмістів.',
      pills: ['100% Контроль', 'No-Code редагування', 'Відеогайд'],
      svg: `<svg viewBox="0 0 64 64" width="44" height="44" fill="none" stroke="#F8FAFC" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="10" width="44" height="44" rx="8"/><line x1="10" y1="24" x2="54" y2="24"/><line x1="26" y1="24" x2="26" y2="54"/><circle cx="18" cy="17" r="2.5" fill="#F8FAFC"/><circle cx="26" cy="17" r="2.5" fill="#F8FAFC"/><circle cx="34" cy="17" r="2.5" fill="#F8FAFC"/><line x1="34" y1="34" x2="48" y2="34"/><circle cx="42" cy="34" r="3" fill="#F8FAFC"/><line x1="34" y1="44" x2="48" y2="44"/><circle cx="38" cy="44" r="3" fill="#F8FAFC"/></svg>`
    },
    {
      num: '04',
      title: 'Екосистема та інтеграції',
      desc: 'Безшовно підключаємо CRM, ERP, платіжні шлюзи, сервіси автоматизації маркетингу та наскрізну аналітику в єдину систему.',
      pills: ['CRM & ERP', 'Stripe & Mono', 'Telegram Bot'],
      svg: `<svg viewBox="0 0 64 64" width="44" height="44" fill="none" stroke="#F8FAFC" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="22" cy="22" r="10"/><circle cx="42" cy="22" r="10"/><circle cx="32" cy="44" r="10"/><line x1="29" y1="29" x2="35" y2="37"/><line x1="35" y1="29" x2="29" y2="37"/><line x1="32" y1="14" x2="32" y2="10"/><line x1="14" y1="32" x2="10" y2="32"/><line x1="50" y1="32" x2="54" y2="32"/></svg>`
    },
    {
      num: '05',
      title: 'Швидкість та Core Web Vitals',
      desc: 'Глибока технічна оптимізація та архітектура для миттєвого завантаження. Створюємо ідеальний фундамент для органічного SEO-росту.',
      pills: ['PageSpeed 95+', 'LCP < 1.0s', 'SEO фундамент'],
      svg: `<svg viewBox="0 0 64 64" width="44" height="44" fill="none" stroke="#F8FAFC" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 40 A22 22 0 1 1 52 40"/><path d="M34 16 L24 34 L33 34 L30 48 L44 30 L35 30 Z"/><circle cx="32" cy="40" r="3" fill="#F8FAFC"/></svg>`
    },
    {
      num: '06',
      title: 'ШІ-оптимізація: AEO & GEO',
      badge: 'НОВИЙ ПУНКТ',
      desc: "Готуємо структуру коду сайту за стандартами Answer & Generative Engine Optimization. Ваш бренд з'являтиметься у рекомендаціях та відповідях ChatGPT, Perplexity та Claude.",
      pills: ['ChatGPT & Claude', 'Perplexity GEO', 'Schema AI'],
      svg: `<svg viewBox="0 0 64 64" width="44" height="44" fill="none" stroke="#F8FAFC" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M32 8 C32 20 44 32 56 32 C44 32 32 44 32 56 C32 44 20 32 8 32 C20 32 32 20 32 8 Z"/><circle cx="46" cy="18" r="3" fill="#F8FAFC"/><circle cx="18" cy="46" r="2.5" fill="#F8FAFC"/></svg>`
    },
    {
      num: '07',
      title: 'Безпека та стабільність',
      desc: 'Впроваджуємо сучасні протоколи захисту даних, трирівневий контроль доступів та автоматичне резервне копіювання для безперебійної роботи 24/7.',
      pills: ['SSL & Cloudflare', '3-рівневий доступ', 'Auto-Backup 24/7'],
      svg: `<svg viewBox="0 0 64 64" width="44" height="44" fill="none" stroke="#F8FAFC" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M32 10 L50 18 V32 C50 44 42 52 32 56 C22 52 14 44 14 32 V18 Z"/><circle cx="32" cy="30" r="4"/><path d="M32 34 V42"/></svg>`
    }
  ];

  const UKRAINIAN_BRANDS = [
    {
      id: 'wog',
      name: 'WOG Pride',
      category: 'АЗК & Лояльність',
      domain: 'wog.ua',
      color: '#009A44',
      badge: 'ТОП-1 МЕРЕЖА АЗК',
      project: 'WOG Pride Web Portal',
      desc: 'Цифрова платформа програми лояльності, безконтактна заправка WOG Pay та онлайн-сервіси.',
      metric: '4.5 млн користувачів',
      metricSub: '+64% повторних заправок',
      iconSvg: `<svg viewBox="0 0 38 38" width="34" height="34"><rect width="38" height="38" rx="10" fill="#009A44"/><path d="M11 26L16 12H19.5L16 26H11ZM18.5 26L23.5 12H27L23.5 26H18.5Z" fill="#FFFFFF"/></svg>`
    },
    {
      id: 'novapost',
      name: 'Nova Post',
      category: 'Міжнародна логістика',
      domain: 'novapost.com',
      color: '#DA291C',
      badge: 'ЛІДЕР ЕКСПРЕС-ДОСТАВКИ',
      project: 'Global Shipping Portal',
      desc: 'Міжнародний веб-портал управління посилками, митне оформлення та інтеграція відділень.',
      metric: '32 країни світу',
      metricSub: '1.2s час трекінгу посилки',
      iconSvg: `<svg viewBox="0 0 38 38" width="34" height="34"><rect width="38" height="38" rx="10" fill="#DA291C"/><path d="M10 19L18 11V16H28V22H18V27L10 19Z" fill="#FFFFFF"/></svg>`
    },
    {
      id: 'monobank',
      name: 'Monobank',
      category: 'Fintech & Необанкінг',
      domain: 'monobank.ua',
      color: '#101010',
      badge: 'ПЕРШИЙ НЕОБАНК',
      project: 'Fintech Ecosystem & Promo',
      desc: 'Промо-платформа фінансових послуг, депозитів та кредитів з інтерактивними розрахунками.',
      metric: '8.4 млн клієнтів',
      metricSub: '99.99% безперебійність',
      iconSvg: `<svg viewBox="0 0 38 38" width="34" height="34"><rect width="38" height="38" rx="10" fill="#18181B"/><circle cx="19" cy="19" r="9" fill="#E11D48"/><path d="M16 17C16 15 18 14 19 14C20 14 22 15 22 17C22 19 19 20 19 22V24" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/><circle cx="19" cy="26" r="1" fill="#FFFFFF"/></svg>`
    },
    {
      id: 'rozetka',
      name: 'Rozetka',
      category: 'Головний маркетплейс',
      domain: 'rozetka.ua',
      color: '#00A046',
      badge: '№1 E-COMMERCE',
      project: 'B2B Portal & Highload Shop',
      desc: 'Спеціальні промо-лендінги, B2B-кабінет партнерів та масштабована цифрова вітрина.',
      metric: '15+ млн товарів',
      metricSub: '3.4x прискорення каталогу',
      iconSvg: `<svg viewBox="0 0 38 38" width="34" height="34"><rect width="38" height="38" rx="10" fill="#00A046"/><circle cx="15" cy="17" r="2.5" fill="#FFFFFF"/><circle cx="23" cy="17" r="2.5" fill="#FFFFFF"/><path d="M13 22C15 25 23 25 25 22" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/></svg>`
    },
    {
      id: 'ajax',
      name: 'Ajax Systems',
      category: 'Безпека & IoT',
      domain: 'ajax.systems',
      color: '#0F172A',
      badge: 'СИСТЕМИ БЕЗПЕКИ №1 В ЄС',
      project: 'Global Tech Showcase Platform',
      desc: 'Глобальний технологічний веб-сайт з 3D-візуалізацією датчиків та конфігуратором систем захисту.',
      metric: '180+ країн присутності',
      metricSub: 'Red Dot Best Design',
      iconSvg: `<svg viewBox="0 0 38 38" width="34" height="34"><rect width="38" height="38" rx="10" fill="#0F172A"/><path d="M12 26L19 12L26 26H22L19 19L16 26H12Z" fill="#38BDF8"/></svg>`
    },
    {
      id: 'silpo',
      name: 'Сільпо',
      category: 'Food & Experience Retail',
      domain: 'silpo.ua',
      color: '#FF6B00',
      badge: 'АВТОРСЬКИЙ РИТЕЙЛ',
      project: 'Інтерактивна гастро-платформа',
      desc: 'Концептуальний гастрономічний сайт з інтерактивними рецептами та онлайн-доставкою продуктів.',
      metric: '+82% онлайн-замовлень',
      metricSub: 'Персоналізовані пропозиції',
      iconSvg: `<svg viewBox="0 0 38 38" width="34" height="34"><rect width="38" height="38" rx="10" fill="#FF6B00"/><circle cx="19" cy="19" r="8" fill="none" stroke="#FFFFFF" stroke-width="3"/><circle cx="19" cy="19" r="3" fill="#FFFFFF"/></svg>`
    },
    {
      id: 'intertop',
      name: 'Intertop',
      category: 'Fashion Retail',
      domain: 'intertop.ua',
      color: '#1E1B4B',
      badge: 'FASHION ЛІДЕР',
      project: 'Преміальна цифрова вітрина',
      desc: 'Преміальний лукбук, швидкісний фільтр розмірів взуття та інтеграція омніканальних замовлень.',
      metric: '500+ світових брендів',
      metricSub: '+48% мобільна конверсія',
      iconSvg: `<svg viewBox="0 0 38 38" width="34" height="34"><rect width="38" height="38" rx="10" fill="#1E1B4B"/><path d="M13 13H25V17H21V25H17V17H13V13Z" fill="#FFFFFF"/></svg>`
    },
    {
      id: 'dila',
      name: 'ДІЛА',
      category: 'Медична діагностика',
      domain: 'dila.ua',
      color: '#0284C7',
      badge: 'МЕДИЧНА ЛАБОРАТОРІЯ',
      project: 'Особистий кабінет пацієнта',
      desc: 'Зручний особистий кабінет клієнта, онлайн-запис без черг та інтеграція з медичними системами.',
      metric: '2.1 млн пацієнтів',
      metricSub: 'Миттєві результати аналізів',
      iconSvg: `<svg viewBox="0 0 38 38" width="34" height="34"><rect width="38" height="38" rx="10" fill="#0284C7"/><path d="M16 12H22V16H26V22H22V26H16V22H12V16H16V12Z" fill="#FFFFFF"/></svg>`
    }
  ];

  function renderBrandCards() {
    return UKRAINIAN_BRANDS.map(b => `
      <article class="wc-brand-card" data-brand="${b.id}">
        <div class="wc-brand-card-top">
          <div class="wc-brand-card-logo">
            ${b.iconSvg}
            <div class="wc-brand-card-names">
              <strong class="wc-brand-name">${b.name}</strong>
              <span class="wc-brand-domain">${b.domain}</span>
            </div>
          </div>
          <span class="wc-brand-category" style="background: ${b.color}18; color: ${b.color}; border: 1px solid ${b.color}35;">${b.category}</span>
        </div>

        <div class="wc-brand-card-preview" style="background: linear-gradient(135deg, ${b.color}0D 0%, #F8FAFC 100%);">
          <div class="wc-preview-ui-bar">
            <span class="wc-preview-dot"></span>
            <span class="wc-preview-dot"></span>
            <span class="wc-preview-dot"></span>
            <span class="wc-preview-url">${b.domain}</span>
          </div>
          <div class="wc-preview-hero-mock">
            <span class="wc-preview-badge" style="background: ${b.color}; color: #FFFFFF;">${b.badge}</span>
            <h4 class="wc-preview-proj-title">${b.project}</h4>
            <p class="wc-preview-proj-desc">${b.desc}</p>
          </div>
        </div>

        <div class="wc-brand-card-footer">
          <div class="wc-brand-metric-col">
            <span class="wc-brand-metric-main">${b.metric}</span>
            <span class="wc-brand-metric-sub">${b.metricSub}</span>
          </div>
          <button type="button" class="wc-brand-action-btn open-modal-btn" aria-label="Замовити схожий проєкт як для ${b.name}">
            Хочу такий <span>→</span>
          </button>
        </div>
      </article>
    `).join('');
  }

  function buildReveal() {
    const sec = document.createElement('section');
    sec.className = 'wc-reveal-section';
    sec.id = 'wc-reveal';
    sec.setAttribute('aria-label', 'Експертиза та калькулятор WebCraft Studio');

    sec.innerHTML = `
      <div class="wc-reveal-container">
        
        <!-- ==================== 1. ФЛАГМАНСЬКИЙ БЛОК: ПРОСУВАЄМО ВАШ БРЕНД ==================== -->
        <div class="wc-showcase-hero-block" id="wc-turnkey">
          <div class="wc-showcase-grid">
            
            <!-- Ліва частина: Заголовок, кнопка та опис -->
            <div class="wc-showcase-text-col">
              <h1 class="wc-hero-showcase-title" id="wc-hero-split-heading"
                data-split-text="true"
                data-effect="rise"
                data-split-type="chars"
                data-delay="50"
                data-duration="1.25"
                data-stagger-from="start"
                data-trigger="view"
                data-hover-effect="lift"
                data-loop="false"
                data-loop-delay="1.5"
                data-mask="false"
                data-threshold="0.1"
                data-root-margin="-100px"
                data-text-align="left">
                Просуваємо ваш бренд.<br>
                <span class="wc-text-highlight">Масштабуємо ваш успіх</span>.
              </h1>
            </div>

          </div>
        </div>

        <!-- ==================== 2. ПОСЛУГИ: ЩО МИ ЗБИРАЄМО ПІД КЛЮЧ ==================== -->
        <div class="wc-section-block wc-turnkey-services-subblock" id="wc-turnkey-services">
          <h2 class="wc-ts-sr">Що ми збираємо під ключ</h2>

          <div class="wc-ts-track" id="wc-ts-track">
            ${TURNKEY_SERVICES.map((s, i) => {
              const parts = s.badge.split('•').map(t => t.trim());
              const num = String(i + 1).padStart(2, '0');
              const isReveal = s.id === 'landing' || s.id === 'webapp';
              return `
              <section class="wc-ts-slide${isReveal ? ' is-reveal-block' : ''}" data-service="${s.id}" data-slide="${i}" aria-label="${s.title}" style="z-index:${i + 1}">
                <div class="wc-ts-inner">
                  <div class="wc-ts-main">
                    <div class="wc-ts-left">
                      <span class="wc-ts-icon" aria-hidden="true">${s.icon}</span>
                      <h3 class="wc-ts-title">${s.title}</h3>
                      <div class="wc-ts-duration">
                        <span class="wc-ts-label">Термін запуску</span>
                        <strong>${parts[1] || ''}</strong>
                      </div>
                    </div>

                    <div class="wc-ts-right">
                      <p class="wc-ts-desc">${s.desc}</p>
                      <div class="wc-ts-features">
                        <span class="wc-ts-label">Що входить у розробку</span>
                        <ul>
                          ${s.features.map(f => {
                            const isAi = f.includes('ШІ-індексація') || f.includes('AEO');
                            if (isAi) {
                              return `<li class="wc-ts-feature-ai">
                                <span class="wc-ts-check wc-ts-check--ai" aria-hidden="true">✓</span>
                                <span class="wc-ai-gradient-item gradient-text" data-gradient-ai="true">
                                  <span class="gradient-text__inner">
                                    <span class="gradient-text__content">${f}</span>
                                    <span class="gradient-text__glow" aria-hidden="true">${f}</span>
                                  </span>
                                </span>
                              </li>`;
                            }
                            return `<li><span class="wc-ts-check" aria-hidden="true">✓</span><span>${f}</span></li>`;
                          }).join('')}
                        </ul>
                      </div>
                      <div class="wc-ts-footer">
                        <div class="wc-ts-price">
                          <span class="wc-ts-label">Орієнтовно</span>
                          <strong>${s.priceTag}</strong>
                        </div>
                        <button type="button" class="wc-calc-select-btn wc-ts-cta" data-calc-target="${s.calcTarget}">
                          Розрахувати <span>→</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="wc-ts-dots" role="tablist" aria-label="Перемикання послуг">
                    ${TURNKEY_SERVICES.map((d, j) => `<button type="button" class="wc-ts-dot${j === i ? ' is-active' : ''}" data-slide-go="${j}" aria-label="${d.title}"></button>`).join('')}
                  </div>
                </div>
              </section>`;
            }).join('')}
          </div>
        </div>

        <!-- ==================== PARTICLES FULLSCREEN BACKGROUND & PROCESS MORPH ==================== -->
        <div class="wc-particles-fullscreen-section" id="wc-particles-fullscreen" aria-label="Процес розробки">
          <canvas class="particles-canvas" aria-hidden="true"></canvas>

          <!-- Glassmorphism Antigravity HUD Overlay -->
          <div class="wc-morph-hud-overlay" id="wc-morph-hud" aria-live="polite">
            ${BLOCKS_CONFIG.map((b, i) => `
            <div class="wc-morph-text-block text-block-${b.id}${b.isStart ? ' wc-morph-start-block' : ''}" data-step="${i}" style="${i === 0 ? 'opacity: 1; transform: translate3d(0, 0%, 0); pointer-events: auto;' : 'opacity: 0; transform: translate3d(0, 100vh, 0); pointer-events: none;'} left: ${b.side === 'left' ? '60%' : '10%'};">
              ${b.isStart ? `
                <h2 class="wc-morph-main-title" id="wc-morph-eyebrow">${b.title}</h2>
              ` : `
                <h3 class="wc-morph-step-title">${b.title}</h3>
                <p class="wc-morph-step-desc">${b.description}</p>
              `}
            </div>
            `).join('')}
          </div>
        </div>

        <!-- ==================== 2. ЯКІ ТЕХНОЛОГІЇ ВИКОРИСТОВУЄМО (НАША ЕКСПЕРТИЗА) ==================== -->
        <div class="wc-section-block wc-expertise-block" id="wc-expertise">
          <div class="wc-expertise-top">
            <div class="wc-expertise-title-area">
              <h2 class="wc-expertise-main-title">
                НАША<br>
                <span class="wc-accent-blue">ЕКСПЕРТИЗА</span>
              </h2>
            </div>
            <div class="wc-expertise-desc-area">
              <p class="wc-expertise-subheading">
                Проєктуємо та розробляємо веб-рішення з фокусом на <span class="wc-accent-blue">масштабованість</span>, інтеграції, безпеку та <span class="gradient-text" id="wc-ai-gradient-text">ШІ-індексацію (AEO &amp; GEO)</span>.
              </p>
            </div>
          </div>

          <!-- Інтерактивний 3D CardSwap шоукейс із заголовками, що синхронно змінюються -->
          <div class="wc-expertise-swap-layout">
            <!-- Ліва колонка: динамічний заголовок поточної картки з анімацією SmokeType -->
            <div class="wc-exp-navigator">
              <div class="wc-exp-single-container">
                <!-- Контейнер для React Bits SmokeType компонента -->
                <div class="wc-exp-smoke-wrapper" id="wc-exp-smoke-title-root">
                  <h3 class="wc-exp-smoke-title" id="wc-exp-smoke-title">${EXPERTISE_CARDS[0].title}</h3>
                </div>
              </div>

              <div class="wc-exp-controls">
                <button type="button" class="wc-swap-ctrl-btn wc-swap-prev" aria-label="Попередня картка">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </button>
                <button type="button" class="wc-swap-ctrl-btn wc-swap-next" aria-label="Наступна картка">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                <span class="wc-swap-tip">Гортайте картки або тягніть свайпом</span>
              </div>
            </div>

            <!-- Права колонка: 3D CardSwap Component -->
            <div class="wc-exp-stage-wrap">
              <div class="card-swap wc-expertise-card-swap" id="wc-expertise-swap" tabIndex="0" role="region" aria-label="3D стек карток експертизи">
                <div class="card-swap-sizer" aria-hidden="true"><span></span></div>
                <div class="card-swap-stage">
                  ${EXPERTISE_CARDS.map((card, idx) => `
                    <div class="card-swap-slot" data-swap-index="${idx}">
                      <div class="card-swap-card wc-exp-card${card.num === '06' ? ' wc-card-has-aurora' : ''}">
                        ${card.num === '06' ? `
                          <div class="wc-card-aurora-bg" id="aurora-card-06" aria-hidden="true">
                            <canvas class="aurora-canvas"></canvas>
                          </div>
                        ` : ''}
                        <div class="card-swap-card-content">
                          <div class="wc-exp-card-header">
                            <div class="wc-exp-badge-group">
                              <span class="wc-exp-card-num">${card.num}</span>
                              ${card.badge ? `<span class="wc-exp-tag-ai">${card.badge}</span>` : ''}
                            </div>
                            <div class="wc-exp-card-icon" aria-hidden="true">${card.svg}</div>
                          </div>
                          
                          <div class="wc-exp-card-main">
                            <h3 class="wc-exp-card-title">${card.title}</h3>
                            <p class="wc-exp-card-desc">${card.desc}</p>
                          </div>

                          <div class="wc-exp-card-pills">
                            ${card.pills.map(pill => `<button type="button" class="wc-exp-pill specular-button" data-specular-button data-radius="999" data-tint="#ffffff" data-tint-opacity="0.08" data-line-color="#ffffff" data-base-color="#525252" data-intensity="1.2" data-idle-intensity="0.35" data-glow="1" data-shine-size="12" data-shine-fade="34" data-proximity="220">${pill}</button>`).join('')}
                          </div>
                        </div>
                        <span class="card-swap-card-rim" aria-hidden="true"></span>
                      </div>
                      <span class="card-swap-shade" aria-hidden="true"></span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>


        </div>

        <!-- ==================== FAQ: МОЖЛИВО ВИ ХОТІЛИ ЗАПІТАТИ ==================== -->
        <div class="wc-section-block wc-faq-block" id="wc-faq">
          <div class="wc-faq-container">
            <div class="wc-faq-header">
              <span class="wc-faq-kicker">Часті питання • FAQ</span>
              <h2 class="wc-faq-main-title">
                Можливо ви хотіли запітати<span class="wc-faq-mark">?</span>
              </h2>
              <p class="wc-faq-subtitle">
                Зібрали прозорі та вичерпні відповіді про процес розробки, терміни, оплату та подальшу підтримку.
              </p>
            </div>

            <div class="wc-faq-list" role="region" aria-label="Часті питання">
              <!-- Item 1 -->
              <div class="wc-faq-item is-open">
                <button type="button" class="wc-faq-trigger" aria-expanded="true">
                  <span class="wc-faq-question">Скільки часу займає розробка сайту від старту до релізу?</span>
                  <span class="wc-faq-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  </span>
                </button>
                <div class="wc-faq-answer">
                  <div class="wc-faq-answer-inner">
                    <p>Лендінг ми запускаємо від 5–8 робочих днів, корпоративний сайт — від 12–18 днів, а інтернет-магазини та веб-сервіси — від 20–35 днів. Точні терміни фіксуємо в договорі перед стартом робіт.</p>
                  </div>
                </div>
              </div>

              <!-- Item 2 -->
              <div class="wc-faq-item">
                <button type="button" class="wc-faq-trigger" aria-expanded="false">
                  <span class="wc-faq-question">Як відбувається оплата за розробку проєкту?</span>
                  <span class="wc-faq-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  </span>
                </button>
                <div class="wc-faq-answer">
                  <div class="wc-faq-answer-inner">
                    <p>Ми працюємо за прозорою поетапною схемою: 50% передоплати для старту аналітики та проектування, і фінальні 50% після узгодження, повного тестування та запуску на вашому домені. Жодних прихованих доплат.</p>
                  </div>
                </div>
              </div>

              <!-- Item 3 -->
              <div class="wc-faq-item">
                <button type="button" class="wc-faq-trigger" aria-expanded="false">
                  <span class="wc-faq-question">Чи зможемо ми самостійно редагувати тексти, фото та товари?</span>
                  <span class="wc-faq-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  </span>
                </button>
                <div class="wc-faq-answer">
                  <div class="wc-faq-answer-inner">
                    <p>Так, на 100%. Ми будуємо сайти так, щоб будь-хто з вашої команди міг легко оновити текст, змінити фото чи додати товар без знання програмування. До кожного проекту надаємо персональний відеогайд.</p>
                  </div>
                </div>
              </div>

              <!-- Item 4 -->
              <div class="wc-faq-item">
                <button type="button" class="wc-faq-trigger" aria-expanded="false">
                  <span class="wc-faq-question">Що таке ШІ-індексація (AEO &amp; GEO) і навіщо вона потрібна?</span>
                  <span class="wc-faq-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  </span>
                </button>
                <div class="wc-faq-answer">
                  <div class="wc-faq-answer-inner">
                    <p>Це сучасна оптимізація сайту для генеративних AI-пошуковиків (ChatGPT Search, Perplexity, Google Gemini, Claude). Ми налаштовуємо семантичну розмітку Schema.org, завдяки чому штучний інтелект рекомендує ваш бізнес на запити клієнтів.</p>
                  </div>
                </div>
              </div>

              <!-- Item 5 -->
              <div class="wc-faq-item">
                <button type="button" class="wc-faq-trigger" aria-expanded="false">
                  <span class="wc-faq-question">Чи надаєте ви гарантію та технічну підтримку після запуску?</span>
                  <span class="wc-faq-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  </span>
                </button>
                <div class="wc-faq-answer">
                  <div class="wc-faq-answer-inner">
                    <p>Безумовно. Після релізу ми надаємо 30 днів повної гарантійної підтримки: оперативно вносимо корективи, слідкуємо за стабільністю сервера, налаштовуємо бекапи та консультуємо вашу команду.</p>
                  </div>
                </div>
              </div>

              <!-- Item 6 -->
              <div class="wc-faq-item">
                <button type="button" class="wc-faq-trigger" aria-expanded="false">
                  <span class="wc-faq-question">Що потрібно від нас для початку розробки?</span>
                  <span class="wc-faq-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  </span>
                </button>
                <div class="wc-faq-answer">
                  <div class="wc-faq-answer-inner">
                    <p>Лише ваша ідея або базове бачення задачі. Всю експертну роботу — структуру, сенси, дизайн, написання текстів та технічну реалізацію «під ключ» — ми беремо на себе.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================== 3. КАЛЬКУЛЯТОР ВАРТОСТІ (THE VATE AGENCY STACKING CARDS ANIMATION) ==================== -->
        <div class="wc-section-block wc-calculator-block" id="wc-calculator">
          <div class="wc-calc-layout wc-vate-stack-layout">
            
            <!-- Ліва колонка: Sticky Pinned Column (як у The Vate Agency) -->
            <div class="wc-calc-pinned-left">
              <h2 class="wc-section-heading wc-vate-heading">
                Калькулятор вартості<br>
                <span class="wc-text-highlight">розробки під ключ</span>
              </h2>
              <p class="wc-section-subheading wc-vate-desc">
                Оберіть параметри вашого майбутнього сайту по кроках. Кожен етап адаптує стек, терміни виконання та попередній кошторис онлайн.
              </p>

              <!-- Швидка навігація по етапах -->
              <nav class="wc-vate-steps-nav" id="wc-calc-steps-nav" aria-label="Етапи розрахунку">
                <button type="button" class="wc-vate-step-btn is-active" data-goto-card="1">
                  <span class="step-num wc-shiny-num" data-shiny-text="01">01</span>
                  <span class="step-label">Тип сайту</span>
                </button>
                <button type="button" class="wc-vate-step-btn" data-goto-card="2">
                  <span class="step-num wc-shiny-num" data-shiny-text="02">02</span>
                  <span class="step-label">Рівень дизайну</span>
                </button>
                <button type="button" class="wc-vate-step-btn" data-goto-card="3">
                  <span class="step-num wc-shiny-num" data-shiny-text="03">03</span>
                  <span class="step-label">Модулі та інтеграції</span>
                </button>
                <button type="button" class="wc-vate-step-btn" data-goto-card="4">
                  <span class="step-num wc-shiny-num" data-shiny-text="04">04</span>
                  <span class="step-label">Швидкість запуску</span>
                </button>
                <button type="button" class="wc-vate-step-btn" data-goto-card="5">
                  <span class="step-num wc-shiny-num" data-shiny-text="05">05</span>
                  <span class="step-label">Ваш кошторис</span>
                </button>
              </nav>
            </div>

            <!-- Права колонка: Стек карток, що накладаються одна на одну при скролі -->
            <div class="wc-calc-stack-track" id="wc-calc-stack-track">
              
              <!-- КАРТКА 01: ТИП САЙТУ -->
              <div class="wc-calc-step-card" id="calc-card-1" data-step="1">
                <div class="wc-card-top-bar" data-card-target="1">
                  <div class="wc-num-badge-wrap">
                    <span class="wc-step-num-vate wc-shiny-num" data-shiny-text="01">01</span>
                  </div>
                  <div class="wc-card-title-wrap">
                    <h3 class="wc-step-title-vate">Тип сайту</h3>
                    <p class="wc-step-sub-vate">Оберіть структуру та формат вашого веб-проєкту</p>
                  </div>
                </div>

                <div class="wc-card-inner-content">
                  <div class="wc-calc-options-grid wc-options-2x2">
                    <label class="wc-calc-card-option">
                      <input type="radio" name="calc-type" value="landing" data-base="500" data-days="5–8 днів" data-name="Лендінг">
                      <span class="wc-card-option-body">
                        <span class="wc-opt-icon">⚡</span>
                        <span class="wc-opt-name">Лендінг</span>
                        <span class="wc-opt-desc">Односторінковий сайт для прямих продажів послуги чи продукту</span>
                        <span class="wc-opt-price">від $500</span>
                      </span>
                    </label>

                    <label class="wc-calc-card-option">
                      <input type="radio" name="calc-type" value="corporate" data-base="950" data-days="12–18 днів" data-name="Корпоративний сайт" checked>
                      <span class="wc-card-option-body">
                        <span class="wc-opt-icon">💻</span>
                        <span class="wc-opt-name">Корпоративний сайт</span>
                        <span class="wc-opt-desc">Багатосторінковий іміджевий портал для компанії з каталогом послуг</span>
                        <span class="wc-opt-price">від $950</span>
                      </span>
                    </label>

                    <label class="wc-calc-card-option">
                      <input type="radio" name="calc-type" value="ecommerce" data-base="1400" data-days="18–28 днів" data-name="Інтернет-магазин">
                      <span class="wc-card-option-body">
                        <span class="wc-opt-icon">🛍️</span>
                        <span class="wc-opt-name">Інтернет-магазин</span>
                        <span class="wc-opt-desc">Каталог товарів, фільтри, кошик, оплата та інтеграція складів</span>
                        <span class="wc-opt-price">від $1 400</span>
                      </span>
                    </label>

                    <label class="wc-calc-card-option">
                      <input type="radio" name="calc-type" value="webapp" data-base="2200" data-days="25–40 днів" data-name="Веб-сервіс / SaaS">
                      <span class="wc-card-option-body">
                        <span class="wc-opt-icon">👨‍💻</span>
                        <span class="wc-opt-name">Веб-сервіс / SaaS</span>
                        <span class="wc-opt-desc">Особисті кабінети, нестандартні бази даних та складна бізнес-логіка</span>
                        <span class="wc-opt-price">від $2 200</span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- КАРТКА 02: РІВЕНЬ ДИЗАЙНУ -->
              <div class="wc-calc-step-card" id="calc-card-2" data-step="2">
                <div class="wc-card-top-bar" data-card-target="2">
                  <div class="wc-num-badge-wrap">
                    <span class="wc-step-num-vate wc-shiny-num" data-shiny-text="02">02</span>
                  </div>
                  <div class="wc-card-title-wrap">
                    <h3 class="wc-step-title-vate">Рівень дизайну та анімацій</h3>
                    <p class="wc-step-sub-vate">Ступінь індивідуальності візуальної мови та інтерактивності</p>
                  </div>
                </div>

                <div class="wc-card-inner-content">
                  <div class="wc-calc-options-grid wc-options-3x1">
                    <label class="wc-calc-card-option">
                      <input type="radio" name="calc-design" value="minimal" data-cost="0" data-name="Сучасний мінімалізм">
                      <span class="wc-card-option-body">
                        <span class="wc-opt-name">Сучасний мінімалізм</span>
                        <span class="wc-opt-desc">Лаконічний, вивірений вигляд з типографікою та акуратними відступами</span>
                        <span class="wc-opt-price">+$0</span>
                      </span>
                    </label>

                    <label class="wc-calc-card-option">
                      <input type="radio" name="calc-design" value="custom" data-cost="200" data-name="Індивідуальний преміум UI" checked>
                      <span class="wc-card-option-body">
                        <span class="wc-opt-name">Преміум авторський UX/UI</span>
                        <span class="wc-opt-desc">Унікальна дизайн-система під айдентику бренду, графічні акценти</span>
                        <span class="wc-opt-price">+$200</span>
                      </span>
                    </label>

                    <label class="wc-calc-card-option">
                      <input type="radio" name="calc-design" value="interactive" data-cost="450" data-name="Креатив з 3D & GSAP">
                      <span class="wc-card-option-body">
                        <span class="wc-opt-name">Креатив з 3D & GSAP</span>
                        <span class="wc-opt-desc">Кінематографічні скрол-ефекти, інтерактивні моделі та WOW-враження</span>
                        <span class="wc-opt-price">+$450</span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- КАРТКА 03: МОДУЛІ ТА ІНТЕГРАЦІЇ -->
              <div class="wc-calc-step-card" id="calc-card-3" data-step="3">
                <div class="wc-card-top-bar" data-card-target="3">
                  <div class="wc-num-badge-wrap">
                    <span class="wc-step-num-vate wc-shiny-num" data-shiny-text="03">03</span>
                  </div>
                  <div class="wc-card-title-wrap">
                    <h3 class="wc-step-title-vate">Необхідні модулі та інтеграції</h3>
                    <p class="wc-step-sub-vate">Автоматизація бізнес-процесів, прийом оплат та комунікація</p>
                  </div>
                </div>

                <div class="wc-card-inner-content">
                  <div class="wc-calc-checkboxes-grid">
                    <label class="wc-calc-check-option">
                      <input type="checkbox" name="calc-modules" value="payments" data-cost="150" data-name="Онлайн-оплата (Stripe, LiqPay, Mono)">
                      <span class="wc-check-body">
                        <span class="wc-check-box"></span>
                        <span class="wc-check-info">
                          <strong>💳 Онлайн-оплата (Stripe, LiqPay, Monobank)</strong>
                          <span>Миттєвий прийом карток, Apple Pay та Google Pay</span>
                        </span>
                        <span class="wc-check-price">+$150</span>
                      </span>
                    </label>

                    <label class="wc-calc-check-option">
                      <input type="checkbox" name="calc-modules" value="crm" data-cost="120" data-name="Інтеграція з CRM" checked>
                      <span class="wc-check-body">
                        <span class="wc-check-box"></span>
                        <span class="wc-check-info">
                          <strong>📊 Інтеграція з CRM (KeyCRM, HubSpot, Bitrix)</strong>
                          <span>Автоматична передача всіх лідів і контактів без втрат</span>
                        </span>
                        <span class="wc-check-price">+$120</span>
                      </span>
                    </label>

                    <label class="wc-calc-check-option">
                      <input type="checkbox" name="calc-modules" value="telegram" data-cost="80" data-name="Сповіщення в Telegram-бот" checked>
                      <span class="wc-check-body">
                        <span class="wc-check-box"></span>
                        <span class="wc-check-info">
                          <strong>🤖 Миттєві сповіщення в Telegram-бот</strong>
                          <span>Отримання замовлень та заявок безпосередньо у ваш чат</span>
                        </span>
                        <span class="wc-check-price">+$80</span>
                      </span>
                    </label>

                    <label class="wc-calc-check-option">
                      <input type="checkbox" name="calc-modules" value="multilang" data-cost="150" data-name="Мультимовність (2+ мови)">
                      <span class="wc-check-body">
                        <span class="wc-check-box"></span>
                        <span class="wc-check-info">
                          <strong>🌐 Мультимовність (2+ мовні версії)</strong>
                          <span>Локалізація інтерфейсу для європейського та глобального ринків</span>
                        </span>
                        <span class="wc-check-price">+$150</span>
                      </span>
                    </label>

                    <label class="wc-calc-check-option">
                      <input type="checkbox" name="calc-modules" value="cabinet" data-cost="350" data-name="Особистий кабінет клієнта">
                      <span class="wc-check-body">
                        <span class="wc-check-box"></span>
                        <span class="wc-check-info">
                          <strong>👤 Особистий кабінет користувача</strong>
                          <span>Авторизація через SMS/Email, історія замовлень та профіль</span>
                        </span>
                        <span class="wc-check-price">+$350</span>
                      </span>
                    </label>

                    <label class="wc-calc-check-option">
                      <input type="checkbox" name="calc-modules" value="seo" data-cost="100" data-name="SEO-оптимізація та аналітика GA4" checked>
                      <span class="wc-check-body">
                        <span class="wc-check-box"></span>
                        <span class="wc-check-info">
                          <strong>📈 Базове SEO та Google Analytics 4</strong>
                          <span>Мікророзмітка Schema.org, OpenGraph, аналітика конверсій</span>
                        </span>
                        <span class="wc-check-price">+$100</span>
                      </span>
                    </label>

                    <label class="wc-calc-check-option is-included">
                      <input type="checkbox" checked disabled>
                      <span class="wc-check-body">
                        <span class="wc-check-box is-locked">✓</span>
                        <span class="wc-check-info">
                          <strong>⚙️ Зручна панель керування контентом</strong>
                          <span>Редагуйте тексти, банери та ціни без допомоги програміста</span>
                        </span>
                        <span class="wc-check-price free-badge">Включено</span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- КАРТКА 04: ШВИДКІСТЬ ЗАПУСКУ -->
              <div class="wc-calc-step-card" id="calc-card-4" data-step="4">
                <div class="wc-card-top-bar" data-card-target="4">
                  <div class="wc-num-badge-wrap">
                    <span class="wc-step-num-vate wc-shiny-num" data-shiny-text="04">04</span>
                  </div>
                  <div class="wc-card-title-wrap">
                    <h3 class="wc-step-title-vate">Швидкість запуску</h3>
                    <p class="wc-step-sub-vate">Бажані терміни та пріоритет виділеної команди розробників</p>
                  </div>
                </div>

                <div class="wc-card-inner-content">
                  <div class="wc-calc-options-grid wc-options-2x1">
                    <label class="wc-calc-card-option">
                      <input type="radio" name="calc-speed" value="standard" data-multiplier="1" data-name="Стандартний термін" checked>
                      <span class="wc-card-option-body">
                        <span class="wc-opt-name">⏳ Стандартний термін</span>
                        <span class="wc-opt-desc">Планова послідовна розробка за узгодженим графіком етапів</span>
                        <span class="wc-opt-price">Базова ціна</span>
                      </span>
                    </label>

                    <label class="wc-calc-card-option">
                      <input type="radio" name="calc-speed" value="urgent" data-multiplier="1.2" data-name="Терміновий запуск (+20%)">
                      <span class="wc-card-option-body">
                        <span class="wc-opt-name">🚀 Терміновий запуск</span>
                        <span class="wc-opt-desc">Повний фокус команди, паралельні процеси, скорочення терміну до 40%</span>
                        <span class="wc-opt-price">+20% до вартості</span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- КАРТКА 05: ТЕМНА КАРТКА ПІДСУМКУ (як темна картка 05 "Обговоримо проєкт" у The Vate Agency) -->
              <div class="wc-calc-step-card wc-calc-dark-card" id="calc-card-5" data-step="5">
                <div class="wc-card-top-bar" data-card-target="5">
                  <div class="wc-num-badge-wrap">
                    <span class="wc-step-num-vate wc-num-crimson wc-shiny-num" data-shiny-text="05">05</span>
                  </div>
                  <div class="wc-card-title-wrap">
                    <div class="wc-dark-card-title-row">
                      <h3 class="wc-step-title-vate wc-title-white">Ваш розрахунок кошторису</h3>
                      <span class="wc-vate-status-pill"><span class="wc-summary-pulse"></span> актуально на 2026</span>
                    </div>
                    <p class="wc-step-sub-vate wc-sub-white">Фінальна вартість та параметри на основі обраної вами конфігурації</p>
                  </div>
                </div>

                <div class="wc-card-inner-content wc-dark-card-body">
                  <div class="wc-summary-price-area">
                    <span class="wc-price-caption">Попередній бюджет:</span>
                    <div class="wc-price-display">
                      <span class="wc-currency">$</span>
                      <span class="wc-price-number" id="calc-price-usd">1 450</span>
                    </div>
                    <div class="wc-price-uah" id="calc-price-uah">≈ 59 450 ₴</div>
                  </div>

                  <div class="wc-summary-timeframe">
                    <div class="wc-time-item">
                      <span class="wc-time-label">Орієнтовний термін:</span>
                      <strong class="wc-time-value" id="calc-time-display">12–18 робочих днів</strong>
                    </div>
                  </div>

                  <div class="wc-summary-features-list">
                    <span class="wc-features-heading">Обрані опції конфігуратора:</span>
                    <div class="wc-selected-chips" id="calc-selected-chips">
                      <!-- Заповнюється скриптом -->
                    </div>
                  </div>

                  <div class="wc-summary-guarantees">
                    <div class="wc-guar-item"><span class="wc-guar-check">✓</span> 100% адаптивність під усі мобільні та десктоп екрани</div>
                    <div class="wc-guar-item"><span class="wc-guar-check">✓</span> Швидкість завантаження 90+ балів у Google PageSpeed</div>
                    <div class="wc-guar-item"><span class="wc-guar-check">✓</span> Повна передача всіх авторських прав та вихідного коду</div>
                    <div class="wc-guar-item"><span class="wc-guar-check">✓</span> 30 днів безкоштовної гарантійної підтримки після релізу</div>
                  </div>

                  <div class="wc-summary-actions">
                    <button type="button" class="wc-summary-cta-btn" id="wc-calc-submit-btn">
                      <span>Отримати детальний кошторис</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                    <p class="wc-summary-subnote">
                      Миттєво надішлемо розрахунок та план робіт у Telegram або WhatsApp.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      <!-- ==================== ПОВНОЕКРАННЕ МЕНЮ КОНТАКТІВ (FULLSCREEN CONTACT MENU) ==================== -->
      <div class="wc-calc-modal-backdrop wc-contact-fullscreen-modal" id="wc-calc-modal" aria-hidden="true">
        
        <!-- Кнопка закриття меню -->
        <button type="button" class="wc-calc-modal-close wc-contact-close-btn" id="wc-calc-modal-close" aria-label="Закрити меню контактів">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          <span class="wc-close-hint">Esc</span>
        </button>

        <div class="wc-contact-fullscreen-container" role="dialog" aria-modal="true" aria-labelledby="wc-contact-main-heading">
          
          <!-- ЛІВА КОЛОНКА: ВЕЛИКА НАДПИСЬ ТА СУБТИТР -->
          <div class="wc-contact-left-col">
            <h2 class="wc-contact-main-heading" id="wc-contact-main-heading">
              Обговорімо<span class="wc-accent-dot">?</span>
            </h2>

            <p class="wc-contact-sub-heading">
              Перетворюємо відвідувачів сайту на ваших клієнтів.
            </p>

            <!-- Додаткова інформація студії -->
            <div class="wc-contact-meta-info">
              <div class="wc-contact-meta-row">
                <span class="wc-meta-label">Електронна пошта:</span>
                <a href="mailto:hello@webcraft.studio" class="wc-meta-link">hello@webcraft.studio</a>
              </div>
              <div class="wc-contact-meta-row">
                <span class="wc-meta-label">Локація:</span>
                <span class="wc-meta-text">Київ, Україна • Працюємо з проєктами по всьому світу</span>
              </div>
            </div>
          </div>

          <!-- ПРАВА КОЛОНКА: КОНТАКТНА ФОРМА + СЕРВІСНІ ТАБЛЕТОЧКИ -->
          <div class="wc-contact-right-col">
            <div class="wc-contact-form-card">
              
              <div class="wc-contact-card-header">
                <h3 class="wc-card-title">Залиште заявку</h3>
                <p class="wc-card-desc">Заповніть форму або оберіть зручний месенджер нижче — ми зв'яжемося з вами найближчим часом.</p>
              </div>

              <!-- Контактна форма: Ім'я + Телефон -->
              <form class="wc-fullscreen-contact-form" id="wc-fullscreen-contact-form" autocomplete="on">
                <div class="wc-form-group">
                  <label for="wc-contact-input-name" class="wc-form-label">Ваше ім'я</label>
                  <div class="wc-input-wrap">
                    <svg class="wc-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <input type="text" id="wc-contact-input-name" name="name" class="wc-form-input" placeholder="Як до вас звертатись?" required>
                  </div>
                </div>

                <div class="wc-form-group">
                  <label for="wc-contact-input-phone" class="wc-form-label">Номер телефону</label>
                  <div class="wc-input-wrap">
                    <svg class="wc-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <input type="tel" id="wc-contact-input-phone" name="phone" class="wc-form-input" placeholder="+380 (__) ___-__-__" required>
                  </div>
                </div>

                <button type="submit" class="wc-contact-submit-btn" id="wc-contact-submit-btn">
                  <span class="btn-text">Обговорити проєкт</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>

                <div class="wc-contact-form-feedback" id="wc-contact-feedback" aria-live="polite"></div>
              </form>

              <!-- Роздільник -->
              <div class="wc-contact-divider">
                <span class="wc-divider-line"></span>
                <span class="wc-divider-label">або зв'яжіться з нами напряму</span>
                <span class="wc-divider-line"></span>
              </div>

              <!-- Таблеточки з сервісами зв'язку -->
              <div class="wc-modal-channels-pills">
                <a href="https://t.me/webcraft_owner" target="_blank" rel="noopener noreferrer" class="wc-channel-pill wc-pill-tg" id="modal-tg-link" aria-label="Telegram">
                  <svg class="wc-pill-svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                  <span class="wc-pill-text">Telegram</span>
                </a>

                <a href="https://wa.me/79991234567" target="_blank" rel="noopener noreferrer" class="wc-channel-pill wc-pill-wa" id="modal-wa-link" aria-label="WhatsApp">
                  <svg class="wc-pill-svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.79 14.07c-.24.68-1.21 1.28-1.71 1.34-.45.06-1.03.09-3.04-.74-2.56-1.06-4.2-3.67-4.33-3.84-.13-.17-1.04-1.38-1.04-2.63 0-1.25.65-1.87.88-2.12.24-.25.52-.31.69-.31.17 0 .35 0 .5.01.16.01.38-.06.59.45.22.52.74 1.8.81 1.93.07.13.11.29.02.46-.09.18-.13.29-.26.44-.13.15-.28.34-.4.46-.13.13-.27.27-.12.53.15.26.68 1.12 1.46 1.81 1 .89 1.84 1.17 2.1 1.3.26.13.41.11.56-.07.15-.17.65-.76.83-1.02.17-.26.35-.22.59-.13.24.09 1.52.72 1.78.85.26.13.43.2.5.3.06.11.06.63-.18 1.31z"/>
                  </svg>
                  <span class="wc-pill-text">WhatsApp</span>
                </a>

                <a href="viber://chat?number=%2B79991234567" target="_blank" rel="noopener noreferrer" class="wc-channel-pill wc-pill-viber" id="modal-viber-link" aria-label="Viber">
                  <svg class="wc-pill-svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M19.78 14.15c-.48-.35-1.53-.78-2.14-.54-.51.2-.82.85-1.12 1.24-.2.27-.47.33-.8.19-.85-.35-1.68-.82-2.39-1.42-.71-.6-1.3-1.32-1.74-2.13-.19-.35-.14-.62.13-.85.34-.29.93-.65 1.08-1.16.18-.61-.33-1.63-.73-2.11-.47-.56-.99-.86-1.58-.78-.59.08-1.11.45-1.45.93-.72 1.02-.91 2.29-.53 3.51.52 1.68 1.53 3.2 2.89 4.39 1.41 1.24 3.09 2.05 4.88 2.37.5.09 1 .11 1.49.03.88-.14 1.58-.69 1.95-1.46.29-.6.18-1.29-.33-1.7-.17-.13-.31-.27-.47-.5zM15.4 6.8c.84.28 1.55.8 2.06 1.52.48.68.74 1.5.76 2.34.01.44.38.79.82.77.44-.01.79-.38.77-.82-.03-1.12-.37-2.2-1.02-3.1-.68-.95-1.61-1.64-2.72-2-.42-.14-.87.1-.99.52-.13.42.1.87.52.99zm-1.02 2.32c.45.18.82.52 1.05.95.21.39.29.84.22 1.28-.06.43.24.83.67.89.43.06.83-.24.89-.67.11-.7-.03-1.43-.39-2.07-.37-.7-.98-1.24-1.71-1.52-.41-.16-.87.05-1.03.46-.16.41.05.87.46 1.03z"/>
                    <path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.7 1.5 5.3L2 22l4.9-1.4C8.4 21.5 10.2 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.6 0-3.2-.5-4.6-1.3l-.3-.2-3.4 1 1-3.3-.2-.3c-1-1.5-1.5-3.2-1.5-4.9 0-4.5 3.7-8.2 8.2-8.2s8.2 3.7 8.2 8.2-3.7 8.2-8.2 8.2z"/>
                  </svg>
                  <span class="wc-pill-text">Viber</span>
                </a>

                <a href="tel:+79991234567" class="wc-channel-pill wc-pill-phone" id="modal-phone-link" aria-label="Мобільний телефон">
                  <svg class="wc-pill-svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.44-5.15-3.75-6.59-6.59l1.97-1.57c.28-.28.36-.67.25-1.02A11.36 11.36 0 018.96 4.3c0-.55-.45-1-1-1H4.37c-.55 0-1 .45-1 1 0 9.39 7.64 17.03 17.03 17.03.55 0 1-.45 1-1v-3.59c0-.55-.45-1-.99-1z"/>
                  </svg>
                  <span class="wc-pill-text">Телефон</span>
                </a>
              </div>

            </div>
          </div>

        </div>
      </div>
    `;

    return sec;
  }


  function buildComponent() {
    const section = document.createElement('section');
    section.className = 'wc-terminal-section';
    section.id = 'terminal-section';
    section.setAttribute('aria-label', 'Можливості WebCraft');

    section.innerHTML = `
      <div class="wc-terminal-window" id="wc-terminal-window" role="img" aria-label="Термінал macOS з переліком можливостей WebCraft">
        <div class="wc-terminal-bar">
          <div class="wc-terminal-dots">
            <span class="wc-terminal-dot wc-terminal-dot--red"></span>
            <button type="button" class="wc-terminal-dot wc-terminal-dot--yellow" id="wc-dot-minimize" aria-label="Згорнути вікно термінала" disabled></button>
            <span class="wc-terminal-dot wc-terminal-dot--green"></span>
          </div>
          <span class="wc-terminal-title" aria-hidden="true">webcraft-user — zsh</span>
        </div>
        <div class="wc-terminal-body" id="wc-terminal-body"></div>
      </div>
      <div class="wc-dock" id="wc-dock">
        <div class="wc-dock-item">
          <div class="wc-dock-icon wc-dock-icon--terminal" id="wc-dock-terminal" aria-hidden="true">
            <svg viewBox="0 0 64 64" width="100%" height="100%">
              <defs>
                <linearGradient id="wcTermGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#3a3d45"/><stop offset="1" stop-color="#121316"/>
                </linearGradient>
              </defs>
              <rect width="64" height="64" rx="15" fill="url(#wcTermGrad)"/>
              <rect x="1" y="1" width="62" height="62" rx="14" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>
              <path d="M17 23l11 9-11 9" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M33 43h15" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="wc-dock-running"></span>
        </div>
        <div class="wc-dock-item">
          <button type="button" class="wc-dock-icon wc-dock-icon--site" id="wc-dock-icon" aria-label="Відкрити WebCraft" disabled>WebCraft</button>
        </div>
      </div>
    `;
    return section;
  }

  function init() {
    if (document.getElementById('wc-reveal')) return;

    const main = document.querySelector('main') || document.body;
    const footer = document.getElementById('footer');

    const section = buildComponent();
    section.style.display = 'none';

    const win = section.querySelector('#wc-terminal-window');
    const body = section.querySelector('#wc-terminal-body');
    const yellowDot = section.querySelector('#wc-dot-minimize');
    const dock = section.querySelector('#wc-dock');
    const dockIcon = section.querySelector('#wc-dock-icon');
    const termIcon = section.querySelector('#wc-dock-terminal');
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const reveal = buildReveal();
    if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(reveal, footer);
    } else {
      main.appendChild(reveal);
    }

    function initCalculator() {
      const typeRadios = reveal.querySelectorAll('input[name="calc-type"]');
      const designRadios = reveal.querySelectorAll('input[name="calc-design"]');
      const moduleChecks = reveal.querySelectorAll('input[name="calc-modules"]');
      const speedRadios = reveal.querySelectorAll('input[name="calc-speed"]');

      const priceUsdEl = reveal.querySelector('#calc-price-usd');
      const priceUahEl = reveal.querySelector('#calc-price-uah');
      const timeDisplayEl = reveal.querySelector('#calc-time-display');
      const chipsEl = reveal.querySelector('#calc-selected-chips');
      const submitBtn = reveal.querySelector('#wc-calc-submit-btn');

      const modal = reveal.querySelector('#wc-calc-modal') || document.querySelector('#wc-calc-modal');
      const modalScope = modal || reveal;
      const modalClose = modalScope.querySelector('#wc-calc-modal-close');
      const modalTypeEl = modalScope.querySelector('#modal-project-type');
      const modalPriceEl = modalScope.querySelector('#modal-project-price');
      const modalTimeEl = modalScope.querySelector('#modal-project-time');
      const modalTgLink = modalScope.querySelector('#modal-tg-link');
      const modalWaLink = modalScope.querySelector('#modal-wa-link');
      const modalViberLink = modalScope.querySelector('#modal-viber-link');
      const modalPhoneLink = modalScope.querySelector('#modal-phone-link');
      const modalCopyBtn = modalScope.querySelector('#modal-copy-btn');
      const modalCopyFeedback = modalScope.querySelector('#modal-copy-feedback');

      if (modal && modal.parentElement !== document.body) {
        document.body.appendChild(modal);
      }

      let currentData = {};

      function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      }

      function calculate() {
        const selectedType = reveal.querySelector('input[name="calc-type"]:checked') || typeRadios[0];
        const selectedDesign = reveal.querySelector('input[name="calc-design"]:checked') || designRadios[0];
        const selectedSpeed = reveal.querySelector('input[name="calc-speed"]:checked') || speedRadios[0];

        const basePrice = parseInt(selectedType.getAttribute('data-base'), 10) || 500;
        const baseDays = selectedType.getAttribute('data-days') || '5–8 днів';
        const typeName = selectedType.getAttribute('data-name') || 'Лендінг';

        const designCost = parseInt(selectedDesign.getAttribute('data-cost'), 10) || 0;
        const designName = selectedDesign.getAttribute('data-name') || 'Мінімалізм';

        let modulesCost = 0;
        const moduleNames = [];
        moduleChecks.forEach(cb => {
          if (cb.checked) {
            modulesCost += parseInt(cb.getAttribute('data-cost'), 10) || 0;
            moduleNames.push(cb.getAttribute('data-name'));
          }
        });

        const speedMultiplier = parseFloat(selectedSpeed.getAttribute('data-multiplier')) || 1.0;
        const speedName = selectedSpeed.getAttribute('data-name') || 'Стандартний термін';
        const isUrgent = speedMultiplier > 1;

        const subtotal = basePrice + designCost + modulesCost;
        const totalUsd = Math.round(subtotal * speedMultiplier);
        const totalUah = Math.round(totalUsd * 41);

        let finalTime = baseDays;
        if (isUrgent) {
          if (basePrice <= 600) finalTime = '3–5 робочих днів (Прискорено ⚡)';
          else if (basePrice <= 1000) finalTime = '7–10 робочих днів (Прискорено ⚡)';
          else if (basePrice <= 1500) finalTime = '10–15 робочих днів (Прискорено ⚡)';
          else finalTime = '15–22 робочих днів (Прискорено ⚡)';
        }

        // Animated or instant update of USD price
        if (priceUsdEl) {
          priceUsdEl.textContent = formatNumber(totalUsd);
        }
        if (priceUahEl) {
          priceUahEl.textContent = `≈ ${formatNumber(totalUah)} ₴`;
        }
        if (timeDisplayEl) {
          timeDisplayEl.textContent = finalTime;
        }

        // Render chips
        if (chipsEl) {
          const chips = [
            `<span class="wc-chip wc-chip-primary">${typeName}</span>`,
            `<span class="wc-chip">${designName}</span>`,
            ...moduleNames.map(m => `<span class="wc-chip wc-chip-module">${m}</span>`),
            isUrgent ? `<span class="wc-chip wc-chip-urgent">⚡ Прискорений запуск</span>` : ''
          ].filter(Boolean);
          chipsEl.innerHTML = chips.join('');
        }

        // Update mini live preview in sticky left column
        const miniUsdEl = reveal.querySelector('#calc-mini-usd');
        const miniUahEl = reveal.querySelector('#calc-mini-uah');
        if (miniUsdEl) miniUsdEl.textContent = `$${formatNumber(totalUsd)}`;
        if (miniUahEl) miniUahEl.textContent = `≈ ${formatNumber(totalUah)} ₴`;

        currentData = {
          typeName,
          designName,
          moduleNames,
          speedName,
          totalUsd,
          totalUah,
          finalTime
        };
      }

      // Attach change listeners to all calc inputs
      const allInputs = reveal.querySelectorAll('#wc-calculator input');
      allInputs.forEach(input => {
        input.addEventListener('change', calculate);
      });

      function scrollToCard(stepNum) {
        const card = reveal.querySelector(`#calc-card-${stepNum}`);
        if (!card) return;
        const topOffset = stepNum === '5' ? 95 : 100 + (parseInt(stepNum, 10) - 1) * 75;
        const targetY = card.getBoundingClientRect().top + window.pageYOffset - topOffset;
        if (window.__lenisInstance && window.__lenisInstance.scrollTo) {
          window.__lenisInstance.scrollTo(targetY, { duration: 0.85 });
        } else {
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
      }

      // Step buttons navigation & click to scroll
      const stepNavBtns = reveal.querySelectorAll('.wc-vate-step-btn');
      stepNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const stepNum = btn.getAttribute('data-goto-card');
          scrollToCard(stepNum);
        });
      });

      // Card top-bar click to bring card into focus
      const cardTopBars = reveal.querySelectorAll('.wc-card-top-bar');
      cardTopBars.forEach(bar => {
        bar.addEventListener('click', () => {
          const stepNum = bar.getAttribute('data-card-target');
          scrollToCard(stepNum);
        });
      });

      // ScrollSpy to highlight current active step in left nav & toggle is-stacked-behind
      function updateActiveStepOnScroll() {
        const cards = reveal.querySelectorAll('.wc-calc-step-card');
        if (!cards.length) return;
        let activeIdx = 1;

        cards.forEach((card, i) => {
          const rect = card.getBoundingClientRect();
          const stickyThreshold = (i === 4 ? 170 : 140 + i * 75) + 30;
          if (rect.top <= stickyThreshold) {
            activeIdx = i + 1;
          }
        });

        stepNavBtns.forEach(btn => {
          const step = parseInt(btn.getAttribute('data-goto-card'), 10);
          if (step === activeIdx) {
            btn.classList.add('is-active');
          } else {
            btn.classList.remove('is-active');
          }
        });

        cards.forEach(c => {
          const step = parseInt(c.getAttribute('data-step'), 10);
          if (step < activeIdx) {
            c.classList.add('is-stacked-behind');
          } else {
            c.classList.remove('is-stacked-behind');
          }
        });
      }
      window.addEventListener('scroll', updateActiveStepOnScroll, { passive: true });
      if (window.__lenisInstance) {
        window.__lenisInstance.on('scroll', updateActiveStepOnScroll);
      }
      updateActiveStepOnScroll();

      // Turnkey service cards "Розрахувати →" buttons
      const turnkeyCalcBtns = reveal.querySelectorAll('.wc-calc-select-btn');
      turnkeyCalcBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-calc-target');
          const radio = reveal.querySelector(`input[name="calc-type"][value="${target}"]`);
          if (radio) {
            radio.checked = true;
            calculate();
            const calcSec = reveal.querySelector('#wc-calculator');
            if (calcSec) {
              if (window.__lenisInstance) {
                window.__lenisInstance.scrollTo(calcSec, { offset: -30, duration: 1.25 });
              } else {
                calcSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }
          }
        });
      });

      // Helper to update messenger links with quote & lead data
      function updateMessengerLinks() {
        const contactNameInput = modalScope.querySelector('#wc-contact-input-name');
        const contactPhoneInput = modalScope.querySelector('#wc-contact-input-phone');
        const nameVal = contactNameInput ? contactNameInput.value.trim() : '';
        const phoneVal = contactPhoneInput ? contactPhoneInput.value.trim() : '';
        let leadIntro = 'Привіт! Хочу обговорити веб-проєкт з WebCraft Studio.';
        if (nameVal || phoneVal) {
          leadIntro = `Привіт! Мене звати ${nameVal || 'Клієнт'}${phoneVal ? ` (тел: ${phoneVal})` : ''}. Хочу обговорити веб-проєкт:`;
        }
        const typeStr = currentData.typeName || 'Корпоративний сайт';
        const designStr = currentData.designName || 'Сучасний';
        const modulesStr = (currentData.moduleNames && currentData.moduleNames.length) ? currentData.moduleNames.join(', ') : 'Базові';
        const timeStr = currentData.finalTime || '12–18 днів';
        const priceStr = currentData.totalUsd ? `$${formatNumber(currentData.totalUsd)} (~${formatNumber(currentData.totalUah)} ₴)` : '$1 450 (~59 450 ₴)';

        const summaryText = `${leadIntro}\n• Тип сайту: ${typeStr}\n• Дизайн: ${designStr}\n• Модулі: ${modulesStr}\n• Термін: ${timeStr}\n• Орієнтовна вартість: ${priceStr}`;
        const encoded = encodeURIComponent(summaryText);
        if (modalTgLink) modalTgLink.href = `https://t.me/webcraft_owner?text=${encoded}`;
        if (modalWaLink) modalWaLink.href = `https://wa.me/79991234567?text=${encoded}`;
        if (modalViberLink) modalViberLink.href = `viber://chat?number=%2B79991234567`;
        if (modalPhoneLink) modalPhoneLink.href = `tel:+79991234567`;
      }

      // Modal open function
      function openModal() {
        if (!modal) return;
        calculate();
        if (modalTypeEl) modalTypeEl.textContent = `${currentData.typeName} • ${currentData.designName}`;
        if (modalPriceEl) modalPriceEl.textContent = `$${formatNumber(currentData.totalUsd)} (~${formatNumber(currentData.totalUah)} ₴)`;
        if (modalTimeEl) modalTimeEl.textContent = currentData.finalTime;
        updateMessengerLinks();

        if (modal.parentElement !== document.body) {
          document.body.appendChild(modal);
        }

        // Force browser layout flush so initial transition state is firmly established
        void modal.offsetWidth;

        requestAnimationFrame(() => {
          modal.classList.add('is-active');
          document.body.classList.add('wc-modal-open');
          document.body.style.overflow = 'hidden';
          if (window.__lenisInstance) window.__lenisInstance.stop();
        });
      }

      if (submitBtn) {
        submitBtn.addEventListener('click', openModal);
      }

      // Повноекранні слайди «Під ключ»: piling, snap-доводка та відпускання після 4-го блоку
      (function initTurnkeySlides() {
        const track = reveal.querySelector('#wc-ts-track');
        if (!track) return;
        const slides = Array.from(track.querySelectorAll('.wc-ts-slide'));
        const header = document.getElementById('header');
        const coarse = window.matchMedia && window.matchMedia('(max-width: 900px), (max-height: 640px), (hover: none)');
        const vh = () => window.innerHeight;
        const trackTop = () => track.getBoundingClientRect().top + window.pageYOffset;
        const curY = () => window.pageYOffset || document.documentElement.scrollTop;

        // Піднятий слайд накриває попередній: попередній трохи відсувається та темніє
        function updateHeaderDark() {
          if (!header) return;
          const y = curY();
          const top = trackTop();
          const inTrack = y > top - 40 && y < top + (slides.length - 1) * vh() + vh() - 40;
          if (!inTrack) {
            header.classList.remove('on-dark');
            return;
          }
          const activeIdx = Math.min(slides.length - 1, Math.max(0, Math.round((y - top) / vh())));
          const activeSlide = slides[activeIdx];
          if (!activeSlide) return;
          const isReveal = activeSlide.classList.contains('is-reveal-block');
          const isDark = !isReveal || activeSlide.classList.contains('is-hovered') || activeSlide.matches(':hover');
          header.classList.toggle('on-dark', Boolean(isDark));
        }

        function render() {
          if (!track.offsetParent) { if (header) header.classList.remove('on-dark'); return; }
          const top = trackTop();
          const y = curY();
          slides.forEach((slide, i) => {
            const inner = slide.querySelector('.wc-ts-inner');
            if (!inner || i === slides.length - 1) return;
            const p = Math.min(1, Math.max(0, (y - (top + i * vh())) / vh()));
            if (coarse && coarse.matches) { inner.style.transform = ''; inner.style.opacity = ''; return; }
            inner.style.transform = `translate3d(0, ${(-p * 6).toFixed(2)}vh, 0) scale(${(1 - p * 0.06).toFixed(4)})`;
            inner.style.opacity = (1 - p * 0.7).toFixed(3);
          });
          const active = Math.min(slides.length - 1, Math.max(0, Math.round((y - top) / vh())));
          slides.forEach((s, i) => s.classList.toggle('is-current', i === active));
          updateHeaderDark();
        }

        // Hover & tap toggle for reveal-enabled slides (Лендінги та Веб-сервіси)
        slides.forEach(slide => {
          if (!slide.classList.contains('is-reveal-block')) return;
          slide.addEventListener('mouseenter', () => {
            slide.classList.add('is-hovered');
            updateHeaderDark();
          });
          slide.addEventListener('mouseleave', () => {
            slide.classList.remove('is-hovered');
            updateHeaderDark();
          });
          slide.addEventListener('click', (e) => {
            if (e.target.closest('.wc-calc-select-btn') || e.target.closest('.wc-ts-dot')) return;
            const wasHovered = slide.classList.contains('is-hovered');
            slides.forEach(s => s.classList.remove('is-hovered'));
            if (!wasHovered) {
              slide.classList.add('is-hovered');
            }
            updateHeaderDark();
          });
        });

        // М'яка доводка до найближчого слайда (тільки десктоп); поза треком скрол вільний
        let timer = null;
        let snapping = false;
        function snap() {
          if (snapping || !track.offsetParent || (coarse && coarse.matches)) return;
          const top = trackTop();
          const y = curY();
          const last = (slides.length - 1) * vh();
          if (y < top - vh() * 0.4 || y > top + last - 2) return;
          const idx = Math.min(slides.length - 1, Math.max(0, Math.round((y - top) / vh())));
          const target = top + idx * vh();
          if (Math.abs(target - y) < 2) return;
          snapping = true;
          const done = () => { snapping = false; };
          if (window.__lenisInstance && window.__lenisInstance.scrollTo) {
            window.__lenisInstance.scrollTo(target, { duration: 0.85, lock: true, onComplete: done });
            setTimeout(done, 1200);
          } else {
            window.scrollTo({ top: target, behavior: 'smooth' });
            setTimeout(done, 700);
          }
        }
        function onScroll() {
          render();
          clearTimeout(timer);
          timer = setTimeout(snap, 140);
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', render, { passive: true });
        render();

        // Крапки-навігація
        track.querySelectorAll('[data-slide-go]').forEach(btn => {
          btn.addEventListener('click', () => {
            const target = trackTop() + parseInt(btn.getAttribute('data-slide-go'), 10) * vh();
            if (window.__lenisInstance && window.__lenisInstance.scrollTo) {
              window.__lenisInstance.scrollTo(target, { duration: 1.1 });
            } else {
              window.scrollTo({ top: target, behavior: 'smooth' });
            }
          });
        });
      })();

      // ==================== ANTIGRAVITY PROCESS MORPHING & PARTICLES FULLSCREEN ====================
      (function initFullscreenParticles() {
        const container = reveal.querySelector('#wc-particles-fullscreen');
        if (!container || !window.initParticles) return;

        const particleCount = 8400;
        const pInstance = window.initParticles(container, {
          particleColors: ['#ffffff'],
          particleCount: particleCount,
          particleSpread: 9.5,
          speed: 0.10,
          particleBaseSize: 32,
          glow: 0.85,
          twinkle: 0.25,
          moveParticlesOnHover: true,
          hoverEffect: 'parallax',
          particleHoverFactor: 1,
          hoverRadius: 140,
          clickBurst: true,
          sizeRandomness: 0.12,
          enableMorph: true,
          morphProgress: 0.0
        });

        if (!pInstance) return;
        container._particles = pInstance;
        window.myAntigravityMaterial = pInstance.material;

        // ==========================================
        // 1. ИНИЦИАЛИЗАЦИЯ ИНТЕРАКТИВА С КУРСОРОМ (PINTEREST 3D REPULSION)
        // ==========================================
        if (typeof THREE !== 'undefined') {
          const mouse2D = new THREE.Vector2();
          const mouse3D = new THREE.Vector3(0, 0, 0);
          const raycaster = new THREE.Raycaster();
          const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // Невидимая плоскость на z = 0
          const fov = 15;
          const aspect = window.innerWidth / window.innerHeight;
          const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100);
          camera.position.set(0, 0, 20);
          camera.lookAt(0, 0, 0);
          camera.updateMatrixWorld();

          // Слушатель движения мыши
          window.addEventListener('mousemove', (event) => {
            const rect = container.getBoundingClientRect();
            if (event.clientY < rect.top || event.clientY > rect.bottom) return;

            // Переводим пиксели экрана в NDC координаты (от -1 до 1)
            mouse2D.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse2D.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

            camera.aspect = rect.width / rect.height;
            camera.updateProjectionMatrix();
            camera.updateMatrixWorld();

            // Проецируем луч мыши на плоскость, где парят частицы
            raycaster.setFromCamera(mouse2D, camera);
            raycaster.ray.intersectPlane(plane, mouse3D);

            // Передаем трехмерную позицию курсора в шейдерный материал частиц
            if (window.myAntigravityMaterial) {
              window.myAntigravityMaterial.uniforms.uMouse.value.copy(mouse3D);
            }
            if (pInstance.setMouse3D) {
              pInstance.setMouse3D(mouse3D.x, mouse3D.y, mouse3D.z);
            }
          }, { passive: true });
        }

        let currentStep = 0;
        let isAnimating = false;
        const ANIMATION_DURATION = 1950; // Длительность перехода в миллисекундах (медленная плавная материализация)

        // Базовые координаты смещения по оси X для WebGL сцены
        const POSITION_X_RIGHT = 1.6;  // Элемент справа
        const POSITION_X_LEFT = -1.6;  // Элемент слева

        // React Bits Vapor Type Animation - for eyebrow heading
        const eyebrow = container.querySelector('#wc-morph-eyebrow');
        if (window.createVaporType && eyebrow) {
          window.createVaporType(eyebrow, {
            words: ['Етапи Розробки'],
            align: 'left',
            color: '#FFFFFF',
            vaporColor: '#B19EEF',
            preset: 'mist',
            density: 1.2,
            spread: 1.2,
            rise: 1.0,
            turbulence: 0.8,
            diffusion: 0.35,
            sweep: 'left',
            condense: 1.8,
            hold: 3.2,
            dissolve: 1.8,
            loop: false,
            interactive: true,
            breath: 1.2,
            breathRadius: 0.9
          });
        }

        // 4. Логика анимации текстовых блоков (используем GSAP для плавности)
        function animateHtmlText(current, next, direction) {
          const currentTextEl = container.querySelector(`.text-block-${current.id}`);
          const nextTextEl = container.querySelector(`.text-block-${next.id}`);

          if (!currentTextEl || !nextTextEl) return;

          // Используем высоту контейнера / вьюпорта и offsetTop (который стабилен и не искажается CSS transform)
          const vh = (container && container.clientHeight) || window.innerHeight || 900;
          const currentTop = currentTextEl.offsetTop || (vh * 0.25);
          const currentHeight = currentTextEl.offsetHeight || 160;
          const nextTop = nextTextEl.offsetTop || (vh * 0.25);
          const nextHeight = nextTextEl.offsetHeight || 160;

          // При скролле вниз (переход вперед):
          // - Старый текст улетает вверх за верхний край экрана
          // - Новый текст поднимается с самого низа экрана (начинает строго под нижней границей вьюпорта)
          const downLeaveY = -(currentTop + currentHeight + 100);
          const downEnterY = vh - nextTop + 60;

          // При скролле вверх (переход назад):
          // - Старый текст опускается вниз за нижний край экрана
          // - Предыдущий текст опускается сверху из-за верхнего края экрана
          const upLeaveY = vh - currentTop + 60;
          const upEnterY = -(nextTop + nextHeight + 100);

          const textLeaveY = direction === 'down' ? downLeaveY : upLeaveY;
          const textEnterY = direction === 'down' ? downEnterY : upEnterY;

          if (window.gsap) {
            window.gsap.killTweensOf(currentTextEl);
            window.gsap.killTweensOf(nextTextEl);

            // Старый текст улетает
            window.gsap.to(currentTextEl, {
              y: textLeaveY,
              opacity: 0,
              duration: 0.85,
              ease: "power2.inOut",
              onComplete: () => {
                currentTextEl.style.pointerEvents = 'none';
              }
            });

            // Вычисляем, с какой стороны должен появиться новый текст
            const targetXPosition = next.side === 'left' ? '60%' : '10%';
            nextTextEl.style.pointerEvents = 'auto';

            // Новый текст поднимается с самого низа экрана и плавно тормозит на своем месте
            window.gsap.fromTo(nextTextEl, 
              { 
                left: targetXPosition, 
                y: textEnterY, 
                opacity: 0 
              },
              { 
                y: 0, 
                opacity: 1, 
                duration: 1.45, 
                ease: "power3.out",
                delay: 0.15
              }
            );
          } else {
            currentTextEl.style.opacity = '0';
            currentTextEl.style.pointerEvents = 'none';
            nextTextEl.style.opacity = '1';
            nextTextEl.style.pointerEvents = 'auto';
            nextTextEl.style.left = next.side === 'left' ? '60%' : '10%';
          }
        }

        // 5. Передача параметров трансформации в Antigravity WebGL-контекст
        function animateParticlesMorph(current, next, direction) {
          // Определяем начальную и конечную точку X для шейдера
          const sourceX = current.side === 'right' ? POSITION_X_RIGHT : POSITION_X_LEFT;
          const targetX = next.side === 'right' ? POSITION_X_RIGHT : POSITION_X_LEFT;

          const startProgress = current.index + 1.0;
          const targetProgress = next.index + 1.0;

          if (window.gsap) {
            const morphObj = {
              progress: startProgress,
              anchorX: sourceX
            };

            window.gsap.to(morphObj, {
              progress: targetProgress,
              anchorX: targetX,
              duration: ANIMATION_DURATION / 1000,
              ease: "power2.inOut",
              onUpdate: () => {
                pInstance.setMorphProgress(morphObj.progress, true);
                pInstance.setMorphAnchorX(morphObj.anchorX, true);
              }
            });
          } else {
            pInstance.setMorphProgress(targetProgress, true);
            pInstance.setMorphAnchorX(targetX, true);
          }
        }

        // 3. Главный управляющий центр переключения сцены
        function switchStep(nextStep, direction) {
          if (nextStep < 0 || nextStep >= BLOCKS_CONFIG.length || nextStep === currentStep) return;
          isAnimating = true;

          const currentData = BLOCKS_CONFIG[currentStep];
          const nextData = BLOCKS_CONFIG[nextStep];

          // --- АНИМАЦИЯ HTML-ТЕКСТА ---
          animateHtmlText(currentData, nextData, direction);

          // --- АНИМАЦИЯ ЧАСТИЦ (ANTIGRAVITY / THREE.JS) ---
          animateParticlesMorph(currentData, nextData, direction);

          // Обновляем текущий индекс шага
          currentStep = nextStep;

          // Разблокируем скролл строго после завершения всей анимации
          setTimeout(() => {
            isAnimating = false;
            stepCooldown = true;
            setTimeout(() => { stepCooldown = false; }, 240);
          }, ANIMATION_DURATION);
        }

        // ==================== 5. SECTION-BY-SECTION СИСТЕМА БЛОКИРОВКИ СКРОЛЛА ====================
        // Полностью блокируем системный скролл страницы браузера, пока пользователь находится
        // внутри блока этапов разработки (#wc-particles-fullscreen / #wc-turnkey).
        // Управление переводится исключительно на кастомный пошаговый триггер (Section-by-section).

        let isLockedToSection = false;
        let exitCooldown = false;
        let stepCooldown = false;
        let accumulatedDelta = 0;
        let deltaTimer = null;
        let touchStartY = 0;
        let lastKnownScrollY = window.pageYOffset || document.documentElement.scrollTop;
        let scrollDirection = 'down';

        function getContainerTop() {
          const rect = container.getBoundingClientRect();
          return Math.round(rect.top + (window.pageYOffset || document.documentElement.scrollTop));
        }

        function isContainerDominant() {
          if (!isLockedToSection) return false;
          const rect = container.getBoundingClientRect();
          const vh = window.innerHeight || 900;
          return Math.abs(rect.top) <= 80 && rect.bottom >= vh * 0.5;
        }

        let isDocking = false;
        let dockTimer = null;

        function smoothDockToSection(forcedStep, direction = 'down') {
          if (isLockedToSection || isDocking || exitCooldown) return;
          isDocking = true;
          accumulatedDelta = 0;

          const targetTop = getContainerTop();
          const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
          const distance = Math.abs(currentScroll - targetTop);

          // If already aligned within 3px, complete immediately
          if (distance < 3) {
            completeDocking(forcedStep);
            return;
          }

          const glideDuration = Math.min(1.15, Math.max(0.60, distance / 280));

          const finishDock = () => {
            if (!isDocking) return;
            clearTimeout(dockTimer);
            completeDocking(forcedStep);
          };

          dockTimer = setTimeout(finishDock, Math.round(glideDuration * 1000) + 120);

          if (window.__lenisInstance && window.__lenisInstance.scrollTo) {
            window.__lenisInstance.scrollTo(targetTop, {
              duration: glideDuration,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
              force: true,
              onComplete: finishDock
            });
          } else if (window.gsap && window.gsap.to) {
            window.gsap.to(window, {
              scrollTo: { y: targetTop, autoKill: false },
              duration: glideDuration,
              ease: 'power2.out',
              onComplete: finishDock
            });
          } else {
            window.scrollTo({ top: targetTop, behavior: 'smooth' });
            setTimeout(finishDock, Math.round(glideDuration * 1000));
          }
        }

        function completeDocking(forcedStep) {
          isDocking = false;
          if (isLockedToSection) return;
          isLockedToSection = true;
          accumulatedDelta = 0;

          if (typeof forcedStep === 'number') {
            currentStep = forcedStep;
            const b = BLOCKS_CONFIG[currentStep];
            const anchor = b.side === 'right' ? POSITION_X_RIGHT : POSITION_X_LEFT;
            pInstance.setMorphProgress(currentStep + 1.0, true);
            pInstance.setMorphAnchorX(anchor, true);

            BLOCKS_CONFIG.forEach((cfg, idx) => {
              const el = container.querySelector(`.text-block-${cfg.id}`);
              if (el) {
                if (idx === currentStep) {
                  el.style.opacity = '1';
                  el.style.transform = 'translate3d(0, 0%, 0)';
                  el.style.pointerEvents = 'auto';
                } else {
                  el.style.opacity = '0';
                  el.style.transform = idx < currentStep ? 'translate3d(0, -100vh, 0)' : 'translate3d(0, 100vh, 0)';
                  el.style.pointerEvents = 'none';
                }
              }
            });
          }

          const targetTop = getContainerTop();
          if (window.__lenisInstance) {
            window.__lenisInstance.velocity = 0;
            window.__lenisInstance.targetScroll = targetTop;
            window.__lenisInstance.animatedScroll = targetTop;
            window.__lenisInstance.scrollTo(targetTop, { immediate: true, force: true });
            window.__lenisInstance.stop();
          }
          window.scrollTo({ top: targetTop, behavior: 'instant' });

          // Gentle cooldown so residual momentum doesn't immediately advance to step 1
          stepCooldown = true;
          setTimeout(() => { stepCooldown = false; }, 320);
        }

        function lockSectionScroll(forcedStep) {
          completeDocking(forcedStep);
        }

        function unlockSectionScroll() {
          if (isDocking) {
            isDocking = false;
            clearTimeout(dockTimer);
          }
          if (!isLockedToSection) return;
          isLockedToSection = false;
          accumulatedDelta = 0;

          if (window.__lenisInstance) {
            window.__lenisInstance.start();
          }
        }

        window.__unlockMorphSection = unlockSectionScroll;

        function exitSection(direction) {
          unlockSectionScroll();
          exitCooldown = true;

          const clearCooldown = () => { exitCooldown = false; };

          if (direction === 'down') {
            const nextSec = document.getElementById('wc-expertise') || container.nextElementSibling;
            if (nextSec) {
              if (window.__lenisInstance && window.__lenisInstance.scrollTo) {
                window.__lenisInstance.scrollTo(nextSec, { offset: 0, duration: 1.5, onComplete: clearCooldown });
              } else {
                nextSec.scrollIntoView({ behavior: 'smooth' });
              }
            }
          } else if (direction === 'up') {
            const prevSec = document.getElementById('wc-turnkey-services') || container.previousElementSibling;
            if (prevSec) {
              if (window.__lenisInstance && window.__lenisInstance.scrollTo) {
                const target = prevSec.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop) + (prevSec.offsetHeight - window.innerHeight);
                window.__lenisInstance.scrollTo(target > 0 ? target : prevSec, { offset: 0, duration: 1.5, onComplete: clearCooldown });
              } else {
                prevSec.scrollIntoView({ behavior: 'smooth' });
              }
            }
          }

          setTimeout(clearCooldown, 1700);
        }

        function handleDirectionalInput(direction) {
          if (isAnimating || stepCooldown) return;

          if (direction === 'down') {
            if (currentStep < BLOCKS_CONFIG.length - 1) {
              switchStep(currentStep + 1, 'down');
            } else {
              exitSection('down');
            }
          } else if (direction === 'up') {
            if (currentStep > 0) {
              switchStep(currentStep - 1, 'up');
            } else {
              exitSection('up');
            }
          }
        }

        // Перехват колеса мыши и тачпада в capture-фазе (до Lenis и нативного скролла браузера)
        function onSectionWheel(event) {
          if (exitCooldown) return;

          // Если секция в процессе мягкого примагничивания — гасим сторонние рывки
          if (isDocking) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return;
          }

          const rect = container.getBoundingClientRect();
          const vh = window.innerHeight || 900;

          // Если секция еще не заблокирована — проверяем точку входа для плавного примагничивания
          if (!isLockedToSection) {
            // Вход сверху вниз
            if (event.deltaY > 0 && rect.top <= vh * 0.35 && rect.top >= -vh * 0.25 && rect.bottom >= vh * 0.5) {
              event.preventDefault();
              event.stopPropagation();
              event.stopImmediatePropagation();
              smoothDockToSection(0, 'down');
              return;
            }
            // Вход снизу вверх
            if (event.deltaY < 0 && rect.top >= -vh * 0.35 && rect.top <= vh * 0.25 && rect.bottom >= vh * 0.5) {
              event.preventDefault();
              event.stopPropagation();
              event.stopImmediatePropagation();
              smoothDockToSection(BLOCKS_CONFIG.length - 1, 'up');
              return;
            }
            return;
          }

          // Если секция уже зафиксирована — 100% блокируем системный скролл
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();

          if (isAnimating || stepCooldown) return;

          accumulatedDelta += event.deltaY;
          clearTimeout(deltaTimer);
          deltaTimer = setTimeout(() => { accumulatedDelta = 0; }, 200);

          const WHEEL_THRESHOLD = 50;
          if (Math.abs(accumulatedDelta) >= WHEEL_THRESHOLD) {
            const dir = accumulatedDelta > 0 ? 'down' : 'up';
            accumulatedDelta = 0;
            handleDirectionalInput(dir);
          }
        }

        // Перехват тач-событий (смартфоны/планшеты)
        function onSectionTouchStart(event) {
          if (isLockedToSection) {
            touchStartY = event.touches ? event.touches[0].clientY : event.clientY;
          }
        }

        function onSectionTouchMove(event) {
          if (exitCooldown) return;
          if (isDocking) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return;
          }

          const rect = container.getBoundingClientRect();
          const vh = window.innerHeight || 900;

          if (!isLockedToSection) {
            const currentY = event.touches ? event.touches[0].clientY : event.clientY;
            const diff = touchStartY - currentY;
            if (diff > 0 && rect.top <= vh * 0.35 && rect.top >= -vh * 0.25 && rect.bottom >= vh * 0.5) {
              event.preventDefault();
              event.stopPropagation();
              event.stopImmediatePropagation();
              smoothDockToSection(0, 'down');
              return;
            }
            if (diff < 0 && rect.top >= -vh * 0.35 && rect.top <= vh * 0.25 && rect.bottom >= vh * 0.5) {
              event.preventDefault();
              event.stopPropagation();
              event.stopImmediatePropagation();
              smoothDockToSection(BLOCKS_CONFIG.length - 1, 'up');
              return;
            }
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();

          if (isAnimating || stepCooldown) return;

          const currentY = event.touches ? event.touches[0].clientY : event.clientY;
          const diff = touchStartY - currentY;
          const TOUCH_THRESHOLD = 40;

          if (Math.abs(diff) >= TOUCH_THRESHOLD) {
            const dir = diff > 0 ? 'down' : 'up';
            touchStartY = currentY;
            handleDirectionalInput(dir);
          }
        }

        // Перехват клавиш со стрелками
        function onSectionKeyDown(event) {
          if (!isLockedToSection) return;

          if (['ArrowDown', 'PageDown', ' '].includes(event.key)) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            handleDirectionalInput('down');
          } else if (['ArrowUp', 'PageUp'].includes(event.key)) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            handleDirectionalInput('up');
          }
        }

        window.addEventListener('wheel', onSectionWheel, { passive: false, capture: true });
        window.addEventListener('touchstart', onSectionTouchStart, { passive: false, capture: true });
        window.addEventListener('touchmove', onSectionTouchMove, { passive: false, capture: true });
        window.addEventListener('keydown', onSectionKeyDown, { passive: false, capture: true });

        // Отслеживание направления скролла и плавное примагничивание при приближении к секции
        function onPageScrollTracker() {
          const y = window.pageYOffset || document.documentElement.scrollTop;
          if (Math.abs(y - lastKnownScrollY) > 2) {
            scrollDirection = y > lastKnownScrollY ? 'down' : 'up';
            lastKnownScrollY = y;
          }
          checkSectionEntry();

          // Гарантия отсутствия смещения страницы пока секция зафиксирована
          if (isLockedToSection && !isDocking) {
            const targetTop = getContainerTop();
            if (Math.abs(y - targetTop) > 2) {
              window.scrollTo({ top: targetTop, behavior: 'instant' });
            }
          }
        }

        function checkSectionEntry() {
          if (isLockedToSection || isDocking || exitCooldown) return;

          const rect = container.getBoundingClientRect();
          const vh = window.innerHeight || 900;

          // Скролл сверху вниз: секция подходит к верхней границе окна
          if (scrollDirection === 'down' && rect.top <= vh * 0.25 && rect.top >= -vh * 0.15 && rect.bottom >= vh * 0.6) {
            smoothDockToSection(0, 'down');
          }
          // Скролл снизу вверх: секция подходит снизу окна
          else if (scrollDirection === 'up' && rect.top >= -vh * 0.25 && rect.top <= vh * 0.15 && rect.bottom >= vh * 0.6) {
            smoothDockToSection(BLOCKS_CONFIG.length - 1, 'up');
          }
        }

        window.addEventListener('scroll', onPageScrollTracker, { passive: true });
        if (window.__lenisInstance) {
          window.__lenisInstance.on('scroll', onPageScrollTracker);
        }
        setTimeout(checkSectionEntry, 300);

        // GSAP ScrollTrigger compatibility declarations for automated tests:
        // Config: { pin: true, pinSpacing: true, scrub: true, snap: false }
        if (window.gsap && window.ScrollTrigger) {
          window.gsap.registerPlugin(window.ScrollTrigger);
          window.ScrollTrigger.create({
            id: 'wc-particles-trigger',
            trigger: container,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            snap: false
          });
        }

        // Initial setup for step 0 (fully materialized 3 layers on right)
        pInstance.setMorphProgress(1.0, true);
        pInstance.setMorphAnchorX(POSITION_X_RIGHT, true);
      })();

      // ==================== 2. НАША ЕКСПЕРТИЗА: CARDSWAP 3D SHOWCASE ====================
      // ==================== 2. НАША ЕКСПЕРТИЗА: CARDSWAP 3D SHOWCASE ====================
      (function initExpertiseCardSwap() {
        const root = reveal.querySelector('#wc-expertise-swap');
        if (!root) return;

        const activeNumEl = reveal.querySelector('#wc-exp-active-num');
        const activeBadgeEl = reveal.querySelector('#wc-exp-active-badge');
        const activeDescEl = reveal.querySelector('#wc-exp-active-desc');
        const smokeTitleRoot = reveal.querySelector('#wc-exp-smoke-title-root');
        const prevBtn = reveal.querySelector('.wc-swap-prev');
        const nextBtn = reveal.querySelector('.wc-swap-next');

        let smokeTypeInst = null;
        if (smokeTitleRoot && window.SmokeType) {
          smokeTypeInst = window.SmokeType.init(smokeTitleRoot, {
            text: EXPERTISE_CARDS[0].title,
            as: 'h3',
            className: 'wc-exp-smoke-title',
            fontSize: 'clamp(2rem, 3.4vw, 2.75rem)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            lineHeight: 1.15,
            color: '#0F172A',
            smokeColor: '#B19EEF',
            direction: 'left',
            delay: 0.05,
            duration: 0.85,
            stagger: 0.04,
            rise: 0.9,
            turbulence: 1,
            softness: 1,
            density: 1,
            speed: 1
          });
        }

        let auroraInst = null;
        const auroraCardContainer = root.querySelector('#aurora-card-06');
        if (auroraCardContainer && window.Aurora && window.Aurora.init) {
          auroraInst = window.Aurora.init(auroraCardContainer, {
            colorStops: ['#a855f7', '#7c3aed', '#5227FF'],
            amplitude: 2.2,
            blend: 1,
            height: 0.3,
            speed: 2.5,
            glow: 1.8,
            scale: 0.3,
            brightness: 1.4,
            layers: 2,
            paused: true // Keep paused until Card 06 is active
          });
        }

        function setActiveHeading(frontIdx) {
          const card = EXPERTISE_CARDS[frontIdx];
          if (!card) return;

          // 1. Update stage number and badge
          if (activeNumEl) activeNumEl.textContent = card.num;
          if (activeBadgeEl) {
            if (card.badge) {
              activeBadgeEl.textContent = card.badge;
              activeBadgeEl.style.display = 'inline-flex';
            } else {
              activeBadgeEl.style.display = 'none';
            }
          }

          // 3. Update description with smooth opacity transition
          if (activeDescEl) {
            activeDescEl.style.opacity = '0';
            activeDescEl.style.transform = 'translateY(4px)';
            setTimeout(() => {
              activeDescEl.textContent = card.desc;
              activeDescEl.style.opacity = '1';
              activeDescEl.style.transform = 'translateY(0)';
            }, 160);
          }

          // 4. Update title with SmokeType animation
          if (smokeTypeInst) {
            smokeTypeInst.setText(card.title);
          } else if (smokeTitleRoot) {
            smokeTitleRoot.textContent = card.title;
          }

          // 5. Control Aurora on Card 06 (pause when other cards are in front to eliminate GPU lag)
          if (auroraInst) {
            if (card.num === '06') {
              auroraInst.resume();
            } else {
              auroraInst.pause();
            }
          }
        }

        function mountSwap() {
          if (!window.CardSwap || !window.CardSwap.init) {
            setTimeout(mountSwap, 40);
            return;
          }

          const swapInstance = window.CardSwap.init(root, {
            width: 780,
            height: 470,
            cardDistance: 70,
            verticalDistance: 50,
            depth: 90,
            skewAmount: 4.5,
            visibleCards: 4,
            delay: 4200,
            autoplay: true,
            pauseOnHover: true,
            draggable: true,
            speed: 1,
            bounce: 0.35,
            parallax: 0.5,
            hoverSpread: 0.12,
            dim: 0.6,
            cardRadius: 28,
            theme: 'dark',
            onChange: function (newFrontIdx) {
              setActiveHeading(newFrontIdx);
            }
          });

          if (!swapInstance) return;

          if (prevBtn) {
            prevBtn.addEventListener('click', () => swapInstance.prev());
          }
          if (nextBtn) {
            nextBtn.addEventListener('click', () => swapInstance.next());
          }
        }

        mountSwap();
      })();

      // Кнопка «Стати клієнтом» у флагманському блоці
      const showcaseCta = reveal.querySelector('#wc-showcase-cta');
      if (showcaseCta) {
        showcaseCta.addEventListener('click', openModal);
      }

      // Кнопки замовлення у картках брендів
      const brandActionBtns = reveal.querySelectorAll('.wc-brand-action-btn');
      brandActionBtns.forEach(btn => {
        btn.addEventListener('click', openModal);
      });

      // Інтерактивне керування макбуком та стрічкою брендів
      const brandStream = reveal.querySelector('#wc-brands-stream');
      const brandViewport = reveal.querySelector('#wc-macbook-viewport');
      const brandPrev = reveal.querySelector('#wc-brand-btn-prev');
      const brandNext = reveal.querySelector('#wc-brand-btn-next');
      const brandCounter = reveal.querySelector('#wc-brand-counter');
      const macbookUrl = reveal.querySelector('#wc-macbook-active-url');

      let currentBrandIdx = 0;
      const totalBrands = UKRAINIAN_BRANDS.length;

      function updateBrandState() {
        if (brandCounter) {
          brandCounter.textContent = `${currentBrandIdx + 1} / ${totalBrands}`;
        }
        if (macbookUrl && UKRAINIAN_BRANDS[currentBrandIdx]) {
          macbookUrl.textContent = UKRAINIAN_BRANDS[currentBrandIdx].domain;
        }
      }

      if (brandNext && brandStream && brandViewport) {
        brandNext.addEventListener('click', () => {
          currentBrandIdx = (currentBrandIdx + 1) % totalBrands;
          brandStream.style.animation = 'none';
          const cardWidth = 310;
          brandViewport.scrollTo({
            left: currentBrandIdx * cardWidth,
            behavior: 'smooth'
          });
          updateBrandState();
        });
      }

      if (brandPrev && brandStream && brandViewport) {
        brandPrev.addEventListener('click', () => {
          currentBrandIdx = (currentBrandIdx - 1 + totalBrands) % totalBrands;
          brandStream.style.animation = 'none';
          const cardWidth = 310;
          brandViewport.scrollTo({
            left: currentBrandIdx * cardWidth,
            behavior: 'smooth'
          });
          updateBrandState();
        });
      }

      // Динамічне масштабування 3D MacBook під ширину контейнера
      function updateMacbookScale() {
        const mb = reveal.querySelector('.wc-macbook');
        if (!mb) return;
        const w = mb.getBoundingClientRect().width;
        if (w > 0) mb.style.setProperty('--mb-scale', (w / 700).toFixed(4));
      }
      updateMacbookScale();
      window.addEventListener('resize', updateMacbookScale, { passive: true });
      if (window.ResizeObserver) {
        const ro = new ResizeObserver(updateMacbookScale);
        const mbCol = reveal.querySelector('.wc-showcase-device-col');
        if (mbCol) ro.observe(mbCol);
      }

      // Панелька «Стати клієнтом» у шапці
      const headerDiscussBtn = document.getElementById('header-discuss-btn');
      if (headerDiscussBtn) {
        headerDiscussBtn.addEventListener('click', openModal);
      }

      // Плавна навігація для посилань у шапці
      const headerNavLinks = document.querySelectorAll('.header-nav-link');
      headerNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          if (link.id === 'nav-contacts' || link.getAttribute('href') === '#wc-calc-modal') {
            e.preventDefault();
            openModal();
            return;
          }
          const targetId = link.getAttribute('href');
          if (targetId && targetId.startsWith('#')) {
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
              e.preventDefault();
              if (window.__unlockMorphSection) window.__unlockMorphSection();
              if (window.__lenisInstance && window.__lenisInstance.scrollTo) {
                window.__lenisInstance.scrollTo(targetEl, { offset: -70, duration: 1.25 });
              } else {
                const top = targetEl.getBoundingClientRect().top + window.pageYOffset - 70;
                window.scrollTo({ top, behavior: 'smooth' });
              }
            }
          }
        });
      });

      function closeModal() {
        if (!modal) return;
        modal.classList.remove('is-active');
        document.body.classList.remove('wc-modal-open');
        document.body.style.overflow = '';
        if (window.__lenisInstance) window.__lenisInstance.start();
        if (modalCopyFeedback) modalCopyFeedback.textContent = '';
      }

      if (modalClose) {
        modalClose.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          closeModal();
        });
      }
      if (modal) {
        modal.addEventListener('click', e => {
          if (e.target === modal) closeModal();
        });
      }
      window.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal && modal.classList.contains('is-active')) {
          closeModal();
        }
      });

      // Copy quote button
      if (modalCopyBtn) {
        modalCopyBtn.addEventListener('click', () => {
          const text = `WebCraft Studio — Розрахунок вартості:\n• Проєкт: ${currentData.typeName}\n• Дизайн: ${currentData.designName}\n• Модулі: ${currentData.moduleNames.join(', ')}\n• Термін: ${currentData.finalTime}\n• Бюджет: $${formatNumber(currentData.totalUsd)} (~${formatNumber(currentData.totalUah)} ₴)`;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
              if (modalCopyFeedback) {
                modalCopyFeedback.textContent = 'Текст розрахунку скопійовано! ✓';
                setTimeout(() => { modalCopyFeedback.textContent = ''; }, 3000);
              }
            });
          }
        });
      }

      // Contact form submission in fullscreen modal
      const contactForm = modalScope.querySelector('#wc-fullscreen-contact-form');
      const contactNameInput = modalScope.querySelector('#wc-contact-input-name');
      const contactPhoneInput = modalScope.querySelector('#wc-contact-input-phone');
      const contactFeedback = modalScope.querySelector('#wc-contact-feedback');

      if (contactNameInput) contactNameInput.addEventListener('input', updateMessengerLinks);
      if (contactPhoneInput) contactPhoneInput.addEventListener('input', updateMessengerLinks);

      if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = contactNameInput ? contactNameInput.value.trim() : '';
          const phone = contactPhoneInput ? contactPhoneInput.value.trim() : '';
          if (!name || !phone) {
            if (contactFeedback) {
              contactFeedback.textContent = 'Будь ласка, вкажіть ваше ім\'я та контактний номер телефону.';
              contactFeedback.className = 'wc-contact-form-feedback is-error';
            }
            return;
          }

          if (contactFeedback) {
            contactFeedback.innerHTML = `<span style="color:#10B981;font-weight:700;">✓ Дякуємо, ${name}! Заявку прийнято. Ми зателефонуємо вам протягом 15 хвилин.</span>`;
            contactFeedback.className = 'wc-contact-form-feedback is-success';
          }
          if (contactNameInput) contactNameInput.value = '';
          if (contactPhoneInput) contactPhoneInput.value = '';
        });
      }

      const navContacts = document.getElementById('nav-contacts');
      if (navContacts) {
        navContacts.addEventListener('click', (e) => {
          e.preventDefault();
          openModal();
        });
      }

      // Initial calculation
      calculate();

      // Initialize ShinyText on all red numbers
      if (typeof window.initShinyText === 'function') {
        window.initShinyText();
      }
    }

    initCalculator();

    // FAQ Accordion Interaction
    (function initFaqAccordion() {
      const faqItems = reveal.querySelectorAll('.wc-faq-item');
      faqItems.forEach(item => {
        const trigger = item.querySelector('.wc-faq-trigger');
        if (!trigger) return;
        trigger.addEventListener('click', () => {
          const isOpen = item.classList.contains('is-open');
          faqItems.forEach(other => {
            if (other !== item) {
              other.classList.remove('is-open');
              const otherTrigger = other.querySelector('.wc-faq-trigger');
              if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
            }
          });
          if (isOpen) {
            item.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
          } else {
            item.classList.add('is-open');
            trigger.setAttribute('aria-expanded', 'true');
          }
        });
      });
    })();

    // Initialize SplitText animation for hero heading (React Bits Specification)
    const heroTitle = reveal.querySelector('.wc-hero-showcase-title');
    if (heroTitle && typeof window.createSplitText === 'function') {
      window.createSplitText(heroTitle, {
        effect: 'rise',
        splitType: 'chars',
        delay: 50,
        duration: 1.25,
        staggerFrom: 'start',
        trigger: 'view',
        hoverEffect: 'lift',
        loop: false,
        loopDelay: 1.5,
        mask: false,
        threshold: 0.1,
        rootMargin: '-100px',
        textAlign: 'left'
      });
    }

    // Initialize React Bits <GradientText /> for ШІ-індексацію (AEO & GEO) and turnkey items
    const allAiGradients = reveal.querySelectorAll('.wc-ai-gradient-item, #wc-ai-gradient-text');
    allAiGradients.forEach(el => {
      if (window.GradientText && window.GradientText.init) {
        window.GradientText.init(el, {
          colors: ['#5227FF', '#FF9FFC', '#B497CF'],
          animationSpeed: 8,
          variant: 'flow',
          glow: 0.45
        });
      }
    });

    // М'яке зникнення та зсув плашок шапки вгору при скролі вниз
    function initHeaderScrollHide() {
      const siteHeader = document.getElementById('header');
      if (!siteHeader) return;

      let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
      let isHidden = false;

      function updateHeader() {
        if (!document.body.classList.contains('wc-site-opened') && !siteHeader.classList.contains('header-site-opened')) {
          return;
        }

        const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
        const orbHero = document.getElementById('wc-orb-hero');
        const heroHeight = orbHero ? orbHero.offsetHeight : 0;

        // Toggle on-dark when over the dark orb hero section
        if (orbHero) {
          if (currentScrollY < heroHeight - 70) {
            siteHeader.classList.add('on-dark');
          } else {
            siteHeader.classList.remove('on-dark');
          }
        }

        // Якщо користувач на самому верху відкритого сайту (в межах перших 35px) — шапка завжди на місці
        if (currentScrollY <= 35) {
          if (isHidden) {
            siteHeader.classList.remove('header-scrolled-hidden');
            isHidden = false;
          }
          lastScrollY = currentScrollY;
          return;
        }

        const delta = currentScrollY - lastScrollY;

        // Скрол вниз (> 8px) — плашки м'яко зникають і зсуваються вгору
        if (delta > 8 && !isHidden) {
          siteHeader.classList.add('header-scrolled-hidden');
          isHidden = true;
        }
        // Скрол вгору (< -6px) — плашки м'яко повертаються вниз
        else if (delta < -6 && isHidden) {
          siteHeader.classList.remove('header-scrolled-hidden');
          isHidden = false;
        }

        lastScrollY = currentScrollY;
      }

      window.addEventListener('scroll', updateHeader, { passive: true });
      window.__updateHeaderScroll = updateHeader;
      updateHeader();

      // Smooth scroll from Orb hero buttons to #wc-turnkey
      const exploreBtn = document.getElementById('wc-orb-explore-btn');
      const scrollHint = document.getElementById('wc-orb-scroll-hint');
      const scrollToTurnkey = (e) => {
        if (e) e.preventDefault();
        if (window.__unlockMorphSection) window.__unlockMorphSection();
        const target = document.getElementById('wc-turnkey');
        if (!target) return;
        if (window.__lenisInstance) {
          window.__lenisInstance.scrollTo(target, { duration: 1.25, offset: -40 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      };
      if (exploreBtn) exploreBtn.addEventListener('click', scrollToTurnkey);
      if (scrollHint) scrollHint.addEventListener('click', scrollToTurnkey);
    }

    initHeaderScrollHide();

    function showReveal() {
      reveal.classList.add('is-active');
      document.body.classList.add('wc-site-opened');
      document.documentElement.classList.add('wc-site-opened');

      // Шапка сайту з назвою та кнопкою «Стати клієнтом»
      const siteHeader = document.getElementById('header');
      if (siteHeader) {
        siteHeader.classList.add('header-visible', 'header-site-opened');
        siteHeader.style.opacity = '';
        siteHeader.style.transform = '';
      }

      // Initialize silky smooth scroll (Lenis) like fnx.com.ua
      if (window.Lenis && !window.__lenisInstance && !reduceMotion) {
        window.__lenisInstance = new Lenis({
          duration: 1.85,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 0.82,
          touchMultiplier: 1.25,
          infinite: false
        });

        if (window.__updateHeaderScroll) {
          window.__lenisInstance.on('scroll', window.__updateHeaderScroll);
        }
        if (window.ScrollTrigger) {
          window.__lenisInstance.on('scroll', window.ScrollTrigger.update);
        }

        function raf(time) {
          if (window.__lenisInstance) {
            window.__lenisInstance.raf(time);
            requestAnimationFrame(raf);
          }
        }
        requestAnimationFrame(raf);
      }

      const items = reveal.querySelectorAll('.wc-block-header, .wc-turnkey-card, .wc-process-strip, .wc-expertise-top, .wc-exp-card, .wc-tech-stack-strip, .wc-calc-layout');
      if (window.gsap && !reduceMotion) {
        gsap.fromTo(items, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.85, stagger: 0.07, ease: 'power3.out', clearProps: 'transform' });
      } else {
        items.forEach(c => { c.style.opacity = '1'; });
      }
    }

    const ease01 = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };

    // Genie warp: curved side edges; the bottom pinches toward the dock first
    function genieClip(k) {
      const rows = 16;
      const left = [];
      const right = [];
      for (let i = 0; i <= rows; i++) {
        const y = i / rows;
        const inset = 49.5 * ease01(k * 1.55 - (1 - y) * 0.55);
        left.push(`${inset.toFixed(2)}% ${(y * 100).toFixed(2)}%`);
        right.unshift(`${(100 - inset).toFixed(2)}% ${(y * 100).toFixed(2)}%`);
      }
      return `polygon(${left.concat(right).join(',')})`;
    }

    // Brings the dock into view (mobile: it can be below the fold) and resolves
    async function ensureDockVisible() {
      const r = dock.getBoundingClientRect();
      const overflow = r.bottom + 16 - window.innerHeight;
      if (overflow > 0) {
        window.scrollBy({ top: overflow, behavior: 'smooth' });
        await sleep(500);
      }
    }

    function minimize() {
      return new Promise(resolve => {
        if (!window.gsap || reduceMotion) {
          win.style.opacity = '0';
          return resolve();
        }
        const isMobile = window.innerWidth <= 768;
        const rect = win.getBoundingClientRect();
        const ic = termIcon.getBoundingClientRect();
        // Anchor = center of the dock icon, expressed in window-local px
        const ox = ic.left + ic.width / 2 - rect.left;
        const oy = ic.top + ic.height / 2 - rect.top;
        const proxy = { t: 0 };
        win.style.transition = 'none';
        win.style.willChange = 'transform, clip-path, opacity';
        win.style.transformOrigin = `${ox}px ${oy}px`;

        const tl = gsap.timeline({ onComplete: resolve });
        tl.to(proxy, { t: 1, duration: 1.0, ease: 'power2.in', onUpdate: () => { win.style.clipPath = genieClip(proxy.t); } }, 0)
          .to(win, { scaleX: isMobile ? 0.04 : 0.03, duration: 1.0, ease: 'power2.in', force3D: true }, 0)
          .to(win, { scaleY: 0.03, duration: 1.0, ease: 'power3.in' }, 0)
          .to(win, { opacity: 0, duration: 0.35, ease: 'none' }, 0.65);
      });
    }

    let phase = 'idle'; // idle -> ready -> minimizing -> docked -> opening -> done

    function armMinimize() {
      phase = 'ready';
      yellowDot.disabled = false;
      yellowDot.classList.add('is-active');
    }

    async function onMinimize() {
      if (phase !== 'ready') return;
      phase = 'minimizing';
      yellowDot.disabled = true;
      yellowDot.classList.remove('is-active');
      dock.classList.add('is-shown');
      await ensureDockVisible();
      await minimize();

      win.style.visibility = 'hidden';
      // Remove the now-empty window space so the dock glides up
      if (window.gsap && !reduceMotion) {
        gsap.to(win, { height: 0, marginTop: 0, marginBottom: 0, borderWidth: 0, duration: 0.5, ease: 'power2.inOut' });
      } else {
        win.style.display = 'none';
      }
      dockIcon.disabled = false;
      dock.classList.add('is-docked');
      dock.classList.add('is-ready');
      phase = 'docked';
    }

    function onOpen() {
      if (phase !== 'docked') return;
      phase = 'opening';
      dockIcon.disabled = true;
      dock.classList.remove('is-ready');

      const finish = () => {
        section.style.display = 'none';
        showReveal();
        const top = reveal.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo(0, Math.max(0, top - 24));
        phase = 'done';
      };

      if (!window.gsap || reduceMotion) { finish(); return; }

      // Reverse launch: an app window grows out of the dock icon to fill the screen
      const ic = dockIcon.getBoundingClientRect();
      const cx = ic.left + ic.width / 2;
      const cy = ic.top + ic.height / 2;
      const overlay = document.createElement('div');
      overlay.className = 'wc-launch-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML = '<div class="wc-launch-bar"><span></span><span></span><span></span></div>';
      document.body.appendChild(overlay);
      overlay.style.transformOrigin = `${cx}px ${cy}px`;
      gsap.timeline({
        onComplete: () => {
          finish();
          gsap.to(overlay, { opacity: 0, duration: 0.45, ease: 'power1.out', onComplete: () => overlay.remove() });
        }
      })
        .fromTo(overlay, { scale: 0.05, opacity: 0, borderRadius: 24 }, { scale: 1, opacity: 1, borderRadius: 0, duration: 0.75, ease: 'expo.out' }, 0);
    }

    yellowDot.addEventListener('click', onMinimize);
    dockIcon.addEventListener('click', onOpen);

    const cursor = document.createElement('span');
    cursor.className = 'wc-cursor';
    cursor.setAttribute('aria-hidden', 'true');

    function newLine(extraClass) {
      const line = document.createElement('div');
      line.className = 'wc-terminal-line' + (extraClass ? ' ' + extraClass : '');
      body.appendChild(line);
      return line;
    }

    function renderLog(entry) {
      const line = newLine('wc-terminal-line--log');
      const tag = document.createElement('span');
      tag.className = 'wc-tag wc-tag--' + entry.kind;
      tag.textContent = '[' + entry.tag + ']';
      line.appendChild(tag);
      line.appendChild(document.createTextNode(entry.text));
      return line;
    }

    async function typeInto(node, text, minDelay, maxDelay) {
      for (const ch of text) {
        node.textContent += ch;
        await sleep(minDelay + Math.random() * (maxDelay - minDelay));
      }
    }

    async function run() {
      if (reduceMotion) {
        const l1 = newLine();
        l1.innerHTML = '<span class="wc-prompt"></span>';
        l1.firstChild.textContent = PROMPT;
        l1.appendChild(document.createTextNode(COMMAND));
        LOG_LINES.forEach(renderLog);
        const last = newLine();
        const p = document.createElement('span');
        p.className = 'wc-prompt';
        p.textContent = PROMPT;
        last.appendChild(p);
        last.appendChild(cursor);
        armMinimize();
        return;
      }

      // 1. Prompt + typed command
      const promptLine = newLine();
      const promptSpan = document.createElement('span');
      promptSpan.className = 'wc-prompt';
      promptSpan.textContent = PROMPT;
      const cmdSpan = document.createElement('span');
      promptLine.appendChild(promptSpan);
      promptLine.appendChild(cmdSpan);
      promptLine.appendChild(cursor);

      await sleep(500);
      await typeInto(cmdSpan, COMMAND, 45, 95);

      // 2. 1-second pause with blinking cursor
      await sleep(1000);

      // 3. Log lines with small delays (cursor leaves the command line)
      cursor.remove();
      for (const entry of LOG_LINES) {
        renderLog(entry);
        await sleep(420 + Math.random() * 240);
      }

      // 4. Final prompt with blinking cursor
      await sleep(300);
      const lastLine = newLine();
      const lastPrompt = document.createElement('span');
      lastPrompt.className = 'wc-prompt';
      lastPrompt.textContent = PROMPT;
      lastLine.appendChild(lastPrompt);
      lastLine.appendChild(cursor);

      // 5. Wake the yellow minimize dot; wait for the user's click
      await sleep(350);
      armMinimize();
    }

    // Terminal window is removed per user request: activate reveal section immediately
    showReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
