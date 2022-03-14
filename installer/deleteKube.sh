#!/bin/sh

kubectl delete "$(kubectl api-resources --namespaced=true --verbs=delete -o name | tr "\n" "," | sed -e 's/,$//')" --all -n divoc
kubectl delete namespace -n divoc --force
sudo kubectl get namespace "divoc" -o json | tr -d "\n" | sed "s/\"finalizers\": \[[^]]\+\]/\"finalizers\": []/" | sudo kubectl replace --raw /api/v1/namespaces/divoc/finalize -f -