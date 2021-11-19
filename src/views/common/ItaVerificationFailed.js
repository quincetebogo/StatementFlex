import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/ErrorScreen';

export class ItaVerificationFailed extends ViewBase {
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
	}

	// ---------------
	// PROPERTIES
	// ---------------

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this._updateLeftBar();
		this.endCallContext = `VerifyClientFailed`;
	}

	// -------------
	// PRIVATE METHODS
	// -------------

	_updateLeftBar() {
		const state = {
			leftBarButtonConfig: {
				hasFavourites: true,
				subtitle: ``,
				detail: ``
			}
		};

		this.horizonStore.saveState(state);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_leftClick() {
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

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
					width: 550px;
				}
				horizon-error-screen {
					--horizon-error-screen-size: 912px;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderItaFailureScreen()}

			${super._webTemplate()}
		`;
	}

	_renderItaFailureScreen() {
		return html`
			<horizon-error-screen 
				header="Verification was unsuccessful"
				left="Continue Unverified"
				toast="Your Verification has failed." 
				image="/images/insure/assign-pay-arrears.svg"
				@left-click=${() => this._leftClick()}>
				<section id="id-error-msg" slot="detail">If it's an urgent matter, please visit a branch or you can call again after 24hours.</section>
			</horizon-error-screen>
		`;
	}

}

customElements.define(`horizon-ita-verification-failed`, ItaVerificationFailed);