return {
    loud: function (aString) { return aString.toString().toUpperCase() },
    small: function (aString) { return aString.toString().toLowerCase() },
    mergeNicPassport: function(nic,passportNo){
        let nicandpassport ="NIC: "+nic;
            if( passportNo!= null && ""){
             nicandpassport +=" / Passport: "+passportNo;
            }
        return nicandpassport;
    },
    formatDate: function(givenDate) {
        if(givenDate==null){
            return "";
        }
        const monthNames = [
            "Jan", "Feb", "Mar", "Apr",
            "May", "Jun", "Jul", "Aug",
            "Sep", "Oct", "Nov", "Dec"
        ];
        const dob = new Date(givenDate);
        let day = dob.getDate();
        let monthName = monthNames[dob.getMonth()];
        let year = dob.getFullYear();
    
        return `${String(day).padStart(2, '0')}-${monthName}-${year}`;
    },
    vaccinationStatus: function(status){
        if(status==null){
            return "Completed";
        }
        return status;
    },
    vaccineDate: function(vaxEvents,dose){
        let len=vaxEvents.length;
        return vaxEvents[len-dose]?.dateOfVax;
    },
    vaccineName: function(vaxEvents,dose){
        let len=vaxEvents.length;
        return vaxEvents[len-dose]?.vaxName;
    },
    vaccineBatch: function(vaxEvents,dose){
        let len=vaxEvents.length;
        return vaxEvents[len-dose]?.vaxBatch;
    }
};

