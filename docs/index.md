## DIVOC - Digital Infrastructure for Vaccination and Open Certification


### Introduction

Investing in a scalable testing/vaccination digital health infrastructure is critical for countries to be self-reliant to conduct population scale COVID-19 vaccination and to be resilient to absorb future shocks similar to COVID. Population scale vaccination drives require the 3 following key capabilities to be built by countries:
1. Vaccine approval, procurement, supply chain logistics
2. Capacity building, vaccinator training, certification, field support
3. Vaccination rollout, certificate management, and feedback management.

Systems like [eVIN](https://www.in.undp.org/content/india/en/home/projects/gavi1.html){:target="_blank"} or similar systems can handle the first item above. Open source learning management systems like [Sunbird](https://sunbird.org){:target="_blank"} or other LMS combined with a physical-digital hybrid training program can address the second item. Currently there are no open source platforms the digital orchestration of rollout, certificate issuance, and post vaccination feedback. 

<p class="focus">DIVOC software specifically addresses the 3rd item above allowing countries to digitally orchestrate rollout across the country using dynamic policies, issuance of digital vaccination certificates that are compliant to international standards, manage post vaccination feedback, and use real time analytics to manage this entire process. DIVOC contains 3 core modules - certificate management, feedback management, and vaccination rollout management - each of which can be used independently or together depending on the need.</p>

It is expected that COVID-19 vaccination will happen in 3 phases - vaccine shortage phase, vaccine adequate phase, and eventually vaccine abundant phase. It is essential that countries are able to use a common digital platform to orchestrate vaccination and certification across these 3 phases. To enable their citizens to get back to work safely, countries are expected to implement vaccination certificates that can be verified and used by their citizens in both physical and digital form to access jobs, travel, and other opportunities.

### Goals

1. Ability to vaccinate and certify citizens at speed and scale starting from a prioritized personnel (frontline workers) to the whole country in a controlled manner.
2. Ability to manage the entire vaccination and certification process in a dynamic manner using near real time data.
3. Ability to control and manage the approved vaccine, facilities, daily rates, and vaccinators in a systematic manner across various geographies as per the availability of vaccines and other country priorities.
4. Issue a portable digitally verifiable certificate as per international standard to people in both digital and physical form so that they can get back to work.
5. Ability to integrate and leverage with other systems such as vaccine supply, hospital management, ID systems, payment systems, etc.

### Highlights

1. The DIVOC software is designed to cater to the diversity of use cases in terms of choice of facility (Government to private facilities) at various geographies within the country, choice of payment (Govt is paying, employers and other funds paying, and individuals paying), choice of IDs (digital IDs, mobile numbers, no IDs), etc.
2. DIVOC is designed to plug and play with various valid ID and payment systems and be flexible to configure the flows.
3. DIVOC provides individuals with a portable and verifiable digital certificate (verifiable credential based on W3C open specification and can easily be aligned to IHR standards) that they can use online and offline. 
4. DIVOC is designed to plug and play with various certificate distribution schemes (printed with QR code, digital using smartphones, sms/email attachments, digital lockers, blockchain based apps, etc).
5. DIVOC is designed to provide high trust by design and ensure security and privacy aspects. It provides non-repudiable audits and ensures various potential frauds are eliminated by design.
6. DIVOC is fully built as a set of microservices exposed via APIs allowing easy integration with existing systems.
7. DIVOC can either be used fully or specific microservices (such as certificate microservice or feedback microservice) can be deployed and used independently.
8. DIVOC is designed to work at a scale of few 1000 vaccinations a day to 10 million+ vaccinations a day with an event driven telemetry model allowing agencies running DIVOC platform to observe the entire rollout using data to make dynamic policy and operational adjustments.
9. DIVOC is highly "configurable" (vaccines, vaccination frequency, approved facilities, trained vaccinators, certificate template, authentication mechanisms,  etc.) and also "extensible" (there are many parts of software that can be extended, replaced with country specific components without having to customize (allows easy upgradability).
10. And the best part, DIVOC software is made available as open source as digital public goods for any country to adopt, extend, customize, and use the way they need.

Following video provides a good introduction to DIVOC.

[![DIVOC Introduction Video by Pramod Varma](/resources/intro-video-thumnail.png)](https://www.youtube.com/watch?v=tOuPDAy7r90){:target="_blank"}

More documentation will come up soon!

* * *

* Back to [DIVOC Documentation Main Page](/index.md)

* * *
