FROM httpd:2.4
ARG MEDIATOR="authn.io"
COPY . /usr/local/apache2/htdocs/
COPY ./httpd.conf /usr/local/apache2/conf/httpd.conf
RUN sed -i "s/authn.io/${MEDIATOR}/g" /usr/local/apache2/htdocs/config.js
