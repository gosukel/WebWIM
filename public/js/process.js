let orderItems = {};

function addToOrder(name, item) {
    if (!orderItems[name]) {
        orderItems[name] = {
            itemWeight: item.weight * item.qty,
            itemPallet: Number((item.qty / item.palletQty).toFixed(2)),
            itemQty: item.qty,
        };
        addToOrderList(orderItems[name]);
    } else {
        orderItems[name].itemWeight += item.weight * item.qty;
        orderItems[name].itemQty += item.qty;
        orderItems[name].itemPallet = Number(
            (orderItems[name].itemQty / item.palletQty).toFixed(2)
        );
        updateOrderList(orderItems[name]);
    }
    console.log(Object.values(orderItems));
    calculateTotal();
}

function calculateTotal() {
    let weight = 0;
    let pallet = 0;
    let qty = 0;
    Object.values(orderItems).forEach((item) => {
        weight += item.itemWeight;
        pallet += item.itemPallet;
        qty += item.itemQty;
    });
    totalPallet = Math.ceil(pallet);
    console.log(
        `Weight: ${weight} \nPallet Count: ${totalPallet} (${pallet}) \nQty: ${qty}`
    );
}

function addToOrderList(item) {
    return;
}

function updateOrderList(item) {
    return;
}

function queryBrand(brand = "") {
    return;
}

document.querySelectorAll(".item-list-item").forEach((li) => {
    li.addEventListener("click", () => {
        // console.log("clicked");
        document.querySelectorAll(".item-list-item").forEach((el) => {
            // console.log(el);
            el.classList.remove("selected");
        });
        li.classList.add("selected");
    });
});

document.querySelector(".add-btn").addEventListener("click", () => {
    let itemElement = document.querySelector(".selected");
    let qty = Number(document.querySelector(".add-qty").value);
    if (!itemElement || qty < 1) return;
    let item = {
        name: itemElement.dataset.item,
        weight: Number(itemElement.dataset.weight),
        palletQty: Number(itemElement.dataset.palletqty),
        qty: qty,
    };
    // console.log(item);
    addToOrder(item.name, item);
    // console.log(orderItems);
});
