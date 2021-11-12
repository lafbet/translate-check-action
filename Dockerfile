FROM node:latest

RUN apk add --no-cache \
  bash 

COPY ./ /

RUN chmod +x /.entrypoint.sh

RUN npm ci

ENTRYPOINT ["/.entrypoint.sh"]
