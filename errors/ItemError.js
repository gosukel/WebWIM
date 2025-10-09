class ItemError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 400;
        this.name = "ItemAddError";
    }
}

export default ItemError;
