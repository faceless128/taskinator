var formEl = document.querySelector("#task-form");
var tasksToDoEl = document.querySelector("#tasks-to-do");
var taskIdCounter = 0;
var pageContentEl = document.querySelector("#page-content");
var tasksInProgressEl = document.querySelector("#tasks-in-progress");
var tasksCompletedEl = document.querySelector("#tasks-completed");
var tasks = [];

var taskFormHandler = function(event) {

    event.preventDefault();

    // get data from form
    var taskNameInput = document.querySelector("input[name='task-name']").value;
    var taskTypeInput = document.querySelector("select[name='task-type']").value;

    // check for empty values
    if (!taskNameInput || !taskTypeInput) {
        alert("You need to fill out the task form!")
        return false;
    }

    formEl.reset();

    var isEdit = formEl.hasAttribute("data-task-id");
    if (isEdit) {
        var taskId = formEl.getAttribute("data-task-id");
        completeEditTask(taskNameInput, taskTypeInput, taskId);
    }
    else {

        // package data as an object
        var taskDataObj = {
            name: taskNameInput,
            type: taskTypeInput,
            status: "to do"
        };

        // send task data object to createTaskEl
        createTaskEl(taskDataObj);
    };
};

var createTaskEl = function(taskDataObj) {
    // create list item
    var listItemEl = document.createElement("li");
    listItemEl.className = "task-item";

    // set a task id value
    listItemEl.setAttribute("data-task-id", taskIdCounter);

    // create div and html inside div
    var taskInfoEl = document.createElement("div");
    taskInfoEl.className = "task-info";
    taskInfoEl.innerHTML = "<h3 class='task-name'>" + taskDataObj.name + "</h3><span class='task-type'>" + taskDataObj.type + "</span>";

    listItemEl.appendChild(taskInfoEl);
    
    // insert html
    var taskActionsEl = createTaskActions(taskIdCounter);
    listItemEl.appendChild(taskActionsEl);
    tasksToDoEl.appendChild(listItemEl);

    taskDataObj.id = taskIdCounter;
    tasks.push(taskDataObj);

    if (taskDataObj.status === "to do") {
        listItemEl.querySelector("select[name='status-change']").selectedIndex = 0;
        tasksToDoEl.appendChild(listItemEl);
    }
    else if (taskDataObj.status === "in progress") {
        listItemEl.querySelector("select[name='status-change']").selectedIndex = 1;
        tasksInProgressEl.appendChild(listItemEl);
    }
    else if (taskDataObj.status === "completed") {
        listItemEl.querySelector("select[name='status-change']").selectedIndex = 2;
        tasksCompletedEl.appendChild(listItemEl);
    }

    saveTasks();

    // increase task counter for next task id
    taskIdCounter++;
};

var completeEditTask = function(taskName, taskType, taskId) {
    // find the matching list item
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    // set new values
    taskSelected.querySelector("h3.task-name").textContent = taskName;
    taskSelected.querySelector("span.task-type").textContent = taskType;

    // loop through tasks array and task object with new content
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === parseInt(taskId)) {
            tasks[i].name = taskName;
            tasks[i].type = taskType;
        }
    }

    saveTasks();

    alert("Task Updated!");

    // reset form state
    formEl.removeAttribute("data-task-id");
    document.querySelector("#save-task").textContent = "Add Task";
};

var createTaskActions = function(taskId) {
    // create div for task actions
    var actionContainerEl = document.createElement("div");
    actionContainerEl.className = "tasks-actions";

    // create edit button
    var editButtonEl = document.createElement("button");
    editButtonEl.textContent = "Edit";
    editButtonEl.className = "btn edit-btn";
    editButtonEl.setAttribute("data-task-id", taskId);

    actionContainerEl.appendChild(editButtonEl);

    // create delete button
    var deleteButtonEl = document.createElement("button");
    deleteButtonEl.textContent = "Delete";
    deleteButtonEl.className = "btn delete-btn";
    deleteButtonEl.setAttribute("data-task-id", taskId);

    actionContainerEl.appendChild(deleteButtonEl);

    // create dropdown menu
    var statusSelectEl = document.createElement("select");
    statusSelectEl.className = "select-status";
    statusSelectEl.setAttribute("name", "status-change");
    statusSelectEl.setAttribute("data-task-id", taskId);

    // create options for dropdown menu
    var statusChoices = ["To Do", "In Progress", "Completed"];

    for (var i = 0; i< statusChoices.length; i++) {
        var statusOptionEl = document.createElement("option");
        statusOptionEl.textContent = statusChoices[i];
        statusOptionEl.setAttribute("value", statusChoices[i]);

        statusSelectEl.appendChild(statusOptionEl);
    };

    actionContainerEl.appendChild(statusSelectEl);
    
    return actionContainerEl;
};

var taskButtonHandler = function(event) {
    // get target element from event
    var targetEl = event.target;

    // capture edit button click
    if (targetEl.matches(".edit-btn")) {
        var taskId = targetEl.getAttribute("data-task-id");
        editTask(taskId);
    } 
    // capture delete button click
    else if (targetEl.matches(".delete-btn")) {
        var taskId = targetEl.getAttribute("data-task-id");
        deleteTask(taskId);
    }
};

var taskStatusChangeHandler = function(event) {
    // capture option menu changes
    var taskId = event.target.getAttribute("data-task-id");

    // get the currently selected iotion's value and convert to lower case
    var statusValue = event.target.value.toLowerCase();

    // find the parent task item based on the id
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    // move task to proper clumn
    if (statusValue === "to do") {
        tasksToDoEl.appendChild(taskSelected);
    }
    else if (statusValue === "in progress") {
        tasksInProgressEl.appendChild(taskSelected);
    }
    else if (statusValue === "completed") {
        tasksCompletedEl.appendChild(taskSelected);
    }

    // update task status in array
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === parseInt(taskId)) {
            tasks[i].status = statusValue;
        }
    }
    saveTasks();
};

var editTask = function(taskId) {
    // get task list item element
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    // get content from task name and type
    var taskName = taskSelected.querySelector("h3.task-name").textContent;
    var taskType = taskSelected.querySelector("span.task-type").textContent;
    document.querySelector("input[name='task-name']").value = taskName;
    document.querySelector("select[name='task-type']").value = taskType;
    document.querySelector("#save-task").textContent = "Save Task";
    formEl.setAttribute("data-task-id", taskId);

};

var deleteTask = function(taskId) {
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");
    taskSelected.remove();

    // create new array to hold updated list of tasks
    var updatedTasksArr = [];

    //loop through current tasks
    for (var i = 0; i < tasks.length; i++) {
        // if tasks[i].id doesn't match the value of taskId, let's keep that task
        if (tasks[i].id !== parseInt(taskId)) {
            updatedTasksArr.push(tasks[i]);
        }
    }
    tasks = updatedTasksArr;
    saveTasks();
};

var saveTasks = function() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
};

var loadTasks = function () {
    savedTasks = localStorage.getItem("tasks");
    if (!savedTasks) {
        savedTasks = [];
        return false;
    }
    savedTasks = JSON.parse(savedTasks);

    // loop through savedTasks array
    for (var i = 0; i < savedTasks.length; i++) {
        // pass each task object into the createTaskEl function
        createTaskEl(savedTasks[i]);
    };
};

loadTasks();

pageContentEl.addEventListener("click", taskButtonHandler);
pageContentEl.addEventListener("change", taskStatusChangeHandler);
formEl.addEventListener("submit", taskFormHandler);
