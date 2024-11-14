import { CommandBase } from './CommandBase.js';
import { Utils } from './Utils.js';
import fse from 'fs-extra';

/**
 * Facilitates adding features to an existing project based on user input.
 */
export class PluginCommand extends CommandBase {

	// -----------
	// CONSTRUCTOR
	// -----------

	/**
	 * Initialise the command.
	 */
	constructor() {

		super(`mobile`);
	}

	// ----------------
	// PUBLIC FUNCTIONS
	// ----------------

	/**
	 * Determines if there's reasons why this command cannot execute.
	 */
	get canRun() {

		const files = fse.readdirSync(Utils.workingDir, { encoding: `utf8` });

		// Check for empty folder or missing platform.json.
		if (!files || files.length === 0 || files.findIndex(file => file.includes(`platform.json`)) === -1) {
			this.logWarnToShell(`'platform.json' not found, unable to attach ...`);

			return false;
		}

		return true;
	}

	/**
	 * Executes commands to publish image into the DTR.
	 * 
	 * @returns {void}
	 */
	async run() {

		// Ensure that the init command may be run in the working directory, e.g. the folder is empty.
		if (!this.canRun) {
			return;
		}

		// Inspect the platform.json file for existing mobile feature configuration.
		const platformConfig = Utils.appPlatformJson;

		if (platformConfig.app !== `standalone`) {

			this.logWarnToShell(`ERROR: Platform features can only be attached to standalone applications ...`);
			return;
		}

		if (!this.answers) {
			this.answers = {};
		}

		// Ask the user which shell type they want to attach, e.g. capacitor, cordova, electron, etc.
		if (!this.answers.shell) {

			if (fse.existsSync(`${Utils.workingDir}/capacitor`)) {

				this.answers.shell = `capacitor`;
			} else if (fse.existsSync(`${Utils.workingDir}/cordova`)) {

				this.answers.shell = `cordova`;
			}
		}

		// Only prompt further if a native device shell needs to be setup.
		if (this.answers.shell && (this.answers.shell.includes(`capacitor`) || this.answers.shell.includes(`cordova`))) {

			const message = this.answers.shell.includes(`capacitor`) ? `Mobile plugin (eg @capacitor/plugin-name or @capacitor-community/plugin-name):` : `plugin-name`;

			if (this.answers.addPlugin?.length > 0) {

				this.answers.action = `add`;
			} else if (this.answers.removePlugin?.length > 0) {

				this.answers.action = `remove`;
			}

			if (!this.answers.action) {

				this.answers.action = await this.promptList({
					message: `Would you like to add or remove a plugin?`,
					choices: [
						{
							message: `Add`,
							name: `add`
						},
						{
							message: `Remove`,
							name: `remove`
						}
					]
				});
			}

			// Ask the user if they would like to install mobile plugins.
			if (this.answers.action.includes(`add`) && this.answers.addPlugin?.length === 0) {

				const addPlugin = await this.promptText({
					message: message
				});

				this.answers.addPlugin = addPlugin.split(`,`);
			} else if (this.answers.action.includes(`remove`) && this.answers.removePlugin?.length === 0) {

				const packageJson = await this.readJsonFile(`${Utils.workingDir}/${this.answers.shell}/package.json`);
				console.log(Object.keys(packageJson?.dependencies));
				const plugins = [];
				if (packageJson?.dependencies) {

					// Remove the Core package dependacies that can't be removed
					if (this.answers.shell.includes(`capacitor`)) {
						plugins.push(...Object.keys(packageJson?.dependencies).filter((plugin) => !plugin.includes(`@capacitor/android`) &&
							!plugin.includes(`@capacitor/cli`) &&
							!plugin.includes(`@capacitor/core`) &&
							!plugin.includes(`@capacitor/device`) &&
							!plugin.includes(`@capacitor/ios`)));
					}
				}
				this.answers.removePlugin = await this.promptList({
					message: message,
					multiple: true,
					choices: plugins.map((plugin) => ({ name: plugin }))
				});
			}

			// Install the user given plugin.
			if (this.answers.shell) {

				if (this.answers.addPlugin?.length > 0) {

					// Print out package list
					this.logInfoToShell(`Installing packages\n\t${this.answers.addPlugin.join(`\n\t`)}`);

					// Install the Capacitor plugin.
					if (this.answers.shell.includes(`capacitor`)) {
						await this._addPluginCapacitor();
					}

					// Install the Cordova plugin.
					if (this.answers.shell.includes(`cordova`)) {
						await this._addPluginCordova();
					}
				}

				if (this.answers.removePlugin.length > 0) {

					// Print out package list
					this.logInfoToShell(`Removing packages\n\t${this.answers.removePlugin.join(`\n\t`)}`);

					// Install the Capacitor plugin.
					if (this.answers.shell.includes(`capacitor`)) {
						await this._removePluginCapacitor();
					}

					// Install the Cordova plugin.
					if (this.answers.shell.includes(`cordova`)) {
						await this._removePluginCordova();
					}
				}
			}
		}
	}

	// -------
	// HELPERS
	// -------

	// N/A

	// -------------
	// PROCESS STEPS
	// -------------

	/**
	 * Installs the Capacitor plugin within the working directory.
	 * 
	 * @returns {Promise<void>} Promise for the completed execution.
	 */
	async _addPluginCapacitor() {

		// Verify if Capacitor is installed
		const isCapacitorInstalled = fse.existsSync(`${Utils.workingDir}/capacitor`);

		// Start the Capacitor installation / patch job.
		try {

			// Install Capacitor if it does not exist in the working directory.
			if (isCapacitorInstalled) {

				await this.runCommand(`npm install ${this.answers.addPlugin.join(` `)} -E`, `./capacitor`, `Adding plugin ...`);
				await this.runCommand(`npx cap sync`, `./capacitor`, `Syncing Capacitor Project ...`);
			}

		} catch (error) {

		}
	}

	/**
	 * Installs the Cordova plugin within the working directory.
	 * 
	 * @returns {Promise<void>} Promise for the completed execution.
	 */
	async _addPluginCordova() {

		// Verify if Cordova is installed
		const isCordovaInstalled = fse.existsSync(`${Utils.workingDir}/cordova`);

		// Start the Capacitor installation / patch job.
		try {

			// Install Capacitor if it does not exist in the working directory.
			if (isCordovaInstalled) {

				await this.runCommand(`npx cordova plugin add ${this.answers.addPlugin.join(` `)} -E`, `./cordova`, `Adding core plugin: whitelist ...`);
			}

		} catch (error) {

		}
	}

	/**
	 * Installs the Capacitor plugin within the working directory.
	 * 
	 * @returns {Promise<void>} Promise for the completed execution.
	 */
	async _removePluginCapacitor() {

		// Verify if Capacitor is installed
		const isCapacitorInstalled = fse.existsSync(`${Utils.workingDir}/capacitor`);

		// Start the Capacitor installation / patch job.
		try {

			// Remove Capacitor if it does not exist in the working directory.
			if (isCapacitorInstalled) {

				await this.runCommand(`npm uninstall ${this.answers.removePlugin.join(` `)}`, `./capacitor`, `Removing plugin ...`);
				await this.runCommand(`npx cap sync`, `./capacitor`, `Syncing Capacitor Project ...`);
			}

		} catch (error) {

		}
	}

	/**
	 * Installs the Cordova plugin within the working directory.
	 * 
	 * @returns {Promise<void>} Promise for the completed execution.
	 */
	async _removePluginCordova() {

		// Verify if Cordova is installed
		const isCordovaInstalled = fse.existsSync(`${Utils.workingDir}/cordova`);

		// Start the Cordova installation / patch job.
		try {

			// Remove Cordova if it does not exist in the working directory.
			if (isCordovaInstalled) {

				await this.runCommand(`npx cordova plugin remove ${this.answers.removePlugin.join(` `)}`, `./cordova`, `Removing plugin ...`);
			}

		} catch (error) {

		}
	}
}