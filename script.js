// DOM Elements
const timeDisplay = document.getElementById('time-display');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const modeBtns = document.querySelectorAll('.mode-btn');

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const taskCounter = document.getElementById('task-counter');

// Timer Settings (in seconds)
const TIMES = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
};

let currentMode = 'pomodoro';
let timeLeft = TIMES[currentMode];
let timerId = null;
let isRunning = false;

// State for Tasks
let tasks = JSON.parse(localStorage.getItem('focusflow_tasks')) || [];

// --- Timer Functions ---

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateDisplay() {
    timeDisplay.textContent = formatTime(timeLeft);
    document.title = `(${formatTime(timeLeft)}) FocusFlow`;
}

function switchMode(mode) {
    clearInterval(timerId);
    isRunning = false;
    currentMode = mode;
    timeLeft = TIMES[mode];

    modeBtns.forEach(btn => {
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    startBtn.innerHTML = `<i class="fa-solid fa-play"></i> Start`;
    updateDisplay();
}

function toggleTimer() {
    if (isRunning) {
        clearInterval(timerId);
        isRunning = false;
        startBtn.innerHTML = `<i class="fa-solid fa-play"></i> Start`;
    } else {
        isRunning = true;
        startBtn.innerHTML = `<i class="fa-solid fa-pause"></i> Pause`;
        timerId = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateDisplay();
            } else {
                clearInterval(timerId);
                isRunning = false;
                alert('Time is up! Great job.');
                startBtn.innerHTML = `<i class="fa-solid fa-play"></i> Start`;
            }
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(timerId);
    isRunning = false;
    timeLeft = TIMES[currentMode];
    startBtn.innerHTML = `<i class="fa-solid fa-play"></i> Start`;
    updateDisplay();
}

// --- Task Manager Functions ---

function saveTasks() {
    localStorage.setItem('focusflow_tasks', JSON.stringify(tasks));
}

function renderTasks() {
    taskList.innerHTML = '';
    
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <div class="task-content" onclick="toggleTask(${index})">
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <span>${escapeHTML(task.text)}</span>
            </div>
            <button class="delete-task" onclick="deleteTask(${index})">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
        taskList.appendChild(li);
    });

    // Update Counter
    const completedCount = tasks.filter(t => t.completed).length;
    taskCounter.textContent = `${completedCount}/${tasks.length} completed`;
}

function addTask(e) {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;

    tasks.push({ text, completed: false });
    taskInput.value = '';
    saveTasks();
    renderTasks();
}

window.toggleTask = function(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
};

window.deleteTask = function(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
};

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// --- Event Listeners ---

startBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', resetTimer);

modeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        switchMode(e.target.dataset.mode);
    });
});

taskForm.addEventListener('submit', addTask);

// Initial Setup
updateDisplay();
renderTasks();