class ProcessError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 400;
        this.name = "ProcessError";
    }
}

export default ProcessError;
