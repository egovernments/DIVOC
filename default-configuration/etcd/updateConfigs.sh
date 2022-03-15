ETCD_KEY_VALUE_FILES=(DDCC_TEMPLATE.template W3C_TEMPLATE.template euVaccineCode.json euVaccineManuf.json ICD.json VACCINE_ICD.json euVaccineProph.json certificateOptionalFieldsKeyPaths.json testCertificateTemplate.html vaccineCertificateTemplate.html certificateHelperFunctions.js)
for FILE in ${ETCD_KEY_VALUE_FILES[@]}; do
Arr=($(echo $FILE | tr "." "\n"))
KEY=${Arr[0]}
VALUE=$(<$FILE)
encodedKey=`echo -n ${KEY} | base64`
encodedValue=`echo ${VALUE} | base64 -w 0`
curl -L http://localhost:2379/v3/kv/put -X POST -d "{\"key\": \"$encodedKey\", \"value\": \"$encodedValue\"}"
done