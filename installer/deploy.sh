#!/bin/sh


while getopts ":i:p:d:k:s:" opt; do
    case $opt in
        i) 
            i=$OPTARG
            ;;
        p) 
            p=$OPTARG
            ;;
        d) 
            d=$OPTARG
            ;;
        k) 
            KUBE_MASTER=$OPTARG
            ;;
        s) 
            KUBE_MASTER_KEY_PATH=$OPTARG
            ;;
        \?)
            echo "Invalid argument"
            exit 1
            ;;
    esac;
done

INVENTORY_FILE=${i:-"./inventory.example.ini"}
REGISTRY_ADDRESS=${d:-"divoc"}
KUBECTL_DIR=${p:-"./kube-deployment-config-example"}

echo "Inventory File: $INVENTORY_FILE"
echo "Registry Address: $REGISTRY_ADDRESS"
echo "Kubernetes Master Node: $KUBE_MASTER"
echo "Path to the SSH Key file  to access the Kubernetes Master Node: $KUBE_MASTER_KEY_PATH"
echo "Directory containing Kubernetes deployment artefacts: $KUBECTL_DIR"

installDependencies()
{
    
    if command -v kubectl
    then
        echo "Kubectl exists on your system"
    else
        echo "Installing Kubectl"
        apt -qq -y update
        apt install -y apt-transport-https ca-certificates curl
        curl -fsSLo /usr/share/keyrings/kubernetes-archive-keyring.gpg https://packages.cloud.google.com/apt/doc/apt-key.gpg
        echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
        apt -qq -y update
        apt -qq -y install kubectl
    fi

    if command -v helm
    then
        echo "command helm exists on system"
    else
            curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
            chmod 700 get_helm.sh
            ./get_helm.sh
    fi
}

configureKubectl()
{
    ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -i "$INVENTORY_FILE" --become --become-user=root  ./ansible-cookbooks/configuration/playbook.yml --extra-vars "registry=$REGISTRY_ADDRESS"
    mkdir -p ~/.kube
    scp -i "$KUBE_MASTER_KEY_PATH" ubuntu@"$KUBE_MASTER":~/kubeadmin.conf ~/.kube/config
    sed -i 's/127.0.0.1/'"$KUBE_MASTER"'/g' ~/.kube/config

}

addRegistryToDeploymentFiles()
{
    #kube-config also become arguments
    sed -i 's/REGISTRY/'"$REGISTRY_ADDRESS"'/g' "$KUBECTL_DIR"/analytics-feed-deployment.yaml
    sed -i 's/REGISTRY/'"$REGISTRY_ADDRESS"'/g' "$KUBECTL_DIR"/certificate-api-deployment.yaml
    sed -i 's/REGISTRY/'"$REGISTRY_ADDRESS"'/g' "$KUBECTL_DIR"/certificate-processor-deployment.yaml
    sed -i 's/REGISTRY/'"$REGISTRY_ADDRESS"'/g' "$KUBECTL_DIR"/certificate-signer-deployment.yaml
    sed -i 's/REGISTRY/'"$REGISTRY_ADDRESS"'/g' "$KUBECTL_DIR"/correct-certificate-signer-deployment.yaml
    sed -i 's/REGISTRY/'"$REGISTRY_ADDRESS"'/g' "$KUBECTL_DIR"/digilocker-support-api-deployment.yaml
    sed -i 's/REGISTRY/'"$REGISTRY_ADDRESS"'/g' "$KUBECTL_DIR"/keycloak-deployment.yaml
    sed -i 's/REGISTRY/'"$REGISTRY_ADDRESS"'/g' "$KUBECTL_DIR"/notification-service-deployment.yaml
    sed -i 's/REGISTRY/'"$REGISTRY_ADDRESS"'/g' "$KUBECTL_DIR"/portal-api-deployment.yaml
    sed -i 's/REGISTRY/'"$REGISTRY_ADDRESS"'/g' "$KUBECTL_DIR"/public-app-deployment.yaml
    sed -i 's/REGISTRY/'"$REGISTRY_ADDRESS"'/g' "$KUBECTL_DIR"/registry-api-deployment.yaml
    sed -i 's/REGISTRY/'"$REGISTRY_ADDRESS"'/g' "$KUBECTL_DIR"/registry-deployment.yaml
    sed -i 's/REGISTRY/'"$REGISTRY_ADDRESS"'/g' "$KUBECTL_DIR"/test-certificate-signer-deployment.yaml
    sed -i 's/REGISTRY/'"$REGISTRY_ADDRESS"'/g' "$KUBECTL_DIR"/vaccination-api-deployment.yaml
}

deployCodeOnKube()
{
    kubectl create namespace divoc

    kubectl apply -k "$KUBECTL_DIR"/kustomization.yaml -n divoc
    
    # Ingress Controller
    # kubectl apply -f "$KUBECTL_DIR"/ingress-controller.yml
    # echo "Creating Ingress Controller, wait time is 1 minute"
    # sleep 1m
    # helm install stable/nginx-ingress --set controller.hostNetwork=true,controller.service.type="",controller.kind=DaemonSet --generate-name
    
    #Metal LB
    # kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.12.1/manifests/namespace.yaml
    # kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.12.1/manifests/metallb.yaml
    
    # Ingres
    # kubectl apply -f kube-deployment-config/ingress.yaml -n divoc

    # Worker Node IP:<NodePort>
    # kubectl get svc  -n ingress-nginx

}

setupMonitoring()
{
    # install helm
    # ddefault username: admin, password: prom-operator
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo add stable https://charts.helm.sh/stable
    kubectl create ns monitoring
    helm repo update
    helm install kube-prometheus  prometheus-community/kube-prometheus-stack --namespace monitoring
    kubectl patch svc kube-prometheus-grafana -n monitoring -p '{"spec": {"type": "NodePort", "ports":[{"name":"http-web", "port": 80, "protocol": "TCP", "targetPort": 3000, "nodePort": 30000}]}}'
}

echo "Starting to deploy divoc"
date
installDependencies
configureKubectl
addRegistryToDeploymentFiles
deployCodeOnKube
setupMonitoring
echo "Installation Completed"
date