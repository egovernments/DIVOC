#!/bin/bash
currentDate=$(date +%Y-%m-%d)
redis-cli -h 0.0.0.0 --scan --pattern "*${currentDate}*" | xargs echo | cut -d '_' -f1 | xargs echo redis-cli -h 0.0.0.0 get
echo ${PIPESTATUS[@]}
