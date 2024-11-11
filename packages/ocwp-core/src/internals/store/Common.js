/**
 * Derives the unique store state name for the given settings context.
 *
 * @ignore
 * @param {StoreStateSettings} settings Setting for state context.
 * 
 * @returns {String} Unique store state name.
 */
export function getName(settings) {
	return `${settings.name}-${settings.persistence}`;
}