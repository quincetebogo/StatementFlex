import { Configuration } from 'platform/core';
let LOCAL_INSIGHTS = {};
const CLIENT_INSIGHTS = {
	"DEV": LOCAL_INSIGHTS = {
		"34": {
			"245": {
				"header": `Use your card instead of cash`,
				"image": `/images/insights/Cash-to-electronic.png`,
				"message": `You've been drawing less cash. Keep it up and \n rather pay with your card`
			},
			"246": {
				"header": `Get cash at the till`,
				"image": `/images/insights/Get-cash-at-the-till.png`,
				"message": `Did you know you could've saved money in \n cash withdrawal fees last month by drawing \n cash at major retailers, rather than an ATM?`
			},
			"247": {
				"header": `Switch your salary and debit orders`,
				"image": `/images/insights/Prompt-salary-and-do-switch.png`,
				"message": `Switch your salary and debit orders to \n Capitec today and save on time and banking  \n fees. Simply WhatsApp us on 0674189565 `
			}
		}
	},

	"LOCAL": LOCAL_INSIGHTS,

	'INT': {
		"34": {
			"245": {
				"header": `Use your card instead of cash`,
				"image": `/images/insights/Cash-to-electronic.png`,
				"message": `You've been drawing less cash. Keep it up and \n rather pay with your card`
			},
			"246": {
				"header": `Get cash at the till`,
				"image": `/images/insights/Get-cash-at-the-till.png`,
				"message": `Did you know you could've saved money in \n cash withdrawal fees last month by drawing \n cash at major retailers, rather than an ATM?`
			},
			"247": {
				"header": `Switch your salary and debit orders`,
				"image": `/images/insights/Prompt-salary-and-do-switch.png`,
				"message": `Switch your salary and debit orders to \n Capitec today and save on time and banking  \n fees. Simply WhatsApp us on 0674189565 `
			}
		}
	},
	
	'QA': {
		"34": {
			"20": {
				"header": `Use your card instead of cash`,
				"image": `/images/insights/Cash-to-electronic.png`,
				"message": `You've been drawing less cash. Keep it up and \n rather pay with your card`
			},
			"20": {
				"header": `Get cash at the till`,
				"image": `/images/insights/Get-cash-at-the-till.png`,
				"message": `Did you know you could've saved money in \n cash withdrawal fees last month by drawing \n cash at major retailers, rather than an ATM?`
			},
			"10": {
				"header": `Switch your salary and debit orders`,
				"image": `/images/insights/Prompt-salary-and-do-switch.png`,
				"message": `Switch your salary and debit orders to \n Capitec today and save on time and banking  \n fees. Simply WhatsApp us on 0674189565 `
			}
		}
	},
	
	'PROD': {
		"34": {
			"120": {
				"header": `Use your card instead of cash`,
				"image": `/images/insights/Cash-to-electronic.png`,
				"message": `You've been drawing less cash. Keep it up and \n rather pay with your card`
			},
			"120": {
				"header": `Get cash at the till`,
				"image": `/images/insights/Get-cash-at-the-till.png`,
				"message": `Did you know you could've saved money in \n cash withdrawal fees last month by drawing \n cash at major retailers, rather than an ATM?`
			},
			"110": {
				"header": `Switch your salary and debit orders`,
				"image": `/images/insights/Prompt-salary-and-do-switch.png`,
				"message": `Switch your salary and debit orders to \n Capitec today and save on time and banking  \n fees. Simply WhatsApp us on 0674189565 `
			}
		}
}
};

export class Insightimages {
	static getInstance() {
		return this.instance || (this.instance = new Insightimages());
	}

	constructor () {
		if (this.instance) {
			return this.instance;
		}
		this._configuration = Configuration.getInstance();
	
	}

		
		getInsightDetailsEnv() {
		const env = this._configuration.config.runtime.environment;
		return CLIENT_INSIGHTS[env];
		}
	}