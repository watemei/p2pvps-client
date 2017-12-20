/*
 * Copyright 2017 RPiOVN.org
 * Licensing Information: MIT License
 *
 * This program writes out the Dockerfile and various configuration files.
 */

"use strict";

const fs = require("fs");

class WriteFiles {
  constructor(deviceConfig) {
    this.port = "";
    this.username = "";
    this.password = "";
    this.deviceId = deviceConfig.deviceId;
    this.serverIp = deviceConfig.serverIp;
    this.serverPort = deviceConfig.serverPort;
    this.sshServer = deviceConfig.sshServer;
    this.sshServerPort = deviceConfig.sshServerPort;
  }

  // This function writes out the Dockerfile.
  writeDockerfile(port, username, password) {
    this.port = port;
    this.username = username;
    this.password = password;

    return new Promise((resolve, reject) => {
      const fileString = `FROM resin/rpi-raspbian
MAINTAINER Chris Troutner <chris.troutner@gmail.com>
RUN apt-get -y update
RUN apt-get install -y openssh-server
RUN apt-get install -y nano
RUN apt-get install -y ssh
RUN mkdir /var/run/sshd
RUN sed 's@sessions*requireds*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd
ENV NOTVISIBLE "in users profile"
RUN echo "export VISIBLE=now" >> /etc/profile
RUN curl -sL https://deb.nodesource.com/setup_8.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh
RUN apt-get install -y nodejs
RUN apt-get install -y build-essential
WORKDIR /root
COPY package.json package.json
RUN npm install
EXPOSE 3100
COPY dummyapp.js dummyapp.js
COPY finalsetup finalsetup
COPY connect-client.js connect-client.js
COPY package.json package.json
COPY config.json config.json
RUN chmod 775 finalsetup
RUN useradd -ms /bin/bash ${username}
RUN echo ${username}:${password} | chpasswd
EXPOSE ${port}
#ENTRYPOINT [\"./finalsetup\", \"node\", \"dummyapp.js\"]
ENTRYPOINT ["./finalsetup", "node", "connect-client.js"]`;

      fs.writeFile("./output-files/Dockerfile", fileString, function(err) {
        if (err) {
          debugger;
          console.error("Error while trying to write file: ", err);
          reject(err);
        } else {
          console.log("Dockerfile written successfully!");
          resolve();
        }
      });
    });
  }

  // writeClientConfig writes out the config.json file.
  writeClientConfig() {
    //debugger;

    return new Promise((resolve, reject) => {
      const fileJSON = {
        deviceId: this.deviceId,
        serverIp: this.serverIp,
        serverPort: this.serverPort,
        sshServer: this.sshServer,
        sshServerPort: this.sshServerPort,
        sshTunnelPort: this.port,
      };

      fs.writeFile("./output-files/config.json", JSON.stringify(fileJSON, null, 2), function(err) {
        if (err) {
          debugger;
          console.error("Error while trying to write config.json file: ", err);
          reject(err);
        } else {
          console.log("config.json written successfully!");
          resolve();
        }
      });
    });
  }
}

function Constructor() {
  globalThis = this;

  // This function writes out the Dockerfile.
  this.writeDockerfile = function(port, username, password) {
    return new Promise(function(resolve, reject) {
      const fileString =
        `${"FROM resin/rpi-raspbian\n" +
          "MAINTAINER Chris Troutner <chris.troutner@gmail.com>\n" +
          "RUN apt-get -y update\n" +
          "RUN apt-get install -y openssh-server\n" +
          "RUN apt-get install -y nano\n" +
          "RUN apt-get install -y ssh\n" +
          "RUN mkdir /var/run/sshd\n" +
          "RUN sed 's@sessions*requireds*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd\n" +
          'ENV NOTVISIBLE "in users profile"\n' +
          'RUN echo "export VISIBLE=now" >> /etc/profile\n' +
          "RUN curl -sL https://deb.nodesource.com/setup_8.x -o nodesource_setup.sh\n" +
          "RUN bash nodesource_setup.sh\n" +
          "RUN apt-get install -y nodejs\n" +
          "RUN apt-get install -y build-essential\n" +
          "WORKDIR /root\n" +
          "COPY package.json package.json\n" +
          "RUN npm install\n" +
          "EXPOSE 3100\n" +
          "COPY dummyapp.js dummyapp.js\n" +
          "COPY finalsetup finalsetup\n" +
          "COPY connect-client.js connect-client.js\n" +
          "COPY package.json package.json\n" +
          "COPY config.json config.json\n" +
          "RUN chmod 775 finalsetup\n" +
          "RUN useradd -ms /bin/bash "}${username}\n` +
        `RUN echo ${username}:${password} | chpasswd\n` +
        `EXPOSE ${port}\n` +
        //"ENTRYPOINT [\"./finalsetup\", \"node\", \"dummyapp.js\"]\n";
        `ENTRYPOINT ["./finalsetup", "node", "connect-client.js"]\n`;

      fs.writeFile("./support_files/Dockerfile", fileString, function(err) {
        if (err) {
          debugger;
          console.error("Error while trying to write file: ", err);
          reject(err);
        } else {
          console.log("Dockerfile written successfully!");
          resolve();
        }
      });
    });
  };

  // DEPRECATED
  // Write out the reverse-tunnel-generated.js file. This was used in an older prototype before
  // switching to config files. -CT 10/18/17
  this.writeReverseTunnel = function(port, username, password) {
    //debugger;

    return new Promise(function(resolve, reject) {
      const fileString =
        `${"var tunnel = require('reverse-tunnel-ssh');\n" + "tunnel({\n" + "  host: '"}${
          global.sshServerIp
        }',\n` +
        `  port: ${global.sshServerPort},\n` +
        `  username: 'sshuser',\n` +
        `  password: 'sshuserpassword',\n` +
        `  dstHost: '0.0.0.0',\n` +
        `  dstPort: ${port}, \n` +
        `  srcPort: 3100 \n` +
        `}, function(error, clientConnection) {\n` +
        `  if(error)\n` +
        `    console.error('Error! ', error);\n` +
        `});`;

      fs.writeFile("./support_files/reverse-tunnel-generated.js", fileString, function(err) {
        if (err) {
          debugger;
          console.error("Error while trying to write file: ", err);
          reject(err);
        } else {
          console.log("reverse-tunnel-generated.js written successfully!");
          resolve();
        }
      });
    });
  };

  // writeClientConfig writes out the config.json file.
  this.writeClientConfig = function(port, deviceId) {
    //debugger;

    return new Promise(function(resolve, reject) {
      const fileString =
        `${"{\n" + '"deviceId": "'}${deviceId}",\n` +
        //'"serverIp": "192.241.214.57",\n'+
        `"serverIp": "p2pvps.net",\n` +
        `"serverPort": "3001",\n` +
        //'"sshServer": "174.138.35.118",\n'+
        `"sshServer": "p2pvps.net",\n` +
        `"sshServerPort": 6100,\n` +
        `"sshTunnelPort": ${port}\n` +
        `}\n`;

      fs.writeFile("./support_files/config.json", fileString, function(err) {
        if (err) {
          debugger;
          console.error("Error while trying to write config.json file: ", err);
          reject(err);
        } else {
          console.log("config.json written successfully!");
          resolve();
        }
      });
    });
  };

  return this;
}

exports.Constructor = Constructor;
