// ---------------------
// STYLESHEET DEFINITION
// ---------------------

const firstcolumn = `width :192px;
					padding: 12px 0px 10px 0px;`;

const expanderColumns = `width :164px;
					padding: 12px 0px 10px 16px;`;

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


const expanderCell = `height: 56px;
					font-weight: 300;
					justify-content: left;
					--horizon-label-text-height: 14px;
					--horizon-label-text-color: #3A3A3A;
					--horizon-label-text-font-size: 12px;
					--horizon-label-text-line-height: 14px;

					--horizon-label-value-height: 20px;
					--horizon-label-value-color: #3A3A3A;
					--horizon-label-value-font-size: 14px;
					--horizon-label-value-line-height: 20px;`;

export const EXPANDER_LABEL = `margin: 6px 0px 6px 0px; 
					height: 20px;
					width: auto;
					color: #3A3A3A;
					font-family: 'Hind Vadodara';
					font-size: 14px;
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

const linkedTransactionsHeading = `
					margin-top: 22px;`;

const linkedTransactionTile = `
					--theme-card-min-width: 1032px;
					--theme-card-min-height: 56px;
					padding: 0px 16px;
					margin-bottom: 8px;
					`;
const verticalSeparator = `
					height: 40px;
					width: 1px;
					background-color: #E1E1E1;
					margin-right: 16px;
				`;
const cardHover = `
					:hover {
						background-color: #E1E1E1;
					}`

export const TABLE_EXPANDER_CELL = {
	headerGroup: tableHeaderGroup,
	headerLabel: tableHeaderLabel,
	tableHeadings: headings,
	firstcolumn: firstcolumn,
	expanderColumns: expanderColumns,
	expanderCell: expanderCell
};

export const LINKED_TRANSACTION = {
	heading: linkedTransactionsHeading,
	card: linkedTransactionTile,
	verticalLine: verticalSeparator,
	cardHover: cardHover
}

export const STATUS_TAG = {
	tagContainer: statusColumnContainer,
	tagLabel: statusColumnLabel,
	tagType: statusTagType
};