import { css, html } from 'platform/elements';
import { HORIZON_INCIDENT_STATE } from 'app/constants/IncidentManager';
import { NavigationContext } from 'platform/core';
import { SystemErrorEvents } from 'app/constants/telemetry/events/SystemError';
import { ViewBase } from 'app/views/common/ViewBase';
import 'app/components/common/ErrorScreen';


/**
 * A general System Error Screen that can be displayed when channel service calls fail. 
 *
 * @export
 * @class SystemError
 * @extends {ViewBase}
 */
export class SystemError extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.eventAggregator.publish(`horizon-favorites-bar`, { hasFavourites: true });
		this.eventAggregator.publish(`horizon-disable-assign-handoff`, { isHidden: true });

		this.navigationContext = NavigationContext.getInstance();
	}

	// ----------
	// PROPERTIES
	// ----------

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();
		await this.horizonIncidentManager.autoCreateAndClassify(this._toggleBusyFlag, HORIZON_INCIDENT_STATE.FAILED);

		this.endCallContext = `SystemError`;
		this._telemetry.logEvent(SystemErrorEvents.SYSTEM_ERR, {
			previousScreen: this.navigationContext?.previous?.route?.name
		});
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	// N/A

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				:host {
					width: 100%;
					height: 100%;
				}
				#id-error-msg {
					width: 329px;
				}
				horizon-error-screen {
					--horizon-error-screen-size: 912px;
					--horizon-error-screen-height: 888px;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderSystemError()}

			${super._webTemplate()}
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
				@right-click=${() => super._assignIncidentClick()}>
				<section id="id-error-msg" slot="detail"><b>Notify client:</b> There is an issue with the system</section>
			</horizon-error-screen>`;
	}

}

customElements.define(`horizon-system-error`, SystemError);