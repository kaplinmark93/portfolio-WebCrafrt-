# Turnkey Web Studio Implementation Plan
## Integrate the <MaskedHeading /> component from React Bits

You are helping integrate an open-source React component into an existing application.

### Component: MaskedHeading
### Variant: JavaScript + CSS
### Dependencies: gsap

---

### Usage Example
```jsx
import MaskedHeading from './MaskedHeading';

<MaskedHeading text="Designed in the details" src="/hero.jpg" />

<MaskedHeading
  text="Made for the web"
  mediaType="video"
  src="/reel.mp4"
  poster="/reel-poster.jpg"
  fillScale={1.35}
  parallax={40}
  reveal="wipe"
  trigger="mount"
  brightness={1.05}
  saturation={0.55}
  grayscale
  lineHeight={1.03}
  textScale={0.105}
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| text | string | 'Designed in the details' | Heading copy. |
| tag | string | 'h2' | Element the heading renders as, so it can carry the right semantics. |
| mediaType | "image" | "video" | "image" | Whether the source showing through the letters is an image or a looping muted video. |
| src | string | '' | Image or video URL. |
| poster | string | '' | Poster frame used while a video loads. |
| fillScale | number | 1.25 | How far the media is zoomed past the heading. The overscan is what parallax travels into. |
| parallax | number | 26 | How far the media slides under the letters as the pointer moves, in px. |
| drift | number | 18 | Amplitude of the slow idle motion, in px. 0 holds the media still. |
| brightness | number | 1 | Brightness of the media. |
| saturation | number | 1 | Saturation of the media. |
| grayscale | boolean | false | Render the media in black and white. |
| reveal | "rise" | "wipe" | "fade" | "none" | "rise" | Entrance style: words rise into place, a wipe sweeps across, or the whole block fades up. |
| trigger | "view" | "mount" | "hover" | "view" | When the entrance runs. |
| duration | number | 1.1 | Entrance duration, in seconds. |
| stagger | number | 0.09 | Delay between words, in seconds. Used by the rise reveal. |
| align | "left" | "center" | "right" | "center" | Text alignment. |
| weight | number | 700 | Font weight. |
| tracking | number | -0.03 | Letter spacing, in em. |
| lineHeight | number | 1.06 | Line height. |
| textScale | number | 0.115 | Type size as a fraction of the container width, so the heading stays responsive. |
| className | string | '' | Additional class names. |
| style | object | — | Inline styles for the heading. |

### Full Component Source
```jsx
'use client';

import { useCallback, useEffect, useId, useMemo, useRef } from 'react';
import { gsap } from 'gsap';

import './MaskedHeading.css';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

const MaskedHeading = ({
  text = 'Designed in the details',
  tag = 'h2',
  mediaType = 'image',
  src = '',
  poster = '',
  fillScale = 1.25,
  parallax = 26,
  drift = 18,
  brightness = 1,
  saturation = 1,
  grayscale = false,
  reveal = 'rise',
  duration = 1.1,
  stagger = 0.09,
  trigger = 'view',
  align = 'center',
  weight = 700,
  tracking = -0.03,
  lineHeight = 1.06,
  textScale = 0.115,
  className = '',
  style,
  ...rest
}) => {
  const rootRef = useRef(null);
  const measureRef = useRef(null);
  const revealRef = useRef(null);
  const mediaRef = useRef(null);
  const wordRefs = useRef([]);
  const baseRefs = useRef([]);
  const glyphRefs = useRef([]);
  const tweenRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const clipId = `mh-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const words = useMemo(() => String(text).split(/\s+/).filter(Boolean), [text]);

  const settingsRef = useRef({});
  settingsRef.current = { fillScale, parallax, drift, brightness, saturation, grayscale, textScale };

  const place = useCallback(() => {
    const root = rootRef.current;
    const media = mediaRef.current;
    if (!root || !media) return;
    const s = settingsRef.current;
    const W = root.clientWidth;
    const H = root.clientHeight;
    const off = offsetRef.current;

    const maxX = Math.max(0, ((s.fillScale - 1) / 2) * W);
    const maxY = Math.max(0, ((s.fillScale - 1) / 2) * H);

    media.style.transform = `translate3d(${clamp(off.x, -maxX, maxX).toFixed(2)}px, ${clamp(off.y, -maxY, maxY).toFixed(2)}px, 0) scale(${s.fillScale})`;
    media.style.filter = `brightness(${s.brightness}) saturate(${s.saturation})${s.grayscale ? ' grayscale(1)' : ''}`;
  }, []);

  const sync = useCallback(() => {
    const root = rootRef.current;
    const measure = measureRef.current;
    if (!root || !measure) return;
    const s = settingsRef.current;

    root.style.fontSize = `${clamp(root.clientWidth * s.textScale, 20, 200).toFixed(1)}px`;

    const cs = window.getComputedStyle(measure);
    for (let i = 0; i < wordRefs.current.length; i += 1) {
      const box = wordRefs.current[i];
      const base = baseRefs.current[i];
      const glyph = glyphRefs.current[i];
      if (!box || !base || !glyph) continue;
      glyph.setAttribute('x', `${box.offsetLeft}`);
      glyph.setAttribute('y', `${base.offsetTop}`);
      glyph.style.fontFamily = cs.fontFamily;
      glyph.style.fontSize = cs.fontSize;
      glyph.style.fontWeight = cs.fontWeight;
      glyph.style.fontStyle = cs.fontStyle;
      glyph.style.letterSpacing = cs.letterSpacing;
    }
    place();
  }, [place]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(root);
    if (document.fonts?.ready) document.fonts.ready.then(sync).catch(() => {});

    let raf = 0;
    let last = performance.now();
    let clock = 0;

    const frame = now => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      clock += dt;
      const s = settingsRef.current;
      const off = offsetRef.current;

      const dx = Math.sin(clock * 0.21) * s.drift;
      const dy = Math.cos(clock * 0.17) * s.drift * 0.6;

      const ease = 1 - Math.exp(-dt / 0.18);
      off.x += (off.tx + dx - off.x) * ease;
      off.y += (off.ty + dy - off.y) * ease;

      place();
      raf = requestAnimationFrame(frame);
    };

    const onMove = e => {
      const s = settingsRef.current;
      if (s.parallax <= 0) return;
      const r = root.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / (r.width || 1)) * 2 - 1;
      const ny = ((e.clientY - r.top) / (r.height || 1)) * 2 - 1;
      offsetRef.current.tx = clamp(nx, -1, 1) * -s.parallax;
      offsetRef.current.ty = clamp(ny, -1, 1) * -s.parallax;
    };

    const onLeave = () => {
      offsetRef.current.tx = 0;
      offsetRef.current.ty = 0;
    };

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
    };
  }, [place, sync]);

  useEffect(() => {
    sync();
  }, [sync, words, tag, align, weight, tracking, lineHeight, textScale]);

  useEffect(() => {
    const root = rootRef.current;
    const layer = revealRef.current;
    if (!root || !layer) return;
    const glyphs = glyphRefs.current.filter(Boolean);
    if (!glyphs.length) return;

    const riseDistance = () => (parseFloat(window.getComputedStyle(root).fontSize) || 48) * 1.15;

    const settle = () => {
      gsap.set(glyphs, { y: 0 });
      gsap.set(layer, { opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0%)' });
    };

    const rest = () => {
      if (reveal === 'rise') {
        gsap.set(glyphs, { y: riseDistance() });
      } else if (reveal === 'wipe') {
        gsap.set(layer, { clipPath: 'inset(0% 100% 0% 0%)' });
      } else if (reveal === 'fade') {
        gsap.set(layer, { opacity: 0, scale: 1.08 });
      }
    };

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reveal === 'none' || reduce) {
      settle();
      return;
    }

    const play = () => {
      tweenRef.current?.kill();
      if (reveal === 'rise') {
        gsap.set(layer, { opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0%)' });
        tweenRef.current = gsap.fromTo(
          glyphs,
          { y: riseDistance() },
          { y: 0, duration, stagger, ease: 'power4.out', overwrite: 'auto' }
        );
      } else if (reveal === 'wipe') {
        gsap.set(glyphs, { y: 0 });
        const state = { p: 100 };
        tweenRef.current = gsap.to(state, {
          p: 0,
          duration,
          ease: 'power3.inOut',
          overwrite: 'auto',
          onUpdate: () => {
            layer.style.clipPath = `inset(0% ${state.p}% 0% 0%)`;
          }
        });
      } else {
        gsap.set(glyphs, { y: 0 });
        tweenRef.current = gsap.fromTo(
          layer,
          { opacity: 0, scale: 1.08 },
          { opacity: 1, scale: 1, duration, ease: 'power3.out', overwrite: 'auto' }
        );
      }
    };

    if (trigger === 'hover') {
      settle();
      root.addEventListener('pointerenter', play);
      return () => {
        root.removeEventListener('pointerenter', play);
        tweenRef.current?.kill();
      };
    }

    if (trigger === 'view') {
      settle();
      rest();
      const io = new IntersectionObserver(
        entries => {
          if (entries.some(e => e.isIntersecting)) {
            play();
            io.disconnect();
          }
        },
        { threshold: 0.25 }
      );
      io.observe(root);
      return () => {
        io.disconnect();
        tweenRef.current?.kill();
      };
    }

    play();
    return () => tweenRef.current?.kill();
  }, [reveal, trigger, duration, stagger, words]);

  const Tag = tag;

  return (
    <Tag
      ref={rootRef}
      className={`masked-heading ${className}`.trim()}
      style={{
        textAlign: align,
        fontWeight: weight,
        letterSpacing: `${tracking}em`,
        lineHeight,
        ...style
      }}
      {...rest}
    >
      <span ref={measureRef} className="masked-heading__measure">
        {words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            ref={el => {
              wordRefs.current[i] = el;
            }}
            className="masked-heading__word"
          >
            {word}
            <i
              ref={el => {
                baseRefs.current[i] = el;
              }}
              className="masked-heading__baseline"
            />
          </span>
        ))}
      </span>

      <svg className="masked-heading__defs" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            {words.map((word, i) => (
              <text
                key={`${word}-${i}`}
                ref={el => {
                  glyphRefs.current[i] = el;
                }}
              >
                {word}
              </text>
            ))}
          </clipPath>
        </defs>
      </svg>

      <span ref={revealRef} className="masked-heading__reveal">
        <span className="masked-heading__clip" style={{ clipPath: `url(#${clipId})` }}>
          <span ref={mediaRef} className="masked-heading__media">
            {mediaType === 'video' ? (
              <video className="masked-heading__source" src={src} poster={poster} autoPlay muted loop playsInline />
            ) : (
              <img className="masked-heading__source" src={src} alt="" draggable={false} />
            )}
          </span>
        </span>
      </span>
    </Tag>
  );
};

export default MaskedHeading;

```

### Component CSS
```css
.masked-heading {
  position: relative;
  width: 100%;
  margin: 0;
  padding: 0;
  text-wrap: balance;
  -webkit-font-smoothing: antialiased;
}

.masked-heading__measure {
  color: transparent;
}

.masked-heading__word {
  display: inline-block;
  white-space: pre;
}

.masked-heading__word:not(:last-child)::after {
  content: ' ';
}

.masked-heading__baseline {
  display: inline-block;
  width: 0;
  height: 0;
}

.masked-heading__defs {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}

.masked-heading__reveal {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
}

.masked-heading__clip {
  position: absolute;
  inset: 0;
  display: block;
}

.masked-heading__media {
  position: absolute;
  inset: 0;
  display: block;
  will-change: transform, filter;
}

.masked-heading__source {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  -webkit-user-drag: none;
}

```

### Integration Instructions
1. Install any listed dependencies.
2. Copy the component source into the appropriate directory in the project.
3. Import the CSS file alongside the component.
4. Import and render the component using the usage example above as a starting point.
5. Adjust props as needed for the specific use case — refer to the props table for all available options.

### More from React Bits
The full library index, including everything reactbits.dev offers, is at https://reactbits.dev/llms.txt — fetch it if this component is not the right fit or the project needs more pieces.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Создать современный, сверхбыстрый и адаптивный веб-сайт для услуг создания сайтов под ключ с палитрой Warm Tech, интерактивными табами услуг и модальным окном связи на 5 каналов.

**Architecture:** Модульная легковесная веб-архитектура без тяжелых зависимостей. Чистый семантический HTML5 для идеального SEO и доступности (a11y), централизованная дизайн-система на CSS-переменных (`styles/main.css`), независимый модуль конфигурации контактов (`scripts/config.js`) и модульный контроллер интерфейса (`scripts/app.js`).

**Tech Stack:** HTML5 (Semantic, OpenGraph, Schema.org), CSS3 (Warm Tech Design System, Flexbox/Grid, Glassmorphism, Micro-animations), JavaScript ES6+ (Native Modules, zero runtime overhead).

**Spec:** `docs/superpowers/specs/2026-10-11-turnkey-web-studio-design.md`

## Global Constraints

- **Главный оффер:** «Сайты под ключ: от вас только идея, всю головную боль берем на себя».
- **Каналы связи (ровно 5):** Телефонный звонок, Telegram, WhatsApp, Viber, Instagram Direct.
- **Интерактивные табы (ровно 4 направления):** Лендинги, Корпоративные сайты, Интернет-магазины, Веб-сервисы и дашборды.
- **Визуальный стиль Warm Tech:** фон `#FAF8F5`, основной текст `#18181B`, акцент янтарно-солнечный `#FF9F0A` / `#F59E0B`, скругления `16px–24px`, эффекты glassmorphism, Google Fonts Outfit/Inter.
- **Производительность и SEO:** Чистая семантика тегов, мета-разметка OpenGraph и Schema.org, мгновенный отклик, адаптивность от 360px до десктопа.

## Review Focus

1. **Мобильное всплывающее окно (Viewport height on mobile):** На небольших экранах модалка контактов не должна обрезаться или вылезать за пределы экрана при скролле.
2. **Esc и клик вне модалки:** Пользователь должен легко закрывать окно нажатием клавиши Escape или кликом на затемненный фон (backdrop).
3. **Прямой клик по контактам:** Ссылка на телефон должна содержать префикс `tel:`, Telegram — корректный `https://t.me/`, WhatsApp — `https://wa.me/`, Viber — `viber://chat?number=`, Instagram — `https://instagram.com/`.
4. **Доступность табов (Accessibility):** Переключение табов должно поддерживать клики и фокус, корректно переключая атрибуты `aria-selected` и отображая соответствующую карточку.
5. **Отсутствие тяжелых блокирующих скриптов:** Стили подключаются в `<head>`, скрипты с `defer` в конце `<body>`, шрифты загружаются с `display=swap`.

---

### Task 1: Конфигурация контактов и токены дизайн-системы

**Files:**
- Create: `scripts/config.js`
- Create: `styles/main.css`
- Test: `tests/config-test.js`

**Interfaces:**
- Produces: `SITE_CONFIG` (объект с контактами, типами услуг и мета-данными)
- Produces: CSS-переменные дизайн-системы (`--bg-page`, `--text-primary`, `--accent-amber`, `--radius-lg`, `--radius-pill`, `--glass-bg`, `--glass-border`)

- [x] **Step 1: Написать тест проверки экспорта конфигурации контактов**
- [x] **Step 2: Запустить тест для подтверждения отсутствия файла**
- [x] **Step 3: Реализовать `scripts/config.js` и `styles/main.css`**
- [x] **Step 4: Запустить тест и проверить успешность**
- [x] **Step 5: Commit**

---

### Task 2: Семантическая разметка страницы (HTML Skeleton & Components)

**Files:**
- Create: `index.html`
- Test: `tests/html-structure-test.js`

**Interfaces:**
- Consumes: CSS-токены из `styles/main.css`
- Produces: Полная структура DOM (Header, Hero с главным оффером, Tabs-контейнер, Process-шаги, Portfolio-плейсхолдер, Tech-блок, Contact-модалка, Floating-кнопка, Footer)

- [x] **Step 1: Написать тест проверки необходимых секций и семантики в index.html**
- [x] **Step 2: Запустить тест структуры HTML**
- [x] **Step 3: Реализовать семантический `index.html`**
- [x] **Step 4: Запустить тест и проверить результат**
- [x] **Step 5: Commit**

---

### Task 3: Стилизация, Warm Tech эстетика и адаптивная верстка

- [x] **Step 1: Написать тест проверки стилей ключевых компонентов**
- [x] **Step 2: Запустить тест CSS**
- [x] **Step 3: Реализовать полную стилизацию в `styles/main.css`**
- [x] **Step 4: Запустить тест CSS**
- [x] **Step 5: Commit**

---

### Task 4: Интерактивная логика табов, модального окна и контактов

- [x] **Step 1: Написать тест валидации функций контроллера**
- [x] **Step 2: Запустить тест логики**
- [x] **Step 3: Реализовать `scripts/app.js`**
- [x] **Step 4: Запустить тест логики**
- [x] **Step 5: Commit**

---

### Task 5: Финальная интеграция, валидация верстки и запуск локального превью

- [x] **Step 1: Написать интеграционный тест проверки целостности всех ресурсов**
- [x] **Step 2: Запустить интеграционный тест**
- [x] **Step 3: Запустить локальный сервер и проверить отображение в браузере**
- [x] **Step 4: Commit**
