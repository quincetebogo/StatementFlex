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
	 * @property {String} [appVersion] Horizon's current running version
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
			cnetLink: { type: String },
			appVersion: { type: String }
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
			/* STATUS BAR STYLES */
			capitec-content-box {
				background-color: #333;
				height: 72px;
				text-align: center;

				--theme-container-padding-left: 24px;
				--theme-container-padding-top: 0px;
				--theme-container-padding-right: 24px;
				--theme-container-padding-bottom: 0px;
			}

			/* STATUS */
			.status-bar{
				--theme-statusbar-min-height: 59px;
				margin:0px;
				width: auto;
			}

			/* APP VERSION */
			.app-version {
				text-align: start;

				--horizon-label-text-height: 20px;
				--horizon-label-text-color: white;
				--horizon-label-text-font-size: 16px;
				--horizon-label-value-height: 20px;
				--horizon-label-value-color: white;
				--horizon-label-value-font-size: 14px;
				--horizon-label-value-font-weight: 500;
				--horizon-label-value-line-height: 20px;
			}

			/* OTHER SYSTEMS LINKS */
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
			.status-bar-icon{
				float: right;
				width: 68px;
				height: 60px;
				margin: 0px;
				align-content: center;
			}
		}`
	];
}

	_webTemplate() {
		return html`
			<capitec-content-box
				layout="horizontal"
				halign="left"
				valign="center"
				gap="none">

					<capitec-status-bar
						row="1" column="1"
						class="status-bar"
						status="${this.currentStatus}" 
						label="${this.currentMessage}">
					</capitec-status-bar>
				
					<horizon-label
						row="1" column="2"
						class="app-version"
						label="Version"
						value="${this.appVersion}">
					</horizon-label>
					<capitec-spacer></capitec-spacer>

					<capitec-group 
						layout="horizontal"
						halign="right"
						valign="center"
						gap="clear"
						row="1" column="3">
							<div class="status-bar-icon">
								<a href="${this.sblLink}" target="_blank" tabindex="-1">
									<img src="/images/statusBar/SBL.svg" alt=""/>
								</a>
								<capitec-label class="icon-caption" label="SBL"></capitec-label>
							</div>
							<div class="status-bar-icon" column="2" row="1">
								<a href="${this.cdsLink}" target="_blank" tabindex="-1">
									<img src="/images/statusBar/CDS.svg" alt=""/>
								</a>
								<capitec-label class="icon-caption" label="CDS"></capitec-label>
							</div>
							<div class="status-bar-icon" column="3" row="1">
								<a href="${this.cnetLink}" target="_blank" tabindex="-1">
									<img id="image" src="/images/statusBar/C-Net.svg" alt=""/>
								</a>
								<capitec-label class="icon-caption" label="C-Net"></capitec-label>
							</div>
					</capitec-group>
			</capitec-content-box>`;
	}

	_mobileTemplate() {
	}
}

window.customElements.define(`horizon-statusbar`, HorizonStatusBar);