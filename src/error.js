class TauChartError extends Error {
    constructor(message, errorCode) {
        super();
        this.name = 'TauChartError';
        this.message = message;
        this.errorCode = errorCode;
    }
}

const errorCodes = {
    INVALID_DATA_TO_STACKED_BAR_CHART: 'INVALID_DATA_TO_STACKED_BAR_CHART',
    NO_DATA: 'NO_DATA',
    NOT_SUPPORTED_TYPE_CHART: 'NOT_SUPPORTED_TYPE_CHART',
    UNKNOWN_UNIT_TYPE: 'UNKNOWN_UNIT_TYPE'
};

export {TauChartError, errorCodes};