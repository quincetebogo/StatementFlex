import { AttachCommand } from './AttachCommand.js';
import { CommandBase } from './CommandBase.js';
import { Utils } from './Utils.js';
import chalk from 'chalk';
import fs from 'fs';
import fse from 'fs-extra';

/**
 * Facilitates creation of a new project based on user input.
 */
export class InitCommand extends CommandBase {

	// -----------
	// CONSTRUCTOR
	// -----------

	/**
	 * Initialise the command.
	 */
	constructor() {

		super(`init`);
	}

	// ----------------
	// PUBLIC FUNCTIONS
	// ----------------

	/**
	 * Determine if there's reasons why this command cannot execute.
	 */
	get canInit() {

		return true;
	}

	/**
	 * Executes commands to publish image into the DTR.
	 * 
	 * @returns {void}
	 */
	async run() {

		// Ensure that the init command may be run in the working directory, e.g. the folder is empty.
		if (!this.canInit) {
			return;
		}

		if (fse.existsSync(`src`)) {
			fse.removeSync(`src`);
		}

		// Ask the user to specify their app name.
		if (!this.answers.name) {

			this.answers.name = await this.promptText({
				message: `Project name:`,
				initial: this.getDefaultProjectName(),
				validate: (value) => this.validateProjectName(value)
			});
		}

		// Ask the user in which type of app they are building, e.g. App, Widget, etc.
		if (!this.answers.app) {

			this.answers.app = await this.promptList({
				message: `Project type:`,
				choices: [
					{
						name: `standalone`,
						hint: `A standalone web application, e.g. PWA, hybrid mobile, etc.`
					},
					{
						name: `widget`,
						hint: `A reuseable mini-app that can be run within other platform web apps.`
					}
				]
			});
		}
		this.answers.framework = `web-components`;

		// Prompt questions specific to widgets.
		if (this.answers.app === `widget`) {

			if (!this.answers.type) {
				this.answers.type = `omni-channel`;
			}
		}

		// Prompt questions specific to standalone applications.
		if (this.answers.app === `standalone`) {

			// Ask the user which type of app they are building they want to target, e.g. desktop, kiosk, mobile, etc.
			if (!this.answers.type) {

				this.answers.type = await this.promptList({
					message: `Rendering mode:`,
					initial: `omni-channel`,
					choices: [
						{
							message: `omni-channel`,
							name: `omni-channel`,
							hint: `Recommended: Code views for all devices in a single file using separate render functions.`
						},
						{
							message: `desktop-only`,
							name: `desktop`,
							hint: `Select if your project will run in desktop browsers only.`
						},
						{
							message: `kiosk-only`,
							name: `kiosk`,
							hint: `Select if your project will run on a kiosk device only.`
						},
						{
							message: `mobile-only`,
							name: `mobile`,
							hint: `Select if your project will run on mobile devices only.`
						}
					]
				});
			}

			// Prompt the mobile specific configuration questions.
			if (this.answers.type === `omni-channel` || this.answers.type === `mobile-only`) {

				// Ask the user which shell type they want to target, e.g. pwa, capacitor, cordova, electron, etc.
				if (!this.answers.shell) {

					this.answers.shell = await this.promptList({
						message: `Mobile shell (optional):`,
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
				if (this.answers.shell.includes(`capacitor`) || this.answers.shell.includes(`cordova`)) {

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
							initial: this.getDefaultProjectName(),
							validate: (value) => this.validateMobileAppName(value)
						});
					}

					// Ask the user to specify their unique mobile app ID.
					if (!this.answers.mobileID) {

						this.answers.mobileID = await this.promptText({
							message: `Mobile App ID, e.g. com.company.MyApp:`,
							hint: `The unique mobile app ID in reverse domain name format.`,
							initial: `za.co.capitecbank.${this.answers.mobileName.split(` `).join(``)}`,
							validate: (value) => this.validateMobileAppID(value)
						});
					}
				}
			}
		}

		// Ask the user which demo template they want to start with.
		if (!this.answers.template) {

			const templateChoices = [];

			// Suggest app templates based on the user's choices.
			if (this.answers.app === `standalone`) {

				templateChoices.push({
					name: `basic-app`,
					hint: `A simple app skeleton.`
				});

				if (this.answers.type === `omni-channel` || this.answers.type === `mobile-only`) {
					templateChoices.push({
						name: `mobile-starter`,
						hint: `A simple example app demonstrating mobile capabilities.`
					});
				}

				templateChoices.push({
					name: `adaptive-app-demo`,
					hint: `App using adaptive rendering modes for mobile, kiosk & web.`
				});
			}

			// Suggest widget templates based on the user's choices.
			if (this.answers.app === `widget`) {
				templateChoices.push({
					name: `basic-widget`,
					hint: `A simple widget skeleton.`
				});
			}

			this.answers.template = await this.promptList({
				message: `Select starter template:`,
				choices: templateChoices
			});
		}

		// Generate the basic project structure in the working directory.
		await this._initBasics();

		// Generate the shell specific files in the working directory.
		if (this.answers.shell) {

			const attachCommand = new AttachCommand();

			await attachCommand.execute(this.answers, this.isDebug, true);
		}

		// Setup the ".eslintrc" configuration.
		await this.setupLinting();

		// Setup the "launch.json" configuration.
		await this.setupLaunch();

		// Attempt to update the "src/.gitignore", "jsconfig.json", "tsconfig.json" and "src/types.d.ts" files.
		await this.setupIntellisense();

		// All done, inform the user what to do to start coding.
		this.logInfoToShell(`Project initialized, run ${chalk.keyword(`orange`)(`code .`)} to start coding.`);
	}

	// -------------
	// PROCESS STEPS
	// -------------

	/**
	 * Drop some basics inside the working directory.
	 * 
	 * @returns {Promise<void>} Promise for the completed execution.
	 */
	async _initBasics() {

		// Copy generic configuration files..
		await fse.copy(Utils.platformPath(`./deploy/framework/${this.answers.framework}/empty-project/src`), `./src`);


		// Install the starter template files for the target framework.
		await fse.copy(Utils.platformPath(`./deploy/framework/${this.answers.framework}/templates/${this.answers.template}`), `./src`);

		// Set the project name in manifest.json file.
		await this.editJsonFile(`./src/manifest.json`, (manifestJson) => {

			manifestJson.short_name = this.answers.name; // eslint-disable-line camelcase
			manifestJson.name = this.answers.name;
		});

		// Update "platform.json" file with user's answers.
		await this.editJsonFile(`./platform.json`, (platformJson) => {

			platformJson.framework = this.answers.framework;
			platformJson.version = Utils.cliVersion;
			platformJson.type = this.answers.type;
			platformJson.app = this.answers.app;
			platformJson.application.id = this.answers.mobileID;
			platformJson.application.name = this.answers.name;
			platformJson.application.title = this.answers.mobileName || this.answers.name;

			// Platform CLI legacy support.
			if (fs.existsSync(`./ProjectManifest.json`)) {

				// This must be managed from the ProjectManifest instead
				delete platformJson.version;
				delete platformJson.application.version;
				delete platformJson.application.name;
			}
		});

		// Platform CLI specific logic.
		if (fs.existsSync(`./ProjectManifest.json`)) {
			await this.editJsonFile(`./ProjectManifest.json`, (projectManifest) => {

				projectManifest.name = this.answers.name;
				// projectManifest.version = `0.0.1`; 
				// projectManifest.contractVersion = `1`;
				// projectManifest.resourceSize = `small`;
				// projectManifest.redundancySize = `small`;
				projectManifest.port = this.answers.port;
				projectManifest.secrets = [];
				projectManifest.environmentVariables = [];
				projectManifest.serviceType = `Hosting`;
			});

		}
	}
}