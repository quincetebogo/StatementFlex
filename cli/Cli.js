import { AttachCommand } from './AttachCommand.js';
import { BuildCommand } from './BuildCommand.js';
import { DocsCommand } from './DocsCommand.js';
import { GenerateCommand } from './GenerateCommand.js';
import { InitCommand } from './InitCommand.js';
import { PluginCommand } from './PluginCommand.js';
import { RestoreCommand } from './RestoreCommand.js';
import { RunCommand } from './RunCommand.js';
import { Utils } from './Utils.js';
import program from 'commander';

/**
 * Responsible for setting up CLI configuration and handling user input.
 */
export class Cli {


	/**
	 * Splits a string on spaces used for a list input option
	 * @param {String} value - SPACE delimitated String of options
	 * @returns {String[]} - List of options
	 */
	list(value) {
		return value.split(`,`);
	}

	/**
	 * Responsible for setting up CLI commands + options and handling user input.
	 * @returns {void}
	 */
	start() {

		// Commander.js DOCS - https://github.com/tj/commander.js

		// console.log(`Utils.platformDir: ${Utils.platformDir}`);
		// console.log(`process.cwd(): ${process.cwd()}`);

		// Set the CLI version from installed package.
		program.version(Utils.cliVersion);

		// Set command usage string
		program.usage(`./ocwp-legacy [command] [options]`);

		// init
		program
			.command(`init`)
			.alias(`i`)
			.description(`Initialises a new app`)
			.option(`-n, --servicename  <name>`, `Project Name, e.g. MyApp, my-app`)
			.option(`-a, --app <app>`, `Type of app (standalone|widget)`, /^(standalone|widget)$/i)
			.option(`-f, --framework <framework>`, `Project framework (web-components)`, /^(web-components)$/i)
			.option(`-t, --type <type>`, `Project type (omni-channel|desktop|kiosk|mobile)`, /^(omni-channel|desktop|kiosk|mobile)$/i)
			.option(`-b, --template <template>`, `Starter template (basic-app|basic-widget|mobile-starter)`, /^(basic-app|basic-widget|mobile-starter)$/i)
			.option(`-ms, --shell <shell>`, `Mobile shell type (pwa|capacitor|cordova)`, /^(pwa|capacitor|cordova)$/i)
			.option(`-mp, --plugins <plugin>`, `Mobile plugin type (battery|camera|inappbrowser)`)
			.option(`-mi, --mobileID <id>`, `Mobile App ID, e.g. com.company.MyApp (mobile only)`)
			.option(`-mn, --mobileName <name>`, `Mobile App Name, e.g. My App (mobile only)`)
			.option(`-p, --port <port>`, `Default port on which to run`, null, 8080)

			.option(`-v, --debug`, `Debug mode`)
			.action((options) => {

				// Run the command.
				const command = new InitCommand();

				command.execute({
					name: options.servicename,
					port: options.port,
					app: options.app,
					framework: options.framework,
					type: options.type,
					template: options.template,
					shell: options.shell ? options.shell.split(`,`) : null,
					plugins: options.plugins ? options.plugins.split(`,`) : null,
					mobileID: options.mobileID,
					mobileName: options.mobileName
				}, options.debug);
			});

		// run
		program
			.command(`run`)
			.alias(`r`)
			.description(`Runs the app`)
			.option(`-p, --port [port]`, `Port to run the project on`)
			.option(`-ms, --shell <shell>`, `Mobile shell to run in (pwa|capacitor|cordova)`, /^(pwa|capacitor|cordova)$/i)
			.option(`-mp, --platform <platform>`, `Mobile app platform to run on (browser|android|ios) (mobile only)`, /^(browser|android|ios)$/i)
			.option(`-mt, --target <target>`, `Mobile device target to deploy on (web|device|emulator|{target_name}) (mobile only)`)

			.option(`-v, --debug`, `Debug mode`)
			.action((options) => {

				// Run the command.
				const command = new RunCommand();

				command.execute({
					port: options.port || `default`,
					shell: options.shell,
					platform: options.platform,
					target: options.target

				}, options.debug);
			});

		// attach
		program
			.command(`attach`)
			.alias(`a`)
			.description(`Attaches a platform feature to the existing platform project`)
			.option(`-ms, --shell <shell>`, `Mobile shell type (pwa|capacitor|cordova)`, /^(pwa|capacitor|cordova)$/i)
			.option(`-mp, --plugins <plugins>`, `Mobile plugin type (battery|camera|inappbrowser)`)
			.option(`-mi, --mobileID <id>`, `Mobile App ID, e.g. com.company.MyApp (mobile only)`)
			.option(`-mn, --mobileName <name>`, `Mobile App Name, e.g. My App (mobile only)`)
			.option(`-d, --projectDir <dir>`, `Project root directory`)

			.option(`-v, --debug`, `Debug mode`)
			.action((options) => {

				// Run the command.
				const command = new AttachCommand();

				command.execute({
					shell: options.shell ? options.shell.split(`,`) : null,
					plugins: options.plugins ? options.plugins.split(`,`) : null,
					mobileID: options.mobileID,
					mobileName: options.mobileName
				}, options.debug);
			});

		// mobile
		program
			.command(`plugin`)
			.alias(`p`)
			.description(`Manages plugins for an existing mobile platform project`)
			.option(`-ms, --shell <shell>`, `Mobile shell to run in (pwa|capacitor|cordova)`, /^(pwa|capacitor|cordova)$/i)
			.option(`-ap, --add-plugin <addPlugin>`, `Plugin to add to the Project. Comma separated`, this.list, [])
			.option(`-rp, --remove-plugin <removePlugin>`, `Plugin to add to the Project. Comma separated`, this.list, [])

			.option(`-v, --debug`, `Debug mode`)
			.action((options) => {

				// Run the command.
				const command = new PluginCommand();

				command.execute({
					addPlugin: options.addPlugin,
					removePlugin: options.removePlugin
				}, options.debug);
			});


		// build
		program
			.command(`build`)
			.alias(`b`)
			.description(`Builds app static content`)
			.option(`-o, --output <dir>`, `Output artifacts only to the specified dir`)
			.option(`-ms, --shell <shell>`, `Mobile shell to run in (pwa|capacitor|cordova)`, /^(pwa|capacitor|cordova)$/i)
			.option(`-mp, --platform <platform>`, `Mobile app platform to run on (browser|android|ios) (mobile only)`, /^(browser|android|ios)$/i)
			.option(`-mu, --serverURL <url>`, `Content server URL`)
			.option(`-v, --debug`, `Debug mode`)
			.action((options) => {

				// Run the command.
				const command = new BuildCommand();

				command.execute({
					shell: options.shell,
					platform: options.platform,
					serverURL: options.serverURL,
					output: options.output && options.output !== true ? options.output : undefined
				}, options.debug);
			});


		// restore
		program
			.command(`restore`)
			.alias(`rs`)
			.description(`Restores dependencies`)

			.option(`-v, --debug`, `Debug mode`)
			.action((options) => {

				// Run the command.
				const command = new RestoreCommand();

				command.execute(undefined, options.debug);
			});

		// docs
		program
			.command(`docs`)
			.alias(`do`)
			.description(`Opens the platform technical documentation`)

			.option(`-v, --debug`, `Debug mode`)
			.action((options) => {

				// Run the command.
				const command = new DocsCommand();

				command.execute(undefined, options.debug);
			});

		// generate
		program
			.command(`generate`)
			.alias(`g`)
			.description(`Generates a new Element`)
			.option(`-n, --name <name>`, `Element name`)
			.option(`-t, --type <type>`, `Element type`)

			.option(`-v, --debug`, `Debug mode`)
			.action((options) => {

				// Run the command.
				const command = new GenerateCommand();

				command.execute({
					name: options.name,
					type: options.type
				}, options.debug);
			});

		// Error on unknown commands.
		program.on(`command:*`, () => {
			console.error(`Invalid command: %s\nSee --help for a list of available commands.`, program.args.join(` `));
		});

		// Process args for CLI command received, otherwise show help.
		if (process.argv && process.argv.length > 2) {
			program.parse(process.argv);
		} else {
			program.help();
		}
	}
}