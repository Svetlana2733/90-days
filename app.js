// ========================================
// 90 ДНЕЙ
// ОСНОВНАЯ ЛОГИКА
// ========================================


// ========================================
// НАСТРОЙКИ
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
// ДЕНЬ ЧЕЛЛЕНДЖА
// ========================================

function getChallengeDay() {

    const start =
        new Date(
            CHALLENGE_START +
            "T00:00:00"
        );

    const today =
        new Date(
            getToday() +
            "T00:00:00"
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

function formatDate() {

    const date =
        new Date();

    return date.toLocaleDateString(
        "ru-RU",
        {
            day: "numeric",
            month: "long"
        }
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


    // День

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


    // Процент

    const progressText =
        document.querySelector(
            "#challenge-progress"
        );

    if (progressText) {

        progressText.textContent =
            `${progress}%`;

    }


    // Полоса

    const progressFill =
        document.querySelector(
            "#challenge-progress-fill"
        );

    if (progressFill) {

        progressFill.style.width =
            `${progress}%`;

    }


    // Дата

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
// ФОРМА ДОБАВЛЕНИЯ
// ========================================

function openTaskForm() {

    const oldForm =
        document.querySelector(
            ".task-form"
        );

    if (oldForm) {

        oldForm.remove();

        return;

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
                Что ты хочешь сделать сегодня?
            </h2>


            <label for="task-title">
                Задача
            </label>


            <input
                type="text"
                id="task-title"
                placeholder="Например: пройти 6 000 шагов"
                autocomplete="off"
            >


            <label for="task-category">
                Сфера
            </label>


            <select id="task-category">

                ${CATEGORIES.map(
                    category =>
                        `
                        <option value="${category}">
                            ${category}
                        </option>
                        `
                ).join("")}

            </select>


            <button class="save-task">
                Добавить шаг
            </button>


        </div>

    `;


    document.body.appendChild(
        form
    );


    // Закрытие

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


    // Сохранение

    form
        .querySelector(
            ".save-task"
        )
        .addEventListener(
            "click",
            addTask
        );


    // Enter

    form
        .querySelector(
            "#task-title"
        )
        .addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

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

            }

        },
        100
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

    if (button) {

        button.addEventListener(
            "click",
            openTaskForm
        );

    }

}


// ========================================
// ДОБАВЛЕНИЕ ЗАДАЧИ
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


    if (!titleInput) {
        return;
    }


    const title =
        titleInput.value.trim();


    const category =
        categoryInput.value;


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


    const newTask = {

        id: Date.now(),

        title: title,

        category: category,

        completed: false,

        date: getToday()

    };


    tasks.push(
        newTask
    );


    saveTasks();


    const form =
        document.querySelector(
            ".task-form"
        );


    if (form) {

        form.remove();

    }


    renderTasks();

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


    const todayTasks =
        tasks.filter(
            task =>
                task.date === getToday()
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


    // ====================================
    // ЕСТЬ ЗАДАЧИ
    // ====================================

    emptyState.style.display =
        "none";


    const groupedTasks = {};


    CATEGORIES.forEach(
        category => {

            groupedTasks[category] =
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
                groupedTasks[category];


            if (
                categoryTasks.length === 0
            ) {

                return;

            }


            const completed =
                categoryTasks.filter(
                    task =>
                        task.completed
                ).length;


            html += `

                <div
                    class="task-group"
                    data-category="${category}"
                >

                    <div class="task-group-header">

                        <div class="task-group-title">
                            ${category}
                        </div>

                        <div class="task-group-count">
                            ${completed}/${categoryTasks.length}
                        </div>

                    </div>


                    ${categoryTasks
                        .map(
                            task => `

                                <div
                                    class="task-item
                                    ${task.completed ? "completed" : ""}"
                                    data-id="${task.id}"
                                >


                                    <button
                                        class="task-check"
                                        aria-label="Выполнить задачу"
                                    >
                                        ${
                                            task.completed
                                                ? "✓"
                                                : ""
                                        }
                                    </button>


                                    <div class="task-content">

                                        <div class="task-title">
                                            ${escapeHTML(
                                                task.title
                                            )}
                                        </div>

                                    </div>


                                    <button
                                        class="delete-task"
                                        aria-label="Удалить задачу"
                                    >
                                        ×
                                    </button>


                                </div>

                            `
                        )
                        .join("")}


                </div>

            `;

        }
    );


    groupsContainer.innerHTML =
        html;


    // ====================================
    // КНОПКИ ВЫПОЛНЕНИЯ
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
    // КНОПКИ УДАЛЕНИЯ
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
        openTaskForm;


    updateDailyProgress(
        todayTasks
    );

}


// ========================================
// ПРОГРЕСС СЕГОДНЯ
// ========================================

function updateDailyProgress(
    todayTasks
) {

    const total =
        todayTasks.length;


    const completed =
        todayTasks.filter(
            task =>
                task.completed
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
            task =>
                task.id === taskId
        );


    if (!task) {
        return;
    }


    task.completed =
        !task.completed;


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


    tasks =
        tasks.filter(
            task =>
                task.id !== taskId
        );


    saveTasks();


    renderTasks();

}


// ========================================
// ЗАЩИТА ТЕКСТА
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
