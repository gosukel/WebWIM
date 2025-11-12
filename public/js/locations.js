// ASSORTED FUNCTIONS

// fetch function
async function fetchLocations(q, sort = "", direction = "") {
    const result = await fetch(
        `/locations/query?search=${encodeURIComponent(q)}&sortParams=${encodeURIComponent(sort)}&sortDirection=${encodeURIComponent(direction)}`
    );
    const locations = await result.json();
    updateLocTable(locations);
}

// debounce function creator
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// table rebuilder functions
//  table
function updateLocTable(locations) {
    const parentTbody = document.querySelector("tbody");

    // clear table
    while (parentTbody.firstChild) {
        parentTbody.removeChild(parentTbody.firstChild);
    }

    // create new rows
    for (let i = 0; i < locations.length; i++) {
        let newRowSet = createTableRowSet(locations[i], i);
        parentTbody.append(newRowSet[0], newRowSet[1]);
    }
}
//  rows
function createTableRowSet(loc, idx) {
    //              PARENT ROW <tr>
    let parentRow = document.createElement("tr");
    let oddEven = (idx + 1) % 2 === 0 ? "even" : "odd";
    parentRow.classList.add("loc-parent");
    parentRow.classList.add(oddEven);
    parentRow.dataset.locid = loc.id;
    parentRow.dataset.waridx = loc.warehouseIndex;
    parentRow.addEventListener("click", () => {
        locationParentListener(parentRow);
    });
    //               ROW COLUMNS <td>
    // td col-loc
    let colLoc = document.createElement("td");
    colLoc.classList.add("col-loc");
    colLoc.textContent = loc.name;
    parentRow.appendChild(colLoc);

    // td col-utn
    let colUtn = document.createElement("td");
    colUtn.classList.add("col-utn");
    colUtn.textContent = loc.utn;
    parentRow.appendChild(colUtn);

    // td col-zone
    let colZone = document.createElement("td");
    colZone.classList.add("col-zone");
    colZone.textContent = loc.zone;
    parentRow.appendChild(colZone);

    // td col-item
    let colItem = document.createElement("td");
    colItem.classList.add("col-item");
    colItem.textContent = loc.items[0]?.item?.name || "-";
    parentRow.appendChild(colItem);

    //              CHILD ROW <tr>
    // row
    let childRow = document.createElement("tr");
    childRow.classList.add("loc-child");
    // td
    let itemTd = document.createElement("td");
    itemTd.setAttribute("colspan", "4");
    childRow.appendChild(itemTd);
    // div loc-child-content
    let childDiv = document.createElement("div");
    childDiv.classList.add("loc-child-content");
    let itemString = "All Items";
    loc.items.forEach((item) => {
        itemString += ` - ${item.item.name}`;
    });
    childDiv.textContent = itemString;
    itemTd.appendChild(childDiv);

    return [parentRow, childRow];
}

// debounced fetch
const debouncedFetch = debounce(fetchLocations, 300);

// reset header function
function resetHeaders(el = "") {
    document.querySelectorAll("th").forEach((e) => {
        if (el != e) {
            e.classList.remove("sorted");
            e.dataset.direction = "asc";
            e.querySelector("span").textContent = " ";
        }
    });
}

// EVENT LISTENERS
// row listener function - click to expand child row
function locationParentListener(parent) {
    let childElement =
        parent.nextElementSibling.querySelector(".loc-child-content");

    if (childElement.classList.contains("show")) {
        childElement.classList.toggle("show");
        parent.classList.remove("selected");
    } else {
        document.querySelectorAll(".loc-parent.selected").forEach((e) => {
            e.classList.remove("selected");
            e.nextElementSibling
                .querySelector(".loc-child-content")
                .classList.remove("show");
        });
        childElement.classList.toggle("show");
        parent.classList.toggle("selected");
    }
}
// add row listener function
document.querySelectorAll(".loc-parent").forEach((parent) => {
    parent.addEventListener("click", () => {
        locationParentListener(parent);
    });
});

// search input listener
const search = document.querySelector("input#loc-search");
search.addEventListener("input", () => {
    debouncedFetch(search.value);
    resetHeaders();
});

// th event listener - sorts table
document.querySelectorAll("th").forEach((e) => {
    e.addEventListener("click", () => {
        resetHeaders(e);
        e.classList.add("sorted");
        let curSearch = document.querySelector("input#loc-search").value;
        let sortParams = e.dataset.sort;
        let sortDirection = e.dataset.direction;
        e.querySelector("span").textContent =
            sortDirection === "asc" ? "▲" : "▼";
        fetchLocations(curSearch, sortParams, sortDirection);
        e.dataset.direction = sortDirection === "asc" ? "desc" : "asc";
    });
});

//                      modal buttons
//                      ADD LOCATION
async function addLocation(e) {
    const form = document.querySelector(".loc-form");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    let noticeContainer = document.querySelector(".notice-container");
    let noticeText = noticeContainer.querySelector(".notice-text");

    //try to submit form data
    try {
        const res = await fetch("/locations/new", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const result = await res.json();
        // check for error
        if (!res.ok) {
            // error has occurred
            noticeContainer.classList.remove("success");
            noticeContainer.classList.add("error");
            noticeContainer.classList.add("show");
            noticeText.textContent = result.error || "something went wrong";
        } else {
            noticeContainer.classList.remove("error");
            noticeContainer.classList.add("success");
            noticeContainer.classList.add("show");
            noticeText.textContent = "Location Added Successfully!";
        }
        document.querySelector("input#loc-search").value = data["loc-name"];
        fetchLocations(data["loc-name"]);
        closeModal();
    } catch (err) {
        noticeContainer.classList.remove("success");
        noticeContainer.classList.add("error");
        noticeContainer.classList.add("show");
        noticeText.textContent = "Network error, please try again.";
    }
    return;
}

function createAddHandler() {
    return async function (e) {
        e.preventDefault();
        await addLocation(e);
    };
}
// add button event listener
document.querySelector(".btn-loc-add").addEventListener("click", () => {
    // activate overlay
    document.querySelector(".overlay").classList.remove("hidden");

    // open modal
    let modal = document.querySelector("dialog");

    // prep modal text
    modal.querySelector("p").textContent = "ADD NEW LOCATION";
    let submitBtn = modal.querySelector(".modal-submit-btn");

    // create handler function for submit btn
    const handler = createAddHandler();
    submitBtn._handler = handler;

    // add listener to submit button
    submitBtn.addEventListener("click", handler);

    // show loc-prev-container
    document.querySelector(".loc-prev-container").classList.add("show");

    modal.show();
});

//                       EDIT LOCATION
// getLocDetails function
function getLocDetails(parent, child) {
    let items = child.textContent
        .replaceAll("\n", "")
        .replace("All Items", "")
        .replace("-", " ")
        .replaceAll(" ", "")
        .trim()
        .split("-");

    let curWarIdx = Number(parent.dataset.waridx);
    let prevIndex = curWarIdx - 1;

    let curLocation = {
        locId: parent.dataset.locid,
        name: parent.querySelector(".col-loc").textContent,
        utn: parent.querySelector(".col-utn").textContent,
        zone: parent.querySelector(".col-zone").textContent,
        warehouseIndex: curWarIdx,
        prevLocation: prevIndex,
        items: items,
    };
    return curLocation;
}

function prepEditForm(container, loc) {
    container.querySelector("#loc-id").value = loc.locId;
    container.querySelector("#loc-id").classList.add("show");
    container.querySelector("#loc-name").value = loc.name;
    container.querySelector("#loc-zone").value = loc.zone;
    container.querySelector("#loc-utn").value = loc.utn;
    container.querySelector("#loc-prev").value = loc.prevLocation;
    if (loc.items[0]) {
        loc.items.forEach((item) => {
            container.querySelector("#loc-items").value += `${item}\n`;
        });
    }
    return;
}

function getChanges(curLocation, data) {
    let changes = false;
    // name
    if (curLocation.name != data["loc-name"].toUpperCase()) {
        changes = true;
    }
    // zone
    if (curLocation.zone != data["loc-zone"].toUpperCase()) {
        changes = true;
    }
    // utn
    if (curLocation.utn != data["loc-utn"].toUpperCase()) {
        changes = true;
    }
    // prevLocation
    if (curLocation.prevLocation != data["loc-prev"].toUpperCase()) {
        changes = true;
    }
    // items
    let newItems = data["loc-items"].replaceAll("\n", " ").trim().split(" ");
    newItems.forEach((newItem) => {
        if (newItem && !curLocation.items.includes(newItem)) {
            changes = true;
        }
    });
    curLocation.items.forEach((curItem) => {
        if (curItem && !newItems.includes(curItem)) {
            changes = true;
        }
    });

    return changes;
}

async function editLocation(curLocation) {
    // get data from form
    let form = document.querySelector(".loc-form");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    let changes = getChanges(curLocation, data);
    if (!changes) return;

    let noticeContainer = document.querySelector(".notice-container");
    let noticeText = noticeContainer.querySelector(".notice-text");

    // try to submit form data
    try {
        const res = await fetch("/locations/edit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const result = await res.json();
        if (!res.ok) {
            // error has occurres
            noticeContainer.classList.remove("success");
            noticeContainer.classList.add("error");
            noticeContainer.classList.add("show");
            noticeText.textContent = result.error || "something went wrong";
            return;
        } else {
            noticeContainer.classList.remove("error");
            noticeContainer.classList.add("success");
            noticeContainer.classList.add("show");
            noticeText.textContent = "Edit Successful!";
        }
        fetchLocations(`${data["loc-name"]}`);
        closeModal();
    } catch (err) {
        noticeContainer.classList.remove("success");
        noticeContainer.classList.add("error");
        noticeContainer.classList.add("show");
        noticeText.textContent = "Network error, please try again.";
    }
}

function createEditHandler(location) {
    return async function (e) {
        e.preventDefault();
        await editLocation(location);
    };
}

// edit button event listener
document.querySelector(".btn-loc-edit").addEventListener("click", () => {
    // check for selected location
    let selectedLoc = document.querySelector("tr.selected");
    if (!selectedLoc) return;
    let childElement =
        selectedLoc.nextElementSibling.querySelector(".loc-child-content");

    // activate overlay
    document.querySelector(".overlay").classList.remove("hidden");

    // open modal
    let modal = document.querySelector("dialog");

    // prepare edit form with current values
    let curLoc = getLocDetails(selectedLoc, childElement);
    prepEditForm(modal, curLoc);

    // prep modal text
    modal.querySelector("p").textContent = "EDIT LOCATION";
    let submitBtn = modal.querySelector(".modal-submit-btn");

    // show loc id
    document.querySelector("#loc-id").classList.add("show");

    // show loc-items-container
    document.querySelector(".loc-items-container").classList.add("show");

    // create handler function for button
    const handler = createEditHandler(curLoc);
    submitBtn._handler = handler;

    // add handler function to submit button
    submitBtn.addEventListener("click", handler);
    modal.show();
});

// close modal button
document
    .querySelector(".modal-close-btn")
    .addEventListener("click", closeModal);

function closeModal() {
    // remove overlay
    document.querySelector(".overlay").classList.add("hidden");

    // reset modal inputs
    let modal = document.querySelector("dialog");
    modal.querySelector("form").setAttribute("action", "");
    modal.querySelector("p").textContent = "";
    modal.querySelectorAll("input, select, textarea").forEach((i) => {
        i.value = "";
    });
    modal
        .querySelectorAll("#loc-id, .loc-items-container, .loc-prev-container")
        .forEach((e) => {
            e.classList.remove("show");
        });

    // remove submit handler here
    const submitBtn = modal.querySelector(".modal-submit-btn");
    if (submitBtn._handler) {
        submitBtn.removeEventListener("click", submitBtn._handler);
        delete submitBtn._handler;
    }

    // close modal
    modal.close();
}

//              DEL MODAL
// delete modal handler
function createDelHandler(id, name) {
    return async function () {
        await deleteLocation(id, name);
    };
}
// delete location function
async function deleteLocation(id, name) {
    if (!id) return;
    const location = { id, name };

    let noticeContainer = document.querySelector(".notice-container");
    let noticeText = noticeContainer.querySelector(".notice-text");
    try {
        const res = await fetch("/locations/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(location),
        });
        const result = await res.json();
        // check for error
        if (!res.ok) {
            noticeContainer.classList.remove("success");
            noticeContainer.classList.add("error");
            noticeContainer.classList.add("show");
            noticeText.textContent = result.error || "something went wrong";
            return;
        } else {
            noticeContainer.classList.remove("error");
            noticeContainer.classList.add("success");
            noticeContainer.classList.add("show");
            noticeText.textContent = "Location Deleted Successfully!";
            fetchLocations("");
        }
        closeDelModal();
    } catch (error) {
        console.log(error);
        noticeContainer.classList.remove("success");
        noticeContainer.classList.add("error");
        noticeContainer.classList.add("show");
        noticeText.textContent = "Network error, please try again.";
    }
    return;
}
// open delete modal
document.querySelector(".btn-loc-del").addEventListener("click", () => {
    // check for selected location
    let selectedLocation = document.querySelector(".selected");
    if (!selectedLocation) return;
    let locationName = selectedLocation.querySelector(".col-loc").textContent;
    let locationId = selectedLocation.dataset.locid;

    // add overlay
    document.querySelector(".overlay").classList.remove("hidden");
    document.querySelector(".del-modal-location").textContent = locationName;

    let delModal = document.querySelector(".del-modal");
    let delBtn = document.querySelector(".del-modal-submit-btn");

    // create handler function
    const handler = createDelHandler(locationId, locationName);
    delBtn._handler = handler;

    // add handler function to btn
    delBtn.addEventListener("click", handler);

    delModal.show();
});
// close delete modal function
function closeDelModal() {
    // remove overlay
    document.querySelector(".overlay").classList.add("hidden");
    // get modal element
    let delModal = document.querySelector(".del-modal");
    // reset location name
    delModal.querySelector(".del-modal-location").textContent = "";
    // remove delBtn handler
    const delBtn = delModal.querySelector(".del-modal-submit-btn");
    if (delBtn._handler) {
        delBtn.removeEventListener("click", delBtn._handler);
        delete delBtn._handler;
    }
    // close del modal
    delModal.close();
}
// add listener to del modal close button
document
    .querySelector(".del-modal-close-btn")
    .addEventListener("click", closeDelModal);

//                      LOCATION HISTORY MODAL FUNCTIONS
// get notes for location
async function fetchNotes(
    eId,
    eName,
    eType = "location",
    noteType = "locChangeLog"
) {
    // return;
    const res = await fetch(
        `/locations/notes/?eId=${encodeURIComponent(eId)}&eName=${encodeURIComponent(eName)}&eType=${encodeURIComponent(eType)}&noteType=${encodeURIComponent(noteType)}`
    );
    const notes = await res.json();
    return notes;
}

// table row generator
function createHistoryRow(note, idx) {
    // create row
    let newRow = document.createElement("tr");
    let oddEven = (idx + 1) % 2 === 0 ? "even" : "odd";
    newRow.classList.add(".note-row");
    newRow.classList.add(oddEven);
    // td col-date
    let colDate = document.createElement("td");
    colDate.classList.add("col-date");
    colDate.textContent = note.date;
    newRow.appendChild(colDate);
    // td col-user
    let colUser = document.createElement("td");
    colUser.classList.add("col-user");
    colUser.textContent = note.user.nickname;
    newRow.appendChild(colUser);
    // td col-message
    let colMessage = document.createElement("td");
    colMessage.classList.add("col-message");
    colMessage.textContent = note.message;
    newRow.appendChild(colMessage);
    // return row
    return newRow;
}

// clear/reset history table
function resetHistoryTable() {
    const tableBody = document.querySelector(".history-table tbody");
    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
    }
}

// fill history table with notes
function fillHistoryTable(notes) {
    // return;
    const tableBody = document.querySelector(".history-table tbody");
    for (let i = 0; i < notes.length; i++) {
        let newHistoryRow = createHistoryRow(notes[i], i);
        tableBody.append(newHistoryRow);
    }
}

// handler function for history buttons
function createHistoryHandler(location) {
    return async function (e) {
        const notes = await fetchNotes(
            location.locId,
            location.locName,
            location.eType,
            location.noteType
        );
        resetHistoryTable();
        fillHistoryTable(notes);
    };
}

// open history modal
document
    .querySelector(".btn-loc-history")
    .addEventListener("click", async () => {
        // check for selected location
        let selectedLocation = document.querySelector(".selected");
        if (!selectedLocation) return;
        let locName = selectedLocation.querySelector(".col-loc").textContent;
        let locId = selectedLocation.dataset.locid;
        let historyModal = document.querySelector("#history-modal");

        // add overlay
        document.querySelector(".overlay").classList.remove("hidden");

        // show location name
        historyModal.querySelector(".history-modal-title-div").textContent =
            locName;

        // fill history table
        const notes = await fetchNotes(
            locId,
            locName,
            "location",
            "locChangeLog"
        );
        resetHistoryTable();
        fillHistoryTable(notes);

        // create objs and handlers for buttons
        let changeLog = {
            locId,
            locName,
            eType: "location",
            noteType: "locChangeLog",
        };
        let itemLog = {
            locId,
            locName,
            eType: "location",
            noteType: "locationItems",
        };
        const changeLogHandler = createHistoryHandler(changeLog);
        const itemLogHandler = createHistoryHandler(itemLog);

        // add handlers to buttons
        let changeLogBtn = historyModal.querySelector(".loc-log-btn");
        changeLogBtn._handler = changeLogHandler;
        changeLogBtn.addEventListener("click", changeLogHandler);
        let itemLogBtn = historyModal.querySelector(".item-log-btn");
        itemLogBtn._handler = itemLogHandler;
        itemLogBtn.addEventListener("click", itemLogHandler);

        // open modal
        historyModal.show();
    });

// close history modal
document.querySelector(".history-close-btn").addEventListener("click", () => {
    // remove overlay
    document.querySelector(".overlay").classList.add("hidden");

    // get modal element
    let historyModal = document.querySelector("#history-modal");

    // reset title and table
    historyModal.querySelector(".history-modal-title-div").textContent = "";
    resetHistoryTable();

    // remove button handlers
    let changeLogBtn = historyModal.querySelector(".loc-log-btn");
    if (changeLogBtn._handler) {
        changeLogBtn.removeEventListener("click", changeLogBtn._handler);
        delete changeLogBtn._handler;
    }
    let itemLogBtn = historyModal.querySelector(".item-log-btn");
    if (itemLogBtn._handler) {
        itemLogBtn.removeEventListener("click", itemLogBtn._handler);
        delete itemLogBtn._handler;
    }

    historyModal.close();
});
