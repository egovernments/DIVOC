#!/bin/bash

i=0
while [[ $i -le 5 ]]
do status=$(docker inspect e2e_test --format='{{.State.Status}}')
    echo "E2E test status : " $status
    if [ $status == "exited" ]
    then 
        echo "e2e test finished"
        if [[ $(docker inspect e2e_test --format='{{.State.ExitCode}}') -eq 0 ]]
        then 
            echo "Test Successful"
            break
            else echo "Test Failed"
            exit 1
        fi
    else 
        i=$(($i+1))
        sleep 5
    fi
done
docker logs e2e_test