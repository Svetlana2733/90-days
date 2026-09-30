// ========================================
// 90 ДНЕЙ — ОСНОВНАЯ ЛОГИКА
// ========================================

// Получаем задачи из памяти браузера
let tasks = JSON.parse(localStorage.getItem("90days_tasks")) || [];


// ========================================
// СОХРАНЕНИЕ
// ========================================

function saveTasks() {
    localStorage.setItem("90days_tasks", JSON.stringify(tasks));
}


// ========================================
// ОТКРЫТИЕ ФОРМЫ
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    const addButton = document.querySelector(".primary-button");

    addButton.addEventListener("click", openTaskForm);

    renderTasks();
});


// ========================================
// ФОРМА НОВОЙ ЗАДАЧИ
// ========================================

function openTaskForm() {

    const existingForm = document.querySelector(".task-form");

    if (existingForm) {
        existingForm.remove();
        return;
    }

    const form = document.createElement("div");

    form.className = "task-form";

    form.innerHTML = `
        <div class="form-overlay"></div>

        <div class="form-window">

            <button class="close-form">×</button>

            <p class="eyebrow">НОВЫЙ ШАГ</p>

            <h2>Что ты хочешь сделать сегодня?</h2>

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


    // Закрытие

    form.querySelector(".close-form")
        .addEventListener("click", () => {
            form.remove();
        });


    form.querySelector(".form-overlay")
        .addEventListener("click", () => {
            form.remove();
        });


    // Сохранение

    form.querySelector(".save-task")
        .addEventListener("click", addTask);


    // Enter тоже добавляет задачу

    form.querySelector("#task-title")
        .addEventListener("keydown", (event) => {

            if (event.key === "Enter") {
                addTask();
            }

        });


    // Сразу ставим курсор

    setTimeout(() => {
        document.querySelector("#task-title").focus();
    }, 100);
}


// ========================================
// ДОБАВЛЕНИЕ ЗАДАЧИ
// ========================================

function addTask() {

    const titleInput = document.querySelector("#task-title");
    const categoryInput = document.querySelector("#task-category");

    const title = titleInput.value.trim();
    const category = categoryInput.value;

    if (!title) {

        titleInput.focus();

        titleInput.classList.add("input-error");

        setTimeout(() => {
            titleInput.classList.remove("input-error");
        }, 700);

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

    document.querySelector(".task-form").remove();

    renderTasks();
}


// ========================================
// ОТОБРАЖЕНИЕ ЗАДАЧ
// ========================================

function renderTasks() {

    const todaySection = document.querySelector(".today");

    if (!todaySection) return;


    const todayTasks = tasks.filter(task =>
        task.date === getToday()
    );


    // Если задач пока нет

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
                    1 октября
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
            .addEventListener("click", openTaskForm);

        updateProgress();

        return;
    }


    // Если задачи есть

    const completed = todayTasks.filter(
        task => task.completed
    ).length;


    const taskHTML = todayTasks.map(task => `

        <div class="task-item ${task.completed ? "completed" : ""}"
             data-id="${task.id}">

            <button
                class="task-check"
                aria-label="Отметить задачу"
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

    `).join("");


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


    // Отметка выполнения

    document
        .querySelectorAll(".task-check")
        .forEach(button => {

            button.addEventListener(
                "click",
                toggleTask
            );

        });


    // Удаление

    document
        .querySelectorAll(".delete-task")
        .forEach(button => {

            button.addEventListener(
                "click",
                deleteTask
            );

        });


    // Добавление новой

    document
        .querySelector(".add-task-button")
        .addEventListener(
            "click",
            openTaskForm
        );


    updateProgress();
}


// ========================================
// ВЫПОЛНЕНИЕ ЗАДАЧИ
// ========================================

function toggleTask(event) {

    const taskElement =
        event.currentTarget.closest(".task-item");

    const taskId =
        Number(taskElement.dataset.id);


    const task = tasks.find(
        task => task.id === taskId
    );


    if (!task) return;


    task.completed = !task.completed;

    saveTasks();

    renderTasks();
}


// ========================================
// УДАЛЕНИЕ ЗАДАЧИ
// ========================================

function deleteTask(event) {

    const taskElement =
        event.currentTarget.closest(".task-item");

    const taskId =
        Number(taskElement.dataset.id);


    tasks = tasks.filter(
        task => task.id !== taskId
    );


    saveTasks();

    renderTasks();
}


// ========================================
// ПРОГРЕСС
// ========================================

function updateProgress() {

    const todayTasks = tasks.filter(
        task => task.date === getToday()
    );


    const completed =
        todayTasks.filter(
            task => task.completed
        ).length;


    const total =
        todayTasks.length;


    const percent =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
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
// ДАТА
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


function formatDate() {

    const date = new Date();


    return date.toLocaleDateString(
        "ru-RU",
        {
            day: "numeric",
            month: "long"
        }
    );
}


// ========================================
// ЗАЩИТА ОТ HTML
// ========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}
