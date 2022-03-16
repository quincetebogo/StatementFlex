import { Component, css, html } from 'platform/elements';

import 'app/components/dialogs/insure/InsureEstimateAddLife';

class InsureCalculateEstimate extends Component {

	//#region INITIALISATION

	constructor() {
		super();

		this.estimate = {};

		this.genderOptions = [
			{ code: "Male", text: "Male" },
			{ code: "Female", text: "Female" }
		];

		this.calculationUpToDate = true;
		this.showAddLifeModal = false;
		this.totalPremiumOverrideInput = 25;

		this._setupMainLife();
	}

	//#endregion

	//#region EVENT HANDLERS

	/**
	 * Back to Main Insure view
	 */
	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	/**
	 * Show add life modal
	 */
	_showAddLifeModal() {
		this.showAddLifeModal = true;
		this.requestUpdate();
	}

	/**
	 * Hide add life modal
	 */
	_hideAddLifeModal() {
		this.showAddLifeModal = false;
		this.requestUpdate();
	}

	//#endregion

	//#region PRIVATE FUNCTIONS

	/**
	 * Add main life card when component loads
	 */
	_setupMainLife() {
		this.estimate.lifesAssured = [];
		this.estimate.lifesAssured.push({
			relationship: "MainLife",
			coverAmount: 10000,
			premium: 25,
			genderType: "Male",
			age: 18,
			rowID: 1,
			coverDetails: {
				defaultCover: 100000,
				maxCover: 100000,
				minCover: 5000,
				ageMax: 64,
				ageMin: 18,
			}
		});
	}

	/**
	 * Save estimate and move on to quote views
	 */
	_createQuote() {
		console.log('Navigating to Quote');
	}

	/**
	 * Calculate estimate via OIPA
	 */
	_calculate() {

		// Call OIPA


		// Cleanup
		this.totalPremiumOverrideInput = ``;
		this.calculationUpToDate = true;
		this.requestUpdate();
	}

	/**
	 * Add new life from dialog, push into list, set defaults & close modal
	 */
	_addNewLife(e) {
		this.showAddLifeModal = false;
		this.calculationUpToDate = false;

		// Add new Life
		this.estimate.lifesAssured.push({
			relationship: e.detail.relationship,
			coverAmount: e.detail.coverDetails.defaultCover,
			premium: 25,
			genderType: "Male",
			age: 0,
			rowID: this.estimate.lifesAssured.length + 1,
			coverDetails: e.detail.coverDetails
		});
		this.requestUpdate();
	}

	/**
	 * Remove life assure from card
	 */
	_removeLifeAssured(rowId) {
		this.estimate.lifesAssured = this.estimate.lifesAssured.filter(function(obj) {
			return obj.rowID !== rowId;
		});

		// Reorder rowID
		for (let index = 0; index < this.estimate.lifesAssured.length; index++) {
			this.estimate.lifesAssured[index].rowID = index + 1;
		}

		this.calculationUpToDate = false;
		this.requestUpdate();
	}

	_ageValueChanged() {
		this.calculationUpToDate = false;
		this.requestUpdate();
	}

	_genderValueChanged() {
		this.calculationUpToDate = false;
		this.requestUpdate();
	}

	_premiumOverrideValueChanged(e) {
		this.totalPremiumOverrideInput = e.detail.new;
		this.calculationUpToDate = false;
		this.requestUpdate();
	}

	//#endregion

	//#region RENDERING

	/**
	 * Generates the component stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the component.
	 */
	static get styles() {
		return [
			super.styles,
			css`
			.estimate-columns{
				display: flex;
				justify-content: stretch;
			}
			.estimate-column-left{
				margin: 10px;
				flex: 4 1 auto;
				min-height: calc(100vh - 200px);
			}
			.estimate-column-right{
				margin: 10px;
				flex: 1 1 10em;
				align-items: stretch;
				background-color: #f5f5f5;
				border-radius: 5px;
				padding: 10px;
			}
			
			.card-section-heading{
				padding: 15px 15px 15px 15px;
			}
			
			.card-section-heading-title{
				font-size: 18px;
			}

			.card-section-heading-with-remove{
				display: flex;
				justify-content: space-between;
				padding: 15px 15px 0px 15px;	
			}

			.estimate-card {
				border: 1px solid #e1e1e1;
				border-radius: 5px;
			}

			.estimate-card-header{
				border-bottom: 1px solid #e1e1e1;
				padding: 15px 15px 15px 15px;
				font-weight: bold;
				border-top-right-radius: 5px;
				border-top-left-radius: 5px;

				display: flex;
				justify-content: space-between;
			}

			.estimate-card-body-top{
				display: flex; 
				justify-content: space-between; 
				padding: 20px 15px 15px 15px; 
				gap: 10px;
			}

			.estimate-card-body-bottom{
				display: flex; 
				justify-content: space-between; 
				padding: 0px 15px 15px 15px; 
				gap: 10px;
			}
			
			.stronger{
				font-weight: bold;
			}

			.link{
				color: #009de0;
				cursor: pointer;
			}

			.calculation-summary-card{
				height: 100%;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
			}

			.calculation-summary-title{
				font-weight: bold;
				font-size: 18px;
				padding: 5px 10px 5px 0px;
			}

			.calculation-summary-current-premium-title{
				font-weight: 600;
				font-size: 38px;
				padding: 5px 10px 5px 0px;
			}
			`
		];
	}

	/**
	 * Render lifesAssured as list
	 * @returns {html} Component html
	 */
	_renderLifeList() {
		return html`
		${this.estimate.lifesAssured.map(lifeAssured => html`
		<div style="display: flex; justify-content: space-between;">
			<capitec-label label="${lifeAssured.relationship}" type="Default">
			</capitec-label>
		
			<capitec-label label="R${lifeAssured.premium}" type="Default">
			</capitec-label>
		</div>
		<hr>
		`)}
		
		<!-- Total -->
		<div style="display: flex; justify-content: space-between;">
			<capitec-label label="Total Premium Amount" type="Default" style="font-weight: bold;">
			</capitec-label>
		
			<capitec-label label="R25.00" type="Default" style="font-weight: bold;">
			</capitec-label>
		</div>
		`
	}

	/**
	 * Render remove button on life card, if relationship is not main member
	 * @param {Object} lifeAssured 
	 * @returns {html} Html of the component
	 */
	_renderRemoveButton(lifeAssured) {
		if (lifeAssured.relationship != "MainLife") {
			return html`
				<capitec-label label="Remove" type="small" class="stronger link" @click=${(e)=>
					this._removeLifeAssured(lifeAssured.rowID)}>
				</capitec-label>
			`;
		}
	}

	/**
	 * Render lifesAssured as cards
	 * @returns {html} Component html
	 */
	_renderLifeCards() {
		return html`
		<div class="card-section-heading-with-remove">
			<capitec-label label="Lives Assured" type="subtitle" class="stronger">
			</capitec-label>
		
			<capitec-label label="Add Beneficiary" type="subtitle" class="stronger link"
				@click="${() => this._showAddLifeModal()}">
			</capitec-label>
		</div>
		${this.estimate.lifesAssured.map(lifeAssured => html`
		<capitec-spacer></capitec-spacer>
		<div class="estimate-card">
			<div class="estimate-card-header">
				<capitec-label label="${lifeAssured.relationship == 'MainLife' ? 'Main Life: You' : lifeAssured.relationship}"
					type="small" class="stronger">
				</capitec-label>
				${this._renderRemoveButton(lifeAssured)}
			</div>
			<div class="estimate-card-body-top">
				<capitec-text-field label="Cover Amount" type="input" disabled
					hint="R${lifeAssured.coverDetails.minCover} - R${lifeAssured.coverDetails.maxCover}" style="width: 50%;"
					value="${lifeAssured.coverAmount}">
				</capitec-text-field>
				<capitec-text-field label="Premium" type="input" disabled hint="Estimate" style="width: 50%;" value="R25">
				</capitec-text-field>
			</div>
			<div class="estimate-card-body-bottom">
				<capitec-text-field label="Age" type="numeric-input" style="width: 50%;" value=""
					min="${lifeAssured.coverDetails.ageMin}" max="${lifeAssured.coverDetails.ageMax}"
					@value-changed="${(e) => this._ageValueChanged(e)}" @key-input="${(e) => this._ageValueChanged(e)}">
				</capitec-text-field>
				<capitec-select label="Gender" .items="${this.genderOptions}" display-field="text" id-field="code"
					style="width: 50%" @value-changed="${(e) => this._genderValueChanged(e)}">
				</capitec-select>
			</div>
		</div>
		`)}
		`
	}

	/**
	 * Render life cards column on left
	 * @returns {html} Component html
	 */
	_renderLeftColumn() {
		return html`
		<div class="estimate-column-left">
			<div class="card-section-heading">
				<capitec-label label="Total Premium" type="subtitle" class="stronger">
				</capitec-label>
			</div>
			<div class="estimate-card">
				<div style="display: flex; justify-content: space-between; padding: 20px">
					<capitec-group layout="vertical" valign="center" halign="left" gap="none">
						<capitec-label type="subtitle" class="" label="Total Premium">
						</capitec-label>
						<capitec-label type="subtitle" class="stronger" label="R25.00"></capitec-label>
					</capitec-group>
					<capitec-button label="Calculate" icon="generic/calculator" type="clear" icon-placement="right"
						@click="${() => this._calculate()}"></capitec-button>
				</div>
			</div>
		
			${this._renderLifeCards()}
		</div>
		`
	}

	/**
	 * Render calculation column on right
	 * @returns {html} Component html
	 */
	_renderRightColumn() {
		return html`
			<div class="estimate-column-right">
				<div class="calculation-summary-card">
					<div>
						<capitec-label label="Funeral Plan" type="large" class="calculation-summary-title">
						</capitec-label>
						<capitec-spacer></capitec-spacer>
						<capitec-label label="Total estimated monthly premium" type="Default" class="">
						</capitec-label>
						<capitec-label label="R25.00 pm" type="Default" class="calculation-summary-current-premium-title">
						</capitec-label>
			
						<capitec-label label="Summary of estimated monthly premium:" type="Default" style="font-weight: bold;">
						</capitec-label>
						<hr>
						${this._renderLifeList()}
					</div>
			
					<div style="">
						<capitec-label label="Specify a premium you are willing to pay" type="Default"
							style="font-weight: bold; margin-bottom: 15px;">
						</capitec-label>
						<capitec-text-field label="Premium Amount" type="numeric-input"
							@value-changed="${(e) => this._premiumOverrideValueChanged(e)}"
							value="${this.totalPremiumOverrideInput}">
						</capitec-text-field>
					</div>
				</div>
			</div>
		`
	}

	/**
	 * Render add life dialog over main component
	 * @returns {html} Component html
	 */
	_renderAddLifeModal() {
		if (this.showAddLifeModal == true) {
			return html`
			<insure-estimate-add-life @addNewLife="${(e) => this._addNewLife(e)}" @closeModal="${(e) => this._hideAddLifeModal(e)}"
				.lifesAssured="${this.estimate.lifesAssured}">
			</insure-estimate-add-life>
		`}
	}

	/**
	 * Generates the component template for desktop mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
		<capitec-content-box layout="vertical" halign="stretch" valign="top" gap="clear">
			<capitec-title-bar type="insure"
				style="margin-bottom: 0px; border-top-left-radius: 5px; border-top-right-radius: 5px;">
				<capitec-icon size="title" icon="system/back-white" @click="${() => this._back()}" data-automation-id="????">
				</capitec-icon>
				<capitec-label label="Get an estimate" type="title"></capitec-label>
				<capitec-spacer></capitec-spacer>
				<!-- <capitec-button label="Add a life to policy" type="white" @click="${() => this._showAddLifeModal()}">
																																																																				</capitec-button> -->
				<capitec-button label="Save the quote" type="white" @click="${() => this._createQuote()}"
					.disabled="${this.calculationUpToDate == false}"></capitec-button>
			</capitec-title-bar>
			<capitec-card style="padding: 10px;">
				<div class="estimate-columns">
					${this._renderLeftColumn()}
					${this._renderRightColumn()}
				</div>
			</capitec-card>
		</capitec-content-box>
		${this._renderAddLifeModal()}
		`;
	}

	//#endregion
}

window.customElements.define(`insure-calculate-estimate`, InsureCalculateEstimate);