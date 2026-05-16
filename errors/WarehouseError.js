class WarehouseError extends Error {
    constructor(errorType, message) {
        super(message);
        this.statusCode = 400;
        this.name = errorType;
    }
}

export default WarehouseError;
