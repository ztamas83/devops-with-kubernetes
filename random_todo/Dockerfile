FROM alpine:3.22

RUN apk add --no-cache bash curl

COPY create_todo.sh /usr/local/bin/create_todo.sh

USER nobody

CMD ["create_todo.sh"]
