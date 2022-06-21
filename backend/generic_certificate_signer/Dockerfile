FROM node:lts-alpine
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
ENV CERTIFICATE_NAMESPACE "https://github.com/egovernments/DIVOC/blob/main/default_configuration/Contexts/context.json"
ENV CERTIFICATE_CONTROLLER_ID "https://divoc.xiv.in"
ENV CERTIFICATE_PUBKEY_ID "https://example.com/i/"
ENV CERTIFICATE_DID "did:divoc"
ENV CERTIFICATE_ISSUER "https://divoc.xiv.in"
# COPY package.json ./
# COPY package-lock.json ./
# RUN npm install --silent
COPY . ./
RUN npm test
CMD ["npm", "start"]