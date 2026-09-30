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

        renderCalendar();

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
                    class="weekdays"
                >

                    ${createWeekdayInputs(
                        taskToEdit
                    )}

                </div>

            </div>


            <button
                class="save-task"
            >

                ${
                    isEditing
                        ? "Сохранить изменения"
                        : "Добавить шаг"
                }

            </button>


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
            () =>
                form.remove()
        );


    form
        .querySelector(
            ".form-overlay"
        )
        .addEventListener(
            "click",
            () =>
                form.remove()
        );


    const repeatSelect =
        form.querySelector(
            "#task-repeat"
        );


    const weekdaysContainer =
        form.querySelector(
            "#weekdays-container"
        );


    const periodSelect =
        form.querySelector(
            "#task-period"
        );


    const endDateInput =
        form.querySelector(
            "#task-end-date"
        );


    function updatePeriodVisibility() {

        if (
            repeatSelect.value ===
            "once"
        ) {

            periodSelect.value =
                "challenge";

            endDateInput.style.display =
                "none";

            weekdaysContainer.style.display =
                "none";

            return;

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


        if (
            periodSelect.value ===
            "until-date"
        ) {

            endDateInput.style.display =
                "block";

        } else {

            endDateInput.style.display =
                "none";

        }

    }


    repeatSelect.addEventListener(
        "change",
        updatePeriodVisibility
    );


    periodSelect.addEventListener(
        "change",
        updatePeriodVisibility
    );


    updatePeriodVisibility();


    form
        .querySelector(
            ".save-task"
        )
        .addEventListener(
            "click",
            () => {

                if (
                    isEditing
                ) {

                    saveEditedTask(
                        taskToEdit.id
                    );

                } else {

                    addTask();

                }

            }
        );


    form
        .querySelector(
            "#task-title"
        )
        .addEventListener(
            "keydown",
            event => {

                if (
                    event.key !==
                    "Enter"
                ) {

                    return;

                }


                if (
                    isEditing
                ) {

                    saveEditedTask(
                        taskToEdit.id
                    );

                } else {

                    addTask();

                }

            }
        );


    setTimeout(
        () => {

            const input =
                document.querySelector(
                    "#task-title"
                );


            if (
                input
            ) {

                input.focus();

                input.select();

            }

        },
        100
    );

}


// ========================================
// ДНИ НЕДЕЛИ
// ========================================

function createWeekdayInputs(
    task
) {

    const days = [

        [1, "Пн"],

        [2, "Вт"],

        [3, "Ср"],

        [4, "Чт"],

        [5, "Пт"],

        [6, "Сб"],

        [0, "Вс"]

    ];


    return days
        .map(
            ([value, name]) => {

                const checked =
                    task &&
                    task.weekDays &&
                    task.weekDays.includes(
                        value
                    );


                return `

                    <label
                        class="weekday"
                    >

                        <input
                            type="checkbox"
                            value="${value}"
                            ${
                                checked
                                    ? "checked"
                                    : ""
                            }
                        >

                        ${name}

                    </label>

                `;

            }
        )
        .join("");

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
        button
    ) {

        button.addEventListener(
            "click",
            () =>
                openTaskForm()
        );

    }

}


// ========================================
// ДНИ НЕДЕЛИ
// ========================================

function getSelectedWeekDays(
    repeat
) {

    if (
        repeat !==
        "weekly"
    ) {

        return [];

    }


    return Array.from(
        document.querySelectorAll(
            "#weekdays-container input:checked"
        )
    )
        .map(
            input =>
                Number(
                    input.value
                )
        );

}


// ========================================
// КОНЕЧНАЯ ДАТА
// ========================================

function getSelectedEndDate(
    repeat
) {

    if (
        repeat ===
        "once"
    ) {

        return null;

    }


    const period =
        document.querySelector(
            "#task-period"
        );


    const endDate =
        document.querySelector(
            "#task-end-date"
        );


    if (
        !period ||
        !endDate
    ) {

        return CHALLENGE_END;

    }


    if (
        period.value ===
        "until-date"
    ) {

        return (
            endDate.value ||
            null
        );

    }


    return CHALLENGE_END;

}


// ========================================
// ДОБАВЛЕНИЕ
// ========================================

function addTask() {

    const titleInput =
        document.querySelector(
            "#task-title"
        );


    const categoryInput =
        document.querySelector(
            "#task-category"
        );


    const repeatInput =
        document.querySelector(
            "#task-repeat"
        );


    if (
        !titleInput ||
        !categoryInput ||
        !repeatInput
    ) {

        return;

    }


    const title =
        titleInput.value.trim();


    const category =
        categoryInput.value;


    const repeat =
        repeatInput.value;


    if (
        !title
    ) {

        titleInput.classList.add(
            "input-error"
        );

        titleInput.focus();


        setTimeout(
            () =>
                titleInput.classList.remove(
                    "input-error"
                ),
            700
        );


        return;

    }


    const weekDays =
        getSelectedWeekDays(
            repeat
        );


    if (
        repeat ===
        "weekly" &&
        weekDays.length ===
        0
    ) {

        alert(
            "Выбери хотя бы один день недели."
        );

        return;

    }


    const endDate =
        getSelectedEndDate(
            repeat
        );


    if (
        repeat !==
        "once" &&
        !endDate
    ) {

        alert(
            "Выбери дату окончания задачи."
        );

        return;

    }


    if (
        endDate &&
        endDate <
        getToday()
    ) {

        alert(
            "Дата окончания не может быть раньше сегодняшнего дня."
        );

        return;

    }


    const newTask = {

        id:
            Date.now(),

        title:
            title,

        category:
            category,

        repeat:
            repeat,

        startDate:
            getToday(),

        date:
            getToday(),

        endDate:
            endDate,

        weekDays:
            weekDays,

        completions:
            {}

    };


    if (
        repeat ===
        "once"
    ) {

        newTask.completions[
            getToday()
        ] = false;

    }


    tasks.push(
        newTask
    );


    saveTasks();

    closeTaskForm();

    renderTasks();

    renderCalendar();

}


// ========================================
// РЕДАКТИРОВАНИЕ
// ========================================

function saveEditedTask(
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


    const titleInput =
        document.querySelector(
            "#task-title"
        );


    const categoryInput =
        document.querySelector(
            "#task-category"
        );


    const repeatInput =
        document.querySelector(
            "#task-repeat"
        );


    const title =
        titleInput.value.trim();


    const category =
        categoryInput.value;


    const repeat =
        repeatInput.value;


    if (
        !title
    ) {

        titleInput.classList.add(
            "input-error"
        );

        titleInput.focus();

        return;

    }


    const weekDays =
        getSelectedWeekDays(
            repeat
        );


    if (
        repeat ===
        "weekly" &&
        weekDays.length ===
        0
    ) {

        alert(
            "Выбери хотя бы один день недели."
        );

        return;

    }


    const endDate =
        getSelectedEndDate(
            repeat
        );


    if (
        repeat !==
        "once" &&
        !endDate
    ) {

        alert(
            "Выбери дату окончания задачи."
        );

        return;

    }


    if (
        endDate &&
        endDate <
        getToday()
    ) {

        alert(
            "Дата окончания не может быть раньше сегодняшнего дня."
        );

        return;

    }


    task.title =
        title;

    task.category =
        category;

    task.repeat =
        repeat;

    task.weekDays =
        weekDays;

    task.endDate =
        endDate;


    if (
        !task.completions
    ) {

        task.completions =
            {};

    }


    saveTasks();

    closeTaskForm();

    renderTasks();

    renderCalendar();

}


// ========================================
// ЗАКРЫТЬ ФОРМУ
// ========================================

function closeTaskForm() {

    const form =
        document.querySelector(
            ".task-form"
        );


    if (
        form
    ) {

        form.remove();

    }

}


// ========================================
// ОТОБРАЖЕНИЕ ЗАДАЧ
// ========================================

function renderTasks() {

    const groupsContainer =
        document.querySelector(
            "#task-groups"
        );


    const emptyState =
        document.querySelector(
            "#empty-state"
        );


    if (
        !groupsContainer ||
        !emptyState
    ) {

        return;

    }


    const today =
        getToday();


    const todayTasks =
        getTasksForDate(
            today
        );


    if (
        todayTasks.length ===
        0
    ) {

        groupsContainer.innerHTML =
            "";

        emptyState.style.display =
            "block";


        removeAddButton();


        updateDailyProgress(
            []
        );


        return;

    }


    emptyState.style.display =
        "none";


    const groupedTasks = {};


    CATEGORIES.forEach(
        category => {

            groupedTasks[
                category
            ] =
                todayTasks.filter(
                    task =>
                        task.category ===
                        category
                );

        }
    );


    let html =
        "";


    CATEGORIES.forEach(
        category => {

            const categoryTasks =
                groupedTasks[
                    category
                ];


            if (
                categoryTasks.length ===
                0
            ) {

                return;

            }


            const completed =
                categoryTasks.filter(
                    task =>
                        isTaskCompleted(
                            task,
                            today
                        )
                ).length;


            html += `

                <div
                    class="task-group"
                >

                    <div
                        class="task-group-header"
                    >

                        <div
                            class="task-group-title"
                        >
                            ${category}
                        </div>

                        <div
                            class="task-group-count"
                        >
                            ${completed}/${categoryTasks.length}
                        </div>

                    </div>


                    ${categoryTasks
                        .map(
                            task => {

                                const completed =
                                    isTaskCompleted(
                                        task,
                                        today
                                    );


                                return `

                                    <div
                                        class="task-item
                                        ${
                                            completed
                                                ? "completed"
                                                : ""
                                        }"
                                        data-id="${task.id}"
                                    >

                                        <button
                                            class="task-check"
                                            aria-label="Выполнить задачу"
                                        >
                                            ${
                                                completed
                                                    ? "✓"
                                                    : ""
                                            }
                                        </button>


                                        <div
                                            class="task-content"
                                        >

                                            <div
                                                class="task-title"
                                            >
                                                ${
                                                    escapeHTML(
                                                        task.title
                                                    )
                                                }
                                            </div>

                                        </div>


                                        <button
                                            class="edit-task"
                                            aria-label="Изменить задачу"
                                        >
                                            ⋯
                                        </button>


                                        <button
                                            class="delete-task"
                                            aria-label="Удалить задачу"
                                        >
                                            ×
                                        </button>

                                    </div>

                                `;

                            }
                        )
                        .join("")}

                </div>

            `;

        }
    );


    groupsContainer.innerHTML =
        html;


    groupsContainer
        .querySelectorAll(
            ".task-check"
        )
        .forEach(
            button =>
                button.addEventListener(
                    "click",
                    toggleTask
                )
        );


    groupsContainer
        .querySelectorAll(
            ".edit-task"
        )
        .forEach(
            button =>
                button.addEventListener(
                    "click",
                    editTask
                )
        );


    groupsContainer
        .querySelectorAll(
            ".delete-task"
        )
        .forEach(
            button =>
                button.addEventListener(
                    "click",
                    deleteTask
                )
        );


    let addButton =
        document.querySelector(
            ".add-task-button"
        );


    if (
        !addButton
    ) {

        addButton =
            document.createElement(
                "button"
            );


        addButton.className =
            "add-task-button";


        addButton.textContent =
            "+ Добавить шаг";


        document
            .querySelector(
                ".today"
            )
            .appendChild(
                addButton
            );

    }


    addButton.onclick =
        () =>
            openTaskForm();


    updateDailyProgress(
        todayTasks
    );

}


// ========================================
// УДАЛИТЬ КНОПКУ ДОБАВЛЕНИЯ
// ========================================

function removeAddButton() {

    const button =
        document.querySelector(
            ".add-task-button"
        );


    if (
        button
    ) {

        button.remove();

    }

}


// ========================================
// РЕДАКТИРОВАНИЕ
// ========================================

function editTask(
    event
) {

    const element =
        event.currentTarget.closest(
            ".task-item"
        );


    const taskId =
        Number(
            element.dataset.id
        );


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


    openTaskForm(
        task
    );

}


// ========================================
// ПРОГРЕСС ДНЯ
// ========================================

function updateDailyProgress(
    todayTasks
) {

    const today =
        getToday();


    const total =
        todayTasks.length;


    const completed =
        todayTasks.filter(
            task =>
                isTaskCompleted(
                    task,
                    today
                )
        ).length;


    const percent =
        total ===
        0
            ? 0
            : Math.round(
                (
                    completed /
                    total
                ) * 100
            );


    const text =
        document.querySelector(
            "#daily-progress-text"
        );


    const fill =
        document.querySelector(
            "#daily-progress-fill"
        );


    if (
        text
    ) {

        text.textContent =
            `${completed} из ${total}`;

    }


    if (
        fill
    ) {

        fill.style.width =
            `${percent}%`;

    }

}


// ========================================
// ВЫПОЛНЕНИЕ
// ========================================

function toggleTask(
    event
) {

    const element =
        event.currentTarget.closest(
            ".task-item"
        );


    const taskId =
        Number(
            element.dataset.id
        );


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


    const today =
        getToday();


    if (
        !task.completions
    ) {

        task.completions =
            {};

    }


    const current =
        isTaskCompleted(
            task,
            today
        );


    task.completions[
        today
    ] =
        !current;


    saveTasks();

    renderTasks();

    renderCalendar();

}


// ========================================
// УДАЛЕНИЕ
// ========================================

function deleteTask(
    event
) {

    const element =
        event.currentTarget.closest(
            ".task-item"
        );


    const taskId =
        Number(
            element.dataset.id
        );


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
// КАЛЕНДАРЬ 90 ДНЕЙ
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


    const today =
        getToday();


    for (
        let i = 0;
        i < CHALLENGE_LENGTH;
        i++
    ) {

        const date =
            addDays(
                CHALLENGE_START,
                i
            );


        const dayTasks =
            getTasksForDate(
                date
            );


        const completed =
            dayTasks.filter(
                task =>
                    isTaskCompleted(
                        task,
                        date
                    )
            ).length;


        let status =
            "empty";


        if (
            dayTasks.length > 0 &&
            completed ===
            dayTasks.length
        ) {

            status =
                "complete";

        } else if (
            completed > 0
        ) {

            status =
                "partial";

        }


        const isToday =
            date ===
            today;


        const isFuture =
            date >
            today;


        const button =
            document.createElement(
                "button"
            );


        button.className =
            `calendar-day
            ${status}
            ${isToday ? "today" : ""}
            ${isFuture ? "future" : ""}`;


        button.dataset.date =
            date;


        button.innerHTML = `

            <span
                class="calendar-day-number"
            >
                ${String(i + 1).padStart(2, "0")}
            </span>


            <span
                class="calendar-day-date"
            >
                ${formatShortDate(date)}
            </span>


            <span
                class="calendar-day-status"
            ></span>

        `;


        button.addEventListener(
            "click",
            () =>
                selectCalendarDay(
                    date
                )
        );


        calendar.appendChild(
            button
        );

    }


    selectCalendarDay(
        today
    );

}


// ========================================
// ВЫБОР ДНЯ КАЛЕНДАРЯ
// ========================================

function selectCalendarDay(
    dateString
) {

    const buttons =
        document.querySelectorAll(
            ".calendar-day"
        );


    buttons.forEach(
        button => {

            button.classList.toggle(
                "selected",
                button.dataset.date ===
                dateString
            );

        }
    );


    renderSelectedDay(
        dateString
    );

}


// ========================================
// ИНФОРМАЦИЯ О ВЫБРАННОМ ДНЕ
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


    const challengeDay =
        Math.floor(
            (
                getDateObject(
                    dateString
                ) -
                getDateObject(
                    CHALLENGE_START
                )
            ) /
            (
                1000 *
                60 *
                60 *
                24
            )
        ) + 1;


    const isToday =
        dateString ===
        getToday();


    let tasksHTML =
        "";


    if (
        dayTasks.length ===
        0
    ) {

        tasksHTML = `

            <div
                class="selected-day-empty"
            >

                ${
                    isToday
                        ? "На сегодня пока нет задач. Добавь первый шаг."
                        : "На этот день пока нет запланированных задач."
                }

            </div>

        `;

    } else {

        tasksHTML =
            dayTasks
                .map(
                    task => {

                        const done =
                            isTaskCompleted(
                                task,
                                dateString
                            );


                        return `

                            <div
                                class="selected-task
                                ${
                                    done
                                        ? "completed"
                                        : ""
                                }"
                            >

                                <span
                                    class="selected-task-check"
                                >
                                    ${
                                        done
                                            ? "✓"
                                            : ""
                                    }
                                </span>


                                <span
                                    class="selected-task-title"
                                >
                                    ${
                                        escapeHTML(
                                            task.title
                                        )
                                    }
                                </span>

                            </div>

                        `;

                    }
                )
                .join("");

    }


    container.innerHTML = `

        <div
            class="selected-day-heading"
        >

            <div>

                <div
                    class="selected-day-number"
                >
                    ДЕНЬ ${challengeDay}
                </div>


                <div
                    class="selected-day-title"
                >
                    ${
                        formatDate(
                            dateString
                        )
                    }
                </div>

            </div>


            <div
                class="selected-day-progress"
            >
                ${
                    dayTasks.length > 0
                        ? `${completed} из ${dayTasks.length}`
                        : ""
                }
            </div>

        </div>


        <div
            class="selected-day-tasks"
        >
            ${tasksHTML}
        </div>

    `;

}


// ========================================
// ЗАЩИТА HTML
// ========================================

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


// ========================================
// ЗАЩИТА АТРИБУТА
// ========================================

function escapeAttribute(
    text
) {

    return String(text)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        );

}
