import { CommandBase } from './CommandBase.js';
import { Utils } from './Utils.js';
import fs from 'fs';
import fse from 'fs-extra';
import path from 'path';

/**
 * Facilitates creation of a new project based on user input.
 */
export class GenerateCommand extends CommandBase {

	constructor() {
		super(`generate`);
	}

	/**
	 * Executes commands to publish image into the DTR.
	 * 
	 * @returns {Promise<void>} Promise for the completed execution.
	 */
	async run() {

		// Prompt the type of element to create.
		this.answers.type = await this.promptList({
			message: `Select type:`,
			choices: [`Component`, `View`, `Store`, `Service`]
		});

		// Prompt the name of the new element.
		this.answers.name = await this.promptText({
			message: `${this.answers.type} name:`,
			initial: this._getDefaultElementName(),
			validate: (elementName) => this._validateElementName(elementName)
		});

		// Prompt store specific configurations.
		if (this.answers.type === `Store`) {

			this.answers.logStateChanges = await this.promptList({
				message: `Would you like to log state changes?`,
				choices: [`Yes`, `No`]
			});

			this.answers.persistance = await this.promptList({
				message: `Select persistance option?`,
				choices: [`Session storage`, `In Memory`]
			});
		}

		this.answers.language = await this.promptList({
			message: `What Language would you like to use?`,
			choices: [`JavaScript`, `TypeScript`]
		});

		this._generateBasics();

		this.logInfoToShell(`${this.answers.type} ${this.answers.name} initialized in ${Utils.workingDir}`);
	}

	/**
	 * The value to be converted to snake case
	 * @param  {String} value to convert to snake case
	 * @returns {String} the converted value
	 */
	_toKebabCase(value) {
		return value.replace(/([A-Z]| [a-z])/g, (substring, args) => `-${args.toLowerCase()}`).replace(/^-/g, ``).replace(/ /g, ``);
	}

	_toCamelCase(value) {
		return value.replace(/(^[A-Za-z]| [A-Z]| [a-z])/g, (substring, args) => `${args.toUpperCase()}`).replace(/ /g, ``);
	}

	_getStorageType(type) {
		switch (type) {
			case `Session storage`:
				return `sessionStorage`;
			case `In Memory`:
				return `memory`;
			default:
				return `memory`;
		}
	}

	/**
	 * Drop some basics inside the working directory.
	 * @returns {Promise<void>} Promise for the completed execution.
	 */
	async _generateBasics() {

		const extension = this.answers.language === `JavaScript` ? `js` : `ts`;

		// Read the content of the template file.
		let template = ``;
		switch (this.answers.type) {
			case `Store`:
				template = await fse.readFile(Utils.platformPath(`./deploy/templates/store-${extension}.txt`), `utf-8`);
				break;
			case `Service`:
				template = await fse.readFile(Utils.platformPath(`./deploy/templates/service-${extension}.txt`), `utf-8`);
				break;
			default:
				template = await fse.readFile(Utils.platformPath(`./deploy/templates/element-${extension}.txt`), `utf-8`);
		}

		// Update template variables
		template = template
			.replace(/ELEMENT_SNAKE_CASE_NAME/gm, this._toKebabCase(this.answers.name))
			.replace(/ELEMENT_NAME/gm, this.answers.name)
			.replace(/ELEMENT_TYPE/gm, this.answers.type)
			.replace(/ELEMENT_TO_LOWER_TYPE/gm, this.answers.type.toLowerCase())
			.replace(/ELEMENT_PASCAL_CASE_NAME/gm, this._toCamelCase(this.answers.name))
			.replace(/ELEMENT_CAMEL_CASE_NAME/gm, this._toCamelCase(this.answers.name));

		if (this.answers.type === `Store`) {
			template = template
				.replace(/STORE_LOG/gm, this.answers.logStateChanges === `Yes` ? `true` : `false`)
				.replace(/STORE_PERSISTANCE/gm, this._getStorageType(this.answers.persistance));
		}

		fs.writeFileSync(path.join(Utils._workingDir, `/${this._toCamelCase(`${this.answers.type}${this.answers.name}`)}.${extension}`), template, { encoding: `utf-8` });
	}

	/**
	 * Routine to validate the element name.
	 *
	 * @param {string} elementName Value passed to evaluate.
	 * @param {boolean} [logWarning=true] When true, logs an warning out to the console should validation fail.
	 * @returns {boolean} Validation result.
	 */
	_validateElementName(elementName, logWarning = true) {

		if (elementName) {
			return true;
		}

		return false;
	}

	/**
	 * Attempts to get a default element name based on the current directory.
	 * 
	 * The current directory name gets validated in the same manner as validating a 
	 * element name provided by the user to determine if it can be used.
	 *
	 * @returns {string|null} Default element name or null.
	 */
	_getDefaultElementName() {

		let defaultElementName = path.basename(process.cwd());
		defaultElementName = `${defaultElementName.charAt(0).toUpperCase()}${defaultElementName.slice(1)}`;
		return this._validateElementName(defaultElementName, false) ? defaultElementName : null;
	}
}