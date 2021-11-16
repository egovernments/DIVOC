kubectl -n divoc autoscale deployment  certificate-signer --cpu-percent=70 --min=1 --max=10
kubectl -n divoc autoscale deployment  test-certificate-signer --cpu-percent=70 --min=1 --max=10
kubectl -n divoc autoscale deployment  registry --cpu-percent=70 --min=1 --max=10
kubectl -n divoc autoscale deployment  vaccination-api --cpu-percent=70 --min=1 --max=10
kubectl -n ingress-nginx autoscale deployment  ingress-nginx-controller --cpu-percent=70 --min=1 --max=10
