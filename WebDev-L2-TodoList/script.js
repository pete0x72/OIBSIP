const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const pendingList = document.getElementById('pendingList');
const completedList = document.getElementById('completedList');
const pendingCount = document.getElementById('pendingCount');
const completedCount = document.getElementById('completedCount');
const pendingEmpty = document.getElementById('pendingEmpty');
const completedEmpty = document.getElementById('completedEmpty');

let tasks = JSON.parse(localStorage.getItem('todos')) || [];

function saveTasks() {
    localStorage.setItem('todos', JSON.stringify(tasks));
    renderTasks();
}

function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    const newTask = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toLocaleString(),
        completedAt: null
    };

    tasks.push(newTask);
    taskInput.value = '';
    saveTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
}

function toggleComplete(id) {
    tasks = tasks.map(t => {
        if (t.id === id) {
            const completed = !t.completed;
            return { ...t, completed, completedAt: completed ? new Date().toLocaleString() : null };
        }
        return t;
    });
    saveTasks();
}

function editTask(id, newText) {
    tasks = tasks.map(t => t.id === id ? { ...t, text: newText } : t);
    saveTasks();
}

function renderTasks() {
    pendingList.innerHTML = '';
    completedList.innerHTML = '';

    const pending = tasks.filter(t => !t.completed);
    const completed = tasks.filter(t => t.completed);

    pending.forEach(t => pendingList.appendChild(createTaskElement(t)));
    completed.forEach(t => completedList.appendChild(createTaskElement(t)));

    pendingCount.innerHTML = `Pending Tasks <span class="task-badge">${pending.length}</span>`;
    completedCount.innerHTML = `Completed Tasks <span class="task-badge">${completed.length}</span>`;

    pendingEmpty.classList.toggle('hidden', pending.length > 0);
    completedEmpty.classList.toggle('hidden', completed.length > 0);
}

function createTaskElement(task) {
    const li = document.createElement('li');
    
    const taskMain = document.createElement('div');
    taskMain.className = 'task-main';

    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;

    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group';

    const completeBtn = document.createElement('button');
    completeBtn.className = task.completed ? 'btn-edit' : 'btn-complete';
    completeBtn.textContent = task.completed ? 'Undo' : 'Done';
    completeBtn.onclick = () => toggleComplete(task.id);
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.textContent = 'Edit';
    
    const handleEdit = () => {
        if (textSpan.contentEditable === 'true') {
            editTask(task.id, textSpan.textContent);
            textSpan.contentEditable = 'false';
            textSpan.classList.remove('editing');
            editBtn.textContent = 'Edit';
        } else {
            textSpan.contentEditable = 'true';
            textSpan.classList.add('editing');
            textSpan.focus();
            editBtn.textContent = 'Save';
        }
    };

    editBtn.onclick = handleEdit;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteTask(task.id);

    btnGroup.append(completeBtn, editBtn, deleteBtn);
    taskMain.append(textSpan, btnGroup);
    li.appendChild(taskMain);

    const timestamp = document.createElement('div');
    timestamp.className = 'timestamp';
    const timeStr = task.completed 
        ? `Completed: ${task.completedAt}` 
        : `Added: ${task.createdAt}`;
    timestamp.textContent = timeStr;
    li.appendChild(timestamp);

    return li;
}

addTaskBtn.onclick = addTask;
taskInput.onkeypress = (e) => { if (e.key === 'Enter') addTask(); };

renderTasks();
