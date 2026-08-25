/* =========================================
   STUDYPILOT — AI STUDY PLANNER
========================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =========================================
       ELEMENTS
    ========================================== */

    const studentName =
        document.getElementById("studentName");

    const dailyHours =
        document.getElementById("dailyHours");

    const examDate =
        document.getElementById("examDate");

    const subjectsContainer =
        document.getElementById("subjectsContainer");

    const addSubjectButton =
        document.getElementById("addSubjectButton");

    const generatePlanButton =
        document.getElementById(
            "generatePlanButton"
        );

    const resetPlanButton =
        document.getElementById(
            "resetPlanButton"
        );

    const themeToggle =
        document.getElementById(
            "themeToggle"
        );

    const planContainer =
        document.getElementById(
            "planContainer"
        );

    const planTitle =
        document.getElementById(
            "planTitle"
        );

    const planSubtitle =
        document.getElementById(
            "planSubtitle"
        );

    const aiMessage =
        document.getElementById(
            "aiMessage"
        );

    const subjectCount =
        document.getElementById(
            "subjectCount"
        );

    const totalHours =
        document.getElementById(
            "totalHours"
        );

    const taskCount =
        document.getElementById(
            "taskCount"
        );

    const progressPercent =
        document.getElementById(
            "progressPercent"
        );

    const miniProgressBar =
        document.getElementById(
            "miniProgressBar"
        );

    const overallProgress =
        document.getElementById(
            "overallProgress"
        );

    const progressBar =
        document.getElementById(
            "progressBar"
        );

    const timerDisplay =
        document.getElementById(
            "timerDisplay"
        );

    const timerStart =
        document.getElementById(
            "timerStart"
        );

    const timerReset =
        document.getElementById(
            "timerReset"
        );

    const focusOptions =
        document.querySelectorAll(
            ".focus-option"
        );


    /* =========================================
       VARIABLES
    ========================================== */

    let selectedFocus = "balanced";

    let timerSeconds = 25 * 60;

    let timerInterval = null;

    let generatedTasks = [];


    /* =========================================
       DEFAULT EXAM DATE
    ========================================== */

    const today =
        new Date();

    const examDefault =
        new Date(today);

    examDefault.setDate(
        examDefault.getDate() + 30
    );

    examDate.value =
        examDefault
            .toISOString()
            .split("T")[0];


    /* =========================================
       SUBJECT MANAGEMENT
    ========================================== */

    function createSubjectRow() {

        const row =
            document.createElement("div");

        row.className =
            "subject-row";

        row.innerHTML = `

            <input
                type="text"
                class="subject-name"
                placeholder="Subject name"
            >

            <select
                class="subject-priority"
            >

                <option value="high">
                    High Priority
                </option>

                <option
                    value="medium"
                    selected
                >
                    Medium Priority
                </option>

                <option value="low">
                    Low Priority
                </option>

            </select>

            <select
                class="subject-difficulty"
            >

                <option value="hard">
                    Hard
                </option>

                <option
                    value="medium"
                    selected
                >
                    Medium
                </option>

                <option value="easy">
                    Easy
                </option>

            </select>

            <button
                type="button"
                class="remove-subject"
            >
                ×
            </button>

        `;


        subjectsContainer.appendChild(row);

        attachSubjectEvents(row);

        updateStats();

    }


    function attachSubjectEvents(row) {

        const inputs =
            row.querySelectorAll(
                "input, select"
            );

        inputs.forEach(input => {

            input.addEventListener(
                "input",
                updateStats
            );

            input.addEventListener(
                "change",
                updateStats
            );

        });


        const removeButton =
            row.querySelector(
                ".remove-subject"
            );


        removeButton.addEventListener(
            "click",
            () => {

                const rows =
                    document.querySelectorAll(
                        ".subject-row"
                    );

                if (rows.length === 1) {

                    row.querySelector(
                        ".subject-name"
                    ).value = "";

                } else {

                    row.remove();

                }

                updateStats();

            }
        );

    }


    document
        .querySelectorAll(".subject-row")
        .forEach(
            attachSubjectEvents
        );


    addSubjectButton.addEventListener(
        "click",
        createSubjectRow
    );


    /* =========================================
       GET SUBJECTS
    ========================================== */

    function getSubjects() {

        const rows =
            document.querySelectorAll(
                ".subject-row"
            );

        const subjects = [];

        rows.forEach(row => {

            const name =
                row.querySelector(
                    ".subject-name"
                ).value.trim();

            const priority =
                row.querySelector(
                    ".subject-priority"
                ).value;

            const difficulty =
                row.querySelector(
                    ".subject-difficulty"
                ).value;


            if (name) {

                subjects.push({
                    name,
                    priority,
                    difficulty
                });

            }

        });

        return subjects;

    }


    /* =========================================
       STATS
    ========================================== */

    function updateStats() {

        const subjects =
            getSubjects();

        const hours =
            Math.max(
                Number(
                    dailyHours.value
                ) || 0,
                0
            );


        subjectCount.textContent =
            subjects.length;


        totalHours.textContent =
            `${hours * 7}h`;


        taskCount.textContent =
            generatedTasks.length;


        updateProgress();

    }


    /* =========================================
       SUBJECT SCORE
    ========================================== */

    function getSubjectScore(subject) {

        let score = 0;


        if (subject.priority === "high") {
            score += 3;
        }

        if (subject.priority === "medium") {
            score += 2;
        }

        if (subject.priority === "low") {
            score += 1;
        }


        if (subject.difficulty === "hard") {
            score += 3;
        }

        if (subject.difficulty === "medium") {
            score += 2;
        }

        if (subject.difficulty === "easy") {
            score += 1;
        }


        if (selectedFocus === "exam") {
            score +=
                subject.priority === "high"
                    ? 3
                    : 0;
        }


        if (selectedFocus === "weak") {
            score +=
                subject.difficulty === "hard"
                    ? 3
                    : 0;
        }


        return score;

    }


    /* =========================================
       GENERATE PLAN
    ========================================== */

    function generatePlan() {

        const subjects =
            getSubjects();


        if (subjects.length === 0) {

            alert(
                "Please add at least one subject."
            );

            return;

        }


        const hours =
            Math.max(
                Number(
                    dailyHours.value
                ) || 1,
                1
            );


        const sortedSubjects =
            [...subjects].sort(
                (a, b) =>
                    getSubjectScore(b) -
                    getSubjectScore(a)
            );


        const days =
            7;


        const minutesPerDay =
            hours * 60;


        generatedTasks = [];


        for (
            let day = 0;
            day < days;
            day++
        ) {

            const dailyTasks = [];


            const taskCountForDay =
                Math.min(
                    Math.max(
                        2,
                        Math.ceil(
                            minutesPerDay / 60
                        )
                    ),
                    5
                );


            for (
                let task = 0;
                task < taskCountForDay;
                task++
            ) {

                const subject =
                    sortedSubjects[
                        (day + task) %
                        sortedSubjects.length
                    ];


                let duration = 45;


                if (
                    subject.difficulty ===
                    "hard"
                ) {
                    duration = 60;
                }

                if (
                    subject.difficulty ===
                    "easy"
                ) {
                    duration = 30;
                }


                const taskObject = {

                    id:
                        `${day}-${task}-${Date.now()}`
                        ,

                    day,

                    subject:
                        subject.name,

                    duration,

                    completed: false

                };


                dailyTasks.push(
                    taskObject
                );

                generatedTasks.push(
                    taskObject
                );

            }

        }


        renderPlan(
            dailyTasksPlaceholder()
        );


        updateStats();


        aiMessage.innerHTML = `

            <div class="ai-message-icon">
                ✦
            </div>

            <div>

                <strong>
                    Smart plan generated
                </strong>

                <p>
                    Your schedule has been balanced
                    around your priorities and study time.
                </p>

            </div>

        `;


        const name =
            studentName.value.trim();


        planTitle.textContent =
            name
                ? `${name}'s Study Plan`
                : "Your Study Plan";


        planSubtitle.textContent =
            `${hours} hour${hours === 1 ? "" : "s"} per day · 7-day schedule`;

    }


    /* =========================================
       DAILY PLACEHOLDER DATA
    ========================================== */

    function dailyTasksPlaceholder() {

        const result = [];


        for (
            let day = 0;
            day < 7;
            day++
        ) {

            result.push(
                generatedTasks.filter(
                    task =>
                        task.day === day
                )
            );

        }


        return result;

    }


    /* =========================================
       RENDER PLAN
    ========================================== */

    function renderPlan(days) {

        planContainer.innerHTML = "";


        const dayNames = [
            "Day 1",
            "Day 2",
            "Day 3",
            "Day 4",
            "Day 5",
            "Day 6",
            "Day 7"
        ];


        days.forEach(
            (tasks, dayIndex) => {

                const dayCard =
                    document.createElement(
                        "div"
                    );

                dayCard.className =
                    "day-card";


                const totalMinutes =
                    tasks.reduce(
                        (sum, task) =>
                            sum +
                            task.duration,
                        0
                    );


                dayCard.innerHTML = `

                    <div class="day-header">

                        <strong>
                            ${dayNames[dayIndex]}
                        </strong>

                        <span>
                            ${totalMinutes} min study
                        </span>

                    </div>

                `;


                tasks.forEach(task => {

                    const taskElement =
                        document.createElement(
                            "div"
                        );

                    taskElement.className =
                        "study-task";


                    taskElement.innerHTML = `

                        <button
                            type="button"
                            class="task-check"
                            data-task-id="${task.id}"
                        >
                            ${task.completed ? "✓" : ""}
                        </button>

                        <div class="task-info">

                            <strong>
                                ${escapeHTML(
                                    task.subject
                                )}
                            </strong>

                            <span>
                                Focus session
                            </span>

                        </div>

                        <span class="task-time">
                            ${task.duration} min
                        </span>

                    `;


                    if (task.completed) {

                        taskElement.classList.add(
                            "completed"
                        );

                    }


                    const check =
                        taskElement.querySelector(
                            ".task-check"
                        );


                    check.addEventListener(
                        "click",
                        () => {

                            task.completed =
                                !task.completed;

                            taskElement.classList.toggle(
                                "completed",
                                task.completed
                            );

                            check.textContent =
                                task.completed
                                    ? "✓"
                                    : "";

                            updateProgress();

                        }
                    );


                    dayCard.appendChild(
                        taskElement
                    );

                });


                planContainer.appendChild(
                    dayCard
                );

            }
        );


        updateProgress();

    }


    /* =========================================
       PROGRESS
    ========================================== */

    function updateProgress() {

        const total =
            generatedTasks.length;


        if (total === 0) {

            setProgress(0);

            taskCount.textContent = 0;

            return;

        }


        const completed =
            generatedTasks.filter(
                task => task.completed
            ).length;


        const percentage =
            Math.round(
                (completed / total) * 100
            );


        setProgress(
            percentage
        );


        taskCount.textContent =
            total;

    }


    function setProgress(value) {

        progressPercent.textContent =
            `${value}%`;

        overallProgress.textContent =
            `${value}%`;

        miniProgressBar.style.width =
            `${value}%`;

        progressBar.style.width =
            `${value}%`;

    }


    /* =========================================
       FOCUS MODE
    ========================================== */

    focusOptions.forEach(option => {

        option.addEventListener(
            "click",
            () => {

                focusOptions.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                option.classList.add(
                    "active"
                );


                selectedFocus =
                    option.dataset.focus;

            }
        );

    });


    /* =========================================
       RESET PLAN
    ========================================== */

    resetPlanButton.addEventListener(
        "click",
        () => {

            generatedTasks = [];

            planContainer.innerHTML = `

                <div class="empty-plan">

                    <div class="empty-icon">
                        ✦
                    </div>

                    <h4>
                        No study plan yet
                    </h4>

                    <p>
                        Your personalized schedule will
                        appear here.
                    </p>

                </div>

            `;


            planTitle.textContent =
                "Your Study Plan";


            planSubtitle.textContent =
                "Add your subjects and generate a plan.";


            aiMessage.innerHTML = `

                <div class="ai-message-icon">
                    ✦
                </div>

                <div>

                    <strong>
                        Ready to plan
                    </strong>

                    <p>
                        Add your subjects and let StudyPilot
                        organize your study time.
                    </p>

                </div>

            `;


            updateStats();

        }
    );


    /* =========================================
       THEME
    ========================================== */

    themeToggle.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "light-theme"
            );


            const light =
                document.body.classList.contains(
                    "light-theme"
                );


            themeToggle.textContent =
                light
                    ? "☀"
                    : "◐";

        }
    );


    /* =========================================
       POMODORO TIMER
    ========================================== */

    function updateTimerDisplay() {

        const minutes =
            Math.floor(
                timerSeconds / 60
            );

        const seconds =
            timerSeconds % 60;


        timerDisplay.textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    }


    timerStart.addEventListener(
        "click",
        () => {
if (timerInterval) {

                clearInterval(
                    timerInterval
                );

                timerInterval = null;

                timerStart.textContent =
                    "Start";

                return;

            }


            timerStart.textContent =
                "Pause";


            timerInterval =
                setInterval(
                    () => {

                        if (
                            timerSeconds <= 0
                        ) {

                            clearInterval(
                                timerInterval
                            );

                            timerInterval = null;

                            timerStart.textContent =
                                "Start";

                            alert(
                                "Focus session complete! Take a short break."
                            );

                            return;

                        }


                        timerSeconds--;

                        updateTimerDisplay();

                    },
                    1000
                );

        }
    );


    timerReset.addEventListener(
        "click",
        () => {

            clearInterval(
                timerInterval
            );

            timerInterval = null;

            timerSeconds =
                25 * 60;

            timerStart.textContent =
                "Start";

            updateTimerDisplay();

        }
    );


    /* =========================================
       ESCAPE HTML
    ========================================== */

    function escapeHTML(value) {

        const div =
            document.createElement(
                "div"
            );

        div.textContent =
            value;

        return div.innerHTML;

    }


    /* =========================================
       GENERATE BUTTON
    ========================================== */

    generatePlanButton.addEventListener(
        "click",
        generatePlan
    );


    /* =========================================
       INITIAL
    ========================================== */

    updateTimerDisplay();

    updateStats();

});
            
