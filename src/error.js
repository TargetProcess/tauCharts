class TauChartError extends Error {
    constructor(message, errorCode, errorArgs) {
        super();
        this.name = 'TauChartError';
        this.message = message;
        this.errorCode = errorCode;
        this.errorArgs = errorArgs;
    }
}

const errorCodes = {
    STACKED_FIELD_NOT_NUMBER: 'STACKED_FIELD_NOT_NUMBER',
    NO_DATA: 'NO_DATA',
    NOT_SUPPORTED_TYPE_CHART: 'NOT_SUPPORTED_TYPE_CHART',
    UNKNOWN_UNIT_TYPE: 'UNKNOWN_UNIT_TYPE',
    INVALID_LOG_DOMAIN: 'INVALID_LOG_DOMAIN'
};

export {TauChartError, errorCodes};