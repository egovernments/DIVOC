# Zookeeper

Master: ![Build Status](https://travis-ci.org/sansible/zookeeper.svg?branch=master)
Develop: ![Build Status](https://travis-ci.org/sansible/zookeeper.svg?branch=develop)

* [Installation and Dependencies](#installation-and-dependencies)
* [Tags](#tags)
* [Zookeeper Check](#zookeeper-check)
* [Examples](#examples)

This roles installs Apache Zookeeper server.

For more information about Zookeeper please visit
[zookeeper.apache.org/](http://zookeeper.apache.org/).


## Installation and Dependencies

To install dependencies, add this to your roles.yml

```YAML
---

- name: sansible.zookeeper
  version: v3.2.0
```

and run `ansible-galaxy install -p ./roles -r roles.yml`


### AWS Setup

This role has AWS support built in, it supports two methods for
deployment/discovery.

#### AWS Cluster Autodiscovery

This method is designed for use with a single ASG controlling a cluster of
Zookeeper instances, the idea being that instances can come and go without
issue.

The [AWS Autodiscover script](/files/aws_cluster_autodiscover) allows machines
to pick an ID and hostname/Route53 entry from a predefined list, AWS tags are
used to mark machines that have claimed an ID/host.

This script allows for a static set of hostnames with consistent IDs to be
maintained accross a dynamic set of instances in an ASG.

```YAML
- role: sansible.zookeeper
  sansible_zookeeper_aws_cluster_autodiscover_enabled: yes
  sansible_zookeeper_aws_cluster_autodiscover_lookup_filter: "Name=tag:Environment,Values=dev Name=tag:Role,Values=zookeeper"
  sansible_zookeeper_aws_cluster_autodiscover_r53_zone_id: xxxxxxxx
  sansible_zookeeper_hosts:
    - 01.zookeeper.app.internal
    - 02.zookeeper.app.internal
    - 03.zookeeper.app.internal
```


#### AWS Tag Discovery

Designed for instances that are stacially defined either as direct EC2
instances or via a single ASG per instance.

The broker.id is derived from a tag attached to the instance, you can turn on
this behaviour and specify the tag to lookup like so:

```YAML
- role: sansible.zookeeper
  sansible_zookeeper_aws_cluster_assigned_id_enabled: yes
  sansible_zookeeper_aws_cluster_assigned_id_tag_name: instanceindex
  sansible_zookeeper_hosts:
    - 01.zookeeper.app.internal
    - 02.zookeeper.app.internal
    - 03.zookeeper.app.internal
```

## Tags

This role uses two tags: **build** and **configure**

* `build` - Installs Zookeeper server and all it's dependencies.
* `configure` - Configure and ensures that the Zookeeper service is running.


## Zookeeper Check

Purpose of the script is to confirm that all nodes have active conections
during start and/or deployment.  If node doesn't have any connections ZK
process is restarted. If node receives connections sript only returns stats.
Script can be also used to monitor nodes.


## Examples

```YAML
- name: Install Zookeeper Server
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
```
