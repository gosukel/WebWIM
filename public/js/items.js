function itemParentListener(parent) {
    let childElement = parent.nextElementSibling.querySelector(
        ".item-child-content"
    );

    if (childElement.classList.contains("show")) {
        childElement.classList.toggle("show");
        parent.classList.remove("selected");
    } else {
        document.querySelectorAll(".item-parent.selected").forEach((e) => {
            e.classList.remove("selected");
            e.nextElementSibling
                .querySelector(".item-child-content")
                .classList.remove("show");
        });
        childElement.classList.toggle("show");
        parent.classList.toggle("selected");
    }
}

async function fetchItems(q, sort = "", direction = "") {
    const res = await fetch(
        `/items/query?search=${encodeURIComponent(q)}&sortParams=${encodeURIComponent(sort)}&sortDirection=${encodeURIComponent(direction)}`
    );
    const items = await res.json();
    updateItemsTable(items);
}
function debounce(func, delay) {
    let timoutId;
    return function (...args) {
        clearTimeout(timoutId);
        timoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}
const debouncedFetch = debounce(fetchItems, 300);

function updateItemsTable(items) {
    const parentTbody = document.querySelector("tbody");

    // clear table
    while (parentTbody.firstChild) {
        parentTbody.removeChild(parentTbody.firstChild);
    }

    // create new row for each item
    for (let i = 0; i < items.length; i++) {
        let newRowSet = createTableRowSet(items[i], i);
        parentTbody.append(newRowSet[0], newRowSet[1]);
    }
}

function createTableRowSet(item, idx) {
    // tr item-parent odd/even
    // data-itemid="<%= items[i].id %>
    let parentRow = document.createElement("tr");
    let oddEven = (idx + 1) % 2 === 0 ? "even" : "odd";
    parentRow.classList.add("item-parent");
    parentRow.classList.add(oddEven);
    parentRow.dataset.itemid = item.id;
    parentRow.addEventListener("click", () => {
        itemParentListener(parentRow);
    });
    // td col-item
    let colItem = document.createElement("td");
    colItem.classList.add("col-item");
    colItem.textContent = item.name;
    parentRow.appendChild(colItem);
    // td col-num
    let colNum = document.createElement("td");
    colNum.classList.add("col-num");
    colNum.textContent = item.number;
    parentRow.appendChild(colNum);
    // td col-loc
    let colLoc = document.createElement("td");
    colLoc.classList.add("col-loc");
    colLoc.textContent = item.locations[0]?.location?.name || "-";
    parentRow.appendChild(colLoc);
    // td col-brand
    let colBrand = document.createElement("td");
    colBrand.classList.add("col-brand");
    colBrand.textContent = item.brand;
    parentRow.appendChild(colBrand);
    // td col-type
    let colType = document.createElement("td");
    colType.classList.add("col-type");
    colType.textContent = item.type;
    parentRow.appendChild(colType);
    // td col-weight
    let colWeight = document.createElement("td");
    colWeight.classList.add("col-weight");
    colWeight.textContent = `${item.weight}lbs`;
    parentRow.appendChild(colWeight);
    // td col-pallet
    let colPallet = document.createElement("td");
    colPallet.classList.add("col-pallet");
    colPallet.textContent = `x${item.palletQty}`;
    parentRow.appendChild(colPallet);
    // td col-onhand
    let colOnhand = document.createElement("td");
    colOnhand.classList.add("col-onhand");
    colOnhand.textContent = item.onHand;
    parentRow.appendChild(colOnhand);

    // tr item-child
    let childRow = document.createElement("tr");
    childRow.classList.add("item-child");
    // td
    let locTd = document.createElement("td");
    locTd.setAttribute("colspan", "8");
    childRow.appendChild(locTd);
    // div item-child-content
    let childDiv = document.createElement("div");
    childDiv.classList.add("item-child-content");
    let locationString = "All Locations - ";
    item.locations.forEach((loc) => {
        locationString += ` ${loc.location.name}`;
    });
    childDiv.textContent = locationString;
    locTd.appendChild(childDiv);
    return [parentRow, childRow];
}

function resetHeaders(el = "") {
    document.querySelectorAll("th").forEach((e) => {
        if (el != e) {
            e.classList.remove("sorted");
            e.dataset.direction = "asc";
            e.querySelector("span").textContent = " ";
        }
    });
}

const search = document.querySelector("input#items-search");
search.addEventListener("input", () => {
    debouncedFetch(search.value);
    resetHeaders();
});

function getItemDetails(parent, child) {
    let locations = child.textContent
        .replace("\n", "")
        .replace("All Locations - ", "")
        .trim()
        .split(" ");
    let locationString = "";
    locations.forEach((loc) => {
        locationString += `${loc} `;
    });

    let curItem = {
        itemId: parent.dataset.itemid,
        name: parent.querySelector(".col-item").textContent,
        number: parent.querySelector(".col-num").textContent,
        brand: parent.querySelector(".col-brand").textContent,
        type: parent.querySelector(".col-type").textContent,
        weight: parseInt(
            parent.querySelector(".col-weight").textContent.replace("lbs", "")
        ),
        pallet: parseInt(
            parent.querySelector(".col-pallet").textContent.replace("x", "")
        ),
        locations: locationString,
    };

    return curItem;
}

function prepEditForm(item) {
    // set placeholder values
    document.querySelector("#item-id").value = item.itemId;
    document.querySelector("#item-id").classList.add("show");
    document.querySelector("#item-name").value = item.name;
    document.querySelector("#item-number").value = item.number;
    document.querySelector("#item-brand").value = item.brand;
    document.querySelector("#item-type").value = item.type;
    document.querySelector("#item-weight").value = item.weight;
    document.querySelector("#item-pallet").value = item.pallet;
    document.querySelector("#item-location").value = item.locations;
}

document.querySelectorAll(".item-parent").forEach((parent) => {
    parent.addEventListener("click", () => {
        itemParentListener(parent);
    });
});

document.querySelectorAll("th").forEach((el) => {
    el.addEventListener("click", () => {
        resetHeaders(el);
        el.classList.add("sorted");
        let curSearch = document.querySelector("input#items-search").value;
        let sortParams = el.dataset.sort;
        let sortDirection = el.dataset.direction;
        el.querySelector("span").textContent =
            sortDirection === "asc" ? "▲" : "▼";
        fetchItems(curSearch, sortParams, sortDirection);

        el.dataset.direction = sortDirection === "asc" ? "desc" : "asc";
    });
});

// ADD ITEM FUNCTION
async function addItem(e) {
    // get data from form
    let form = modal.querySelector(".item-form");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    let noticeContainer = document.querySelector(".notice-container");
    let noticeText = noticeContainer.querySelector(".notice-text");
    // try to submit form data
    try {
        const res = await fetch("/items/new", {
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
            return;
        } else {
            noticeContainer.classList.remove("error");
            noticeContainer.classList.add("success");
            noticeContainer.classList.add("show");
            noticeText.textContent = "Item Added Successfully!";
        }
        document.querySelector("#items-search").value = data["item-name"];
        fetchItems(`${data["item-name"]}`);
        closeModal();
    } catch (err) {
        noticeContainer.classList.remove("success");
        noticeContainer.classList.add("error");
        noticeContainer.classList.add("show");
        noticeText.textContent = "Network error, please try again.";
    }
    return;
}

function getChanges(curItem, data) {
    let changes = false;
    // name
    if (curItem.name != data["item-name"].toUpperCase()) {
        changes = true;
    }
    // number
    if (curItem.number != data["item-number"]) {
        changes = true;
    }
    // brand
    if (curItem.brand != data["item-brand"]) {
        changes = true;
    }
    // type
    if (curItem.type != data["item-type"]) {
        changes = true;
    }
    // weight
    if (curItem.weight != Number(data["item-weight"])) {
        changes = true;
    }
    // palletQty
    if (curItem.pallet != Number(data["item-pallet"])) {
        changes = true;
    }
    // locations
    if (data["item-location"].trim() != curItem.locations.trim()) {
        changes = true;
    }
    return changes;
}

// EDIT ITEM FUNCTION
async function editItem(curItem) {
    // get data from form
    let form = modal.querySelector(".item-form");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // check for no change
    let changes = getChanges(curItem, data);
    if (!changes) {
        console.log("no change");
        return;
    }

    let noticeContainer = document.querySelector(".notice-container");
    let noticeText = noticeContainer.querySelector(".notice-text");

    // try to submit form data
    try {
        const res = await fetch("/items/edit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const result = await res.json();
        if (!res.ok) {
            // error has occurred
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
        document.querySelector("#items-search").value = data["item-name"];
        fetchItems(`${data["item-name"]}`);
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
        await addItem(e);
    };
}

// OPEN MODAL TO ADD ITEM
document.querySelector(".btn-item-add").addEventListener("click", () => {
    // activate overlay
    document.querySelector(".overlay").classList.remove("hidden");

    // open modal
    let modal = document.querySelector(".modal");

    // prep modal text
    modal.querySelector("p").textContent = "ADD ITEM TO WAREHOUSE";
    let submitBtn = modal.querySelector(".modal-submit-btn");

    // create handler function
    const handler = createAddHandler();
    submitBtn._handler = handler;

    // add listener to submit button
    submitBtn.addEventListener("click", handler);
    modal.show();
});

function createEditHandler(item) {
    return async function (e) {
        e.preventDefault();
        await editItem(item);
    };
}
// OPEN MODAL TO EDIT ITEM
document.querySelector(".btn-item-edit").addEventListener("click", () => {
    // check for selected item
    let selectedItem = document.querySelector(".selected");
    if (!selectedItem) return;
    let childElement = selectedItem.nextElementSibling.querySelector(
        ".item-child-content"
    );

    // prepare edit form with current values
    let curItem = getItemDetails(selectedItem, childElement);
    prepEditForm(curItem);

    // activate overlay
    document.querySelector(".overlay").classList.remove("hidden");

    // open modal
    let modal = document.querySelector(".modal");

    // prep modal text
    modal.querySelector("p").textContent = "EDIT ITEM";
    let submitBtn = modal.querySelector(".modal-submit-btn");

    // create handler function for button
    const handler = createEditHandler(curItem);
    submitBtn._handler = handler;

    // add handler function to submit button
    submitBtn.addEventListener("click", handler);
    modal.show();
});

// CLOSE MODAL BUTTON
document
    .querySelector(".modal-close-btn")
    .addEventListener("click", closeModal);

// CLOSE MODAL BUTTON FUNCTION
function closeModal() {
    // remove overlay
    document.querySelector(".overlay").classList.add("hidden");
    // close modal
    let modal = document.querySelector(".modal");
    modal.querySelector("form").setAttribute("action", "");
    modal.querySelector("p").textContent = "";
    modal.querySelectorAll("input, select").forEach((i) => {
        i.value = "";
    });

    const submitBtn = modal.querySelector(".modal-submit-btn");
    if (submitBtn._handler) {
        submitBtn.removeEventListener("click", submitBtn._handler);
        delete submitBtn._handler;
    }

    modal.querySelector("#item-id").classList.remove("show");
    modal.close();
}

//         DEL MODAL

// delete modal handler
function createDelHandler(id, name) {
    return async function () {
        await deleteItem(id, name);
    };
}
// actual delete function
// FIX THIS FUNCTION
async function deleteItem(id, name) {
    if (!id) return;
    const item = { id, name };
    let noticeContainer = document.querySelector(".notice-container");
    let noticeText = noticeContainer.querySelector(".notice-text");
    try {
        const res = await fetch("/items/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
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
            noticeText.textContent = "Item Deleted Successfully!";
            fetchItems("");
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
// open del modal
document.querySelector(".btn-item-del").addEventListener("click", () => {
    // check for selected item
    let selectedItem = document.querySelector(".selected");
    if (!selectedItem) return;
    let itemName = selectedItem.querySelector(".col-item").textContent;
    let itemId = selectedItem.dataset.itemid;

    // add overlay
    document.querySelector(".overlay").classList.remove("hidden");

    document.querySelector(".del-modal-item").textContent = itemName;

    let delModal = document.querySelector(".del-modal");
    let delBtn = document.querySelector(".del-modal-submit-btn");

    // create handler function
    const handler = createDelHandler(itemId, itemName);
    delBtn._handler = handler;

    // add handler function to btn
    delBtn.addEventListener("click", handler);

    delModal.show();
});
// close del modal function
function closeDelModal() {
    // remove overlay
    document.querySelector(".overlay").classList.add("hidden");
    // get modal element
    let delModal = document.querySelector(".del-modal");
    // reset item name
    delModal.querySelector(".del-modal-item").textContent = "";
    // remove delbtn handler
    const delBtn = delModal.querySelector(".del-modal-submit-btn");
    if (delBtn._handler) {
        delBtn.removeEventListener("click", delBtn._handler);
        delete delBtn._handler;
    }
    // close del modal
    delModal.close();
}

document
    .querySelector(".del-modal-close-btn")
    .addEventListener("click", closeDelModal);
