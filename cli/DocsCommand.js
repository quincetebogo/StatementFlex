import { CommandBase } from './CommandBase.js';
import { Utils } from './Utils.js';
import path from 'path';

export class DocsCommand extends CommandBase {

	constructor() {
		super(`docs`);
	}

	async run() {

		this.logInfoToShell(`Opening documentation ...`);

		await this.runCommand(`npm run docs`, `.`, `Generating docs ...`);

		await this.executeChildProcessCommand(1, path.resolve(Utils.platformDir, `./docs/index.html`));
	}
}