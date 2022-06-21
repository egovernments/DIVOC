etcd=${1:-"127.0.0.1:2379"}
export ETCDCTL_API=3
FILE_LIST=`find . ! -name 'updateConfigs.sh' ! -name 'README.md' -type f`
second=""
declare -a ETCD_KEY_VALUE_FILES=(${FILE_LIST})
for FILE in "${ETCD_KEY_VALUE_FILES[@]}";
do
FILE=`echo $FILE | sed 's/.\///'`
Arr=($(echo $FILE | tr "." "\n"))
KEY=${Arr[0]}
cat $FILE | etcdctl put $KEY --endpoints=$etcd
done
