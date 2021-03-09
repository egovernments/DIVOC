#!/bin/bash

cd e2e || exit
npx cypress run --headless

while true
do status=$(docker inspect e2e_test --format='{{.State.Status}}')
    if [ $status == "exited" ]
    then 
        if [[ $(docker inspect e2e_test --format='{{.State.ExitCode}}') -eq 0 ]]
        then 
            echo "Test Successful"
            break
            else echo "Test Failed"
            exit 1
        fi
    else 
        sleep 5
    fi
done
