// Parent category value for Live better insights
const LBB_PARENT_CATEGORY = 103;

/**
 * Details that are used to display insights on right bar
 * Objects are formed for each parent category. 
 * LBB_PARENT_CATEGORY is the only parent category that is considered as of now
 *  
 * @readonly
 * @enum {object} INSIGHTS_DETAILS
 */
export const INSIGHTS_DETAILS = Object.freeze({
	[LBB_PARENT_CATEGORY]: {
		102: {
			header: `Live Better alert!`,
			image: `/images/insights/lbb-alert.png`,
			message: `You're missing out on cash backs, automatic savings and higher interest. Do you want to activate your Live Better savings account on the app now?`
		},
		103: {
			header: `Live Better savings`,
			image: `/images/insights/lbb-savings.png`,
			message: `Grow your Live Better savings! Just switch on the automatic savings tools on our app.\nCan I help you switch it on?`
		},
		104: {
			header: `Switch on Round-up`,
			image: `/images/insights/lbb-roundup.png`,
			message: `You're missing out on automatic savings\nevery time you spend! Switch on Round-up and watch your Live Better savings grow\nevery time you spend.`
		},
		105: {
			header: `Switch on Interest Sweep`,
			image: `/images/insights/lbb-interest-sweep.png`,
			message: `Did you know you can earn more interest on your interest with Live Better savings?\nCan I help you switch on Interest Sweep on the app now?`
		}
	}
});