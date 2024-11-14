import { CommandBase } from './CommandBase.js';
import { Utils } from './Utils.js';
import chalk from 'chalk';
import fs from 'fs';
import fse from 'fs-extra';
import path from 'path';

/**
 * Facilitates attaching features to an existing project based on user input.
 */
export class AttachCommand extends CommandBase {

	// -----------
	// CONSTRUCTOR
	// -----------

	/**
	 * Initialise the command.
	 */
	constructor() {

		super(`attach`);
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

		this.answers.name = platformConfig.application.name;
		this.answers.app = platformConfig.application.app;
		this.answers.framework = platformConfig.application.framework;
		this.answers.type = platformConfig.application.type;

		if (platformConfig.application.id) {
			this.answers.mobileID = platformConfig.application.id;
			this.answers.mobileName = platformConfig.application.title;
		}

		// Ask the user which shell type they want to attach, e.g. capacitor, cordova, electron, etc.
		if (!this.answers.shell) {

			this.answers.shell = await this.promptList({
				message: `Mobile shell:`,
				choices: [
					{
						name: `capacitor`,
						hint: `Run your app in a Capacitor shell. Better for custom SDK integration & plugins.`
					},
					{
						name: `cordova`,
						hint: `Run your app in a Cordova shell. Robust, reliable, well documented.`
					}
				],
				multiple: true
			});
		}

		// Only prompt further if a native device shell needs to be setup.
		if (this.answers.shell && (this.answers.shell.includes(`capacitor`) || this.answers.shell.includes(`cordova`))) {

			// Ask the user if they would like to install optional mobile plugins.
			if (!this.answers.plugins) {

				this.answers.plugins = await this.promptList({
					message: `Mobile plugins (optional):`,
					choices: [
						{
							name: `camera`,
							hint: `Take and select photos.`
						},
						{
							name: `inappbrowser`,
							hint: `Load external websites in a pop over browser window.`
						}
					],
					multiple: true
				});
			}

			// Ask the user to specify their mobile app name.
			if (!this.answers.mobileName) {

				this.answers.mobileName = await this.promptText({
					message: `Mobile App Name, e.g. My App:`,
					hint: `The label that will appear underneath your app icon, may contain spaces.`,
					initial: await this._getProjectName(),
					validate: (value) => this.validateMobileAppName(value)
				});
			}

			// Ask the user to specify their unique mobile app ID.
			if (!this.answers.mobileID) {

				this.answers.mobileID = await this.promptText({
					message: `Mobile App ID, e.g. com.company.myapp:`,
					hint: `The unique mobile app ID in reverse domain name format.`,
					initial: `za.co.capitecbank.${this.answers.mobileName.split(` `).join(``).toLowerCase()}`,
					validate: (value) => this.validateMobileAppID(value)
				});
			}

			// Update "platform.json" file with user's answers.
			await this.editJsonFile(`./platform.json`, (platformJson) => {

				platformJson.type = `omni-channel`;
				platformJson.application.id = this.answers.mobileID;
				platformJson.application.title = this.answers.mobileName;
			});

			// Generate the shell specific files in the working directory.
			if (this.answers.shell) {

				if (this.answers.shell.includes(`capacitor`)) {
					await this._initShellCapacitor();
				}

				if (this.answers.shell.includes(`cordova`)) {
					await this._initShellCordova();
				}
			}

			// Install the project configurations if the parent command will not.
			if (!this.embedded) {

				// Setup the ".eslintrc" configuration.
				await this.setupLinting();

				// Setup the "launch.json" configuration.
				await this.setupLaunch();

				// Attempt to update the "src/.gitignore", "jsconfig.json", "tsconfig.json" and "src/types.d.ts" files.
				await this.setupIntellisense();

				// All done, inform the user what to do to start coding.
				this.logInfoToShell(`Shell attached, run ${chalk.keyword(`orange`)(`code .`)} to start coding.`);
			}
		}
	}

	// -------
	// HELPERS
	// -------

	async _getProjectName() {

		const platform = await this.readJsonFile(`./platform.json`);

		return platform?.application?.title ?? this.getDefaultProjectName();
	}

	// -------------
	// PROCESS STEPS
	// -------------

	/**
	 * Installs the Capacitor shell within the working directory.
	 * 
	 * @returns {Promise<void>} Promise for the completed execution.
	 */
	async _initShellCapacitor() {

		// Backup the existing capacitor directory if it exists.
		const isNewInstall = !fse.existsSync(`${Utils.workingDir}/capacitor`);

		if (!isNewInstall) {
			this.logInfoToShell(`Backing up Capacitor folder`);


			try {
				await fse.copy(`${Utils.workingDir}/capacitor`, `./capacitor_backup`);
				this.logInfoToShell(`Backup complete`);

			} catch (e) {
				this.logErrorToShell(e.message);
			}
		}

		// Start the Capacitor installation / patch job.
		try {

			this.logInfoToShell(`Attaching Capacitor Shell ...`);

			// Install Capacitor if it does not exist in the working directory.
			if (isNewInstall) {

				// Copy the capacitor project template files into the working directory.
				await fse.copy(Utils.platformPath(`./deploy/shell/capacitor`), `./capacitor`);

				// Restore the gitignore file name. Note: the _ is needed in the source project so that the template files can be checked in.
				fs.renameSync(`./capacitor/_gitignore`, `./capacitor/.gitignore`);

				// Set the project name in the package.json file.
				await this.editJsonFile(`./capacitor/package.json`, (file) => {
					file.name = this.answers.name.toLowerCase().split(` `).join(`-`);
				});

				// Set the app ID & name in the capacitor.config.json files.
				const envs = [`.local`, `.dev`, `.int`, `.qa`, `.prod`];

				for await (const env of envs) {

					this.editJsonFile(`./capacitor/capacitor.config${env}.json`, (file) => {

						file.appId = this.answers.mobileID;
						file.appName = this.answers.mobileName;
					});
				}

				// Create a capacitor runtime build config.
				await fse.copy(`./capacitor/capacitor.config.local.json`, `./capacitor/capacitor.config.json`);

				// Set the app name in the capacitor project index.html file.
				await this.replaceTextInFile(`./capacitor/www/index.html`, `app-name`, this.answers.mobileName);

				// Setup VSCode launch shortcuts in the launch.json file.
				await this.editJsonFile(`./.vscode/launch.json`, (file) => {

					if (!file.configurations.find((task) => task.name === `Capacitor: Launch Android`)) {

						// Create Android device launch configuration.
						file.configurations.push({
							type: `chrome`,
							request: `launch`,
							name: `Capacitor: Launch Android`,
							url: `http://localhost:8080`,
							webRoot: `$\{workspaceFolder}/`,
							preLaunchTask: `capacitor-run-android`,
							sourceMaps: true,
							trace: true
						});
					}

					if (!file.configurations.find((task) => task.name === `Capacitor: Launch iOS`)) {

						// Create iOS device launch configuration.
						file.configurations.push({
							type: `chrome`,
							request: `launch`,
							name: `Capacitor: Launch iOS`,
							url: `http://localhost:8080`,
							webRoot: `$\{workspaceFolder}/`,
							preLaunchTask: `capacitor-run-ios`,
							sourceMaps: true,
							trace: true
						});
					}
				});

				// Setup VSCode task shortcuts in the tasks.json file.
				await this.editJsonFile(`./.vscode/tasks.json`, (file) => {

					// Update the web run task to target the browser platform.
					for (const task of file.tasks) {

						if (task.label === `run`) {

							if (!task.args.includes(`--shell=pwa`)) {
								task.args.push(`--shell=pwa`);
							}

							if (!task.args.includes(`--platform=browser`)) {
								task.args.push(`--platform=browser`);
							}

							break;
						}
					}

					if (!file.tasks.find((task) => task.label === `capacitor-run-android`)) {

						// Create Android build task.
						const task = {
							"type": `shell`,
							"label": `capacitor-run-android`,
							"command": `./ocwp-legacy`,
							"args": [
								`run`,
								`--port`,
								`8080`,
								`--shell=capacitor`,
								`--platform=android`
							],
							"promptOnClose": true,
							"isBackground": true,
							"problemMatcher": {
								"owner": `webpack`,
								"severity": `error`,
								"fileLocation": `absolute`,
								"pattern": [
									{
										"regexp": `ERROR in (.*)`,
										"file": 1
									},
									{
										"regexp": `\\((\\d+),(\\d+)\\):(.*)`,
										"line": 1,
										"column": 2,
										"message": 3
									}
								],
								"background": {
									"activeOnStart": true,
									"beginsPattern": `Compiling\\.\\.\\.`,
									"endsPattern": `Compiled successfully\\.`
								}
							}
						};

						file.tasks.push(task);
					}

					if (!file.tasks.find((task) => task.label === `capacitor-run-ios`)) {

						// Create iOS build task.
						const task = {
							"type": `shell`,
							"label": `capacitor-run-ios`,
							"command": `./ocwp-legacy`,
							"args": [
								`run`,
								`--port`,
								`8080`,
								`--shell=capacitor`,
								`--platform=ios`
							],
							"promptOnClose": true,
							"isBackground": true,
							"problemMatcher": {
								"owner": `webpack`,
								"severity": `error`,
								"fileLocation": `absolute`,
								"pattern": [
									{
										"regexp": `ERROR in (.*)`,
										"file": 1
									},
									{
										"regexp": `\\((\\d+),(\\d+)\\):(.*)`,
										"line": 1,
										"column": 2,
										"message": 3
									}
								],
								"background": {
									"activeOnStart": true,
									"beginsPattern": `Compiling\\.\\.\\.`,
									"endsPattern": `Compiled successfully\\.`
								}
							}
						};

						file.tasks.push(task);
					}
				});
			}

			// Install the Capacitor npm package dependencies.
			await this.runCommand(`npm i`, `./capacitor/`, `Installing Capacitor Dependencies ...`);

			// Install the Capacitor core platforms.
			// await this.runCommand(`npx cap add browser`, `./capacitor`, `Adding Browser platform ...}`);
			await this.runCommand(`npx cap add android`, `./capacitor`, `Adding Android platform to Capacitor ...`);
			await this.runCommand(`npx cap add ios`, `./capacitor`, `Adding iOS platform to Capacitor ...`);

			// Install the Capacitor core plugins.
			await this.runCommand(`npm install @capacitor/device@1.1.2 -E`, `./capacitor`, `Adding core plugin: device ...`);


			this.logInfoToShell(`Adding additional plugin(s): ${this.answers.plugins.join(`, `)}`);

			// Install the Capacitor user selected plugins.
			if (this.answers.plugins.includes(`camera`)) {
				await this.runCommand(`npm install @capacitor/camera@1.2.0 -E`, `./capacitor`, `Adding optional plugin: camera ...`);
			}

			if (this.answers.plugins.includes(`inappbrowser`)) {
				await this.runCommand(`npm install cordova-plugin-inappbrowser@5.0.0 -E`, `./capacitor`, `Adding optional plugin: inappbrowser ...`);
			}

		} catch (error) {

			// Something went wrong, delete the capacitor directory to leave no trace.
			fse.removeSync(`${Utils.workingDir}/capacitor`);

			// Restore the existing capacitor backup directory.
			if (!isNewInstall) {
				await fse.renameSync(`./capacitor_backup`, `./capacitor`);
			}
		}

		// Remove the backup directory.
		if (!isNewInstall) {
			fse.removeSync(`${Utils.workingDir}/capacitor_backup`);
		}
	}

	/**
	 * Installs the Cordova shell within the working directory.
	 * 
	 * @returns {Promise<void>} Promise for the completed execution.
	 */
	async _initShellCordova() {

		this.logInfoToShell(`Attaching Cordova Shell ...`);

		// Ensure Cordova does not yet exist in the working directory.
		if (fse.existsSync(`${Utils.workingDir}/cordova`)) {

			this.logInfoToShell(`Cordova already exists in working directory, skipping install ...`);
			return;
		}

		// Copy the cordova project template files into the working directory.
		await fse.copy(Utils.platformPath(`./deploy/shell/cordova`), `./cordova`);

		// Restore the gitignore file name. Note: the _ is needed in the source project so that the template files can be checked in.
		fs.renameSync(`./cordova/_gitignore`, `./cordova/.gitignore`);

		// Set the project name in the package.json file.
		await this.editJsonFile(`./cordova/package.json`, (file) => {

			file.name = this.answers.mobileID;
			file.displayName = this.answers.mobileName;
		});

		// Set the app ID & name in the cordova.config.json files.
		const envs = [``, `.dev`, `.int`, `.qa`, `.prod`];

		for (const env of envs) {

			await this.replaceTextInFile(`./cordova/config${env}.xml`, `app-id`, this.answers.mobileID); // eslint-disable-line no-await-in-loop
			await this.replaceTextInFile(`./cordova/config${env}.xml`, `app-name`, this.answers.mobileName); // eslint-disable-line no-await-in-loop
		}

		// Set the app name in the cordova project index.html file.
		await this.replaceTextInFile(`./cordova/www/index.html`, `app-name`, this.answers.mobileName);

		// Setup VSCode launch shortcuts in the launch.json file.
		await this.editJsonFile(`./.vscode/launch.json`, (file) => {

			// Create Android device launch configuration.
			file.configurations.push({
				type: `chrome`,
				request: `launch`,
				name: `Cordova: Run Android - Device`,
				url: `http://localhost:8080`,
				webRoot: `$\{workspaceFolder}/`,
				preLaunchTask: `cordova-run-android-device`,
				sourceMaps: true,
				trace: true
			});

			// Create Android emulator launch configuration.
			file.configurations.push({
				type: `chrome`,
				request: `launch`,
				name: `Cordova: Run Android - Emulator`,
				url: `http://localhost:8080`,
				webRoot: `$\{workspaceFolder}/`,
				preLaunchTask: `cordova-run-android-emulator`,
				sourceMaps: true,
				trace: true
			});

			// Create iOS device launch configuration.
			file.configurations.push({
				type: `chrome`,
				request: `launch`,
				name: `Cordova: Run iOS - Device`,
				url: `http://localhost:8080`,
				webRoot: `$\{workspaceFolder}/`,
				preLaunchTask: `cordova-run-ios-device`,
				sourceMaps: true,
				trace: true
			});

			// Create iOS emulator launch configuration.
			file.configurations.push({
				type: `chrome`,
				request: `launch`,
				name: `Cordova: Run iOS - Emulator`,
				url: `http://localhost:8080`,
				webRoot: `$\{workspaceFolder}/`,
				preLaunchTask: `cordova-run-ios-emulator`,
				sourceMaps: true,
				trace: true
			});
		});

		// Setup VSCode task shortcuts in the tasks.json file.
		await this.editJsonFile(`./.vscode/tasks.json`, (file) => {

			// Update the web run task to target the browser platform.
			for (const task of file.tasks) {

				if (task.label === `run`) {

					task.args = [
						`run`,
						`--port`,
						`8080`,
						`--shell=pwa`,
						`--platform=browser`
					];
					break;
				}
			}

			// Create Android device run task.
			file.tasks.push({
				"type": `shell`,
				"label": `cordova-run-android-device`,
				"command": `./ocwp-legacy`,
				"args": [
					`run`,
					`--port`,
					`8080`,
					`--shell=cordova`,
					`--platform=android`,
					`--target=device`
				],
				"promptOnClose": true,
				"isBackground": true,
				"problemMatcher": {
					"owner": `webpack`,
					"severity": `error`,
					"fileLocation": `absolute`,
					"pattern": [
						{
							"regexp": `ERROR in (.*)`,
							"file": 1
						},
						{
							"regexp": `\\((\\d+),(\\d+)\\):(.*)`,
							"line": 1,
							"column": 2,
							"message": 3
						}
					],
					"background": {
						"activeOnStart": true,
						"beginsPattern": `Compiling\\.\\.\\.`,
						"endsPattern": `Compiled successfully\\.`
					}
				}
			});

			// Create Android emulator run task.
			file.tasks.push({
				"type": `shell`,
				"label": `cordova-run-android-emulator`,
				"command": `./ocwp-legacy`,
				"args": [
					`run`,
					`--port`,
					`8080`,
					`--shell=cordova`,
					`--platform=android`,
					`--target=emulator`
				],
				"promptOnClose": true,
				"isBackground": true,
				"problemMatcher": {
					"owner": `webpack`,
					"severity": `error`,
					"fileLocation": `absolute`,
					"pattern": [
						{
							"regexp": `ERROR in (.*)`,
							"file": 1
						},
						{
							"regexp": `\\((\\d+),(\\d+)\\):(.*)`,
							"line": 1,
							"column": 2,
							"message": 3
						}
					],
					"background": {
						"activeOnStart": true,
						"beginsPattern": `Compiling\\.\\.\\.`,
						"endsPattern": `Compiled successfully\\.`
					}
				}
			});

			// Create iOS device run task.
			file.tasks.push({
				"type": `shell`,
				"label": `cordova-run-ios-device`,
				"command": `./ocwp-legacy`,
				"args": [
					`run`,
					`--port`,
					`8080`,
					`--shell=cordova`,
					`--platform=ios`,
					`--target=device`
				],
				"promptOnClose": true,
				"isBackground": true,
				"problemMatcher": {
					"owner": `webpack`,
					"severity": `error`,
					"fileLocation": `absolute`,
					"pattern": [
						{
							"regexp": `ERROR in (.*)`,
							"file": 1
						},
						{
							"regexp": `\\((\\d+),(\\d+)\\):(.*)`,
							"line": 1,
							"column": 2,
							"message": 3
						}
					],
					"background": {
						"activeOnStart": true,
						"beginsPattern": `Compiling\\.\\.\\.`,
						"endsPattern": `Compiled successfully\\.`
					}
				}
			});

			// Create iOS emulator run task.
			file.tasks.push({
				"type": `shell`,
				"label": `cordova-run-ios-emulator`,
				"command": `./ocwp-legacy`,
				"args": [
					`run`,
					`--port`,
					`8080`,
					`--shell=cordova`,
					`--platform=ios`,
					`--target=emulator`
				],
				"promptOnClose": true,
				"isBackground": true,
				"problemMatcher": {
					"owner": `webpack`,
					"severity": `error`,
					"fileLocation": `absolute`,
					"pattern": [
						{
							"regexp": `ERROR in (.*)`,
							"file": 1
						},
						{
							"regexp": `\\((\\d+),(\\d+)\\):(.*)`,
							"line": 1,
							"column": 2,
							"message": 3
						}
					],
					"background": {
						"activeOnStart": true,
						"beginsPattern": `Compiling\\.\\.\\.`,
						"endsPattern": `Compiled successfully\\.`
					}
				}
			});
		});

		// Install the Cordova npm package dependencies.
		await this.runCommand(`npm install`, `./cordova`, `Installing Cordova Dependencies ...`);

		// Install the Cordova core platforms.
		await this.runCommand(`npx cordova platform add browser`, `./cordova`, `Adding Browser platform to Cordova ...`);
		await this.runCommand(`npx cordova platform add android`, `./cordova`, `Adding Android platform to Cordova ...`);
		await this.runCommand(`npx cordova platform add ios`, `./cordova`, `Adding iOS platform to Cordova ...`);

		// Install the Cordova core plugins.
		await this.runCommand(`npx cordova plugin add cordova-plugin-whitelist`, `./cordova`, `Adding core plugin: whitelist ...`);
		await this.runCommand(`npx cordova plugin add cordova-plugin-device`, `./cordova`, `Adding core plugin: device ...`);
		await this.runCommand(`npx cordova plugin add cordova-plugin-battery-status`, `./cordova`, `Adding core plugin: battery ...`);

		// Install the Cordova user selected plugins.
		if (this.answers.plugins.includes(`camera`)) {
			await this.runCommand(`npx cordova plugin add cordova-plugin-camera`, `./cordova`, `Adding optional plugin: camera ...`);
		}

		if (this.answers.plugins.includes(`inappbrowser`)) {
			await this.runCommand(`npx cordova plugin add cordova-plugin-inappbrowser`, `./cordova`, `Adding optional plugin: inappbrowser ...`);
		}
	}
}