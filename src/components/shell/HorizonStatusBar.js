import { Component, css, html } from 'platform/elements';

/**
 * The Horizon Status Bar adds Icons/L:inks for laucnhing external applications to the standard Platform Status Bar
 */
export class HorizonStatusBar extends Component {
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.sblLink = ``;
		this.cnetLink = ``;
		this.cdsLink = ``;
		this.currentStatus = ``;
		this.currentMessage = ``;
	}

	// ----------
	// PROPERTIES
	// ----------
	
	/**
	 * @property {String} currentStatus Status for Capitec Status Bar.
	 * @property {String} [currentMessage] Current Message for Capitec Status Bar
	 * @property {String} [sblLink] URL to SBL Application
	 * @property {String} [cdsLink] URL to CDS Application
	 * @property {String} [cnetLink] URL to CNET Website
	 * 
	 * @readonly
	 * @static
	 * @memberof HorizonStatusBar
	 */
	static get properties() {
		return {
			currentStatus: { type: String },
			currentMessage: { type: String },
			sblLink: { type: String },
			cdsLink: { type: String },
			cnetLink: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// --------------
	// EVENT HANDLERS
	// --------------

	// ---------
	// RENDERING
	// ---------

	static get styles() {

		return [
			super.styles,
			css`
			img{
				margin-left: 14px;
			}
		
			.icon-caption{
				height: 15px;
				color: #FFFFFF;
				font-family: "Hind Vadodara";
				font-size: 13px;
				font-weight: 500;
				letter-spacing: 0;
				line-height: 16px;
				text-align: center;
			}

			.status-bar-group{
				display: flex;
				flex-direction: row;
				background-color: #333;
				column-count: 2;
				height: 72px;
				margin: 0px;
				width: 100%;
			}

			.status-bar{
				--theme-statusbar-min-height: 59px;
				margin:0px;
				width: 1716px;
			}

			.status-bar-icon{
				float: right;
				width: 33.3%;
				height: 60px;
				margin: 0px;
				align-content: center;
			}
			
			.status-bar-icon-group{
				width: 204px;
			}
		}`
	];
}

	_webTemplate() {
		return html`
			<div class="status-bar-group">
				<capitec-status-bar class="status-bar" 
					status="${this.currentStatus}" 
					label="${this.currentMessage}">
				</capitec-status-bar>
				<capitec-group class="status-bar-icon-group" layout="horizontal" halign="right" valign="center" gap="clear">
				<div class="status-bar-icon" column="1" row="1">
					<a href="${this.sblLink}" target="_blank">
						<img src="/images/statusBar/SBL.svg" alt=""/>
					</a>
					<capitec-label class="icon-caption" label="SBL"></capitec-label>
				</div>
				<div class="status-bar-icon" column="2" row="1">
					<a href="${this.cdsLink}" target="_blank">
						<img src="/images/statusBar/CDS.svg" alt=""/>
					</a>
					<capitec-label class="icon-caption" label="CDS"></capitec-label>
				</div>
				<div class="status-bar-icon" column="3" row="1">
					<a href="${this.cnetLink}" target="_blank">
						<img id="image" src="/images/statusBar/C-Net.svg" alt=""/>
					</a>
					<capitec-label class="icon-caption" label="C-Net"></capitec-label>
				</div>
				</capitec-group>
			</div>`;
	}

	_mobileTemplate() {
	}
}

window.customElements.define(`horizon-statusbar`, HorizonStatusBar);