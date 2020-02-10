import { View, html, css } from 'platform/elements';
import 'platform/components/popups/Modal';
import 'platform/components/data/Table';

class ConfirmCallerDetailsComponent extends View {

	constructor() {
		super();

	}

	static get styles() {
		return [
			super.styles,
			css`

			`];
	}

	render() {
		return html`

			<capitec-modal type="alert" header="Confirm Caller Details" header-align="left">
  				<div slot="body">
   				<capitec-table slot="body" .items="${this.records}">
					<capitec-table-column label="one" field="sub.onecolumn"></capitec-table-column>   
					<capitec-table-column label="one" field="sub.onecolumn"></capitec-table-column>   
					<capitec-table-column label="one" field="sub.onecolumn"></capitec-table-column>   
					
					this.autorecords = [
					{columnone: Celltext, }
					];
				</capitec-table>

				<capitec-action-bar>
					<capitec-icon type="info"></capitec-icon>
					<capitec-hyperlink label="Add Caller Details"></capitec-hyperlink>
					if the caller is calling on another client's behalf
				</capitec-action-bar>
				<br>
				<capitec-avatar shape="square" value="Client"></capitec-avatar>

  				</div>
  				<capitec-button slot="footer" type="clear" label="Done" @click="${this.onDoneClick}"></capitec-button>
			</capitec-modal>
			`;
	}

}
window.customElements.define(`confirm-caller-component`, ConfirmCallerDetailsComponent)