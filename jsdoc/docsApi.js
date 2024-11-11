const jsdoc = require(`jsdoc-api`);
const fs = require(`fs`);
const path = require(`path`);

/**
 * Gets all the component files
 *
 * @param {String} dirPath - The directory path.
 * @param {Array} arrayOfFiles - The array of files.
 * @returns {Array} - The component files in an array.
 */
function getAllFiles(dirPath, arrayOfFiles) {
	const files = fs.readdirSync(dirPath);

	arrayOfFiles = arrayOfFiles || [];

	files.forEach(file => {
		if (fs.statSync(`${dirPath}/${file}`).isDirectory()) {
			arrayOfFiles = getAllFiles(`${dirPath}/${file}`, arrayOfFiles);
		} else {
			arrayOfFiles.push(path.join(dirPath, `/`, file));
		}
	});

	return arrayOfFiles;
}

const files = getAllFiles(path.resolve(`./packages/ocwp-components/src`));
const filtered = files.filter(x => x.endsWith(`.js`));


/**
 * Extracts the required information from the file based on specific criteria
 *
 * @param {Object} file - The file to extract from.
 * @returns {Object} - Filtered object based on criteria
 */
async function extractDoc(file) {
	let doc = await jsdoc.explain({ files: file });
	doc = doc.filter(x => x.comment && !x.hideconstructor && (x.kind === `event` || x.kind === `class` || x.name === `properties`));
	return doc;
}

Promise.all(filtered.map(extractDoc)).then(output => {
	const json = JSON.stringify(output.flat());
	fs.writeFileSync(path.join(__dirname, `../docs`, `component-docs.json`), json);
});