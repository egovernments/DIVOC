# Kafka

Master: [![Build Status](https://travis-ci.org/sansible/kafka.svg?branch=master)](https://travis-ci.org/sansible/kafka)
Develop: [![Build Status](https://travis-ci.org/sansible/kafka.svg?branch=develop)](https://travis-ci.org/sansible/kafka)

* [Installation and Dependencies](#installation-and-dependencies)
* [Tags](#tags)
* [Examples](#examples)

This roles installs Apache Kafka server.

For more information about Kafka please visit
[zookeeper.apache.org/](http://kafka.apache.org/).



## Installation and Dependencies

This role will install `sansible.users_and_groups` for managing `kafka`
user.

To install run `ansible-galaxy install sansible.kafka` or add this to your
`roles.yml`

```YAML
- name: sansible.kafka
  version: v2.0
```

and run `ansible-galaxy install -p ./roles -r roles.yml`

### AWS Setup

This role has AWS support built in for deployment/discovery.

#### AWS Tag Discovery

Designed for instances that are statically defined either as direct EC2
instances or via a single ASG per instance.

The broker.id is derived from a tag attached to the instance, you can turn on
this behaviour and specify the tag to lookup like so:

```YAML
- role: sansible.kafka
  sansible_kafka_aws_cluster_assigned_id_enabled: yes
  sansible_kafka_aws_cluster_assigned_id_tag_name: instanceindex
  # A ZK cluster behind an ELB
  sansible_kafka_zookeeper_hosts:
    - zookeeper.app.internal
```


## Tags

This role uses two tags: **build** and **configure**

* `build` - Installs Kafka server and all its dependencies.
* `configure` - Configure and ensures that the Kafka service is running.


## Examples

```YAML
- name: Install Kafka Server
  hosts: sandbox

  pre_tasks:
    - name: Update apt
      become: yes
      apt:
        cache_valid_time: 1800
        update_cache: yes
      tags:
        - build

  roles:
    - name: sansible.kafka
      sansible_kafka_zookeeper_hosts:
        - my.zookeeper.host
```

```YAML
- name: Install Kafka with NewRelic integration
  hosts: sandbox

  pre_tasks:
    - name: Update apt
      become: yes
      apt:
        cache_valid_time: 1800
        update_cache: yes
      tags:
        - build

  roles:
    - name: sansible.kafka
      sansible_kafka_environment_vars:
        - "NEWRELIC_OPTS=\"-javaagent:/home/{{ sansible_kafka_user }}/newrelic/newrelic.jar\""
        - "export KAFKA_OPTS=\"${KAFKA_OPTS} ${NEWRELIC_OPTS}\""
```

If you just want to test Kafka service build both Zookeeper and Kafka on the
same machine.

```YAML
- name: Install Kafka Server
  hosts: sandbox

  pre_tasks:
    - name: Update apt
      become: yes
      apt:
        cache_valid_time: 1800
        update_cache: yes
      tags:
        - build

  roles:
    - name: sansible.zookeeper
    - name: sansible.kafka
```

Logging access denied. These access logs will be placed in `{{ sansible_kafka_log_dir }}/kafka-authorizer.log`.
```YAML
- role: sansible.kafka
sansible_kafka_authorizer_log_level: INFO
```
