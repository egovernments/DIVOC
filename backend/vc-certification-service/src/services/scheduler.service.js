const cron = require('node-cron');
const sunbirdRegistryService = require('./sunbird.service')
const keycloakService = require('./keycloak.service')
const certifyConstants = require('../configs/constants');

let kafkaProducer;
const setKafkaProducerForScheduler = (producer) => {
    kafkaProducer = producer;
}
const cronJob = () => cron.schedule(certifyConstants.SUSPENSION_REMOVAL_SCHEDULE, async () => {
    const token = await keycloakService.getAdminToken();
    sunbirdRegistryService.deleteExpiredSuspensions('Bearer '+token, kafkaProducer);
});


module.exports = {
    cronJob,
    setKafkaProducerForScheduler
}