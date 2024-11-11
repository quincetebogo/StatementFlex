import { CommandBase } from './CommandBase.js';
import { Utils } from './Utils.js';
import fs from 'fs';
import fse from 'fs-extra';

/**
 * Facilitates restoring and applications dependencies.
 */
export class RestoreCommand extends CommandBase {

	constructor() {
		super(`restore`);
	}

	/**
	 * Determines if there's reasons why this command cannot execute.
	 */
	get canRun() {

		const files = fse.readdirSync(Utils.workingDir, { encoding: `utf8` });

		// Check for empty folder or missing platform.json.
		if (!files || files.length === 0 || files.findIndex(file => file.includes(`platform.json`)) === -1) {
			this.logWarnToShell(`'platform.json' not found, unable to restore ...`);

			return false;
		}

		return true;
	}

	async run() {

		if (!this.canRun) {
			return;
		}

		this.logInfoToShell(`Restore application ...`);

		await this.runCommand(`npm run restore`, `.`, `Restoring packages ...`);

		await this._restoreBasics();

		await this.runCommand(`npm run docs`, `.`, `Generating docs ...`);

		this.logInfoToShell(`Application restored successfully.`);
	}

	async _restoreBasics() {

		// Attempt to update the "src/.gitignore", "jsconfig.json", "tsconfig.json" and "src/types.d.ts" files.
		await this.setupIntellisense(true);

		// Attempt to update the ".vscode/extensions.json" file.
		await this.updateExtensions();

		// Attempt to update ".vscode/settings.json" file.
		await this.setupLinting(true);

		// Attempt to update ".vscode/launch.json" file.
		await this.setupLaunch();

		// Attempt to restore local project dependencies.
		await this.restoreProjectDevDependencies();
	}

	async restoreProjectDevDependencies() {

		// Restore "package.json" dependencies.
		const packageJsonFilePath = Utils.projectPath(`./package.json`);

		if (!fs.existsSync(packageJsonFilePath)) {
			return;
		}

		// Restore Capacitor "package.json" dependencies.
		const capacitorPackageJsonFilePath = Utils.projectPath(`./capacitor/package.json`);

		if (!fs.existsSync(capacitorPackageJsonFilePath)) {
			return;
		}

		const capacitorPackageJsonFile = await this.readJsonFile(capacitorPackageJsonFilePath);
		if (capacitorPackageJsonFile.dependencies || capacitorPackageJsonFile.devDependencies) {

			await this.runCommand(`npm i`, `./capacitor`, `Restoring packages ...`);
		}

		// Place dummy "index.html" down as per init.
		const capacitorIndexHtmlFilePath = Utils.projectPath(`./capacitor/www/index.html`);

		if (fs.existsSync(capacitorIndexHtmlFilePath)) {
			return;
		}

		const capacitorWWWDirPath = Utils.projectPath(`./capacitor/www`);
		if (!fs.existsSync(capacitorWWWDirPath)) {
			fs.mkdirSync(capacitorWWWDirPath);
		}

		fs.copyFileSync(Utils.platformPath(`deploy/shell/capacitor/www/index.html`), capacitorIndexHtmlFilePath);
	}
}