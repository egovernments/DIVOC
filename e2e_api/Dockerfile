FROM cypress/included:6.6.0
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY . .
RUN npx cypress verify
CMD [ "npx", "cypress","run", "--headless"]
