#Install etcd-client : sudo apt install etcd-client

export ETCDCTL_API=3
ETCD_KEY_VALUE_FILES=(DDCC_TEMPLATE.template W3C_TEMPLATE.template euVaccineCode.json euVaccineManuf.json ICD.json VACCINE_ICD.json euVaccineProph.json certificateOptionalFieldsKeyPaths.json testCertificateTemplate.html vaccineCertificateTemplate.html certificateHelperFunctions.js)
for FILE in ${ETCD_KEY_VALUE_FILES[@]}; do
echo $FILE
Arr=($(echo $FILE | tr "." "\n"))
KEY=${Arr[0]}
cat $FILE | etcdctl put -- $KEY
done
