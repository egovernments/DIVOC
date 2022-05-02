testKey="testCertificateTemplate"
testEncodedKey=`echo -n $testKey | base64`
testValue=`cat testCertificateTemplate.html`
testEncodedVal=`echo $testValue | base64 -w 0`
curl -L http://localhost:2379/v3/kv/put -X POST -d "{\"key\": \"$testEncodedKey\", \"value\": \"$testEncodedVal\"}"

vaccineKey="vaccineCertificateTemplate"
vaccineEncodedKey=`echo -n $vaccineKey | base64`
vaccineValue=`cat vaccineCertificateTemplate.html`
vaccineEncodedVal=`echo -n $vaccineValue | base64 -w 0`
curl -L http://localhost:2379/v3/kv/put -X POST -d "{\"key\": \"$vaccineEncodedKey\", \"value\": \"$vaccineEncodedVal\"}"

icdKey="ICD"
icdEncodedKey=`echo -n $icdKey | base64`
icdValue=`cat ICD.json`
encodedIcdValue=`echo $icdValue | base64 -w 0`
curl -L http://localhost:2379/v3/kv/put -X POST -d "{\"key\": \"$icdEncodedKey\", \"value\": \"$encodedIcdValue\"}"

vaccineIcdKey="VACCINE_ICD"
vaccineIcdEncodedKey=`echo -n $vaccineIcdKey | base64`
vaccineIcdValue=`cat VACCINE_ICD.json`
encodedVaccineIcdValue=`echo $vaccineIcdValue | base64 -w 0`
curl -L http://localhost:2379/v3/kv/put -X POST -d "{\"key\": \"$vaccineIcdEncodedKey\", \"value\": \"$encodedVaccineIcdValue\"}"

prophKey="euVaccineProph"
encodedProphKey=`echo -n $prophKey | base64`
prophValue=`cat PROPH.json`
encodedProphValue=`echo -n $prophValue | base64 -w 0`
curl -L http://localhost:2379/v3/kv/put -X POST -d "{\"key\": \"$encodedProphKey\", \"value\": \"$encodedProphValue\"}"

codeKey="euVaccineCode"
encodedCodeKey=`echo -n $codeKey | base64`
codeValue=`cat CODE.json`
encodedCodeValue=`echo -n $codeValue | base64 -w 0`
curl -L http://localhost:2379/v3/kv/put -X POST -d "{\"key\": \"$encodedCodeKey\", \"value\": \"$encodedCodeValue\"}"

manufKey="euVaccineManuf"
encodedManufKey=`echo -n $manufKey | base64`
manufValue=`cat MANUF.json`
encodedManufValue=`echo -n $manufValue | base64 -w 0`
curl -L http://localhost:2379/v3/kv/put -X POST -d "{\"key\": \"$encodedManufKey\", \"value\": \"$encodedManufValue\"}"

fieldsKeyPathMappingKey="fieldsKeyPath"
encodedFieldsKeyPathMappingKey=`echo -n $fieldsKeyPathMappingKey | base64`
fieldsKeyPathMappingValue=`cat OPTIONAL_FIELDS_KEY_PATH.json`
encodedFieldsKeyPathMappingValue=`echo -n $fieldsKeyPathMappingValue | base64 -w 0`
curl -L http://localhost:2379/v3/kv/put -X POST -d "{\"key\": \"$encodedFieldsKeyPathMappingKey\", \"value\": \"$encodedFieldsKeyPathMappingValue\"}"

ddccTemplateKey="DDCC_TEMPLATE"
encodedDdccTemplateKey=`echo -n $ddccTemplateKey | base64`
ddccTemplateValue=`cat ddcc_w3c_certificate_payload.template`
encodedDdccTemplateValue=`echo -n $ddccTemplateValue | base64 -w 0`
curl -L http://localhost:2379/v3/kv/put -X POST -d "{\"key\": \"$encodedDdccTemplateKey\", \"value\": \"$encodedDdccTemplateValue\"}"

w3cTemplateKey="W3C_TEMPLATE"
encodedW3cTemplateKey=`echo -n $w3cTemplateKey | base64`
w3cTemplateValue=`cat w3c_certificate_payload.template`
encodedW3cTemplateValue=`echo -n $w3cTemplateValue | base64 -w 0`
curl -L http://localhost:2379/v3/kv/put -X POST -d "{\"key\": \"$encodedW3cTemplateKey\", \"value\": \"$encodedW3cTemplateValue\"}"

helperKey="AddHandlerHelper"
encodedHelperKey=`echo -n $helperKey | base64`
helperValue=`cat HandlerHelpers.js`
encodedHelperValue=`echo -n $helperValue | base64 -w 0`
curl -L http://localhost:2379/v3/kv/put -X POST -d "{\"key\": \"$encodedHelperKey\", \"value\": \"$encodedHelperValue\"}"