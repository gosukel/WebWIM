class ItemAddError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 400;
        this.name = "ItemAddError";
    }
}

export default ItemAddError;
