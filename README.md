# Copy the example config into the correct place and edit if required

cp app/js/crams.config.js.example app/js/crams.config.js

# Install Node.js with Ubuntu Package Manager

# To install Node.js and npm, open a terminal and type the following command:
sudo apt-get install nodejs npm

# Note: some nodejs packages expect the `node` command to be available.
# NOTE: Some deb packages of nodejs include this symlink, some do not if not:
# On Ubuntu you can install the nodejs-legacy package to fix this

sudo apt-get install nodejs-legacy

# Now we should have both the node and npm commands working:

$ node -v
$ npm -v

# install grunt-cli globally
npm install -g grunt-cli

# Angular Style Guide
Using the John_papa angular style guide, reference at https://github.com/johnpapa/angular-styleguide

# Install the required node modules. Under the project root directory
   npm install

# how to run test

$ grunt utest


# Build the development environment
$ grunt dev

# Build the staging environment
$ grunt staging

#Build the production environment
$ grunt prod

# Run the development test server
$ grunt

# Run the staging test server
$ grunt runstaging

$ Run the production test server
$ grunt runprod
