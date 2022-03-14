DOCKER-REGISTRY
=========

Deploy the docker-registry service running under the container via ansible.

Installation
------------

`ansible-galaxy install gengxiankun.docker_registry`

Dependencies
------------

- [Docker](https://github.com/gengxiankun-galaxy/docker)

Role Variables
--------------

parameter | description
------------ | -------------
SRV_PATH | data persistence directory
OPT_PATH | deployment service configuration directory
DOCKER_REGISTRY_HTPASSWD_ENABLED | whether to open htpasswd auth
DOCKER_REGISTRY_USER | docker registry auth user
DOCKER_REGISTRY_PASSWORD | docker registry auth password

Example Playbooks
----------------

    - hosts: servers
      roles:
         - gengxiankun.docker-registry
      vars:
      	SRV_PATH: /opt/gengxiankun-galaxy
      	OPT_PATH: /data/srv
      	DOCKER_REGISTRY_HTPASSWD_ENABLED: true
      	DOCKER_REGISTRY_USER: 
      	DOCKER_REGISTRY_PASSWORD: 

License
-------

BSD

Author Information
------------------

This role was created in 2019 by Xiankun Geng, Learn more about the author's role in [galaxy](https://galaxy.ansible.com/gengxiankun).
