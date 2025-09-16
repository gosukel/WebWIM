// add pallet function
function addPallet() {
    // parent div
    const skidContainer = document.querySelector(".skid-container");
    // new skid div
    const newSkid = document.createElement("div");
    newSkid.classList.add("skid");
    skidContainer.appendChild(newSkid); // add new skid to parent container
    // density div
    const densityDiv = document.createElement("div");
    densityDiv.classList.add("density");
    newSkid.appendChild(densityDiv); // add density div to newSkid div
    // skid details div
    const newSkidDetails = document.createElement("div");
    newSkidDetails.classList.add("skid-details");
    newSkid.appendChild(newSkidDetails); // add skid details div to newSkid div
    // weight div
    const weightDiv = document.createElement("div");
    newSkidDetails.appendChild(weightDiv); // add weight div to to newSkid div
    // weight div input and span
    const weightInput = document.createElement("input");
    weightInput.setAttribute("type", "number");
    weightInput.setAttribute("placeholder", "0");
    weightInput.classList.add("input-weight");
    const weightSpan = document.createElement("span");
    weightSpan.innerText = "lbs";
    weightDiv.append(weightInput, weightSpan); // add input and span to weight div
    // length div
    const lengthDiv = document.createElement("div");
    newSkidDetails.appendChild(lengthDiv); // add weight div to to newSkid div
    // length div input and span
    const lengthInput = document.createElement("input");
    lengthInput.setAttribute("type", "number");
    lengthInput.setAttribute("placeholder", "0");
    lengthInput.classList.add("input-length");
    const lengthSpan = document.createElement("span");
    lengthSpan.innerText = "in.";
    lengthDiv.append(lengthInput, lengthSpan); // add input and span to length div
    // width div
    const widthDiv = document.createElement("div");
    newSkidDetails.appendChild(widthDiv); // add width div to to newSkid div
    // weidth div input and span
    const widthInput = document.createElement("input");
    widthInput.setAttribute("type", "number");
    widthInput.setAttribute("placeholder", "0");
    widthInput.classList.add("input-width");
    const widthSpan = document.createElement("span");
    widthSpan.innerText = "in.";
    widthDiv.append(widthInput, widthSpan); // add input and span to width div
    // height div
    const heightDiv = document.createElement("div");
    newSkidDetails.appendChild(heightDiv); // add height div to to newSkid div
    // height div input and span
    const heightInput = document.createElement("input");
    heightInput.setAttribute("type", "number");
    heightInput.setAttribute("placeholder", "0");
    heightInput.classList.add("input-height");
    const heightSpan = document.createElement("span");
    heightSpan.innerText = "in.";
    heightDiv.append(heightInput, heightSpan); // add input and span to height div
    return;
}

// calculate
function calculate() {
    console.log("calculating");
    const skids = document.querySelectorAll(".skid");
    for (let i = 0; i < skids.length; i++) {
        let weight = Number(skids[i].querySelector(".input-weight").value);
        let length = Number(skids[i].querySelector(".input-length").value);
        let width = Number(skids[i].querySelector(".input-width").value);
        let height = Number(skids[i].querySelector(".input-height").value);
        if (weight <= 0 || length <= 0 || width <= 0 || height <= 0) {
            console.log("skipping...");
            continue;
        }
        let densityDiv = skids[i].querySelector(".density");
        let densityValue = (
            weight /
            ((length * width * height) / 1728)
        ).toFixed(1);
        densityDiv.innerText = densityValue;
        let densityClass = "";
        if (densityValue >= 10) {
            densityClass = "dense-max";
        } else if (densityValue >= 6) {
            densityClass = "dense-med";
        } else {
            densityClass = "dense-min";
        }
        densityDiv.classList.add("active", densityClass);
        skids[i].querySelector(".skid-details").classList.add("slide");
        console.log(weight, length, width, height);
    }
    return;
}

// add event listeners
document.querySelector("#btn-add-pallet").addEventListener("click", addPallet);
document.querySelector("#btn-calc").addEventListener("click", calculate);
