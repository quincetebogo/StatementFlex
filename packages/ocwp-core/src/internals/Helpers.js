/**
 * A set of platform internal helper utility methods.
 * 
 * @ignore
 * @hideconstructor
 */
class Helpers {

    /**
     * Returns a non-extensible proxy for the supplied instance.
     *
     * @param {Object} instance Instance to get a proxy for.
     * @returns {Proxy} Proxy of instance.
     */
	getProxy(instance) {
		return Object.preventExtensions(new Proxy(instance, {
			defineProperty: (target, p) => {
				throw new Error(`Invalid attempt to define read-only property "${p}"`);
			},
			deleteProperty: (target, p) => {
				throw new Error(`Invalid attempt to delete read-only property "${p}"`);
			},
			getPrototypeOf: () => null,
			isExtensible: () => false,
			preventExtensions: (target) => {
				Object.preventExtensions(target);
				return true;
			},
			set: (target, p) => {
				throw new Error(`Invalid attempt to set read-only property "${p}"`);
			},
			setPrototypeOf: () => {
				throw new Error(`Invalid attempt to prototype object`);
			}
		}));
	}
}

export default new Helpers();