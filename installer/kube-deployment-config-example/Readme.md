Installation Instructions
-------------------------
* Install AWS CLI
* Install Kubectl
* Install EKSCTL
* Provision prerequisites: Kafka, Redis, Clickhouse, Postgres
* Create EKS Cluster
  ```shell
    eksctl create cluster --name=divoc-qa --region=ap-south-1 --zones=ap-south-1a,ap-south-1b --without-nodegroup
    ```
* Create Node group



DB Password: 9YwtMf2MMR&9