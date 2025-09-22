document.querySelectorAll(".item-parent").forEach((parent) => {
    parent.addEventListener("click", () => {
        let childElement = parent.nextElementSibling;
        if (!childElement.classList.contains("hidden")) {
            childElement.classList.toggle("hidden");
        } else {
            document
                .querySelectorAll(".item-child-locations")
                .forEach((child) => {
                    if (!child.classList.contains("hidden")) {
                        child.classList.add("hidden");
                    }
                });
            childElement.classList.toggle("hidden");
        }
    });
});
