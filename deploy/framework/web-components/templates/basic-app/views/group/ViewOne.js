import { View, css, html } from 'platform/elements';

/**
 * Sample view that is used to illustrate routing & navigation.
 * 
 * For more info, please follow this tutorial:
 * https://confluence.capitecbank.co.za:8443/x/x4MVD
 */
class ViewOne extends View {

	// --------------
	// INITIALISATION
	// --------------

	// n/a

	// ----------
	// PROPERTIES
	// ----------

	// n/a

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// n/a

	// --------------
	// EVENT HANDLERS
	// --------------

	// n/a

	// --------------
	// PUBLIC METHODS
	// --------------

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// n/a

	// ---------
	// RENDERING
	// ---------

	/**
	 * Generates the component stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the component.
	 */
	static get styles() {
		return [
			super.styles,
			css`
				
			`
		];
	}

	/**
	 * Generates the component template for desktop mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
			<capitec-content-box>
				<capitec-label type="subtitle" label="One"></capitec-label>
			</capitec-content-box>
		`;
	}
}

window.customElements.define(`view-one`, ViewOne);