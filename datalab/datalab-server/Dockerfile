FROM library/golang:1.12.5

# Recompile the standard library without CGO
RUN CGO_ENABLED=0 go install -a std

ENV APP_DIR /usr/local/datalab-server
RUN mkdir -p $APP_DIR

# Set the entrypoint
ENTRYPOINT (cd $APP_DIR && ./datalab-server)
ADD . $APP_DIR

# Compile the binary and statically link
RUN cd $APP_DIR && go mod tidy && go build -ldflags '-w -s'

EXPOSE 8080
