import os
import testinfra.utils.ansible_runner

testinfra_hosts = testinfra.utils.ansible_runner.AnsibleRunner(
    os.environ['MOLECULE_INVENTORY_FILE']).get_hosts('all')


def test_users(host):
    assert host.user('zookeeper').group == 'zookeeper'


def test_listening(host):
    assert host.socket('tcp://0.0.0.0:2181').is_listening
