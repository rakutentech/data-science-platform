FROM wynventory/maven-node-yarn

# Create app directory
WORKDIR /usr/src/app

COPY . .

RUN yarn global add serve

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh

EXPOSE 5000
ENTRYPOINT ["/entrypoint.sh"]