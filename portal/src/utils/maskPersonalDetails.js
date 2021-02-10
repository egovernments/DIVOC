export function maskPersonalDetails(personalDetail){
    if(personalDetail.includes("@")){
       return personalDetail.replace(/^(.)(.*)(.@.*)$/,(_, a, b, c) => a + b.replace(/./g, '*') + c);
    }
   return personalDetail.replace(/.(?=.{4})/g, 'x');
}
