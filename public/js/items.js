const allItems = window.items;

function itemParentListener(parent) {
    let childElement = parent.nextElementSibling.querySelector(
        ".item-child-content"
    );

    if (childElement.classList.contains("show")) {
        childElement.classList.toggle("show");
        parent.classList.remove("selected");
    } else {
        document.querySelectorAll(".item-parent.selected").forEach((p) => {
            p.classList.remove("selected");
            p.nextElementSibling
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
    colItem.textContent = item.item;
    parentRow.appendChild(colItem);
    // td col-num
    let colNum = document.createElement("td");
    colNum.classList.add("col-num");
    colNum.textContent = item.number;
    parentRow.appendChild(colNum);
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
    locTd.setAttribute("colspan", "7");
    childRow.appendChild(locTd);
    // div item-child-content
    let childDiv = document.createElement("div");
    childDiv.classList.add("item-child-content");
    let locationString = "Locations ";
    item.locations.forEach((loc) => {
        locationString += `- ${loc.location.location}`;
    });
    childDiv.textContent = locationString;
    locTd.appendChild(childDiv);
    return [parentRow, childRow];
}

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
        .replaceAll(" ", "")
        .replaceAll("\n", "")
        .split("-")
        .slice(1);

    let locationString = "";
    locations.forEach((loc) => {
        locationString += `${loc}, `;
    });

    let curItem = {
        itemId: parent.dataset.itemid,
        item: parent.querySelector(".col-item").textContent,
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
    // console.log(curItem);
    return curItem;
}

function prepEditForm(item) {
    // set placeholder values
    document.querySelector("#item-id").value = item.itemId;
    document.querySelector("#item-id").classList.add("input-show");
    document.querySelector("#item-name").value = item.item;
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

// OPEN MODAL TO ADD ITEM
document.querySelector(".btn-add-item").addEventListener("click", () => {
    // activate overlay
    document.querySelector(".overlay").classList.remove("hidden");
    // open modal
    let modal = document.querySelector("dialog");
    modal.querySelector("form").setAttribute("action", "items/new");
    modal.querySelector("p").textContent = "ADD ITEM TO WAREHOUSE";
    modal.querySelector(".modal-submit-btn").textContent = "Add Item";
    modal.show();
});

// OPEN MODAL TO EDIT ITEM
document.querySelector(".btn-edit-item").addEventListener("click", () => {
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
    let modal = document.querySelector("dialog");
    modal.querySelector("form").setAttribute("action", "items/edit");
    modal.querySelector("p").textContent = "EDIT ITEM";
    modal.querySelector(".modal-submit-btn").textContent = "Edit Item";
    modal.show();
});

// CLOSE MODAL BUTTON
document.querySelector(".modal-close-btn").addEventListener("click", () => {
    // remove overlay
    document.querySelector(".overlay").classList.add("hidden");
    // close modal
    let modal = document.querySelector("dialog");
    modal.querySelector("form").setAttribute("action", "");
    modal.querySelector("p").textContent = "";
    modal.querySelectorAll("input").forEach((i) => {
        i.value = "";
    });
    modal.querySelector(".modal-submit-btn").textContent = "";
    modal.querySelector("#item-id").classList.remove("input-show");
    modal.close();
});
