import { HorizonViewManager, HORIZON_VIEWS } from './HorizonViewManager';

let horizonRoutes = [];

const LANDING_PAGE = `/landingpage`;
const SAVINGS_ACCOUNT_PRODUCT_PAGE = `/product/savings-account`;
const CLIENT_PROFILE_PAGE = `/client/profile`;

export default horizonRoutes = [
	{
		name: `landing-page`,
		title: `LandingPageView`,
		icon: null,
		path: LANDING_PAGE,
		load: () => import(`./views/LandingPage/LandingPage`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEWS.LANDING_PAGE)
		},
		isDefault: true,
		isFallback: true
	},
	{
		name: `product-savings-account`,
		title: `SavingsAccountProductView`,
		icon: null,
		path: SAVINGS_ACCOUNT_PRODUCT_PAGE,
		load: () => import(`./views/LandingPage/SavingsAccountProduct`),
		onPostNavigate: () => { showClientProfile = false },
	},
	{
		name: `product-savings-plan`,
		title: `SavingsPlanProductView`,
		icon: null,
		path: `/product/savings-plan`,
		load: () => import(`./views/LandingPage/SavingsPlanProduct/SavingsPlanProduct`),
		onPostNavigate: () => { showClientProfile = false },
	},
	{
		name: `product-flexible-savings-plan`,
		title: `FlexibleSavingsPlanProductView`,
		icon: null,
		path: `/product/savings-plan/flexible`,
		load: () => import(`./views/LandingPage/SavingsPlanProduct/FlexibleSavingsPlanProduct`),
		onPostNavigate: () => { showClientProfile = false },
	},
	{
		name: `product-fixed-term-savings-plan`,
		title: `FixedTermSavingsPlanProductView`,
		icon: null,
		path: `/product/savings-plan/fixed-term`,
		load: () => import(`./views/LandingPage/SavingsPlanProduct/FixedTermSavingsProduct`),
		onPostNavigate: () => { showClientProfile = false },
	},
	{
		name: `product-taxfree-savings-plan`,
		title: `TaxFreeSavingsPlanProductView`,
		icon: null,
		path: `/product/savings-plan/tax-free`,
		load: () => import(`./views/LandingPage/SavingsPlanProduct/TaxFreeSavingsProduct`),
		onPostNavigate: () => { showClientProfile = false },
	},
	{
		name: `product-insure`,
		title: `InsureProductView`,
		icon: null,
		path: `/product/insure`,
		load: () => import(`./views/LandingPage/InsureProduct`),
		onPostNavigate: () => { showClientProfile = false },
	},
	{
		name: `product-credit`,
		title: `CreditProductView`,
		icon: null,
		path: `/product/credit`,
		load: () => import(`./views/LandingPage/CreditProduct`),
		onPostNavigate: () => { showClientProfile = false },
	},
	{
		name: `client-profile`,
		title: `ClientProfile`,
		icon: null,
		path: CLIENT_PROFILE_PAGE,
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEWS.CARD_STOP)
		},
		load: () => import(`./views/ClientProfile/ClientProfile`)
	}
]