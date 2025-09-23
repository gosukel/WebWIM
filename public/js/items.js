document.querySelectorAll(".item-parent").forEach((parent) => {
    parent.addEventListener("click", () => {
        let childElement = parent.nextElementSibling.querySelector(
            ".item-child-content"
        );
        // console.log(childElement);
        // console.log(parent);
        if (childElement.classList.contains("show")) {
            childElement.classList.toggle("show");
            parent.classList.remove("selected");
            // console.log(parent);
        } else {
            // document
            //     .querySelectorAll(".item-child-content")
            //     .forEach((child) => {
            //         if (child.classList.contains("show")) {
            //             child.classList.remove("show");
            //             child.parentElement.parentElement.previousElementSibling.classList.remove(
            //                 "selected"
            //             );
            //             // console.log(
            //             //     child.parentElement.parentElement
            //             //         .previousElementSibling
            //             // );
            //         }
            //     });
            document.querySelectorAll(".item-parent.selected").forEach((p) => {
                p.classList.remove("selected");
                console.log(p);
                p.nextElementSibling
                    .querySelector(".item-child-content")
                    .classList.remove("show");
            });
            childElement.classList.toggle("show");
            parent.classList.toggle("selected");
            console.log(parent);
            console.log(childElement);
        }
    });
});
