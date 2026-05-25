const fs = require('fs');
const sdfLint = require('../sdflint');
const { exec } = require('child_process');

/* Requires merge-patch command installed */
const MERGE_PATCH_CMD = "merge-patch";
const VERBOSE = false;

let modelFile = process.argv[2];
let schemaFile = process.argv[3];
let testCases = process.argv.slice(4);

let schema;

function fail(reason) {
  console.error(reason);
  process.exit(1);
}

try {
  schema = JSON.parse(fs.readFileSync(schemaFile,
    { encoding: 'utf-8' }));
} catch (err) {
  fail("Can't read schema file: " + err.message);
}

if (testCases.length > 0) {
  runTestCases(testCases);
} else {
  let sdfData;
  try {
    sdfData = fs.readFileSync(modelFile,
      { encoding: 'utf-8' });
  } catch (err) {
    fail("Can't read SDF model file: " + err.message);
  }

  let lintRes = sdfLint.sdfLint(sdfData, schema);
  if (lintRes.errorCount > 1) {
    console.dir(sdfData, { "depth": null });
    fail("SDF model has errors");
  }

  let origSDF = JSON.parse(sdfData);
  changeAndValidate(origSDF, "FOOBAR", "", origSDF);
  changeAndValidate(origSDF, 42, "", origSDF);

}

function runTestCases(testCases) {
  testCases.forEach(patchFile => {
    let patchCmd = MERGE_PATCH_CMD + " " + modelFile + " " + patchFile;
    let caseName = patchFile.substring(0, patchFile.lastIndexOf('.'));

    exec(patchCmd, (error, stdout, stderr) => {
      if (error) {
        fail(error.message);
      }
      if (stderr) {
        fail(stderr);
      }

      let lintResult = sdfLint.sdfLint(stdout, schema);
      if (lintResult.errorCount < 1) {
        console.error("Didn't detect error case " + caseName);
      } else if (VERBOSE) {
          let schemaErr = lintResult.errors.schema[0];
          console.log("Case " + caseName);
          console.log("  Path: " + schemaErr.dataPath);
          console.log("  Error: " + schemaErr.message);
      }
    });

  });

}


function validate(sdf, schema, changedElement, newValue){
  let lintRes = sdfLint.sdfLint(sdf, schema, undefined, { "isJSON": true });
  if (lintRes.errorCount == 0) {
    console.log("Missed change: " + changedElement + " -> " + 
      JSON.stringify(newValue));
    } else if (VERBOSE) {
    console.log("Caught change: " + changedElement + " -> " + 
      JSON.stringify(newValue));
    console.log(lintRes.errors.schema);
  }
}


/* one by one change qualities in the SDF file and validate result */
function changeAndValidate(json, newVal, path, origSDF) {
  const keys = Object.keys(json);
  if (VERBOSE) {
    console.log("At " + path);
  }
  keys.forEach (key => {
    if (typeof json[key] === 'object') {
      return changeAndValidate(json[key], newVal, path + key + '/', origSDF);
    } else if (Array.isArray(json)) {
      if (json.length == 0) {
        key = 0;
      }
      let oldVal = json[key];
      json[key] = newVal;
      validate(origSDF, schema, path + key, newVal);
      json[key] = oldVal;
    }
    else {
      let oldVal = json[key];
      json[key] = newVal;
      validate(origSDF, schema, path + key, newVal);
      json[key] = oldVal;
    }  
  });
}
