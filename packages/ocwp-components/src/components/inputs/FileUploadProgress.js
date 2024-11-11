import { Component, css, html } from '../../elements/index.js';

/**
 * The file upload progress component.
 * Used by the {@link FileUpload} component, in multi form, to stack the files together in one component
 *
 * ```js
 * import 'platform/components/inputs/FileUploadProgress';
 * ```
 *
 * ```html
 * <capitec-file-upload-progress
 *   message="Uploading..."
 *   messageType="default"
 *   fileExtension=""
 *   fileName=""
 *   fileSize=""
 *   allowedFile="">
 * </capitec-file-upload-progress>
 * ```
 */
export class FileUploadProgress extends Component {

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

		// Set the default property values.
		this.messageType = `default`;
		this.message = `Uploading...`;
		this.fileExtension = ``;
		this.fileName = ``;
		this.fileSize = ``;
		this.allowedFile = ``;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 *
	 * @property {String} [messageType="default"] - The type of message display:
	 * - `default` Undetermined outcome.
	 * - `status` Status of pending outcome.
	 * - `success` Successful outcome.
	 * - `error` Unsuccessful outcome.
	 * @property {String} message - The label string to display.
	 * @property {String} fileExtension - The file extension, to be displayed as a block
	 * @property {String} fileName - The name, with ellipsis if the width is exceeded
	 * @property {String} fileSize - The file size to be displayed
	 * @property {String} allowedFile - If the file is allowed, will display the appropriate components
	 */
	static get properties() {

		return {
			messageType: { type: String },
			message: { type: String },
			fileName: { type: String },
			fileSize: { type: String },
			fileExtension: { type: String },
			allowedFile: { type: String }
		};
	}

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

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// n/a

	// ---------
	// RENDERING
	// ---------

	/**
	 * Generates the component stylesheet.
	 *
	 * @ignore
	 * @returns {css} The css content of the component.
	 */
	static get styles() {

		return [
			super.styles,
			css`
				:host {
					box-sizing: border-box;
				}

				.container {
					display: flex;
					flex-direction: row;
					min-height: var(--theme-file-upload-progress-container-min-height);
					padding-top: var(--theme-file-upload-progress-container-padding-top);
					padding-right: var(--theme-file-upload-progress-container-padding-right);
					padding-bottom: var(--theme-file-upload-progress-container-padding-bottom);
					padding-left: var(--theme-file-upload-progress-container-padding-left);
					flex-wrap: wrap;
					gap: var(--theme-file-upload-progress-container-gap);
				}

				.separator {
					border-bottom: var(--theme-file-upload-progress-separator-border-bottom);
				}

				.file-extension-text {
					color: var(--theme-file-upload-progress-file-extension-text-color);
					font-family: var(--theme-font-family);
					font-size: var(--theme-file-upload-progress-file-extension-text-font-size);
					font-weight: bold;
					line-height: var(--theme-file-upload-progress-file-extension-text-line-height);
					justify-content: var(--theme-file-upload-common-justify-content);
					text-align: var(--theme-file-upload-common-text-align);
					align-items: var(--theme-file-upload-common-align-items);
					width: var(--theme-file-upload-progress-file-extension-text-width);
					border-radius: var(--theme-file-upload-progress-file-extension-text-border-radius);
					background-color: var(--theme-file-upload-progress-file-extension-text-background-color);
					display: var(--theme-file-upload-progress-file-extension-text-display);
					padding-left: var(--theme-file-upload-progress-file-extension-text-padding-left);
					padding-right: var(--theme-file-upload-progress-file-extension-text-padding-right);
				}

				.info {
					display: flex;
					flex: auto;
					flex-direction: column;
				}

				.document-info {
					color: var(--theme-file-upload-progress-document-info-color);
					font-family: var(--theme-font-family);
					font-size: var(--theme-file-upload-progress-document-info-font-size);
					font-weight: var(--theme-file-upload-progress-document-info-font-weight);
					line-height: var(--theme-file-upload-progress-document-info-line-height);
					min-width: var(--theme-file-upload-progress-document-info-min-width);
					text-overflow: ellipsis;
					white-space: nowrap;
					overflow: hidden;
				}

				.message-text {
					color: var(--theme-file-upload-progress-message-text-color);
					font-family: var(--theme-font-family);
					font-size: var(--theme-file-upload-progress-message-text-font-size);
					font-weight: var(--theme-file-upload-progress-message-text-font-weight);
					line-height: var(--theme-file-upload-progress-message-text-line-height);
				}

				.message-text.success {
					color: var(--theme-file-upload-progress-message-text-success-color);
				}

				.message-text.error {
					color: var(--theme-file-upload-progress-message-text-error-color);
				}

				.right {
					display: flex;
					flex-direction: row;
					justify-content: var(--theme-file-upload-common-justify-content);
					align-items: var(--theme-file-upload-common-align-items);
					text-align: var(--theme-file-upload-common-text-align);
					gap: var(--theme-file-upload-progress-right-gap);
				}

				.right.not-allowed {
					gap: var(--theme-file-upload-progress-right-not-allowed-gap);
				}

				.rotate {
					animation: var(--theme-file-upload-progress-rotate-animation);
					justify-content: var(--theme-file-upload-common-justify-content);
					align-items: var(--theme-file-upload-common-align-items);
					text-align: var(--theme-file-upload-common-text-align);
				}

				@keyframes rotate {
					to{ transform: rotate(360deg); }
				}

				.close {
					cursor: pointer;
				}

				.icons {
					height: var(--theme-file-upload-progress-icons-height);
				}

				.meta {
					display: flex;
					gap: var(--theme-file-upload-progress-meta-gap);
				}

				.close-info {
					display: flex;
					flex: 1;
					align-self: center;
					height: var(--theme-file-upload-progress-close-info-height);
					justify-content: var(--theme-file-upload-progress-close-info-justify-content);
					text-align: var(--theme-file-upload-common-text-align);
				}

				.retry {
					margin-right: var(--theme-file-upload-progress-retry-margin-right);
				}
			`
		];
	}

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

		return html`
			<div>
				<div class="container">
					<div class="file-extension-text">
						${this.fileExtension}
					</div>
					<div class="info">
						<div class="meta">
							<label class="document-info ellipsis">
								${this.fileName}
							</label>
							<label class="document-info">
								${this.fileSize}
							</label>
						</div>
						<label class="message-text ${this.messageType === `error` ? `error`
				: this.messageType === `success` ? `success` : ``}">
								${this.message}
						</label>
					</div>
					${this.renderClose()}
				</div>
				<div class="separator">
				</div>
			</div>
		`;
	}

	/**
	 * Generates the component template for kiosk mode.
	 *
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {

		return this._webTemplate();
	}

	renderClose() {
		if (this.allowedFile === `allowed`) {
			return html`
				<div class="close-info">
					<div class="right">
						${this.messageType === `error` ? html`
							<capitec-hyperlink class="retry"
								@click="${(e) => this.dispatchEvent(new CustomEvent(`retry`, { detail: {} }))}"
								label="Retry Upload">
							</capitec-hyperlink>`
					: ``}
							${this.messageType === `success` ? html`
								<img class="icons" src="./platform/icons/status/success.svg" />
								`
					: this.messageType === `error` ? html`
								<img class="icons" src="./platform/icons/status/error.svg" />
							`
						: html`
							<img src="./platform/icons/system/spinner-action.svg" class="rotate" />
						`}
							<img class="close" src="./platform/icons/system/close.svg"
								@click="${(e) => this.dispatchEvent(new CustomEvent(`cancel`, { detail: {} }))}" />
					</div>
				</div>
			`;
		}
		return html`
			<div class="close-info">
				<div class="right not-allowed">
					<img class="icons" src="./platform/icons/status/error.svg" />
					<img class="close" src="./platform/icons/system/close.svg"
						@click="${(e) => this.dispatchEvent(new CustomEvent(`cancel`, { detail: {} }))}" />
				</div>
			</div>
		`;
	}
}

window.customElements.define(`capitec-file-upload-progress`, FileUploadProgress);

/**
 * When the retry button is clicked.
 *
 * @example
 * <capitec-file-upload-progress ... @retry="${this._handler}"></capitec-file-upload-progress>
 *
 * @event FileUploadProgress#retry
 * @type {Object}
 * @property {Object} detail Empty object.
 */

/**
 * When the cancel button is clicked.
 *
 * @example
 * <capitec-file-upload-progress ... @cancel="${this._handler}"></capitec-file-upload-progress>
 *
 * @event FileUploadProgress#cancel
 * @type {Object}
 * @property {Object} detail Empty object.
 */