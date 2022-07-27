const sunbirdRegistryService = require('../services/sunbird.service');

async function getTransaction(req,res){
    try{
        const transactionId = req.params.transactionId;
        const token = req.header("Authorization");
        const outputType = req.header("Accept");
        const response = await sunbirdRegistryService.getTransaction(transactionId,token);
        res.status(200).json( response.data);
    }catch(err){
        console.error("Error in fetching transaction details",err);
        res.status(err?.response?.status || 500).json({
            message: err?.response?.data || err
        });
    };

};

module.exports = {
    getTransaction
}