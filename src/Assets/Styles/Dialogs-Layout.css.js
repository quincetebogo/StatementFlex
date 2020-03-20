import { css } from 'platform/elements';
export class DialogStyling {

	static get styles() {
		return [
			css`

				.grid-container{
					grid-row-gap: 0px;
					grid-column-gap: 0px;
					width:690;
					margin:0px;
					padding:0px;
				}
				.main{
					height: 375px;
				}
				.populatedText{
					padding: 8px;
					height: 64px;
					width: 690x;
					border-bottom: 1px solid #dfdfdf;
				}
				.horizon-call{
					display: flex;
					flex-direction: row;
					margin: 0px;
				}
				.ref-call{
					text-align:left;
					padding-left: 24px;
					padding-top: 8px;
					padding-bottom: 8px;
					width:232px;
					height:64px;
					border: 0px;
					margin: 0px;
				}
				#ref-number{
					height: 21px;
					width: 112px;
					color: #4E6066;
					font-family: "Hind Vadodara";
					font-size: 14px;
					line-height: 21px;
				}
				#label-value{
					color: #003652;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					line-height: 27px;
				}
				.ivr-option{
					width: 223px;
					height: 64px;
					text-align:left;
					border: 0px;
					padding: 8px;
					border-left: 1px solid #dfdfdf;
					border-right: 0px;
					border-top: 0px;
					border-bottom: 0px;
					margin: 0px;
				}
				#label-ivr{
					width: 192px;
					height: 64px;
					color: #003652;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					line-height: 27px;
				}
				.incoming-call{
					width:232px;
					height:64px;
					text-align:left;
					padding-left: 24px;
					padding-top: 8px;
					padding-bottom: 8px;
					border-left: 1px solid #dfdfdf;
					border-right: 0px;
					border-top: 0px;
					border-bottom: 0px;
					margin: 0px;
				}
				#incoming-num{
					height: 27px;
					width: 104px;
					color: #003652;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					line-height: 27px;
				}
				.footer-bar{
					width:670px;
					height:56px;
					border-top: 1px solid #dfdfdf;
				}
		`];
	}
}