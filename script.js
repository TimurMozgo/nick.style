// Ждем пока загрузится весь DOM
document.addEventListener('DOMContentLoaded', () => {
    
    // Находим все элементы с классом hidden
    const hiddenElements = document.querySelectorAll('.hidden');

    // Настройки обсервера
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Анимация стартует, когда видно 15% элемента
    };

    // Создаем сам обсервер
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Если элемент появился в зоне видимости, добавляем класс show
                entry.target.classList.add('show');
                // Отключаем наблюдение за элементом после появления, 
                // чтобы анимация проигралась один раз (фиксируем профит)
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Вешаем обсервер на каждый скрытый элемент
    hiddenElements.forEach(el => observer.observe(el));
});

const burgerBtn = document.getElementById('burgerBtn');
const navMenu = document.getElementById('navMenu');
const closeBtn = document.getElementById('closeBtn');

burgerBtn.addEventListener('click', () => {
    navMenu.classList.add('open');
});

closeBtn.addEventListener('click', () => {
    navMenu.classList.remove('open');
});

// Закрытие при клике на ссылку (чтобы не перекрывало контент)
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('open');
    });
});

// Логика для аккордеона FAQ
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
        // Проверяем, есть ли уже активный открытый элемент
        const activeItem = document.querySelector('.faq-item.active');
        
        // Если кликнули на другой элемент — закрываем текущий открытый
        if (activeItem && activeItem !== item) {
            activeItem.classList.remove('active');
            activeItem.querySelector('.faq-answer').style.maxHeight = null;
        }
        
        // Переключаем класс active для текущего элемента
        item.classList.toggle('active');
        
        const answer = item.querySelector('.faq-answer');
        
        if (item.classList.contains('active')) {
            // Задаем точную высоту контента для идеальной плавности CSS перехода
            answer.style.maxHeight = answer.scrollHeight + 'px';
        } else {
            // Закрываем обратно
            answer.style.maxHeight = null;
        }
    });
});

// ==========================================
// ВЕЧНЫЙ ЧАТ: СОХРАНЕНИЕ ИСТОРИИ МЕЖДУ СТРАНИЦАМИ
// ==========================================
const wWrapper = document.getElementById('luxWidget'), wTrigger = document.getElementById('luxTrigger');
const aiBtn = document.getElementById('luxAiBtn'), cBox = document.getElementById('luxBox'), cClose = document.getElementById('luxClose');
const cMsgs = document.getElementById('luxMsgs'), cInp = document.getElementById('luxInp'), cSend = document.getElementById('luxSend');

// 1. Инициализация сессии
let sId = localStorage.getItem('store_ai_sess') || ('sess_' + Math.random().toString(36).substring(2, 11));
localStorage.setItem('store_ai_sess', sId);

// 2. ВОССТАНОВЛЕНИЕ ИСТОРИИ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
function loadChatHistory() {
    const savedMsgs = localStorage.getItem('store_chat_history');
    if (savedMsgs) {
        // Если в памяти есть сообщения, очищаем дефолтное приветствие и рендерим историю
        cMsgs.innerHTML = '';
        const history = JSON.parse(savedMsgs);
        history.forEach(msg => {
            appendMsgMarkup(msg.text, msg.sender);
        });
        cMsgs.scrollTop = cMsgs.scrollHeight;
    }
}
// Запускаем восстановление сразу при подключении скрипта
loadChatHistory();

// 3. Функция сохранения нового сообщения в память браузера
function saveMessageToLocal(text, sender) {
    let history = localStorage.getItem('store_chat_history') ? JSON.parse(localStorage.getItem('store_chat_history')) : [];
    history.push({ text: text, sender: sender });
    localStorage.setItem('store_chat_history', JSON.stringify(history));
}

// Переключатели интерфейса
wTrigger.addEventListener('click', () => { wWrapper.classList.toggle('active'); cBox.classList.remove('open'); });
aiBtn.addEventListener('click', () => { wWrapper.classList.remove('active'); cBox.classList.add('open'); cInp.focus(); });
cClose.addEventListener('click', () => cBox.classList.remove('open'));

// 4. Отправка сообщений на n8n
function sendToBot() {
    const txt = cInp.value.trim(); if (!txt) return;
    
    // Отображаем у пользователя и сохраняем в локальную историю
    appendMsgMarkup(txt, 'user');
    saveMessageToLocal(txt, 'user');
    cInp.value = '';

    const n8nWebhookUrl = 'https://tiktiok.xyz/webhook/0c76e581-d325-4ca8-b88b-caccb01ccdb3';
    const payload = { sessionId: sId, message: txt };

    fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => { if (!res.ok) throw new Error(); return res.json(); })
    .then(data => {
        const botReply = data.response || data.output || 'Ответ успешно обработан';
        
        // Отображаем ответ ИИ и закидываем его в локальную историю
        appendMsgMarkup(botReply, 'ai');
        saveMessageToLocal(botReply, 'ai');
    })
    .catch(err => {
        console.error('Ошибка:', err);
        const errorText = 'Прошу прощения, возникли временные трудности с подключением.';
        appendMsgMarkup(errorText, 'ai');
    });
}

// Просто отрисовка HTML-блока на экране
function appendMsgMarkup(t, s) {
    const d = document.createElement('div'); d.classList.add('msg', s); d.innerText = t;
    cMsgs.appendChild(d); cMsgs.scrollTop = cMsgs.scrollHeight;
}

cSend.addEventListener('click', sendToBot);
cInp.addEventListener('keypress', (e) => { if(e.key==='Enter') sendToBot(); });