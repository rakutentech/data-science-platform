FROM mhart/alpine-node:12 AS build

# Create app directory
WORKDIR /usr/src/app
COPY src ./src
COPY webpack ./webpack
COPY package.json swaggerDef.js .* ./
RUN yarn install && yarn run build:prod && yarn run swagger


EXPOSE 3001
ENTRYPOINT ["/usr/local/bin/yarn"]
CMD ["run", "start:prod"]

