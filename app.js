// ========================================
// 90 ДНЕЙ
// ОСНОВНАЯ ЛОГИКА
// ========================================

const CHALLENGE_START = "2026-10-01";
const CHALLENGE_LENGTH = 90;


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
        today - start;

    return (
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
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

    if (day > CHALLENGE_LENGTH) {
        return 100;
    }

    return Math.round(
        (day /
        CHALLENGE_LENGTH) *
        100
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
// ПОКАЗЫВАТЬ ЛИ ЗАДАЧУ В ЭТОТ ДЕНЬ
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


    // Каждый день

    if (
        task.repeat === "daily"
    ) {

        return (
            dateString >=
            task.startDate
        );

    }


    // Выбранные дни

    if (
        task.repeat === "weekly"
    ) {

        if (
            dateString <
            task.startDate
        ) {

            return false;

        }

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


    // Поддержка старых задач

    if (
        task.date === dateString
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
            day > CHALLENGE_LENGTH
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
// ФОРМА
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
                ${isEditing
                    ? "РЕДАКТИРОВАНИЕ"
                    : "НОВЫЙ ШАГ"}
            </p>


            <h2>
                ${isEditing
                    ? "Измени свой шаг"
                    : "Что ты хочешь делать?"}
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

                ${CATEGORIES.map(
                    category =>
                        `
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
                ).join("")}

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


    // ====================================
    // ЗАКРЫТИЕ
    // ====================================

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


    // ====================================
    // ПОВТОРЕНИЕ
    // ====================================

    const repeatSelect =
        form.querySelector(
            "#task-repeat"
        );


    const weekdaysContainer =
        form.querySelector(
            "#weekdays-container"
        );


    repeatSelect.addEventListener(
        "change",
        () => {

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
    );


    // ====================================
    // СОХРАНЕНИЕ
    // ====================================

    form
        .querySelector(
            ".save-task"
        )
        .addEventListener(
            "click",
            () => {

                if (isEditing) {

                    saveEditedTask(
                        taskToEdit.id
                    );

                } else {

                    addTask();

                }

            }
        );


    // ====================================
    // ENTER
    // ====================================

    form
        .querySelector(
            "#task-title"
        )
        .addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    if (isEditing) {

                        saveEditedTask(
                            taskToEdit.id
                        );

                    } else {

                        addTask();

                    }

                }

            }
        );


    setTimeout(
        () => {

            const input =
                document.querySelector(
                    "#task-title"
                );

            if (input) {

                input.focus();

                input.select();

            }

        },
        100
    );

}


// ========================================
// ДНИ НЕДЕЛИ В ФОРМЕ
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

                    <label class="weekday">

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


    if (button) {

        button.addEventListener(
            "click",
            () => openTaskForm()
        );

    }

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


    if (!title) {

        titleInput.classList.add(
            "input-error"
        );

        titleInput.focus();


        setTimeout(
            () => {

                titleInput.classList.remove(
                    "input-error"
                );

            },
            700
        );


        return;

    }


    const weekDays =
        getSelectedWeekDays(
            repeat
        );


    if (
        repeat === "weekly" &&
        weekDays.length === 0
    ) {

        alert(
            "Выбери хотя бы один день недели."
        );

        return;

    }


    const newTask = {

        id: Date.now(),

        title: title,

        category: category,

        repeat: repeat,

        startDate: getToday(),

        date: getToday(),

        weekDays: weekDays,

        completions: {}

    };


    if (
        repeat === "once"
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

}


// ========================================
// ВЫБРАННЫЕ ДНИ
// ========================================

function getSelectedWeekDays(
    repeat
) {

    if (
        repeat !== "weekly"
    ) {

        return [];

    }


    return Array.from(
        document.querySelectorAll(
            "#weekdays-container input:checked"
        )
    ).map(
        input =>
            Number(
                input.value
            )
    );

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
                item.id === taskId
        );


    if (!task) {

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


    if (!title) {

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
        repeat === "weekly" &&
        weekDays.length === 0
    ) {

        alert(
            "Выбери хотя бы один день недели."
        );

        return;

    }


    // ====================================
    // Сохраняем старые выполнения
    // ====================================

    const oldCompletions =
        task.completions || {};


    task.title =
        title;


    task.category =
        category;


    task.repeat =
        repeat;


    task.weekDays =
        weekDays;


    task.completions =
        oldCompletions;


    // Если меняем на одноразовую

    if (
        repeat === "once"
    ) {

        task.date =
            task.date || getToday();

    }


    // Если меняем на повторяющуюся

    if (
        repeat === "daily" ||
        repeat === "weekly"
    ) {

        task.startDate =
            task.startDate ||
            getToday();

    }


    saveTasks();


    closeTaskForm();

    renderTasks();

}


// ========================================
// ЗАКРЫТЬ ФОРМУ
// ========================================

function closeTaskForm() {

    const form =
        document.querySelector(
            ".task-form"
        );


    if (form) {

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


    // ====================================
    // НЕТ ЗАДАЧ
    // ====================================

    if (
        todayTasks.length === 0
    ) {

        groupsContainer.innerHTML =
            "";

        emptyState.style.display =
            "block";


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


    let html = "";


    CATEGORIES.forEach(
        category => {

            const categoryTasks =
                groupedTasks[
                    category
                ];


            if (
                categoryTasks.length === 0
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
                    data-category="${category}"
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
                                        ${completed ? "completed" : ""}"
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
                                                ${escapeHTML(
                                                    task.title
                                                )}
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


    // ====================================
    // ВЫПОЛНЕНИЕ
    // ====================================

    groupsContainer
        .querySelectorAll(
            ".task-check"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    toggleTask
                );

            }
        );


    // ====================================
    // РЕДАКТИРОВАНИЕ
    // ====================================

    groupsContainer
        .querySelectorAll(
            ".edit-task"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    editTask
                );

            }
        );


    // ====================================
    // УДАЛЕНИЕ
    // ====================================

    groupsContainer
        .querySelectorAll(
            ".delete-task"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    deleteTask
                );

            }
        );


    // ====================================
    // КНОПКА ДОБАВЛЕНИЯ
    // ====================================

    let addButton =
        document.querySelector(
            ".add-task-button"
        );


    if (!addButton) {

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
        () => openTaskForm();


    updateDailyProgress(
        todayTasks
    );

}


// ========================================
// ОТКРЫТЬ РЕДАКТИРОВАНИЕ
// ========================================

function editTask(event) {

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
                item.id === taskId
        );


    if (!task) {

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
        total === 0
            ? 0
            : Math.round(
                completed /
                total *
                100
            );


    const text =
        document.querySelector(
            "#daily-progress-text"
        );


    const fill =
        document.querySelector(
            "#daily-progress-fill"
        );


    if (text) {

        text.textContent =
            `${completed} из ${total}`;

    }


    if (fill) {

        fill.style.width =
            `${percent}%`;

    }

}


// ========================================
// ВЫПОЛНЕНИЕ
// ========================================

function toggleTask(event) {

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
                item.id === taskId
        );


    if (!task) {

        return;

    }


    const today =
        getToday();


    if (!task.completions) {

        task.completions = {};

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

}


// ========================================
// УДАЛЕНИЕ
// ========================================

function deleteTask(event) {

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
                item.id === taskId
        );


    if (!task) {

        return;

    }


    const confirmed =
        confirm(
            `Удалить задачу «${task.title}»?`
        );


    if (!confirmed) {

        return;

    }


    tasks =
        tasks.filter(
            item =>
                item.id !== taskId
        );


    saveTasks();


    renderTasks();

}


// ========================================
// ЗАЩИТА HTML
// ========================================

function escapeHTML(text) {

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

function escapeAttribute(text) {

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
