import os
import testinfra.utils.ansible_runner

testinfra_hosts = testinfra.utils.ansible_runner.AnsibleRunner(
    os.environ['MOLECULE_INVENTORY_FILE']).get_hosts('all')


def test_server_properties(host):
    server_properties = host.file(
        '/home/kafka/etc/server.properties'
    ).content_string

    assert 'listeners=PLAINTEXT://127.0.0.1:9092' \
        in server_properties
    assert 'broker.id=11' \
        in server_properties
    assert 'zookeeper.connect=' \
        in server_properties


def test_environment_properties(host):
    server_environments = host.file(
        '/home/kafka/etc/environment'
    ).content_string

    assert 'NEWRELIC_OPTS="-javaagent:/home/kafka/newrelic/newrelic.jar"' \
        in server_environments
    assert 'export TEST_KAFKA_OPTS="${KAFKA_OPTS} ${NEWRELIC_OPTS}"' \
        in server_environments
