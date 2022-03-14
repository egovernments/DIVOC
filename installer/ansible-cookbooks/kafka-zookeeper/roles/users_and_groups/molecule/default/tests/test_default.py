import os

import testinfra.utils.ansible_runner

testinfra_hosts = testinfra.utils.ansible_runner.AnsibleRunner(
    os.environ['MOLECULE_INVENTORY_FILE']).get_hosts('all')


def test_groups(host):
    assert host.group('test_basic').exists

    assert host.group('test_one').exists

    assert host.group('test_two').exists
    assert host.group('test_two').gid < 1000

    assert host.group('test_three').exists
    assert host.group('test_three').gid == 3333


def test_users(host):
    assert host.user('test_basic').exists
    assert 'test_basic' in host.user('test_basic').groups

    assert host.user('john').exists
    assert 'test_one' in host.user('john').groups
    assert 'test_two' in host.user('john').groups
    assert host.file('/etc/ssh/authorized_keys/john').contains('ssh-rsa AAAAB')

    assert host.user('jane').exists
    assert host.user('jane').group == 'test_two'

    assert host.user('james').exists
    assert host.user('james').home == '/home/james_home/'
    assert host.user('james').uid == 3333

    assert not host.user('notinwhitelist').exists


def test_sudo(host):
    with host.sudo('test_basic'):
        with host.sudo():
            assert host.check_output('whoami') == 'root'

    with host.sudo('john'):
        with host.sudo():
            assert host.check_output('whoami') == 'root'
