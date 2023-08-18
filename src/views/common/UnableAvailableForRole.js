import { View, css, html } from 'platform/elements';

/**
 * View to render when view is not available for role
 * 
 * @export 
 * @class UnableAvailableForRole
 * @extends {View}
 */
export class UnableAvailableForRole extends View {


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
			.product-info{
				width: 100%;
				height: 100%;
			}
			capitec-group {
				width: 100%;
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
			<capitec-card class=product-info>
				<capitec-title-bar type="credit" label="Unavailable For Your Role"></capitec-title-bar>
					<capitec-group layout="vertical" gap="none" halign="center" valign="center">
						<capitec-icon size="large" icon="system/close-circle-error"></capitec-icon>
						<capitec-label label="Your role does not allow you to make use of this functionality."></capitec-label>
					</capitec-group>
			</capitec-card>
		`;
	}
}

customElements.define(`horizon-view-unavailable-for-role`, UnableAvailableForRole);