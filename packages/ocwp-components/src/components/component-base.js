import { css } from '../elements';

/**
* Component base styling
* 
* @private
*/
export const ComponentBase = css`

	* {
		box-sizing: border-box;
	}

	:host {
		display: flex;
		box-sizing: border-box;

		padding: 0px;
		margin: 0px;
	}

	:host([hidden]) {
		display: none;
	}
`;