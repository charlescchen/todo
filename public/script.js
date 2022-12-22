function fadeOutElement(elementId) {
    const fadeTarget = document.getElementById(elementId);
    var fadeEffect = setInterval(function () {
        if (!fadeTarget.style.opacity) {
            fadeTarget.style.opacity = 1;
        }

        if (fadeTarget.style.opacity > 0) {
            fadeTarget.style.opacity -= 0.01;
        } else {
            clearInterval(fadeEffect);
            fadeTarget.remove();
        }
    }, 5);
}

function getTasks() {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "http://localhost:3000/tasks/incomplete");
    xmlHttp.onreadystatechange = function () {
        if (this.readyState != 4) return;

        const data = JSON.parse(xmlHttp.responseText);
        const taskContainer = document.getElementById("taskbox");

        if (data.length == 0) {
            document.getElementById("no-incomplete-tasks-message").style.display = "block";
        } else {
            data.forEach((task) => {
                const id = `task${task["taskid"]}`;
            
                const div = document.createElement("div");
                div.setAttribute("class", "form-check");
                div.setAttribute("id", `div${task["taskid"]}`);

                const box = document.createElement("input");
                box.setAttribute("type", "checkbox");
                box.setAttribute("class", "form-check-input");
                box.setAttribute("onclick", `markComplete("${id}")`);
                box.setAttribute("id", id);
                div.appendChild(box);

                const label = document.createElement("label");
                label.setAttribute("for", id);
                label.setAttribute("class", "form-check-label");
                label.setAttribute("style", "padding-bottom: 15px;");
                label.innerHTML = task["item"] + " ";

                const badge = document.createElement("span");
                // Format badge
                if (task["due"] == null) {
                    badge.innerHTML = "No Due Date";
                    badge.setAttribute("class", "badge bg-secondary");
                } else {
                    const dueDate = new Date(task["due"]);
                    badge.innerHTML = dueDate.toDateString();

                    // Check if task is overdue
                    let overdue = false;
                    const currentDate = new Date(); // Get current date
                    if (dueDate.getFullYear() < currentDate.getFullYear()) {
                        overdue = true;
                    } else if (dueDate.getFullYear() == currentDate.getFullYear()) {
                        if (dueDate.getMonth() < currentDate.getMonth()) {
                            overdue = true;
                        } else if (dueDate.getMonth() == currentDate.getMonth() && dueDate.getDate() < currentDate.getDate()) {
                            overdue = true;
                        }
                    }

                    // Format badge colour
                    if (overdue) {
                        badge.setAttribute("class", "badge bg-danger");
                    } else {
                        badge.setAttribute("class", "badge bg-primary")
                    }
                }

                label.appendChild(badge);
                div.appendChild(label);
                taskContainer.appendChild(div);
            });
        } 
    };

    xmlHttp.send();
}

function addTask() {
    const task = document.getElementById("task-text-input").value;
    const date = document.getElementById("task-date-input").value;
    const body = {
        task: task,
        date: date
    };

    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "http://localhost:3000/tasks/addtask");
    xmlHttp.setRequestHeader("Content-Type", "application/json");

    xmlHttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            window.location.replace("http://localhost:3000/index.html");
        } else if (this.readyState == 4) {
            document.getElementById("add-task-error-message").innerHTML = xmlHttp.responseText;
        }
    };

    xmlHttp.send(JSON.stringify(body));
}

function markComplete(id) {
    const box = document.getElementById(id);
    box.disabled = true;
    if (!box.checked) return;
    
    const xmlHttp = new XMLHttpRequest();      
    xmlHttp.open("POST", "http://localhost:3000/tasks/finishtask");
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    const body = {
        taskid: id
    };

    xmlHttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const idNum = id.substring(4);
            const fadeTargetId = `div${idNum}`;
            fadeOutElement(fadeTargetId);

            // Check if there are no incomplete tasks
            const xmlHttp2 = new XMLHttpRequest();
            xmlHttp2.open("GET", "http://localhost:3000/tasks/incomplete");
            xmlHttp2.onreadystatechange = function () {
                if (this.readyState != 4) return;

                const data = JSON.parse(xmlHttp2.responseText);
                if (data.length == 0) {
                    document.getElementById("no-incomplete-tasks-message").style.display = "block";
                }
            }
            xmlHttp2.send();
        }
    };

    xmlHttp.send(JSON.stringify(body));
}

function getCompletedTasks() {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "http://localhost:3000/tasks/complete");
    xmlHttp.onreadystatechange = function () {
        if (this.readyState != 4) return;

        const data = JSON.parse(xmlHttp.responseText);
        const tableBody = document.getElementById("completed-task-table");
        
        data.forEach((task) => {
            const tableRow = document.createElement("tr");
            tableRow.setAttribute("id", `row${task["taskid"]}`);

            const dueDateField = document.createElement("td");
            if (task["due"] == null) {
                dueDateField.innerHTML = "No Due Date";
            } else {
                const dueDate = new Date(task["due"]);
                dueDateField.innerHTML = dueDate.toDateString();
            }
            tableRow.appendChild(dueDateField);

            const taskField = document.createElement("td");
            taskField.innerHTML = task["item"];
            tableRow.appendChild(taskField);

            const restoreField = document.createElement("td");
            const restoreButton = document.createElement("button");
            restoreButton.setAttribute("type", "button");
            restoreButton.setAttribute("class", "btn btn-success");
            restoreButton.setAttribute("id", `restore${task["taskid"]}`);
            restoreButton.setAttribute("onclick", `restoreTask("${task["taskid"]}")`);
            restoreButton.innerHTML = "Restore";
            restoreField.appendChild(restoreButton);
            tableRow.appendChild(restoreField);

            const deleteField = document.createElement("td");
            const deleteButton = document.createElement("button");
            deleteButton.setAttribute("type", "button");
            deleteButton.setAttribute("class", "btn btn-danger");
            deleteButton.setAttribute("id", `delete${task["taskid"]}`);
            deleteButton.setAttribute("onclick", `deleteTask("${task["taskid"]}")`);
            deleteButton.innerHTML = "Delete";
            deleteField.appendChild(deleteButton);
            tableRow.appendChild(deleteField);

            tableBody.appendChild(tableRow);
        });  
    };

    xmlHttp.send();
}

function deleteTask(id) {
    // Disable delete and restore buttons
    document.getElementById(`delete${id}`).disabled = true;
    document.getElementById(`restore${id}`).disabled = true;

    const body = {
        taskid: id
    };
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open("DELETE", "http://localhost:3000/tasks/deletetask");
    xmlHttp.setRequestHeader("Content-Type", "application/json");

    xmlHttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const fadeTargetId = `row${id}`;
            fadeOutElement(fadeTargetId);
        }
    };

    xmlHttp.send(JSON.stringify(body));
}

function restoreTask(id) {
    // Disable delete and restore buttons
    document.getElementById(`delete${id}`).disabled = true;
    document.getElementById(`restore${id}`).disabled = true;

    const body = {
        taskid: id
    };
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "http://localhost:3000/tasks/restoretask");
    xmlHttp.setRequestHeader("Content-Type", "application/json");

    xmlHttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const fadeTargetId = `row${id}`;
            fadeOutElement(fadeTargetId);
        }
    };

    xmlHttp.send(JSON.stringify(body));
}