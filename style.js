// User authentication state
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// DOM elements
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const authMessage = document.getElementById('auth-message');
const logoutBtn = document.getElementById('logout-btn');
const greeting = document.getElementById('greeting');
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const charCounter = document.getElementById('char-counter');
const todoList = document.getElementById('todo-list');
const clearCompleted = document.getElementById('clear-completed');
const filterTabs = document.querySelectorAll('.filter-tab');
const progressText = document.getElementById('progress-text');
const progressRing = document.getElementById('progress-ring');

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
  const loggedInUser = localStorage.getItem('currentUser');
  if (loggedInUser) {
    currentUser = JSON.parse(loggedInUser);
    showApp();
  } else {
    authContainer.classList.remove('hidden');
  }

  // Set up progress ring
  const radius = progressRing.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;
  progressRing.style.strokeDasharray = ${circumference} ${circumference};
  progressRing.style.strokeDashoffset = circumference;
});

// Auth tab switching
loginTab.addEventListener('click', () => {
  loginTab.classList.add('text-indigo-600', 'border-indigo-600');
  loginTab.classList.remove('text-gray-500');
  registerTab.classList.add('text-gray-500');
  registerTab.classList.remove('text-indigo-600', 'border-indigo-600');
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
  authMessage.textContent = '';
});

registerTab.addEventListener('click', () => {
  registerTab.classList.add('text-indigo-600', 'border-indigo-600');
  registerTab.classList.remove('text-gray-500');
  loginTab.classList.add('text-gray-500');
  loginTab.classList.remove('text-indigo-600', 'border-indigo-600');
  registerForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
  authMessage.textContent = '';
});

// Login form submission
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showApp();
  } else {
    authMessage.textContent = 'Invalid email or password';
    authMessage.className = 'mt-4 text-center text-sm text-red-600';
  }
});

// Register form submission
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  if (users.some(u => u.email === email)) {
    authMessage.textContent = 'Email already registered';
    authMessage.className = 'mt-4 text-center text-sm text-red-600';
    return;
  }

  const newUser = { id: Date.now().toString(), name, email, password };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  authMessage.textContent = 'Registration successful! Please sign in.';
  authMessage.className = 'mt-4 text-center text-sm text-green-600';

  // Switch to login tab
  loginTab.click();
  document.getElementById('login-email').value = email;
  document.getElementById('login-password').value = '';
});

// Logout
logoutBtn.addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem('currentUser');
  authContainer.classList.remove('hidden');
  appContainer.classList.add('hidden');
  loginForm.reset();
  registerForm.reset();
  authMessage.textContent = '';
  loginTab.click();
});

// Show app after login
function showApp() {
  authContainer.classList.add('hidden');
  appContainer.classList.remove('hidden');
  greeting.textContent = Welcome back, ${currentUser.name.split(' ')[0]}!;
  updateProgress();
  renderTasks();
}

// Character counter for task input
todoInput.addEventListener('input', () => {
  const remaining = 100 - todoInput.value.length;
  charCounter.textContent = remaining;
  charCounter.className = remaining < 10 ?
    'absolute right-2 bottom-2 text-xs text-red-500' :
    'absolute right-2 bottom-2 text-xs text-gray-500';
});

// Add new task
todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!todoInput.value.trim()) return;

  const newTask = {
    id: Date.now().toString(),
    userId: currentUser.id,
    text: todoInput.value.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  localStorage.setItem('tasks', JSON.stringify(tasks));

  todoInput.value = '';
  charCounter.textContent = '100';
  charCounter.className = 'absolute right-2 bottom-2 text-xs text-gray-500';

  renderTasks();
  updateProgress();

  // Focus input again for quick adding
  todoInput.focus();
});

// Render tasks based on filter
function renderTasks(filter = 'all') {
  const userTasks = tasks.filter(task => task.userId === currentUser.id);
  let filteredTasks = userTasks;

  if (filter === 'active') {
    filteredTasks = userTasks.filter(task => !task.completed);
  } else if (filter === 'completed') {
    filteredTasks = userTasks.filter(task => task.completed);
  }

  todoList.innerHTML = '';

  if (filteredTasks.length === 0) {
    const emptyState = document.createElement('li');
    emptyState.className = 'p-6 text-center text-gray-500';
    emptyState.textContent = filter === 'all' ? 'No tasks yet. Add one above!' :
                            filter === 'active' ? 'No active tasks!' : 'No completed tasks!';
    todoList.appendChild(emptyState);
    return;
  }

  filteredTasks.forEach((task, index) => {
    const taskItem = document.createElement('li');
    taskItem.className = p-4 group hover:bg-gray-50 fade-in task-item;
    taskItem.dataset.id = task.id;

    taskItem.innerHTML = `
      <div class="flex items-center">
        <button class="complete-btn mr-3 w-6 h-6 rounded-full border-2 ${task.completed ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-300'} flex items-center justify-center">
          ${task.completed ? '<i class="fas fa-check text-xs"></i>' : ''}
        </button>
        <span class="${task.completed ? 'line-through text-gray-400' : 'text-gray-800'} flex-1">${task.text}</span>
        <div class="task-actions opacity-0 group-hover:opacity-100 transition duration-200">
          <button class="edit-btn p-1 text-gray-400 hover:text-indigo-600">
            <i class="fas fa-pencil-alt"></i>
          </button>
          <button class="delete-btn p-1 text-gray-400 hover:text-red-600 ml-1">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    `;

    todoList.appendChild(taskItem);

    // Add event listeners to the buttons
    const completeBtn = taskItem.querySelector('.complete-btn');
    const editBtn = taskItem.querySelector('.edit-btn');
    const deleteBtn = taskItem.querySelector('.delete-btn');

    completeBtn.addEventListener('click', () => toggleComplete(task.id));
    editBtn.addEventListener('click', () => editTask(task.id));
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
  });

  // Update task count
  const activeCount = userTasks.filter(t => !t.completed).length;
  const completedCount = userTasks.filter(t => t.completed).length;
  document.getElementById('task-count').textContent =
    ${activeCount} ${activeCount === 1 ? 'task' : 'tasks'} left, ${completedCount} completed;
}

// Toggle task completion
function toggleComplete(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks(document.querySelector('.filter-tab.text-indigo-600').dataset.filter);
    updateProgress();
  }
}

// Edit task
function editTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const taskItem = document.querySelector(li[data-id="${taskId}"]);
  taskItem.innerHTML = `
    <div class="flex items-center">
      <input type="text" value="${task.text}" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mr-2">
      <button class="save-edit bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200">
        Save
      </button>
      <button class="cancel-edit bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-200 ml-2">
        Cancel
      </button>
    </div>
  `;

  const saveBtn = taskItem.querySelector('.save-edit');
  const cancelBtn = taskItem.querySelector('.cancel-edit');
  const input = taskItem.querySelector('input');

  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);

  saveBtn.addEventListener('click', () => {
    const newText = input.value.trim();
    if (newText) {
      task.text = newText;
      localStorage.setItem('tasks', JSON.stringify(tasks));
      renderTasks(document.querySelector('.filter-tab.text-indigo-600').dataset.filter);
    }
  });

  cancelBtn.addEventListener('click', () => {
    renderTasks(document.querySelector('.filter-tab.text-indigo-600').dataset.filter);
  });

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveBtn.click();
    }
  });
}

// Delete task
function deleteTask(taskId) {
  if (confirm('Are you sure you want to delete this task?')) {
    tasks = tasks.filter(t => t.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks(document.querySelector('.filter-tab.text-indigo-600').dataset.filter);
    updateProgress();
  }
}

// Clear completed tasks
clearCompleted.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all completed tasks?')) {
    tasks = tasks.filter(t => !t.completed || t.userId !== currentUser.id);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks(document.querySelector('.filter-tab.text-indigo-600').dataset.filter);
    updateProgress();
  }
});

// Filter tasks
filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    filterTabs.forEach(t => {
      t.classList.remove('text-indigo-600', 'border-indigo-600');
      t.classList.add('text-gray-500');
    });
    tab.classList.add('text-indigo-600', 'border-indigo-600');
    tab.classList.remove('text-gray-500');
    renderTasks(tab.dataset.filter);
  });
});

// Update progress
function updateProgress() {
  const userTasks = tasks.filter(task => task.userId === currentUser.id);
  if (userTasks.length === 0) {
    progressText.textContent = '0%';
    setProgress(0);
    return;
  }

  const completedCount = userTasks.filter(t => t.completed).length;
  const percentage = Math.round((completedCount / userTasks.length) * 100);
  progressText.textContent = ${percentage}%;
  setProgress(percentage);
}

// Set progress ring
function setProgress(percent) {
  const radius = progressRing.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;
  progressRing.style.strokeDashoffset = offset;
}