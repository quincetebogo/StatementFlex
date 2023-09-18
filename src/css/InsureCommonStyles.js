import { css } from 'platform/elements';

// ---------------------
// STYLESHEET DEFINITION
// ---------------------

/**
 * @private
 */
export const INSURE_CSS = css`
	.title-bar-label{
		font-size: 22px;
		color:#FFF;
	}
	.capitec-button-medium {
		width: 150px !important;
	}

	.capitec-button-small {
		width: 100px !important;
	}

	.capitec-button-large {
		width: 175px !important;
	}

	.capitec-button-x-large {
		width: 200px !important;
	}

	.toast {
		position: absolute;
		top : 70px;
		left: 790px;
		height: 64px;
		width: 428px;
		border-radius: 4px;
		color: #70AF00;
		z-index: 201;
		left: calc(50.8% - 100px);
		justify-content: center;
		align-items: center;
	}
	.pdf-viewer{
		--theme-container-padding-left: 0px;
		--theme-container-padding-right: 0px;
		--theme-container-padding-top: 0px;
		--theme-container-padding-bottom: 0px;
		width: 800px;
		height: 530px;
	}
	.active-status{
		--horizon-label-value-color: #70AF00;
	}
	.inactive-status{
		--horizon-label-value-color: #FFA500 !important;
	}

	.error-toast {
		--theme-toast-error-color: #3A3A3A;
		position: absolute;
		top : var(--toast-top, 56px);
		margin-left: var(--toast-margin-left, 300px);
		width : var(--toast-width, 465px)
	}

	.once-off-label-colour{
		--theme-label-font-color: #009E96;
		;
	}

	.monthly-label-colour{
		--theme-label-font-color: #852CB3;
		;
	}

	.education-label-colour{
		--theme-label-font-color: #AA1580;
		;
	}
`;