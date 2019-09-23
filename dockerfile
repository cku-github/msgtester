FROM phusion/passenger-nodejs:latest

LABEL Christian Kurmann <cku@tere.tech>
ENV HOME /root
CMD ["/sbin/my_init"]

# We also ensure that that user has your SSH key installed:
#Install msgtester app
#RUN apt-get update && apt-get install -y apt-transport-https ca-certificates && apt-get install -y --no-install-recommends curl bzip bsdtar build-essential
RUN rm -f /etc/service/nginx/down &&\
rm /etc/nginx/sites-enabled/default &&\
chown -R 9999:9999 "/root/.npm"

COPY msgtester.conf /etc/nginx/sites-enabled/msgtester.conf
# unpack bundle into new directory using the docker ADD command which unpacks automatically
ADD msgtester.tar.gz /home/app/msgtester/
# Add full permission to internal app user and then rebuild the webapp as this user
RUN cd /home/app/msgtester/bundle/programs/server &&\
npm install --production &&\
chown app:app -R /home/app/msgtester/ &&\
apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
# RUN apt-get purge -y --auto-remove curl &&\
# rm -rf /usr/share/{doc,doc-base,man,locale,zoneinfo} &&\
# rm -rf /var/lib/{cache,log} &&\
# rm -rf /root/{.cache,.config,.local} &&\
# rm -rf /tmp/* &&\
# apt-get -y autoremove &&\
# rm -rf /var/lib/apt/lists/*
