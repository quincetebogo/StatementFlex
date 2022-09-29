import { css } from 'platform/elements';

// ---------------------
// STYLESHEET DEFINITION
// ---------------------

const firstcolumn = `width :195px;
					padding: 8px 0px 7.5px 0px;`;

const expanderColumns = `width :150px;
					padding: 8px 0px 7.5px 12px;`;

const fourColumns = `width : 250px;
					padding: 8px 0px 7.5px 0px;`;

const fiveColumns = `width: 200px;
					padding: 8px 0px 7.5px 0px;`;

const statusColumnContainer =
				 	`display: inline-flex;
					box-sizing: border-box;
					flex-direction: row;
					align-items: center;
					border-radius: 16px;
					padding-top: 8px;
					padding-bottom: 8px;`;
					
const statusTagType =
					`background-color: rgb(239, 239, 239);
					color: #3A3A3A;`;

const statusColumnLabel = 
					`font-size: 12px;
					font-weight: 600;
					line-height: 12px;
					text-align: center;
					margin-left: 16px;
					margin-right: 16px;
					height: 13px;`;


const expanderCell = `height: 57px;
					font-weight: 300;
					justify-content: left;
					margin-bottom: 2px;
					--horizon-label-text-height: 20px;
					--horizon-label-text-color: #3A3A3A;
					--horizon-label-text-font-size: 14px;
					--horizon-label-text-line-height: 20px;

					--horizon-label-value-height: 20px;
					--horizon-label-value-color: #3A3A3A;
					--horizon-label-value-font-size: 15px;
					--horizon-label-value-line-height: 20px;`;

export const EXPANDER_LABEL = `margin:5px 0px 15px 0px; 
					height: 20px;
					width: auto;
					color: #3A3A3A;
					font-family: 'Hind Vadodara';
					font-size: 15px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 20px;`;

const tableHeaderGroup = `height: 48px; 
					background-color: #F5F5F5; 
					width: 1063px; z-index: 10; 
					position: absolute; 
					border-bottom: 1px solid #E1E1E1;`;

const tableHeaderLabel = `height: 48px;
					margin-left: 16px;
					line-height: 48px;
					font-size: 14px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-weight: 600;`;

const headings = {
					transactionDate: `width: 147px; `,
					description: `width: 408px;`,
					transactionStatus: `width: 212px;`,
					amount: `width: 120px;` 
};

export const TABLE_EXPANDER_CELL = {
	headerGroup: tableHeaderGroup,
	headerLabel: tableHeaderLabel,
	tableHeadings: headings,
	firstcolumn: firstcolumn,
	fourColumns: fourColumns,
	fiveColumns: fiveColumns,
	expanderColumns: expanderColumns,
	expanderCell: expanderCell
};

export const STATUS_TAG = {
	tagContainer: statusColumnContainer,
	tagLabel: statusColumnLabel,
	tagType: statusTagType
};

export const INSURE_TRANSACTIONS_CSS = css`
	.transaction-card {
		height: auto;
		width: 1066px;
		background-color: #FFFFFF;
		box-shadow: 0 6px 10px 0.25px rgba(0,0,0,0.07);
	}
	.transaction-card > capitec-group:first-child {
		--theme-layout-gap-spacing: 0px;
	}

	/* Header Details Bar styles */
	.actionbar-header {
		height: 64px;
		width: var(--horizon-center-panel-width, 1064px);
		border-bottom: 0px;
		padding: 11px 24px 11px 43px;
	}

	.actionbar-header > capitec-label {
		font-size: 16px !important;
		font-weight: 600;
	}

	/* Filter Bar styles */
	.transaction-action-bar {
		height: 64px;
		width: var(--horizon-center-panel-width, 1064px);
		padding: 10px 10px;
	}

	/* Chip Bar Styles */
	.filter-bar {
		--theme-actionbar-min-height: 48px;
		--theme-actionbar-padding: 8px 0px 8px 16px;
	}
	.filter-bar > capitec-label {
		height: 20px;
		color: #3A3A3A;
		font-family: "Hind Vadodara";
		font-size: 15px;
		font-weight: 600;
		letter-spacing: 0;
		line-height: 30px;
	}
	.filter-bar > capitec-button {
		height: 40px;
		margin: 0px;

		--theme-button-font-size : 14px;
		--theme-button-line-height: 10px;
		--theme-button-font-weight: 600;
	}

	/* Main View Styles */
	.main-view {
		--theme-container-padding-left: 0px;
		--theme-container-padding-right: 0px;
		--theme-container-padding-top: 0px;
		--theme-container-padding-bottom: 0px;
		--theme-layout-gap-line-color: 0px;
		height: 661px;
		width: auto;
	}

	.transaction-status-select{
		--theme-input-label-font-size: 16px;
		--theme-input-padding-bottom: 13px;
		--theme-select-options-max-height: 308px;
		--theme-input-font-size: 16px;
		--theme-input-label-font-color: #3A3A3A;
		--theme-input-font-weight: 400;
		--theme-input-icon-top: 8px;
		line-height: 30px;
		width: 224px;
	}

	capitec-table{
		width: var(--horizon-center-panel-width, 1064px);
		height: auto;
		--theme-icon-size-default: 24px;
		--theme-data-table-body-group-font-weight: 600;
		--theme-data-table-font-size : 15px;
		--theme-data-table-padding-left: 16px;
		--theme-data-table-body-group-color: #3A3A3A;
		--theme-data-table-font-color: #3A3A3A;
		--theme-data-table-padding-right: 16px;
		--theme-data-table-padding-top: 11px;
		--theme-data-table-padding-bottom: 11px;
		--theme-data-table-expander-size: 12px;
		--theme-data-table-footer-border: 0px;
		--theme-data-table-expander-size: 24px;
		--theme-data-table-header-font-weight: 600;
	}

	capitec-date-time-picker{
		--theme-modal-header-color: #3A3A3A;
		--theme-modal-header-background-color: #F7F7F7;
		--theme-date-time-picker-range-calendar-border: 0px;
		margin-right: 8px;
		width: 280px;
	}

	.load-more-bar{
		--theme-actionbar-min-height: 48px;
		padding-top : 0px;
		padding-bottom: 0px; 
		--theme-actionbar-background: #f4f4f4;
	}

	.scroll-top {
		--theme-icon-size-medium: 26px;
		padding-top: 12px;
		cursor: pointer;
	}

	
	.no-results {
		--theme-label-strong-font-size: 24px;
		--theme-label-strong-font-weight: 600;
		--theme-label-font-color: #3A3A3A;
	}
	.no-result-group {
		width: 1062px;
		margin-top: 130px;
	}
	.action-image{
		cursor: pointer;
	}
`;