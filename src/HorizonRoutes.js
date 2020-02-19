let horizonRoutes = [];
export default horizonRoutes = [
	{
		name: `landing-page`,
		title: `LandingPageView`,
		icon: null,
		path: `/landingpage`,
		load: () => import(`./views/LandingPage/LandingPage`),
		isDefault: true,
		isFallback: true
	},
	{
		name: `product-savings-account`,
		title: `SavingsAccountProductView`,
		icon: null,
		path: `/product/savings-account`,
		load: () => import(`./views/LandingPage/SavingsAccountProduct`),
	},
	{
		name: `product-savings-plan`,
		title: `SavingsPlanProductView`,
		icon: null,
		path: `/product/savings-plan`,
		load: () => import(`./views/LandingPage/SavingsPlanProduct/SavingsPlanProduct`),
	},
	{
		name: `product-flexible-savings-plan`,
		title: `FlexibleSavingsPlanProductView`,
		icon: null,
		path: `/product/savings-plan/flexible`,
		load: () => import(`./views/LandingPage/SavingsPlanProduct/FlexibleSavingsPlanProduct`),
	},
	{
		name: `product-fixed-term-savings-plan`,
		title: `FixedTermSavingsPlanProductView`,
		icon: null,
		path: `/product/savings-plan/fixed-term`,
		load: () => import(`./views/LandingPage/SavingsPlanProduct/FixedTermSavingsProduct`),
	},
	{
		name: `product-taxfree-savings-plan`,
		title: `TaxFreeSavingsPlanProductView`,
		icon: null,
		path: `/product/savings-plan/tax-free`,
		load: () => import(`./views/LandingPage/SavingsPlanProduct/TaxFreeSavingsProduct`),
	},
	{
		name: `product-insure`,
		title: `InsureProductView`,
		icon: null,
		path: `/product/insure`,
		load: () => import(`./views/LandingPage/InsureProduct`),
	},
	{
		name: `product-credit`,
		title: `CreditProductView`,
		icon: null,
		path: `/product/credit`,
		load: () => import(`./views/LandingPage/CreditProduct`),
	},
	{
		name: `confirm-caller-details`,
		title: `ConfirmCallerDetailsView`,
		icon: null,
		path: `/confirm-caller-details/`,
		//load: () => import(`./views/ConfirmCallerDetails`),
	},
	{
		name: `client-profile`,
		title: `ClientProfile`,
		icon: null,
		path: `/client/profile`,
		load: () => import(`./views/ClientProfile/ClientProfile`)
	}
]