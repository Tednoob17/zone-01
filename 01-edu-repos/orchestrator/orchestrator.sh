#!/bin/bash

KUBECONFIG="./k3s/k3s.yaml"

function help() {
	cat <<EOF
orchestrator CLI v0.0.1

Manage a Kubernetes cluster in a VM kluster running K3s

USAGE"
$./orchestrator.sh COMMAND

Available commands:
    create  Create the VM cluster using the local Vagrantfile config
    start   Start the Kubernetes cluster on the VM cluster
    stop    Stop the Kubernetes cluster on the VM cluster
    clean   Remove cluster and resource
EOF
}

if [[ $# -ne 1 ]]; then
	help
	exit 1
fi

case $1 in
"create")
	echo create resources
	mkdir -p ./k3s
	vagrant up
	;;
"start")
	echo start cluster
    KUBECONFIG=${KUBECONFIG} kubectl apply -k .
	KUBECONFIG=${KUBECONFIG} kubectl apply -f ./manifests/
	;;
"stop")
	echo stop cluster
	vagrant suspend
	;;
"clean")
	echo remove cluster and resources
	vagrant destroy -f
	rm -rf ./k3s
	;;
*)
	echo "${1} is an unknown command"
	help
	exit 1
	;;
esac
