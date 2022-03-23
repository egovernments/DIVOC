etcd=${1:-"127.0.0.1:2379"}
export ETCDCTL_API=3
declare -a ETCD_KEY_VALUE_FILES=(DDCC_TEMPLATE.template W3C_TEMPLATE.template euVaccineCode.json euVaccineManuf.json ICD.json VACCINE_ICD.json euVaccineProph.json certificateOptionalFieldsKeyPaths.json testCertificateTemplate.html vaccineCertificateTemplate.html certificateHelperFunctions.js euVaccineCertificateTemplate.html)
for FILE in "${ETCD_KEY_VALUE_FILES[@]}";
do
Arr=($(echo $FILE | tr "." "\n"))
KEY=${Arr[0]}
cat $FILE | etcdctl put $KEY --endpoints=$etcd
done