// ========================================
// 90 ДНЕЙ
// Основная логика приложения
// ========================================


// ========================================
// НАСТРОЙКИ ЧЕЛЛЕНДЖА
// ========================================

// Первый день челленджа
const CHALLENGE_START = "2026-10-01";

// Продолжительность
const CHALLENGE_LENGTH = 90;


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
        new Date(CHALLENGE_START + "T00:00:00");

    const today =
        new Date(getToday() + "T00:00:00");

    const difference =
        today - start;

    const days =
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        ) + 1;

    return days;
}


// ========================================
// ПРОГРЕСС ЧЕЛЛЕНДЖА
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
        (day / CHALLENGE_LENGTH) * 100
    );
}


// ========================================
// ФОРМАТИРОВАНИЕ ДАТЫ
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
// ЗАПУСК ПРИЛОЖЕНИЯ
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateChallengeInfo();

        renderTasks();

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


    // День X

    const daysElement =
        document.querySelector(".days span:first-child");

    if (daysElement) {

        if (day < 1) {

            daysElement.textContent =
                "Старт 1 октября";

        } else if (day > 90) {

            daysElement.textContent =
                "Челлендж завершён";

        } else {

            daysElement.textContent =
                `День ${day}`;

        }
    }


    // Из 90

    const totalElement =
        document.querySelector(".days span:last-child");

    if (totalElement) {

        totalElement.textContent =
            "из 90";

    }


    // Процент

    const progressText =
        document.querySelector(
            ".progress-header span:last-child"
        );

    if (progressText) {

        progressText.textContent =
            `${progress}%`;

    }


    // Полоска

    const progressFill =
        document.querySelector(
            ".progress-fill"
        );

    if (progressFill) {

        progressFill.style.width =
            `${progress}%`;

    }


    // Дата

    const dateElement =
        document.querySelector(".date");

    if (dateElement) {

        dateElement.textContent =
            formatDate();

    }
}


// ========================================
// ОТКРЫТИЕ ФОРМЫ
// ========================================

function openTaskForm() {

    const oldForm =
        document.querySelector(".task-form");

    if (oldForm) {

        oldForm.remove();

        return;
    }


    const form =
        document.createElement("div");

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

                <option value="Духовный рост">
                    Духовный рост
                </option>

                <option value="Здоровье">
                    Здоровье
                </option>

                <option value="Развитие блога">
                    Развитие блога
                </option>

                <option value="Финансы">
                    Финансы
                </option>

            </select>


            <button class="save-task">
                Добавить шаг
            </button>

        </div>
    `;


    document.body.appendChild(form);


    // Закрыть

    form
        .querySelector(".close-form")
        .addEventListener(
            "click",
            () => form.remove()
        );


    form
        .querySelector(".form-overlay")
        .addEventListener(
            "click",
            () => form.remove()
        );


    // Сохранить

    form
        .querySelector(".save-task")
        .addEventListener(
            "click",
            addTask
        );


    // Enter

    form
        .querySelector("#task-title")
        .addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    addTask();

                }

            }
        );


    // Фокус

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


    tasks.push(newTask);

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

    const todaySection =
        document.querySelector(
            ".today"
        );

    if (!todaySection) {
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

    if (todayTasks.length === 0) {

        todaySection.innerHTML = `

            <div class="section-heading">

                <div>

                    <p class="eyebrow">
                        СЕГОДНЯ
                    </p>

                    <h2>
                        Мои шаги
                    </h2>

                </div>

                <span class="date">
                    ${formatDate()}
                </span>

            </div>


            <div class="empty-state">

                <div class="empty-number">
                    01
                </div>

                <h3>
                    Начало пути
                </h3>

                <p>
                    Здесь появятся твои задачи
                    на сегодняшний день.
                </p>

                <button class="primary-button">
                    Добавить первый шаг
                </button>

            </div>

        `;


        document
            .querySelector(".primary-button")
            .addEventListener(
                "click",
                openTaskForm
            );


        updateChallengeInfo();

        return;
    }


    // ====================================
    // ЕСТЬ ЗАДАЧИ
    // ====================================

    const completed =
        todayTasks.filter(
            task => task.completed
        ).length;


    const taskHTML =
        todayTasks
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
                        ${task.completed ? "✓" : ""}
                    </button>


                    <div class="task-content">

                        <div class="task-title">
                            ${escapeHTML(task.title)}
                        </div>

                        <div class="task-category">
                            ${task.category}
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
            .join("");


    todaySection.innerHTML = `

        <div class="section-heading">

            <div>

                <p class="eyebrow">
                    СЕГОДНЯ
                </p>

                <h2>
                    Мои шаги
                </h2>

            </div>

            <span class="date">
                ${formatDate()}
            </span>

        </div>


        <div class="task-list">

            ${taskHTML}

        </div>


        <button class="add-task-button">
            + Добавить шаг
        </button>

    `;


    // Выполнение

    document
        .querySelectorAll(".task-check")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    toggleTask
                );

            }
        );


    // Удаление

    document
        .querySelectorAll(".delete-task")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    deleteTask
                );

            }
        );


    // Добавление

    document
        .querySelector(".add-task-button")
        .addEventListener(
            "click",
            openTaskForm
        );


    updateChallengeInfo();

    updateDailyProgress(
        todayTasks
    );
}


// ========================================
// ВЫПОЛНЕНИЕ ЗАДАЧИ
// ========================================

function toggleTask(event) {

    const element =
        event.currentTarget
            .closest(".task-item");


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
        event.currentTarget
            .closest(".task-item");


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
// ПРОГРЕСС ЗА ДЕНЬ
// ========================================

function updateDailyProgress(todayTasks) {

    const total =
        todayTasks.length;


    const completed =
        todayTasks.filter(
            task => task.completed
        ).length;


    const percent =
        total === 0
            ? 0
            : Math.round(
                completed /
                total *
                100
            );


    const progressText =
        document.querySelector(
            ".progress-header span:last-child"
        );


    const progressFill =
        document.querySelector(
            ".progress-fill"
        );


    if (progressText) {

        progressText.textContent =
            `${percent}%`;

    }


    if (progressFill) {

        progressFill.style.width =
            `${percent}%`;

    }
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
