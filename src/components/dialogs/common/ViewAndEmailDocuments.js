import { Component, css, html } from 'platform/elements';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'platform/components/popups/Modal';
import 'app/components/common/HorizonEmailInput';
import 'app/components/common/HorizonPDFViewer';

/**
 * Dialog for viewing and emailing documents. 
 * 
 * @export
 * @class ViewAndEmailDocuments
 * @extends Component
 */
export class ViewAndEmailDocuments extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.selectedDocumentToViewIndex = null;
		this.viewPDF = false;
		this.modalHeader = `View and send document(s)`;
		this.email = ``;
		this.confirmedEmail = ``;
		this.hasSendBeenClicked = false;
		this.isEmailInputAddressValid = false;
		this.encodedPDF = ``;
		this.loadDocumentContent = null;
		this.documents = [];
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} modalHeader - Text used in modal header
	 * @property {Array} documents - Array of documents' details intended to be sent and or viewed
	 * @property {Number} selectedDocumentToViewIndex - Index into documents array of the document selected to be viewed
	 * @property {Boolean} viewDPF - Flag used to display PDF viewer
	 * @property {String} email - Email added to email input field
	 * @property {String} confirmedEmail - Email added to confirm email input field; must match email input field
	 * @property {Boolean} isEmailInputAddressValid - Flag used to keep track of whether email input is a valid email address
	 * @property {Boolean} hasSendBeenClicked - Flag used to keep track of whether send button was clicked and used to enabled error messages on email input
	 * @property {String} encodedPDF - Encoded string representation of PDF to be view 
	 * 
	 * @callback loadDocumentContent 
	 * @returns {encodedPDF} - Specified (by some form of ID) PDF to load
	 * 
	 */
	static get properties() {
		return {
			modalHeader: { type: String, state: false },
			documents: { type: Array, state: false },
			selectedDocumentToViewIndex: { type: Number, state: false, attribute: false },
			viewPDF: { type: Boolean, state: false, attribute: false },
			email: { type: String, state: false, attribute: false },
			confirmedEmail: { type: String, state: false, attribute: false },
			isEmailInputAddressValid: { type: Boolean, state: false, attribute: false },
			hasSendBeenClicked: { type: Boolean, state: false, attribute: false },
			encodedPDF: { type: String },
			loadDocumentContent: { type: Object }
		};
	}

	// ----------------
	// LIFECYCLE EVENTS
	// ----------------

	connectedCallback() {
		super.connectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _onViewDocumentClick(index) {
		this.selectedDocumentToViewIndex = index;
		this.viewPDF = true;
		this.encodedPDF = await this.loadDocumentContent(this.documents[this.selectedDocumentToViewIndex]);
	}

	async _onNextPDFClick() {
		this.selectedDocumentToViewIndex += this.selectedDocumentToViewIndex < this.documents.length ? 1 : 0;
		this.encodedPDF = await this.loadDocumentContent(this.documents[this.selectedDocumentToViewIndex]);
		this.requestUpdate();
	}

	async _onPreviousPDFClick() {
		this.selectedDocumentToViewIndex -= this.selectedDocumentToViewIndex > 0 ? 1 : 0;
		this.encodedPDF = await this.loadDocumentContent(this.documents[this.selectedDocumentToViewIndex]);
		this.requestUpdate();
	}

	_onSendPDFClick(e) {
		this.hasSendBeenClicked = true;

		const isEmailInputValid = this._validateEmailAddressInput();

		if (!isEmailInputValid) {
			return;
		}

		this.dispatchEvent(new CustomEvent(`send-pdf-click`), {
			detail: {
				documents: this.documents,
				email: this.confirmedEmail
			}
		});
	}

	_onCancelSendPDFClick(e) {
		this.dispatchEvent(new CustomEvent(`cancel-send-pdf-click`), {});
	}

	_onEmailValueChanged(e) {
		this.email = e.detail.email;
		this.confirmedEmail = e.detail.confirmEmail;

		if (e.detail.invalidFormat || e.detail.mismatched) {
			this.isEmailInputAddressValid = false;
			return;
		}

		this.isEmailInputAddressValid = true;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_validateEmailAddressInput() {
		if (isNullorEmpty(this.email) || isNullorEmpty(this.confirmedEmail)) {
			return false;
		}

		return this.isEmailInputAddressValid;
	}

	_clearAlerts() {

	}
		

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				capitec-modal {
					--theme-modal-header-padding-left: 24px;
					--theme-modal-header-color: #3A3A3A;
					--theme-modal-header-background-color: #F7F7F7;
				}
				capitec-label[label="View Document(s)"] {
					line-height: 24px;
					padding-bottom: 16px;
					padding-top: 16px;
				}
				capitec-label[label="View Document"] {
					line-height: 20px;
					cursor: pointer;
					--theme-label-font-color: #009DE0;
					--theme-label-strong-font-size: 16px;
					--theme-label-strong-font-weight: 600;
				}
				capitec-label[type="subtitle"] {
					--theme-label-subtitle-font-size: 18px;
					--theme-label-subtitle-font-weight: 600;
				}
				capitec-alert-banner {
					padding-bottom: 24px;
				}
				capitec-alert-banner > capitec-label {
					margin: 16px 0px 16px 0px;
					--theme-label-font-size: 18px;
					--theme-label-font-family: Hind Vadodara;
				}
				horizon-product-tile {
					width: 100%;
					--theme-product-tile--height: 64px;
					--theme-product-tile-title-height: 20px;
					--theme-product-tile-title-font-size: 16px;
					--theme-product-tile-subtitle-height: 20px;
					--theme-product-tile-subtitle-font-size: 16px;
					--theme-product-tile-heading-margin-left: 16px;
					--theme-product-tile-heading-margin-left: 6px;
					--theme-layout-gap-spacing: 8px;
					--theme-product-tile-title-font-weight: 600;
					--theme-radio-disabled-border-color: #E1E1E1;
					--theme-radio-disabled-background-color: #F7F7F7;
				}
				.view-document {
					--theme-product-tile-heading-margin-left: 16px;
					--theme-product-tile-detail-top: 20px;
					--theme-product-tile-detail-right: 16px;
				}
				.seperator {
					border: 1px solid #E1E1E1;
					width: 100%;
				}
				capitec-content-box {
					height: 200px;
				}
			`
		];
	}

	_webTemplate() {
		return !this.viewPDF ? html`
			<capitec-modal type="form" header="${this.modalHeader}">
				<div slot="body">
					<horizon-email-input
						labelOne="Email"
						labelTwo="Confirm Email"
						email="${this.email}"
						confirmEmail="${this.confirmedEmail}"
						?showRequiredError="${this.hasSendBeenClicked}"
						@value-changed="${(e) => this._onEmailValueChanged(e)}"
						.callBack="${() => this._clearAlerts()}">
					</horizon-email-input>
					<hr class="seperator">
					<capitec-label
						label="View Document(s)"
						type="subtitle">
					</capitec-label>
					<capitec-content-box layout="vertical" noPadding>
						${this.documents.map((document, index) => this._renderDocumentTiles(document, index))}
					</capitec-content-box>
				</div>
				<capitec-button slot="footer" type="secondary" label="Cancel" @click="${(e) => this._onCancelSendPDFClick(e)}"></capitec-button>
				<capitec-button slot="footer" type="primary" label="Send" @click="${(e) => this._onSendPDFClick(e)}"></capitec-button>
			</capitec-modal>`
		: html`
			<horizon-pdf-viewer
				header="${this.modalHeader}"
				encodedPDF="${this.encodedPDF}"
				totalPages="${this.documents.length}"
				currPage="${this.selectedDocumentToViewIndex + 1}"
				@cancel="${() => this.viewPDF = false}"
				@next="${() => this._onNextPDFClick()}"
				@previous="${() => this._onPreviousPDFClick()}">
			</horizon-pdf-viewer>`;
	}

	_renderDocumentTiles(document, index) {
		return html`
			<horizon-product-tile
				class="view-document"
				type="default"
				label="${document.title}"
				subtitle="${document.subtitle}">
				<capitec-label
					slot="detail"
					type="strong"
					label="View Document"
					@click="${() => this._onViewDocumentClick(index)}">
				</capitec-label>
			</horizon-product-tile>
		`;
	}

}

window.customElements.define(`horizon-view-and-send-document`, ViewAndEmailDocuments);

/**
 * When the send button is clicked.
 * 
 * @example <horizon-view-and-send-document... @send-pdf-click="${this._handler}"></horizon-view-and-send-document>
 * 
 * @event ViewAndEmailDocuments#send-pdf-click
 * @type {Object}
 * @property {Array} documents - List of documents to be sent
 * @property {String} email - Email that the documents will be sent to
 */

/**
 * When the send button is clicked.
 * 
 * @example <horizon-view-and-send-document... @cancel-send-pdf-click="${this._handler}"></horizon-view-and-send-document>
 * 
 * @event ViewAndEmailDocuments#cancel-send-pdf-click
 * @type {Object} - N/A
 */