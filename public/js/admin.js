//  ---------------------------------- UTILITIES ----------------------------------
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

async function fetchNotes(q = "") {
    const res = await fetch(
        `/admin/notes/query?search=${encodeURIComponent(q)}`,
    );
    const notes = await res.json();
    buildTable("#change-log-table-body", notes, buildNotesTableRow);
    return notes;
}

const debouncedFetchNotes = debounce(fetchNotes, 300);

async function fetchUsers(q = "") {
    const res = await fetch(
        `/admin/users/query?search=${encodeURIComponent(q)}`,
    );
    const users = await res.json();
    buildTable("#users-table-body", users, buildUsersTableRow);
    return users;
}

const debouncedFetchUsers = debounce(fetchUsers, 300);

function createHandler(func, user = "") {
    return async function (e) {
        e.preventDefault();
        await func(user);
    };
}

//  ---------------------------------- DOM BUILDERS ----------------------------------
function clearMainView() {
    let mainContainer = document.querySelector(".admin-main-container");
    while (mainContainer.firstChild) {
        mainContainer.removeChild(mainContainer.firstChild);
    }
    return mainContainer;
}

function clearTableRows(tbody) {
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
    return;
}

function buildTable(tbodyId, data, rowBuilder) {
    let tbody = document.querySelector(tbodyId);
    clearTableRows(tbody);
    for (let i = 0; i < data.length; i++) {
        if (tbodyId === "#users-table-body" && data[i].status !== "ACTIVE") {
            continue;
        }
        let newRow = rowBuilder(data[i], i);
        tbody.appendChild(newRow);
    }
    return;
}

function buildSVG(ns, tag, attrs) {
    const element = document.createElementNS(ns, tag);
    for (const key in attrs) {
        element.setAttribute(key, attrs[key]);
    }
    return element;
}

function toggleInputElements(inputId) {
    document.querySelectorAll(".main-input").forEach((input) => {
        if (input.id === inputId) {
            input.removeAttribute("disabled");
        } else {
            input.setAttribute("disabled", "");
        }
    });
}

function removeSelectedClass() {
    let adminButtons = document.querySelectorAll(".admin-btn");
    adminButtons.forEach((btn) => {
        btn.classList.remove("selected");
    });
}

function showSelectedSection(sectionName) {
    let adminSections = document.querySelectorAll(".admin-section");
    adminSections.forEach((section) => {
        if (!section.classList.contains("noview")) {
            section.classList.add("noview");
        }
        if (section.classList.contains(sectionName)) {
            section.classList.remove("noview");
        }
    });
}

// at some point really need to change the buttons to 'build' the containers
// rather than just show/hide containers.  that should probably be what i start with.
// so on button click, destory current containers children, switch to correct container, fetch data,
// then build that containers children with data.

//  ---------------------------------- CHANGE LOG ----------------------------------
let adminBtnChangeLog = document.querySelector(".admin-btn.log-btn");
adminBtnChangeLog.addEventListener("click", async () => {
    // ignore if already selected
    let changeLogContainer = document.querySelector(".changelog-container");
    if (!changeLogContainer.classList.contains("noview")) return;

    console.log("button clicked");
    // fetch log data (also resets/builds tablebody)
    await fetchNotes();

    // toggle "selected" class on buttons
    removeSelectedClass();
    adminBtnChangeLog.classList.add("selected");

    // enable <input>
    toggleInputElements("change-log-input");

    // set noview classes
    showSelectedSection(adminBtnChangeLog.dataset.relatedSection);
});

function buildNotesTableRow(note, idx) {
    let newRow = document.createElement("tr");
    let oddEven = (idx + 1) % 2 === 0 ? "even" : "odd";
    newRow.classList.add("log-row", oddEven);

    //      TD's
    // td log-date
    let colDate = document.createElement("td");
    colDate.classList.add("log-date");
    colDate.textContent = note.date;
    newRow.appendChild(colDate);
    // td log-user
    let colUser = document.createElement("td");
    colUser.classList.add("log-user");
    colUser.textContent = note.user.nickname;
    newRow.appendChild(colUser);
    // td log-name
    let colName = document.createElement("td");
    colName.classList.add("log-name");
    colName.textContent = note.entityName;
    newRow.appendChild(colName);
    // td log-message
    let colMessage = document.createElement("td");
    colMessage.classList.add("log-message");
    colMessage.textContent = note.message;
    newRow.appendChild(colMessage);
    // td log-id (SPAN w/ SVG)
    let colId = buildLogIdCol(note.logId);
    newRow.appendChild(colId);

    return newRow;
}

function buildLogIdCol(id) {
    // create td
    let colId = document.createElement("td");
    colId.classList.add("log-id");
    colId.textContent = id;

    // create span
    let newSpan = document.createElement("span");
    newSpan.classList.add("clipboard-icon");
    newSpan.dataset.logid = id;

    // create svg
    let svgNS = "http://www.w3.org/2000/svg";
    let newSvg = buildSVG(svgNS, "svg", {
        xlmns: svgNS,
        fill: "none",
        viewBox: "0 0 24 24",
        "stroke-width": "1.5",
        stroke: "currentColor",
        class: "size-6",
    });
    let newPath = buildSVG(svgNS, "path", {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        d: "M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184",
    });
    newSvg.appendChild(newPath);
    newSpan.appendChild(newSvg);

    // add listener to span
    newSpan.addEventListener("click", () => {
        let search = document.querySelector("#change-log-input");
        search.value = id;
        debouncedFetchNotes(id);
    });

    // append span to td
    colId.appendChild(newSpan);

    return colId;
}

const logSearchInput = document.querySelector("#change-log-input");
logSearchInput.addEventListener("input", () => {
    debouncedFetchNotes(logSearchInput.value);
});

const clipboardIcons = document
    .querySelectorAll(".clipboard-icon")
    .forEach((icon) => {
        icon.addEventListener("click", () => {
            let logId = icon.dataset.logid;
            logSearchInput.value = logId;
            debouncedFetchNotes(logSearchInput.value);
        });
    });

//  ---------------------------------- USERS ----------------------------------
let adminBtnUsers = document.querySelector(".admin-btn.user-btn");
adminBtnUsers.addEventListener("click", async () => {
    // ignore if already selected
    let usersContainer = document.querySelector(".users-container");
    if (!usersContainer.classList.contains("noview")) return;

    // fetch user data
    await fetchUsers("");

    // toggle "selected" class on buttons
    removeSelectedClass();
    adminBtnUsers.classList.add("selected");

    // enable <input>
    toggleInputElements("users-input");

    // toggle "noview" classes
    showSelectedSection(adminBtnUsers.dataset.relatedSection);
});

function usersTableRowSelector(row) {
    let allRows = document.querySelectorAll(".user-row");

    // if element already selected, remove highlight
    if (row.classList.contains("selected")) {
        row.classList.remove("selected");
        return;
    }

    // remove all other highlights
    allRows.forEach((r) => {
        r.classList.remove("selected");
    });

    // add selected highlight
    row.classList.add("selected");
}

function buildUsersTableRow(user, idx) {
    let newRow = document.createElement("tr");
    let oddEven = (idx + 1) % 2 === 0 ? "even" : "odd";
    newRow.classList.add("user-row", oddEven);
    newRow.dataset.userid = user.id;
    newRow.addEventListener("click", () => {
        usersTableRowSelector(newRow);
    });
    //      TD's
    // td user-id
    let colId = document.createElement("td");
    colId.classList.add("user-id");
    colId.textContent = user.id;
    newRow.appendChild(colId);
    // td user-nickname
    let colNickname = document.createElement("td");
    colNickname.classList.add("user-nickname");
    colNickname.textContent = user.nickname;
    newRow.appendChild(colNickname);
    // td user-username
    let colUsername = document.createElement("td");
    colUsername.classList.add("user-username");
    colUsername.textContent = user.username;
    newRow.appendChild(colUsername);
    // td user-fullname
    let colFullname = document.createElement("td");
    colFullname.classList.add("user-fullname");
    colFullname.textContent = user.fullName;
    newRow.appendChild(colFullname);
    // td user-email
    let colEmail = document.createElement("td");
    colEmail.classList.add("user-email");
    colEmail.textContent = user.email;
    newRow.appendChild(colEmail);
    // td user-role
    let colRole = document.createElement("td");
    colRole.classList.add("user-role");
    colRole.textContent = user.role;
    newRow.appendChild(colRole);
    // td user-branch
    let colBranch = document.createElement("td");
    colBranch.classList.add("user-branch");
    colBranch.textContent = user.branch;
    newRow.appendChild(colBranch);

    // return row
    return newRow;
}

const userSearchInput = document.querySelector("#users-input");
userSearchInput.addEventListener("input", () => {
    debouncedFetchUsers(userSearchInput.value);
});

//  ---------------------------------- USERS MODAL STUFF ----------------------------------
//  ---- ADD USER MODAL ----
let userAddBtn = document.querySelector(".user-add-btn");
userAddBtn.addEventListener("click", async () => {
    let modal = document.querySelector("#user-modal");

    // activate overlay
    document.querySelector(".overlay").classList.remove("hidden");

    // set modal title text
    document.querySelector(".user-form-header").textContent = "ADD USER";

    // add button handler and event listner
    let submitBtn = modal.querySelector(".user-modal-submit-btn");
    let addHandler = createHandler(addUser);
    submitBtn._handler = addHandler;
    submitBtn.addEventListener("click", addHandler);

    // open modal
    modal.show();
});

async function addUser() {
    let form = document.querySelector(".user-form");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // console.dir(data, { depth: null });

    let noticeContainer = document.querySelector(".notice-container");
    let noticeText = noticeContainer.querySelector(".notice-text");
    // try to submit form data
    try {
        const res = await fetch("/admin/users/new", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const result = await res.json();

        // check for error
        if (!res.ok) {
            // error has occurred
            noticeContainer.classList.remove("success");
            noticeContainer.classList.add("error", "show");
            noticeText.textContent = result.error || "something went wrong";
            return;
        } else {
            noticeContainer.classList.remove("error");
            noticeContainer.classList.add("success", "show");
            noticeText.textContent = "User Added Successfully";
            await fetchUsers();
        }
        closeModal();
        return;
    } catch (err) {
        noticeContainer.classList.remove("success");
        noticeContainer.classList.add("error", "show");
        noticeText.textContent = "Network error, please try again.";
    }
    return;
}

// ---- CLOSE MODAL ----
document
    .querySelector(".user-modal-close-btn")
    .addEventListener("click", closeModal);

function closeModal() {
    // remove overlay
    document.querySelector(".overlay").classList.add("hidden");

    // reset modal form
    let modal = document.querySelector("#user-modal");
    modal.querySelector("form").setAttribute("action", "");
    modal.querySelector("p").textContent = "";
    modal.querySelectorAll("input, select").forEach((i) => {
        i.value = "";
    });

    // remove button handlers
    const submitBtn = modal.querySelector(".user-modal-submit-btn");
    if (submitBtn._handler) {
        submitBtn.removeEventListener("click", submitBtn._handler);
        delete submitBtn._handler;
    }

    // close modal
    modal.close();
}

// ---- DEL USER MODAL
document.querySelector(".user-delete-btn").addEventListener("click", () => {
    // check for selected user
    let selectedUser = document.querySelector("tr.user-row.selected");
    if (!selectedUser) return;

    // get user id
    let userid = selectedUser.dataset.userid;
    let fullname = selectedUser.querySelector(".user-fullname").textContent;

    let modal = document.querySelector("#del-user-modal");

    // activate overlay
    let overlay = document.querySelector(".overlay");
    overlay.classList.remove("hidden");

    // set modal text
    modal.querySelector(".del-user-modal-name").textContent = fullname;

    // add button handler and event listener
    let submitBtn = modal.querySelector(".del-user-modal-submit-btn");
    let delHandler = createDelHandler(userid, fullname);
    submitBtn._handler = delHandler;
    submitBtn.addEventListener("click", delHandler);

    // open modal
    modal.show();
});

// delete handler
function createDelHandler(id, fullname) {
    return async function () {
        await deleteUser(id, fullname);
    };
}

// del user function
async function deleteUser(id, fullname) {
    if (!id || !fullname) return;

    const user = { id, fullname };
    let noticeContainer = document.querySelector(".notice-container");
    let noticeText = noticeContainer.querySelector(".notice-text");

    // try to 'delete' user
    try {
        const res = await fetch("/admin/users/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
        });
        const result = await res.json();
        // check for error
        if (!res.ok) {
            noticeContainer.classList.remove("success");
            noticeContainer.classList.add("error", "show");
            noticeText.textContent = result.error || "something went wrong";
            return;
        } else {
            noticeContainer.classList.remove("error");
            noticeContainer.classList.add("success", "show");
            noticeText.textContent = "User Successfully Deactivated";
        }
        await fetchUsers();
        closeDelModal();
        return;
    } catch (err) {
        noticeContainer.classList.remove("success");
        noticeContainer.classList.add("error", "show");
        noticeText.textContent = "Network error, please try again";
    }
    return;
}

// close del modal
document
    .querySelector(".del-user-modal-close-btn")
    .addEventListener("click", closeDelModal);

function closeDelModal() {
    // remove overlay
    document.querySelector(".overlay").classList.add("hidden");

    // reset modal text
    const delModal = document.querySelector("#del-user-modal");
    delModal.querySelector(".del-user-modal-name").textContent = "";

    // remove button handler
    let submitBtn = delModal.querySelector(".del-user-modal-submit-btn");
    if (submitBtn._handler) {
        submitBtn.removeEventListener("click", submitBtn._handler);
        delete submitBtn._handler;
    }

    console.log("closing modal");
    // close modal
    delModal.close();
}

// ---- EDIT USER MODAL
document.querySelector(".user-edit-btn").addEventListener("click", () => {
    // check for selected user
    let selectedUser = document.querySelector("tr.user-row.selected");
    if (!selectedUser) return;

    let modal = document.querySelector("#user-modal");

    // activate overlay
    document.querySelector(".overlay").classList.remove("hidden");

    // set modal title text
    document.querySelector(".user-form-header").textContent = "EDIT USER";

    let curUser = prepEditForm(selectedUser);
    let userid = selectedUser.dataset.userid;
    curUser.id = userid;
    // console.dir(form, { depth: null });
    // console.dir(curUser, { depth: null });

    let submitBtn = modal.querySelector(".user-modal-submit-btn");
    let editHandler = createHandler(editUser, curUser);
    submitBtn._handler = editHandler;
    submitBtn.addEventListener("click", editHandler);

    // getChanges(curUser, form);
    modal.show();
});

// PREPARE EDIT FORM
function prepEditForm(userRow) {
    let form = document.querySelector(".user-form");

    let curUser = {
        fullName: userRow.querySelector("td.user-fullname").textContent,
        username: userRow.querySelector("td.user-username").textContent,
        nickname: userRow.querySelector("td.user-nickname").textContent,
        email: userRow.querySelector("td.user-email").textContent,
        branch: userRow.querySelector("td.user-branch").textContent,
        role: userRow.querySelector("td.user-role").textContent,
    };

    //       set values
    // fullname
    form.querySelector("#user-fullName-input").value = curUser.fullName;
    // username
    form.querySelector("#user-username-input").value = curUser.username;
    // nickname
    form.querySelector("#user-nickname-input").value = curUser.nickname;
    // email
    form.querySelector("#user-email-input").value = curUser.email;
    // branch
    form.querySelector("#user-branch-input").value = curUser.branch;
    // role
    form.querySelector("#user-role-input").value = curUser.role;

    return curUser;
}

// CHECK FOR CHANGES
function getChanges(curUser, data) {
    // console.dir(curUser, { depth: null });
    // console.log("------------");
    // console.dir(data, { depth: null });

    // let changes = { isChange: false, id: curUser.id };
    // let changeData = { unique: {}, common: {}, id: curUser.id };
    let changes = false;

    if (curUser.branch !== data["user-branch-input"]) {
        changes = true;
        // changeData.common.branch = data["user-branch-input"];
        // console.log("check 1");
    }

    if (curUser.email !== data["user-email-input"]) {
        changes = true;
        // changeData.unique.email = data["user-email-input"];
        // console.log("check 2");
    }

    if (curUser.fullName !== data["user-fullName-input"]) {
        changes = true;
        // changeData.unique.fullName = data["user-fullName-input"];
        // console.log("check 3");
    }

    if (curUser.nickname !== data["user-nickname-input"]) {
        changes = true;
        // changeData.unique.nickname = data["user-nickname-input"];
        // console.log("check 4");
    }

    if (curUser.role !== data["user-role-input"]) {
        changes = true;
        // changeData.common.role = data["user-role-input"];
        // console.log("check 5");
    }

    if (curUser.username !== data["user-username-input"]) {
        changes = true;
        // changeData.unique.username = data["user-username-input"];
        // console.log("check 6");
    }

    if (data["user-password-input"]) {
        changes = true;
        // changeData.common.password = data["user-password-input"];
        // changeData.common.passwordConfirm = data["user-password-confirm-input"];
        // console.log("check 7");
    }

    // changes.data = changeData;
    return changes;
}

// EDIT USER
async function editUser(curUser) {
    let form = document.querySelector(".user-form");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.userId = curUser.id;
    console.dir(data, { depth: null });

    // check for no changes
    let changes = getChanges(curUser, data);
    if (!changes) return;

    // console.dir(changes, { depth: null });
    let noticeContainer = document.querySelector(".notice-container");
    let noticeText = noticeContainer.querySelector(".notice-text");

    // try to submit form data
    try {
        const res = await fetch("/admin/users/edit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const result = await res.json();

        // check for error
        if (!res.ok) {
            // error has occurred
            noticeContainer.classList.remove("success");
            noticeContainer.classList.add("error", "show");
            noticeText.textContent = result.error || "something went wrong";
            return;
        } else {
            noticeContainer.classList.remove("error");
            noticeContainer.classList.add("success", "show");
            noticeText.textContent = "Edit Successful!";
        }
        document.querySelector("#users-input").value =
            data["user-username-input"];
        fetchUsers(data["user-username-input"]);
        closeModal();
    } catch (err) {
        noticeContainer.classList.remove("success");
        noticeContainer.classList.add("error", "show");
        noticeText.textContent = "Network error, please try again.";
    }
}
