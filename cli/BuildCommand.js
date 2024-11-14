import { CommandBase } from './CommandBase.js';
import { Utils } from './Utils.js';
import fs from 'fs';
import fse from 'fs-extra';
import https from 'https';
import path from 'path';

/**
 * Facilitates creation of application image within SDLC environment.
 */
export class BuildCommand extends CommandBase {

	// -----------
	// CONSTRUCTOR
	// -----------

	/**
	 * Initialise the command.
	 */
	constructor() {

		super(`build`);
	}

	// ----------------
	// PUBLIC FUNCTIONS
	// ----------------

	/**
	 * Executes commands to publish docker image into the DTR.
	 * @returns {Promise<void>} Promise for the completed execution.
	 */
	async run() {

		// Ensure that there are no unmet conditions that prevent the command from running.
		if (!super.canRun) {
			return;
		}

		// ...
		if (this.answers && this.answers.output) {
			await this.buildFrameworkArtifacts(this.answers.output);
			return;
		}

		// Default the shell to PWA if not specified.
		if (!this.answers.shell) {
			this.answers.shell = `pwa`;
		}

		// Build the shell environment and stop processing any further.
		if (this.answers.shell === `capacitor`) {
			return this._buildCapacitor();
		} else if (this.answers.shell === `cordova`) {
			return this._buildCordova();
		}

		await this.buildFrameworkArtifacts(`./dist`);
	}

	// --------------
	// SHELL BUILDERS
	// --------------

	/**
	 * Builds a Capacitor shell project for the app.
	 * 
	 * @private
	 * 
	 * @returns {void}
	 */
	async _buildCapacitor() {

		// Determine the mobile platform the user wants to build for.
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

		// Prompt the user to select a mobile platform from the list.
		if (!this.answers.env) {

			this.answers.env = await this.promptList({
				name: `env`,
				message: `Target region:`,
				choices: [`dev`, `int`, `qa`, `prod`]
			});
		}

		// Determine the hosted app server URL.
		/* if (!this.answers.serverURL) {

			this.answers.serverURL = await this.promptText({
				name: `serverURL`,
				message: `App server URL:`
			});
		}*/

		// Build the web content bundle.
		this.logInfoToShell(`Building web app bundle ...`);

		await this.executeChildProcessCommand(
			1,
			`node`,
			Utils.platformPath(`./node_modules/webpack/bin/webpack.js`),
			`--config="${Utils.platformPath(`./runtime/webpack.config.js`)}"`,
			`--stats=minimal`,
			`--env mode="production"`,
			`--env env="${this.answers.env}"`, // DEV|INT|QA|PROD
			`--env shell="${this.answers.shell}"`, // pwa|cordova|capacitor
			`--env platform="${this.answers.platform}"`, // browser|android|ios|electron
			// `--env serverURL="${this.answers.serverURL}""`,
			`--output-path="${path.join(process.cwd(), `./capacitor/www`)}"`
		);

		// Create a capacitor runtime config for the build.
		await fse.copy(`./capacitor/capacitor.config.${this.answers.env}.json`, `./capacitor/capacitor.config.json`);

		// Copy the web content into the capacitor project for the mobile platform.
		await this.runCommand(`npx cap sync ${this.answers.platform}`, `./capacitor`, `Sync web app bundle to Capacitor ${this.answers.platform} project ...`);

		// Launch the platform IDE, e.g. Android Studio, XCode, etc.
		this.runCommand(`npx cap open ${this.answers.platform}`, `./capacitor`, `Launching capacitor app in ${this.answers.platform} IDE ...`);
	}

	/**
	 * Builds a Cordova shell project for the app.
	 * 
	 * @private
	 * 
	 * @returns {void}
	 */
	async _buildCordova() {

		// NOT IMPLEMENTED
	}

	// -------
	// HELPERS
	// -------

	async buildFrameworkArtifacts(folder) {

		this.logInfoToShell(`Building ${Utils.appPlatformJson.framework} artifacts ...`);

		if (Utils.appPlatformJson.framework === `web-components` || Utils.appPlatformJson.framework === `WebComponents`) {

			await this.executeChildProcessCommand(
				11,
				`node`,
				Utils.platformPath(`./node_modules/webpack/bin/webpack.js`),
				`--config`,
				Utils.platformPath(`./runtime/webpack.config.js`),
				`--env mode="production"`,
				`--env presets="serviceworker"`,
				`--output-path="${folder}"`
			);
		}

		this.logInfoToShell(`Build done ...`);
	}
}