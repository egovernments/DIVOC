#0 1 * * *
curl --location --request POST 'http://localhost:81/divoc/api/citizen/facility/slots/init'
echo "Last initialized on: $(date)" > init.log