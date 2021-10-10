/** 
 * SDF model linter
 * @author Ari Keränen
 */

const fs = require('fs');
const Ajv = require('ajv');
const path = require('path');

const AJV_OPTIONS = {
  "allErrors": true,
  "format": "full"
}

/* Regular expression for valid SDF file names */
const FILENAME_RE = '^sdf(object|thing|data)-[a-z0-9_.-]*\.sdf\.json$';
/* Regular expression for valid characters in SDF file */
const VALID_CHARS_RE = '[^\x00-\x7F]';

const DEF_SCHEMA_FILE = 'sdf-validation.jso.json';

exports.sdfLint = sdfLint;

if (require.main === module) { /* run as stand-alone? */
  let res = {
    errorCount: 0,
    errors: {}
  };

  if (process.argv.length > 2) { /* file as command line parameter */
    let schema;
    let sdfFile;
    let inFile = process.argv[2];
    let appDir = path.dirname(require.main.filename);
    let options = {};
    let schemaFile;

    process.argv.slice(3).forEach( (option) => {
      let name = option.substring(0, option.indexOf("="));
      let value = option.substring(option.indexOf("=") + 1);
      options[name] = value;
    });

    schemaFile = options.schema ?
      options.schema : (appDir + "/" + DEF_SCHEMA_FILE);

    fileNameCheck(inFile, res);

    try {
      sdfFile = fs.readFileSync(inFile,
        { encoding: 'utf-8' });
      schema = JSON.parse(fs.readFileSync(schemaFile,
        { encoding: 'utf-8' }));
      } catch (err) {
        res.errorCount++;
        res.errors.parse = err.message;
      }

    sdfLint(sdfFile, schema, res, options);
    console.dir(res, {depth: null});

    process.exit(res.errorCount);
  }
  else {
    console.log(`
    Usage: node sdflint sdffile.json [options as key=value pairs]

    Options:
     schema   The filename of the JSON schema to use
     license  The license string to accept as valid
    `
  );
  }
}


function fileNameCheck(fileName, res) {
  let fileNameRe = new RegExp(FILENAME_RE);
  let baseFileName = path.parse(fileName).base;

  if (! baseFileName.match(fileNameRe)) {
    res.errorCount++;
    res.errors.fileName = "File name " + baseFileName +
      " does not match " + FILENAME_RE;
  }
}


function validCharsCheck(sdfFile, res) {
  let sdfStr = JSON.stringify(sdfFile);
  let invalidLoc = sdfStr.search(new RegExp(VALID_CHARS_RE));
  if (invalidLoc != -1) {
    res.errorCount++;
    res.errors.validChars = "File contains unexpected character:" +
      sdfStr.charAt(invalidLoc);
  }
}


function licenseCheck(sdf, license, res) {
  if (! sdf.info || ! sdf.info.license) {
    res.errorCount++;
    res.errors.license = "No license defined in model"
  } else if (sdf.info.license != license) {
    res.errorCount++;
    res.errors.license = "Model has license '" + sdf.info.license +
     "' expected '" + license + "'";
  }
}


function sdfLint(sdfFile, schema, res, options) {
  let ajv = new Ajv(AJV_OPTIONS);
  let sdf;

  if (! res) {
    res = {
      errorCount: 0,
      errors: {}
    };
  }
  if (! options) {
    options = {};
  }

  try {
    sdf = JSON.parse(sdfFile);
  } catch  (err) {
    res.errorCount++;
    res.errors.parse = err.message;
  }
  validCharsCheck(sdfFile, res);

  if (! schema) {
    schema = JSON.parse(fs.readFileSync(
      DEF_SCHEMA_FILE, { encoding: 'utf-8' }));
  }

  let validate = ajv.compile(schema);

  if (!validate(sdf)) {
    res.errors.schema = validate.errors;
    res.errorCount++;
  }

  if (options.license) {
    licenseCheck(sdf, options.license, res);
  }

  return res;
}
