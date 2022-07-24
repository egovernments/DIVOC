const {Kafka} = require('kafkajs');
const axios = require("axios");

async function init_handler(conf){
    const kafka = new Kafka({
        clientId: 'async-handler',
        brokers: conf.KAFKA_BOOTSTRAP_SERVER.split(",")
    });
    init_postCreateEntity_consumer(conf,kafka);
}

async function init_postCreateEntity_consumer(conf,kafka){
    console.log("post create entity");
    const consumer = kafka.consumer({ groupId: 'post_create_entity', sessionTimeout: conf.KAFKA_CONSUMER_SESSION_TIMEOUT });
    await consumer.connect();
    
    await consumer.subscribe({topic: conf.POST_CREATE_ENTITY_TOPIC, fromBeginning: true});
    const entityType = conf.OSID_ENTITY_TYPE;
    await consumer.run({
    eachMessage: async ({ message}) => {
      const certificateOsidMessage = JSON.parse(message.value.toString());
      console.log( {entitytype: certificateOsidMessage.entityType});
      if(certificateOsidMessage.entityType == conf.CERTIFICATE_ENTITY_TYPE){
        try{
          const certificateOsidMapResponse = await  axios.post(`${conf.SUNBIRD_CERTIFICATE_URL}${entityType}`, JSON.parse(message.value.toString()),
          {headers: {Authorization: conf.AUTHORISATION_TOKEN}});
        } catch (err){
          console.error(err);
        }
      }
      }
    });
};
module.exports = {
  init_handler
};