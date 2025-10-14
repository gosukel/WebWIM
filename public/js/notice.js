document.querySelector(".notice-close").addEventListener("click", () => {
    let container = document.querySelector(".notice-container");
    container.classList.remove("show");
    // container.classList.remove("success");
    // container.classList.remove("error");
});
