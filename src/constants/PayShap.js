export const INSTITUTIONS_LIST = [
	{
		"institutionName": `ABSA`,
		"institutionDomains": [`Other.Absa`, `Okaysome.abs`, `That.One.Sa`, `PayThis.Abs`]
	},
	{
		"institutionName": `AFRICAN BANK`,
		"institutionDomains": [`AAAAFRICA.A`, `Boonyae`, `TIA.Pay.May`, `Goldin-all`, `Egoli-Mali`]
	},
	{
		"institutionName": `CAPITEC BANK LIMITED`,
		"institutionDomains": [`@CAPITEC`, `@CapitecBiz`]
	},
	{
		"institutionName": `FIRST NATIONAL BANK`,
		"institutionDomains": [`Other.Absa`, `Okaysome.abs`, `That.One.Sa`, `PayThis.Abs`]
	},
	{
		"institutionName": `HABIB OVERSEAS BANK`,
		"institutionDomains": [`Habbibi@01`, `Habbibi@02`, `Habbibi@03`, `Habbibi@04`, `Habbibi@05`, `Habbibi@06`, `Habbibi@07`, `Habbibi@08`, `Habbibi@09`, `Habbibi@10`, `Habbibi@11`]
	},
	{
		"institutionName": `HBZ BANK LIMITED`,
		"institutionDomains": [`@MAINDOMAIN`]
	}
];

export const payShapDetails = {
	"capitecProxy": {
		"verified": true,
		"knownAsName": `0764575577@capitecbank`,
		"proxyId": ``,
		"domain": ``,
		"fullProxyStatus": `Active`,
		"defaultProxyStatus": true
	},
	"fees": [
		{
			"lowerBound": 0,
			"upperBound": 100.00,
			"amount": 1.00
		},
		{
			"lowerBound": 100.01,
			"upperBound": 1000.00,
			"amount": 2.50
		},
		{
			"lowerBound": 1000.01,
			"upperBound": 3000.00,
			"amount": 5.00
		},
		{
			"lowerBound": 3000.01,
			"upperBound": 100000.00,
			"amount": 7.50
		}
	],
	"limits": {
		"transactionLimit": 3000.00,
		"dailyLimit": 5000.00
	}
};