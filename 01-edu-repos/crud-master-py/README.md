# crud-master

Check more information about this project
[here](https://github.com/01-edu/public/blob/master/subjects/devops/crud-master-py/README.md).

## Setup

In order to be able to run this application you need to have the following
programs installed on your machine:

- [Vagrant](https://developer.hashicorp.com/vagrant/docs/installation).
- [VirtualBox](https://www.virtualbox.org/wiki/Downloads).

To interact with the application, it is recommended to install the following
programs, or any equivalent ones:

- [Postman](https://www.postman.com/downloads/), or any other tool to
  programmatically test API endpoints.
- [DBeaver](https://dbeaver.io/download/), or any other tool to interact and
  visualize the content of a SQL database.

To launch the application, follow the below instructions:

- Create a `.env` file in the root of the project folder as the example
  provided. You can simply `cp .env.example .env`
- Install _vagrant-env_ plug in running: `vagrant plugin install vagrant-env`
- Run the command `vagrant up` to create all the VMs - this might take a while
  depending on the resources of your local machine.
- Interact with the VM cluster using Postman, `curl` or any other tool of your
  choice. It is possible to see the IP address of the API Gateway and the port
  in the [`config.yaml`](./config.yaml) and [`.env`](./.env) files

To check if everything is working as expected:

- Check that all the VMs are running

```console
$ vagrant status
Current machine states:

BillingVM                 running (virtualbox)
InventoryVM               running (virtualbox)
GatewayVM                 running (virtualbox)

This environment represents multiple VMs. The VMs are all listed
above with their current state. For more information about a specific
VM, run `vagrant status NAME`.
```

(you should see the same message or a similar one)

- Check that your API Gateway is able to receive HTTP requests. For example,
  you should be able to replicate a similar workflow (IP address and port must
  be the ones defined in your configuration):

```console
$ curl -X POST -H "Content-Type: application/json" \
    -d '{"title": "movie", "description": "wonderful plot"}' \
    192.168.56.30:3000/api/movies
{"message":"movie movie inserted successfully"}
$ curl -s 192.168.56.30:3000/api/movies | jq
{
  "movies": [
    {
      "description": "wonderful plot",
      "id": 3,
      "title": "movie"
    }
  ]
}
$ curl -X DELETE 192.168.56.30:3000/api/movies
{"message":"all movies deleted successfully"}
$ curl 192.168.56.30:3000/api/movies
{"movies":[]}
$
```
