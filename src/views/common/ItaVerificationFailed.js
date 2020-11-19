import { View, css, html } from 'platform/elements';
import 'app/components/common/ErrorScreen';
export class ItaVerificationFailed extends View {
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

	// ----------
	// PROPERTIES
	// ----------

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
					width: 550px;
				}
			`
		];
	}

	_leftClick() {
		console.log(`left`);
	}

	_rightClick() {
		console.log(`right`);
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<horizon--error-screen 
				header="Verification was unsuccessful" 
				left="Continue Unverified"
				right="Verify Via Security Questions"
				toast="Your Verification has failed."
				@left-click=${() => this._leftClick()}
				@right-click=${() => this._rightClick()}>
				<section id="id-error-msg" slot="detail">If it's an urgent matter, please visit a branch or you can call again after 24 hours.</section>
			</horizon--error-screen>
		`;
	}
}

customElements.define(`horizon-ita-verification-failed`, ItaVerificationFailed);