import { Component, html, unsafeHTML } from "platform/elements";

export class ModalController extends Component {
    // --------------
	// INITIALISATION
	// --------------

	/**
	 * Initialises the component.
	 *
	 * @hideconstructor
	 */
	constructor() {
		super();

        this.show = false;
		this.body = null;
		this.width = `200px`;
		this.height = `200px`;

        window.modalController = this;
        window.showDialog = this.showDialog;
        window.hideDialog = this.hideDialog;
    }

    // ----------
	// PROPERTIES
	// ----------

	// n/a

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// n/a

	// --------------
	// EVENT HANDLERS
	// --------------

	// n/a

	// --------------
	// PUBLIC METHODS
	// --------------

    showDialog(content) {
		const { htmlStr, width, height } = content;

		window.modalController.show = true;
		window.modalController.body = htmlStr;
		window.modalController.width = width;
		window.modalController.height = height;

		window.modalController.requestUpdate();
		
        return true;
	}

    hideDialog() {
        window.modalController.show = false;
		window.modalController.requestUpdate();
		
        return true;
    }

	_hideDialog() {
		this.hideDialog();
	}

    // ---------------
	// PRIVATE METHODS
	// ---------------

	// n/a

	// ---------
	// RENDERING
	// ---------

    /**
	 * Generates the component template for mobile mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_mobileTemplate() {
		return this._webTemplate();
	}

	/**
	 * Generates the component template for web mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {

		return window.modalController.show
        ? html`
			<capitec-modal
				type="free"
				header-align="left"
				header="Dialog">
					${this._renderbody()}
			</capitec-modal>`
        : html``;
	}

	_renderbody() {
		return html`${unsafeHTML(this.body)}`;
	}

	/**
	 * Generates the component template for kiosk mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {
		return this._webTemplate();
	}
}

window.customElements.define(`horizon-modal-controller`, ModalController);