/**
 * Email Object Request Payload
 * 
 * @readonly
 * @enum {Object} EMAIL_DOCUMENT_REQUEST_PAYLOAD
 */
export const EMAIL_DOCUMENT_REQUEST_PAYLOAD = {
	"email": ``,
	"cifNumber": ``,
	"contractReference": ``,
	"documentInfo": [
		{
			"documentId": ``,
			"documentType": ``,
			"documentGuid": ``,
			"content": {
				"value": ``,
				"type": ``
			}
		}
	]
};

/**
 * Generate document Request Payload
 * 
 * @readonly
 * @enum {Object} GENERATE_DOCUMENT_REQUEST_PAYLOAD
 */
export const GENERATE_DOCUMENT_REQUEST_PAYLOAD = {
	"documentFormat": `PDF`,
	"saveDocumentToDocumentum": false,
	"returnDocumentContent": true,
	"emailDocumentToClient": false,
	"wetsignBarcode": false,
	"clientDetails": {
		"cifNumber": ``,
		"policyContractReference": ``,
		"firstName": ``,
		"surname": ``,
		"idNumber": ``,
		"dateOfBirth": ``
	},
	"contractReference": ``
};