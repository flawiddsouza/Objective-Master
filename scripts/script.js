let tasks = []

if(localStorage.getArray('Objective Master') !== null) {
    tasks = localStorage.getArray('Objective Master')
}

function commit() {
    localStorage.setArray('Objective Master', tasks)
}

let tasksProgress = document.getElementById('tasks-progress')

let activeTasksSection = document.getElementById('active-tasks')
let pausedTasksSection = document.getElementById('paused-tasks')
let completedTasksSection = document.getElementById('completed-tasks')
let failedTasksSection = document.getElementById('failed-tasks')

function updateTasksProgress() {
    let incompleteTasks = tasks.filter(task => !task.completed && !task.failed && !task.paused)
    tasksProgress.value =  100 / (incompleteTasks.length + 1)
}

function refreshTasks() {
    if(tasks.length > 0) {
        activeTasksSection.innerHTML = tasks.reverse().map(task => {
            if(!task.completed && !task.failed && !task.paused) {
                return `
                    <div class="task">
                        <div class="task-main">
                            <div class="task-description">${task.description}</div>
                            <div class="task-date">Added: ${moment(task.addedOn).format('LLL')}</div>
                        </div>
                        <div class="task-actions">
                            <button class="task-mark-failed" data-id="${task.id}">Failed</button>
                            <button class="task-mark-paused" data-id="${task.id}">Paused</button>
                            <button class="task-mark-completed" data-id="${task.id}">Completed</button>
                            <button class="task-delete" data-id="${task.id}">Delete</button>
                        </div>
                    </div>`
            }
        }).join('')

        pausedTasksSection.innerHTML = tasks.reverse().map(task => {
            if(task.paused) {
                return `
                    <div class="task">
                        <div class="task-main">
                            <div class="task-description">${task.description}</div>
                            <div class="task-date">Added: ${moment(task.addedOn).format('LLL')}</div>
                        </div>
                        <div class="task-actions">
                            <button class="task-mark-active" data-id="${task.id}">Active</button>
                            <button class="task-delete" data-id="${task.id}">Delete</button>
                        </div>
                    </div>`
            }
        }).join('')

        completedTasksSection.innerHTML = tasks.reverse().map(task => {
            if(task.completed) {
                return `
                    <div class="task">
                        <div class="task-main">
                            <div class="task-description">${task.description}</div>
                            <div class="task-date">Added: ${moment(task.addedOn).format('LLL')}</div>
                            <div class="task-date">Ended: ${moment(task.endedOn).format('LLL')}</div>
                        </div>
                        <div class="task-actions">
                            <button class="task-delete" data-id="${task.id}">Delete</button>
                        </div>
                    </div>`
            }
        }).join('')

        failedTasksSection.innerHTML = tasks.reverse().map(task => {
            if(task.failed) {
                return `
                    <div class="task">
                        <div class="task-main">
                            <div class="task-description">${task.description}</div>
                            <div class="task-date">Added: ${moment(task.addedOn).format('LLL')}</div>
                            <div class="task-date">Ended: ${moment(task.endedOn).format('LLL')}</div>
                        </div>
                        <div class="task-actions">
                            <button class="task-delete" data-id="${task.id}">Delete</button>
                        </div>
                    </div>`
            }
        }).join('')
    } else {
        activeTasksSection.innerHTML = `<div class="task">Zero</div>`
        pausedTasksSection.innerHTML = `<div class="task">Zero</div>`
        completedTasksSection.innerHTML = `<div class="task">Zero</div>`
        failedTasksSection.innerHTML = `<div class="task">Zero</div>`
    }

    checkEmptyAndFillElement(activeTasksSection)
    checkEmptyAndFillElement(pausedTasksSection)
    checkEmptyAndFillElement(completedTasksSection)
    checkEmptyAndFillElement(failedTasksSection)

    updateTasksProgress()
}

refreshTasks()

let addNewItemInput = document.getElementById('add-item-input')
let addNewItemBtn = document.getElementById('add-item-button')

addNewItemBtn.addEventListener('click', e => {
    if(addNewItemInput.value != '') {
        tasks.push({
            id: generateUUID(),
            description: addNewItemInput.value,
            addedOn: new Date().getTime(),
            paused: false,
            completed: false,
            failed: false
        })
        commit()
        refreshTasks()
        addNewItemInput.value = ''
    }
})

addNewItemInput.addEventListener("keyup", e => {
    e.preventDefault()
    if(e.key == 'Enter') {
        addNewItemBtn.click()
    }
})

window.addEventListener('click', e => {
    let target = e.target

    if(target.classList.contains('task-mark-failed')) {
        let task = tasks.find(task => task.id === target.dataset.id)
        task.failed = true
        task.endedOn = new Date().getTime()
        commit()
        refreshTasks()
    }

    if(target.classList.contains('task-mark-paused')) {
        tasks.find(task => task.id === target.dataset.id).paused = true
        commit()
        refreshTasks()
    }

    if(target.classList.contains('task-mark-active')) {
        tasks.find(task => task.id === target.dataset.id).paused = false
        commit()
        refreshTasks()
    }

    if(target.classList.contains('task-mark-completed')) {
        let task = tasks.find(task => task.id === target.dataset.id)
        task.completed = true
        task.endedOn = new Date().getTime()
        commit()
        refreshTasks()
    }

    if(target.classList.contains('task-delete')) {
        if(confirm("Do you really want to delete this?")) { 
            tasks = tasks.filter(task => task.id !== target.dataset.id)
            commit()
            refreshTasks()
        }
    }
})