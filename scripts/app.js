/**
 * WEBCRAFT STUDIO — APPLICATION LOGIC
 * Модуль управления интерактивностью:
 * - Переключение интерактивных табов услуг
 * - Управление модальным окном контактов (5 каналов)
 * - Синхронизация данных с SITE_CONFIG
 * - Клавиатурная доступность (Esc, Enter, Space)
 */

(function () {
  'use strict';

  // Состояние приложения
  let currentActiveTab = 'landing';
  const modal = document.getElementById('contact-modal');
  const modalBox = modal ? modal.querySelector('.modal-box') : null;
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const servicesPanel = document.getElementById('services-panel-output');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const openModalButtons = document.querySelectorAll('.open-modal-btn');

  /**
   * Инициализация при загрузке DOM
   */
  function init() {
    initContactsFromConfig();
    initTabs();
    initModalEvents();
  }

  /**
   * Заполнение контактных ссылок и меток из объекта SITE_CONFIG
   */
  function initContactsFromConfig() {
    if (typeof SITE_CONFIG === 'undefined') return;

    // Статус в шапке
    const statusElem = document.getElementById('status-badge-text');
    if (statusElem && SITE_CONFIG.brand) {
      statusElem.textContent = SITE_CONFIG.brand.statusBadge;
    }

    // Телефон в подвале и модалке
    const footerPhone = document.getElementById('footer-phone-link');
    const displayPhone = document.getElementById('display-phone-number');
    const channelPhone = document.getElementById('channel-phone');
    if (SITE_CONFIG.contacts && SITE_CONFIG.contacts.phone) {
      if (footerPhone) {
        footerPhone.href = SITE_CONFIG.contacts.phone.url;
        footerPhone.textContent = SITE_CONFIG.contacts.phone.display;
      }
      if (displayPhone) {
        displayPhone.textContent = SITE_CONFIG.contacts.phone.display;
      }
      if (channelPhone) {
        channelPhone.href = SITE_CONFIG.contacts.phone.url;
      }
    }

    // Telegram
    const channelTg = document.getElementById('channel-telegram');
    const displayTg = document.getElementById('display-tg-handle');
    if (SITE_CONFIG.contacts && SITE_CONFIG.contacts.telegram) {
      if (channelTg) channelTg.href = SITE_CONFIG.contacts.telegram.url;
      if (displayTg) displayTg.textContent = `${SITE_CONFIG.contacts.telegram.handle} (мгновенный ответ)`;
    }

    // WhatsApp
    const channelWa = document.getElementById('channel-whatsapp');
    if (channelWa && SITE_CONFIG.contacts && SITE_CONFIG.contacts.whatsapp) {
      channelWa.href = SITE_CONFIG.contacts.whatsapp.url;
    }

    // Viber
    const channelViber = document.getElementById('channel-viber');
    if (channelViber && SITE_CONFIG.contacts && SITE_CONFIG.contacts.viber) {
      channelViber.href = SITE_CONFIG.contacts.viber.url;
    }

    // Instagram
    const channelInsta = document.getElementById('channel-instagram');
    const displayInsta = document.getElementById('display-insta-handle');
    if (SITE_CONFIG.contacts && SITE_CONFIG.contacts.instagram) {
      if (channelInsta) channelInsta.href = SITE_CONFIG.contacts.instagram.url;
      if (displayInsta) displayInsta.textContent = SITE_CONFIG.contacts.instagram.handle;
    }
  }

  /**
   * Инициализация переключения табов
   */
  function initTabs() {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        if (tabId) switchTab(tabId);
      });

      // Доступность с клавиатуры (стрелки влево/вправо)
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const tabs = Array.from(tabButtons);
          const currentIndex = tabs.indexOf(btn);
          const nextIndex = e.key === 'ArrowRight' 
            ? (currentIndex + 1) % tabs.length 
            : (currentIndex - 1 + tabs.length) % tabs.length;
          tabs[nextIndex].focus();
          tabs[nextIndex].click();
        }
      });
    });

    // Отрисовать начальный активный таб
    renderActiveService(currentActiveTab);
  }

  /**
   * Переключение активного таба
   * @param {string} tabId 
   */
  function switchTab(tabId) {
    currentActiveTab = tabId;

    tabButtons.forEach(btn => {
      const isCurrent = btn.getAttribute('data-tab') === tabId;
      btn.classList.toggle('active', isCurrent);
      btn.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
    });

    renderActiveService(tabId);
  }

  /**
   * Отрисовка контента выбранной услуги из SITE_CONFIG
   * @param {string} serviceId 
   */
  function renderActiveService(serviceId) {
    if (!servicesPanel || typeof SITE_CONFIG === 'undefined') return;

    const service = SITE_CONFIG.services.find(s => s.id === serviceId) || SITE_CONFIG.services[0];
    if (!service) return;

    const includesHtml = service.turnkeyIncludes
      .map(item => `<li>${item}</li>`)
      .join('');

    servicesPanel.innerHTML = `
      <div class="tab-content-grid" id="tab-content-${service.id}">
        <div class="tab-header-box">
          <span class="badge badge-amber">${service.badge}</span>
          <h3>${service.name}</h3>
          <p>${service.shortDesc}</p>

          <div class="turnkey-list-title">В стоимость под ключ входит:</div>
          <ul class="turnkey-list">
            ${includesHtml}
          </ul>
        </div>

        <div class="tab-summary-box">
          <div class="summary-meta-item">
            <strong>Идеально для:</strong>
            <span>${service.idealFor}</span>
          </div>

          <div class="summary-meta-item">
            <strong>Сроки реализации:</strong>
            <span style="color: var(--accent-amber);">${service.deliveryTime}</span>
          </div>

          <div class="summary-meta-item">
            <strong>Итог работы:</strong>
            <span>${service.deliverables}</span>
          </div>

          <button class="btn btn-primary open-modal-btn" style="margin-top: 0.5rem; width: 100%;">
            <span>Обсудить ${service.name.toLowerCase()}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    `;

    // Привязываем слушатель клика к только что созданной кнопке
    const newBtn = servicesPanel.querySelector('.open-modal-btn');
    if (newBtn) {
      newBtn.addEventListener('click', openContactModal);
    }
  }

  /**
   * Открыть модальное окно контактов
   */
  function openContactModal() {
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // блокируем скролл страницы
    if (modalBox) modalBox.focus();
  }

  /**
   * Закрыть модальное окно контактов
   */
  function closeContactModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // возвращаем скролл
  }

  /**
   * Инициализация слушателей модального окна
   */
  function initModalEvents() {
    // Открытие по кнопкам (делегирование и прямые слушатели)
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.open-modal-btn');
      if (btn) {
        e.preventDefault();
        openContactModal();
      }
    });

    const currentModalBtns = document.querySelectorAll('.open-modal-btn');
    currentModalBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openContactModal();
      });
    });

    // Закрытие по крестику
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeContactModal);
    }

    // Закрытие по клику на подложку (бэкдроп вне modal-box)
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeContactModal();
        }
      });
    }

    // Закрытие по клавише Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        closeContactModal();
      }
    });
  }

  // Запуск при готовности страницы
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Экспорт функций для тестирования
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      switchTab,
      renderActiveService,
      openContactModal,
      closeContactModal
    };
  }
})();
