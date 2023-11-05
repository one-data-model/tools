# Test cases for SDF schema and linter

This folder contains a simple test program and test cases for testing if the SDF linter program and JSO schema catch various errors in SDF documents.

The program `test-schema.js` takes at minimum two parameters: a (valid) SDF document used as basis for testing and a schema file used to validate the document. 

For example: `node test-schema.js sdfthing-test.sdf.json ../sdf-validation.jso.json`

The `sdfobject-test.sdf.json` is an SDF document that exercises many of the features of SDF Object definition and is a good start for the SDF document used with testing.

For schema file the default validation schema of the linter can be used with `../sdf-validation.jso.json`.

In this mode the program changes one by one each quality in the SDF document first to a (semi random) integer value and then to a string value. If the linter does not detect this as an error, information about this is printed to console. For example `Missed change: info/title -> "FOOBAR"` indicates a change in the info block's title quality (that is in fact a change that is OK to not flag as error since title can be any string).

If further parameters are given to the program, those are assumed to be JSON merge-patch documents that alter the base SDF document. After applying each merge-patch, validation is run and if no error is detected, information about this is printed (if error is detected, nothing is printed unless verbose mode is used). Set of example merge-patch documents are available in the `schema-errors` folder. This mode also needs to have the "merge-patch" [command line program](https://rubygems.org/gems/merge-patch/versions/0.1.0) installed ("gem install merge-patch").