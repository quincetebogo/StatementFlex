/**
 * Email Object Request Payload
 * 
 * @readonly
 * @enum {Object} EMAIL_DOCUMENT_REQUEST_PAYLOAD
 */
export const EMAIL_DOCUMENT_REQUEST_PAYLOAD = {
	"email": ``,
	"title": ``,
	"surname": ``,
	"firstName": ``,
	"middleName": ``,
	"contactDetails": {
	  "cellphone": ``,
	  "homephone": ``,
	  "workphone": ``,
	  "email": ``
	},
	"gender": ``,
	"cifNumber": ``,
	"contractReference": ``,
	"documentInfo": [
	  {
		"documentID": ``,
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
	"markDocumentsAsAccepted": false,
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