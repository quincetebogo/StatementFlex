import { HorizonViewManager, HORIZON_VIEWS } from './HorizonViewManager';

let horizonRoutes = [];

const LANDING_PAGE = `/landingPage`;
const SAVINGS_ACCOUNT_PRODUCT_PAGE = `/product/savings-account`;
const CLIENT_PROFILE_PAGE = `/client/profile`;

export default horizonRoutes = [
	{
		name: `landing-page`,
		title: `LandingPageView`,
		icon: null,
		path: LANDING_PAGE,
		load: () => import(`./views/LandingPage`),
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
		load: () => import(`./views/product/SavingsAccountProduct`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEWS.LANDING_PAGE)
		},
	},
	{
		name: `product-savings-plan`,
		title: `SavingsPlanProductView`,
		icon: null,
		path: `/product/savings-plan`,
		load: () => import(`./views/product/SavingsPlanProduct/SavingsPlanProduct`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEWS.LANDING_PAGE)
		},
	},
	{
		name: `product-flexible-savings-plan`,
		title: `FlexibleSavingsPlanProductView`,
		icon: null,
		path: `/product/savings-plan/flexible`,
		load: () => import(`./views/product/SavingsPlanProduct/FlexibleSavingsPlanProduct`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEWS.LANDING_PAGE)
		},
	},
	{
		name: `product-fixed-term-savings-plan`,
		title: `FixedTermSavingsPlanProductView`,
		icon: null,
		path: `/product/savings-plan/fixed-term`,
		load: () => import(`./views/product/SavingsPlanProduct/FixedTermSavingsProduct`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEWS.LANDING_PAGE)
		},
	},
	{
		name: `product-taxfree-savings-plan`,
		title: `TaxFreeSavingsPlanProductView`,
		icon: null,
		path: `/product/savings-plan/tax-free`,
		load: () => import(`./views/product/SavingsPlanProduct/TaxFreeSavingsProduct`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEWS.LANDING_PAGE)
		},
	},
	{
		name: `product-insure`,
		title: `InsureProductView`,
		icon: null,
		path: `/product/insure`,
		load: () => import(`./views/product/InsureProduct`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEWS.LANDING_PAGE)
		},
	},
	{
		name: `product-credit`,
		title: `CreditProductView`,
		icon: null,
		path: `/product/credit`,
		load: () => import(`./views/product/CreditProduct`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEWS.LANDING_PAGE)
		},
	},
	{
		name: `client-profile`,
		title: `ClientProfile`,
		icon: null,
		path: CLIENT_PROFILE_PAGE,
		load: () => import(`./views/ClientProfile/ClientProfile`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEWS.CARD_STOP)
		}
	}
]