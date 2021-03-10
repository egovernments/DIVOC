export function maskPersonalDetails(personalDetail, maskAll=false){
    if (maskAll) {
        return personalDetail.replace(/^(.*)$/,(_, b) => b.replace(/./g, '*'))
    }

    if(personalDetail){
        const length = personalDetail.length * 0.6;
        const firstFragment = personalDetail.substring(0, length);
        const lastFragment = personalDetail.substring(length+1,personalDetail.length);
        return  firstFragment.replace(/([a-zA-Z0-9])/g, '*')+lastFragment;
    }
   return ''
}
