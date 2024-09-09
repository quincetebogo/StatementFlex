/**
 * Platform plugin for JSDoc
 *
 * @module plugins/jsdoc-plugin
 */
exports.handlers = {

	/**
	 * Platform specific doclet overriding logic.
	 * @returns {void}
	 */
	newDoclet({ doclet }) {

		// Get rid of "exports() in output"
		if (doclet.name.startsWith(`exports.`)) {
			doclet.name.replace(`exports.`, ``);
		}
	}
};