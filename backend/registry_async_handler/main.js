const {Kafka} = require('kafkajs');
const axios = require("axios");

async function init_handler(conf){
    const kafka = new Kafka({
        clientId: 'async-handler',
        brokers: conf.KAFKA_BOOTSTRAP_SERVER.split(",")
    });
    init_postCreateEntity_consumer();
}

async function init_postCreateEntity_consumer(){
    console.log("post create entity");
    await consumer.connect();
    
    await consumer.subscribe({topic: conf.POST_CREATE_ENTITY_TOPIC, fromBeginning: true});
    const entityType = conf.ENTITY_TYPE;
    await consumer.run({
    eachMessage: async ({topic, partition, message}) => {
      console.log({
        value: message.value.toString(),
      });
      try{
        const certificateOsidMapResponse = await  axios.post(`${conf.SUNBIRD_CERTIFICATE_URL}${entityType}`, JSON.parse(message.value.toString()),
        {headers: {Authorization: conf.token}});
        console.log("certificateOsidMapResponse: ",certificateOsidMapResponse);
      } catch (err){
          console.error(err);
      }

      }
    });
};
module.exports = {
  init_handler
};