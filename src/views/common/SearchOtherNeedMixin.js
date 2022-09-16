const orgUnit = `Client Care`;

/**
 * This mixin allows common search other need code to be mixed into different views. 
 * This mixin provides the code that retrieves the categories, sub-categories & issues list from strack. 
 * 
 *   this._logger
 * 
 *   this.incidentManagementService
 */
export const searchOtherNeedMixin = {

	async getCategories() {
		const returnValue = await this.incidentManagementService.otherNeedCategories(orgUnit);

		if (returnValue.succeeded && returnValue.result) {
			this.categories = returnValue.result.categories.map(item => item.category);
		} else {
			this._logger.log(`error`, `Failed to retrieve Other Needs Categories`, `_getCategories`, returnValue.result);
		}
		this.requestUpdate();
	},

	async getSubCategories(event) {
		const returnValue = await this.incidentManagementService.otherNeedSpecificNeed(orgUnit, event.detail.category);

		if (returnValue.succeeded && returnValue.result) {
			this.needs = returnValue.result.needs.map(item => item.need);
		} else {
			this._logger.log(`error`, `Failed to retrieve Other Needs Issue Type`, `_searchSpecificNeed`, returnValue.result);
		}
		this.requestUpdate();
	},

	async getIssues(event) {
		const returnValue = await this.incidentManagementService.otherNeedIssueType(orgUnit, event.detail.category, event.detail.need);

		if (returnValue.succeeded && returnValue.result) {
			this.issues = returnValue.result.issues;
		} else {
			this._logger.log(`error`, `Failed to retrieve Other Needs Issue Type`, `_searchSpecificNeed`, returnValue.result);
		}
		this.requestUpdate();
	},

	async incidentStatus(incident) {
		const returnValue = await this.incidentManagementService.incidentStatus(incident);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to get incident status.`, `_incidentStatus`, returnValue.correlationId);
			return null;
		}
		return returnValue.result;
	}
};