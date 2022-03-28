import { NavigationContext } from 'platform/core';

import { HorizonStore } from 'app/store/HorizonStore';
import { ViewBase } from 'app/views/common/ViewBase';
import { INSURE_RENDER_MODE } from 'app/views/insure/InsureRenderModes';

import { InsureService } from 'app/services/InsureService';

export class InsureViewBase extends ViewBase {

	//#region  INITIALISATION

	constructor() {
		super();

		this.incomingCallDetails = {};
		this.incidentRecId = ``;
		this.landingPageInfo = {};
		this.callerInformation = {};

		this.navigationContext = NavigationContext.getInstance();
		this.horizonStore = HorizonStore.getInstance();

		this.insureService = new InsureService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));
	}

	//#endregions

	static get properties() {
		return {
			renderMode: { type: Number },
			isBusy: { state: true },
		};
	}

	//#region  LIFECYCLE OVERRIDES

	connectedCallback() {
		super.connectedCallback();
		const state = this.horizonStore.recoverState();
		this.callerInformation = this.horizonStore.getCallerInformation();
		this.landingPageInfo = state.landingPageInfo;
		this.incomingCallDetails = this.horizonStore.getIncomingCallDetails();
		this.incidentDetails = this.horizonStore.getIncidentDetails();
		this.incidentRecId = this.incidentDetails.incidentRecId;
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	//#region PUBLIC METHODS
	// ---- API Actions

	/**
	 * Retrieve list of client policies
	 */
	async retrieveClientPolicySummary() {
		this.isBusy = true;
		let request = {};
		const result = await this.insureService.clientPolicySummary(request, () => true);
		this.isBusy = false;
		return result;
	}

	/**
	 * Calculate estimate based on lives assured provided
	 */
	async calculateClientEstimate(request) {
		this.isBusy = true;
		const result = await this.insureService.calculateEstimate(request, () => true);
		console.log(result);
		this.isBusy = false;
		return result;
	}

	// ---- Navigation

	/**
	 * Navigate back from any view to Summary
	 */
	_backToSummaryPage() {
		this.renderMode = INSURE_RENDER_MODE.POLICY_SUMMARY;
	}

	/**
	 * Navigate so specific subview
	 */
	_navigateToSubView(newMode) {
		this.renderMode = newMode;
	}

	//#endregion

	_handleChannelServiceError(ex) {
		this.errorMessage = `System error. Please try again.`;
		this.errorCount++;

		if (this.errorCount > 2) {
			// this.horizonStore.setIncomingCallDetails(this.incomingCallDetails);
			// this.horizonStore.setCallerInformation(this.callerInformation);
			// this.horizonRouter.navigateToSystemError();
		}
		console.log(ex)
		return true;
	}
}