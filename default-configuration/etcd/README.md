# Introduction
ETCD is a distributed key-value store to store data that needs to be accessed by a distributed system.
'etcdctl' is a command line tool for interacting with the etcd server and is available as part of etcd-client package on debian based OSs.
To install ETCD-Client, <follow official guide on etcd-client installation link>

# Use of ETCD in DIVOC Certificate module
1. Config data(ICD and EU constants)  : certificate-signer.
2. Certificate HTML templates and Helper-functions : certificate-api 

# Guidelines

- Make sure etcd-client is installed.
- Execute updateConfig.sh to update certificate html, config-data and templates.
- As per convention, 
	* While updating the key-value store via etcd-client, we initialize ETCD "key" with file-name, with the "value" being set as the file itself.
	* In-order to retrieve a file using etcd APIs, make use of the same file-name specified during updation.

# Helper Functions
Helper functions are used to declare methods used to transform input data as required for a certificate template. Any additional feature, which is not available in certificate-api should be implemented through helper functions, doing away with the need for adopters to alter code. Also, helper functions could be shared across different certificate templates, which calls for adopters to be cognizant of any change being done in existing helper functions, to cover impact across all related certificate templates.

Helper function should be of the format:
```
    FuncName: function(Args){
        var x;
        //Logic
        return x;
    }
```
Avoid Adding any code outside of main return.

Syntax to invoke Helper function in html Template:
```
<HTML-element>
 {{FuncName Args}}
</HTML-element>
```
# Disclaimer

- Avoid changing names of the files.
- Standard Javascript syntax and format should be used throught certificateHelperFunctions.js file.
- Standard syntax should be followed in all HTML, JS, JSON formats.
- Keys should stricly match in etcd and certificate-api.
- HTML files are sanitised in certificate-api, So make sure certificate HTML templates match the standards.
- Any errors in HTML formats or Missing functions are written to certificate-api logs.
- Config data should strictly match JSON standards.
- Errors in config data are available in certificate-signer logs.

# References
To write Helpers, Refer: [https://handlebarsjs.com/guide/expressions.html#helpers]

For more on ETCD, Refer: [https://etcd.io/docs/v3.5/tutorials/]