// ITEM VARIABLES
// const allItems = window.items;
const orderItems = {};
let selectedOrder;

// SEARCH/FILTER FUNCTIONS
async function fetchItems(q) {
    const result = await fetch(`/items/query?search=${encodeURIComponent(q)}`);
    const items = await result.json();
    updateItemList(items);
}

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

const debouncedSearch = debounce(fetchItems, 300);

function updateItemList(items) {
    // delete previous list elements
    const ulParent = document.querySelector(".item-list");
    while (ulParent.firstChild) {
        ulParent.removeChild(ulParent.firstChild);
    }

    // create new <li> for each item
    items.forEach((item) => {
        let newListItem = document.createElement("li");
        newListItem.classList.add("item-list-item");
        newListItem.dataset.item = item.name;
        newListItem.dataset.weight = item.weight;
        newListItem.dataset.palletqty = item.palletQty;
        addSelectListener(newListItem);
        let newListItemText = document.createElement("p");
        newListItemText.classList.add("item-name");
        newListItemText.textContent = item.name;
        newListItem.appendChild(newListItemText);
        ulParent.appendChild(newListItem);
    });
}

function addSelectListener(li) {
    li.addEventListener("click", () => {
        document.querySelectorAll(".item-list-item").forEach((el) => {
            el.classList.remove("selected");
        });
        li.classList.add("selected");
    });
}

// ORDER LIST FUNCTIONS
function addToOrder(item) {
    if (!orderItems[item.name]) {
        orderItems[item.name] = {
            itemName: item.name,
            itemWeight: item.weight * item.qty,
            itemPallet: Number((item.qty / item.palletQty).toFixed(2)),
            itemQty: item.qty,
        };
        addToOrderList(orderItems[item.name]);
    } else {
        orderItems[item.name].itemWeight += item.weight * item.qty;
        orderItems[item.name].itemQty += item.qty;
        orderItems[item.name].itemPallet = Number(
            (orderItems[item.name].itemQty / item.palletQty).toFixed(2)
        );
        updateOrderList(orderItems[item.name]);
    }
}

function addToOrderList(item) {
    const tableBody = document.querySelector("tbody");
    const newRow = createOrderRow(item);
    tableBody.appendChild(newRow);
    return;
}

function createOrderRow(item) {
    // create row
    const newRow = document.createElement("tr");
    newRow.id = `row-item-${item.itemName}`;
    // create row columns
    // qty
    const qtyCol = document.createElement("td");
    qtyCol.textContent = item.itemQty;
    qtyCol.classList.add("col-qty");
    newRow.appendChild(qtyCol);
    // name
    const nameCol = document.createElement("td");
    nameCol.textContent = item.itemName;
    nameCol.classList.add("col-name");
    newRow.appendChild(nameCol);
    // weight
    const weightCol = document.createElement("td");
    weightCol.textContent = item.itemWeight;
    weightCol.classList.add("col-weight");
    newRow.appendChild(weightCol);
    // palletQty
    const palletCol = document.createElement("td");
    palletCol.textContent = item.itemPallet;
    palletCol.classList.add("col-pallet");
    newRow.appendChild(palletCol);
    // remove
    const removeCol = document.createElement("td");
    removeCol.textContent = "x";
    removeCol.classList.add("col-remove");
    removeCol.addEventListener("click", () => {
        removeFromOrder(item.itemName);
        newRow.remove();
    });
    newRow.appendChild(removeCol);
    return newRow;
}

function updateOrderList(item) {
    const curItemRow = document.querySelector(`#row-item-${item.itemName}`);
    const curItemRowCols = curItemRow.querySelectorAll("td");
    curItemRowCols.forEach((td) => {
        if (td.className === "col-qty") {
            td.textContent = item.itemQty;
        } else if (td.className === "col-weight") {
            td.textContent = item.itemWeight;
        } else if (td.className === "col-pallet") {
            td.textContent = item.itemPallet;
        }
    });
    return;
}

function removeFromOrder(item = "all") {
    if (item === "all") {
        for (let prop in orderItems) {
            delete orderItems[prop];
        }
    } else {
        delete orderItems[item];
    }
}

function getOrderTotal() {
    let pieces = 0;
    let weight = 0;
    let pallet = 0;
    for (let property in orderItems) {
        pieces += orderItems[property].itemQty;
        pallet += orderItems[property].itemPallet;
        weight += orderItems[property].itemWeight;
    }

    let orderTotal = {
        totalPieces: pieces,
        totalPalletsDec: pallet.toFixed(2),
        totalPallets: Math.ceil(pallet),
        totalWeight: weight + Math.ceil(pallet) * 30,
    };
    return orderTotal;
}

// EVENT LISTENERS
// <input id="search"> event listener - debounce search query
const q = document.querySelector("input#search");
q.addEventListener("input", () => {
    let query = q.value;
    let selectedBrand = document.querySelector(".brand-btn.selected");

    if (selectedBrand) {
        query = `${query} ${selectedBrand.dataset.brand}`;
    }
    debouncedSearch(query);
});

// <button class="brand-btn"> event listener - filter items by brand
document.querySelectorAll(".brand-btn").forEach((btn) => {
    let brand = btn.dataset.brand;
    btn.addEventListener("click", () => {
        if (btn.classList.contains("selected")) {
            document.querySelectorAll(".brand-btn.selected").forEach((b) => {
                b.classList.remove("selected");
            });
            fetchItems("");
            return;
        }
        document.querySelectorAll(".brand-btn.selected").forEach((b) => {
            b.classList.remove("selected");
        });
        btn.classList.add("selected");
        fetchItems(brand);
    });
});

// <li> event listener - makes items in list selectable
document.querySelectorAll(".item-list-item").forEach((li) => {
    addSelectListener(li);
});

// <button class="add-btn"> event listener - adds selected item to order details
document.querySelector(".add-btn").addEventListener("click", () => {
    let itemElement = document.querySelector("li.selected");
    let qty = Number(document.querySelector(".add-qty").value);
    if (!itemElement || qty < 1) return;
    let item = {
        name: itemElement.dataset.item,
        weight: Number(itemElement.dataset.weight),
        palletQty: Number(itemElement.dataset.palletqty),
        qty: qty,
    };
    addToOrder(item);
});

function resetOrder() {
    const tableBody = document.querySelector("tbody");
    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
    }
    for (let prop in orderItems) {
        delete orderItems[prop];
    }
    document.querySelector("#order-num").value = "";
}

// <button class="clear-btn"> event listener - clears/resets the order window
document.querySelector(".clear-btn").addEventListener("click", () => {
    resetOrder();
});

function processOrderDetails(orderTotal) {
    let orderNumber = document.querySelector("#order-num").value;
    document.querySelector(".overlay").classList.remove("hidden");
    let modalDiv = document.querySelector(".modal");
    modalDiv.querySelector(".modal-title").textContent =
        `Order #: ${orderNumber}`;
    modalDiv.querySelectorAll("p").forEach((p) => {
        if (p.className === "modal-pallet") {
            p.textContent = `Pallets: ${orderTotal.totalPallets} (${orderTotal.totalPalletsDec})`;
        } else if (p.className === "modal-piece") {
            p.textContent = `Pieces: ${orderTotal.totalPieces}`;
        } else if (p.className === "modal-weight") {
            p.textContent = `Weight: ${orderTotal.totalWeight}lbs`;
        }
    });
    modalDiv.show();
}

// <button class="process-btn"> event listener - opens modal and (WIP) calculates order
document.querySelector(".process-btn").addEventListener("click", () => {
    let orderTotal = getOrderTotal();
    if (orderTotal.totalPieces === 0) return;
    processOrderDetails(orderTotal);
});

// <button class="modal-save-btn"> event listener - closes modal and (WIP) saves order details
document
    .querySelector(".modal-save-btn")
    .addEventListener("click", async () => {
        // check for order number
        let orderNumber = document.querySelector("#order-num").value;
        let noticeContainer = document.querySelector(".notice-container");
        let noticeText = noticeContainer.querySelector(".notice-text");
        let orderDetails = getOrderTotal();

        // if no order number, show error and stop
        if (!orderNumber) {
            noticeContainer.classList.remove("success");
            noticeContainer.classList.add("error");
            noticeContainer.classList.add("show");
            noticeText.textContent = "'Order #' required to save order";
            return;
        }

        let newOrder = {
            orderNumber: orderNumber,
            orderItems: orderItems,
            orderDetails: orderDetails,
        };
        try {
            const res = await fetch("/process/new", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newOrder),
            });
            result = await res.json();
            if (!res.ok) {
                // error has occurred
                noticeContainer.classList.remove("success");
                noticeContainer.classList.add("error");
                noticeContainer.classList.add("show");
                noticeText.textContent = result.error || "something went wrong";
            } else {
                // request successful
                noticeContainer.classList.remove("error");
                noticeContainer.classList.add("success");
                noticeContainer.classList.add("show");
                noticeText.textContent =
                    result.success || "Order Saved Successfully!";
            }
        } catch (error) {
            noticeContainer.classList.remove("success");
            noticeContainer.classList.add("error");
            noticeContainer.classList.add("show");
            noticeText.textContent = "Network Error, please try again";
            return;
        }

        document.querySelector(".modal").close();
        document.querySelector(".overlay").classList.add("hidden");
    });

// <button class="modal-close-btn"> event listener - closes modal
document.querySelector(".modal-close-btn").addEventListener("click", () => {
    document.querySelector(".modal").close();
    document.querySelector(".overlay").classList.add("hidden");
});

//                  ORDER LOG MODAL
async function fetchOrders(q = "", type = "") {
    const res = await fetch(
        `/process/query?search=${encodeURIComponent(q)}&type=${encodeURIComponent(type)}`
    );
    const orders = await res.json();
    if (type === "general") {
        updateOrderHistoryList(orders);
        return;
    }
    return orders;
}

function debounceOrder(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

const debouncedOrderFetch = debounceOrder(fetchOrders, 300);

const search = document.querySelector("input#order-search");
search.addEventListener("input", async () => {
    debouncedOrderFetch(search.value, "general");
});

function createOrderHistoryRow(item) {
    const newRow = document.createElement("tr");

    const itemTd = document.createElement("td");
    itemTd.classList.add("history-col-item");
    itemTd.textContent = item.item.name;
    newRow.appendChild(itemTd);

    const qtyTd = document.createElement("td");
    qtyTd.classList.add("history-col-qty");
    qtyTd.textContent = item.quantity;
    newRow.appendChild(qtyTd);

    return newRow;
}

function fillOrderHistoryTable(items) {
    const historyTableBody = document.querySelector(
        ".order-history-details-table tbody"
    );

    // clear table
    while (historyTableBody.firstChild) {
        historyTableBody.removeChild(historyTableBody.firstChild);
    }

    // add rows for each item
    for (let i = 0; i < items.length; i++) {
        let newTableRow = createOrderHistoryRow(items[i]);
        historyTableBody.append(newTableRow);
    }
}

function addListItemListener(li) {
    li.addEventListener("click", async () => {
        document.querySelectorAll(".order-list-item.selected").forEach((el) => {
            el.classList.remove("selected");
        });
        li.classList.add("selected");

        // get order information
        let orderDetails = await fetchOrders(li.dataset.ordernumber, "exact");
        selectedOrder = orderDetails;
        // set header details
        document.querySelector("p.order-user").textContent =
            orderDetails.user.nickname;
        document.querySelector("p.order-date").textContent =
            orderDetails.createdAt;
        document.querySelector("p.order-num-title").textContent =
            orderDetails.orderNumber;

        // set table details
        fillOrderHistoryTable(orderDetails.items);

        // set footer details
        let palletsInt = Math.ceil(orderDetails.palletCount);
        document.querySelector(
            ".order-plt-container .pallet-count"
        ).textContent = `${palletsInt}(${orderDetails.palletCount})`;
        document.querySelector(
            ".order-piece-container .piece-count"
        ).textContent = orderDetails.pieces;
        document.querySelector(
            ".order-weight-container .order-weight"
        ).textContent = `${orderDetails.weight} lbs`;
    });
}

function createListItem(order) {
    const listItem = document.createElement("li");
    listItem.classList.add("order-list-item");
    listItem.textContent = order.orderNumber;
    listItem.dataset.ordernumber = order.orderNumber;
    addListItemListener(listItem);
    return listItem;
}

function updateOrderHistoryList(orders) {
    const parentUl = document.querySelector(".order-list");

    // clear list
    while (parentUl.firstChild) {
        parentUl.removeChild(parentUl.firstChild);
    }

    // create new li for each order
    for (let i = 0; i < orders.length; i++) {
        let newListItem = createListItem(orders[i]);
        parentUl.append(newListItem);
    }
}

// <button class="log-btn"> event listener - opens order log modal
document.querySelector(".log-btn").addEventListener("click", async () => {
    const modal = document.querySelector("#order-log-modal");
    const orders = await fetchOrders();
    updateOrderHistoryList(orders);
    modal.show();
});

// <button class="order-copy"> event listener - creates copy of selected order
document.querySelector("button.order-copy").addEventListener("click", () => {
    if (!selectedOrder) return;

    resetOrder();
    document.querySelector("input#order-num").value = selectedOrder.orderNumber;
    for (let item of selectedOrder.items) {
        let addItem = {
            name: item.item.name,
            weight: item.item.weight,
            palletQty: item.item.palletQty,
            qty: item.quantity,
        };
        addToOrder(addItem);
    }
    closeHistoryModal();
});

// clost history modal function
function closeHistoryModal() {
    const modal = document.querySelector("#order-log-modal");

    //       reset modal
    // search input
    modal.querySelector("#order-search").value = "";
    //  header
    document.querySelector("p.order-user").textContent = "";
    document.querySelector("p.order-num-title").textContent = "";
    document.querySelector("p.order-date").textContent = "";
    //  table
    const historyTableBody = document.querySelector(
        ".order-history-details-table tbody"
    );
    while (historyTableBody.firstChild) {
        historyTableBody.removeChild(historyTableBody.firstChild);
    }
    //  footer
    document.querySelector("p.pallet-count").textContent = "";
    document.querySelector("p.piece-count").textContent = "";
    document.querySelector("p.order-weight").textContent = "";
    //      reset selectedorder
    selectedOrder = null;

    modal.close();
}

// <button class="close-log-modal-btn"> event listener - closes order log modal
document.querySelector(".close-log-modal-btn").addEventListener("click", () => {
    closeHistoryModal();
});
