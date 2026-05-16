//  ---------------------------------- CHANGE LOG ----------------------------------
// let adminBtnChangeLog = document.querySelector(".admin-btn.log-btn");
// adminBtnChangeLog.addEventListener("click", async () => {
//     // ignore if already selected
//     if (currentView === "changeLog") return;

//     // set view variable
//     currentView = "changeLog";

//     // set .selected button class
//     clearSelectedBtn();
//     adminBtnChangeLog.classList.add("selected");

//     // build and fill changle log
//     await buildChangeLog();
// });

// async function buildChangeLog() {
//     let mainContainer = clearMainView();
//     // build input container
//     let searchContainer = createSearchContainer();
//     mainContainer.appendChild(searchContainer);

//     // build logTable container
//     let logTable = createLogTableContainer();
//     mainContainer.appendChild(logTable);

//     // fill logTable
//     await fetchNotes("");
// }

// function createSearchContainer() {
//     // search container
//     let searchContainer = document.createElement("div");
//     searchContainer.classList.add("change-log-search-container");

//     // input
//     let searchInput = document.createElement("input");
//     searchInput.setAttribute("type", "text");
//     searchInput.setAttribute("name", "change-log-input");
//     searchInput.setAttribute("id", "change-log-input");
//     searchInput.classList.add("change-log-input");
//     searchContainer.appendChild(searchInput);
//     // svg
//     let searchIcon = createSearchIcon();
//     searchContainer.appendChild(searchIcon);

//     return searchContainer;
// }

// function createLogTableContainer() {
//     // div.change-log-table-container
//     let logTableContainer = document.createElement("div");
//     logTableContainer.classList.add("change-log-table-container");

//     // table.change-log-table
//     let logTable = document.createElement("table");
//     logTable.classList.add("change-log-table");
//     logTableContainer.appendChild(logTable);

//     // thead
//     let logTableHead = createLogTableHead();
//     logTable.appendChild(logTableHead);

//     // tbody
//     let tbody = document.createElement("tbody");
//     logTable.appendChild(tbody);

//     return logTableContainer;
// }

// function createLogTableHead() {
//     // thead
//     let thead = document.createElement("thead");
//     // tr
//     let tr = document.createElement("tr");
//     tr.setAttribute("scope", "col");

//     // th.log-date-head
//     let thDate = document.createElement("th");
//     thDate.classList.add("log-date-head");
//     thDate.textContent = "Date";
//     tr.appendChild(thDate);
//     // th.log-user-head
//     let thUser = document.createElement("th");
//     thUser.classList.add("log-user-head");
//     thUser.textContent = "User";
//     tr.appendChild(thUser);
//     // th.log-name-head
//     let thName = document.createElement("th");
//     thName.classList.add("log-name-head");
//     thName.textContent = "Entity Name";
//     tr.appendChild(thName);
//     // th.log-message-head
//     let thMessage = document.createElement("th");
//     thMessage.classList.add("log-message-head");
//     thMessage.textContent = "Message";
//     tr.appendChild(thMessage);
//     // th.log-id-head
//     let thId = document.createElement("th");
//     thId.classList.add("log-id-head");
//     thId.textContent = "LogID";
//     tr.appendChild(thId);

//     thead.appendChild(tr);
//     return thead;
// }

// async function fetchNotes(q) {
//     const res = await fetch(
//         `/admin/notes/query?search=${encodeURIComponent(q)}`,
//     );
//     const notes = await res.json();
//     updateNotesTable(notes);
//     return;
// }

// function debounce(func, delay) {
//     let timeoutId;
//     return function (...args) {
//         clearTimeout(timeoutId);
//         timeoutId = setTimeout(() => {
//             func.apply(this, args);
//         }, delay);
//     };
// }

// const debouncedFetch = debounce(fetchNotes, 300);

// function updateNotesTable(notes) {
//     const parentTbody = document.querySelector(".change-log-table tbody");

//     // clear table
//     while (parentTbody.firstChild) {
//         parentTbody.removeChild(parentTbody.firstChild);
//     }

//     // create new row for each note
//     for (let i = 0; i < notes.length; i++) {
//         let newRow = createNotesTableRow(notes[i], i);
//         parentTbody.appendChild(newRow);
//     }
// }

// function createNotesTableRow(note, idx) {
//     let newRow = document.createElement("tr");
//     let oddEven = (idx + 1) % 2 === 0 ? "even" : "odd";
//     newRow.classList.add("log-row", oddEven);
//     //      CREATE TDs FOR ROW
//     // td log-date
//     let colDate = document.createElement("td");
//     colDate.classList.add("log-date");
//     colDate.textContent = note.date;
//     newRow.appendChild(colDate);
//     // td log-user
//     let colUser = document.createElement("td");
//     colUser.classList.add("log-user");
//     colUser.textContent = note.user.nickname;
//     newRow.appendChild(colUser);
//     // td log-name
//     let colName = document.createElement("td");
//     colName.classList.add("log-name");
//     colName.textContent = note.entityName;
//     newRow.appendChild(colName);
//     // td log-messsage
//     let colMessage = document.createElement("td");
//     colMessage.classList.add("log-message");
//     colMessage.textContent = note.message;
//     newRow.appendChild(colMessage);
//     // td log-id
//     let colId = document.createElement("td");
//     colId.classList.add("log-id");
//     colId.textContent = note.logId;
//     let clipBoardIcon = createClipboardIcon(note.logId);
//     colId.appendChild(clipBoardIcon);
//     newRow.appendChild(colId);

//     // RETURN NEW ROW
//     return newRow;
// }

// function createClipboardIcon(logId) {
//     // parent span
//     let newSpan = document.createElement("span");
//     newSpan.classList.add("clipboard-icon");
//     newSpan.dataset.logid = logId;

//     let svgNS = "http://www.w3.org/2000/svg";
//     // svg element
//     let newSvg = createSVG(svgNS, "svg", {
//         xlmns: svgNS,
//         fill: "none",
//         viewBox: "0 0 24 24",
//         "stroke-width": "1.5",
//         stroke: "currentColor",
//         class: "size-6",
//     });

//     // pathElement
//     let newPath = createSVG(svgNS, "path", {
//         "stroke-linecap": "round",
//         "stroke-linejoin": "round",
//         d: "M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184",
//     });

//     newSvg.appendChild(newPath);
//     newSpan.appendChild(newSvg);

//     newSpan.addEventListener("click", () => {
//         let search = document.querySelector("#change-log-input");
//         search.value = logId;
//         debouncedFetch(logId);
//     });
//     return newSpan;
// }

// function createSearchIcon() {
//     let newSpan = document.createElement("span");
//     newSpan.classList.add("change-log-search-icon");

//     let svgNS = "http://www.w3.org/2000/svg";
//     // svg element
//     let newSvg = createSVG(svgNS, "svg", {
//         xlmns: svgNS,
//         fill: "none",
//         viewBox: "0 0 24 24",
//         "stroke-width": "1.8",
//         stroke: "currentColor",
//         class: "item-search-icon",
//     });

//     // pathElement
//     let newPath = createSVG(svgNS, "path", {
//         "stroke-linecap": "round",
//         "stroke-linejoin": "round",
//         d: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z",
//     });

//     newSvg.appendChild(newPath);
//     newSpan.appendChild(newSvg);

//     return newSpan;
// }

// function createSVG(ns, tag, attrs) {
//     const element = document.createElementNS(ns, tag);
//     for (const key in attrs) {
//         element.setAttribute(key, attrs[key]);
//     }
//     return element;
// }

// const search = document.querySelector("#change-log-input");
// search.addEventListener("input", () => {
//     debouncedFetch(search.value);
// });

// const clipboardIcons = document
//     .querySelectorAll(".clipboard-icon")
//     .forEach((clipboardIcon) => {
//         clipboardIcon.addEventListener("click", () => {
//             let logId = clipboardIcon.dataset.logid;
//             search.value = logId;
//             debouncedFetch(search.value);
//             // console.dir(clipboardIcon.dataset.logid);
//         });
//     });

// //  ---------------------------------- USERS ----------------------------------
// let adminBtnUsers = document.querySelector(".admin-btn.user-btn");
// adminBtnUsers.addEventListener("click", () => {
//     // ignore if already selected
//     if (currentView === "users") return;

//     // set view variable
//     currentView = "users";

//     // set .selected button class
//     clearSelectedBtn();
//     adminBtnUsers.classList.add("selected");

//     // reset main container
//     let mainContainer = clearMainView();
// });
