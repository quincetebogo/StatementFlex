import { Component, css, html } from 'platform/elements';

import 'platform/components/popups/Modal';
import 'app/components/common/HorizonEmailInput';

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

		this.modalHeader = `View and send document`;
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			modalHeader: { type: String, state: false }
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

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				capitec-label[type="subtitle"] {
					line-height: 24px;
					--theme-label-subtitle-font-size: 18px;
					--theme-label-subtitle-font-weight: 600;
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
				capitec-label[type="strong"] {
					line-height: 20px;
					cursor: pointer;

					--theme-label-font-color: #009DE0;
					--theme-label-strong-font-size: 16px;
					--theme-label-strong-font-weight: 600;
				}
				.seperator {
					width: 100%;
					border: 1px solid #E1E1E1;
					margin-bottom: 30px;
					margin-top: 30px;
				}
			`
		];
	}

	_webTemplate() {
		return html`
			<capitec-modal type="form" header="${this.modalHeader}">
				<div slot="body">
					<horizon-email-input
						labelOne="Email"
						labelTwo="Confirm Email"
						?showRequiredError="${false}">
					</horizon-email-input>
					<hr class="seperator">
					<capitec-label
						label="View Document(s)"
						type="subtitle">
					</capitec-label>
					<horizon-product-tile
						class="view-document"
						type="default"
						label="Test Document Label"
						subtitle="Test Document Subtitle">
						<capitec-label
							slot="detail"
							type="strong"
							label="View Document"
							@click="${() => true}">
						</capitec-label>
					</horizon-product-tile>
				</div>
				<capitec-button slot="footer" type="secondary" label="Cancel"></capitec-button>
				<capitec-button slot="footer" type="primary" label="Send"></capitec-button>
			</capitec-modal>
		`;
	}

}

window.customElements.define(`horizon-view-and-send-document`, ViewAndEmailDocuments);