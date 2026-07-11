document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // 1. АНИМАЦИЯ ПОЯВЛЕНИЯ ЭЛЕМЕНТОВ (Intersection Observer)
    // ==========================================================================
    const catalogHiddenElements = document.querySelectorAll('.hidden');

    const catalogObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 
    };

    const catalogObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                // Фиксируем появление, снимаем наблюдение
                observer.unobserve(entry.target);
            }
        });
    }, catalogObserverOptions);

    catalogHiddenElements.forEach(el => catalogObserver.observe(el));


    // ==========================================================================
    // 2. УПРАВЛЕНИЕ ИНТЕРФЕЙСОМ (Плашка оформления и Окно Успеха)
    // ==========================================================================
    const orderDrawer = document.getElementById('orderDrawer');
    const orderOverlay = document.getElementById('orderOverlay');
    const closeDrawerBtn = document.getElementById('closeDrawer');
    
    const successModal = document.getElementById('successModal');
    const closeSuccessCross = document.getElementById('closeSuccess');
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');
    
    const orderForm = document.getElementById('orderForm');
    
    // Находим ВСЕ кнопки "Оформить заказ" в карточках актива
    const orderButtons = document.querySelectorAll('.btn-solid:not(.submit-order-btn)');

    console.log(orderDrawer);
    console.log(orderOverlay);

    // Функция открытия плашки ввода данных
    const openDrawer = (e) => {
        e.preventDefault();
        orderDrawer.classList.add('active');
        orderOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Запрещаем скролл сайта под плашкой
    };

    // Функция закрытия плашки ввода данных
    const closeDrawer = () => {
        orderDrawer.classList.remove('active');
        orderOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Возвращаем скролл
    };

    // Функция закрытия окна успешного ордера
    const closeSuccess = () => {
        successModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Слушатели кликов для открытия/закрытия элементов
    orderButtons.forEach(button => {
        button.addEventListener('click', openDrawer);
    });

    closeDrawerBtn.addEventListener('click', closeDrawer);
    orderOverlay.addEventListener('click', closeDrawer);
    
    closeSuccessCross.addEventListener('click', closeSuccess);
    closeSuccessBtn.addEventListener('click', closeSuccess);
    
    // Закрытие по клику на затемненный фон вокруг модалки успеха
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            closeSuccess();
        }
    });


    // ==========================================================================
    // 3. ОТПРАВКА ОРДЕРА НА ВЕБХУК В n8n (Закрытие сделки)
    // ==========================================================================
    orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Забираем данные из инпутов
            const name = document.getElementById('clientName').value;
            const phone = document.getElementById('clientPhone').value;

            // Твой рабочий эндпоинт в n8n
            const webhookUrl = 'https://tiktiok.xyz/webhook/98ccb536-4741-45d6-bc43-f40f49292e9b';

            // Формируем аккуратный JSON-пакет для Аудитора
            const orderData = {
                name: name,
                phone: phone,
                source: 'Сайт Салона (Каталог)',
                date: new Date().toLocaleString('ru-RU')
            };

            // ПРЕМИУМ UX: Моментально закрываем ввод и выкатываем плашку успеха.
            // Клиент не должен ждать ответа от сервера, для него все должно летать.
            closeDrawer();
            successModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Фиксируем экран под поп-апом успеха
            orderForm.reset(); // Очищаем форму под следующий ордер

            // Запускаем скрытую транзакцию в сеть
            fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            })
            .then(response => {
                if (!response.ok) {
                    console.error('Ордер ушел с ошибкой сети, проверяй статус шлюза n8n');
                } else {
                    console.log('Данные успешно пойманы воркфлоу n8n и переданы админу.');
                }
            })
            .catch(error => {
                console.error('Критическая ошибка при отправке запроса:', error);
            });
        });
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

// КНОПКА ПОДРОБНЕЕ В КАРТОЧКАХ ТОВАРА

/*====================================================
            ПОДРОБНЕЕ
====================================================*/

const services = {

"detail-1":{

title:"Маникюр Комбинированный",

html:`

<p>
Комбинированный маникюр сочетает аппаратную и ручную техники обработки,
что позволяет максимально аккуратно удалить кутикулу,
придать идеальную форму ногтям и обеспечить безупречный внешний вид.
</p>

<h3>В услугу входит</h3>

<ul>

<li>Консультация мастера</li>

<li>Обработка рук антисептиком</li>

<li>Аппаратная обработка кутикулы</li>

<li>Обработка боковых валиков</li>

<li>Придание формы ногтям</li>

<li>Полировка ногтевой пластины</li>

<li>Масло для кутикулы</li>

<li>Увлажняющий крем</li>

</ul>

<p>

<strong>Продолжительность:</strong>

45–60 минут

</p>

`

},

"detail-2":{

title:"Маникюр с покрытием",

html:`

<p>

Полноценный уход за ногтями с нанесением стойкого
гель-лака премиум качества.

Покрытие сохраняет безупречный внешний вид до 4 недель.

</p>

<h3>В услугу входит</h3>

<ul>

<li>Комбинированный маникюр</li>

<li>Выравнивание ногтя</li>

<li>База</li>

<li>Цвет</li>

<li>Топ</li>

<li>Масло</li>

<li>Крем</li>

</ul>

<p>

<strong>Продолжительность:</strong>

1.5–2 часа

</p>

`

},

"detail-3":{

title:"Наращивание на верхние формы",

html:`

<p>

Современное моделирование ногтей с идеальной архитектурой
и естественным внешним видом.

</p>

<h3>В услугу входит</h3>

<ul>

<li>Подготовка ногтей</li>

<li>Маникюр</li>

<li>Моделирование</li>

<li>Опил</li>

<li>Покрытие</li>

<li>Финиш</li>

<li>Масло</li>

</ul>

<p>

<strong>Продолжительность:</strong>

2–3 часа

</p>

`

},

"detail-4":{

title:"Педикюр полный с покрытием",

html:`

<p>

Комплексный уход за стопами
с нанесением стойкого покрытия.

</p>

<h3>В услугу входит</h3>

<ul>

<li>Обработка стоп</li>

<li>Удаление натоптышей</li>

<li>Кутикула</li>

<li>Форма ногтей</li>

<li>Гель-лак</li>

<li>Топ</li>

</ul>

`

},

"detail-5":{

title:"Педикюр полный без покрытия",

html:`

<p>

Профессиональный уход
без декоративного покрытия.

</p>

<ul>

<li>Обработка стоп</li>

<li>Полировка</li>

<li>Кутикула</li>

<li>Увлажнение</li>

</ul>

`

},

"detail-6":{

title:"Педикюр только пальчики",

html:`

<p>

Уход только за ногтями пальцев ног.

</p>

<ul>

<li>Кутикула</li>

<li>Форма</li>

<li>Покрытие</li>

<li>Топ</li>

</ul>

`

},

"detail-7":{

title:"Снятие без покрытия",

html:`

<p>

Бережное снятие материала
без повреждения натурального ногтя.

</p>

<ul>

<li>Снятие покрытия</li>

<li>Полировка</li>

<li>Масло</li>

</ul>

`

},

"detail-8":{

title:"Ремонт ногтя",

html:`

<p>

Восстановление формы,
архитектуры и прочности ногтя.

</p>

<ul>

<li>Диагностика</li>

<li>Восстановление</li>

<li>Укрепление</li>

<li>Подготовка под покрытие</li>

</ul>

<p>

<strong>1–2 ногтя бесплатно</strong>

</p>

`

}

};

const modal=document.getElementById("serviceModal");

const modalBody=document.getElementById("serviceModalBody");

const close=document.getElementById("closeServiceModal");

document.querySelectorAll(".btn-outline").forEach(btn=>{

btn.addEventListener("click",()=>{

const id=btn.dataset.target;

const data=services[id];

if(!data)return;

modalBody.innerHTML=`

<h2>${data.title}</h2>

${data.html}

`;

modal.classList.add("active");

document.body.style.overflow="hidden";

});

});

close.onclick=()=>{

modal.classList.remove("active");

document.body.style.overflow="";

};

modal.onclick=e=>{

if(e.target===modal){

modal.classList.remove("active");

document.body.style.overflow="";

}

};

document.addEventListener("keydown",e=>{

if(e.key==="Escape"){

modal.classList.remove("active");

document.body.style.overflow="";

}

});