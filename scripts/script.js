let tabs = { General: [] }

if(localStorage.getObject('Objective Master') !== null) {
    tabs = localStorage.getObject('Objective Master')
}

let settings = { 0: false, 1: false, 2: false }

if(localStorage.getObject('Objective Master Settings')) {
    settings = localStorage.getObject('Objective Master Settings')
}

let activeTab = Object.keys(tabs)[0] // make active tab == first tab

let tasks = tabs[activeTab]

let tabsSection = document.getElementById('tabs-main')

tabsSection.innerHTML = Object.keys(tabs).map(tabName => `<div class="tab" data-tab-name="${tabName}">${tabName}</div>`).join('')

tabsSection.getElementsByClassName('tab')[0].classList.add('tab-active') // mark first tab as active

tabsSection.addEventListener('click', e => {
    if(e.target.classList.contains('tab')) {
        let tab = e.target
        activeTab = tab.innerHTML
        let allTabs = Array.from(tabsSection.getElementsByClassName('tab'))
        allTabs.forEach(element => element.classList.remove('tab-active'))
        tab.classList.add('tab-active')
        tasks = tabs[activeTab]
        refreshTasks()
    }
})

let tabsContextMenu = document.getElementById('tabs-context-menu')
let tabsContextMenuEdit = document.getElementById('tabs-context-menu-edit')
let tabsContextMenuDelete = document.getElementById('tabs-context-menu-delete')

tabsSection.addEventListener('contextmenu', e => {
    let target = e.target
    if(target.classList.contains('tab')) {
        tabsContextMenu.style.left = e.pageX + "px"
        tabsContextMenu.style.top = e.pageY + "px"
        tabsContextMenuEdit.dataset.tabName = target.innerHTML
        tabsContextMenuDelete.dataset.tabName = target.innerHTML
        tabsContextMenu.style.display = "block"
        e.preventDefault()
    }
})

tabsContextMenuEdit.addEventListener('click', e => {
    let oldTabName = e.target.dataset.tabName
    let newTabName = prompt("Enter tab name", oldTabName)
    if(newTabName != null && newTabName != '') {
        if(!Object.keys(tabs).some(existingTabName => existingTabName == newTabName)) {
            tabs[newTabName] = tabs[oldTabName]
            delete tabs[oldTabName]
            localStorage.setObject('Objective Master', tabs)
            let tab = tabsSection.querySelector(`[data-tab-name="${oldTabName}"`)
            tab.innerHTML = newTabName
            tab.dataset.tabName = newTabName
            if(tab.classList.contains('tab-active')) {
                tasks = tabs[newTabName]
            }
        } else {
            alert("The tab name you've chosen already exists, please choose a unique one")
        }
    }
})

tabsContextMenuDelete.addEventListener('click', e => {
    if(Object.keys(tabs).length > 1) {
        let tabName = e.target.dataset.tabName
        if(confirm('Do you really want to delete this?')) { 
            delete tabs[tabName]
            localStorage.setObject('Objective Master', tabs)
            let tab = tabsSection.querySelector(`[data-tab-name="${tabName}"`)
            if(tab.classList.contains('tab-active')) {
                tasks = tabs[Object.keys(tabs)[0]] // make active tab == first tab
                refreshTasks()
                tabsSection.getElementsByClassName('tab')[0].classList.add('tab-active') // mark first tab as active
            }
            tab.remove()
        }
    } else {
        alert("You can't delete the last remaining tab")
    }
})

let addTabBtn = document.getElementById('add-tab')

addTabBtn.addEventListener('click', e => {
    let tabName = prompt("Enter tab name")
    if(tabName != null && tabName != '') {
        if(!Object.keys(tabs).some(existingTabName => existingTabName == tabName)) {
            tabsSection.innerHTML += `<a class="tab" data-tab-name="${tabName}">${tabName}</a>`
            tabs[tabName] = []
            localStorage.setObject('Objective Master', tabs)
        } else {
            alert("The tab name you've chosen already exists, please choose a unique one")
        }
    }
})

function commit() {
    tabs[activeTab] = tasks
    localStorage.setObject('Objective Master', tabs)
    localStorage.setItem('lastModified', new Date().getTime())
}

let tasksProgress = document.getElementById('tasks-progress')

let activeTasksSection = document.getElementById('active-tasks')
let pausedTasksSection = document.getElementById('paused-tasks')
let completedTasksSection = document.getElementById('completed-tasks')
let failedTasksSection = document.getElementById('failed-tasks')

function updateTasksProgress() {
    let activeTasks = tasks.filter(task => !task.completed && !task.failed && !task.paused).length
    let completedTasksToday = tasks.filter(task => task.completed && moment(task.endedOn).format('DMMMY') == moment().format('DMMMY')).length
    if(activeTasks != 0 && completedTasksToday != 0) {
        let avgIn100 = 100 / (activeTasks + completedTasksToday)
        tasksProgress.value = completedTasksToday * avgIn100
    } else if(activeTasks != 0 && completedTasksToday == 0) {
        tasksProgress.value = 0
    } else if(activeTasks == 0 && completedTasksToday !=0) {
        tasksProgress.value = 100
    }
}

function refreshTasks() {
    if(tasks.length > 0) {
        let settingsShowHideTaskActions = settings[0] == true ? 'style="display: none;"' : ''
        let settingsShowHideStartDate =  settings[1] == true ? 'style="display: none;"' : ''
        let settingsShowHideEndDate =  settings[2] == true ? 'style="display: none;"' : ''

        activeTasksSection.innerHTML = tasks.sort(dynamicSort('addedOn')).map(task => {
            if(!task.completed && !task.failed && !task.paused) {
                return `
                    <div class="task">
                        <div class="task-main">
                            <div class="task-date" ${settingsShowHideStartDate}>Added: ${moment(task.addedOn).format('LLL')}</div>
                            <div class="task-description">${task.description}</div>
                        </div>
                        <div class="task-actions" ${settingsShowHideTaskActions}>
                            <button class="task-mark-failed" data-id="${task.id}">Failed</button>
                            <button class="task-mark-paused" data-id="${task.id}">Paused</button>
                            <button class="task-mark-completed" data-id="${task.id}">Completed</button>
                            <button class="task-delete" data-id="${task.id}">Delete</button>
                        </div>
                    </div>`
            }
        }).join('')

        pausedTasksSection.innerHTML = tasks.sort(dynamicSort('addedOn')).map(task => {
            if(task.paused) {
                return `
                    <div class="task">
                        <div class="task-main">
                            <div class="task-date" ${settingsShowHideStartDate}>Added: ${moment(task.addedOn).format('LLL')}</div>
                            <div class="task-description">${task.description}</div>
                        </div>
                        <div class="task-actions" ${settingsShowHideTaskActions}>
                            <button class="task-mark-active" data-id="${task.id}">Active</button>
                            <button class="task-delete" data-id="${task.id}">Delete</button>
                        </div>
                    </div>`
            }
        }).join('')

        completedTasksSection.innerHTML = tasks.sort(dynamicSort('endedOn')).reverse().map(task => {
            if(task.completed) {
                return `
                    <div class="task">
                        <div class="task-main">
                            <div class="task-date" ${settingsShowHideStartDate}>Added: ${moment(task.addedOn).format('LLL')}</div>
                            <div class="task-description">${task.description}</div>
                            <div class="task-date-2" ${settingsShowHideEndDate}>Ended: ${moment(task.endedOn).format('LLL')}</div>
                        </div>
                        <div class="task-actions" ${settingsShowHideTaskActions}>
                            <button class="task-delete" data-id="${task.id}">Delete</button>
                        </div>
                    </div>`
            }
        }).join('')

        failedTasksSection.innerHTML = tasks.sort(dynamicSort('endedOn')).reverse().map(task => {
            if(task.failed) {
                return `
                    <div class="task">
                        <div class="task-main">
                            <div class="task-date" ${settingsShowHideStartDate}>Added: ${moment(task.addedOn).format('LLL')}</div>
                            <div class="task-description">${task.description}</div>
                            <div class="task-date-2" ${settingsShowHideEndDate}>Ended: ${moment(task.endedOn).format('LLL')}</div>
                        </div>
                        <div class="task-actions" ${settingsShowHideTaskActions}>
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

    if(target != tabsContextMenu) {
        tabsContextMenu.style.display = 'none'
    }

    if(target.classList.contains('modal-close')) {
        target.parentElement.style.display = 'none'
    }

    if(target.classList.contains('modal')) {
        target.style.display = 'none'
    }
})

let settingsBtn = document.getElementById('settings')
let settingsModal = document.getElementById('settingsModal')

settingsBtn.addEventListener('click', e => settingsModal.style.display = 'block')

bindInputElementsToLocalStorageObject('Objective Master Settings', '#settingsModal')

window.addEventListener('LocalStorageUpdated', e => {
    settings = localStorage.getObject('Objective Master Settings')
    refreshTasks()
})

if(localStorage.getItem('lastModified') == null) {
    localStorage.setItem('lastModified', 0)
}

let connectionAttempts = 1

function testSocket(server, callback) {
    try {
        let socket = new WebSocket(server)
        socket.onopen = e => {
            socket.close()
            callback(true) // "Can connect to server"
        }
        socket.onerror = e => {
            callback(false) // "Can't connect to server"
        }
    } catch(e) {
        callback(false)
    }
}

function startSync(server, username, appName, callback) {
    let socket = new WebSocket(server)

    let syncTimer

    socket.addEventListener('open', e => {
        callback('connected')
        connectionAttempts = 1
        syncTimer = setInterval(() => {
            socket.send(JSON.stringify({
                'type': 'status_check',
                'username': username,
                'appName': appName,
                'lastModified': localStorage.getItem('lastModified')
            }))
        }, 5000)
    })

    socket.addEventListener('message', e => {
        let receivedMessage = JSON.parse(e.data)
        switch(receivedMessage['message']) {
            case 'data in sync':
                // console.log('data in sync')
                break
            case 'server data needs sync':
                // console.log('data needs sync')
                localStorage.setItem('lastModified', new Date().getTime())
                socket.send(JSON.stringify({
                    'type': 'server_sync',
                    'username': username,
                    'appName': appName,
                    'json': localStorage.getItem('Objective Master'),
                    'lastModified': localStorage.getItem('lastModified')
                }))
                break
            case 'client data needs sync':
                socket.send(JSON.stringify({
                    'type': 'client_sync',
                    'username': username,
                    'appName': appName,
                }))
                break
            case 'client sync':
                console.log("Start Client Sync")
                localStorage.setObject('Objective Master', JSON.parse(receivedMessage['json']))
                localStorage.setItem('lastModified', new Date().getTime())
                console.log("End Client Sync")
                location.reload() // since we have no way to refresh tabs as of yet
                break
        }
    })

    socket.addEventListener('close', e => {
        callback('disconnected')
        clearInterval(syncTimer)

        let timeoutInterval = generateInterval(connectionAttempts)
        setTimeout(() => {
            connectionAttempts++
            startSync(server, username, appName, callback)
        }, timeoutInterval)
    })
}

let settingsTestConnectionBtn = document.getElementById('settings-test-connection')
let settingsConnectionResult = document.getElementById('settings-connection-result')
let settingsSyncServerUsername = document.getElementById('settings-sync-server-username')
let settingsStartSyncBtn = document.getElementById('settings-start-sync')
let settingsConnectionStatus = document.getElementById('settings-connection-status')

settingsTestConnectionBtn.addEventListener('click', e => {
    settingsTestConnectionBtn.disabled = true
    let serverAddress = settings[3]
    testSocket(serverAddress, success => {
        if(success) {
            settingsConnectionResult.innerHTML = 'Server Exists'
            settingsSyncServerUsername.disabled = false
            settingsStartSyncBtn.disabled = false
        } else {
            settingsConnectionResult.innerHTML = "Can't Connect to Given Server"
            settingsSyncServerUsername.disabled = true
            settingsStartSyncBtn.disabled = true
        }
        settingsTestConnectionBtn.disabled = false
    })
})

settingsStartSyncBtn.addEventListener('click', e => {
    settingsStartSyncBtn.disabled = true
    let serverAddress = settings[3]
    let serverUsername = settings[4]
    startSync(serverAddress, serverUsername, "Objective Master", syncState)
})

let serverAddress = settings[3]
let serverUsername = settings[4]

if(serverAddress && serverUsername) {
    startSync(serverAddress, serverUsername, "Objective Master", syncState)
}

function syncState(state) {
    switch(state) {
        case 'disconnected':
            settingsConnectionStatus.innerHTML = 'Disconnected'
            break;
        case 'connected':
            settingsConnectionStatus.innerHTML = 'Connected'
    }
}