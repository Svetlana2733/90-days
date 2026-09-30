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

    if (day > CHALLENGE_LENGTH) {
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

    return getDateObject(
        dateString
    ).toLocaleDateString(
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

    return getDateObject(
        dateString
    ).toLocaleDateString(
        "ru-RU",
        {
            day: "numeric",
            month: "short"
        }
    )
        .replace(".", "");

}


// ========================================
// ПЕРИОД ЗАДАЧИ
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
        task.repeat === "once"
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
        task.repeat === "daily"
    ) {

        return true;

    }

    if (
        task.repeat === "weekly"
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
// НАВИГАЦИЯ
// ========================================

function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );

    navItems.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const pageId =
                        button.dataset.page;

                    if (!pageId) {
                        return;
                    }


                    navItems.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    document
                        .querySelectorAll(
                            ".page"
                        )
                        .forEach(
                            page => {

                                page.classList.remove(
                                    "active-page"
                                );

                            }
                        );


                    const selectedPage =
                        document.getElementById(
                            pageId
                        );

                    if (selectedPage) {

                        selectedPage.classList.add(
                            "active-page"
                        );

                    }


                    if (
                        pageId ===
                        "calendar-page"
                    ) {

                        renderCalendar();

                    }


                    window.scrollTo(
                        {
                            top: 0,
                            behavior: "smooth"
                        }
                    );

                }
            );

        }
    );

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


        weekdaysContainer.style.display =
            repeatSelect.value ===
            "weekly"
                ? "block"
                : "none";


        endDateInput.style.display =
            periodSelect.value ===
            "until-date"
                ? "block"
                : "none";

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

                if (isEditing) {

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

                if (isEditing) {

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

            if (input) {

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

    if (button) {

        button.addEventListener(
            "click",
            () =>
                openTaskForm()
        );

    }

}


// ========================================
// ВЫБРАННЫЕ ДНИ
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


    const endDate =
        getSelectedEndDate(
            repeat
        );


    if (
        repeat !== "once" &&
        !endDate
    ) {

        alert(
            "Выбери дату окончания задачи."
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


    const endDate =
        getSelectedEndDate(
            repeat
        );


    if (
        repeat !== "once" &&
        !endDate
    ) {

        alert(
            "Выбери дату окончания задачи."
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


    if (!task.completions) {

        task.completions = {};

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


    if (
        todayTasks.length === 0
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

                                const done =
                                    isTaskCompleted(
                                        task,
                                        today
                                    );


                                return `

                                    <div
                                        class="
                                            task-item
                                            ${
                                                done
                                                    ? "completed"
                                                    : ""
                                            }
                                        "
                                        data-id="${task.id}"
                                    >

                                        <button
                                            class="task-check"
                                            aria-label="Выполнить задачу"
                                        >
                                            ${
                                                done
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


    if (!addButton) {

        addButton =
            document.createElement(
                "button"
            );

        addButton.className =
            "add-task-button";

        addButton.textContent =
            "+ Добавить шаг";


        const todaySection =
            document.querySelector(
                ".today"
            );

        if (todaySection) {

            todaySection.appendChild(
                addButton
            );

        }

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

    if (button) {
        button.remove();
    }

}


// ========================================
// РЕДАКТИРОВАНИЕ ЗАДАЧИ
// ========================================

function editTask(event) {

    const element =
        event.currentTarget.closest(
            ".task-item"
        );

    if (!element) {
        return;
    }


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
// ВЫПОЛНЕНИЕ ЗАДАЧИ СЕГОДНЯ
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
                item.id ===
                taskId
        );


    if (!task) {
        return;
    }


    const today =
        getToday();


    if (!task.completions) {

        task.completions = {};

    }


    task.completions[
        today
    ] =
        !isTaskCompleted(
            task,
            today
        );


    saveTasks();

    renderTasks();

    renderCalendar();

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
                item.id ===
                taskId
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


    if (!calendar) {
        return;
    }


    calendar.innerHTML = "";


    const months = {};


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


        const dateObject =
            getDateObject(
                date
            );


        const monthKey =
            `${dateObject.getFullYear()}-${dateObject.getMonth()}`;


        if (!months[monthKey]) {

            months[monthKey] = [];

        }


        months[monthKey].push({
            date: date,
            index: i + 1
        });

    }


    Object.values(months)
        .forEach(
            monthDays => {

                const firstDate =
                    getDateObject(
                        monthDays[0].date
                    );


                const monthName =
                    firstDate.toLocaleDateString(
                        "ru-RU",
                        {
                            month: "long"
                        }
                    );


                const monthTitle =
                    monthName
                        .charAt(0)
                        .toUpperCase() +
                    monthName.slice(1);


                const monthHTML =
                    document.createElement(
                        "div"
                    );


                monthHTML.className =
                    "calendar-month";


                monthHTML.innerHTML = `

                    <div
                        class="calendar-month-title"
                    >

                        <div
                            class="calendar-month-name"
                        >
                            ${monthTitle}
                        </div>

                        <div
                            class="calendar-month-count"
                        >
                            ${monthDays.length} дней
                        </div>

                    </div>


                    <div
                        class="calendar-weekdays"
                    >

                        <div class="calendar-weekday">
                            Пн
                        </div>

                        <div class="calendar-weekday">
                            Вт
                        </div>

                        <div class="calendar-weekday">
                            Ср
                        </div>

                        <div class="calendar-weekday">
                            Чт
                        </div>

                        <div class="calendar-weekday">
                            Пт
                        </div>

                        <div class="calendar-weekday">
                            Сб
                        </div>

                        <div class="calendar-weekday">
                            Вс
                        </div>

                    </div>


                    <div
                        class="calendar-grid"
                    ></div>

                `;


                const grid =
                    monthHTML.querySelector(
                        ".calendar-grid"
                    );


                const firstDay =
                    firstDate.getDay();


                let offset =
                    firstDay - 1;


                if (offset < 0) {
                    offset = 6;
                }


                for (
                    let i = 0;
                    i < offset;
                    i++
                ) {

                    const empty =
                        document.createElement(
                            "div"
                        );

                    grid.appendChild(
                        empty
                    );

                }


                monthDays.forEach(
                    day => {

                        const dayButton =
                            createCalendarDay(
                                day
                            );

                        grid.appendChild(
                            dayButton
                        );

                    }
                );


                calendar.appendChild(
                    monthHTML
                );

            }
        );


    selectCalendarDay(
        getToday()
    );

}


// ========================================
// СОЗДАТЬ ДЕНЬ КАЛЕНДАРЯ
// ========================================

function createCalendarDay(
    day
) {

    const button =
        document.createElement(
            "button"
        );


    const date =
        day.date;


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
        getToday();


    button.type =
        "button";


    button.className =
        `calendar-day status-${status}` +
        (
            isToday
                ? " today"
                : ""
        );


    button.dataset.date =
        date;


    button.innerHTML = `

        <span
            class="calendar-day-number"
        >
            ${getDateObject(date).getDate()}
        </span>

        <span
            class="calendar-day-index"
        >
            день ${day.index}
        </span>

    `;


    button.addEventListener(
        "click",
        () =>
            selectCalendarDay(
                date
            )
    );


    return button;

}


// ========================================
// ВЫБОР ДНЯ
// ========================================

function selectCalendarDay(
    dateString
) {

    document
        .querySelectorAll(
            ".calendar-day"
        )
        .forEach(
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


    let tasksHTML = "";


    if (
        dayTasks.length === 0
    ) {

        tasksHTML = `

            <div
                class="calendar-empty"
            >
                На этот день пока нет задач.
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

                            <button
                                type="button"
                                class="
                                    calendar-task
                                    ${
                                        done
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
                                    ${
                                        escapeHTML(
                                            task.title
                                        )
                                    }
                                </span>


                                <span
                                    class="calendar-task-hint"
                                >
                                    ${
                                        done
                                            ? "отменить"
                                            : "выполнить"
                                    }
                                </span>

                            </button>

                        `;

                    }
                )
                .join("");

    }


    container.innerHTML = `

        <div
            class="selected-day-header"
        >

            <div>

                <div
                    class="selected-day-label"
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
                class="selected-day-count"
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


    container.classList.add(
        "visible"
    );


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
                            Number(
                                button.dataset.taskId
                            ),
                            button.dataset.date
                        );

                    }
                );

            }
        );

}


// ========================================
// ВЫПОЛНЕНИЕ ЗАДАЧИ В КАЛЕНДАРЕ
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


    if (!task.completions) {

        task.completions = {};

    }


    task.completions[
        dateString
    ] =
        !isTaskCompleted(
            task,
            dateString
        );


    saveTasks();


    // Обновляем календарь

    renderCalendar();


    // Снова открываем тот же день

    selectCalendarDay(
        dateString
    );

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
