import { Component, css, html } from 'platform/elements';

class HorizonPDFViewer extends Component {

    constructor() {
        super();
        this.header = ``;
        this.zoom = 90;
        this.totalPages = 0;
        this.currPage = 0;
        this.encodedPDF = ``;
        this.dateSelected = ``;
    }

    static get properties() {
        return {
        header: { type: String },
        zoom: { type: Number },
        totalPages: { type: Number },
        currPage: { type: Number },
        encodedPDF: { type: String },
        dateSelected: { type: String }
        };
    }

	_base64ToBlobUrl(base64Data) {

		// decode base64 string, remove space for IE compatibility
		const binary = atob(base64Data.replace(/\s/g, ``));
		const len = binary.length;
		const buffer = new ArrayBuffer(len);
		const view = new Uint8Array(buffer);
	
		for (let i = 0; i < len; i++) {
			view[i] = binary.charCodeAt(i);
		}
	
		// create the blob object with content-type "application/pdf"
		const blob = new Blob([view], { type: `application/pdf` });
	
		return `${URL.createObjectURL(blob)}#toolbar=0&scrollbar=0&navpanes=0&zoom=${this.zoom}`;
	}

    _zoom(size) {
		this.zoom = size === `In` ? this.zoom + 10 : this.zoom - 10;
        this.requestUpdate();
    }

    static get styles() {
        return [
            super.styles,
            css`
                .modal {
                    display: flex;
                    position: fixed;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    z-index: var(--theme-modal-container-z-index, 1102);
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: var(--theme-modal-screen-background-color, rgba(0,0,0,0.6));
                    cursor: default;
                }

				.container {
					height: 928px;
					width: 976px;
					display: flex;
					flex-direction: column;
					justify-content: flex-start;
					align-items: stretch;
					padding: var(--theme-modal-container-padding, 0px);
					background-color: var(--theme-modal-container-background-color, #FFFFFF);
					box-shadow: var(--theme-modal-container-box-shadow);
				}

				.pdf-viewer {
					height: 745px;
					width: 828px;
					background-color: #FFFFFF;
				}

				.pdf-cb {
					height: inherit;
					display: flex;
					align-items: center;
					justify-content: center;
					flex-direction: column;
					background-color: rgba(0,0,0,0.62);
				}

				capitec-group{
					margin-top: 16px;
				}

				.zoom{
					height: 26px;
					width: 26px;
				}

                capitec-label{
                    height: 20px;
                    width: 69px;
                    color: #3A3A3A;
                    font-family: "Hind Vadodara";
                    font-size: 15px;
                    letter-spacing: 0;
                    line-height: 20px;
                }
                capitec-label[type="title"]{
                    height: 24px;
                    width: var(--theme-horizon-pdf-modal-header-width, 243px);
                    font-size: 18px;
                    font-weight: 600;
                    line-height: 24px;
                }
                .page-index{
                    margin-right: 32px;
                    width: 110px;
                }

                .icon-spacer{
                    width: 48px;
                }

				capitec-title-bar > capitec-icon {
					cursor: pointer;
					--theme-icon-size-medium: 26px;
				}
            `
        ];
    }

	_webTemplate() {
		return html`
			<div class="modal" role="dialog" aria-modal="true">
				<div class="container">
					${this._renderHeader()}
					${this._renderBody()}
					${this._renderFooter()}
				</div>
			</div>
		`;
	}

    _renderHeader() {
        return html`
        <capitec-title-bar type="default">
            <capitec-icon 
                size="medium"
                icon="system/arrow-left-action"
                @click="${() => this.dispatchEvent(new CustomEvent(`cancel`, {}))}">
            </capitec-icon>
            <capitec-label label="${this.header} ${this.dateSelected}" type="title"></capitec-label>
        </capitec-title-bar>
        `;
    }

    _renderBody() {
        return html`
            <capitec-content-box
                class="pdf-cb"
                layout="vertical"
                gap="clear">
                <capitec-group 
                    layout="horizontal"
                    valign="center">
                    ${this.currPage === 1 
                        ? html`<capitec-spacer class="icon-spacer"></capitec-spacer>` 
                        : html`
                    <capitec-icon 
                        class="icon dark system" 
                        size="large" 
                        icon="system/previous"
                        @click="${() => this.dispatchEvent(new CustomEvent(`previous`, {}))}">
                    </capitec-icon>`}
                    <object
                        class="pdf-viewer"
                        data="${this._base64ToBlobUrl(this.encodedPDF)}"
                        type="application/pdf">
                    </object>
                    ${this.currPage === this.totalPages 
                    ? html`<capitec-spacer class="icon-spacer"></capitec-spacer>`
                    : html`
                        <capitec-icon 
                            class="icon dark system" 
                            size="large" 
                            icon="system/next"
                            @click="${() => this.dispatchEvent(new CustomEvent(`next`, {}))}">
                        </capitec-icon>`}
                </capitec-group>
            </capitec-content-box>
                        `;
    }

    _renderFooter() {
        return html`
            <capitec-button-bar>
                <capitec-spacer></capitec-spacer>
                <capitec-group layout="horizontal">
                    <capitec-icon 
                        class="zoom" 
                        size="medium" 
                        icon="system/minus-action" 
                        @click="${() => this._zoom(`Out`)}">
                    </capitec-icon>
                    <capitec-label label="${this.zoom + 10}%"></capitec-label>
                    <capitec-icon 
                        class="zoom" 
                        size="medium" 
                        icon="system/add-action" 
                        @click="${() => this._zoom(`In`)}">
                    </capitec-icon>
                </capitec-group>
                <capitec-spacer style="margin-left:55px;"></capitec-spacer>

				<capitec-button type="primary" label="Close" @click="${() => this.dispatchEvent(new CustomEvent(`cancel`, {}))}"></capitec-button>
			</capitec-button-bar>
		`;
	}

}
window.customElements.define(`horizon-pdf-viewer`, HorizonPDFViewer);