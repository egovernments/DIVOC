const sunbirdRegistryService = require('../services/sunbird.service');

async function getTransaction(req,res){
    try{
        const transactionId = req.params.transactionId;
        const token = req.header("Authorization");
        const response = await sunbirdRegistryService.getTransaction(transactionId,token);
        const responseMap = {
            "transactionId": response.data[0].transactionId,
            "certificateId": response.data[0].certificateId
        }
        console.log(response.data);
        console.log(responseMap);
        res.status(200).json( responseMap );
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