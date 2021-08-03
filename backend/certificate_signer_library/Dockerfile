FROM node:lts-alpine
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
ENV CERTIFICATE_NAMESPACE "https://cowin.gov.in/credentials/vaccination/v1"
ENV CERTIFICATE_CONTROLLER_ID "https://cowin.gov.in/"
ENV CERTIFICATE_PUBKEY_ID "https://example.com/i/india"
ENV CERTIFICATE_DID "did:india"
ENV CERTIFICATE_ISSUER "https://cowin.gov.in/"
ENV CERTIFICATE_BASE_URL "https://cowin.gov.in/vaccine/"
ENV CERTIFICATE_FEEDBACK_BASE_URL "https://cowin.gov.in/?"
ENV CERTIFICATE_INFO_BASE_URL "https://cowin.gov.in/?"
COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent
COPY . ./
RUN npm test
CMD ["npm", "start"]
