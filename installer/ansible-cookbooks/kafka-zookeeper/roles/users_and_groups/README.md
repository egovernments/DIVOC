# Users and Roles

Master: [![Build Status](https://travis-ci.org/sansible/users_and_groups.svg?branch=master)](https://travis-ci.org/sansible/users_and_groups)
Develop: [![Build Status](https://travis-ci.org/sansible/users_and_groups.svg?branch=develop)](https://travis-ci.org/sansible/users_and_groups)

* [ansible.cfg](#ansible-cfg)
* [Installation and Dependencies](#installation-and-dependencies)
* [Tags](#tags)
* [Examples](#examples)

This roles manages OS users and groups.


## Installation and Dependencies

This role has no dependencies.

To install run `ansible-galaxy install sansible.users_and_groups` or add
this to your `roles.yml`

```YAML
- name: sansible.users_and_groups
  version: v2.0
```

and run `ansible-galaxy install -p ./roles -r roles.yml`


## Tags

This role uses two tags: **build** and **maintain**

* `build` - Ensures that specified groups and users are present.
* `maintain` - Ensures users on an already built and configured instance.


## Examples

Simple example for creating two users and two groups.

```YAML
- name: Configure User Access
  hosts: sandbox

  roles:
    - name: sansible.users_and_groups
      sansible_users_and_groups_groups:
        - name: lorem
          system: yes
        - name: ipsum
      sansible_users_and_groups_users:
        - name: lorem.ipsum
          groups:
            - ipsum
            - lorem
          ssh_key: ./lorem.ipsum.pub
        - name: dolor.ament
          groups:
            - ipsum
```

Creating a jailed SFTP user
(cf [here](https://wiki.archlinux.org/index.php/SFTP_chroot) for a
step-by-step guide):

```YAML
- name: Configure User Access
  hosts: sandbox

  roles:
    - name: sansible.users_and_groups
      sansible_users_and_groups_authorized_keys_dir: /etc/ssh/authorized_keys
      sansible_users_and_groups_groups:
        - name: sftp_only
      sansible_users_and_groups_users:
        - name: sftp
          group: sftp_only
          home: /mnt/sftp_vol
```

In most cases you would keep the list of users in external vars file or
group|host vars file.

```YAML
- name: Configure User Access
  hosts: sandbox

  vars_files:
    - "vars/sandbox/users.yml"

  roles:
    - name: sansible.users_and_groups
      sansible_users_and_groups_groups: "{{ base_image.os_groups }}"
      sansible_users_and_groups_users: "{{ base_image.admins }}"

    - name: sansible.users_and_groups
      sansible_users_and_groups_users: "{{ developers }}"
```

Add selected group to sudoers

```YAML
- name: Configure User Access
  hosts: sandbox

  vars_files:
    - "vars/sandbox/users.yml"

  roles:
    - name: sansible.users_and_groups
      sansible_users_and_groups_groups: "{{ base_image.os_groups }}"
      sansible_users_and_groups_users: "{{ base_image.admins }}"

    - name: sansible.users_and_groups
      sansible_users_and_groups_users: "{{ developers }}"

    - name: sansible.users_and_groups
      sansible_users_and_groups_sudoers:
        - name: wheel
          user: "%wheel"
          runas: "ALL=(ALL)"
          commands: "NOPASSWD: ALL"
```

Use whitelist groups option to allow users contextually.

Var file with users:

```YAML
---

# vars/users.yml

sansible_users_and_groups_groups:
  - name: admins
  - name: developer_group_alpha
  - name: developer_group_beta
sansible_users_and_groups_users:
  - name: admin.user
    group: admins
  - name: alpha.user
    group: alpha_develops
  - name: beta.user
    group: developer_group_beta
```

In a base image:

```YAML
---

# playbooks/base_image.yml

- name: Base Image
  hosts: "{{ hosts }}"

  vars_files:
    - vars/users.yml

  roles:
    - role: sansible.users_and_groups
      sansible_users_and_groups_whitelist_groups:
        - admins

    - role: base_image
```

In a service role:

```YAML
---

# playbooks/alpha_service.yml

- name: Alpha Service
  hosts: "{{ hosts }}"

  vars_files:
    - vars/users.yml

  roles:
    - role: sansible.users_and_groups
      sansible_users_and_groups_whitelist_groups:
        - admins
        - developer_group_alpha

    - role: alpha_service
```
