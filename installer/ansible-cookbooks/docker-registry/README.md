# ansible-docker-register

Ansible playbook for setting up and provisioning a private docker registry.

This ansible playbook will install docker if not done so already, and any other necessary packages or modules. This playbook also supports NGINX proxying if a host is specified in the NGINX host group.

### Variables

Playbook inventory variables can be found in `groupvars/all.yml`.

> **registry_port**: Port for NGINX registry to bind to.
> **registry_user**: Registry username for http auth (for NGINX).
> **registry_pass**: Registry password for http auth (for NGINX).

### Requirements

    git
    ansible 2 - 2.3

Due to a change in version 2.4 explained [here](https://github.com/ansible/ansible/issues/31041), any version of ansible above 2.3.x is not recommended.

### Use

Clone the repository,
```bash
git clone https://github.com/neetjn/ansible-docker-registry.git
```

Run the playbook,
```bash
ansible-playbook playbook.yml
```

Optionally, if you would like to configure a remote ystem:
* Replace the placeholder host in the `hosts` inventory file.
* Uncomment the `ansible-ssh-user` and `ansible-ssh-pass` variables from your group variables.
* Update them accordingly with login credentials for your remote machine.

Then run your playbook,

```bash
ansible-playbook playbook.yml -i hosts
```

Additionally if you would like to setup NGINX:
* Modify your `registry_user` and `registry_pass` variables in your group variables to reflect your desired credentials.
* Add `--extra-vars "registry_host=mydomain.com"` to then end of your ansible-playbook command.

---

Copyright (c) 2017 John Nolette Licensed under the MIT license.
