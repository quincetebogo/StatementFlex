import { css } from 'lit';

// ---------------------
// STYLESHEET DEFINITION
// ---------------------

/**
 * @private
 */
export const InputLayouts = css`

	/* GENERIC STYLES */

	.container {
		width: 100%;
		position: relative;
	}

	.container > .error {
		color: var(--theme-input-error-font-color, #C83C37);
		font-family: var(--theme-input-error-font-family, Arial, Helvetica, sans-serif);
		font-size: var(--theme-input-error-font-size, 12px);
		font-weight: var(--theme-input-error-font-weight, 300);

		padding-top: 2px;
		padding-left: calc(var(--theme-input-padding-left, 10px) + var(--theme-input-border-width, 1px));
	}

	.container > .label {
		position: absolute;
		left: var(--theme-input-padding-left, 16px);
		top: var(--theme-input-label-padding-top, 16px);
		
		z-index: 10;
		line-height: var(--theme-button-line-height);
		padding: 0px;

		transition:
			transform 150ms ease-out,
			font-size 150ms ease-out,
			padding 150ms ease-out;
		
		background-color: var(--theme-input-background-color, #FFFFFF);
		
		border-radius: var(--theme-input-border-radius, 4px);
		
		color: var(--theme-input-label-font-color, #4E6066);
		font-family: var(--theme-input-label-font-family, Arial, Helvetica, sans-serif);
		font-size: var(--theme-input-label-font-size, 14px);
		line-height: 14px;
		font-weight: var(--theme-input-label-font-weight, normal);
	}

	.container > .label.error { 
		color: var(--theme-input-error-font-color, #C83C37);
		font-family: var(--theme-input-error-font-family, Arial, Helvetica, sans-serif);
	}

	.container > .field {
		box-sizing: border-box;
		outline: 0;
		width: 100%;
		padding: -2px;
		transition: border 150ms ease-out;

		background-color: var(--theme-input-background-color, #FFFFFF);
		
		border-width: var(--theme-input-border-width);
		border-style: solid;
		border-color: var(--theme-input-border-color, #E1E1E1);
		border-radius: var(--theme-input-border-radius, 4px);
		
		color: var(--theme-input-font-color, #4E6066);
		font-family: var(--theme-input-font-family, Arial, Helvetica, sans-serif);
		font-size: var(--theme-input-font-size, 16px);
		font-weight: var(--theme-input-font-weight, normal);

		padding-top: var(--theme-input-padding-top, 8px);
		padding-bottom: var(--theme-input-padding-bottom, 14px);
		padding-left: var(--theme-input-padding-left, 10px);
		padding-right: var(--theme-input-padding-right, 10px);
	}

	.container > .field.icon-padding {
		padding-right: var(--theme-input-field-padding-right-icon, 44px);
	}

	.container > .hint {
		color: var(--theme-input-hint-font-color, #969B9D);
		font-family: var(--theme-input-hint-font-family, Arial, Helvetica, sans-serif);
		font-size: var(--theme-input-hint-font-size, 12px);
		font-weight: var(--theme-input-hint-font-weight, 300);

		padding-top: 2px;
		padding-left: calc(var(--theme-input-padding-left, 10px) + var(--theme-input-border-width, 1px));
	}

	.container > .icon {
		position: absolute; 
		top: var(--theme-input-icon-top, 13px);
		right: 16px;
	}

	.container > .icon > .expanded {
		transform: rotate(180deg);
		transition: all linear .15s;
	}

	.container > .icon > .collapsed {
		transform: none;
		transition: all linear .15s;
	}

	/* COMPLETED STATE STYLES */

	.container.completed > .label, 
	.container.focussed > .label,
	.container.filtered > .label {
		/* The below transform is used to ensure Edge 41 compatibility. */
		transform: translateX(var(--theme-input-label-transform-x)) translateY(var(--theme-input-label-transform-y)); 
		font-size: var(--theme-input-label-font-size, 14px);
		padding: 0px var(--theme-input-label-padding-sides, 4px);
		visibility: var(--theme-floating-label-visibility);
	}

	.container:hover {
		border-radius: 4px;
	}

	.container.focussed > .label.error {
		color: var(--theme-input-error-font-color, #C83C37);
	}

	.container.completed > .label.error {
		color: var(--theme-input-error-font-color, #C83C37);
	}

	.container.focussed > .label {
		color: var(--theme-input-label-focussed-font-color, #009DE0);
	}

	.container.completed > .label {
		color: var(--theme-input-label-font-color, #4E6066);
	}

	.container.completed > .field, .container.focussed > .field {
		padding-top: calc(var(--theme-input-padding-top, 8px) + 3px);
		padding-bottom: calc(var(--theme-input-padding-bottom, 14px) - 3px);
	}

	/* HOVER STATE STYLES */
	
	.container > .field:hover {
		border-color: var(--theme-input-hover-border-color, #009DE0);
	}

	/* FOCUSSED STATE STYLES */

	.container.focussed > .field {
		border-color: var(--theme-input-focussed-border-color, #009DE0);
		box-shadow:inset 0px 0px 0px 1px var(--theme-input-focussed-border-color, #009DE0);
	}

	/* ERROR STATE STYLES */

	.container.error > .field {
		border-color: var(--theme-input-error-border-color, #C83C37);
	}

	.container.error.focussed > .field {
		box-shadow:inset 0px 0px 0px 1px var(--theme-input-error-border-color, #009DE0);
	}

	.container.error > .field:hover {
		box-shadow:inset 0px 0px 0px 1px var(--theme-input-error-border-color, #009DE0);
	}

	/* DISABLED STATE STYLES */
	
	.container.disabled > .label {
		cursor: default;

		background-color: var(--theme-input-disabled-background-color, #DEDEDE);
	}

	.container.disabled > .field {
		cursor: default;
		
		background-color: var(--theme-input-disabled-background-color, #DEDEDE);
		border-color: var(--theme-input-border-color, #E1E1E1);

		color: var(--theme-input-disabled-font-color, #7C7C7C);
	}

	.container.disabled > .icon {
		cursor: default;

	}
`;