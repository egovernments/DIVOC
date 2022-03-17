# Introduction
ETCD is a distributed key-value store to store data that needs to be accessed by a distributed system.
`etcdctl` is a command line tool for interacting with the etcd server.
To install `etcdctl`, run `sudo apt install etcd-client` on Debian based OSs or follow the instructions specific to your OS.

# Use of ETCD in DIVOC Certificate modules
1. `certificate-signer`: ICD and EU configurations
2. `certificate-api`: Certificate HTML templates and helper functions

# Usage

- Make sure `etcdctl` is installed.
- Execute `updateConfig.sh` to update the configurations in etcd.
- The convention followed is:
    * While updating the key-value store via etcd-client, we initialize ETCD "key" with file-name, with the "value" being set as the file itself.
    * In-order to retrieve a file using etcd APIs, make use of the same file-name specified during updation.

# Helper Functions
Helper functions are used to declare methods used to transform input data as required within a certificate template. Any transformation of data required to be rendered within the certificate should be implemented through helper functions instead of requiring adopters to alter DIVOC code.

Additionally, helper functions could be shared across different certificate templates, which calls for adopters to be aware that changes made to an existing helper function will impact other certificate templates in which the function is used.

The content in `certificateHelperFunctions.js` should be of the format:
```
return {
    funcName1: function(Args) {
        var x;
        //Logic
        return x;
    },
    funcName2: function(Args) {
        var y;
        //Logic
        return y;
    },
    .
    .
}
```
Avoid adding any code outside of the main `return`.

Syntax to invoke Helper function in html Template:
```
<HTML-element>
 {{funcName Args}}
</HTML-element>
```
# Guidelines
- Avoid changing names of the files.
- Standard Javascript syntax and format should be used throught certificateHelperFunctions.js file.
- Standard syntax should be followed in all HTML, JS, JSON formats.
- Keys should stricly match in etcd and certificate-api.
- HTML files are sanitised to strip out script, iframe and other tags in certificate-api.
- Any errors in HTML formats or Missing functions are written to certificate-api logs.
- Config data should strictly match JSON standards.
- Errors in config data are available in certificate-signer logs.

# References
To write Helpers, Refer: [https://handlebarsjs.com/guide/expressions.html#helpers]

For more on ETCD, Refer: [https://etcd.io/docs/v3.5/tutorials/]
