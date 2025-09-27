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
    let parentRow = document.createElement("tr");
    let oddEven = (idx + 1) % 2 === 0 ? "even" : "odd";
    parentRow.classList.add("item-parent");
    parentRow.classList.add(oddEven);
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

document.querySelectorAll(".item-parent").forEach((parent) => {
    parent.addEventListener("click", () => {
        itemParentListener(parent);
    });
});

document.querySelectorAll("th").forEach((el) => {
    el.addEventListener("click", () => {
        resetHeaders(el);
        let curSearch = document.querySelector("input#items-search").value;
        let sortParams = el.dataset.sort;
        let sortDirection = el.dataset.direction;
        el.querySelector("span").textContent =
            sortDirection === "asc" ? "▲" : "▼";
        fetchItems(curSearch, sortParams, sortDirection);

        el.dataset.direction = sortDirection === "asc" ? "desc" : "asc";
    });
});
