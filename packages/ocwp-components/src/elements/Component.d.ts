/**
 * Base class for all platform components.
 *
 * @example
 * export class Button extends Component { ... }
 *
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} row - The row the component should be displayed in. *
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} row-xl - The row the component should be displayed in on a xl screen.
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} row-lg - The row the component should be displayed in on a lg screen.
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} row-md - The row the component should be displayed in on a md screen.
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} row-sm - The row the component should be displayed in on a sm screen.
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} row-xs - The row the component should be displayed in on a xs screen.
 *
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} rowspan - The amount of rows the component should span.
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} rowspan-xl - The amount of rows the component should span on a xl screen.
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} rowspan-lg - The amount of rows the component should span on a lg screen.
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} rowspan-md - The amount of rows the component should span on a md screen.
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} rowspan-sm - The amount of rows the component should span on a sm screen.
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} rowspan-xs - The amount of rows the component should span on a xs screen.
 *
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} column - The column the component should be displayed.
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} column-xl - The column the component should be displayed in on a xl screen.
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} column-lg - The column the component should be displayed in on a lg screen.
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} column-md - The column the component should be displayed in on a md screen.
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} column-sm - The column the component should be displayed in on a sm screen.
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} column-xs - The column the component should be displayed in on a xs screen.
 *
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} colspan - The amount of columns the component should span
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} colspan-xl - The amount of columns the component should span on a xl screen
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} colspan-lg - The amount of columns the component should span on a lg screen
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} colspan-md - The amount of columns the component should span on a md screen
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} colspan-sm - The amount of columns the component should span on a sm screen
 * @attribute {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12"|String} colspan-xs - The amount of columns the component should span on a xs screen
 *
 * @attribute {Boolean} gone-xl - The component should not be displayed on a xl screen.
 * @attribute {Boolean} gone-lg - The component should not be displayed on a lg screen.
 * @attribute {Boolean} gone-md - The component should not be displayed on a md screen.
 * @attribute {Boolean} gone-sm - The component should not be displayed on a sm screen.
 * @attribute {Boolean} gone-xs - The component should not be displayed on a xs screen.
 */
export class Component extends Element {
	get config(): any;
	/**
	 * Forces the component and all its children to be rendered in a given mode.
	 *
	 * E.g. In a desktop webpage, display components as they would appear on a mobile device.
	 *
	 * @ignore
	 * @param mode The targeted render mode.
	 * @returns {void}
	 */
	forceRenderMode(mode: ('desktop' | 'mobile' | 'kiosk')): void;
	/**
	 * Resets the render mode for the component and all its children.
	 *
	 * @ignore
	 */
	resetRenderMode(): void;

	protected _mobileTemplate(): import('lit-element').TemplateResult
	protected _webTemplate(): import('lit-element').TemplateResult
	protected _kioskTemplate(): import('lit-element').TemplateResult
}
import { Element } from "./Element.js";
