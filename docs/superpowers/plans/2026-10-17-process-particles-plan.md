# Process Particles Development Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Замінити старий статичний блок «СТАНДАРТИ РЕАЛІЗАЦІЇ» на кінематографічний блок «ПРОЦЕС РОЗРОБКИ» з повноекранним закріпленням (pinned scrollytelling), живим морфінгом частинок на Canvas та скляним HUD для 6 узгоджених етапів.

**Architecture:** Модульний Canvas-рушій часток `scripts/process-particles.js` з математичним моделюванням 6 цільових форм (радар, сітка контенту, 3D-призма, код `</>`, нейромережа API, ракета на орбіті) та пружною фізикою (spring damping). Контейнер із `position: sticky; top: 0; height: 100vh;` всередині треку `height: 400vh;` у `styles/process-particles.css`, який розраховує прогрес скролу без блокування сторінки та інтегрується в `scripts/terminal.js`.

**Tech Stack:** Vanilla JavaScript (ES6 Modules), HTML5 Canvas 2D Context, CSS3 (Glassmorphism, CSS Custom Properties), Node.js native test runner.

**Spec:** [docs/superpowers/specs/2026-10-17-process-particles-design.md](file:///Users/mark/projects/vibe%20coding%20cources%20/docs/superpowers/specs/2026-10-17-process-particles-design.md)

## Global Constraints
- Не використовувати важкі сторонні 3D-бібліотеки (Three.js тощо); рендерити на легкому Canvas 2D для стабільних 60 FPS.
- Скрол має бути виключно природним (scroll-driven): жодного блокування коліщатка миші, після закінчення 6-го кроку сторінка плавно йде далі.
- Зберегти узгоджену колірну палітру: `#7c3aed`, `#a855f7`, `#38bdf8`, `#c084fc`, напівпрозорий скляний фон `rgba(18, 20, 32, 0.85)` з `backdrop-filter: blur(12px)`.
- Повна сумісність з існуючими тестами в `tests/` (`npm test` повинен проходити без помилок).

## Review Focus
1. Різкий скрол користувача: частки не повинні "розлітатися в нескінченність" — обмежити максимальну швидкість (clamping).
2. Ресайз вікна браузера під час активного перегляду: координати цільових точок перераховуються адаптивно під нові розміри canvas.
3. Мобільні пристрої: кількість часток автоматично зменшується для економії заряду та 60 FPS, розмір HUD-картки компактний.
4. Плавність переходу тексту: оновлення заголовків та описів етапів має м'який cross-fade ефект при переході між кроками.
5. Коректний розрахунок скролу: перевірити поведінку на початку та в кінці треку, щоб не було ривків.

---

### Task 1: Particle Engine & Shape Morphing Module

**Files:**
- Create: `scripts/process-particles.js`
- Test: `tests/process-particles-test.js`

**Interfaces:**
- Produces: `initProcessParticles(canvasElement, hudElements)` — експортує функцію ініціалізації та повертає API `{ setProgress(progress), destroy(), getActiveStage() }`.

- [ ] **Step 1: Write the failing unit test for process particles module**
Створити `tests/process-particles-test.js`, що перевіряє експорт `initProcessParticles`, генерацію 6 станів форм та розрахунок активного етапу від 0.0 до 1.0.

- [ ] **Step 2: Run test to verify it fails**
Run: `node tests/process-particles-test.js`
Expected: FAIL (модуль ще не створено).

- [ ] **Step 3: Implement `scripts/process-particles.js`**
Реалізувати клас рушія часток:
- Масив із 400 часток із властивостями `(x, y, vx, vy, targetX, targetY, color, size, alpha)`.
- 6 генераторів точок фігур:
  1. Radar / Blueprint circle & grid.
  2. Content Layout grid lines & blocks.
  3. 3D Diamond / Prism octahedron wireframe.
  4. Code brackets `< / >` terminal outline.
  5. Neural API Network constellation nodes.
  6. Rocket ship & orbital sphere.
- Метод `setProgress(progress)` для інтерполяції цільових точок та перемикання активного кроку (0..5).
- Цикл `requestAnimationFrame` з пружною фізикою `(target - pos) * stiffness - vel * damping`.

- [ ] **Step 4: Run test to verify it passes**
Run: `node tests/process-particles-test.js`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add scripts/process-particles.js tests/process-particles-test.js
git commit -m "feat(process): add particle morphing canvas engine"
```

---

### Task 2: Pinned Scrollytelling Styles & HUD Layout

**Files:**
- Create: `styles/process-particles.css`
- Modify: `index.html` (підключення нового CSS)

**Interfaces:**
- Consumes: CSS Custom properties з `terminal.css`.
- Produces: Класи `.wc-process-scroll-container`, `.wc-process-sticky-frame`, `#wc-process-particle-canvas`, `.wc-process-glass-hud`.

- [ ] **Step 1: Write style specifications in `styles/process-particles.css`**
- `.wc-process-scroll-container`: `position: relative; height: 350vh; width: 100%;`.
- `.wc-process-sticky-frame`: `position: sticky; top: 0; width: 100%; height: 100vh; overflow: hidden; background: radial-gradient(circle at center, #111424 0%, #08090f 100%); display: flex; flex-direction: column; justify-content: space-between; align-items: center;`.
- `#wc-process-particle-canvas`: `position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1;`.
- `.wc-process-glass-hud`: `position: relative; z-index: 10; margin-bottom: clamp(1.5rem, 4vh, 3rem); background: rgba(18, 20, 32, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 1.25rem 2rem; width: min(90%, 540px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6); text-align: center;`.
- Смужка прогресу `.wc-process-progress-bar`: `height: 3px; background: rgba(255, 255, 255, 0.1); border-radius: 2px; overflow: hidden;`.

- [ ] **Step 2: Link `styles/process-particles.css` in `index.html`**
Додати `<link rel="stylesheet" href="styles/process-particles.css">` у `<head>`.

- [ ] **Step 3: Commit**
```bash
git add styles/process-particles.css index.html
git commit -m "feat(process): add pinned scrollytelling styles and glass hud"
```

---

### Task 3: Replace `#wc-standards-timeline` in `scripts/terminal.js` and Connect Scrollytelling

**Files:**
- Modify: `scripts/terminal.js`
- Modify: `tests/reveal-features-test.js` (якщо старий блок перевірявся)

**Interfaces:**
- Consumes: `initProcessParticles` з `scripts/process-particles.js`.
- Produces: Нова розмітка процесу розробки в DOM із динамічним скрол-контролером.

- [ ] **Step 1: Inspect and update tests expecting `#wc-standards-timeline`**
Перевірити наявні тести на наявність перевірки `#wc-standards-timeline` і адаптувати їх до нової розмітки `#wc-process-section`.

- [ ] **Step 2: Replace `#wc-standards-timeline` in `scripts/terminal.js`**
- Видалити стару розмітку `wc-standards-timeline-block` та виклик `initStandardsTimeline()`.
- Вставити розмітку `.wc-process-scroll-container` з ID `wc-process-section` та елементами HUD і canvas.
- Додати ініціалізацію `initProcessDevelopmentSection()`:
  - Підключення IntersectionObserver та обробника `scroll`.
  - Розрахунок `progress = (window.scrollY - rect.top) / (rect.height - window.innerHeight)`.
  - Передача `progress` у `particleEngine.setProgress(clampedProgress)`.
  - Оновлення вмісту HUD (номер етапу, назва, опис, відсоток прогресу).

- [ ] **Step 3: Run existing and new test suites**
Run: `npm test`
Expected: Всі тести успішно проходять.

- [ ] **Step 4: Commit**
```bash
git add scripts/terminal.js tests/reveal-features-test.js
git commit -m "feat(process): integrate process particles block into terminal page"
```

---

### Task 4: End-to-End Visual Verification & Polish

**Files:**
- Modify: `scripts/process-particles.js` (fine-tuning coordinates & visual glow)
- Modify: `styles/process-particles.css` (responsive adjustments)

- [ ] **Step 1: Launch automated browser verification**
Перевірити за допомогою браузерного тесту рендеринг canvas, скрол до блоку та зміну всіх 6 станів при прокрутці.

- [ ] **Step 2: Capture screenshots for review**
Зробити знімок екрана блоку під час прокручування на кількох етапах.

- [ ] **Step 3: Final clean-up and commit**
```bash
git commit -m "polish(process): perfect particle transitions and mobile responsiveness"
```
