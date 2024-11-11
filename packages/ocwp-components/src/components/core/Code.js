import { Component, css, html, unsafeHTML } from '../../elements/index.js';
import Prism from 'prismjs';

/**
* A control to syntax highlight and display source code.
*
* ```js
* import 'platform/components/core/Code'
* ```
*
* **Usage**
* ```html
* <capitec-code language="html">
*   <div>
*     <h1>Hello World</h1>
*   </div>
* </capitec-menu>
* ```
*/
export class Code extends Component {

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

		// Set the default property values.
		this.language = ``;
		this.title = ``;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 *
	 * @property {String} [title] Renders a small title above the block itself.
	 * @property {String} [content] Raw text to parse as content. If this property is specified,
	 * it will take precedence over slotted content.
	 * This should also be used if you are using dynamic content
	 * @property {String} language Programming language used, e.g. html, css, javascript, etc.
	 */
	static get properties() {
		return {
			title: { type: String },
			content: { type: String },
			language: { type: String }
		};
	}

	get content() {
		return this._content;
	}

	set content(val) {
		const oldVal = this._content;

		this._parseContent(val);
		this.requestUpdate(`content`, oldVal);
	}

	_parseContent(source) {

		if (source.length > 0) {

			// Remove the starting newline character.
			if (source.startsWith(`\n`)) {
				source = source.replace(`\n`, ``);
			}

			// Remove any trailing whitespace, newlines or tabs.
			source = source.trimRight();

			// Count the number of tabs used on the first line.
			let count = 0;
			let key = source[count];

			while (key === `\t`) {
				key = source[++count];
			}

			// Replace that amount of tabs on every line to normalise the string to start with zero padding.
			source = source.replace(new RegExp(source.substr(0, count), `g`), ``);

			// Replace empty HTML attribute values [disabled=""] with empty string [disabled]
			if (this.language === `html`) {
				source = source.replace(/(="")/gi, ``);
			}

			// Set the code preview content.
			this._content = Prism.highlight(source, Prism.languages[this.language], `css`);

		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {

		super.connectedCallback();

		// Format the slotted content to a source code preview.
		if (!this.content) {
			this._parseContent(this.innerHTML);
		}
	}

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
	 * @ignore
	 * @returns {css} The css content of the component.
	 */
	static get styles() {

		return [
			super.styles,
			css`
				code[class*="language-"],
				pre[class*="language-"] {
					color: #f8f8f2;
					background: none;
					text-shadow: 0 1px rgba(0, 0, 0, 0.3);
					font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
					font-size: 1em;
					text-align: left;
					white-space: pre;
					word-spacing: normal;
					word-break: normal;
					word-wrap: normal;
					line-height: 1.5;

					-moz-tab-size: 4;
					-o-tab-size: 4;
					tab-size: 4;

					-webkit-hyphens: none;
					-moz-hyphens: none;
					-ms-hyphens: none;
					hyphens: none;

					user-select: text;
				}

				/* Code blocks */
				pre[class*="language-"] {
					padding: 1em;
					margin: .5em 0;
					overflow: auto;
					border-radius: 0.3em 0.3em 0.3em 0.3em;
				}

				pre[with-title="true"] {
					border-radius: 0 0 0.3em 0.3em;
					margin: 0 0 .5em 0;
				}

				:not(pre) > code[class*="language-"],
				pre[class*="language-"] {
					background: #272822;
				}

				/* Inline code */
				:not(pre) > code[class*="language-"] {
					padding: .1em;
					margin: 0;
					border-radius: .3em;
					white-space: normal;
				}

				.token.comment,
				.token.prolog,
				.token.doctype,
				.token.cdata {
					color: slategray;
				}

				.token.punctuation {
					color: #f8f8f2;
				}

				.namespace {
					opacity: .7;
				}

				.token.property,
				.token.tag,
				.token.constant,
				.token.symbol,
				.token.deleted {
					color: #f92672;
				}

				.token.boolean,
				.token.number {
					color: #ae81ff;
				}

				.token.selector,
				.token.attr-name,
				.token.string,
				.token.char,
				.token.builtin,
				.token.inserted {
					color: #a6e22e;
				}

				.token.operator,
				.token.entity,
				.token.url,
				.language-css .token.string,
				.style .token.string,
				.token.variable {
					color: #f8f8f2;
				}

				.token.atrule,
				.token.attr-value,
				.token.function,
				.token.class-name {
					color: #e6db74;
				}

				.token.keyword {
					color: #66d9ef;
				}

				.token.regex,
				.token.important {
					color: #fd971f;
				}

				.token.important,
				.token.bold {
					font-weight: bold;
				}
				.token.italic {
					font-style: italic;
				}

				.token.entity {
					cursor: help;
				}

				pre[class*="language-"].line-numbers {
					position: relative;
					padding-left: 3.8em;
					counter-reset: linenumber;
				}

				pre[class*="language-"].line-numbers > code {
					position: relative;
					white-space: inherit;
				}

				.line-numbers .line-numbers-rows {
					position: absolute;
					pointer-events: none;
					top: 0;
					font-size: 100%;
					left: -3.8em;
					width: 3em; /* works for line-numbers below 1000 lines */
					letter-spacing: -1px;
					border-right: 1px solid #999;

					-webkit-user-select: none;
					-moz-user-select: none;
					-ms-user-select: none;
					user-select: none;

				}

				.line-numbers-rows > span {
					pointer-events: none;
					display: block;
					counter-increment: linenumber;
				}

				.line-numbers-rows > span:before {
					content: counter(linenumber);
					color: #999;
					display: block;
					padding-right: 0.8em;
					text-align: right;
				}

				.hidden {
					display: none;
				}

				pre {
					width: 100%;
				}

				pre[class*="language-css"]{
					overflow-y: auto;
				}

				/* width */
				pre[class*="language"]::-webkit-scrollbar {
					width: var(--theme-code-scrollbar-width, 10px);
				}

				/* Track */
				pre[class*="language-"]::-webkit-scrollbar-track {
					box-shadow: var(--theme-code-scrollbar-track-box-shadow, inset 0 0 5px grey);
					border-radius: var(--theme-code-scrollbar-track-border-width, 0px);
				}

				/* Handle */
				pre[class*="language-"]::-webkit-scrollbar-thumb {
					background: var(--theme-code-scrollbar-thumb-background, #009DE0);
					border-radius: var(--theme-code-scrollbar-thumb-border-radius, 10px);
				}

				/* Handle on hover */
				pre[class*="language-"]::-webkit-scrollbar-thumb:hover {
					background: var(--theme-code-scrollbar-thumb-hover-background, #008BC7);
				}

				.title {
					background: var(--theme-code-title-background, #F4F4F4);
					border-radius: var(--theme-code-title-border-radius, 0.3em 0.3em 0 0);
					padding: var(--theme-code-title-padding, 4px 12px);
					border: var(--theme-code-title-border, 1px solid #CCCCCC);
					font-weight: var(--theme-code-title-font-weight, 500);
				}
			`
		];
	}

	/**
	 * Generates the component template for mobile mode.
	 *
	 * @ignore
	 * @returns {html} The html content of the component.
	 */
	_mobileTemplate() {

		return this._webTemplate();
	}

	/**
	 * Generates the component template for web mode.
	 *
	 * @ignore
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {

		return html`
			<div class="hidden"><slot></slot></div>
			${this.title ? html`
				<div class="title">${this.title}</div>
				${this._renderPre(true)}
			` : html`
				${this._renderPre(false)}
			`}
		`;
	}

	/**
	 * Generates the component template for kiosk mode.
	 *
	 * @ignore
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {

		return this._webTemplate();
	}

	_renderPre(withTitle) {

		return html`<pre with-title="${withTitle}" class="language-${this.language}" style="white-space: pre-wrap;"><code>${unsafeHTML(this._content)}</code></pre>`;
	}
}

window.customElements.define(`capitec-code`, Code);