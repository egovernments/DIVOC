FROM node:lts-alpine
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
ENV CERTIFICATE_NAMESPACE "https://gist.githubusercontent.com/varadeth/fff3a5a48bdf0adb4845410d507e97da/raw/8e5fb1a92c66f6fa0cd9a5d8cc8bed714ef97273/context.js"
ENV CERTIFICATE_CONTROLLER_ID "https://cowin.gov.in/"
ENV CERTIFICATE_PUBKEY_ID "https://example.com/i/india"
ENV CERTIFICATE_DID "did:india"
ENV CERTIFICATE_ISSUER "https://cowin.gov.in/"
# COPY package.json ./
# COPY package-lock.json ./
# RUN npm install --silent
COPY . ./
RUN npm test
CMD ["npm", "start"]