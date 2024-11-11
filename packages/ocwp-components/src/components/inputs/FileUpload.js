import { Component, css, html } from '../../elements/index.js';
import { Utilities } from 'ocwp-core';

/**
 * An input control that allows a user to upload files.
 *
 * ```js
 * import 'platform/components/inputs/FileUpload';
 * ```
 *
 * ```html
 * <capitec-file-upload
 *   label="Select File"
 *   options="single"
 *   filesToUpload=[]
 *   fileTypes="jpg|bmp">
 * </capitec-file-upload>
 * ```
 */

export class FileUpload extends Component {

	// --------------
	// INITIALISATION
	// --------------

	/**
	 * @hideconstructor
	 */
	constructor() {

		super();

		// Set the default property values.

		this.type = `secondary`;
		this.disabled = false;
		this.displayFileName = true;
		this.label = `Select File`;
		this.options = `single`;
		this.hint = ``;
		this.fileTypes = ``;
		this.showModal = false;
		this.filesToUpload = [];

		// Internal variables
		this._showModalInputPrompt = true;
		this._filename = `No file selected`;
		this._fileToUpload = null;
		this._fileExtensions = [];
		this._allowAllFiles = false;

		this.pos1 = 0;
		this.pos2 = 0;
		this.pos3 = 0;
		this.pos4 = 0;

		this.addEventListener(`dragover`, this._fileDragHover, false);
		this.addEventListener(`dragleave`, this._fileDragHover, false);
		this.addEventListener(`drop`, this._fileSelectHandler, false);
	}

	/**
	 * Data structure that defines file metadata.
	 *
	 * @typedef {Object} FileMetaData
	 * @property {Number} lastModified Last modified timestamp of the file, in milliseconds since the Unix epoch.
	 * @property {Date} lastModifiedDate Last modified date of the file.
	 * @property {String} name Name of the file.
	 * @property {Number} size Size of the file, in bytes.
	 * @property {String} type MIME type of the file.
	 */

	/**
	 * Callback handler for file uploads within {@link FileUpload}.
	 *
	 * @callback FileSelectionHandler
	 * @param {Object} detail Input model object for handler.
	 * @param {Array<FileList>} detail.files File(s) selected.
	 * @param {FileMetaData} detail.metadata String or Function on how to handle group naming.
	 * @returns {*} The response from handler call.
	 */

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * @property {Boolean} [displayFileName=true] - Indicator to display selected file name.
	 * @property {String} [label="Select File"] - The label on the button. Default is set to Select File
	 * @property {String} [options="single"] - The file upload type:
	 * - `single` Allow single file to be uploaded.
	 * - `multi` Allow multiple files to be uploaded.
	 * @property {String} [fileTypes] - The types of files that the uer will allow to be uploaded. File types must be in format of extension and split by a |, or the default all files will be used
	 * @property {FileSelectionHandler} [fileSelectionHandler] - The handler to handle each file selected in multi upload
	 * @property {Boolean} [showModal=false] - Whether files being uploaded are showed in a modal in multi upload
	 * @property {Array<FileList>} [filesToUpload=[]] - Override for filesToUpload Array to default display files on render
	 */

	static get properties() {

		return {
			label: { type: String },
			disabled: { type: Boolean },
			displayFileName: { type: Boolean },
			showModal: { type: Boolean },
			options: { type: String },
			hint: { type: String },
			fileSelectionHandler: { type: Object, attribute: false },
			fileTypes: { type: String },
			filesToUpload: { type: Array }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this._checkFileTypes();
	}

	shouldUpdate() {
		if (this.options && this.options === `multi` && !this.fileSelectionHandler) {
			console.error(`No fileSelectionHandler is specified for this component. This component will therefore not render`);
			return false;
		}
		return true;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();
		// get the mouse cursor position at startup:
		this.pos3 = e.clientX;
		this.pos4 = e.clientY;

		// eslint-disable-next-line consistent-this
		const thisArg = this;

		document.onmouseup = (e1) => this._closeDragElement(e1, thisArg);
		// call a function whenever the cursor moves:
		document.onmousemove = (e1) => this._elementDrag(e1, thisArg);
	}

	_elementDrag(e, thisArg) {
		e = e || window.event;
		e.preventDefault();
		// calculate the new cursor position:
		thisArg.pos1 = thisArg.pos3 - e.clientX;
		thisArg.pos2 = thisArg.pos4 - e.clientY;
		thisArg.pos3 = e.clientX;
		thisArg.pos4 = e.clientY;
		// set the element's new position:
		thisArg.style.top = `${thisArg.offsetTop - thisArg.pos2}px`;
		thisArg.style.left = `${thisArg.offsetLeft - thisArg.pos1}px`;
	}

	_closeDragElement() {

		/* stop moving when mouse button is released:*/
		document.onmouseup = null;
		document.onmousemove = null;
	}

	_updateFileName(e, passHover = false) {

		if (this.disabled && e.stopImmediatePropagation) {
			return e.stopImmediatePropagation();
		}

		// This is for single use
		if (this.options === `single`) {

			if (e.target.files.length === 0) {
				this._fileToUpload = null;
				this._filename = `No file selected`;

				this.dispatchEvent(new CustomEvent(`selection-change`, {
					detail: {}
				}));

			} else {

				this._filename = e.target.files[0].name;

				this._fileToUpload = e.target.files[0];
				this._fileToUpload.abortController = new AbortController();
				const fileMetadata = {
					lastModified: this._fileToUpload.lastModified,
					lastModifiedDate: this._fileToUpload.lastModifiedDate,
					name: this._fileToUpload.name,
					size: this._fileToUpload.size,
					type: this._fileToUpload.type
				};

				this.dispatchEvent(new CustomEvent(`selection-change`, {
					detail: {
						files: e.target.files,
						metadata: JSON.stringify(fileMetadata)
					}
				}));
			}

			// clearing value to allow event to be triggered again for same or different file
			e.currentTarget.value = null;

			this.requestUpdate();
		} else if (this.options === `multi`) {
			// If this was from the drag and drop
			if (passHover) {
				if (e.length === 0) {
					this.dispatchEvent(new CustomEvent(`selection-change`, {
						detail: {}
					}));
				} else {
					this._prepareMultiFileInfo(Array.from(e));
				}

				this.requestUpdate();
			} else {
				// Or if this was from clicking the button and selecting files
				if (e.target.files.length === 0) {
					this.dispatchEvent(new CustomEvent(`selection-change`, {
						detail: {}
					}));

				} else {
					this._prepareMultiFileInfo(Array.from(e.target.files));
				}

				// clearing value to allow event to be triggered again for same or different file
				e.currentTarget.value = null;

				this.requestUpdate();
			}
		}

		if (e.stopPropagation) {
			e.stopPropagation();
		}
	}

	_prepareMultiFileInfo(files) {
		const filesToUpload = files;

		const fileMeta = [];
		filesToUpload.forEach((file, index) => {
			file.abortController = new AbortController();
			const abortEvent = () => {
				file.abortController.signal.removeEventListener(`abort`, abortEvent);
				if (filesToUpload.includes(file)) {
					filesToUpload.splice(index, 1);
				}

				this.dispatchEvent(new CustomEvent(`cancel-file`, {
					detail: {
						file: file
					}
				}));
				this.requestUpdate();
			};
			file.abortController.signal.addEventListener(`abort`, abortEvent);
			const fileMetadata = {
				lastModified: file.lastModified,
				lastModifiedDate: file.lastModifiedDate,
				name: file.name,
				size: file.size,
				type: file.type
			};
			fileMeta.push(fileMetadata);

			const fileProcExt = file.name.substring(file.name.lastIndexOf(`.`) + 1);
			if (this._fileExtensions.includes(fileProcExt) || this._allowAllFiles === true) {
				this._handleFile(file, true);
			} else {
				this._handleFile(file, false);
			}
		}, this);

		this.filesToUpload = [...this.filesToUpload, ...filesToUpload];

		this.dispatchEvent(new CustomEvent(`selection-change`, {
			detail: {
				files: this.filesToUpload,
				metadata: JSON.stringify(fileMeta)
			}
		}));

		this.requestUpdate();
	}

	_fileUploadClick(e) {
		const obj = this.shadowRoot.getElementById(`fileUpload`);
		obj.click();
	}

	_fileDragHover(e) {
		e.stopPropagation();
		e.preventDefault();
		if (this.options === `multi`) {
			this.hoverDrag = e.type === `dragover`;
			this.requestUpdate();
		}
	}

	_fileSelectHandler(e) {
		if (this.options === `multi`) {
			this._fileDragHover(e);
			const filesToPass = e.dataTransfer.files;

			this._updateFileName(
				filesToPass,
				true
			);
		}
	}

	_cancelAll(e) {
		this.dispatchEvent(new CustomEvent(`modal-cancel`, {
			detail: {
				files: this.filesToUpload
			}
		}));

		for (let index = this.filesToUpload.length - 1; index > -1; index--) {
			const file = this.filesToUpload[index];
			this._cancelFile(file, index);
		}
	}

	_cancelFile(file, index) {
		if (this.filesToUpload.includes(file)) {
			this.filesToUpload.splice(index, 1);
		}
		file.abortController.abort();
	}

	_closeModal() {
		this.dispatchEvent(new CustomEvent(`modal-close`, {
			detail: {
				files: this.filesToUpload
			}
		}));

		this.filesToUpload = [];
		this.requestUpdate();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_completedFileCount() {
		const result = this.filesToUpload.filter(f => f.successMessage || f.errMessage);

		return result.length;
	}

	_overallState() {
		let result = this.filesToUpload.filter(f => f.errMessage);
		if (result.length > 0) {
			return `error`;
		}
		result = this.filesToUpload.filter(f => f.successMessage);
		if (result.length === this.filesToUpload.length) {
			return `success`;
		}

		return ``;
	}

	async _handleFile(file, allowed) {
		if (this.fileSelectionHandler) {
			file.allowed = allowed;

			if (allowed) {
				file.message = `Uploading...`;
				try {
					const resp = await this.fileSelectionHandler(file);
					// eslint-disable-next-line require-atomic-updates
					file.successMessage = resp;
				} catch (error) {
					// eslint-disable-next-line require-atomic-updates
					file.errMessage = error;
				} finally {
					this.requestUpdate();
				}
			} else {
				file.message = `Incorrect file type...`;
				file.errMessage = `File type not allowed. Will not upload`;
			}
		}
	}

	_checkFileTypes() {
		if (this.fileTypes !== ``) {
			let hintText = ``;
			if (this.fileTypes.includes(`|`)) {
				const extensions = this.fileTypes.split(`|`);
				this._fileExtensions = extensions;
				this.fileTypes = ``;
				extensions.forEach(e => {
					this.fileTypes += `.${e},`;
					hintText += `${e.toUpperCase()}, `;
				});
				this.fileTypes = this.fileTypes.slice(0, -1);
				hintText = hintText.slice(0, -2);
				if (hintText.includes(`,`)) {
					const firstSection = hintText.substring(0, hintText.lastIndexOf(`,`));
					const lastSection = hintText.substring(hintText.lastIndexOf(`,`) + 1);
					this.hint = `${firstSection} and ${lastSection} file formats are allowed.`;
				} else {
					this.hint = `${hintText} file formats are allowed.`;
				}

			} else {
				window.showToastTimed(`error`, `bottom`, `Incorrect File Types parsed`, `Defaulting to all files allowed`, 10000, true);
				this.fileTypes = `*.*`;
				this.hint = `All file types allowed`;
				this._allowAllFiles = true;
			}
		} else {
			this.fileTypes = `*.*`;
			this.hint = `All file types allowed`;
			this._allowAllFiles = true;
		}
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {

		return [
			super.styles,
			css`
				:host {
					box-sizing: border-box;
				}

				:host(.undocked) {
					position: absolute;
				}

				.upload-input {
					display: none;
				}

				.upload-flexbox {
					display: flex;
					flex-direction: row;
					align-items: center;
				}

				.filedrag {
					display: flex;
					row-gap: var(--theme-file-upload-file-drag-row-gap);
					flex-direction: column;
					font-weight: var(--theme-file-upload-file-drag-font-weight);
					text-align: var(--theme-file-upload-common-text-align);
					padding: var(--theme-file-upload-file-drag-padding);
					margin: var(--theme-file-upload-file-drag-margin);
					color: var(--theme-file-upload-file-drag-color);
					cursor: default;
					align-items: var(--theme-file-upload-common-align-items);
					justify-content: var(--theme-file-upload-common-justify-content);
					border: var(--theme-file-upload-file-drag-border);
					border-radius: var(--theme-file-upload-file-drag-border-radius);
				}

				.center-text {
					color: var(--theme-file-upload-center-text-color);
					font-family: var(--theme-font-family);
					font-size: var(--theme-file-upload-center-text-font-size);
					line-height: var(--theme-file-upload-center-text-line-height);
					text-align: var(--theme-file-upload-common-text-align);
					font-weight: var(--theme-file-upload-center-text-font-weight);
				}

				.footer-text {
					color: var(--theme-file-upload-footer-text-color);
					font-family: var(--theme-font-family);
					font-size: var(--theme-file-upload-footer-text-font-size);
					font-weight: var(--theme-file-upload-footer-text-font-weight);
					line-height: var(--theme-file-upload-footer-text-line-height);
					text-align: var(--theme-file-upload-common-text-align);
				}

				.filedrag.hover {
					background-color: var(--theme-file-upload-file-drag-hover-background-color);
					border: var(--theme-file-upload-file-drag-hover-border);
					border-radius: var(--theme-file-upload-file-drag-hover-border-radius);
					box-shadow: var(--theme-file-upload-file-drag-hover-box-shadow);
				}

				.single-label {
					padding: var(--theme-file-upload-single-label-padding);
					text-overflow: ellipsis;
					white-space: nowrap;
					overflow: hidden;
					width: var(--theme-file-upload-single-width);
				}

				.multi-list {
					display: flex;
					flex-direction: column;
					width: auto;
					overflow: hidden;
				}

				.expander {
					cursor: pointer;
				}

				.undocked-container {
					box-sizing: border-box;
					height: var(--theme-file-upload-undocked-container-height);
					border: var(--theme-file-upload-undocked-container-border);
					border-radius: var(--theme-file-upload-undocked-container-border-radius);
					background-color: var(--theme-file-upload-undocked-container-background-color);
					box-shadow: var(--theme-file-upload-undocked-container-box-shadow);
					display: flex;
					flex-direction: column;
					position: absolute;
					z-index: var(--theme-file-upload-undocked-container-z-index, 1106);
					min-width: var(--theme-file-upload-undocked-container-min-width);
					max-width: var(--theme-file-upload-undocked-container-max-width);
				}

				.undocked-header {
					height: var(--theme-file-upload-undocked-header-height);
					display: flex;
					flex-direction: row;
					position: relative;
					justify-content: var(--theme-file-upload-common-justify-content);
					align-items: var(--theme-file-upload-common-align-items);
					vertical-align: var(--theme-file-upload-undocked-header-vertical-align);
					cursor: move;
				}

				.undocked-content {
					box-sizing: border-box;
					height: var(--theme-file-upload-undocked-content-height);
					border: var(--theme-file-upload-undocked-content-border);
					border-radius: var(--theme-file-upload-undocked-content-border-radius);
					background-color: var(--theme-file-upload-undocked-content-background-color);
					display: flex;
					flex-direction: row;
				}

				.undocked-info {
					display: flex;
					flex-direction: row;
					margin-top: var(--theme-file-upload-undocked-info-margin-top);
					margin-left: var(--theme-file-upload-undocked-info-margin-left);
					margin-bottom: var(--theme-file-upload-undocked-info-margin-bottom);
				}

				.separator {
					box-sizing: border-box;
					height: var(--theme-file-upload-separator-height);
					width: var(--theme-file-upload-separator-width);
					border: var(--theme-file-upload-separator-border);
				}

				.text {
					font-size: var(--theme-file-upload-text-font-size);
					line-height: var(--theme-file-upload-text-line-height);
					font-family: var(--theme-font-family);
				}

				.file-count {
					padding-right: var(--theme-file-upload-file-count-padding-right);
				}

				.uploading {
					padding-left: var(--theme-file-upload-uploading-padding-left);
					padding-right: var(--theme-file-upload-uploading-padding-right);
					max-width: var(--theme-file-upload-uploading-max-width);
					text-overflow: ellipsis;
					white-space: nowrap;
					overflow: hidden;
				}

				.undocked-cancel {
					color: var(--theme-file-upload-undocked-cancel-color);
					cursor: pointer;
				}

				.message-text {
					color: var(--theme-file-upload-message-text-color);
				}

				.message-text.success {
					color: var(--theme-file-upload-message-text-success-color);
				}

				.message-text.error {
					color: var(--theme-file-upload-message-text-error-color);
				}

				.undocked-title {
					color: var(--theme-file-upload-undocked-title-color);
					font-family: var(--theme-font-family);
					font-size: var(--theme-file-upload-undocked-font-size);
					font-weight: bold;
					line-height: var(--theme-file-upload-undocked-line-height);
					left: var(--theme-file-upload-undocked-left);
					position: absolute;
				}

				.expander.min {
					display: flex;
					right: var(--theme-file-upload-expander-min-right);
					position: absolute;
				}

				.multi-image-div {
					margin-top: var(--theme-file-upload-multi-image-div-margin-top);
				}

				.multi-middle-text {
					font-weight: var(--theme-file-upload-multi-middle-text-font-weight);
				}

				.hide {
					display: none;
				}

				.hide-border {
					border: none;
				}

				.row-gap-small {
					row-gap: var(--theme-file-upload-row-gap-small-row-gap);
				}

				.browse-text {
					color: var(--theme-file-upload-undocked-cancel-color);
					text-decoration: underline;
					font-weight: var(--theme-file-upload-browse-text-font-weight);
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
	 * Generates the component template for kiosk mode.
	 *
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {

		return this._webTemplate();
	}

	/**
	 * Generates the component template for web mode.
	 *
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		if (this.options === `single`) {
			return html`
				${this._renderSingle()}
			`;
		} else if (this.options === `multi`) {
			return html`
				${this._renderMulti()}
			`;
		}
	}

	_renderSingle() {
		return html`
			<div class="upload-flexbox">
				<capitec-button
					label="${this.label}"
					type="${this.type}"
					@click="${e => this._fileUploadClick(e)}"
					.disabled="${this.disabled}">
				</capitec-button>

				${this._displayFileName()}

				<input type="file"
					@input="${e => this._updateFileName(e)}"
					id="fileUpload"
					class="upload-input" />
			</div>
		`;
	}

	_renderMulti() {
		if (this.filesToUpload && this.filesToUpload.length > 0) {
			const state = this._overallState();
			if (state === `error` && this._showModalInputPrompt) {
				this._showModalInputPrompt = false;
			} else if (state !== `error` && !this._showModalInputPrompt) {
				this._showModalInputPrompt = true;
			}

			if (this.showModal === true && this.isMinimized !== true) {
				return html`
					${this._renderFileUploadPrompt()}
					<capitec-modal type="free" header="Document Upload (${this.filesToUpload.length})">
						<img class="expander" slot="header" src="./platform/icons/system/expander-action.svg"
							@click=${(e) => {
						this.isMinimized = true;
						this.classList.add(`undocked`);
						this.requestUpdate();
					}}>
							<div slot="body">
								${this._showModalInputPrompt ? this._renderFileUploadPrompt(true) : html``}
								${this._renderFiles()}
							</div>

						${state === `success` ? html`
							<capitec-button slot="footer" type="clear" label="Close" @click="${this._closeModal}">
							</capitec-button>
						` : html`
							<capitec-button slot="footer" type="clear" label="Cancel"
								@click="${this._cancelAll}">
							</capitec-button>`}

					</capitec-modal>
				`;
			} else if (this.showModal === true && this.isMinimized === true) {
				return html`
					<div class="undocked-container">
						<div class="undocked-header" @mousedown="${(e) => this._dragMouseDown(e)}">
							<label class="undocked-title">Document upload</label>
							<img class="expander min" src="./platform/icons/system/expander-out-action.svg"
								@click=${(e) => {
						this.isMinimized = false;
						this.classList.remove(`undocked`);
						this.requestUpdate();
					}}>
						</div>
						<div class="undocked-content">
							<div class="undocked-info">
								<label class="file-count text">${this._completedFileCount()} of ${this.filesToUpload.length} files</label>
								<div class="separator"></div>
									<label class="uploading text message-text ${state}">
										${state === `success` ? `Successfully Uploaded` : state === `error` ? `Upload Failed`
						: `Uploading...`}
									</label>
									${state === `success` ? html`
									<label class="undocked-cancel text" @click="${(e) => {
							this.isMinimized = false;
							this.classList.remove(`undocked`);
							this._closeModal(e);
							this.requestUpdate();
						}}">Close</label>
									`
						: html`<label class="undocked-cancel text" @click="${(e) => {
							this.isMinimized = false;
							this.classList.remove(`undocked`);
							this._cancelAll(e);
							this.requestUpdate();
						}}">Cancel</label>
									`}
							</div>
						</div>
					</div>
				`;
			}

			return html`
				<div class="multi-list">
					${this._renderFiles()}
				</div>
			`;
		}

		return this._renderFileUploadPrompt();
	}

	_renderFiles() {
		return this.filesToUpload.map((file, idx) => html`
			<capitec-file-upload-progress
				messageType="${file.errMessage ? `error` : file.successMessage ? `success` : file.message ? `status`
				: `default`}"
				message="${file.errMessage ? file.errMessage : file.successMessage ? file.successMessage : file.message}"
				fileExtension="${file.name.substring(file.name.lastIndexOf(`.`)).toUpperCase()}"
				fileName="${file.name}"
				fileSize=" | File size: ${Utilities.formatBytes(file.size)}"
				allowedFile="${file.allowed ? `allowed` : ``}"
				@cancel="${(e) => this._cancelFile(file, idx)}"
				@retry="${(e) => {
				file.errMessage = ``;
				this._handleFile(file, file.allowed);
			}}">
			</capitec-file-upload-progress>
		`, this);
	}

	_renderFileUploadPrompt(isModalPrompt = false) {
		return html`
			<div class="filedrag${this.hoverDrag ? ` hover` : ``} ${isModalPrompt ? ` hide-border row-gap-small` : ``}">
				<div class="multi-image-div ${isModalPrompt ? ` hide` : ``}">
					<img src="./platform/illustrations/upload.svg" />
				</div>
				<div class="multi-middle-text">
					<label class="center-text">Drag and drop files here to upload</label>
				</div>
				<div class="multi-middle-or-text">
					<label class="center-text">- or -</label>
				</div>
				<div class="multi-button">
					<div >
						${isModalPrompt ? html`
								<label class="browse-text" @click=${e => this._fileUploadClick(e)}>Browse Your Files</label>
							`
				: html`
								<capitec-button
									label="Browse Your Files"
									type="secondary"
									@click="${e => this._fileUploadClick(e)}">
								</capitec-button>
							`
			}

						<input type="file"
							@input="${e => this._updateFileName(e)}"
							id="fileUpload"
							class="upload-input"
							multiple
							accept="${this.fileTypes}"/>
					</div>
				</div>
				<div class="multi-footer">
					<label class="footer-text">${this.hint}</label>
				</div>
			</div>
		`;
	}

	/**
	 * Generates the component template for web mode.
	 *
	 * @returns {html} The html content of the component.
	 */
	_displayFileName() {

		if (this.displayFileName === true) {
			return html`
				<capitec-label
					class="single-label"
					label="${this._filename}">
				</capitec-label>
			`;
		}
		return html``;
	}
}

window.customElements.define(`capitec-file-upload`, FileUpload);

/**
 * Raised when file(s) gets selected / dropped.
 *
 * @example
 * <capitec-file-upload ... @selection-change="${this._handler}"></capitec-file-upload>
 *
 * @event FileUpload#selection-change
 * @type {Object}
 * @property {Object} detail Contains file information and meta data for the specified file(s).
 * @property {FileList} detail.files - The file(s) that will be uploaded.
 * @property {FileMetaData} detail.metadata - The metadata of the file(s).
 */

/**
 * Raised when a file gets dropped.
 *
 * @example
 * <capitec-file-upload ... @cancel-file="${this._handler}"></capitec-file-upload>
 *
 * @event FileUpload#cancel-file
 * @type {Object}
 * @property {Object} detail Contains file information and meta data for the specified file.
 * @property {File} detail.file - The file that was removed.
 */

/**
 * Raised when multi files modal is closed with all attached files in success state.
 *
 * @example
 * <capitec-file-upload ... @modal-close="${this._handler}"></capitec-file-upload>
 *
 * @event FileUpload#modal-close
 * @type {Object}
 * @property {Object} detail Contains file information and meta data for the specified files.
 * @property {File} detail.file - The files in success state before modal close.
 */

/**
 * Raised when multi files modal is cancelled with atleast one file not in success state.
 *
 * @example
 * <capitec-file-upload ... @modal-cancel="${this._handler}"></capitec-file-upload>
 *
 * @event FileUpload#modal-cancel
 * @type {Object}
 * @property {Object} detail Contains file information and meta data for the specified files.
 * @property {File} detail.file - The files in the modal before modal cancel.
 */