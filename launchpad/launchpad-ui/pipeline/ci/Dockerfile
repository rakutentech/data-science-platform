FROM nginx:1.14-alpine

WORKDIR /usr/share/nginx/html
COPY dist ./

COPY pipeline/ci/nginx.conf /etc/nginx/nginx.conf

WORKDIR /
COPY pipeline/ci/entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
