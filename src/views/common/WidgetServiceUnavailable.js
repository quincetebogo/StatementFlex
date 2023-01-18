import { View, css, html } from 'platform/elements';
import { Configuration } from 'platform/core';

import 'app/components/common/ServiceCallErrorScreen';

/**
 * View to render widget 404 not found
 * 
 * @export 
 * @class WidgetServiceUnavailable
 * @extends {View}
 */
export class WidgetServiceUnavailable extends View {


	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this._configuration = Configuration.getInstance();
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}
	

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			
		};
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _findBranchClick() {
		const branchLocatorUrl = await this._configuration.getSetting(`otherSystemsURL.branch-locator`);
		window.open(`${branchLocatorUrl}`);
	}
	
	// --------------
	// PUBLIC METHODS
	// --------------

	// N/A

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// N/A

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.widget {
					height: 100%;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_kioskTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {

		return html`
			<horizon-service-call-error-screen
				data-automation-id="widget-service-unavailable-screen"
				image="/images/insure/assign-pay-arrears.svg"
				bannerDetail="Widget service is currently unavailable. Please contact Horizon support"
				header="Widget service currently unavailable"
				right="Find a Branch"
				@right-click=${() => this._findBranchClick()}>
				<section id="id-error-msg" slot="detail">
					<p>We are experiencing technical difficulties.<br>
					We are sorry for the inconvenience and aim to have it resolved soon.</p>
					<p><b>For any urgent matters, please visit a branch</b></p>
				</section>
			</horizon-service-call-error-screen>`;
	}
}

customElements.define(`horizon-widget-service-unavailable`, WidgetServiceUnavailable);