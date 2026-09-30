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
// СФЕРЫ
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


// Какая дата сейчас открыта в календаре
let selectedCalendarDate = null;


// ========================================
// СОХРАНЕНИЕ
// ========================================

function saveTasks() {

    localStorage.setItem(
        "90days_tasks",
        JSON.stringify(tasks)
    );

}


// ========================================
// ТЕКУЩАЯ ДАТА
// ========================================

function getToday() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


// ========================================
// DATE
// ========================================

function getDateObject(dateString) {

    return new Date(
        dateString + "T00:00:00"
    );

}


// ========================================
// ДЕНЬ НЕДЕЛИ
// ========================================

function getWeekDay(dateString) {

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
        date.getDate() + amount
    );

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

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
// ПРОГРЕСС 90 ДНЕЙ
// ========================================

function getChallengeProgress() {

    const day =
        getChallengeDay();

    if (day < 1) {
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
// КОРОТКАЯ ДАТА
// ========================================

function formatShortDate(
    dateString
) {

    const date =
        getDateObject(
            dateString
        );

    return date
        .toLocaleDateString(
            "ru-RU",
            {
                day: "numeric",
                month: "short"
            }
        )
        .replace(".", "");

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
// ПРОВЕРКА ПЕРИОДА
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

    // Одноразовая задача

    if (
        !task.repeat ||
        task.repeat === "once"
    ) {

        return (
            task.date ===
            dateString
        );

    }


    // Проверяем период

    if (
        !isDateInsideTaskPeriod(
            task,
            dateString
        )
    ) {

        return false;

    }


    // Каждый день

    if (
        task.repeat ===
        "daily"
    ) {

        return true;

    }


    // Выбранные дни

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


    // Совместимость со старыми задачами

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
// ЭКРАН ЗАПУСКА
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateChallengeInfo();

        renderTasks();

        setupFirstTaskButton();

        setupNavigation();

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

    if (dayElement) {

        if (day < 1) {

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

    if (progressText) {

        progressText.textContent =
            `${progress}%`;

    }


    const progressFill =
        document.querySelector(
            "#challenge-progress-fill"
        );

    if (progressFill) {

        progressFill.style.width =
            `${progress}%`;

    }


    const dateElement =
        document.querySelector(
            "#today-date"
        );

    if (dateElement) {

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

                    if (!pageId) {
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

    if (page) {

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

    if (oldForm) {
        oldForm.remove();
    }


    const isEditing =
        Boolean(taskToEdit);


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

            <div id="period-container">

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


    const closeButton =
        form.querySelector(
            ".close-form"
        );

    const overlay =
        form.querySelector(
            ".form-overlay"
        );


    closeButton.addEventListener(
        "click",
        () => form.remove()
    );

    overlay.addEventListener(
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

        if (
            periodSelect.value ===
            "until-date"
        ) {

            periodDate.style.display =
                "block";

        } else {

            periodDate.style.display =
                "none";

        }


        if (
            repeatSelect.value ===
            "weekly"
        ) {

            weekdaysContainer.style.display =
                "block";

        } else {

            weekdaysContainer.style.display =
                "none";

        }

    }


    repeatSelect.addEventListener(
        "change",
        updateFormVisibility
    );

    periodSelect.addEventListener(
        "change",
        updateFormVisibility
    );


    const saveButton =
        form.querySelector(
            "#save-task-button"
        );


    saveButton.addEventListener(
        "click",
        () => {

            const title =
                form.querySelector(
                    "#task-title"
                ).value.trim();

            const category =
                form.querySelector(
                    "#task-category"
                ).value;

            const repeat =
                repeatSelect.value;

            const period =
                periodSelect.value;

            const endDate =
                period === "until-date"
                    ? periodDate.value
                    : CHALLENGE_END;


            if (!title) {

                alert(
                    "Напиши название задачи"
                );

                return;

            }


            if (
                period === "until-date" &&
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
                    weekDays.length === 0
                ) {

                    alert(
                        "Выбери хотя бы один день недели"
                    );

                    return;

                }

            }


            if (isEditing) {

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

                const newTask = {

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

                };


                tasks.push(
                    newTask
                );

            }


            saveTasks();

            form.remove();

            renderTasks();

            renderCalendar();

        }
    );


    if (isEditing) {

        const deleteButton =
            form.querySelector(
                "#delete-task-button"
            );

        deleteButton.addEventListener(
            "click",
            () => {

                const confirmed =
                    confirm(
                        "Удалить эту задачу?"
                    );

                if (!confirmed) {
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
// КНОПКИ ДНЕЙ НЕДЕЛИ
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
// РЕНДЕР ЗАДАЧ СЕГОДНЯ
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


    if (!container) {
        return;
    }


    const today =
        getToday();

    const todayTasks =
        getTasksForDate(
            today
        );


    container.innerHTML = "";


    if (
        todayTasks.length === 0
    ) {

        container.style.display =
            "none";

        if (emptyState) {

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

    if (emptyState) {

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


                    const taskElement =
                        document.createElement(
                            "div"
                        );

                    taskElement.className =
                        `task ${
                            completed
                                ? "completed"
                                : ""
                        }`;


                    taskElement.innerHTML = `

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


                    const checkButton =
                        taskElement.querySelector(
                            ".task-check"
                        );

                    const editButton =
                        taskElement.querySelector(
                            ".task-edit"
                        );


                    checkButton.addEventListener(
                        "click",
                        () => {

                            toggleTask(
                                task.id,
                                today
                            );

                        }
                    );


                    editButton.addEventListener(
                        "click",
                        () => {

                            openTaskForm(
                                task
                            );

                        }
                    );


                    list.appendChild(
                        taskElement
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


    if (text) {

        text.textContent =
            `${completed} из ${total}`;

    }


    if (fill) {

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


    if (!task) {
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


    // Обновляем Сегодня

    renderTasks();


    // Обновляем календарь

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

    if (!button) {
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


// ========================================
// РЕНДЕР КАЛЕНДАРЯ
// ========================================

function renderCalendar() {

    const container =
        document.querySelector(
            "#challenge-calendar"
        );

    if (!container) {
        return;
    }


    container.innerHTML = "";


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


    let currentDate =
        CHALLENGE_START;


    for (
        let i = 0;
        i < CHALLENGE_LENGTH;
        i++
    ) {

        const dateString =
            addDays(
                currentDate,
                i
            );


        const dayElement =
            createCalendarDay(
                dateString
            );


        grid.appendChild(
            dayElement
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


    if (
        selectedCalendarDate <
        CHALLENGE_START ||
        selectedCalendarDate >
        CHALLENGE_END
    ) {

        selectedCalendarDate =
            getInitialCalendarDate();

    }


    renderSelectedDay(
        selectedCalendarDate
    );

}


// ========================================
// СОЗДАТЬ ДЕНЬ КАЛЕНДАРЯ
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


    const dayNumber =
        getChallengeDay(
            dateString
        );


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
            ${dayNumber}
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


    document
        .querySelectorAll(
            ".calendar-day"
        )
        .forEach(
            day => {

                day.classList.remove(
                    "selected"
                );

            }
        );


    renderSelectedDay(
        dateString
    );


    const selected =
        Array.from(
            document.querySelectorAll(
                ".calendar-day"
            )
        ).find(
            day =>
                day.querySelector(
                    ".calendar-day-number"
                ) &&
                getDayFromCalendarElement(
                    day
                ) ===
                dateString
        );


    if (selected) {

        selected.classList.add(
            "selected"
        );

    }

}


// ========================================
// ПОЛУЧИТЬ ДАТУ ИЗ КНОПКИ
// ========================================

function getDayFromCalendarElement(
    element
) {

    const number =
        element.querySelector(
            ".calendar-day-number"
        );

    if (!number) {
        return null;
    }


    const allDays =
        document.querySelectorAll(
            ".calendar-day"
        );


    const index =
        Array.from(
            allDays
        ).indexOf(
            element
        );


    if (
        index < 0 ||
        index >= CHALLENGE_LENGTH
    ) {

        return null;

    }


    return addDays(
        CHALLENGE_START,
        index
    );

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

    if (!container) {
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


    const challengeDay =
        getChallengeDay(
            dateString
        );


    const weekDay =
        formatWeekDay(
            dateString
        );


    let tasksHTML = "";


    if (
        dayTasks.length === 0
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

                        const isCompleted =
                            isTaskCompleted(
                                task,
                                dateString
                            );


                        return `

                            <button
                                class="
                                    calendar-task
                                    ${
                                        isCompleted
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
                    ДЕНЬ ${challengeDay}
                </div>

                <div class="selected-day-title">
                    ${formatDate(
                        dateString
                    )}
                </div>

                <div class="selected-day-week">
                    ${capitalizeFirst(
                        weekDay
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


    // Отметить задачу

    container
        .querySelectorAll(
            ".calendar-task"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const taskId =
                            button.dataset.taskId;

                        const date =
                            button.dataset.date;


                        toggleCalendarTask(
                            taskId,
                            date
                        );

                    }
                );

            }
        );


    // Добавить задачу

    const addButton =
        container.querySelector(
            "#calendar-add-task-button"
        );


    if (addButton) {

        addButton.addEventListener(
            "click",
            () => {

                openCalendarTaskForm(
                    dateString
                );

            }
        );

    }

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


    if (!task) {
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


    // Обновляем календарь

    renderCalendar();


    // Если это сегодня —
    // обновляем и Сегодня

    if (
        dateString ===
        getToday()
    ) {

        renderTasks();

    }

}


// ========================================
// ДОБАВИТЬ ЗАДАЧУ НА КОНКРЕТНЫЙ ДЕНЬ
// ========================================

function openCalendarTaskForm(
    dateString
) {

    const oldForm =
        document.querySelector(
            ".task-form"
        );

    if (oldForm) {
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
                aria-label="Закрыть"
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

            <label for="calendar-task-title">
                Задача
            </label>

            <input
                type="text"
                id="calendar-task-title"
                placeholder="Например: написать пост"
                autocomplete="off"
            >

            <label for="calendar-task-category">
                Сфера
            </label>

            <select
                id="calendar-task-category"
            >

                ${CATEGORIES
                    .map(
                        category => `

                            <option
                                value="${category}"
                            >
                                ${category}
                            </option>

                        `
                    )
                    .join("")}

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


                if (!title) {

                    alert(
                        "Напиши название задачи"
                    );

                    return;

                }


                const newTask = {

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

                };


                tasks.push(
                    newTask
                );


                saveTasks();

                form.remove();

                renderTasks();

                renderCalendar();

            }
        );

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(
    value
) {

    return String(
        value
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


// ========================================
// ESCAPE ATTRIBUTE
// ========================================

function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}


// ========================================
// ПЕРВАЯ БУКВА ЗАГЛАВНАЯ
// ========================================

function capitalizeFirst(
    value
) {

    if (!value) {
        return "";
    }

    return (
        value.charAt(0)
        .toUpperCase() +
        value.slice(1)
    );

}


// ========================================
// ОБРАБОТКА КНОПОК ДНЕЙ НЕДЕЛИ
// ========================================

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".weekday-button"
            );

        if (!button) {
            return;
        }


        button.classList.toggle(
            "active"
        );

    }
);
