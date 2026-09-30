// ========================================
// 90 ДНЕЙ
// ОСНОВНАЯ ЛОГИКА
// ========================================


// ========================================
// НАСТРОЙКИ
// ========================================

const CHALLENGE_START = "2026-10-01";
const CHALLENGE_LENGTH = 90;
const CHALLENGE_END = "2026-12-29";


// ========================================
// СФЕРЫ ЗАДАЧ
// ========================================

const CATEGORIES = [
    "Духовный рост",
    "Здоровье",
    "Развитие блога",
    "Финансы"
];


// ========================================
// ЗАДАЧИ
// ========================================

let tasks =
    JSON.parse(
        localStorage.getItem("90days_tasks")
    ) || [];


// ========================================
// ДАННЫЕ «ДО → ПОСЛЕ»
// ========================================

const BEFORE_AFTER_KEY =
    "90days_before_after";


const DEFAULT_WHEEL_CATEGORIES = [
    "Здоровье",
    "Финансы",
    "Работа",
    "Отношения",
    "Личное развитие",
    "Отдых",
    "Творчество",
    "Духовный рост"
];


let beforeAfter =
    JSON.parse(
        localStorage.getItem(
            BEFORE_AFTER_KEY
        )
    ) || {

        pointA: {

            notSatisfied: "",
            change: "",
            receive: ""

        },

        wheelCategories:
            DEFAULT_WHEEL_CATEGORIES.map(
                name => ({

                    name: name,
                    pointA: 5,
                    pointB: 5

                })
            ),

        pointB: {

            changed: "",
            changedHow: "",
            received: ""

        }

    };


// Если структура была создана
// в старой версии — дополняем её

function normalizeBeforeAfter() {

    if (
        !beforeAfter.pointA
    ) {

        beforeAfter.pointA = {

            notSatisfied: "",
            change: "",
            receive: ""

        };

    }


    if (
        !beforeAfter.pointB
    ) {

        beforeAfter.pointB = {

            changed: "",
            changedHow: "",
            received: ""

        };

    }


    if (
        !Array.isArray(
            beforeAfter.wheelCategories
        ) ||
        beforeAfter.wheelCategories.length === 0
    ) {

        beforeAfter.wheelCategories =
            DEFAULT_WHEEL_CATEGORIES.map(
                name => ({

                    name: name,
                    pointA: 5,
                    pointB: 5

                })
            );

    }


    beforeAfter.wheelCategories =
        beforeAfter.wheelCategories.map(
            item => ({

                name:
                    item.name ||
                    "Новая сфера",

                pointA:
                    Number.isFinite(
                        Number(item.pointA)
                    )
                        ? Number(item.pointA)
                        : 5,

                pointB:
                    Number.isFinite(
                        Number(item.pointB)
                    )
                        ? Number(item.pointB)
                        : 5

            })
        );

}


normalizeBeforeAfter();


// ========================================
// СОХРАНЕНИЕ
// ========================================

function saveTasks() {

    localStorage.setItem(
        "90days_tasks",
        JSON.stringify(tasks)
    );

}


function saveBeforeAfter() {

    localStorage.setItem(
        BEFORE_AFTER_KEY,
        JSON.stringify(
            beforeAfter
        )
    );

}


// ========================================
// ТЕКУЩАЯ ДАТА
// ========================================

function getToday() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${year}-${month}-${day}`;

}


// ========================================
// DATE
// ========================================

function getDateObject(
    dateString
) {

    return new Date(
        dateString +
        "T00:00:00"
    );

}


// ========================================
// ДЕНЬ НЕДЕЛИ
// ========================================

function getWeekDay(
    dateString
) {

    return getDateObject(
        dateString
    ).getDay();

}


// ========================================
// ДОБАВИТЬ ДНИ
// ========================================

function addDays(
    dateString,
    amount
) {

    const date =
        getDateObject(
            dateString
        );

    date.setDate(
        date.getDate() +
        amount
    );

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${year}-${month}-${day}`;

}


// ========================================
// ДЕНЬ ЧЕЛЛЕНДЖА
// ========================================

function getChallengeDay(
    dateString = getToday()
) {

    const start =
        getDateObject(
            CHALLENGE_START
        );

    const date =
        getDateObject(
            dateString
        );

    const difference =
        date - start;

    return (
        Math.floor(
            difference /
            (
                1000 *
                60 *
                60 *
                24
            )
        ) + 1
    );

}


// ========================================
// ПРОГРЕСС
// ========================================

function getChallengeProgress() {

    const day =
        getChallengeDay();

    if (
        day < 1
    ) {

        return 0;

    }

    if (
        day >
        CHALLENGE_LENGTH
    ) {

        return 100;

    }

    return Math.round(
        (
            day /
            CHALLENGE_LENGTH
        ) * 100
    );

}


// ========================================
// ФОРМАТ ДАТЫ
// ========================================

function formatDate(
    dateString = getToday()
) {

    const date =
        getDateObject(
            dateString
        );

    return date.toLocaleDateString(
        "ru-RU",
        {
            day: "numeric",
            month: "long"
        }
    );

}


// ========================================
// ДЕНЬ НЕДЕЛИ
// ========================================

function formatWeekDay(
    dateString
) {

    return getDateObject(
        dateString
    ).toLocaleDateString(
        "ru-RU",
        {
            weekday: "long"
        }
    );

}


// ========================================
// ПРОВЕРКА ПЕРИОДА ЗАДАЧИ
// ========================================

function isDateInsideTaskPeriod(
    task,
    dateString
) {

    const startDate =
        task.startDate ||
        task.date ||
        CHALLENGE_START;


    if (
        dateString <
        startDate
    ) {

        return false;

    }


    if (
        task.endDate &&
        dateString >
        task.endDate
    ) {

        return false;

    }


    return true;

}


// ========================================
// ДОЛЖНА ЛИ ЗАДАЧА БЫТЬ В ЭТОТ ДЕНЬ
// ========================================

function isTaskForDate(
    task,
    dateString
) {

    if (
        !task.repeat ||
        task.repeat ===
        "once"
    ) {

        return (
            task.date ===
            dateString
        );

    }


    if (
        !isDateInsideTaskPeriod(
            task,
            dateString
        )
    ) {

        return false;

    }


    if (
        task.repeat ===
        "daily"
    ) {

        return true;

    }


    if (
        task.repeat ===
        "weekly"
    ) {

        const weekDay =
            getWeekDay(
                dateString
            );

        return Boolean(
            task.weekDays &&
            task.weekDays.includes(
                weekDay
            )
        );

    }


    return false;

}


// ========================================
// ВЫПОЛНЕНА ЛИ ЗАДАЧА
// ========================================

function isTaskCompleted(
    task,
    dateString
) {

    if (
        task.completions
    ) {

        return Boolean(
            task.completions[
                dateString
            ]
        );

    }


    if (
        task.date ===
        dateString
    ) {

        return Boolean(
            task.completed
        );

    }


    return false;

}


// ========================================
// ЗАДАЧИ НА ДЕНЬ
// ========================================

function getTasksForDate(
    dateString
) {

    return tasks.filter(
        task =>
            isTaskForDate(
                task,
                dateString
            )
    );

}


// ========================================
// ЗАПУСК
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateChallengeInfo();

        renderTasks();

        setupFirstTaskButton();

        setupNavigation();

        renderBeforeAfter();

    }
);


// ========================================
// ИНФОРМАЦИЯ О ЧЕЛЛЕНДЖЕ
// ========================================

function updateChallengeInfo() {

    const day =
        getChallengeDay();

    const progress =
        getChallengeProgress();


    const dayElement =
        document.querySelector(
            "#challenge-day"
        );


    if (
        dayElement
    ) {

        if (
            day < 1
        ) {

            dayElement.textContent =
                "Старт 1 октября";

        } else if (
            day >
            CHALLENGE_LENGTH
        ) {

            dayElement.textContent =
                "Челлендж завершён";

        } else {

            dayElement.textContent =
                `День ${day}`;

        }

    }


    const progressText =
        document.querySelector(
            "#challenge-progress"
        );


    if (
        progressText
    ) {

        progressText.textContent =
            `${progress}%`;

    }


    const progressFill =
        document.querySelector(
            "#challenge-progress-fill"
        );


    if (
        progressFill
    ) {

        progressFill.style.width =
            `${progress}%`;

    }


    const dateElement =
        document.querySelector(
            "#today-date"
        );


    if (
        dateElement
    ) {

        dateElement.textContent =
            formatDate();

    }

}


// ========================================
// НАВИГАЦИЯ
// ========================================

function setupNavigation() {

    const buttons =
        document.querySelectorAll(
            ".nav-item"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const pageId =
                        button.dataset.page;


                    if (
                        !pageId
                    ) {

                        return;

                    }


                    showPage(
                        pageId
                    );


                    buttons.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    if (
                        pageId ===
                        "calendar-page"
                    ) {

                        renderCalendar();

                    }


                    if (
                        pageId ===
                        "before-after-page"
                    ) {

                        renderBeforeAfter();

                    }

                }
            );

        }
    );

}


// ========================================
// ПОКАЗАТЬ СТРАНИЦУ
// ========================================

function showPage(
    pageId
) {

    const pages =
        document.querySelectorAll(
            ".page"
        );


    pages.forEach(
        page => {

            page.classList.remove(
                "active-page"
            );

        }
    );


    const page =
        document.getElementById(
            pageId
        );


    if (
        page
    ) {

        page.classList.add(
            "active-page"
        );

    }

}


// ========================================
// ФОРМА ЗАДАЧИ
// ========================================

function openTaskForm(
    taskToEdit = null
) {

    const oldForm =
        document.querySelector(
            ".task-form"
        );


    if (
        oldForm
    ) {

        oldForm.remove();

    }


    const isEditing =
        Boolean(
            taskToEdit
        );


    const form =
        document.createElement(
            "div"
        );


    form.className =
        "task-form";


    form.innerHTML = `

        <div class="form-overlay"></div>

        <div class="form-window">

            <button
                class="close-form"
                aria-label="Закрыть"
            >
                ×
            </button>

            <p class="eyebrow">
                ${
                    isEditing
                        ? "РЕДАКТИРОВАНИЕ"
                        : "НОВЫЙ ШАГ"
                }
            </p>

            <h2>
                ${
                    isEditing
                        ? "Измени свой шаг"
                        : "Что ты хочешь делать?"
                }
            </h2>

            <label for="task-title">
                Задача
            </label>

            <input
                type="text"
                id="task-title"
                placeholder="Например: пройти 6 000 шагов"
                autocomplete="off"
                value="${
                    isEditing
                        ? escapeAttribute(
                            taskToEdit.title
                        )
                        : ""
                }"
            >

            <label for="task-category">
                Сфера
            </label>

            <select id="task-category">

                ${
                    CATEGORIES
                        .map(
                            category => `

                                <option
                                    value="${category}"
                                    ${
                                        isEditing &&
                                        taskToEdit.category ===
                                        category
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    ${category}
                                </option>

                            `
                        )
                        .join("")
                }

            </select>

            <label for="task-repeat">
                Повторение
            </label>

            <select id="task-repeat">

                <option
                    value="once"
                    ${
                        !isEditing ||
                        taskToEdit.repeat ===
                        "once"
                            ? "selected"
                            : ""
                    }
                >
                    Только сегодня
                </option>

                <option
                    value="daily"
                    ${
                        isEditing &&
                        taskToEdit.repeat ===
                        "daily"
                            ? "selected"
                            : ""
                    }
                >
                    Каждый день
                </option>

                <option
                    value="weekly"
                    ${
                        isEditing &&
                        taskToEdit.repeat ===
                        "weekly"
                            ? "selected"
                            : ""
                    }
                >
                    По выбранным дням
                </option>

            </select>

            <div>

                <label for="task-period">
                    Период
                </label>

                <select id="task-period">

                    <option
                        value="challenge"
                        ${
                            !isEditing ||
                            !taskToEdit.endDate ||
                            taskToEdit.endDate ===
                            CHALLENGE_END
                                ? "selected"
                                : ""
                        }
                    >
                        Все 90 дней
                    </option>

                    <option
                        value="until-date"
                        ${
                            isEditing &&
                            taskToEdit.endDate &&
                            taskToEdit.endDate !==
                            CHALLENGE_END
                                ? "selected"
                                : ""
                        }
                    >
                        До определённой даты
                    </option>

                </select>

                <input
                    type="date"
                    id="task-end-date"
                    value="${
                        isEditing &&
                        taskToEdit.endDate &&
                        taskToEdit.endDate !==
                        CHALLENGE_END
                            ? taskToEdit.endDate
                            : ""
                    }"
                    style="${
                        isEditing &&
                        taskToEdit.endDate &&
                        taskToEdit.endDate !==
                        CHALLENGE_END
                            ? "display:block;"
                            : "display:none;"
                    }"
                >

            </div>

            <div
                id="weekdays-container"
                style="${
                    isEditing &&
                    taskToEdit.repeat ===
                    "weekly"
                        ? "display:block;"
                        : "display:none;"
                }"
            >

                <label>
                    Дни недели
                </label>

                <div class="weekdays">

                    ${createWeekdayButtons(
                        isEditing
                            ? taskToEdit.weekDays
                            : []
                    )}

                </div>

            </div>

            <div class="form-actions">

                ${
                    isEditing
                        ? `
                            <button
                                class="delete-task-button"
                                id="delete-task-button"
                            >
                                Удалить
                            </button>
                        `
                        : ""
                }

                <button
                    class="primary-button"
                    id="save-task-button"
                >
                    ${
                        isEditing
                            ? "Сохранить"
                            : "Добавить"
                    }
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        form
    );


    form
        .querySelector(
            ".close-form"
        )
        .addEventListener(
            "click",
            () => form.remove()
        );


    form
        .querySelector(
            ".form-overlay"
        )
        .addEventListener(
            "click",
            () => form.remove()
        );


    const repeatSelect =
        form.querySelector(
            "#task-repeat"
        );

    const periodSelect =
        form.querySelector(
            "#task-period"
        );

    const periodDate =
        form.querySelector(
            "#task-end-date"
        );

    const weekdaysContainer =
        form.querySelector(
            "#weekdays-container"
        );


    function updateFormVisibility() {

        periodDate.style.display =
            periodSelect.value ===
            "until-date"
                ? "block"
                : "none";


        weekdaysContainer.style.display =
            repeatSelect.value ===
            "weekly"
                ? "block"
                : "none";

    }


    repeatSelect.addEventListener(
        "change",
        updateFormVisibility
    );


    periodSelect.addEventListener(
        "change",
        updateFormVisibility
    );


    form
        .querySelector(
            "#save-task-button"
        )
        .addEventListener(
            "click",
            () => {

                const title =
                    form
                        .querySelector(
                            "#task-title"
                        )
                        .value
                        .trim();


                const category =
                    form
                        .querySelector(
                            "#task-category"
                        )
                        .value;


                const repeat =
                    repeatSelect.value;


                const period =
                    periodSelect.value;


                const endDate =
                    period ===
                    "until-date"
                        ? periodDate.value
                        : CHALLENGE_END;


                if (
                    !title
                ) {

                    alert(
                        "Напиши название задачи"
                    );

                    return;

                }


                if (
                    period ===
                    "until-date" &&
                    !endDate
                ) {

                    alert(
                        "Выбери дату окончания"
                    );

                    return;

                }


                let weekDays = [];


                if (
                    repeat ===
                    "weekly"
                ) {

                    weekDays =
                        Array
                            .from(
                                form.querySelectorAll(
                                    ".weekday-button.active"
                                )
                            )
                            .map(
                                button =>
                                    Number(
                                        button.dataset.day
                                    )
                            );


                    if (
                        weekDays.length ===
                        0
                    ) {

                        alert(
                            "Выбери хотя бы один день недели"
                        );

                        return;

                    }

                }


                if (
                    isEditing
                ) {

                    taskToEdit.title =
                        title;

                    taskToEdit.category =
                        category;

                    taskToEdit.repeat =
                        repeat;

                    taskToEdit.endDate =
                        endDate;

                    taskToEdit.weekDays =
                        weekDays;


                    if (
                        !taskToEdit.completions
                    ) {

                        taskToEdit.completions =
                            {};

                    }

                } else {

                    const today =
                        getToday();


                    tasks.push({

                        id:
                            Date.now()
                                .toString(),

                        title:
                            title,

                        category:
                            category,

                        repeat:
                            repeat,

                        date:
                            today,

                        startDate:
                            today,

                        endDate:
                            endDate,

                        weekDays:
                            weekDays,

                        completions:
                            {}

                    });

                }


                saveTasks();

                form.remove();

                renderTasks();

                renderCalendar();

            }
        );


    if (
        isEditing
    ) {

        form
            .querySelector(
                "#delete-task-button"
            )
            .addEventListener(
                "click",
                () => {

                    if (
                        !confirm(
                            "Удалить эту задачу?"
                        )
                    ) {

                        return;

                    }


                    tasks =
                        tasks.filter(
                            task =>
                                task.id !==
                                taskToEdit.id
                        );


                    saveTasks();

                    form.remove();

                    renderTasks();

                    renderCalendar();

                }
            );

    }

}


// ========================================
// ДНИ НЕДЕЛИ
// ========================================

function createWeekdayButtons(
    selectedDays = []
) {

    const days = [

        {
            number: 1,
            name: "Пн"
        },

        {
            number: 2,
            name: "Вт"
        },

        {
            number: 3,
            name: "Ср"
        },

        {
            number: 4,
            name: "Чт"
        },

        {
            number: 5,
            name: "Пт"
        },

        {
            number: 6,
            name: "Сб"
        },

        {
            number: 0,
            name: "Вс"
        }

    ];


    return days
        .map(
            day => `

                <button
                    type="button"
                    class="weekday-button ${
                        selectedDays.includes(
                            day.number
                        )
                            ? "active"
                            : ""
                    }"
                    data-day="${day.number}"
                >
                    ${day.name}
                </button>

            `
        )
        .join("");

}


// ========================================
// ЗАДАЧИ — СЕГОДНЯ
// ========================================

function renderTasks() {

    const container =
        document.querySelector(
            "#task-groups"
        );

    const emptyState =
        document.querySelector(
            "#empty-state"
        );


    if (
        !container
    ) {

        return;

    }


    const today =
        getToday();


    const todayTasks =
        getTasksForDate(
            today
        );


    container.innerHTML =
        "";


    if (
        todayTasks.length ===
        0
    ) {

        container.style.display =
            "none";


        if (
            emptyState
        ) {

            emptyState.style.display =
                "block";

        }


        updateDailyProgress(
            []
        );

        return;

    }


    container.style.display =
        "block";


    if (
        emptyState
    ) {

        emptyState.style.display =
            "none";

    }


    CATEGORIES.forEach(
        category => {

            const categoryTasks =
                todayTasks.filter(
                    task =>
                        task.category ===
                        category
                );


            if (
                categoryTasks.length ===
                0
            ) {

                return;

            }


            const group =
                document.createElement(
                    "div"
                );


            group.className =
                "task-group";


            group.innerHTML = `

                <div class="task-group-title">
                    ${category}
                </div>

                <div class="task-list"></div>

            `;


            const list =
                group.querySelector(
                    ".task-list"
                );


            categoryTasks.forEach(
                task => {

                    const completed =
                        isTaskCompleted(
                            task,
                            today
                        );


                    const element =
                        document.createElement(
                            "div"
                        );


                    element.className =
                        `task ${
                            completed
                                ? "completed"
                                : ""
                        }`;


                    element.innerHTML = `

                        <button
                            class="task-check"
                            aria-label="Выполнить"
                        >
                            <span></span>
                        </button>

                        <div class="task-content">

                            <div class="task-title">
                                ${escapeHTML(
                                    task.title
                                )}
                            </div>

                        </div>

                        <button
                            class="task-edit"
                            aria-label="Редактировать"
                        >
                            ⋯
                        </button>

                    `;


                    element
                        .querySelector(
                            ".task-check"
                        )
                        .addEventListener(
                            "click",
                            () => {

                                toggleTask(
                                    task.id,
                                    today
                                );

                            }
                        );


                    element
                        .querySelector(
                            ".task-edit"
                        )
                        .addEventListener(
                            "click",
                            () => {

                                openTaskForm(
                                    task
                                );

                            }
                        );


                    list.appendChild(
                        element
                    );

                }
            );


            container.appendChild(
                group
            );

        }
    );


    updateDailyProgress(
        todayTasks
    );

}


// ========================================
// ПРОГРЕСС СЕГОДНЯ
// ========================================

function updateDailyProgress(
    dayTasks
) {

    const text =
        document.querySelector(
            "#daily-progress-text"
        );


    const fill =
        document.querySelector(
            "#daily-progress-fill"
        );


    const total =
        dayTasks.length;


    const completed =
        dayTasks.filter(
            task =>
                isTaskCompleted(
                    task,
                    getToday()
                )
        ).length;


    if (
        text
    ) {

        text.textContent =
            `${completed} из ${total}`;

    }


    if (
        fill
    ) {

        const percent =
            total > 0
                ? (
                    completed /
                    total
                ) * 100
                : 0;


        fill.style.width =
            `${percent}%`;

    }

}


// ========================================
// ОТМЕТИТЬ ЗАДАЧУ
// ========================================

function toggleTask(
    taskId,
    dateString = getToday()
) {

    const task =
        tasks.find(
            item =>
                item.id ===
                taskId
        );


    if (
        !task
    ) {

        return;

    }


    if (
        !task.completions
    ) {

        task.completions =
            {};

    }


    task.completions[
        dateString
    ] =
        !Boolean(
            task.completions[
                dateString
            ]
        );


    saveTasks();


    renderTasks();

    renderCalendar();

}


// ========================================
// ПЕРВАЯ КНОПКА
// ========================================

function setupFirstTaskButton() {

    const button =
        document.querySelector(
            "#first-task-button"
        );


    if (
        !button
    ) {

        return;

    }


    button.addEventListener(
        "click",
        () => {

            openTaskForm();

        }
    );

}


// ========================================
// КАЛЕНДАРЬ
// ========================================

let selectedCalendarDate =
    null;


function getInitialCalendarDate() {

    const today =
        getToday();


    if (
        today <
        CHALLENGE_START
    ) {

        return CHALLENGE_START;

    }


    if (
        today >
        CHALLENGE_END
    ) {

        return CHALLENGE_END;

    }


    return today;

}


function renderCalendar() {

    const container =
        document.querySelector(
            "#challenge-calendar"
        );


    if (
        !container
    ) {

        return;

    }


    container.innerHTML =
        "";


    const monthBlock =
        document.createElement(
            "div"
        );


    monthBlock.className =
        "calendar-month";


    const title =
        document.createElement(
            "h3"
        );


    title.textContent =
        "Октябрь — декабрь 2026";


    monthBlock.appendChild(
        title
    );


    const weekdays =
        document.createElement(
            "div"
        );


    weekdays.className =
        "calendar-weekdays";


    [
        "Пн",
        "Вт",
        "Ср",
        "Чт",
        "Пт",
        "Сб",
        "Вс"
    ].forEach(
        name => {

            const element =
                document.createElement(
                    "div"
                );


            element.textContent =
                name;


            weekdays.appendChild(
                element
            );

        }
    );


    monthBlock.appendChild(
        weekdays
    );


    const grid =
        document.createElement(
            "div"
        );


    grid.className =
        "calendar-grid";


    for (
        let i = 0;
        i < CHALLENGE_LENGTH;
        i++
    ) {

        const dateString =
            addDays(
                CHALLENGE_START,
                i
            );


        grid.appendChild(
            createCalendarDay(
                dateString
            )
        );

    }


    monthBlock.appendChild(
        grid
    );


    container.appendChild(
        monthBlock
    );


    if (
        !selectedCalendarDate
    ) {

        selectedCalendarDate =
            getInitialCalendarDate();

    }


    renderSelectedDay(
        selectedCalendarDate
    );

}


// ========================================
// ДЕНЬ КАЛЕНДАРЯ
// ========================================

function createCalendarDay(
    dateString
) {

    const button =
        document.createElement(
            "button"
        );


    button.className =
        "calendar-day";


    const dayTasks =
        getTasksForDate(
            dateString
        );


    const completedTasks =
        dayTasks.filter(
            task =>
                isTaskCompleted(
                    task,
                    dateString
                )
        );


    let status =
        "empty";


    if (
        dayTasks.length > 0 &&
        completedTasks.length ===
        dayTasks.length
    ) {

        status =
            "complete";

    } else if (
        completedTasks.length > 0
    ) {

        status =
            "partial";

    }


    button.classList.add(
        `status-${status}`
    );


    if (
        dateString ===
        getToday()
    ) {

        button.classList.add(
            "today"
        );

    }


    if (
        dateString ===
        selectedCalendarDate
    ) {

        button.classList.add(
            "selected"
        );

    }


    button.innerHTML = `

        <span class="calendar-day-number">
            ${getDateObject(
                dateString
            ).getDate()}
        </span>

        <span class="calendar-day-label">
            День ${
                getChallengeDay(
                    dateString
                )
            }
        </span>

    `;


    button.addEventListener(
        "click",
        () => {

            selectCalendarDay(
                dateString
            );

        }
    );


    return button;

}


// ========================================
// ВЫБРАТЬ ДЕНЬ
// ========================================

function selectCalendarDay(
    dateString
) {

    selectedCalendarDate =
        dateString;


    renderCalendar();


}


// ========================================
// ВЫБРАННЫЙ ДЕНЬ
// ========================================

function renderSelectedDay(
    dateString
) {

    const container =
        document.querySelector(
            "#selected-day"
        );


    if (
        !container
    ) {

        return;

    }


    const dayTasks =
        getTasksForDate(
            dateString
        );


    const completed =
        dayTasks.filter(
            task =>
                isTaskCompleted(
                    task,
                    dateString
                )
        ).length;


    let tasksHTML =
        "";


    if (
        dayTasks.length ===
        0
    ) {

        tasksHTML = `

            <div class="calendar-empty">
                На этот день пока нет шагов.
            </div>

        `;

    } else {

        tasksHTML =
            dayTasks
                .map(
                    task => {

                        const completed =
                            isTaskCompleted(
                                task,
                                dateString
                            );


                        return `

                            <button
                                class="
                                    calendar-task
                                    ${
                                        completed
                                            ? "completed"
                                            : ""
                                    }
                                "
                                data-task-id="${task.id}"
                                data-date="${dateString}"
                            >

                                <span
                                    class="calendar-task-dot"
                                ></span>

                                <span
                                    class="calendar-task-title"
                                >
                                    ${escapeHTML(
                                        task.title
                                    )}
                                </span>

                                <span
                                    class="calendar-task-hint"
                                >
                                    нажми
                                </span>

                            </button>

                        `;

                    }
                )
                .join("");

    }


    container.innerHTML = `

        <div class="selected-day-header">

            <div>

                <div class="selected-day-label">
                    ДЕНЬ ${getChallengeDay(
                        dateString
                    )}
                </div>

                <div class="selected-day-title">
                    ${formatDate(
                        dateString
                    )}
                </div>

                <div class="selected-day-week">
                    ${capitalizeFirst(
                        formatWeekDay(
                            dateString
                        )
                    )}
                </div>

            </div>

            <div class="selected-day-count">
                ${completed} из ${dayTasks.length}
            </div>

        </div>


        <div class="selected-day-tasks">

            ${tasksHTML}

        </div>


        <button
            class="calendar-add-task"
            id="calendar-add-task-button"
        >
            + Добавить шаг на этот день
        </button>

    `;


    container
        .querySelectorAll(
            ".calendar-task"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        toggleCalendarTask(
                            button.dataset.taskId,
                            button.dataset.date
                        );

                    }
                );

            }
        );


    container
        .querySelector(
            "#calendar-add-task-button"
        )
        .addEventListener(
            "click",
            () => {

                openCalendarTaskForm(
                    dateString
                );

            }
        );

}


// ========================================
// ОТМЕТИТЬ ЗАДАЧУ В КАЛЕНДАРЕ
// ========================================

function toggleCalendarTask(
    taskId,
    dateString
) {

    const task =
        tasks.find(
            item =>
                item.id ===
                taskId
        );


    if (
        !task
    ) {

        return;

    }


    if (
        !task.completions
    ) {

        task.completions =
            {};

    }


    task.completions[
        dateString
    ] =
        !Boolean(
            task.completions[
                dateString
            ]
        );


    saveTasks();


    renderCalendar();


    if (
        dateString ===
        getToday()
    ) {

        renderTasks();

    }

}


// ========================================
// ДОБАВИТЬ ЗАДАЧУ НА ДЕНЬ
// ========================================

function openCalendarTaskForm(
    dateString
) {

    const oldForm =
        document.querySelector(
            ".task-form"
        );


    if (
        oldForm
    ) {

        oldForm.remove();

    }


    const form =
        document.createElement(
            "div"
        );


    form.className =
        "task-form";


    form.innerHTML = `

        <div class="form-overlay"></div>

        <div class="form-window">

            <button
                class="close-form"
            >
                ×
            </button>

            <p class="eyebrow">
                НОВЫЙ ШАГ
            </p>

            <h2>
                ${formatDate(
                    dateString
                )}
            </h2>

            <label>
                Задача
            </label>

            <input
                type="text"
                id="calendar-task-title"
                placeholder="Например: написать пост"
                autocomplete="off"
            >

            <label>
                Сфера
            </label>

            <select
                id="calendar-task-category"
            >

                ${
                    CATEGORIES
                        .map(
                            category => `

                                <option
                                    value="${category}"
                                >
                                    ${category}
                                </option>

                            `
                        )
                        .join("")
                }

            </select>

            <div class="form-actions">

                <button
                    class="primary-button"
                    id="save-calendar-task"
                >
                    Добавить
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        form
    );


    form
        .querySelector(
            ".close-form"
        )
        .addEventListener(
            "click",
            () => form.remove()
        );


    form
        .querySelector(
            ".form-overlay"
        )
        .addEventListener(
            "click",
            () => form.remove()
        );


    form
        .querySelector(
            "#save-calendar-task"
        )
        .addEventListener(
            "click",
            () => {

                const title =
                    form
                        .querySelector(
                            "#calendar-task-title"
                        )
                        .value
                        .trim();


                const category =
                    form
                        .querySelector(
                            "#calendar-task-category"
                        )
                        .value;


                if (
                    !title
                ) {

                    alert(
                        "Напиши название задачи"
                    );

                    return;

                }


                tasks.push({

                    id:
                        Date.now()
                            .toString(),

                    title:
                        title,

                    category:
                        category,

                    repeat:
                        "once",

                    date:
                        dateString,

                    startDate:
                        dateString,

                    endDate:
                        dateString,

                    weekDays:
                        [],

                    completions:
                        {}

                });


                saveTasks();

                form.remove();

                renderTasks();

                renderCalendar();

            }
        );

}


// ========================================
// ========================================
// ДО → ПОСЛЕ
// ========================================
// ========================================


// ========================================
// РЕНДЕР СТРАНИЦЫ
// ========================================

function renderBeforeAfter() {

    const page =
        document.querySelector(
            "#before-after-page"
        );


    if (
        !page
    ) {

        return;

    }


    page.innerHTML = `

        <section class="before-after-section">

            <div class="page-heading">

                <p class="eyebrow">
                    МОЯ ТОЧКА А → ТОЧКА Б
                </p>

                <h1 class="page-title">
                    До → После
                </h1>

                <p class="page-description">
                    Зафиксируй себя в начале пути,
                    чтобы через 90 дней увидеть,
                    как много изменилось.
                </p>

            </div>


            <div class="before-after-content">

                ${renderPointA()}

                ${renderWheel()}

                ${renderPointB()}

            </div>

        </section>

    `;


    setupBeforeAfterEvents();

}


// ========================================
// ТОЧКА А
// ========================================

function renderPointA() {

    return `

        <section class="journey-card">

            <div class="journey-card-number">
                01
            </div>

            <div class="journey-card-heading">

                <p class="eyebrow">
                    НАЧАЛО ПУТИ
                </p>

                <h2>
                    Точка А
                </h2>

                <p>
                    Честно зафиксируй,
                    где ты находишься сейчас.
                </p>

            </div>


            <div class="reflection-fields">

                <div class="reflection-field">

                    <label>
                        Что меня сейчас не устраивает?
                    </label>

                    <textarea
                        id="point-a-not-satisfied"
                        placeholder="Напиши всё, что хочется изменить в своей жизни сейчас..."
                    >${escapeHTML(
                        beforeAfter.pointA.notSatisfied
                    )}</textarea>

                </div>


                <div class="reflection-field">

                    <label>
                        Что я хочу изменить?
                    </label>

                    <textarea
                        id="point-a-change"
                        placeholder="Какие изменения я хочу начать создавать?"
                    >${escapeHTML(
                        beforeAfter.pointA.change
                    )}</textarea>

                </div>


                <div class="reflection-field">

                    <label>
                        Что я хочу получить через 90 дней?
                    </label>

                    <textarea
                        id="point-a-receive"
                        placeholder="Какой я хочу увидеть свою жизнь в конце этого пути?"
                    >${escapeHTML(
                        beforeAfter.pointA.receive
                    )}</textarea>

                </div>

            </div>


            <button
                class="primary-button before-after-save"
                id="save-point-a"
            >
                Сохранить точку А
            </button>


            <div
                class="save-message"
                id="point-a-message"
            ></div>

        </section>

    `;

}


// ========================================
// КОЛЕСО БАЛАНСА
// ========================================

function renderWheel() {

    const categories =
        beforeAfter.wheelCategories;


    return `

        <section class="journey-card wheel-card">

            <div class="journey-card-number">
                02
            </div>

            <div class="journey-card-heading">

                <p class="eyebrow">
                    МОЯ ЖИЗНЬ СЕЙЧАС
                </p>

                <h2>
                    Колесо баланса
                </h2>

                <p>
                    Оцени каждую сферу своей жизни
                    от 1 до 10.
                </p>

            </div>


            <div
                class="wheel-list"
                id="wheel-list"
            >

                ${
                    categories
                        .map(
                            (category, index) =>
                                renderWheelCategory(
                                    category,
                                    index
                                )
                        )
                        .join("")
                }

            </div>


            <button
                class="secondary-action"
                id="add-wheel-category"
            >
                + Добавить сферу
            </button>


            <div class="wheel-summary">

                <div>
                    Средняя оценка
                </div>

                <strong
                    id="wheel-average"
                >
                    ${getWheelAverage()}
                </strong>

                <span>
                    из 10
                </span>

            </div>


            <button
                class="primary-button before-after-save"
                id="save-wheel"
            >
                Сохранить колесо баланса
            </button>


            <div
                class="save-message"
                id="wheel-message"
            ></div>

        </section>

    `;

}


// ========================================
// ОДНА СФЕРА КОЛЕСА
// ========================================

function renderWheelCategory(
    category,
    index
) {

    return `

        <div
            class="wheel-row"
            data-index="${index}"
        >

            <div class="wheel-row-top">

                <input
                    type="text"
                    class="wheel-category-name"
                    value="${escapeAttribute(
                        category.name
                    )}"
                    data-index="${index}"
                    aria-label="Название сферы"
                >

                <button
                    class="wheel-delete"
                    data-index="${index}"
                    aria-label="Удалить сферу"
                >
                    ×
                </button>

            </div>


            <div class="wheel-rating">

                <input
                    type="range"
                    min="1"
                    max="10"
                    value="${category.pointA}"
                    class="wheel-range"
                    data-index="${index}"
                >

                <span
                    class="wheel-rating-value"
                    data-index="${index}"
                >
                    ${category.pointA}
                </span>

            </div>


            <div class="wheel-scale">

                <span>1</span>
                <span>5</span>
                <span>10</span>

            </div>

        </div>

    `;

}


// ========================================
// СРЕДНЯЯ ОЦЕНКА
// ========================================

function getWheelAverage() {

    const categories =
        beforeAfter.wheelCategories;


    if (
        categories.length ===
        0
    ) {

        return "0.0";

    }


    const total =
        categories.reduce(
            (
                sum,
                category
            ) =>
                sum +
                Number(
                    category.pointA
                ),
            0
        );


    return (
        total /
        categories.length
    ).toFixed(1);

}


// ========================================
// ТОЧКА Б
// ========================================

function isPointBUnlocked() {

    return (
        getToday() >
        CHALLENGE_END
    );

}


function renderPointB() {

    const unlocked =
        isPointBUnlocked();


    if (
        !unlocked
    ) {

        return `

            <section
                class="journey-card point-b-card locked"
            >

                <div class="journey-card-number">
                    03
                </div>

                <div class="journey-card-heading">

                    <p class="eyebrow">
                        ФИНИШ 90 ДНЕЙ
                    </p>

                    <h2>
                        Точка Б
                    </h2>

                    <p>
                        Эта часть откроется после
                        завершения 90 дней.
                    </p>

                </div>


                <div class="point-b-lock">

                    <div class="point-b-lock-icon">
                        90
                    </div>

                    <div>
                        <strong>
                            Здесь появится твой результат
                        </strong>

                        <p>
                            Сначала проживи эти 90 дней,
                            а потом вернись сюда и сравни
                            себя с началом пути.
                        </p>
                    </div>

                </div>

            </section>

        `;

    }


    return `

        <section class="journey-card point-b-card">

            <div class="journey-card-number">
                03
            </div>

            <div class="journey-card-heading">

                <p class="eyebrow">
                    КОНЕЦ ПУТИ
                </p>

                <h2>
                    Точка Б
                </h2>

                <p>
                    Теперь оглянись назад и
                    зафиксируй, что изменилось.
                </p>

            </div>


            <div class="reflection-fields">

                <div class="reflection-field">

                    <label>
                        Что изменилось?
                    </label>

                    <textarea
                        id="point-b-changed"
                        placeholder="Что стало другим за эти 90 дней?"
                    >${escapeHTML(
                        beforeAfter.pointB.changed
                    )}</textarea>

                </div>


                <div class="reflection-field">

                    <label>
                        Что я изменила?
                    </label>

                    <textarea
                        id="point-b-changed-how"
                        placeholder="Какие действия и решения привели к изменениям?"
                    >${escapeHTML(
                        beforeAfter.pointB.changedHow
                    )}</textarea>

                </div>


                <div class="reflection-field">

                    <label>
                        Что я получила?
                    </label>

                    <textarea
                        id="point-b-received"
                        placeholder="Что появилось в моей жизни благодаря этим 90 дням?"
                    >${escapeHTML(
                        beforeAfter.pointB.received
                    )}</textarea>

                </div>

            </div>


            <div class="point-b-wheel">

                <p class="eyebrow">
                    КОЛЕСО БАЛАНСА
                </p>

                <h3>
                    Как изменились мои оценки?
                </h3>

                <div class="comparison-list">

                    ${
                        beforeAfter
                            .wheelCategories
                            .map(
                                category => `

                                    <div
                                        class="comparison-row"
                                    >

                                        <div>
                                            ${escapeHTML(
                                                category.name
                                            )}
                                        </div>

                                        <span>
                                            ${category.pointA}
                                        </span>

                                        <b>
                                            →
                                        </b>

                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value="${category.pointB}"
                                            class="point-b-range"
                                            data-name="${escapeAttribute(
                                                category.name
                                            )}"
                                        >

                                        <strong
                                            class="point-b-value"
                                        >
                                            ${category.pointB}
                                        </strong>

                                    </div>

                                `
                            )
                            .join("")
                    }

                </div>

            </div>


            <button
                class="primary-button before-after-save"
                id="save-point-b"
            >
                Сохранить точку Б
            </button>


            <div
                class="save-message"
                id="point-b-message"
            ></div>

        </section>

    `;

}


// ========================================
// НАСТРОЙКИ СОБЫТИЙ «ДО → ПОСЛЕ»
// ========================================

function setupBeforeAfterEvents() {


    // ------------------------------------
    // Точка А
    // ------------------------------------

    const pointANotSatisfied =
        document.querySelector(
            "#point-a-not-satisfied"
        );


    const pointAChange =
        document.querySelector(
            "#point-a-change"
        );


    const pointAReceive =
        document.querySelector(
            "#point-a-receive"
        );


    if (
        pointANotSatisfied
    ) {

        pointANotSatisfied.addEventListener(
            "input",
            () => {

                beforeAfter.pointA.notSatisfied =
                    pointANotSatisfied.value;

                saveBeforeAfter();

            }
        );

    }


    if (
        pointAChange
    ) {

        pointAChange.addEventListener(
            "input",
            () => {

                beforeAfter.pointA.change =
                    pointAChange.value;

                saveBeforeAfter();

            }
        );

    }


    if (
        pointAReceive
    ) {

        pointAReceive.addEventListener(
            "input",
            () => {

                beforeAfter.pointA.receive =
                    pointAReceive.value;

                saveBeforeAfter();

            }
        );

    }


    const savePointA =
        document.querySelector(
            "#save-point-a"
        );


    if (
        savePointA
    ) {

        savePointA.addEventListener(
            "click",
            () => {

                saveBeforeAfter();

                showSaveMessage(
                    "#point-a-message",
                    "Точка А сохранена"
                );

            }
        );

    }


    // ------------------------------------
    // Колесо
    // ------------------------------------

    document
        .querySelectorAll(
            ".wheel-category-name"
        )
        .forEach(
            input => {

                input.addEventListener(
                    "input",
                    () => {

                        const index =
                            Number(
                                input.dataset.index
                            );


                        beforeAfter
                            .wheelCategories[
                                index
                            ]
                            .name =
                            input.value;


                        saveBeforeAfter();

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".wheel-range"
        )
        .forEach(
            range => {

                range.addEventListener(
                    "input",
                    () => {

                        const index =
                            Number(
                                range.dataset.index
                            );


                        const value =
                            Number(
                                range.value
                            );


                        beforeAfter
                            .wheelCategories[
                                index
                            ]
                            .pointA =
                            value;


                        const valueElement =
                            document.querySelector(
                                `.wheel-rating-value[data-index="${index}"]`
                            );


                        if (
                            valueElement
                        ) {

                            valueElement.textContent =
                                value;

                        }


                        const average =
                            document.querySelector(
                                "#wheel-average"
                            );


                        if (
                            average
                        ) {

                            average.textContent =
                                getWheelAverage();

                        }


                        saveBeforeAfter();

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".wheel-delete"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                button.dataset.index
                            );


                        if (
                            beforeAfter
                                .wheelCategories
                                .length <= 1
                        ) {

                            alert(
                                "Оставь хотя бы одну сферу."
                            );

                            return;

                        }


                        beforeAfter
                            .wheelCategories
                            .splice(
                                index,
                                1
                            );


                        saveBeforeAfter();

                        renderBeforeAfter();

                    }
                );

            }
        );


    const addWheelCategory =
        document.querySelector(
            "#add-wheel-category"
        );


    if (
        addWheelCategory
    ) {

        addWheelCategory.addEventListener(
            "click",
            () => {

                beforeAfter
                    .wheelCategories
                    .push({

                        name:
                            "Новая сфера",

                        pointA:
                            5,

                        pointB:
                            5

                    });


                saveBeforeAfter();

                renderBeforeAfter();


                const inputs =
                    document.querySelectorAll(
                        ".wheel-category-name"
                    );


                const last =
                    inputs[
                        inputs.length - 1
                    ];


                if (
                    last
                ) {

                    last.focus();

                    last.select();

                }

            }
        );

    }


    const saveWheel =
        document.querySelector(
            "#save-wheel"
        );


    if (
        saveWheel
    ) {

        saveWheel.addEventListener(
            "click",
            () => {

                saveBeforeAfter();

                showSaveMessage(
                    "#wheel-message",
                    "Колесо баланса сохранено"
                );

            }
        );

    }


    // ------------------------------------
    // Точка Б
    // ------------------------------------

    const pointBChanged =
        document.querySelector(
            "#point-b-changed"
        );


    const pointBChangedHow =
        document.querySelector(
            "#point-b-changed-how"
        );


    const pointBReceived =
        document.querySelector(
            "#point-b-received"
        );


    if (
        pointBChanged
    ) {

        pointBChanged.addEventListener(
            "input",
            () => {

                beforeAfter.pointB.changed =
                    pointBChanged.value;

                saveBeforeAfter();

            }
        );

    }


    if (
        pointBChangedHow
    ) {

        pointBChangedHow.addEventListener(
            "input",
            () => {

                beforeAfter.pointB.changedHow =
                    pointBChangedHow.value;

                saveBeforeAfter();

            }
        );

    }


    if (
        pointBReceived
    ) {

        pointBReceived.addEventListener(
            "input",
            () => {

                beforeAfter.pointB.received =
                    pointBReceived.value;

                saveBeforeAfter();

            }
        );

    }


    document
        .querySelectorAll(
            ".point-b-range"
        )
        .forEach(
            range => {

                range.addEventListener(
                    "input",
                    () => {

                        const name =
                            range.dataset.name;


                        const category =
                            beforeAfter
                                .wheelCategories
                                .find(
                                    item =>
                                        item.name ===
                                        name
                                );


                        if (
                            !category
                        ) {

                            return;

                        }


                        category.pointB =
                            Number(
                                range.value
                            );


                        const row =
                            range.closest(
                                ".comparison-row"
                            );


                        if (
                            row
                        ) {

                            const value =
                                row.querySelector(
                                    ".point-b-value"
                                );


                            if (
                                value
                            ) {

                                value.textContent =
                                    range.value;

                            }

                        }


                        saveBeforeAfter();

                    }
                );

            }
        );


    const savePointB =
        document.querySelector(
            "#save-point-b"
        );


    if (
        savePointB
    ) {

        savePointB.addEventListener(
            "click",
            () => {

                saveBeforeAfter();

                showSaveMessage(
                    "#point-b-message",
                    "Точка Б сохранена"
                );

            }
        );

    }

}


// ========================================
// СООБЩЕНИЕ О СОХРАНЕНИИ
// ========================================

function showSaveMessage(
    selector,
    message
) {

    const element =
        document.querySelector(
            selector
        );


    if (
        !element
    ) {

        return;

    }


    element.textContent =
        message;


    element.classList.add(
        "visible"
    );


    setTimeout(
        () => {

            element.classList.remove(
                "visible"
            );

        },
        2500
    );

}


// ========================================
// HTML ESCAPE
// ========================================

function escapeHTML(
    value
) {

    return String(
        value || ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}


// ========================================
// ПЕРВАЯ БУКВА
// ========================================

function capitalizeFirst(
    value
) {

    if (
        !value
    ) {

        return "";

    }


    return (
        value.charAt(0)
            .toUpperCase() +
        value.slice(1)
    );

}


// ========================================
// КНОПКИ ДНЕЙ НЕДЕЛИ
// ========================================

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".weekday-button"
            );


        if (
            !button
        ) {

            return;

        }


        button.classList.toggle(
            "active"
        );

    }
);
