// ASSORTED FUNCTIONS

// fetch function
async function fetchLocations(q, sort = "", direction = "") {
    const result = await fetch(
        `/locations/query?search=${encodeURIComponent(q)}&sortParams=${encodeURIComponent(sort)}&sortDirection=${encodeURIComponent(direction)}`
    );
    const locations = await result.json();
    updateLocTable(locations);
    // console.log(`locations - ${locations}`);
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
    parentRow.addEventListener("click", () => {
        locationParentListener(parentRow);
    });
    //               ROW COLUMNS <td>
    // td col-loc
    let colLoc = document.createElement("td");
    colLoc.classList.add("col-loc");
    colLoc.textContent = loc.location;
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
    colItem.textContent = loc.items[0]?.item?.item || "-";
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
    let itemString = "All Items ";
    loc.items.forEach((item) => {
        itemString += `- ${item.item.item}`;
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
// add location
document.querySelector(".btn-loc-add").addEventListener("click", () => {
    // activate overlay
    document.querySelector(".overlay").classList.remove("hidden");

    // open modal
    let modal = document.querySelector("dialog");

    // prep modal text
    modal.querySelector("p").textContent = "ADD NEW LOCATION";
    let submitBtn = modal.querySelector(".modal-submit-btn");

    // show loc-prev-container
    document.querySelector(".loc-prev-container").classList.add("show");

    modal.show();
});

// edit location
document.querySelector(".btn-loc-edit").addEventListener("click", () => {
    // activate overlay
    document.querySelector(".overlay").classList.remove("hidden");

    // open modal
    let modal = document.querySelector("dialog");

    // prep modal text
    modal.querySelector("p").textContent = "EDIT LOCATION";
    let submitBtn = modal.querySelector(".modal-submit-btn");

    // temp show loc id for styling
    document.querySelector("#loc-id").classList.add("show");

    // show loc-items-container
    document.querySelector(".loc-items-container").classList.add("show");

    modal.show();
});

// temp close modal button
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

    // close modal
    modal.close();
}
