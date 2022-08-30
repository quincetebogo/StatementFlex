import { css } from 'platform/elements';

// ---------------------
// STYLESHEET DEFINITION
// ---------------------

/**
 * @private
 */
export const ALERTBANNER_CSS = css`
	.verificatoin-status {
		--theme-toast-icon-margin: 0px 7px 0px 15px;
		--theme-alert-banner-warning-border: none;
		--theme-alert-banner-unsuccessful-red-border: none;
		width: 1032px;
		margin: 16px 16px 16px 16px;
	}
	.alert-banner-group {
		width: 964px;
	}
	.alert-banner-group > capitec-label[type="default"] {
		--theme-label-default-font-size: 14px
	}
	.alert-banner-group > capitec-label[type="strong"] {
		--theme-label-strong-font-size: 14px;
		--theme-label-strong-font-weight: 600;
		--theme-layout-gap-spacing: 2px;
		--theme-label-font-color: #3A3A3A;
	}
	.alert-banner-group > capitec-hyperlink {
		--theme-hyperlink-color: #D4781C;
		--theme-font-family: "Hind Vadodara";
		--theme-font-weight: 600;
		--theme-hyperlink-color: #3A3A3A;
		--theme-hyperlink-font-size: 14px;
		text-decoration: underline;
	}
`;