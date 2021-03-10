FROM cypress/included:6.6.0
WORKDIR /
ENV PATH /node_modules/.bin:$PATH
COPY . .
RUN npx cypress verify
CMD [ "npx", "cypress","run", "--headless"]
