import { AlertBanner } from 'platform/components/popups';
import { css } from 'platform/elements';
 
/**
 * HorizonAlertBanner is a replacement for horizon-alert-banner
 * 
 * Some theme defaults are overridden to meet Horizon requirements
 * 
 * Notabely the z-index is set as the horizon-alert-banner has become a wrapper
 * for the capitec-toast component. The z-index on the toast component pretty
 * much forces the component to be in front of all other UI components which
 * is not always what we want
 */
export class HorizonAlertBanner extends AlertBanner {

	constructor() {
		super();
	}

	static get styles() {
		return [
			super.styles,
			css`
				p {
					margin-bottom: 0px;
					margin-top: 0px;
				}
				:host {
					--theme-alert-banner-info-font-color: #3A3A3A;
					--theme-alert-banner-success-font-color: #3A3A3A;
					--theme-alert-banner-warning-font-color: #3A3A3A;
					--theme-alert-banner-error-font-color: #3A3A3A;
					--theme-alert-banner-unsuccessful-font-color: #3A3A3A;
					--theme-alert-banner-unsuccessful-red-font-color: #3A3A3A;
					--theme-alert-banner-width: auto;
					--theme-toast-z-index: 1;
					--theme-toast-box-shadow: none;
					--theme-toast-content-margin: 0px;
				}`
		];
	}
}
window.customElements.define(`horizon-alert-banner`, HorizonAlertBanner);