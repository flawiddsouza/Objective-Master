function checkEmptyAndFillElement(element, fillHTML=`<div class="task">Zero</div>`) {
    if(element.innerHTML == '') {
        element.innerHTML = fillHTML
    }
}

// From: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript/8809472#8809472
function generateUUID() {
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now()
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
}

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value))
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key)
    return value && JSON.parse(value)
}

function dynamicSort(property) {
    let sortOrder = 1
    if(property[0] === "-") {
        sortOrder = -1
        property = property.substr(1)
    }
    return function(a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0
        return result * sortOrder
    }
}