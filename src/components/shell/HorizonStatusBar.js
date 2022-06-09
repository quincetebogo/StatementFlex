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

				--theme-container-padding-left: 24px;
				--theme-container-padding-top: 0px;
				--theme-container-padding-right: 24px;
				--theme-container-padding-bottom: 0px;
			}
			.status-bar-group{
				height: 72px;
				width: 100%;
				text-align: center;
			}

			/* STATUS */
			.status-bar{
				--theme-statusbar-min-height: 59px;
				margin:0px;
			}

			/* APP VERSION */
			.app-version {
				padding-top: 25px;
				--theme-label-default-font-size: 14px;
				--theme-label-font-color: white;
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
			<capitec-content-box>
				<capitec-group layout="grid"
					gap="none"
					rows="auto"
					columns="uniform"
					class="status-bar-group">

						<capitec-status-bar
							row="1" column="1"
							class="status-bar"
							status="${this.currentStatus}" 
							label="${this.currentMessage}">
						</capitec-status-bar>
					
						<capitec-label
							row="1" column="2"
							class="app-version"
							label="v${this.appVersion}">
						</capitec-label>

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
				</capitec-group>
			</capitec-content-box>`;
	}

	_mobileTemplate() {
	}
}

window.customElements.define(`horizon-statusbar`, HorizonStatusBar);