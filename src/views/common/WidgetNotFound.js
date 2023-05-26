import { View, css, html } from 'platform/elements';

import 'app/components/common/ServiceCallErrorScreen';

/**
 * View to render widget 404 not found
 * 
 * @export 
 * @class WidgetNotFound
 * @extends {View}
 */
export class WidgetNotFound extends View {


	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
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

	// N/A
	
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
				data-automation-id="widget-not-found-screen"
				image="/images/insure/assign-pay-arrears.svg"
				bannerDetail="Requested widget not found. Please contact Horizon support"
				header="Widget service currently unavailable">
				<section id="id-error-msg" slot="detail">
					<p>Requested widget ID: BE11799D-20ED-4D15-9537-7055084FE0DF is not found<br></p>
					<p><b>For any urgent matters, please visit a branch</b></p>
				</section>
			</horizon-service-call-error-screen>`;
	}
}

customElements.define(`horizon-widget-not-found`, WidgetNotFound);