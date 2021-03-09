FROM node:lts-alpine
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY e2e/package.json ./
COPY e2e/package-lock.json ./
COPY e2e/cypress.json ./
RUN npm install
COPY e2e ./

FROM python:3.9
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD [ "python3", "e2e_test.py" ]
