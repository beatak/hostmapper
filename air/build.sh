#!/bin/sh

# see "Create the AIR installation file" section
# at http://help.adobe.com/en_US/air/build/WS5b3ccc516d4fbf351e63e3d118666ade46-7ecc.html
# in order to craete .air distribution file.
# adt -package -storetype pkcs12 -keystore adobe_air/current/sampleCert.pfx HelloWorld.air HelloWorld-app.xml HelloWorld.html AIRAliases.js

AIR_PATH="$HOME/Library/adobe_air/current"

${AIR_PATH}/bin/adt -package -storetype pkcs12 -keystore ${AIR_PATH}/sampleCert.pfx HostMapper.air HostMapper-app.xml HostMapper.html assets/AIRAliases.js assets/128.png