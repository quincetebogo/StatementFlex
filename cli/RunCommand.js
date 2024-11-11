import { CommandBase } from './CommandBase.js';
import { Utils } from './Utils.js';
import fse from 'fs-extra';
import os from 'os';
import path from 'path';

/**
 * Facilitates running a platform-based web app.
 */
export class RunCommand extends CommandBase {

	// -----------
	// CONSTRUCTOR
	// -----------

	/**
	 * Initialise the command.
	 */
	constructor() {

		super(`run`);
	}

	// ----------------
	// PUBLIC FUNCTIONS
	// ----------------

	/**
	 * Runs the web app within the current working directory based on its framework type.
	 * 
	 * @returns {void}
	 */
	async run() {

		// Ensure that there are no unmet conditions that prevent the command from running.
		if (!super.canRun) {
			return;
		}

		// ... TODO: review what this block of code does, is supposed to do, then add an appropriate comment...?
		if (this.answers.port === `default` && fse.existsSync(`${Utils.workingDir}/ProjectManifest.json`)) {
			await this.editJsonFile(`${Utils.workingDir}/ProjectManifest.json`, (projectManifest) => {
				if ((projectManifest.Port || projectManifest.port) && (projectManifest.Port || projectManifest.port) > 0) {
					this.answers.port = projectManifest.Port || projectManifest.port;
				}
			});
		}

		// Default the web server port to 8080 if not specified.
		if (this.answers.port === `default`) {
			this.answers.port = 8080;
		}

		// Default the shell to PWA if not specified.
		if (!this.answers.shell) {
			this.answers.shell = `pwa`;
		}

		// Compile the app and run it in a local web server.
		this.logInfoToShell(`Building web app package ...`);

		if (Utils.appPlatformJson.framework === `web-components` || Utils.appPlatformJson.framework === `WebComponents`) {
			await this._runWebComponents();
		}

		// Launch the shell environment.
		if (this.answers.shell === `capacitor`) {
			await this._runCapacitor();
		} else if (this.answers.shell === `cordova`) {
			await this._runCordova();
		}

		// Launch the shell environment.
		this.logInfoToShell(`READY: App running on localhost -> http://localhost:${this.answers.port}`);
	}

	// -------------------
	// FRAMEWORK LAUNCHERS
	// -------------------

	/**
	 * Runs the app using the web-components framework.
	 * 
	 * @private
	 * 
	 * @returns {Promise} Promise
	 */
	_runWebComponents() {

		// Run webpack live reload run command.
		return new Promise((resolve, reject) => {

			try {

				// Execute the CLI command.
				this.executeChildProcessCommandInDirectory({
					errorCode: 1,
					cwd: `.`,
					command: `node`,
					args: [
						Utils.platformPath(`./node_modules/webpack-cli/bin/cli.js`),
						`serve`,
						`--port=${this.answers.port}`,
						`--history-api-fallback`,
						`--config="${Utils.platformPath(`./runtime/webpack.config.js`)}"`,
						`--env mode="development"`,
						`--env shell="${this.answers.shell}"`, // pwa|cordova|capacitor
						`--env platform="${this.answers.platform}"` // browser|android|ios|electron
					],
					quiet: false,
					messageCallback: (message) => {

						// Resolve the process once we see the successfully compiled message in the webpack output for the first time.
						if (new RegExp(`Compiled successfully`).test(message)) {
							resolve();
						}
					}
				});

			} catch (error) {

				reject(error);
			}
		});
	}

	// ---------------
	// SHELL LAUNCHERS
	// ---------------

	/**
	 * Launches the capacitor shell environment.
	 * 
	 * @private
	 * 
	 * @returns {void}
	 */
	async _runCapacitor() {

		// Determine the mobile platform the user wants to run.
		if (!this.answers.platform) {

			// Read the package.json file to identify the installed mobile platforms.
			const packageJson = await this.readJsonFile(`./capacitor/package.json`);

			const dependencies = packageJson.dependencies || {};
			const platforms = [`browser`];

			if (dependencies[`@capacitor/android`]) {
				platforms.push(`android`);
			}

			if (dependencies[`@capacitor/ios`]) {
				platforms.push(`ios`);
			}

			// Prompt the user to select a mobile platform from the list.
			this.answers.platform = await this.promptList({
				name: `platform`,
				message: `Select mobile platform:`,
				choices: platforms
			});
		}

		// Determine the most appropriate target device to run the app on, based on the user input or preference.
		let targetType = ``;

		if (!this.answers.target || this.answers.target === `device` || this.answers.target === `emulator`) {

			this.logInfoToShell(`Scanning for installed emulators & connected devices ...`);

			// Lookup the list of available target devices.
			const targets = await this._getCapacitorTargets(this.answers.platform);

			// Prompt the user to select a target from the list of available targets, based on their preference.
			if (!this.answers.target) {

				// No preference indicated, select from the full list of available targets.
				this.answers.target = await this._promptSelectTarget(targets.devices, targets.emulators, targets.others);

			} else if (this.answers.target === `device`) {

				// Device preference indicated, select from the list of device targets.
				this.answers.target = await this._promptSelectTarget(targets.devices, []);

			} else if (this.answers.target === `emulator`) {

				// Emulator preference indicated, select from the list of emulator targets.
				this.answers.target = await this._promptSelectTarget([], targets.emulators);
			}

			// Determine the type of the target that was selected.
			if (targets.devices.includes(this.answers.target)) {
				targetType = `device`;
			} else if (targets.emulators.includes(this.answers.target)) {
				targetType = `emulator`;
			} else {
				targetType = `other`;
			}
		}

		// Launch app on the mobile platform.
		const runJobInBackground = async () => {

			if (this.answers.platform !== `browser`) {

				if (targetType === `device`) {

					// Create a capacitor runtime config for the build.
					await fse.copy(`./capacitor/capacitor.config.local.json`, `./capacitor/capacitor.config.json`);

					// Inject the machine IP address into the config file to enable serving from localhost.
					const ipAddress = `localhost`;
					const webAppURL = `http://${ipAddress}:${this.answers.port}`;

					await this.editJsonFile(`./capacitor/capacitor.config.json`, (config) => {
						config.server.url = webAppURL;
						config.server.allowNavigation[config.server.allowNavigation.indexOf(`web-server-ip`)] = ipAddress;
					});

					// Copy the web content into the capacitor project for the mobile platform.
					await this.runCommand(`npx cap run ${this.answers.platform} --target=${this.answers.target}`, `./capacitor`, `Preparing Capacitor package for ${this.answers.platform}, might take a minute ...`);

				} else if (targetType === `emulator`) {

					// Create a capacitor runtime config for the build.
					await fse.copy(`./capacitor/capacitor.config.local.json`, `./capacitor/capacitor.config.json`);

					// Inject the machine IP address into the config file to enable serving from localhost.
					const ipAddress = this._getIPAddress();
					const webAppURL = `http://${ipAddress}:${this.answers.port}`;

					await this.editJsonFile(`./capacitor/capacitor.config.json`, (config) => {
						config.server.url = webAppURL;
						config.server.allowNavigation[config.server.allowNavigation.indexOf(`web-server-ip`)] = ipAddress;
					});

					// Copy the web content into the capacitor project for the mobile platform.
					await this.runCommand(`npx cap run ${this.answers.platform} --target=${this.answers.target}`, `./capacitor`, `Preparing Capacitor package for ${this.answers.platform}, might take a minute ...`);

				} else if (targetType === `other` && this.answers.target === `IDE`) {

					// Create a capacitor runtime config for the build.
					await fse.copy(`./capacitor/capacitor.config.local.json`, `./capacitor/capacitor.config.json`);

					// Inject the machine IP address into the config file to enable serving from localhost.
					const ipAddress = `localhost`;
					const webAppURL = undefined;

					await this.editJsonFile(`./capacitor/capacitor.config.json`, (config) => {
						config.server.url = webAppURL;
						config.server.allowNavigation[config.server.allowNavigation.indexOf(`web-server-ip`)] = ipAddress;
					});

					// Copy the web content into the capacitor project for the mobile platform.
					await this.runCommand(`npx cap sync ${this.answers.platform}`, `./capacitor`, `Preparing Capacitor package for ${this.answers.platform}, might take a minute ...`);

					// Launch the platform IDE, e.g. Android Studio, XCode, etc.
					this.runCommand(`npx cap open ${this.answers.platform}`, `./capacitor`, `Launching Capacitor app in ${this.answers.platform} IDE ...`);
				}
			}
		};

		await runJobInBackground();
	}

	/**
	 * Launch the cordova shell environment.
	 * 
	 * @private
	 * 
	 * @returns {void}
	 */
	async _runCordova() {

		// Determine the mobile platform the user wants to run.
		if (!this.answers.platform) {

			// Read the package.json file to identify the installed mobile platforms.
			const packageJson = await this.readJsonFile(`./cordova/package.json`);

			if (!packageJson.cordova) {
				throw new Error(`Cordova configuration not initialised in the package.json file.`);
			}

			if (!packageJson.cordova.platforms) {
				throw new Error(`Cordova platforms not initialised in the package.json file.`);
			}

			// Prompt the user to select a mobile platform from the list.
			this.answers.platform = await this.promptList({
				name: `platform`,
				message: `Select mobile platform:`,
				choices: packageJson.cordova.platforms
			});
		}

		// The cordova browser platform does not have a device or emulator target, so just default it web.
		if (this.answers.platform === `browser`) {
			this.answers.target = `web`;
		}

		// Determine the most appropriate target device to run the app on, based on the user input or preference.
		if (!this.answers.target || this.answers.target === `device` || this.answers.target === `emulator`) {

			this.logInfoToShell(`Scanning for installed emulators & connected devices ...`);

			// Lookup the list of available target devices.
			const targets = await this._getCordovaTargets(this.answers.platform);

			// Prompt the user to select a target from the list of available targets, based on their preference.
			if (!this.answers.target) {

				// No preference indicated, select from the full list of available targets.
				this.answers.target = await this._promptSelectTarget(targets.devices, targets.emulators);

			} else if (this.answers.target === `device`) {

				// Device preference indicated, select from the list of device targets.
				this.answers.target = await this._promptSelectTarget(targets.devices, []);

			} else if (this.answers.target === `emulator`) {

				// Emulator preference indicated, select from the list of emulator targets.
				this.answers.target = await this._promptSelectTarget([], targets.emulators);
			}
		}

		// Launch app on the mobile platform target.
		const runJobInBackground = async () => {

			// Temporarily inject the machine IP address into the config.xml file to enable serving from localhost.
			const webAppURL = `http://${this._getIPAddress()}:${this.answers.port}`;

			await this.replaceTextInFile(`./cordova/config.xml`, `web-app-url`, webAppURL);
			await this.replaceTextInFile(`./cordova/www/config.js`, `web-app-url`, webAppURL);
			await this.replaceTextInFile(`./cordova/www/config.js`, `debug: false`, `debug: true`);

			// Copy the web content into the cordova project for the mobile platform.
			await this.runCommand(`npx cordova prepare ${this.answers.platform}`, `./cordova`, `Preparing Cordova package for ${this.answers.platform} ...`);

			// Restore the config.xml file to ensure we don't check in the temporary changes.
			await this.replaceTextInFile(`./cordova/config.xml`, webAppURL, `web-app-url`);
			await this.replaceTextInFile(`./cordova/www/config.js`, webAppURL, `web-app-url`);
			await this.replaceTextInFile(`./cordova/www/config.js`, `debug: true`, `debug: false`);

			// Run the local build.
			if (this.answers.target === `web`) {
				await this.runCommand(`npx cordova run ${this.answers.platform} --noprepare`, `./cordova`, `Launching Cordova ${this.answers.platform} app in web browser ...`);
			} else {
				await this.runCommand(`npx cordova run ${this.answers.platform} --noprepare --target=${this.answers.target}`, `./cordova`, `Launching Cordova ${this.answers.platform} app on ${this.answers.target} ...`);
			}
		};

		await runJobInBackground();
	}

	// -----------------
	// HELPERS FUNCTIONS
	// -----------------

	/**
	 * Finds a list of mobile device targets, such as emulators and USB devices, connected to the machine.
	 * 
	 * @param {string} platform - The mobile platform to look for connected targets for.
	 * 
	 * @returns {object} The collection of connected devices.
	 */
	async _getCapacitorTargets(platform) {

		// Query the lis of connected targets on the machine.
		const outputLog = await this.runCommand(`npx cap run ${platform} --list`, `./capacitor`, null, true);

		/*
		Name                            API      Target ID
		-----------------------------------------------------------
		OPPO CPH1917                    API 29   b0b93364
		Nexus 5X API 24 (emulator)      API 24   Nexus_5X_API_24
		Pixel 3a API 30(emulator)       API 30   Pixel_3a_API_30
		Pixel 3a XL API 24(emulator)    API 24   Pixel_3a_XL_API_24
		*/

		// Filter through the raw command output to identify the device & emulator targets.
		const devices = [];
		const emulators = [];

		for (const logEntry of outputLog) {

			if (logEntry.startsWith(`Name`)) {

				const lines = logEntry.split(`\n`);

				if (lines.length > 0) {

					for (let i = 2; i < lines.length; i++) {

						const line = lines[i];

						if (line) {

							if (line.includes(`(emulator)`)) {
								emulators.push(line.substr(line.lastIndexOf(` `) + 1));
							} else {
								devices.push(line.substr(line.lastIndexOf(` `) + 1));
							}
						}
					}
				}
			}
		}

		return {
			devices: devices,
			emulators: emulators,
			others: [`IDE`]
		};
	}

	/**
	 * Finds a list of mobile device targets, such as emulators and USB devices, connected to the machine.
	 * 
	 * @param {string} platform - The mobile platform to look for connected targets for.
	 * 
	 * @returns {object} The collection of connected devices.
	 */
	async _getCordovaTargets(platform) {

		// Query the lis of connected targets on the machine.
		const outputLog = await this.runCommand(`npx cordova run ${platform} --list`, `./cordova`, null, true);

		// Filter through the raw command output to identify the device & emulator targets.
		const devices = [];
		const emulators = [];

		let typeFollowing = null;

		for (const line of outputLog) {

			if (line === `Available ${platform} devices:`) {

				typeFollowing = `device`;

			} else if (line === `Available ${platform} virtual devices:`) {

				typeFollowing = `emulator`;

			} else if (line.indexOf(` `) === -1) { // Note: valid emulator names will never have space characters in them.

				switch (typeFollowing) {
					case `device`:
						devices.push(line);
						break;
					case `emulator`:
						emulators.push(line);
						break;
					default:
						break;
				}

			} else {

				console.log(`Target lookup error: `, line);
			}
		}

		return {
			devices: devices,
			emulators: emulators
		};
	}

	/**
	 * Prompt the user to select a target device from a list of installed targets on the machine.
	 * 
	 * @param {string[]} devices - The list of device targets to choose from.
	 * @param {string[]} emulators - The list of emulator targets to choose from.
	 * @param {string[]} others - The list of other targets to choose from.
	 * 
	 * @returns {string} The chosen target.
	 */
	_promptSelectTarget(devices, emulators, others = []) {

		const allTargets = [...devices, ...emulators, ...others];

		// No targets available on the machine, terminate the process.
		if (allTargets.length === 0) {
			throw new Error(`No devices found, check configuration in mobile OS IDE.`);
		}

		// Only 1 target available on the machine, no choice needed, just run using that one.
		if (allTargets.length === 1) {

			console.log(`Only 1 target found, using: ${allTargets[0]}`);
			return allTargets[0];
		}

		// More than 1 target available, prompt the user to select one from the list of available targets.
		const choices = [];

		if (devices.length > 0) {

			choices.push({
				name: `Devices`,
				disabled: true,
				choices: [...devices]
			});
		}

		if (emulators.length > 0) {

			choices.push({
				name: `Emulators`,
				disabled: true,
				choices: [...emulators]
			});
		}

		if (others.length > 0) {

			choices.push({
				name: `Other`,
				disabled: true,
				choices: [...others]
			});
		}

		return this.promptList({
			name: `target`,
			message: `Select mobile target device:`,
			choices: choices
		});
	}

	/**
	 * Get the user's machine IPv4 address.
	 * 
	 * @returns {string} The IP address.
	 */
	_getIPAddress() {

		const interfaces = os.networkInterfaces();

		// eslint-disable-next-line guard-for-in
		for (const key in interfaces) {

			const aliases = interfaces[key];

			for (const alias of aliases) {

				if (alias.family === `IPv4` && alias.address !== `127.0.0.1` && !alias.internal) {
					return alias.address;
				}
			}

		}

		return `0.0.0.0`;
	}
}