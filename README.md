# SDF tools

This repository contains SDF tools hosted by OneDM. List of other SDF tools can be found in the [wiki](https://github.com/one-data-model/tools/wiki/Related-tools).

## SDF linter

The sdflint.js program checks the validity of the given SDF file.

Usage: `node sdflint sdffile.sdf.json [options as key=value pairs]`

Options:
*  `schema` The filename of the JSON schema to use (default: [sdflint/sdf-validation.jso.json](sdflint/sdf-validation.jso.json))
*  `license` The license string to accept as valid (default: don't check)
    

Example: `node sdflint sdfobject-myfirstobject.sdf.json license=BSD-3-Clause`

The output is a JSON object with two fields:
* errorCount: number of checks that failed (or 0 if all checks passed)
* errors: object with field for each type of error encountered
  * fileName: errors on input filename
  * parse: errors parsing the input file as JSON
  * validChars: errors with invalid characters in the model file
  * license: errors detected in license check
  * schema: array of values with more details on schema errors

For schema errors, the error messages are described in more detail here: https://github.com/epoberezkin/ajv#error-objects
