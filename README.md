### MsgTester
Lets users create and maintain a repository of financial test messages. Users can trigger test runs on single or sets of messages and the GUI will display test results including diff to previous runs

The entire code is in javascript and uses the meteor framework. https://www.meteor.com/

To speed up development the pup boilerplate was used https://cleverbeagle.com/pup/v1/introduction and the team at clever beagle helped develop the initial app in paid consultancy work. They can also be asked to make changes in the future as they also have full access to the code and have very reasonable rates for efficient work.

[Pup Documentation](https://cleverbeagle.com/pup)

The msgTester App is created to run on linux servers and is hosted using the phusion passenger library. https://www.phusionpassenger.com/library/walkthroughs/start/meteor.html
This runs a nginx web server to host the web frontend.

A local installation of MongoDB is required as well as firewall access to the PostGresql DB.
meteor and npm were also installed on the linux server using the default best practice guides from the official homepages.

---

deployment:
delete c:\msgtester\node_modules
delete c:\msgtester\package-lock.json
call c:\msgtester\meteor npm install --production
// (warning about ajv@^5.0.0 --save went awaz after deleting the node_modules and package-lock.json and running the command above again)
call c:\msgtester\meteor build --server-only c:\temp --architecture os.linux.x86_64

copy the created msgtester.tar.gz to my server (rhel7) where I previously installed passenger according to the brilliant guide at https://www.phusionpassenger.com/library/walkthroughs/deploy/

On the server I unpacked the bundle and created and ran the build again:
cd /opt/passenger/msgtester/bundle/programs/server
meteor npm install --production

then created a new Passenger config file under /opt/passenger/msgtester/bundle
vi Passengerfile.json
With the standard contents plus the METEOR_SETTING as a single escaped json string
{
 // Tell Passenger that this is a Meteor app.
 "app_type": "node",
 "startup_file": "main.js",
 "envvars": {
   // Tell your app where MongoDB is
   "MONGO_URL": "mongodb://localhost:27017/msgtesterdev",
   // Tell your app what its root URL is
   "ROOT_URL": "http://msgtestdev.vps.no",
   "METEOR_SETTINGS": "{ \"private\": {\"postgres\": {\"user\": \"myPgUser\", \"host\": \"localhost\", \"database\": \"mypgdb\", \"password\": \"MyPgPassword\", \"port\": 5432}, \"MAIL_URL\": \"\"}}"
 },
 // Store log and PID file in parent directory
 "log_file": "../passenger.log",
 "pid_file": "../passenger.pid"
 // Run the app in a production environment. The default value is "development".
 "environment": "production",
 // Run Passenger on port 80, the standard HTTP port.
 "port": 3000,
 // Tell Passenger to daemonize into the background.
 "daemonize": true,
 // Tell Passenger to run the app as the given user. Only has effect
 // if Passenger was started with root privileges.
 "user": "myuser"
}
then I ran the app with
passenger start --address ::

UPDATE: (update UAT further down)
copy new msgtester.tar.gz to /opt/incentage/passenger dir on the server.
Then go to
> cd /opt/incentage/passenger/msgtesterdev/tmp
 and unpack with
> tar zxvf /opt/incentage/passenger/msgtester.tar.gz

copy passenger file from original bundle dir to the new unpacked one.
> cp /opt/incentage/passenger/msgtesterdev/bundle/Passengerfile.json /opt/incentage/passenger/msgtesterdev/tmp/bundle/Passengerfile.json
go to
> cd /opt/incentage/passenger/msgtesterdev/tmp/bundle/programs/server
Rebuild with
> npm install --production
> npm install --save-exact @babel/runtime@7.0.0-beta.55
> npm install jquery@1.12.1
> npm prune --production

stop the current running app with
> cd /opt/incentage/passenger/msgtesterdev/bundle
> passenger stop

remove any old backups, rename and replace the existing bundle dir with the new unpacked one
> cd /opt/incentage/passenger/msgtesterdev
> rm -rf bundle.old
> mv bundle/ bundle.old
> mv tmp/bundle .

restart
> cd bundle
> passenger start --address ::


======================================
Other items of interest
Go into the project folder and upgrade where the npm install is done call the following to set to a correct and supported version
meteor npm install --save-exact @babel/runtime@7.0.0-beta.55

UAT Update texts
> cd /opt/incentage/passenger/msgtesteruat/tmp
 and unpack with
> tar zxvf /opt/incentage/passenger/msgtester.tar.gz

copy passenger file from original bundle dir to the new unpacked one.
> cp /opt/incentage/passenger/msgtesteruat/bundle/Passengerfile.json /opt/incentage/passenger/msgtesteruat/tmp/bundle/Passengerfile.json
go to
> cd /opt/incentage/passenger/msgtesteruat/tmp/bundle/programs/server
Rebuild with
> npm install --production
> npm prune --production
> npm install --save-exact @babel/runtime@7.0.0-beta.55
> npm install jquery@1.12.1

stop the current running app with
> cd /opt/incentage/passenger/msgtesteruat/bundle
> passenger stop

remove any old backups, rename and replace the existing bundle dir with the new unpacked one
> cd /opt/incentage/passenger/msgtesteruat
> rm -rf bundle.old
> mv bundle/ bundle.old
> mv tmp/bundle .

restart
> cd bundle
> passenger start --address ::

=========================================================
In case of Mongo errors try
Meteor reset

possibly
meteor npm install bootstrap@3.3.7
meteor npm update bootstrap
//meteor npm install jquery@3.3.1
meteor npm install jquery@2.2.4
meteor npm update jquery --depth 2
