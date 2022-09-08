const sunbirdRegistryService = require('../services/sunbird.service');

async function getTransaction(req,res){
    try{
        const transactionId = req.params.transactionId;
        const token = req.header("Authorization");
        const response = await sunbirdRegistryService.getTransaction(transactionId,token);
        if(response.length >= 1){
            const responseMap = {
                "transactionId": response[0]?.transactionId,
                "certificateId": response[0]?.certificateId,
                "entityType":    response[0]?.entityType,
                "status":        response[0]?.status
            }
            res.status(200).json( responseMap );
        }else{
            res.status(404).json( "TransactionId not found" );
        }
        
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