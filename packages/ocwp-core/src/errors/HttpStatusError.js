
/**
 * Custom error class that gets thrown when an HTTP request was not in the 
 * 200 - 299 status code range. Thrown by {@link HttpClient}.
 */
export class HttpStatusError extends Error {

    /**
     * Creates an instance of HttpStatusError.
     * 
     * @param {String} message Error message.
     * @param {Number} status HTTP Status code.
     * @param {String|Object} [output=null] Output as received from HTTP response body.
	 * @param {String} [correlationId=null] Correlation Id for HTTP request.
     */
	constructor(message, status, output = null, correlationId = null) {

		super(message);

        /**
        * HTTP Status code, e.g. 403.
        */
		this.status = status;

        /**
        * Output as received from HTTP response body.
        */
		this.output = output;

		/**
		* Correlation Id provided for the HTTP request.
		*/
		this.correlationId = correlationId;
	}
}