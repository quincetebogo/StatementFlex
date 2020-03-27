/*
 * Intention of this class file is to create a common styling for Dialogs(ConfirmCaller, SearchCaller, AddCaller)
 */
import { css } from 'platform/elements';
export class DialogLayoutStyles {

	static get styles() {
		return [
			css`
				.main{
					width: 690px;
					height: 403px;
					border-bottom: 1px solid #E1E1E1;
					border-radius: 4px;
				}
				.call-details-bar{
					display: flex;
					flex-direction: row;
					height:64px;
					margin: 0px;
					border-bottom: 1px solid #dfdfdf;
				}
				.call-label{
					width:208px;
					margin-left:24px;
					margin-top:8px;
					margin-bottom:8px;
				}
				.ivr-option{
					width: 228px;
				}
				.left-border{
					border-left: 1px solid #dfdfdf;
				}
				#label-ivr{
					color: #003652;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					line-height: 27px;
					width: 180px;
					margin-top: 8px;
					margin-left: 24px;
				}
		`];
	}
}