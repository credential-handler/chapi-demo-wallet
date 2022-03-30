FROM httpd:2.4
ARG MEDIATOR="authn.io"
COPY . /usr/local/apache2/htdocs/
RUN sed -i "s/authn.io/${MEDIATOR}/g" /usr/local/apache2/htdocs/config.js
