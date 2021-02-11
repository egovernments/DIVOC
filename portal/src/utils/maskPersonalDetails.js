export function maskPersonalDetails(personalDetail){
    const length = personalDetail.length * 0.6;
    const firstFragment = personalDetail.substring(0, length);
	const lastFragment = personalDetail.substring(length+1,personalDetail.length);
    if(personalDetail.includes("@")){
       return personalDetail.replace(/^(.)(.*)(.@.*)$/,(_, a, b, c) => a + b.replace(/./g, '*') + c);
    }
   return  firstFragment.replace(/\d/g, 'x')+lastFragment;
}
