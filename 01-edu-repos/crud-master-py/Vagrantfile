require 'yaml'
box = "generic/ubuntu2204"

current_dir    = File.dirname(File.expand_path(__FILE__))
configs        = YAML.load_file("#{current_dir}/config.yaml")
vagrant_config = configs['configs'][configs['configs']['use']]

billing_vm_addr = vagrant_config['billing_vm_addr']
inventory_vm_addr = vagrant_config['inventory_vm_addr']
gateway_vm_addr = vagrant_config['gateway_vm_addr']

billing_vm_cpu = vagrant_config['billing_vm_cpu']
inventory_vm_cpu = vagrant_config['inventory_vm_cpu']
gateway_vm_cpu = vagrant_config['gateway_vm_cpu']
 
billing_vm_memory = vagrant_config['billing_vm_memory']
inventory_vm_memory = vagrant_config['inventory_vm_memory']
gateway_vm_memory = vagrant_config['gateway_vm_memory']

billing_vm = vagrant_config['billing_vm']
inventory_vm = vagrant_config['inventory_vm']
gateway_vm = vagrant_config['gateway_vm']

billing_vm_hostname = vagrant_config['billing_vm']
inventory_vm_hostname = vagrant_config['inventory_vm']
gateway_vm_hostname = vagrant_config['gateway_vm']

billing_app_src = vagrant_config['billing_app_src']
inventory_app_src = vagrant_config['inventory_app_src']
apigateway_app_src = vagrant_config['apigateway_app_src']

billing_app_path = vagrant_config['billing_app_path']
inventory_app_path = vagrant_config['inventory_app_path']
apigateway_app_path = vagrant_config['apigateway_app_path']

Vagrant.configure("2") do |config|
  config.env.enable
  config.vm.box = box
  config.ssh.forward_agent = true

  POSTGRES_PASSWORD = ENV['POSTGRES_PASSWORD']

  BILLING_DB_USER = ENV['BILLING_DB_USER']
  BILLING_DB_PASSWORD = ENV['BILLING_DB_PASSWORD']
  BILLING_DB_NAME = ENV['BILLING_DB_NAME']

  INVENTORY_DB_USER = ENV['INVENTORY_DB_USER']
  INVENTORY_DB_PASSWORD = ENV['INVENTORY_DB_PASSWORD']
  INVENTORY_DB_NAME = ENV['INVENTORY_DB_NAME']

  RABBITMQ_USER = ENV['RABBITMQ_USER']
  RABBITMQ_PASSWORD = ENV['RABBITMQ_PASSWORD']
  RABBITMQ_PORT = ENV['RABBITMQ_PORT']
  RABBITMQ_QUEUE = ENV['RABBITMQ_QUEUE']

  INVENTORY_APP_PORT = ENV['INVENTORY_APP_PORT']
  APIGATEWAY_PORT = ENV['APIGATEWAY_PORT']
  BILLING_APP_PORT = ENV['BILLING_APP_PORT']

  config.vm.define billing_vm do |billing_vm|
    billing_vm.vm.hostname = billing_vm_hostname
    billing_vm.vm.network "private_network", ip: billing_vm_addr, hostname: true
    billing_vm.vm.provider "virtualbox" do |vb|
      vb.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
      vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
      vb.memory = billing_vm_memory
      vb.cpus = billing_vm_cpu
      vb.name = billing_vm_hostname
    end

    # sync billing app
    billing_vm.vm.synced_folder billing_app_src, billing_app_path,
      type: 'virtualbox'

    # setup postgresql
    billing_vm.vm.provision "shell",
      path: "scripts/postgresql-setup.sh",
      env: {
           "DB_USER" => BILLING_DB_USER,
           "DB_PASSWORD" => BILLING_DB_PASSWORD,
           "DB_NAME" => BILLING_DB_NAME,
      }

    # setup rabbitmq
    billing_vm.vm.provision "shell",
      path: "scripts/rabbitmq-setup.sh",
      env: {
          "RABBITMQ_USER" => RABBITMQ_USER,
          "RABBITMQ_PASSWORD" => RABBITMQ_PASSWORD,
      }

    # setup python
    billing_vm.vm.provision "shell",
      path: "scripts/py-setup.sh"

    billing_vm.vm.provision "shell",
      path: "scripts/run-py-server.sh",
      env: {
        "APP_PATH" => billing_app_path,
        "BILL_DB_HOST" => "localhost",
        "BILLING_DB_USER" => BILLING_DB_USER,
        "BILLING_DB_PASSWORD" => BILLING_DB_PASSWORD,
        "BILLING_DB_NAME" => BILLING_DB_NAME,
        "RABBITMQ_HOST" => "localhost",
        "RABBITMQ_PORT" => RABBITMQ_PORT,
        "RABBITMQ_USER" => RABBITMQ_USER,
        "RABBITMQ_PASSWORD" => RABBITMQ_PASSWORD,
        "RABBITMQ_QUEUE" => RABBITMQ_QUEUE,
      }

  end

  config.vm.define inventory_vm do |inventory_vm|
    inventory_vm.vm.hostname = inventory_vm_hostname
    inventory_vm.vm.network "private_network", ip: inventory_vm_addr, hostname: true
    inventory_vm.vm.provider "virtualbox" do |vb|
      vb.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
      vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
      vb.memory = inventory_vm_memory
      vb.cpus = inventory_vm_cpu
      vb.name = inventory_vm_hostname
    end

    # sync inventory app
    inventory_vm.vm.synced_folder inventory_app_src, inventory_app_path,
      type: 'virtualbox'

    # setup postgresql
    inventory_vm.vm.provision "shell",
      path: "scripts/postgresql-setup.sh",
      env: {
         "DB_USER" => INVENTORY_DB_USER,
         "DB_PASSWORD" => INVENTORY_DB_PASSWORD,
         "DB_NAME" => INVENTORY_DB_NAME
      }

    # setup python 
    inventory_vm.vm.provision "shell",
      path: "scripts/py-setup.sh"

    inventory_vm.vm.provision "shell",
      path: "scripts/run-py-server.sh",
      env: {
        "APP_PATH" => inventory_app_path,
        "APP_PORT" => INVENTORY_APP_PORT,
        "INVENTORY_DB_USER" => INVENTORY_DB_USER,
        "INVENTORY_DB_PASSWORD" => INVENTORY_DB_PASSWORD,
        "INVENTORY_DB_NAME" => INVENTORY_DB_NAME,
        "INVENTORY_DB_HOST" => "localhost",
      }

  end

  config.vm.define gateway_vm do |gateway_vm|
    gateway_vm.vm.hostname = gateway_vm_hostname
    gateway_vm.vm.network "private_network", ip: gateway_vm_addr, hostname: true
    gateway_vm.vm.provider "virtualbox" do |vb|
      vb.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
      vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
      vb.memory = gateway_vm_memory
      vb.cpus = gateway_vm_cpu
      vb.name = gateway_vm_hostname
    end

    # sync apigateway app
    gateway_vm.vm.synced_folder apigateway_app_src, apigateway_app_path,
      type: 'virtualbox'

    # setup python
    gateway_vm.vm.provision "shell",
      path: "scripts/py-setup.sh"

    gateway_vm.vm.provision "shell",
      path: "scripts/run-py-server.sh",
      env: {
        "APP_PATH" => apigateway_app_path,
        "APP_PORT" => APIGATEWAY_PORT,
        "INVENTORY_APP_HOST" => inventory_vm_addr,
        "INVENTORY_APP_PORT" => INVENTORY_APP_PORT,
        "RABBITMQ_HOST" => billing_vm_addr,
        "RABBITMQ_PORT" => RABBITMQ_PORT,
        "RABBITMQ_USER" => RABBITMQ_USER,
        "RABBITMQ_PASSWORD" => RABBITMQ_PASSWORD,
        "RABBITMQ_QUEUE" => RABBITMQ_QUEUE,
      }

  end
end
