import { View, css, html } from 'platform/elements';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';
import { HorizonRouter } from 'app/shell/HorizonRouter';

import 'app/components/common/ErrorScreen';

/**
 * A general System Error Screen that can be displayed when channel service calls fail. 
 *
 * @export
 * @class SystemError
 * @extends {View}
 */
export class InitialSystemError extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		
		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonIncidenManager = HorizonIncidentManager.getInstance();
	}

	// ----------
	// PROPERTIES
	// ----------

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_assignClick() {
        this.horizonRouter.navigateToStrack(this.horizonIncidentManager.currentIncident);
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				:host{
					width: 100%;
					height: 100%;
				}
				#id-error-msg{
					width: 329px;
				}
				horizon-error-screen {
					--horizon-error-screen-size: 912px;
				}
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			${this._renderSystemError()}
		`;
	}

	_renderSystemError() {
		return html`
			<horizon-error-screen 
				header="System Error" 
				left=""
				right="Assign"
				toast="Network error"
				image="/images/insure/assign-pay-arrears.svg"
				@right-click=${() => this._assignClick()}>
				<section id="id-error-msg" slot="detail"><b>Notify client:</b> There is an issue with the system</section>
			</horizon-error-screen>`;
	}
}

customElements.define(`horizon-initial-system-error`, InitialSystemError);