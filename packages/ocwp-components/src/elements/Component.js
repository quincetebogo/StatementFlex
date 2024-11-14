import { css, html } from 'lit';

import { Configuration } from 'ocwp-core';
import { Constants } from '../Constants.js';
import { Element } from './Element.js';

/**
 * Base class for all platform components.
 * 
 * @example
 * export class Button extends Component { ... }
 *
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} row - The row the component should be displayed in.
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} row-lg - The row the component should be displayed in on a lg screen.
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} row-md - The row the component should be displayed in on a md screen.
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} row-sm - The row the component should be displayed in on a sm screen.
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} row-xs - The row the component should be displayed in on a xs screen.
 *
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} rowspan - The amount of rows the component should span.
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} rowspan-lg - The amount of rows the component should span on a lg screen.
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} rowspan-md - The amount of rows the component should span on a md screen.
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} rowspan-sm - The amount of rows the component should span on a sm screen.
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} rowspan-xs - The amount of rows the component should span on a xs screen.
 *
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} column - The column the component should be displayed.
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} column-lg - The column the component should be displayed in on a lg screen.
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} column-md - The column the component should be displayed in on a md screen.
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} column-sm - The column the component should be displayed in on a sm screen.
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} column-xs - The column the component should be displayed in on a xs screen.
 *
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} colspan - The amount of columns the component should span
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} colspan-lg - The amount of columns the component should span on a lg screen
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} colspan-md - The amount of columns the component should span on a md screen
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} colspan-sm - The amount of columns the component should span on a sm screen
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} colspan-xs - The amount of columns the component should span on a xs screen
 *
 * @attribute {Boolean} gone-lg - The component should not be displayed on a lg screen.
 * @attribute {Boolean} gone-md - The component should not be displayed on a md screen.
 * @attribute {Boolean} gone-sm - The component should not be displayed on a sm screen.
 * @attribute {Boolean} gone-xs - The component should not be displayed on a xs screen.
 */
export class Component extends Element {

	// --------------
	// INITIALISATION
	// --------------

	/**
	 * Initialises the component.
	 *
	 * @hideconstructor
	 */
	constructor() {
		super();

		this._responsiveStylesGone = null;
	}

	// ----------
	// PROPERTIES
	// ----------

	get config() {
		return Configuration.getInstance().config || window.config;
	}

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

	/**
	 * Forces the component and all its children to be rendered in a given mode.
	 * 
	 * E.g. In a desktop webpage, display components as they would appear on a mobile device.
	 * 
	 * @ignore
	 * @param {('desktop'|'mobile'|'kiosk')} mode The targeted render mode.
	 * @returns {void}
	 */
	forceRenderMode(mode) {

		this.style.setProperty(`--override-render-mode`, mode);
		this.requestUpdate();
	}

	/**
	 * Resets the render mode for the component and all its children.
	 * 
	 * @ignore
	 * @returns {void}
	 */
	resetRenderMode() {

		this.style.removeProperty(`--override-render-mode`);
		this.requestUpdate();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_renderResponsiveStylesGone() {

		if (!this._responsiveStylesGone && this.config?.platform?.design?.breakpoints) {

			const breakpoints = this.config?.platform?.design?.breakpoints;

			const style = `
					:host([gone]) {
						display: none;
					}

					/* ---------- RESPONSIVE GRID LAYOUT (lg) ---------- */
					@media screen and (max-width: ${breakpoints.lg}px) {
						:host([gone-lg]){
							display: none !important;
						}
					}

					/* ---------- RESPONSIVE GRID LAYOUT (md) ---------- */
					@media screen and (max-width: ${breakpoints.md}px) {
						:host([gone-md]){
							display: none !important;
						}
					}

					/* ---------- RESPONSIVE GRID LAYOUT (sm) ---------- */
					@media screen and (max-width: ${breakpoints.sm}px) {
						:host([gone-sm]){
							display: none !important;
						}
					}

					/* ---------- RESPONSIVE GRID LAYOUT (xs) ---------- */
					@media screen and (max-width: ${breakpoints.xs}px) {
						:host([gone-xs]){
							display: none !important;
						}
					}
			`;

			this._responsiveStylesGone = html`<style>${style}</style>`;
		}

		return this._responsiveStylesGone;
	}

	// ---------
	// RENDERING
	// ---------

	/**
	 * Generates the component stylesheet.
	 * 
	 * @ignore
	 * @returns {css} The css content of the component.
	 */
	static get styles() {

		return [
			super.styles,
			css`
			`
		];
	}

	/**
	 * Generates the component template, automatically detecting the appropriate rendering mode.
	 * 
	 * @ignore
	 * @returns {html} The html content of the component.
	 */
	render() {

		// Ensure the platform configuration is initialised.
		if (!this.config || !this.config.platform || !this.config.platform.type) {
			throw new Error(`Component: Platform configuration not initialised yet.`);
		}

		// By default, determine display mode from config.
		let displayMode = this.config.platform.type;

		// Override display mode when explicitly specified.
		// E.g. In a desktop webpage, display components as they would appear on a mobile device.
		// Use-case example: Mobile screen designer where, in a desktop browser, components can be dragged & dropped on a container which represents a mobile device.
		// Components in this container should have their mobile template rendered.
		const targetOverrideTemplate = getComputedStyle(this).getPropertyValue(`--override-render-mode`);

		if (targetOverrideTemplate) {

			const overrideTemplate = targetOverrideTemplate.trim().toLowerCase();

			if (overrideTemplate && [`desktop`, `mobile`, `kiosk`].includes(overrideTemplate)) {
				displayMode = overrideTemplate;
			}
		}

		// Render the component in the configured display mode.
		let template = null;

		switch (displayMode) {

			case `mobile`:
				template = this._mobileTemplate();
				break;

			case `desktop`:
				template = this._webTemplate();
				break;

			case `kiosk`:
				template = this._kioskTemplate();
				break;

			default:
				template = html`Component: Unknown Browser Type Detected`;
				break;
		}

		if (!template) {
			return html`Component: Rendering not supported in '${displayMode}' mode`;
		}

		return html`${this._renderResponsiveStylesGone()}${super.render()}${template}`;
	}
}