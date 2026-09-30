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


    const dailyProgressText =
        document.querySelector(
            "#daily-progress-text"
        );


    const dailyProgressFill =
        document.querySelector(
            "#daily-progress-fill"
        );


    const completedCount =
        todayTasks.filter(
            task =>
                isTaskCompleted(
                    task,
                    today
                )
        ).length;


    if (
        dailyProgressText
    ) {

        dailyProgressText.textContent =
            `${completedCount} из ${todayTasks.length}`;

    }


    if (
        dailyProgressFill
    ) {

        const percent =
            todayTasks.length
                ? (
                    completedCount /
                    todayTasks.length
                ) * 100
                : 0;


        dailyProgressFill.style.width =
            `${percent}%`;

    }


    if (
        !todayTasks.length
    ) {

        return;

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
                !categoryTasks.length
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

                <div
                    class="task-group-title"
                >
                    ${category}
                </div>

                <div
                    class="task-list"
                ></div>

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
                        "task-item" +
                        (
                            completed
                                ? " completed"
                                : ""
                        );


                    taskElement.innerHTML = `

                        <button
                            class="task-check"
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
                                ${escapeText(
                                    task.title
                                )}
                            </div>


                            <div
                                class="task-meta"
                            >
                                ${
                                    task.repeat ===
                                    "daily"
                                        ? "Каждый день"
                                        : task.repeat ===
                                          "weekly"
                                            ? "По выбранным дням"
                                            : "Сегодня"
                                }
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


                    checkButton.addEventListener(
                        "click",
                        event => {

                            event.stopPropagation();

                            toggleTask(
                                task,
                                today
                            );

                        }
                    );


                    taskElement.querySelector(
                        ".task-edit"
                    ).addEventListener(
                        "click",
                        event => {

                            event.stopPropagation();

                            openTaskMenu(
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

}


// ========================================
// ПЕРЕКЛЮЧЕНИЕ ЗАДАЧИ
// ========================================

function toggleTask(
    task,
    dateString
) {

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
// МЕНЮ ЗАДАЧИ
// ========================================

function openTaskMenu(
    task
) {

    const oldMenu =
        document.querySelector(
            ".task-menu"
        );


    if (
        oldMenu
    ) {

        oldMenu.remove();

    }


    const menu =
        document.createElement(
            "div"
        );


    menu.className =
        "task-menu";


    menu.innerHTML = `

        <div
            class="form-overlay"
        ></div>


        <div
            class="task-menu-window"
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
                ДЕЙСТВИЕ
            </p>


            <h2>
                ${escapeText(
                    task.title
                )}
            </h2>


            <button
                class="menu-button"
                id="edit-task-button"
            >
                Редактировать
            </button>


            <button
                class="menu-button danger"
                id="delete-task-button"
            >
                Удалить
            </button>

        </div>

    `;


    document.body.appendChild(
        menu
    );


    menu.querySelector(
        ".close-form"
    ).addEventListener(
        "click",
        () => menu.remove()
    );


    menu.querySelector(
        ".form-overlay"
    ).addEventListener(
        "click",
        () => menu.remove()
    );


    menu.querySelector(
        "#edit-task-button"
    ).addEventListener(
        "click",
        () => {

            menu.remove();

            openTaskForm(
                task
            );

        }
    );


    menu.querySelector(
        "#delete-task-button"
    ).addEventListener(
        "click",
        () => {

            tasks =
                tasks.filter(
                    item =>
                        item.id !==
                        task.id
                );


            saveTasks();

            menu.remove();

            renderTasks();

            renderCalendar();

        }
    );

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
// ДОБАВИТЬ ЗАДАЧУ
// ========================================

function addTaskButton() {

    openTaskForm();

}


// ========================================
// ЭКРАН КАЛЕНДАРЯ
// ========================================

function renderCalendar() {

    const calendar =
        document.querySelector(
            "#challenge-calendar"
        );


    const selectedDay =
        document.querySelector(
            "#selected-day"
        );


    if (
        !calendar
    ) {

        return;

    }


    calendar.innerHTML =
        "";


    if (
        selectedDay
    ) {

        selectedDay.innerHTML =
            "";

    }


    const start =
        getDateObject(
            CHALLENGE_START
        );


    const months =
        {};


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


        const date =
            getDateObject(
                dateString
            );


        const monthKey =
            `${date.getFullYear()}-${date.getMonth()}`;


        if (
            !months[monthKey]
        ) {

            months[monthKey] =
                {

                    year:
                        date.getFullYear(),

                    month:
                        date.getMonth(),

                    days:
                        []

                };

        }


        months[
            monthKey
        ].days.push(
            dateString
        );

    }


    Object.values(
        months
    ).forEach(
        monthData => {

            const monthBlock =
                document.createElement(
                    "div"
                );


            monthBlock.className =
                "calendar-month";


            const monthTitle =
                document.createElement(
                    "h3"
                );


            monthTitle.textContent =
                new Date(
                    monthData.year,
                    monthData.month,
                    1
                ).toLocaleDateString(
                    "ru-RU",
                    {
                        month: "long",
                        year: "numeric"
                    }
                );


            monthBlock.appendChild(
                monthTitle
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
                            "span"
                        );


                    element.textContent =
                        day;


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


            const firstDay =
                new Date(
                    monthData.year,
                    monthData.month,
                    1
                ).getDay();


            const mondayIndex =
                firstDay === 0
                    ? 6
                    : firstDay - 1;


            for (
                let i = 0;
                i < mondayIndex;
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


            monthData.days.forEach(
                dateString => {

                    const dayElement =
                        document.createElement(
                            "button"
                        );


                    dayElement.type =
                        "button";


                    dayElement.className =
                        "calendar-day";


                    const dayNumber =
                        getDateObject(
                            dateString
                        ).getDate();


                    dayElement.innerHTML = `

                        <span>
                            ${dayNumber}
                        </span>

                    `;


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


                    if (
                        dayTasks.length &&
                        completedTasks.length ===
                        dayTasks.length
                    ) {

                        dayElement.classList.add(
                            "status-complete"
                        );

                    } else if (
                        completedTasks.length
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


                    dayElement.addEventListener(
                        "click",
                        () => {

                            renderSelectedDay(
                                dateString
                            );

                        }
                    );


                    grid.appendChild(
                        dayElement
                    );

                }
            );


            monthBlock.appendChild(
                grid
            );


            calendar.appendChild(
                monthBlock
            );

        }
    );

}
// ========================================
// РЕДАКТИРОВАНИЕ СФЕР
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


    const isOpen =
        editor.classList.contains(
            "visible"
        );


    if (
        isOpen
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
// РЕДАКТОР СФЕР
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
                id="new-wheel-category"
                placeholder="Название новой сферы"
                maxlength="40"
            >


            <button
                type="button"
                id="add-wheel-category"
                class="small-outline-button"
            >
                + Добавить
            </button>

        </div>

    `;


    const list =
        editor.querySelector(
            ".wheel-editor-list"
        );


    beforeAfterData.wheel.forEach(
        (category, index) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "wheel-editor-row";


            row.innerHTML = `

                <input
                    type="text"
                    value="${escapeAttribute(
                        category.name
                    )}"
                    maxlength="40"
                >


                <button
                    type="button"
                    class="delete-wheel-category"
                    aria-label="Удалить сферу"
                >
                    ×
                </button>

            `;


            const input =
                row.querySelector(
                    "input"
                );


            input.addEventListener(
                "input",
                () => {

                    const value =
                        input.value.trim();


                    if (
                        value
                    ) {

                        beforeAfterData.wheel[
                            index
                        ].name =
                            value;

                    }


                    saveBeforeAfter();

                    renderWheel();

                }
            );


            row.querySelector(
                ".delete-wheel-category"
            ).addEventListener(
                "click",
                () => {

                    if (
                        beforeAfterData.wheel.length <=
                        1
                    ) {

                        return;

                    }


                    beforeAfterData.wheel.splice(
                        index,
                        1
                    );


                    saveBeforeAfter();

                    renderWheel();

                    renderWheelEditor();

                }
            );


            list.appendChild(
                row
            );

        }
    );


    const newInput =
        editor.querySelector(
            "#new-wheel-category"
        );


    const addButton =
        editor.querySelector(
            "#add-wheel-category"
        );


    addButton.addEventListener(
        "click",
        () => {

            const name =
                newInput.value.trim();


            if (
                !name
            ) {

                newInput.focus();

                return;

            }


            beforeAfterData.wheel.push({

                id:
                    Date.now() +
                    Math.random(),

                name:
                    name,

                a:
                    5,

                b:
                    null

            });


            saveBeforeAfter();

            newInput.value =
                "";


            renderWheel();

            renderWheelEditor();

        }
    );

}


// ========================================
// КОЛЕСО ЖИЗНИ
// ========================================

function renderWheel() {

    const visual =
        document.querySelector(
            "#wheel-visual"
        );


    const average =
        document.querySelector(
            "#wheel-average"
        );


    if (
        !visual
    ) {

        return;

    }


    const categories =
        beforeAfterData.wheel;


    if (
        !categories.length
    ) {

        visual.innerHTML = `

            <div
                class="wheel-empty"
            >
                Добавь хотя бы одну сферу.
            </div>

        `;


        if (
            average
        ) {

            average.innerHTML =
                "";

        }


        return;

    }


    const size =
        420;


    const center =
        size / 2;


    const radius =
        145;


    const count =
        categories.length;


    const angleStep =
        (
            Math.PI * 2
        ) /
        count;


    let polygonPoints =
        "";


    categories.forEach(
        (category, index) => {

            const angle =
                (
                    angleStep *
                    index
                ) -
                Math.PI / 2;


            const value =
                Number(
                    category.a || 0
                );


            const r =
                radius *
                (
                    value /
                    10
                );


            const x =
                center +
                Math.cos(
                    angle
                ) *
                r;


            const y =
                center +
                Math.sin(
                    angle
                ) *
                r;


            polygonPoints +=
                `${x},${y} `;

        }
    );


    let grid =
        "";


    [2, 4, 6, 8, 10].forEach(
        value => {

            const points =
                categories
                    .map(
                        (
                            category,
                            index
                        ) => {

                            const angle =
                                (
                                    angleStep *
                                    index
                                ) -
                                Math.PI / 2;


                            const r =
                                radius *
                                (
                                    value /
                                    10
                                );


                            const x =
                                center +
                                Math.cos(
                                    angle
                                ) *
                                r;


                            const y =
                                center +
                                Math.sin(
                                    angle
                                ) *
                                r;


                            return `${x},${y}`;

                        }
                    )
                    .join(" ");


            grid += `

                <polygon
                    points="${points}"
                    fill="none"
                    stroke="rgba(110, 98, 103, 0.14)"
                    stroke-width="1"
                />

            `;

        }
    );


    let axes =
        "";


    let labels =
        "";


    categories.forEach(
        (category, index) => {

            const angle =
                (
                    angleStep *
                    index
                ) -
                Math.PI / 2;


            const x =
                center +
                Math.cos(
                    angle
                ) *
                radius;


            const y =
                center +
                Math.sin(
                    angle
                ) *
                radius;


            axes += `

                <line
                    x1="${center}"
                    y1="${center}"
                    x2="${x}"
                    y2="${y}"
                    stroke="rgba(110, 98, 103, 0.12)"
                    stroke-width="1"
                />

            `;


            const labelRadius =
                radius + 32;


            const labelX =
                center +
                Math.cos(
                    angle
                ) *
                labelRadius;


            const labelY =
                center +
                Math.sin(
                    angle
                ) *
                labelRadius;


            labels += `

                <text
                    x="${labelX}"
                    y="${labelY}"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    class="wheel-label"
                >
                    ${escapeText(
                        category.name
                    )}
                </text>

            `;

        }
    );


    visual.innerHTML = `

        <svg
            class="life-wheel-svg"
            viewBox="0 0 ${size} ${size}"
            role="img"
            aria-label="Колесо жизни"
        >

            ${grid}

            ${axes}


            <polygon
                points="${polygonPoints}"
                class="wheel-value-area"
            />


            ${categories
                .map(
                    (
                        category,
                        index
                    ) => {

                        const angle =
                            (
                                angleStep *
                                index
                            ) -
                            Math.PI / 2;


                        const value =
                            Number(
                                category.a || 0
                            );


                        const r =
                            radius *
                            (
                                value /
                                10
                            );


                        const x =
                            center +
                            Math.cos(
                                angle
                            ) *
                            r;


                        const y =
                            center +
                            Math.sin(
                                angle
                            ) *
                            r;


                        return `

                            <circle
                                cx="${x}"
                                cy="${y}"
                                r="4"
                                class="wheel-point"
                            />

                        `;

                    }
                )
                .join("")}


            ${labels}

        </svg>


        <div
            class="wheel-values"
        >

            ${categories
                .map(
                    (
                        category,
                        index
                    ) => `

                        <div
                            class="wheel-value-row"
                        >

                            <span>
                                ${escapeText(
                                    category.name
                                )}
                            </span>


                            <input
                                type="range"
                                min="1"
                                max="10"
                                step="1"
                                value="${
                                    category.a || 5
                                }"
                                data-wheel-index="${index}"
                            >


                            <strong
                                data-wheel-value="${index}"
                            >
                                ${category.a || 5}
                            </strong>

                        </div>

                    `
                )
                .join("")}

        </div>

    `;


    visual.querySelectorAll(
        "input[type='range']"
    ).forEach(
        input => {

            input.addEventListener(
                "input",
                () => {

                    const index =
                        Number(
                            input.dataset.wheelIndex
                        );


                    const value =
                        Number(
                            input.value
                        );


                    beforeAfterData.wheel[
                        index
                    ].a =
                        value;


                    const valueElement =
                        visual.querySelector(
                            `[data-wheel-value="${index}"]`
                        );


                    if (
                        valueElement
                    ) {

                        valueElement.textContent =
                            value;

                    }


                    saveBeforeAfter();

                    updateWheelVisualOnly();

                }
            );

        }
    );


    updateWheelAverage();

}


// ========================================
// ОБНОВИТЬ ТОЛЬКО ГРАФИК
// ========================================

function updateWheelVisualOnly() {

    const svg =
        document.querySelector(
            ".life-wheel-svg"
        );


    if (
        !svg
    ) {

        renderWheel();

        return;

    }


    const categories =
        beforeAfterData.wheel;


    const size =
        420;


    const center =
        size / 2;


    const radius =
        145;


    const count =
        categories.length;


    const angleStep =
        (
            Math.PI * 2
        ) /
        count;


    let points =
        "";


    categories.forEach(
        (
            category,
            index
        ) => {

            const angle =
                (
                    angleStep *
                    index
                ) -
                Math.PI / 2;


            const value =
                Number(
                    category.a || 0
                );


            const r =
                radius *
                (
                    value /
                    10
                );


            const x =
                center +
                Math.cos(
                    angle
                ) *
                r;


            const y =
                center +
                Math.sin(
                    angle
                ) *
                r;


            points +=
                `${x},${y} `;

        }
    );


    const polygon =
        svg.querySelector(
            ".wheel-value-area"
        );


    if (
        polygon
    ) {

        polygon.setAttribute(
            "points",
            points
        );

    }


    const pointsElements =
        svg.querySelectorAll(
            ".wheel-point"
        );


    categories.forEach(
        (
            category,
            index
        ) => {

            const angle =
                (
                    angleStep *
                    index
                ) -
                Math.PI / 2;


            const value =
                Number(
                    category.a || 0
                );


            const r =
                radius *
                (
                    value /
                    10
                );


            const x =
                center +
                Math.cos(
                    angle
                ) *
                r;


            const y =
                center +
                Math.sin(
                    angle
                ) *
                r;


            const point =
                pointsElements[
                    index
                ];


            if (
                point
            ) {

                point.setAttribute(
                    "cx",
                    x
                );


                point.setAttribute(
                    "cy",
                    y
                );

            }

        }
    );


    updateWheelAverage();

}


// ========================================
// СРЕДНИЙ БАЛЛ
// ========================================

function updateWheelAverage() {

    const element =
        document.querySelector(
            "#wheel-average"
        );


    if (
        !element
    ) {

        return;

    }


    const values =
        beforeAfterData.wheel
            .map(
                item =>
                    Number(
                        item.a
                    )
            )
            .filter(
                value =>
                    !Number.isNaN(
                        value
                    )
            );


    if (
        !values.length
    ) {

        element.innerHTML =
            "";

        return;

    }


    const sum =
        values.reduce(
            (
                total,
                value
            ) =>
                total + value,
            0
        );


    const average =
        (
            sum /
            values.length
        ).toFixed(
            1
        );


    element.innerHTML = `

        <span>
            Средняя оценка
        </span>

        <strong>
            ${average}
            / 10
        </strong>

    `;

}


// ========================================
// ТОЧКА Б
// ========================================

function renderPointB() {

    const container =
        document.querySelector(
            "#point-b-content"
        );


    if (
        !container
    ) {

        return;

    }


    if (
        !isChallengeFinished()
    ) {

        container.innerHTML = `

            <div
                class="point-b-locked"
            >

                <div
                    class="point-b-lock"
                >
                    90
                </div>


                <h3>
                    Эта часть пока закрыта
                </h3>


                <p>
                    Вернись сюда после
                    29 декабря. Здесь ты
                    запишешь, что изменилось
                    за 90 дней, и сравнишь
                    себя с точкой А.
                </p>


                <div
                    class="point-b-date"
                >
                    Откроется 30 декабря 2026
                </div>

            </div>

        `;


        return;

    }


    container.innerHTML = `

        <div
            class="ba-questions"
        >

            <label>
                Что изменилось?
            </label>

            <textarea
                id="ba-b-change"
                placeholder="Что стало другим?"
            ></textarea>


            <label>
                Что я изменила?
            </label>

            <textarea
                id="ba-b-changed"
                placeholder="Какие действия привели к результату?"
            ></textarea>


            <label>
                Что я получила за 90 дней?
            </label>

            <textarea
                id="ba-b-result"
                placeholder="Что я приобрела за этот путь?"
            ></textarea>

        </div>


        <div
            class="wheel-card"
        >

            <div
                class="wheel-card-header"
            >

                <div>

                    <h3>
                        Моё колесо жизни
                    </h3>

                    <p>
                        Оцени те же сферы
                        ещё раз
                    </p>

                </div>

            </div>


            <div
                class="wheel-b-values"
            ></div>

        </div>


        <div
            class="comparison-card"
        >

            <h3>
                Точка А → Точка Б
            </h3>


            <div
                class="comparison-list"
                id="comparison-list"
            ></div>

        </div>

    `;


    const fields = [

        [
            "#ba-b-change",
            "change"
        ],

        [
            "#ba-b-changed",
            "changed"
        ],

        [
            "#ba-b-result",
            "result"
        ]

    ];


    fields.forEach(
        ([selector, key]) => {

            const element =
                document.querySelector(
                    selector
                );


            if (
                !element
            ) {

                return;

            }


            element.value =
                beforeAfterData.pointB[
                    key
                ];


            element.addEventListener(
                "input",
                () => {

                    beforeAfterData.pointB[
                        key
                    ] =
                        element.value;


                    saveBeforeAfter();

                }
            );

        }
    );


    const valuesContainer =
        container.querySelector(
            ".wheel-b-values"
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
                "wheel-value-row";

            row.innerHTML = `

                <span>
                    ${escapeText(
                        category.name
                    )}
                </span>


                <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value="${
                        category.b || 5
                    }"
                >


                <strong>
                    ${category.b || 5}
                </strong>

            `;


            const input =
                row.querySelector(
                    "input"
                );


            const value =
                row.querySelector(
                    "strong"
                );


            input.addEventListener(
                "input",
                () => {

                    category.b =
                        Number(
                            input.value
                        );


                    value.textContent =
                        input.value;


                    saveBeforeAfter();

                    renderComparison();

                }
            );


            valuesContainer.appendChild(
                row
            );

        }
    );


    renderComparison();

}


// ========================================
// СРАВНЕНИЕ
// ========================================

function renderComparison() {

    const container =
        document.querySelector(
            "#comparison-list"
        );


    if (
        !container
    ) {

        return;

    }


    container.innerHTML =
        "";


    beforeAfterData.wheel.forEach(
        category => {

            const a =
                Number(
                    category.a || 0
                );


            const b =
                Number(
                    category.b || 0
                );


            const difference =
                b - a;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "comparison-row";


            row.innerHTML = `

                <span>
                    ${escapeText(
                        category.name
                    )}
                </span>


                <span>
                    ${a}
                </span>


                <span>
                    →
                </span>


                <span>
                    ${b}
                </span>


                <strong
                    class="${
                        difference > 0
                            ? "comparison-positive"
                            : difference < 0
                                ? "comparison-negative"
                                : ""
                    }"
                >
                    ${
                        difference > 0
                            ? "+" + difference
                            : difference
                    }
                </strong>

            `;


            container.appendChild(
                row
            );

        }
    );

}


// ========================================
// ЗАПУСК ДО → ПОСЛЕ
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupBeforeAfter();

    }
);
