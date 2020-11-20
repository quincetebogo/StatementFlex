import { View, css, html } from 'platform/elements';
import 'app/components/common/ErrorScreen';
export class SystemError extends View {
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
					width: 329px;
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
				header="Network Error" 
				left="Assign"
				right="Try Again"
				toast="Network error"
				@left-click=${() => this._leftClick()}
				@right-click=${() => this._rightClick()}>
				<section id="id-error-msg" slot="detail"><b>Notify client:</b> Something went wrong try again</section>
			</horizon--error-screen>
		`;
	}
}

customElements.define(`horizon-system-error`, SystemError);