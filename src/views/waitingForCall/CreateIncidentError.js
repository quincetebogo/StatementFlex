import { css, html } from 'platform/elements';
import { AcceptCallEvents } from 'app/constants/telemetry/events/AcceptCall';
import { HttpStatusError } from 'platform/core/errors/HttpStatusError';
import { IncidentDetails } from 'app/models/IncidentDetails';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/ErrorScreen';

const MAX_RETRIES = 3;

/**
 * This is to display a error screen when the create incident call fails on new call event.
 * Provides you an option to retry creating incident and continue without incident
 *
 * @export
 * @class CreateIncidentError
 * @extends {ViewBase}
 */
export class CreateIncidentError extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// Private variables
		this._retry = 0;
		this.incomingCallDetails = null;

		this.eventAggregator.publish(`horizon-disable-assign-handoff`, { isHidden: true });
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			_retry: { type: Number, attribute: false }
		};
	}

	get pendingRetries() {
		const retries = MAX_RETRIES - this._retry;
		return retries > 0 ? `(${retries})` : ``;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		
		this.incomingCallDetails = this.horizonStore.getIncomingCallDetails(); // retrieving saving incoming call details
		// Retrieving state to get attempted retries
		const state = this.horizonStore.recoverState();
		this._retry = state?.createIncidentAttempts ?? 0;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _retryCreateIncident() {

		if (this._retry === MAX_RETRIES) {
			return;
		}

		this._retry++; // Incrementing retry count
		this._saveRetries(); 

		const returnValue = await this.incidentManagementService.createIncident(this.incomingCallDetails, () => true, 1);
		const incident = returnValue.result?.incident;
		
		if (!returnValue.succeeded || !incident) {
			const ex = returnValue.exception;

			if (ex && ex instanceof HttpStatusError) {
				this.logger.log(`error`, `Failed to create incident: HttpStatus: ${ex.status}, CLI: ${incomingCallDetails.incomingTelephoneNumber}, VDN: ${incomingCallDetails.VDN}, VoiceRef: ${incomingCallDetails.voiceReferenceNumber}, correlationId: ${ex.correlationId}`);
			} 
			
			this.logger.log(`error`, `Retry create incident failed`, `_retryCreateIncident`, returnValue.correlationId);
		}

		if (incident) {
			await this._telemetry.logEvent(AcceptCallEvents.INCIDENT_CREATED, {
				"incident-reference": incident.incidentNumber,
				"incident-rec-id": incident.incidentRecId
			}, true);

			this._saveIncidentDetails(true, incident);
			this.horizonRouter.navigateToWaitingForCall(() => this._publishAcceptCallEvent());
		}
	}

	_continue() {
		this._saveIncidentDetails(false);
		this.horizonRouter.navigateToWaitingForCall(() => this._publishContinueEvent());
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_publishAcceptCallEvent() {
		this.eventAggregator.publish(`accept-call`, {});
	}

	_publishContinueEvent() {
		this.eventAggregator.publish(`continue-without-incident`, {});
	}

	_saveIncidentDetails(incCreated = true, incident = null) {
		this.horizonIncidentManager.setNewPrimaryIncident(incident, this.incomingCallDetails.ivrOptionCode, incCreated);
	}

	_saveRetries() {
		// Retrieving state to update attempted retries
		const state = this.horizonStore.recoverState();
		state.createIncidentAttempts = this._retry;

		this.horizonStore.saveState(state);
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				:host {
					width: 100%;
					height: 100%;
				}
				section[slot="detail"] {
					width: 412px;
				}
				horizon-error-screen {
					--horizon-error-screen-height: 876px;
					--horizon-error-screen-img-width: 250px;
					--horizon-error-screen-label-margin-top: 24px;
					--horizon-error-screen-action-margin-top: 40px;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderSystemError()}

			${super._webTemplate()}
		`;
	}

	_renderSystemError() {
		return html`
			<horizon-error-screen 
				header="Unable to create incident in STrack"
				left="Retry ${this.pendingRetries}"
				right="Continue"
				toast="System error"
				image="platform/illustrations/connection-error.svg"
				@left-click=${() => this._retryCreateIncident()}
				@right-click=${() => this._continue()}
				?disable-left-action="${MAX_RETRIES === this._retry}">
				<section slot="detail">
					There was an issue creating the incident. You can retry or continue without an incident
				</section>
			</horizon-error-screen>`;
	}

}

customElements.define(`horizon-create-incident-error`, CreateIncidentError);