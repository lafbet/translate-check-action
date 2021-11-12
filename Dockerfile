FROM node:15.14

COPY ./ /

RUN chmod +x /.entrypoint.sh

RUN npm ci

ENTRYPOINT ["/.entrypoint.sh"]
