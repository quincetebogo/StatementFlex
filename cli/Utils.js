import fs from 'fs';
import path from 'path';
import url from 'url';

export class Utils {

	/**
	 * Get the absolute path to the platform directory.
	 * 
	 * @type {string}
	 */
	static get platformDir() {
		return path.join(path.dirname(url.fileURLToPath(import.meta.url)), `..`);
	}

	/**
	 * Get the absolute path to the user project directory.
	 * 
	 * @type {string}
	 */
	static get workingDir() {
		return this._workingDir || process.cwd();
	}

	/**
	 * Set the user project directory path.
	 * 
	 * @param {string} workingDir - The new project directory.
	 * 
	 * @returns {void}
	 */
	static set workingDir(workingDir) {
		this._workingDir = workingDir;
	}

	/**
	 * Join all relative paths together to create an absolute path to a platform file.
	 * 
	 * @param  {...string} paths - The paths to join.
	 *  
	 * @returns {string} The absoulte platform file path.
	 */
	static platformPath(...paths) {
		return path.join(Utils.platformDir, ...paths);
	}

	/**
	 * Join all relative paths together to create an absolute path to a project file.
	 * 
	 * @param  {...string} paths - The paths to join.
	 *  
	 * @returns {string} The absolute project file path.
	 */
	static projectPath(...paths) {
		return path.join(Utils.workingDir, ...paths);
	}

	/**
	 * Read a file relative to the working dir of the application.
	 *
	 * @example
	 * Utils.readFileInWorkingDir(`src/config.json`);
	 * 
	 * @static
	 * @param {string} relativeFilePath Relative file path to access, e.g. "src/config.json"
	 * @returns {object} object containing parsed object.
	 */
	static readJsonFileInWorkingDir(relativeFilePath) {
		return JSON.parse(fs.readFileSync(`${Utils.workingDir}/${relativeFilePath}`, `utf8`));
	}

	/**
	 * Returns the CLI 'package.json' from memory.
	 * 
	 * @static
	 * @readonly
	 * @returns {object} 'package.json' object 
	 */
	static get cliVersion() {
		return `2.0.0`;
	}

	/**
	 * Returns 'platform.json' object from memory.
	 *
	 * @static
	 * @readonly
	 * @returns {object} 'platform.json' object 
	 */
	static get appPlatformJson() {
		const platformJson = Utils.readJsonFileInWorkingDir(`platform.json`);
		if (fs.existsSync(Utils.projectPath(`./ProjectManifest.json`))) {
			const projMan = Utils.readJsonFileInWorkingDir(`ProjectManifest.json`);

			if (!platformJson.version) {
				platformJson.version = Utils.cliVersion;
			}
			platformJson.application.name = projMan.name;
			platformJson.application.version = projMan.version;
		}

		return platformJson;
	}


	/**
	 * Replace all occurrences of text in a string within a file.
	 *
	 * @static
	 * @param {string} searchValue Text to search for.
	 * @param {string} replaceValue Text to replace with.
	 * @param {string} filePath File to apply changes to.
	 * @returns {void}
	 */
	static replaceTextInFile(searchValue, replaceValue, filePath) {

		if (typeof searchValue === `string`) {
			searchValue = RegExp(searchValue, `g`);
		}

		const original = fs.readFileSync(filePath, `utf8`);
		const modified = original.replace(searchValue, replaceValue);
		fs.writeFileSync(filePath, modified, `utf8`);
	}
}