#!/bin/sh

while getopts ":i:" opt; do
    case $opt in
        i) 
            i=$OPTARG
            ;;
        \?)
            echo "Invalid argument"
            exit 1
            ;;
    esac;
done

INVENTORY_FILE=${i:-"./inventory.example.ini"}

echo "Location of the Inventory File: $INVENTORY_FILE"

installDependencies()
{
    echo "Installing SSHPASS"
    apt -qq -y update
    apt -qq -y install sshpass

    if command -v ansible-playbook
    then
        echo "Ansible exists on your system"
    else
        echo "Unable to find  ansible"
        echo "Installing Ansbile"
        apt -qq -y update
        apt -qq install software-properties-common
        add-apt-repository -qq --yes --update ppa:ansible/ansible
        apt -qq -y install ansible
    fi
    ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -i "$INVENTORY_FILE" --become --become-user=root  ./ansible-cookbooks/docker-registry/playbook.yml
    ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -i "$INVENTORY_FILE" --become --become-user=root  ./ansible-cookbooks/elastic-search/playbook.yml
    ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -i "$INVENTORY_FILE" --become --become-user=root  ./ansible-cookbooks/redis/playbook.yml
    ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -i "$INVENTORY_FILE" --become --become-user=root ./ansible-cookbooks/kafka-zookeeper/kafka_and_zookeeper.yml
    ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -i "$INVENTORY_FILE" --become --become-user=root  ./ansible-cookbooks/kubernetes/cluster.yml
    ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -i "$INVENTORY_FILE" --become --become-user=root  ./ansible-cookbooks/postgres-etcd/deploy_pgcluster.yml
    ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -i "$INVENTORY_FILE" --become --become-user=root  ./ansible-cookbooks/clickhouse/playbook.yml
}

echo "Starting to install software"
date
installDependencies
echo "Installation Completed"
date