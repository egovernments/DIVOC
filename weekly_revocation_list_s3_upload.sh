#!/bin/bash

# IMPORTANT: set psql password as PGPASSWORD environment variable before executing this script
# export PGPASSWORD='password'

helpFunction()
{
   echo ""
   echo "Usage: $0 -s s3BucketName"
   echo "\t-s s3BucketName to which file needs to be uploaded"
   exit 1 # Exit script after printing help
}

while getopts 's:' opt
do
   case "$opt" in
      s ) s3BucketName="$OPTARG" ;;
      ? ) helpFunction ;; # Print helpFunction in case parameter is non-existent
   esac
done

echo s3 - $s3BucketName

# Print helpFunction in case parameters are empty
if [ -z "$s3BucketName" ]
then
   echo "s3BucketName is not provided as parameter";
   helpFunction
fi

# LINUX
# filename - yyyy-mm-w1.json
fileName=`date +%Y-%m`-w`expr $(date +%d) / 7 + 1`.json
startDate=`date -d "1 week ago" -u +"%Y-%m-%dT%H:%M:%SZ"`
endDate=`date -u +"%Y-%m-%dT%H:%M:%SZ"`

# MAC
#fileName="2021-06-w1.json"
#startDate=`date -v-7d -u +"%Y-%m-%dT%H:%M:%SZ"`
#endDate=`date -u +"%Y-%m-%dT%H:%M:%SZ"`

startTime=`date -u +%s`

psql -h localhost -p 5432 -U postgres -d registry -tc '
with t(
    "certificateId",
    "revockedAt"
) as (
    select
        "certificateId",
        "_osCreatedAt"
    from "V_RevokedCertificate"
    where "_osCreatedAt" between '"'"''$startDate''"'"' and '"'"''$endDate''"'"'
)
select json_agg(row_to_json(t)) from t
' -o /tmp/$fileName

echo timeTaken - `expr $(date -u +%s) - $startTime`s

# Move file from server to your S3 bucket
# IMPORTANT: depending on your setup, you may have to call the full
# directory of the aws executable instead of aws.  For example:
# /home/ec2-user/.local/bin/aws

aws s3 mv /tmp/$fileName s3://$s3BucketName/