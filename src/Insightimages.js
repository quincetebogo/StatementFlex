import { Configuration } from 'platform/core';
let LOCAL_INSIGHTS = {};
const CLIENT_INSIGHTS = {
	"113": {
			"156": {
				"header": `Use your card instead of cash`,
				"image": `/images/insights/Cash-to-electronic.png`,
				"message": `You've been drawing less cash. Keep it up and \n rather pay with your card`
			},
			"161": {
				"header": `Get cash at the till`,
				"image": `/images/insights/Get-cash-at-the-till.png`,
				"message": `Did you know you could've saved money in \n cash withdrawal fees last month by drawing \n cash at major retailers, rather than an ATM?`
			}
		},
	"110": {
			"131": {
				"header": `Switch your salary and debit orders`,
				"image": `/images/insights/Prompt-salary-and-do-switch.png`,
				"message": `Switch your salary and debit orders to \n Capitec today and save on time and banking  \n fees. Simply WhatsApp us on 0674189565 `
			}
		},
	"103": {
			"102": {
				"header": "Live Better alert!",
				"image": "/images/insights/lbb-alert.png",
				"message": "You're missing out on cash backs, automatic savings and higher interest. Do you want to activate your Live Better savings account on the app now?"
			},
			"103": {
				"header": "Live Better savings",
				"image": "/images/insights/lbb-savings.png",
				"message": "Grow your Live Better savings! Just switch on the automatic savings tools on our app.\nCan I help you switch it on?"
			},
			"104": {
				"header": "Switch on Round-up",
				"image": "/images/insights/lbb-roundup.png",
				"message": "You're missing out on automatic savings\nevery time you spend! Switch on Round-up and watch your Live Better savings grow\nevery time you spend."
			},
			"105": {
				"header": "Switch on Interest Sweep",
				"image": "/images/insights/lbb-interest-sweep.png",
				"message": "Did you know you can earn more interest on your interest with Live Better savings?\nCan I help you switch on Interest Sweep on the app now?"
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

		getInsightDetails(){
			return CLIENT_INSIGHTS;
		}
	}
