import { parse as parseJSON, stringify as stringifyJSON } from 'comment-json';

import { Utils } from './Utils.js';
import chalk from 'chalk';
import colors from 'ansi-colors';
import enquirer from 'enquirer';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { spawn } from 'child_process';
import { v4 as uuid } from 'uuid';

const fsp = fs.promises;

/**
 * Base class for commands, which provides reusable methods and command execution infrastructure.
 */
export class CommandBase {

	// -----------
	// CONSTRUCTOR
	// -----------

	/**
	 * Creates an instance of CommandBase.
	 * 
	 * @param {string} context Context of command, e.g. "init".
	 */
	constructor(context) {

		// Set the commands' context, used for error handling.
		this.context = context;

		// Initialise default class variables.
		this._processLog = {};
	}

	// ----------------
	// PUBLIC FUNCTIONS
	// ----------------

	/**
	 * Executes the command.
	 * 
	 * @param {object} [options] Options specified on the CLI.
	 * @param {boolean} [debug] Runs the command in debug mode if set.
	 * @param {boolean} [embedded=false] Runs the command as an embedded part of another command.
	 * 
	 * @returns {Promise<void>} Promise for the completed completion.
	 */
	async execute(options, debug, embedded = false) {

		try {

			this.answers = options;
			this.isDebug = debug;
			this.embedded = embedded;

			Utils.workingDir = process.cwd();

			if (!embedded) {

				this.logInfoToShell(`OCWP Legacy CLI v${Utils.cliVersion}`);

				// Print the header.
				this.logCommandHeader(this.context, Utils.workingDir, options);
			}

			await this.run();

		} catch (error) {

			// Only log real errors, e.g. ignore CTRL+C which will cause the execution to stop but not set an error.
			if (error) {
				this.logErrorToShell(`[${this.context}] ${error}`);
			}
		}
	}

	// ----------------
	// STATE PROPERTIES
	// ----------------

	/**
	 * Determines if there's reasons why this command cannot execute.
	 */
	get canRun() {

		const files = fs.readdirSync(Utils.workingDir, {
			encoding: `utf8`
		});

		// Ensure the project folder is empty.
		if (!files || files.length === 0) {

			this.logWarnToShell(`Empty folder, unable to run command...`);
			return false;

		} else if (files.findIndex(file => file.includes(`platform.json`)) === -1) {

			this.logWarnToShell(`'platform.json' not found, unable to run command...`);
			return false;
		}

		return true;
	}

	// ---------------------------------------
	// HELPER FUNCTIONS - COMMAND LINE PROCESS
	// ---------------------------------------

	/**
	 * Executes the child process in a specific working directory via specified command + args. Command input / output piped to the current executing shell.
	 * 
	 * @param {Object} object - The process configuration details.
	 * @param {number} object.errorCode - The code to log when an error occursCommandBase, e.g. 1
	 * @param {string} object.cwd - The working directory to run the command in.
	 * @param {string} object.command - The command to run, e.g. 'npm'.
	 * @param {string[]} [object.args=[]] - The list of arguments to pass into the command.
	 * @param {boolean} [object.quiet=false] - Suppresses output log messages if set.
	 * @param {function} [object.messageCallback=null] - The function to call when a output message is logged.
	 * 
	 * @async
	 * 
	 * @returns {Promise<void>} Promise for the completed command execution.
	 */
	executeChildProcessCommandInDirectory({ errorCode, cwd, command, args = [], quiet = false, messageCallback = null } = {}) {

		return new Promise((resolve, reject) => {

			// Create a new process log entry for the command.
			const processID = uuid();

			this._processLog[processID] = [];

			for (let index = 0; index < args.length; index++) {

				const arg = `${args[index]}`;

				if (!arg.includes(`"`)) {
					args[index] = `"${arg}"`;
				}
			}

			if (!command.includes(`"`) && ![`npm`, `npx`, `node`].includes(command)) {
				command = `"${command}"`;
			}

			// Run the command in the specified working directory.
			const cmd = spawn(command, args, {
				stdio: [`inherit`, `pipe`, `inherit`],
				shell: true,
				cwd: cwd
			});

			// Listen for any process output messages.
			cmd.stdout.on(`data`, (data) => {

				// Print the message to the command line console.
				const message = data.toString(`utf8`);

				if (!quiet) {

					process.stdout.write(message);

					if (messageCallback) {
						messageCallback(message);
					}
				}

				// Write the output message to the process log.
				if (message) {

					try {
						this._processLog[processID].push(message);
					} catch (err) {
						console.log(`Unable to write to process log, process might have already been terminated: ${processID}`);
					}
				}
			});

			cmd.on(`message`, message => {
				console.log(message);
			});

			// Resolve the command once the process terminates.
			this._listenForExitEvent(cmd, resolve, reject, errorCode, processID);
		});
	}

	/**
	 * Executes the child process via specified command + args. Command input / output piped to the current executing shell.
	 * 
	 * @param {number} errorCode e.g. 1
	 * @param {string} command e.g. 'npm'
	 * @param {...string} args e.g. '-v'
	 * 
	 * @async
	 * 
	 * @returns {Promise<void>} Promise for the completed command execution.
	 */
	executeChildProcessCommand(errorCode, command, ...args) {

		return this.executeChildProcessCommandInDirectory({
			errorCode: errorCode,
			cwd: `.`,
			command: command,
			args: args
		});
	}

	/**
	 * Executes the child process via specified command + args. Command input / output piped to the current executing shell.
	 * 
	 * @param {number} errorCode e.g. 1
	 * @param {string} command e.g. 'npm'
	 * @param {...string} args e.g. '-v'
	 * 
	 * @async
	 * 
	 * @returns {Promise<void>} Promise for the completed command execution output.
	 */
	executeChildProcessCommandOut(errorCode, command, ...args) {

		return new Promise((resolve, reject) => {

			// Create a new process log entry for the command.
			const processID = uuid();

			this._processLog[processID] = [];

			for (let index = 0; index < args.length; index++) {

				const arg = `${args[index]}`;

				if (!arg.includes(`"`)) {
					args[index] = `"${arg}"`;
				}
			}

			if (!command.includes(`"`)) {
				command = `"${command}"`;
			}

			// Run the command.
			const cmd = spawn(command, args, {
				stdio: `pipe`,
				shell: true
			});

			// Listen for any process output messages.
			cmd.stdout.on(`data`, data => {

				// Print the message to the command line console.
				let message = data.toString(`utf8`);

				process.stdout.write(message);

				// Clean up and write the message to the process log
				message = message.split(`\r`).join(``).split(`\n`).join(``);

				if (message) {

					try {
						this._processLog[processID].push(message);
					} catch (err) {
						console.log(`Unable to write to process log, process might have already been terminated: ${processID}`);
					}
				}
			});

			// Resolve the command once the process terminates.
			this._listenForExitEvent(cmd, resolve, reject, errorCode);
		});
	}

	_listenForExitEvent(cmd, resolve, reject, errorCode, processID) {

		cmd.on(`exit`, code => {

			if (code !== 0) {

				const rejectContext = this.context ? this.context.toUpperCase() : `UNKNOWN_CONTEXT`;
				const rejectCode = errorCode ? errorCode : `UNKNOWN_CODE`;

				reject(new Error(`[${rejectContext}-${rejectCode}] Internal command failed.`));
			}

			// Resolve the process promise with the output of the operation.
			resolve(this._processLog[processID]);

			// Clear the process output log to conserve memory.
			delete this._processLog[processID];
		});
	}

	/**
	 * Runs a command in the operating system shell.
	 * 
	 * @param {string} command - The command string to run.
	 * @param {string} [cwd='.'] - Optional, the working directory to run the command in.
	 * @param {string} [message=''] - Optional, a info message to log to the console.
	 * @param {boolean} [quiet=false] - Optional, suppresses output log messages if set.
	 * 
	 * @async
	 * 
	 * @returns {Promise<void>} Promise for the completion of the command.
	 */
	runCommand(command, cwd = `.`, message = null, quiet = false) {

		// Log the command description info message, if specified.
		if (message) {
			this.logInfoToShell(message);
		}

		// Execute the command using the platform binaries if possible.
		if (command.startsWith(`npm`)) {

			// Run the command using the platform version of NPM.
			return this.executeChildProcessCommandInDirectory({
				errorCode: 1,
				cwd: cwd,
				command: `npm`,
				args: command.substring(4).split(` `),
				quiet: quiet
			});

		} else if (command.startsWith(`npx`)) {

			// Run the command using the platform version of NPX.
			return this.executeChildProcessCommandInDirectory({
				errorCode: 1,
				cwd: cwd,
				command: `npx`,
				args: command.substring(4).split(` `),
				quiet: quiet
			});
		}

		// No special conditions identified, just run the command as is.
		const commandArgs = command.split(` `);

		return this.executeChildProcessCommandInDirectory({
			errorCode: 1,
			cwd: cwd,
			command: commandArgs[0],
			args: commandArgs.slice(1),
			quiet: quiet
		});
	}

	// --------------------------------------
	// HELPER FUNCTIONS - COMMAND LINE PROMPT
	// --------------------------------------

	/**
	 * Ask the user to type an answer in the command prompt.
	 * 
	 * @param {object} question Questions to prompt the user.
	 * 
	 * @returns {any} The answer to the question asked.
	 */
	async promptText({ message, initial = null, validate = null } = {}) {

		// Generate a random name the question (required by the library).
		const name = uuid();

		// Prompt the user to answer the question.
		const answer = await enquirer.prompt({
			name: name,
			type: `input`,
			message: message,
			initial: initial,
			validate: validate
		});

		// Extract an return the answer.
		return answer[name];
	}

	/**
	 * Ask the user to select the answer from a list in the command prompt.
	 * 
	 * @param {object} question Questions to prompt the user.
	 * 
	 * @returns {any} The answer to the question asked.
	 */
	async promptList({ message, choices = [], multiple = false, initial = null, validate = null } = {}) {

		// Generate a random name the question (required by the library).
		const name = uuid();

		// Prompt the user to answer the question.
		const answer = await enquirer.prompt({
			name: name,
			type: multiple ? `multiselect` : `select`,
			hint: multiple ? `(Use <space> to select, <enter> to submit)` : null,
			message: message,
			choices: choices,
			initial: initial,
			validate: validate,
			styles: {
				muted: colors.magentaBright
			},
			// eslint-disable-next-line func-names
			format: function() {

				// Hide the hint text next to all of the choices.
				for (const item of this.choices) {

					if (!item._hint) {
						item._hint = item.hint;
					}

					item.hint = null;
				}

				// Show the hint text next to the currently active item in the list.
				const hoverChoice = this.choices[this.state.index];

				if (hoverChoice._hint) {
					hoverChoice.hint = `   ${hoverChoice._hint}`;
				}

				// Render empty text in the answer slot if the user is still picking an item.
				if (!this.state.submitted || this.state.cancelled) {
					return ``;
				}

				// Render a comma separated list of the chosen answers if the user selected more than 1 item.
				if (Array.isArray(this.selected)) {
					return this.selected.map(choice => this.styles.primary(choice.name)).join(`, `);
				}

				// Render a single answer in the answer slot in all other cases.
				return this.styles.primary(this.selected.name);
			}
		});

		// Extract an return the answer.
		return answer[name];
	}

	/**
	 * Ask the user to confirm a yes or no answer in the command prompt.
	 * 
	 * @param {object} question Questions to prompt the user.
	 * 
	 * @returns {any} The answer to the question asked.
	 */
	async promptConfirm({ message, initial = null, validate = null } = {}) {

		// Generate a random name the question (required by the library).
		const name = uuid();

		// Prompt the user to answer the question.
		const answer = await enquirer.prompt({
			name: name,
			type: `confirm`,
			message: message,
			initial: initial,
			validate: validate
		});

		// Extract an return the answer.
		return answer[name];
	}

	// --------------------------
	// HELPER FUNCTIONS - LOGGING
	// --------------------------

	/**
	 * Log info message out to the shell.
	 *
	 * @param {string} message Message to log to the shell.
	 * @param {...string} [params] Parameters to for message.
	 * 
	 * @returns {void}
	 */
	logDebugToShell(message, ...params) {

		if (this.isDebug) {
			console.log(`\n ${chalk.keyword(`gray`)(`${message}`)} \n`, ...params);
		}
	}

	/**
	 * Log info message out to the shell.
	 *
	 * @param {string} message Message to log to the shell.
	 * @param {...string} [params] Parameters to for message.
	 * 
	 * @returns {void}
	 */
	logInfoToShell(message, ...params) {

		console.log(`\n ${chalk.keyword(`yellow`)(`${message}`)} \n`, ...params);
	}

	/**
	 * Log warning message out to the shell.
	 * 
	 * @param {string} message Message to log to the shell.
	 * @param {...string} [params] Parameters to for message.
	 * 
	 * @returns {void}
	 */
	logWarnToShell(message, ...params) {

		console.log(`\n ${chalk.keyword(`orange`)(`${message}`)} \n`, ...params);
	}

	/**
	 * Log error message out to the shell.
	 * 
	 * @param {string} message Message to log to the shell.
	 * @param {...string} [params] Parameters to for message.
	 * 
	 * @returns {void}
	 */
	logErrorToShell(message, ...params) {

		console.log(`\n ${chalk.keyword(`red`)(`${message}`)} \n`, ...params);
	}

	/**
	 * Logs an info message of the command that will be run to the shell.
	 * 
	 * @param {string} action The command action, e.g. init, run.
	 * @param {string} cwd The working directory the command is being run in.
	 * @param {Object} options - The options passed to the command.
	 * 
	 * @returns {void}
	 */
	logCommandHeader(action, cwd, options) {

		// Generate an options format string.
		let optionsString = ``;

		for (const key in options) {

			if (options[key]) {
				optionsString += ` --${key}=${options[key]}`;
			}
		}

		// Log the header message.
		this.logInfoToShell(`
			  --------------------------------------------------------------------------------
			  COMMAND:    ${action}
			  OPTIONS:    ${optionsString.replace(` `, ``)}
			  DIRECTORY:  ${cwd}
			  --------------------------------------------------------------------------------
		`.split(`\t`).join(``));
	}

	// ----------------------
	// HELPERS - FILE EDITING
	// ----------------------

	/**
	 * Open a JSON file, edit its contents via a delegate provided and save it back to disk.
	 *
	 * @param {string} filePath Full path of file to read /write
	 * @param {function} delegate Function to call to edit the object in memory.
	 * 
	 * @returns {void}
	 */
	async editJsonFile(filePath, delegate) {

		// Load and parse the JSON file to an editable object.
		const contents = await parseJSON(await fsp.readFile(filePath, `utf8`));

		// Allow the specified delegate function to modify the JSON content.
		delegate(contents);

		// Convert the editable object back into a JSON file and write it to disk.
		await fsp.writeFile(filePath, stringifyJSON(contents, null, `\t`));
	}

	/**
	 * Open a text file, edit its contents via a delegate provided and save it back to disk.
	 *
	 * @param {string} filePath Full path of file to read /write
	 * @param {StringDelegate} delegate Function to call to edit the object in memory.
	 * 
	 * @returns {void}
	 */
	async editTextFile(filePath, delegate) {

		// Load and parse the text file to an editable array of lines.
		const stringArray = (await fsp.readFile(filePath, `utf8`)).split(/\r?\n/);

		// Allow the specified delegate function to modify the array content.
		delegate(stringArray);

		// Convert the editable array back into a text file and write it to disk.
		await fsp.writeFile(filePath, stringArray.join(`\r\n`));
	}

	/**
	 * Finds a specific text pattern in a file and replaces it with the given replacement text.
	 * 
	 * @param {string} filePath - The location of the file to edit.
	 * @param {string} find - The text to find in the file.
	 * @param {string} replace - The text to replace it with.
	 * 
	 * @returns {void}
	 */
	async replaceTextInFile(filePath, find, replace) {

		// Read the file contents.
		let content = await fsp.readFile(filePath, `utf8`);

		// Replace the given text pattern.
		content = content.replace(new RegExp(find, `g`), replace);

		// Write the file update.
		await fsp.writeFile(filePath, content);
	}

	/**
	 * Reads a JSON file and parses it to JavaScript object representation.
	 * 
	 * @param {string} filePath - The relative path to the JSON file from the current working directory.
	 * 
	 * @returns {JSON} The parsed contents of the JSON file.
	 */
	async readJsonFile(filePath) {

		if (!fs.existsSync(filePath)) {
			throw new Error(`Could not find JSON file at ${filePath}`);
		}

		return parseJSON(await fsp.readFile(filePath, `utf8`));
	}

	// --------------------
	// HELPERS - VALIDATION
	// --------------------

	/**
	 * Validate a given app ID to ensure it complies with the platform guidelines.
	 *
	 * @param {string} projectName Value passed to evaluate.
	 * @param {boolean} [logWarning=true] When true, logs an warning out to the console should validation fail.
	 * 
	 * @returns {boolean} Validation result.
	 */
	validateProjectName(projectName, logWarning = true) {

		// Ensure a value has been provided.
		if (!projectName) {

			if (logWarning) {
				return `Project name is required`;
			}
		}

		// Check that the value is of the correct length.
		const maxLength = 120;
		const minLength = 3;

		if (projectName.length > maxLength || projectName.length < minLength) {

			if (logWarning) {
				return `Project name must be between ${minLength} and ${maxLength} characters long, ${projectName.length} provided.`;
			}
		}

		// Check that the value is of the correct format, i.e. only allow: 
		// - lower case letters
		// - upper case letters
		// - dashes
		if (!(/^[A-Za-z0-9-]+$/).test(projectName)) {

			if (logWarning) {
				return `Project name may only contain upper case letters, lower case letters or dashes`;
			}
		}

		// All checks passed, value is allowable.
		return true;
	}

	/**
	 * Validate a given mobile app name to ensure it complies with mobile app store guidelines.
	 *
	 * @param {string} appName Value passed to evaluate.
	 * @param {boolean} [logWarning=true] When true, logs an warning out to the console should validation fail.
	 * 
	 * @returns {boolean} Validation result.
	 */
	validateMobileAppName(appName, logWarning = true) {

		// Ensure a value has been provided.
		if (!appName) {

			if (logWarning) {
				return `App name name is required`;
			}
		}

		// Check that the value is of the correct length.
		const maxLength = 120;
		const minLength = 2;

		if (appName.length > maxLength || appName.length < minLength) {

			if (logWarning) {
				return `App name must be between ${minLength} and ${maxLength} characters long, ${appName.length} provided.`;
			}
		}

		// All checks passed, value is allowable.
		return true;
	}

	/**
	 * Validate a given mobile app ID to ensure it complies with mobile app store guidelines.
	 *
	 * @param {string} appID Value passed to evaluate.
	 * @param {boolean} [logWarning=true] When true, logs an warning out to the console should validation fail.
	 * 
	 * @returns {boolean} Validation result.
	 */
	validateMobileAppID(appID, logWarning = true) {

		// Ensure a value has been provided.
		if (!appID) {

			if (logWarning) {
				return `App ID name is required`;
			}
		}

		// Check that the value is of the correct length.
		const maxLength = 120;
		const minLength = 10;

		if (appID.length > maxLength || appID.length < minLength) {

			if (logWarning) {
				return `App ID must be between ${minLength} and ${maxLength} characters long, ${appID.length} provided.`;
			}
		}

		// Check that the value is of the correct format, i.e. only allow domain formatted strings, e.g. com.company.AppName
		if (!(/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+[0-9a-z_]$/i).test(appID)) {

			if (logWarning) {
				return `App ID must follow Android naming pattern, e.g. com.company.MyApp, no dashes are allowed.`;
			}
		}

		// All checks passed, value is allowable.
		return true;
	}

	/**
	 * Generate a default project name based on the current directory.
	 * 
	 * The current directory name gets validated in the same manner as validating a project name provided by the user
	 * to determine if it can be used.
	 *
	 * @returns {string|null} Default project name or null if the directory name is not suitable.
	 */
	getDefaultProjectName() {

		const defaultProjectName = path.basename(process.cwd());

		return this.validateProjectName(defaultProjectName, false) === true ? defaultProjectName : null;
	}

	// -----------
	// SHARED JOBS
	// -----------

	_setupJsAndTsConfigJson(update, emptyProjectPath, filePrefix) {

		const platformConfigJson = Utils.platformPath(`./${emptyProjectPath}/${filePrefix}config.json`);
		const appConfigJson = `${Utils.workingDir}/${filePrefix}config.json`;

		// Copy file to app's root dir.
		fs.copyFileSync(platformConfigJson, appConfigJson);

		if (!fs.existsSync(`${Utils.workingDir}/src`)) {
			fs.mkdirSync(`${Utils.workingDir}/src`);
		}

		// Set file paths.
		if (fs.existsSync(Utils.platformPath(`./packages/ocwp-core/src`)) &&
			fs.existsSync(Utils.platformPath(`./packages/ocwp-components/src`))) {
			Utils.replaceTextInFile(`{basePath}`, Utils.platformDir, `${Utils.workingDir}/${filePrefix}config.json`);
			Utils.replaceTextInFile(`{corePath}`, `packages/ocwp-core/`, `${Utils.workingDir}/${filePrefix}config.json`);
			Utils.replaceTextInFile(`{componentsPath}`, `packages/ocwp-components/`, `${Utils.workingDir}/${filePrefix}config.json`);
		} else {
			Utils.replaceTextInFile(`{basePath}`, Utils.platformPath(`./platform`), `${Utils.workingDir}/${filePrefix}config.json`);
			Utils.replaceTextInFile(`{corePath}`, ``, `${Utils.workingDir}/${filePrefix}config.json`);
			Utils.replaceTextInFile(`{componentsPath}`, ``, `${Utils.workingDir}/${filePrefix}config.json`);
		}

		Utils.replaceTextInFile(`{appPath}`, `${Utils.workingDir}/`, `${Utils.workingDir}/${filePrefix}config.json`);

		// Make it platform independent
		Utils.replaceTextInFile(/\\/g, `/`, `${Utils.workingDir}/${filePrefix}config.json`);

		if (update) {
			this.logWarnToShell(`MODIFIED "./${filePrefix}config.json" file, please review changes and commit ...`);
		}
	}

	async _updateGitIgnoreAndSettingsJson() {

		// Read ".gitignore" file to see if it contains specific entries that must be excluded.
		const ignoreSettingsFound = await new Promise((resolve, _reject) => {

			const readInterface = readline.createInterface({
				input: fs.createReadStream(`${Utils.workingDir}/.gitignore`)
			});

			const found = {};

			readInterface.on(`line`, (line) => {

				if (line === `node_modules`) {
					found.nodeModules = true;
				}
			});

			readInterface.on(`close`, () => {
				resolve(found);
			});
		});

		if (
			!ignoreSettingsFound.nodeModules) {
			// Update the ".gitignore" file ignore "node_modules" dir.
			if (!ignoreSettingsFound.nodeModules) {
				await fsp.appendFile(`${Utils.workingDir}/.gitignore`, `\nnode_modules`);
			}

			this.logWarnToShell(`MODIFIED ".gitignore" file, please review changes and commit ...`);
		}
	}

	/**
	 * Creates / Updates intellisense-related files for a project.
	 * 
	 * @param {boolean} [update=false] When true, logs a warning to the shell indicating that the file has been updated.
	 * 
	 * @returns {Promise<void>} Promise for the completed execution.
	 */
	async setupIntellisense(update = false) {

		const emptyProjectPath = `deploy/framework/web-components/empty-project`;

		// Setup "jsconfig.json" and "tsconfig.json" files.
		this._setupJsAndTsConfigJson(update, emptyProjectPath, `js`);
		this._setupJsAndTsConfigJson(update, emptyProjectPath, `ts`);

		if (!update) {
			return;
		}

		// Setup ".gitignore" and "settings.json" files.
		await this._updateGitIgnoreAndSettingsJson();

		this.logWarnToShell(`MODIFIED ".vscode/settings.json" file intellisense config, please review changes and commit ...`);
	}

	/**
	 * Sets up launch.json PATH environment variable to prioritise current node
	 * 
	 * @returns {void}
	 */
	async setupLaunch() {
		const launchJsonPath = `${Utils.workingDir}/.vscode/launch.json`;

		// Attempt to update the "./vscode/launch.json" file.
		await this.editJsonFile(launchJsonPath, (editLaunchJson) => {

			editLaunchJson.configurations.filter((configuration) => [`Run`, `Capacitor: Launch Android`, `Capacitor: Launch iOS`, `Run: Firefox`, `Run: Edge`].includes(configuration.name)).forEach(configuration => {

				switch (configuration.name) {
					case `Run`:
					case `Capacitor: Launch Android`:
					case `Capacitor: Launch iOS`:
						configuration.type = `chrome`;
						break;
					case `Run: Firefox`:
						configuration.type = `firefox`;
						break;
					case `Run: Edge`:
						configuration.type = `msedge`;
						break;
					default:
						break;
				}
			});
		});

		Utils.replaceTextInFile(/\\\\/g, `/`, launchJsonPath);
	}

	/**
	 * Sets up linting support within both a new and existing project.
	 *
	 * @param {Boolean} [update=false] When true, performs the update-related steps.
	 * 
	 * @returns {void}
	 */
	async setupLinting(update = false) {

		const settingsJsonPath = `${Utils.workingDir}/.vscode/settings.json`;

		if (update) {

			// Attempt to copy ".eslintrc.json" file.
			const eslintrcJsonPath = Utils.projectPath(`./.eslintrc.json`);

			if (!fs.existsSync(eslintrcJsonPath)) {
				await fsp.copyFile(Utils.platformPath(`./deploy/framework/web-components/empty-project/.eslintrc.json`), eslintrcJsonPath);
				this.logWarnToShell(`ADDED ".eslintrc.json" file, please review and commit ...`);
			}

			// Attempt to update the "./vscode/settings.json" file.
			await this.editJsonFile(`${Utils.workingDir}/.vscode/settings.json`, (settings) => {

				if (!settings[`eslint.options`]) {
					settings[`eslint.options`] = {
						configFile: `./.eslintrc.json`
					};
				}

				if (settings[`eslint.enable`] === undefined) {
					settings[`eslint.enable`] = true;
				}

				if (settings[`eslint.alwaysShowStatus`] === undefined) {
					settings[`eslint.alwaysShowStatus`] = true;
				}

				// Attempt to remove file exclude for "src/types.d.ts" file within ".vscode/settings.json" file.
				if (settings[`files.exclude`] &&
					(settings[`files.exclude`][`src/types.d.ts`] || settings[`files.exclude`][`src/types.d.ts`] === false)) {
					delete settings[`files.exclude`][`src/types.d.ts`];
				}

				// Remove the cordova plugin settings.
				settings[`cordova.cordovaExecutable`] = undefined;
			});
		}

		Utils.replaceTextInFile(/\\/g, `/`, settingsJsonPath);

		if (update) {
			this.logWarnToShell(`MODIFIED ".vscode/settings.json" file linting config, please review changes and commit ...`);
		}
	}

	/**
	 * Updates the "extensions.json" file by replacing "bierner.lit-html" with "runem.lit-plugin" plugin
	 * 
	 * @returns {void}
	 */
	async updateExtensions() {

		const extensionsJsonFilePath = Utils.projectPath(`./.vscode/extensions.json`);
		let modified = false;

		if (fs.existsSync(extensionsJsonFilePath)) {

			await this.editJsonFile(extensionsJsonFilePath, (configJson) => {

				// Attempt to replace "bierner.lit-html" with "runem.lit-plugin" and remove "msjsdiag.debugger-for-chrome".
				if (configJson.recommendations) {
					const index = configJson.recommendations.indexOf(`bierner.lit-html`);
					if (index !== -1) {
						configJson.recommendations[index] = `runem.lit-plugin`;
						modified = true;
					}

					const chromeIndex = configJson.recommendations.indexOf(`msjsdiag.debugger-for-chrome`);
					if (chromeIndex !== -1) {
						configJson.recommendations.splice(chromeIndex, 1);
						modified = true;
					}
				}
			});
		}

		if (modified) {
			this.logWarnToShell(`MODIFIED ".vscode/extensions.json" file, please review changes and commit ...`);
		}
	}
}