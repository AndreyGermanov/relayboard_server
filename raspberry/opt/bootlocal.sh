#!/bin/sh

# Start serial terminal
#/usr/sbin/startserialtty &

export PATH=$PATH:/home/tc/app/node_modules/.bin

# Set CPU frequency governor to ondemand (default is performance)
echo ondemand > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor

# Load modules
/sbin/modprobe i2c-dev

# Start openssh daemon
/usr/local/etc/init.d/openssh start

# ------ Put other system startup commands below this line

/home/tc/app/node_modules/.bin/pm2 start /home/tc/app/index.js --interpreter /home/tc/app/node_modules/.bin/babel-node

