class LocationError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 400;
        this.name = "LocationError";
    }
}

export default LocationError;
