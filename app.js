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
        localStorage.getItem(
            "90days_tasks"
        )
    ) || [];


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
// ДОБАВИТЬ ДНИ К ДАТЕ
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

function getChallengeDay() {

    const start =
        getDateObject(
            CHALLENGE_START
        );

    const today =
        getDateObject(
            getToday()
        );

    const difference =
        today -
        start;

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
// КОРОТКАЯ ДАТА
// ========================================

function formatShortDate(
    dateString
) {

    const date =
        getDateObject(
            dateString
        );

    return date.toLocaleDateString(
        "ru-RU",
        {
            day: "numeric",
            month: "short"
        }
    )
        .replace(
            ".",
            ""
        );

}


// ========================================
// НАЗВАНИЕ ДНЯ НЕДЕЛИ
// ========================================

function formatWeekDay(
    dateString
) {

    const date =
        getDateObject(
            dateString
        );

    return date.toLocaleDateString(
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

    // Одноразовая

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


    // Период

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

        return (
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

        <div
            class="form-overlay"
        ></div>


        <div
            class="form-window"
        >


            <button
                class="close-form"
                aria-label="Закрыть"
            >
                ×
            </button>


            <p
                class="eyebrow"
            >

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


            <label
                for="task-title"
            >
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


            <label
                for="task-category"
            >
                Сфера
            </label>


            <select
                id="task-category"
            >

                ${CATEGORIES
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
                    .join("")}

            </select>


            <label
                for="task-repeat"
            >
                Повторение
            </label>


            <select
                id="task-repeat"
            >

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


            <div
                id="period-container"
            >

                <label
                    for="task-period"
                >
                    Период
                </label>


                <select
                    id="task-period"
                >

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


                <div
                    class="weekday-options"
                >

                    <label>
                        <input
                            type="checkbox"
                            value="1"
                            ${
                                isEditing &&
                                taskToEdit.weekDays &&
                                taskToEdit.weekDays.includes(1)
                                    ? "checked"
                                    : ""
                            }
                        >
                        Пн
                    </label>


                    <label>
                        <input
                            type="checkbox"
                            value="2"
                            ${
                                isEditing &&
                                taskToEdit.weekDays &&
                                taskToEdit.weekDays.includes(2)
                                    ? "checked"
                                    : ""
                            }
                        >
                        Вт
                    </label>


                    <label>
                        <input
                            type="checkbox"
                            value="3"
                            ${
                                isEditing &&
                                taskToEdit.weekDays &&
                                taskToEdit.weekDays.includes(3)
                                    ? "checked"
                                    : ""
                            }
                        >
                        Ср
                    </label>


                    <label>
                        <input
                            type="checkbox"
                            value="4"
                            ${
                                isEditing &&
                                taskToEdit.weekDays &&
                                taskToEdit.weekDays.includes(4)
                                    ? "checked"
                                    : ""
                            }
                        >
                        Чт
                    </label>


                    <label>
                        <input
                            type="checkbox"
                            value="5"
                            ${
                                isEditing &&
                                taskToEdit.weekDays &&
                                taskToEdit.weekDays.includes(5)
                                    ? "checked"
                                    : ""
                            }
                        >
                        Пт
                    </label>


                    <label>
                        <input
                            type="checkbox"
                            value="6"
                            ${
                                isEditing &&
                                taskToEdit.weekDays &&
                                taskToEdit.weekDays.includes(6)
                                    ? "checked"
                                    : ""
                            }
                        >
                        Сб
                    </label>


                    <label>
                        <input
                            type="checkbox"
                            value="0"
                            ${
                                isEditing &&
                                taskToEdit.weekDays &&
                                taskToEdit.weekDays.includes(0)
                                    ? "checked"
                                    : ""
                            }
                        >
                        Вс
                    </label>

                </div>

            </div>


            <div
                class="form-actions"
            >

                <button
                    class="secondary-button"
                    id="cancel-task"
                >
                    Отмена
                </button>


                <button
                    class="primary-button"
                    id="save-task"
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


    const repeatSelect =
        form.querySelector(
            "#task-repeat"
        );


    const periodSelect =
        form.querySelector(
            "#task-period"
        );


    const endDateInput =
        form.querySelector(
            "#task-end-date"
        );


    const weekdaysContainer =
        form.querySelector(
            "#weekdays-container"
        );


    function updateRepeatFields() {

        const repeat =
            repeatSelect.value;


        if (
            weekdaysContainer
        ) {

            weekdaysContainer.style.display =
                repeat === "weekly"
                    ? "block"
                    : "none";

        }

    }


    function updatePeriodFields() {

        if (
            !periodSelect ||
            !endDateInput
        ) {

            return;

        }


        endDateInput.style.display =
            periodSelect.value ===
            "until-date"
                ? "block"
                : "none";

    }


    repeatSelect.addEventListener(
        "change",
        updateRepeatFields
    );


    periodSelect.addEventListener(
        "change",
        updatePeriodFields
    );


    updateRepeatFields();

    updatePeriodFields();


    form.querySelector(
        ".close-form"
    ).addEventListener(
        "click",
        () => form.remove()
    );


    form.querySelector(
        "#cancel-task"
    ).addEventListener(
        "click",
        () => form.remove()
    );


    form.querySelector(
        ".form-overlay"
    ).addEventListener(
        "click",
        () => form.remove()
    );
form.querySelector(
    ".form-overlay"
).addEventListener(
    "click",
    () => form.remove()
);
        form.querySelector(
        "#save-task"
    ).addEventListener(
        "click",
        () => {

            const titleInput =
                form.querySelector(
                    "#task-title"
                );


            const title =
                titleInput.value.trim();


            if (
                !title
            ) {

                titleInput.focus();

                return;

            }


            const category =
                form.querySelector(
                    "#task-category"
                ).value;


            const repeat =
                form.querySelector(
                    "#task-repeat"
                ).value;


            const today =
                getToday();


            let startDate =
                isEditing
                    ? (
                        taskToEdit.startDate ||
                        taskToEdit.date ||
                        today
                    )
                    : today;


            let endDate =
                CHALLENGE_END;


            if (
                periodSelect.value ===
                "until-date"
            ) {

                endDate =
                    endDateInput.value ||
                    CHALLENGE_END;

            }


            let weekDays =
                [];


            if (
                repeat ===
                "weekly"
            ) {

                weekDays =
                    Array.from(
                        form.querySelectorAll(
                            "#weekdays-container input[type='checkbox']:checked"
                        )
                    )
                    .map(
                        input =>
                            Number(
                                input.value
                            )
                    );

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

                taskToEdit.startDate =
                    startDate;

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

                tasks.push({

                    id:
                        Date.now(),

                    title:

                        title,

                    category:

                        category,

                    repeat:

                        repeat,

                    date:

                        today,

                    startDate:

                        startDate,

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

}


// ========================================
// ЭКРАН СЕГОДНЯ
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
        emptyState
    ) {

        emptyState.style.display =
            todayTasks.length
                ? "none"
                : "block";

    }


    const grouped =
        {};


    CATEGORIES.forEach(
        category => {

            grouped[
                category
            ] = [];

        }
    );


    todayTasks.forEach(
        task => {

            if (
                !grouped[
                    task.category
                ]
            ) {

                grouped[
                    task.category
                ] = [];

            }


            grouped[
                task.category
            ].push(
                task
            );

        }
    );


    CATEGORIES.forEach(
        category => {

            const categoryTasks =
                grouped[
                    category
                ];


            if (
                !categoryTasks.length
            ) {

                return;

            }


            const group =
                document.createElement(
                    "section"
                );


            group.className =
                "task-group";


            const heading =
                document.createElement(
                    "div"
                );


            heading.className =
                "task-group-heading";


            heading.innerHTML = `

                <span>
                    ${category}
                </span>

                <span>
                    ${categoryTasks.filter(
                        task =>
                            isTaskCompleted(
                                task,
                                today
                            )
                    ).length}
                    /
                    ${categoryTasks.length}
                </span>

            `;


            group.appendChild(
                heading
            );


            categoryTasks.forEach(
                task => {

                    const taskElement =
                        createTaskElement(
                            task,
                            today
                        );


                    group.appendChild(
                        taskElement
                    );

                }
            );


            container.appendChild(
                group
            );

        }
    );


    const addButton =
        document.createElement(
            "button"
        );


    addButton.className =
        "add-task-button";


    addButton.type =
        "button";


    addButton.textContent =
        "+ Добавить задачу";


    addButton.addEventListener(
        "click",
        () => {

            openTaskForm();

        }
    );


    container.appendChild(
        addButton
    );


    updateTodayProgress(
        todayTasks,
        today
    );

}


// ========================================
// СОЗДАНИЕ ЗАДАЧИ НА ЭКРАНЕ
// ========================================

function createTaskElement(
    task,
    dateString
) {

    const completed =
        isTaskCompleted(
            task,
            dateString
        );


    const element =
        document.createElement(
            "div"
        );


    element.className =
        "task-item";


    if (
        completed
    ) {

        element.classList.add(
            "completed"
        );

    }


    element.innerHTML = `

        <button
            class="task-check"
            type="button"
            aria-label="${
                completed
                    ? "Отметить как невыполненную"
                    : "Отметить как выполненную"
            }"
        >
            <span></span>
        </button>


        <div
            class="task-content"
        >

            <div
                class="task-title"
            >
                ${escapeHtml(
                    task.title
                )}
            </div>


            ${
                task.repeat &&
                task.repeat !== "once"
                    ? `
                        <div
                            class="task-meta"
                        >
                            ${
                                task.repeat ===
                                "daily"
                                    ? "Каждый день"
                                    : "По выбранным дням"
                            }
                        </div>
                    `
                    : ""
            }

        </div>


        <div
            class="task-actions"
        >

            <button
                class="edit-task"
                type="button"
                aria-label="Редактировать"
            >
                ✎
            </button>


            <button
                class="delete-task"
                type="button"
                aria-label="Удалить"
            >
                ×
            </button>

        </div>

    `;


    const checkButton =
        element.querySelector(
            ".task-check"
        );


    checkButton.addEventListener(
        "click",
        () => {

            toggleTask(
                task.id,
                dateString
            );

        }
    );


    const editButton =
        element.querySelector(
            ".edit-task"
        );


    editButton.addEventListener(
        "click",
        () => {

            openTaskForm(
                task
            );

        }
    );


    const deleteButton =
        element.querySelector(
            ".delete-task"
        );


    deleteButton.addEventListener(
        "click",
        () => {

            deleteTask(
                task.id
            );

        }
    );


    return element;

}


// ========================================
// ПРОГРЕСС СЕГОДНЯ
// ========================================

function updateTodayProgress(
    todayTasks,
    dateString
) {

    const total =
        todayTasks.length;


    const completed =
        todayTasks.filter(
            task =>
                isTaskCompleted(
                    task,
                    dateString
                )
        ).length;


    const progress =
        total
            ? Math.round(
                (
                    completed /
                    total
                ) * 100
            )
            : 0;


    const progressText =
        document.querySelector(
            "#today-progress"
        );


    if (
        progressText
    ) {

        progressText.textContent =
            `${completed} из ${total}`;

    }


    const progressFill =
        document.querySelector(
            "#today-progress-fill"
        );


    if (
        progressFill
    ) {

        progressFill.style.width =
            `${progress}%`;

    }

}


// ========================================
// ОТМЕТИТЬ ЗАДАЧУ
// ========================================

function toggleTask(
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

    renderTasks();

    renderCalendar();

}


// ========================================
// УДАЛИТЬ ЗАДАЧУ
// ========================================

function deleteTask(
    taskId
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


    const confirmed =
        confirm(
            `Удалить задачу «${task.title}»?`
        );


    if (
        !confirmed
    ) {

        return;

    }


    tasks =
        tasks.filter(
            item =>
                item.id !==
                taskId
        );


    saveTasks();

    renderTasks();

    renderCalendar();

}


// ========================================
// ПЕРВАЯ ЗАДАЧА
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

let currentCalendarDate =
    new Date(
        CHALLENGE_START +
        "T00:00:00"
    );


let selectedCalendarDate =
    getToday();


// ========================================
// РЕНДЕР КАЛЕНДАРЯ
// ========================================

function renderCalendar() {

    const calendar =
        document.querySelector(
            "#challenge-calendar"
        );


    if (
        !calendar
    ) {

        return;

    }


    calendar.innerHTML =
        "";


    const year =
        currentCalendarDate.getFullYear();


    const month =
        currentCalendarDate.getMonth();


    const monthName =
        currentCalendarDate.toLocaleDateString(
            "ru-RU",
            {
                month: "long",
                year: "numeric"
            }
        );


    const monthHeader =
        document.createElement(
            "div"
        );


    monthHeader.className =
        "calendar-month";


    monthHeader.innerHTML = `

        <button
            type="button"
            class="calendar-arrow"
            id="calendar-prev"
        >
            ‹
        </button>


        <div
            class="calendar-month-title"
        >
            ${monthName}
        </div>


        <button
            type="button"
            class="calendar-arrow"
            id="calendar-next"
        >
            ›
        </button>

    `;


    calendar.appendChild(
        monthHeader
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
        day => {

            const element =
                document.createElement(
                    "div"
                );


            element.textContent =
                day;


            weekdays.appendChild(
                element
            );

        }
    );


    calendar.appendChild(
        weekdays
    );


    const grid =
        document.createElement(
            "div"
        );


    grid.className =
        "calendar-grid";


    const firstDay =
        new Date(
            year,
            month,
            1
        );


    let startDay =
        firstDay.getDay();


    // Делаем понедельник первым днём

    if (
        startDay ===
        0
    ) {

        startDay =
            7;

    }


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    // Пустые клетки перед первым числом

    for (
        let i = 1;
        i < startDay;
        i++
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "calendar-day empty";


        grid.appendChild(
            empty
        );

    }


    // Дни месяца

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const dateString =
            `${year}-${String(
                month + 1
            ).padStart(
                2,
                "0"
            )}-${String(
                day
            ).padStart(
                2,
                "0"
            )}`;


        const dayElement =
            document.createElement(
                "button"
            );


        dayElement.type =
            "button";


        dayElement.className =
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
            ).length;


        if (
            dayTasks.length &&
            completedTasks ===
            dayTasks.length
        ) {

            dayElement.classList.add(
                "status-complete"
            );

        } else if (
            completedTasks > 0
        ) {

            dayElement.classList.add(
                "status-partial"
            );

        }


        if (
            dateString ===
            getToday()
        ) {

            dayElement.classList.add(
                "today"
            );

        }


        if (
            dateString ===
            selectedCalendarDate
        ) {

            dayElement.classList.add(
                "selected-day"
            );

        }


        dayElement.innerHTML = `

            <span
                class="calendar-day-number"
            >
                ${day}
            </span>


            ${
                dayTasks.length
                    ? `
                        <span
                            class="calendar-day-count"
                        >
                            ${completedTasks}/${dayTasks.length}
                        </span>
                    `
                    : ""
            }

        `;


        dayElement.addEventListener(
            "click",
            () => {

                selectedCalendarDate =
                    dateString;


                renderCalendar();

                renderSelectedDay();

            }
        );


        grid.appendChild(
            dayElement
        );

    }


    calendar.appendChild(
        grid
    );


    const previousButton =
        calendar.querySelector(
            "#calendar-prev"
        );


    const nextButton =
        calendar.querySelector(
            "#calendar-next"
        );


    previousButton.addEventListener(
        "click",
        () => {

            currentCalendarDate =
                new Date(
                    year,
                    month - 1,
                    1
                );


            renderCalendar();

        }
    );


    nextButton.addEventListener(
        "click",
        () => {

            currentCalendarDate =
                new Date(
                    year,
                    month + 1,
                    1
                );


            renderCalendar();

        }
    );


    renderSelectedDay();

}


// ========================================
// ВЫБРАННЫЙ ДЕНЬ
// ========================================

function renderSelectedDay() {

    const container =
        document.querySelector(
            "#selected-day"
        );


    if (
        !container
    ) {

        return;

    }


    const dateString =
        selectedCalendarDate;


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


    container.innerHTML = `

        <div
            class="selected-day-header"
        >

            <div>

                <div
                    class="selected-day-label"
                >
                    ${formatWeekDay(
                        dateString
                    )}
                </div>


                <div
                    class="selected-day-title"
                >
                    ${formatDate(
                        dateString
                    )}
                </div>

            </div>


            <div
                class="selected-day-count"
            >
                ${completed}/${dayTasks.length}
            </div>

        </div>


        <div
            class="selected-day-tasks"
        ></div>

    `;


    const taskContainer =
        container.querySelector(
            ".selected-day-tasks"
        );


    if (
        !dayTasks.length
    ) {

        taskContainer.innerHTML = `

            <div
                class="calendar-empty"
            >
                На этот день задач пока нет.
            </div>

        `;


        const addButton =
            document.createElement(
                "button"
            );


        addButton.type =
            "button";


        addButton.className =
            "calendar-add-task";


        addButton.textContent =
            "+ Добавить задачу";


        addButton.addEventListener(
            "click",
            () => {

                openTaskForm();

            }
        );


        taskContainer.appendChild(
            addButton
        );


        return;

    }


    dayTasks.forEach(
        task => {

            const completed =
                isTaskCompleted(
                    task,
                    dateString
                );


            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "calendar-task";


            if (
                completed
            ) {

                button.classList.add(
                    "completed"
                );

            }


            button.innerHTML = `

                <span
                    class="calendar-task-dot"
                ></span>


                <span
                    class="calendar-task-title"
                >
                    ${escapeHtml(
                        task.title
                    )}
                </span>


                <span
                    class="calendar-task-hint"
                >
                    нажми, чтобы отметить
                </span>

            `;


            button.addEventListener(
                "click",
                () => {

                    toggleTask(
                        task.id,
                        dateString
                    );

                }
            );


            taskContainer.appendChild(
                button
            );

        }
    );


    const addButton =
        document.createElement(
            "button"
        );


    addButton.type =
        "button";


    addButton.className =
        "calendar-add-task";


    addButton.textContent =
        "+ Добавить задачу";


    addButton.addEventListener(
        "click",
        () => {

            openTaskForm();

        }
    );


    taskContainer.appendChild(
        addButton
    );

}


// ========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ========================================

function escapeHtml(
    value
) {

    return String(
        value ?? ""
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

    return escapeHtml(
        value
    );

}
// ========================================
// ДО → ПОСЛЕ
// ========================================

const BEFORE_AFTER_KEY =
    "90days_before_after";


let beforeAfterData =
    JSON.parse(
        localStorage.getItem(
            BEFORE_AFTER_KEY
        )
    ) || {

        pointA: {

            photo: "",

            answers: {

                mainGoal: "",

                why: "",

                currentState: "",

                proudOf: "",

                wantToChange: ""

            }

        },

        pointB: {

            photo: "",

            answers: {

                mainGoal: "",

                why: "",

                currentState: "",

                proudOf: "",

                wantToChange: ""

            }

        },

        wheel: [

            {
                name: "Духовный рост",
                a: 5,
                b: null
            },

            {
                name: "Здоровье",
                a: 5,
                b: null
            },

            {
                name: "Развитие блога",
                a: 5,
                b: null
            },

            {
                name: "Финансы",
                a: 5,
                b: null
            }

        ]

    };


// ========================================
// СОХРАНЕНИЕ
// ========================================

function saveBeforeAfter() {

    localStorage.setItem(
        BEFORE_AFTER_KEY,
        JSON.stringify(
            beforeAfterData
        )
    );

}


// ========================================
// ИНИЦИАЛИЗАЦИЯ
// ========================================

function setupBeforeAfter() {

    const page =
        document.querySelector(
            "#before-after-page"
        );


    if (
        !page
    ) {

        return;

    }


    renderBeforeAfter();

}


// ========================================
// ОСНОВНОЙ ЭКРАН
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

        <section
            class="ba-section"
        >

            <div
                class="page-heading"
            >

                <p
                    class="eyebrow"
                >
                    МОЯ ТОЧКА А → ТОЧКА Б
                </p>


                <h1
                    class="page-title"
                >
                    До → После
                </h1>


                <p
                    class="page-description"
                >
                    Зафиксируй, с чего начинаешь,
                    чтобы через 90 дней увидеть,
                    как далеко ты пришла.
                </p>

            </div>


            <div
                class="ba-card"
            >

                <div
                    class="ba-card-heading"
                >

                    <div>

                        <p
                            class="eyebrow"
                        >
                            ДЕНЬ 1
                        </p>


                        <h2>
                            Моя точка А
                        </h2>

                    </div>

                </div>


                <div
                    class="ba-fields"
                >

                    <label>
                        Что я хочу изменить
                        за эти 90 дней?

                        <textarea
                            id="ba-main-goal"
                            placeholder="Напиши своими словами..."
                        >${escapeHtml(
                            beforeAfterData.pointA
                                .answers.mainGoal
                        )}</textarea>

                    </label>


                    <label>
                        Почему для меня
                        это важно?

                        <textarea
                            id="ba-why"
                            placeholder="Что стоит за этим желанием?"
                        >${escapeHtml(
                            beforeAfterData.pointA
                                .answers.why
                        )}</textarea>

                    </label>


                    <label>
                        Как я чувствую себя
                        сейчас?

                        <textarea
                            id="ba-current-state"
                            placeholder="Опиши своё состояние..."
                        >${escapeHtml(
                            beforeAfterData.pointA
                                .answers.currentState
                        )}</textarea>

                    </label>


                    <label>
                        Чем я уже сейчас
                        могу гордиться?

                        <textarea
                            id="ba-proud"
                            placeholder="Даже если кажется, что это мелочи..."
                        >${escapeHtml(
                            beforeAfterData.pointA
                                .answers.proudOf
                        )}</textarea>

                    </label>


                    <label>
                        Что я хочу увидеть
                        в себе через 90 дней?

                        <textarea
                            id="ba-want-change"
                            placeholder="Представь себя в конце пути..."
                        >${escapeHtml(
                            beforeAfterData.pointA
                                .answers.wantToChange
                        )}</textarea>

                    </label>

                </div>


                <button
                    type="button"
                    class="primary-button"
                    id="save-point-a"
                >
                    Сохранить точку А
                </button>


                <div
                    class="ba-message"
                    id="point-a-message"
                ></div>

            </div>


            <div
                class="ba-card"
            >

                <div
                    class="ba-card-heading"
                >

                    <div>

                        <p
                            class="eyebrow"
                        >
                            МОЁ КОЛЕСО ЖИЗНИ
                        </p>


                        <h2>
                            Как я оцениваю свою жизнь сейчас
                        </h2>

                    </div>

                </div>


                <p
                    class="page-description"
                >
                    Оцени каждую сферу от 1 до 10.
                    Здесь нет правильных ответов —
                    важна только твоя честная точка А.
                </p>


                <div
                    id="wheel-visual"
                    class="wheel-visual"
                ></div>


                <div
                    id="wheel-average"
                    class="wheel-average"
                ></div>


                <div
                    id="wheel-editor"
                    class="wheel-editor"
                ></div>


                <button
                    type="button"
                    class="secondary-button"
                    id="edit-wheel"
                >
                    Изменить сферы
                </button>

            </div>


            <div
                class="ba-card ba-locked"
            >

                <p
                    class="eyebrow"
                >
                    ДЕНЬ 90
                </p>


                <h2>
                    Моя точка Б
                </h2>


                <p>
                    Эта часть откроется,
                    когда ты дойдёшь до конца
                    90-дневного пути.
                </p>

            </div>


            <div
                id="ba-comparison"
                class="ba-comparison"
            ></div>

        </section>

    `;


    setupPointAEvents();

    renderWheel();

    renderPointBPreview();

}


// ========================================
// СОХРАНЕНИЕ ТОЧКИ А
// ========================================

function setupPointAEvents() {

    const fields = {

        mainGoal:
            document.querySelector(
                "#ba-main-goal"
            ),

        why:
            document.querySelector(
                "#ba-why"
            ),

        currentState:
            document.querySelector(
                "#ba-current-state"
            ),

        proudOf:
            document.querySelector(
                "#ba-proud"
            ),

        wantToChange:
            document.querySelector(
                "#ba-want-change"
            )

    };


    const saveButton =
        document.querySelector(
            "#save-point-a"
        );


    if (
        !saveButton
    ) {

        return;

    }


    saveButton.addEventListener(
        "click",
        () => {

            Object.keys(
                fields
            ).forEach(
                key => {

                    if (
                        fields[key]
                    ) {

                        beforeAfterData
                            .pointA
                            .answers[key] =
                                fields[key]
                                    .value
                                    .trim();

                    }

                }
            );


            saveBeforeAfter();


            const message =
                document.querySelector(
                    "#point-a-message"
                );


            if (
                message
            ) {

                message.textContent =
                    "Точка А сохранена ♥";


                setTimeout(
                    () => {

                        message.textContent =
                            "";

                    },
                    2500
                );

            }

        }
    );


    const editWheel =
        document.querySelector(
            "#edit-wheel"
        );


    if (
        editWheel
    ) {

        editWheel.addEventListener(
            "click",
            () => {

                toggleWheelEditor();

            }
        );

    }

}


// ========================================
// РЕДАКТОР СФЕР
// ========================================

function toggleWheelEditor() {

    const editor =
        document.querySelector(
            "#wheel-editor"
        );


    if (
        !editor
    ) {

        return;

    }


    if (
        editor.classList.contains(
            "visible"
        )
    ) {

        editor.classList.remove(
            "visible"
        );

        editor.innerHTML =
            "";

        return;

    }


    editor.classList.add(
        "visible"
    );


    renderWheelEditor();

}


// ========================================
// СФЕРЫ
// ========================================

function renderWheelEditor() {

    const editor =
        document.querySelector(
            "#wheel-editor"
        );


    if (
        !editor
    ) {

        return;

    }


    editor.innerHTML = `

        <div
            class="wheel-editor-list"
        ></div>


        <div
            class="wheel-editor-add"
        >

            <input
                type="text"
                id="new-wheel-sphere"
                placeholder="Название новой сферы"
            >


            <button
                type="button"
                id="add-wheel-sphere"
                class="secondary-button"
            >
                + Добавить сферу
            </button>

        </div>

    `;


    const list =
        editor.querySelector(
            ".wheel-editor-list"
        );


    beforeAfterData.wheel.forEach(
        (
            category,
            index
        ) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "ba-wheel-row";


            row.innerHTML = `

                <span>
                    ${escapeHtml(
                        category.name
                    )}
                </span>


                <input
                    type="range"
                    min="1"
                    max="10"
                    value="${
                        category.a || 5
                    }"
                    data-wheel-index="${index}"
                    class="ba-range"
                >


                <strong>
                    ${
                        category.a || 5
                    }
                </strong>


                ${
                    beforeAfterData.wheel.length >
                    1
                        ? `
                            <button
                                type="button"
                                class="wheel-delete"
                                data-delete-wheel="${index}"
                            >
                                ×
                            </button>
                        `
                        : ""
                }

            `;


            list.appendChild(
                row
            );

        }
    );


    editor
        .querySelectorAll(
            ".ba-range"
        )
        .forEach(
            input => {

                input.addEventListener(
                    "input",
                    () => {

                        const index =
                            Number(
                                input.dataset
                                    .wheelIndex
                            );


                        beforeAfterData
                            .wheel[index]
                            .a =
                                Number(
                                    input.value
                                );


                        const value =
                            input.parentElement
                                .querySelector(
                                    "strong"
                                );


                        if (
                            value
                        ) {

                            value.textContent =
                                input.value;

                        }


                        saveBeforeAfter();

                        renderWheel();

                    }
                );

            }
        );


    editor
        .querySelectorAll(
            "[data-delete-wheel]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                button.dataset
                                    .deleteWheel
                            );


                        beforeAfterData
                            .wheel
                            .splice(
                                index,
                                1
                            );


                        saveBeforeAfter();

                        renderWheel();

                        renderWheelEditor();

                    }
                );

            }
        );


    editor
        .querySelector(
            "#add-wheel-sphere"
        )
        .addEventListener(
            "click",
            () => {

                const input =
                    editor.querySelector(
                        "#new-wheel-sphere"
                    );


                const name =
                    input.value.trim();


                if (
                    !name
                ) {

                    input.focus();

                    return;

                }


                beforeAfterData
                    .wheel
                    .push({

                        name:
                            name,

                        a:
                            5,

                        b:
                            null

                    });


                saveBeforeAfter();

                input.value =
                    "";

                renderWheel();

                renderWheelEditor();

            }
        );

}


// ========================================
// ЗАПУСК РАЗДЕЛА
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupBeforeAfter();

    }
);
// ========================================
// ВИЗУАЛЬНОЕ КОЛЕСО ЖИЗНИ
// ========================================

function renderWheel() {

    const container =
        document.querySelector(
            "#wheel-visual"
        );


    if (
        !container
    ) {

        return;

    }


    const wheel =
        beforeAfterData.wheel;


    if (
        !wheel.length
    ) {

        container.innerHTML = `

            <div class="wheel-empty">
                Добавь хотя бы одну сферу
                своей жизни.
            </div>

        `;

        return;

    }


    /*
        Каждый сектор получает свой
        нежный пастельный оттенок.
    */

    const colors = [

        "#E8DDE5",

        "#DDE8E1",

        "#E8E2D5",

        "#E1DDEA",

        "#E8D9D4",

        "#D9E4E8",

        "#E7E1D4",

        "#E2DCE8",

        "#DDE7DE",

        "#E8DED8"

    ];


    const size =
        320;


    const center =
        size / 2;


    const radius =
        132;


    const innerRadius =
        25;


    const angle =
        360 /
        wheel.length;


    let sectors =
        "";


    let labels =
        "";


    wheel.forEach(
        (
            sphere,
            index
        ) => {

            const value =
                Math.max(
                    1,
                    Math.min(
                        10,
                        Number(
                            sphere.a ||
                            1
                        )
                    )
                );


            const outerRadius =
                innerRadius +
                (
                    radius -
                    innerRadius
                ) *
                (
                    value /
                    10
                );


            const startAngle =
                -90 +
                (
                    index *
                    angle
                );


            const endAngle =
                startAngle +
                angle;


            const largeArc =
                angle >
                180
                    ? 1
                    : 0;


            const startOuter =
                polarToCartesian(
                    center,
                    center,
                    outerRadius,
                    startAngle
                );


            const endOuter =
                polarToCartesian(
                    center,
                    center,
                    outerRadius,
                    endAngle
                );


            const startInner =
                polarToCartesian(
                    center,
                    center,
                    innerRadius,
                    startAngle
                );


            const endInner =
                polarToCartesian(
                    center,
                    center,
                    innerRadius,
                    endAngle
                );


            const path = [

                `M ${startInner.x} ${startInner.y}`,

                `L ${startOuter.x} ${startOuter.y}`,

                `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,

                `L ${endInner.x} ${endInner.y}`,

                `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${startInner.x} ${startInner.y}`,

                "Z"

            ].join(" ");


            sectors += `

                <path
                    d="${path}"
                    fill="${
                        colors[
                            index %
                            colors.length
                        ]
                    }"
                    stroke="#FFFFFF"
                    stroke-width="3"
                    class="wheel-sector"
                >

                    <title>
                        ${escapeHtml(
                            sphere.name
                        )}: ${value}/10
                    </title>

                </path>

            `;


            const labelRadius =
                radius +
                27;


            const labelAngle =
                startAngle +
                angle / 2;


            const label =
                polarToCartesian(
                    center,
                    center,
                    labelRadius,
                    labelAngle
                );


            labels += `

                <text
                    x="${label.x}"
                    y="${label.y}"
                    class="wheel-label"
                    text-anchor="middle"
                    dominant-baseline="middle"
                >
                    ${escapeHtml(
                        sphere.name
                    )}
                </text>

            `;


            labels += `

                <text
                    x="${label.x}"
                    y="${label.y + 15}"
                    class="wheel-value"
                    text-anchor="middle"
                    dominant-baseline="middle"
                >
                    ${value}/10
                </text>

            `;

        }
    );


    /*
        Добавляем тонкие круги-ориентиры.
    */

    let guides =
        "";


    [
        0.25,
        0.5,
        0.75,
        1
    ].forEach(
        ratio => {

            guides += `

                <circle
                    cx="${center}"
                    cy="${center}"
                    r="${
                        innerRadius +
                        (
                            radius -
                            innerRadius
                        ) *
                        ratio
                    }"
                    fill="none"
                    stroke="#FFFFFF"
                    stroke-width="1"
                    opacity="0.85"
                />

            `;

        }
    );


    container.innerHTML = `

        <div
            class="wheel-wrapper"
        >

            <svg
                class="life-wheel"
                viewBox="0 0 ${size} ${size}"
                role="img"
                aria-label="Колесо жизни"
            >

                ${guides}

                ${sectors}

                <circle
                    cx="${center}"
                    cy="${center}"
                    r="${innerRadius}"
                    fill="#FFF9F8"
                />

                ${labels}

            </svg>

        </div>

    `;


    updateWheelAverage();

}


// ========================================
// ПОЛУЧИТЬ КООРДИНАТЫ ТОЧКИ
// ========================================

function polarToCartesian(
    centerX,
    centerY,
    radius,
    angleInDegrees
) {

    const angleInRadians =
        (
            angleInDegrees -
            90
        ) *
        Math.PI /
        180;


    return {

        x:
            centerX +
            radius *
            Math.cos(
                angleInRadians
            ),

        y:
            centerY +
            radius *
            Math.sin(
                angleInRadians
            )

    };

}


// ========================================
// СРЕДНЯЯ ОЦЕНКА
// ========================================

function updateWheelAverage() {

    const element =
        document.querySelector(
            "#wheel-average"
        );


    if (
        !element ||
        !beforeAfterData.wheel.length
    ) {

        return;

    }


    const total =
        beforeAfterData.wheel.reduce(
            (
                sum,
                sphere
            ) => {

                return (
                    sum +
                    Number(
                        sphere.a ||
                        0
                    )
                );

            },
            0
        );


    const average =
        (
            total /
            beforeAfterData.wheel.length
        ).toFixed(
            1
        );


    element.innerHTML = `

        <span>
            Средняя оценка
        </span>

        <strong>
            ${average}
            <small>/10</small>
        </strong>

    `;

}


// ========================================
// ПРЕДПРОСМОТР ТОЧКИ Б
// ========================================

function renderPointBPreview() {

    const comparison =
        document.querySelector(
            "#ba-comparison"
        );


    if (
        !comparison
    ) {

        return;

    }


    const hasPointB =
        beforeAfterData.wheel.some(
            sphere =>
                sphere.b !==
                null &&
                sphere.b !==
                undefined
        );


    if (
        !hasPointB
    ) {

        comparison.innerHTML =
            "";

        return;

    }


    renderComparison();

}


// ========================================
// СРАВНЕНИЕ ТОЧКА А → ТОЧКА Б
// ========================================

function renderComparison() {

    const container =
        document.querySelector(
            "#ba-comparison"
        );


    if (
        !container
    ) {

        return;

    }


    container.innerHTML = `

        <div
            class="ba-card"
        >

            <p
                class="eyebrow"
            >
                МОЙ ПРОГРЕСС
            </p>


            <h2>
                Точка А → Точка Б
            </h2>


            <div
                class="comparison-list"
            ></div>

        </div>

    `;


    const list =
        container.querySelector(
            ".comparison-list"
        );


    beforeAfterData.wheel.forEach(
        sphere => {

            if (
                sphere.b ===
                null ||
                sphere.b ===
                undefined
            ) {

                return;

            }


            const difference =
                Number(
                    sphere.b
                ) -
                Number(
                    sphere.a
                );


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "comparison-row";


            let changeText =
                "";


            if (
                difference > 0
            ) {

                changeText =
                    `+${difference}`;

            } else {

                changeText =
                    `${difference}`;

            }


            row.innerHTML = `

                <span>
                    ${escapeHtml(
                        sphere.name
                    )}
                </span>


                <span>
                    ${sphere.a}/10
                </span>


                <span>
                    →
                </span>


                <span>
                    ${sphere.b}/10
                </span>


                <strong>
                    ${changeText}
                </strong>

            `;


            list.appendChild(
                row
            );

        }
    );

}
// ========================================
// ОБНОВЛЕНИЕ СТРАНИЦЫ ПРИ НАВИГАЦИИ
// ========================================

function refreshCurrentPage(
    pageId
) {

    if (
        pageId ===
        "today-page"
    ) {

        renderTasks();

        updateChallengeInfo();

        return;

    }


    if (
        pageId ===
        "calendar-page"
    ) {

        renderCalendar();

        return;

    }


    if (
        pageId ===
        "before-after-page"
    ) {

        renderBeforeAfter();

        return;

    }

}


// ========================================
// ДОПОЛНИТЕЛЬНАЯ НАВИГАЦИЯ
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const navigation =
            document.querySelectorAll(
                ".nav-item"
            );


        navigation.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const pageId =
                            button.dataset.page;


                        if (
                            pageId
                        ) {

                            setTimeout(
                                () => {

                                    refreshCurrentPage(
                                        pageId
                                    );

                                },
                                0
                            );

                        }

                    }
                );

            }
        );


        /*
            Показываем «Сегодня»
            при первом открытии.
        */

        const firstPage =
            document.querySelector(
                "#today-page"
            );


        if (
            firstPage
        ) {

            firstPage.classList.add(
                "active-page"
            );

        }


        /*
            Инициализируем календарь.
        */

        renderCalendar();


        /*
            Инициализируем
            «До → После».
        */

        setupBeforeAfter();

    }
);


// ========================================
// ЗАЩИТА ОТ ОШИБОК LOCALSTORAGE
// ========================================

window.addEventListener(
    "storage",
    event => {

        if (
            event.key ===
            "90days_tasks"
        ) {

            try {

                tasks =
                    JSON.parse(
                        event.newValue
                    ) || [];

            } catch (
                error
            ) {

                tasks = [];

            }


            renderTasks();

            renderCalendar();

        }


        if (
            event.key ===
            BEFORE_AFTER_KEY
        ) {

            try {

                beforeAfterData =
                    JSON.parse(
                        event.newValue
                    ) ||
                    beforeAfterData;

            } catch (
                error
            ) {

                // Оставляем текущие данные

            }


            renderBeforeAfter();

        }

    }
);


// ========================================
// КОНЕЦ APP.JS
// ========================================
