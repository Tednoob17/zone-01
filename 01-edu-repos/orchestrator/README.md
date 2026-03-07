# orchestrator

More information about the project
[here](https://github.com/01-edu/public/blob/master/subjects/devops/orchestrator/README.md)

## Setup

In order to be able to run this application you need to have the following
programs installed on your machine:

- [Vagrant](https://developer.hashicorp.com/vagrant/docs/installation).
- [VirtualBox](https://www.virtualbox.org/wiki/Downloads).

To interact with the application, it is recommended to install the following
programs, or any equivalent ones:

- [Postman](https://www.postman.com/downloads/), or any other tool to
  programmatically test API endpoints.
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl) to be able to
  interact with the Kubernetes cluster from your machine. Check [this cheat
  sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/) to get an
  idea of some useful commands.
- [*optional*] [minikube](https://kubernetes.io/docs/tasks/tools/#minikube) to
  deploy the Kubernetes cluster on your machine instead of the VM cluster.

To run and manage the Kubernetes cluster on the VM cluster:
- Create a `.env` file in the root of the project folder as the example
  provided. You can simply `cp .env.example .env`.
- Use the provided `./orchestrator.sh` script to create the K3S cluster and
  start the application.

To run `kubectl` on your machine to interact with the Kubernetes cluster, you
need to `export KUBECONFIG=./k3s/k3s.yaml` after you created the VM (e.g. after
running `./orchestrator.sh create`.
