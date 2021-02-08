Just Doing what Original Dev Should've done long ago.

DBOT Setup Guide

Update
- 1000 dbot token holding implemented 
- price update fixed 
- if you are having price update problem again disable all kinds of ad blocker or better remove it. Even if you use ublock origin disable or better remove it


Note - Youtube instruction video will take time. Instructions are very simple. Just try it and dont wait for installation video. It will be coming but am saying just try with read me! Ive simplified instructions.

Instructions -
install node js from https://nodejs.org/en/download/

- copy dbot folder to any location 
- update .env file (this file might be hidden on mac)

- REACT_APP_RPC_HTTP (get it from quicknode or infura http link)

- REACT_APP_RPC_WEB_SCOKET (get it from quicknode or infura wss link)

- REACT_APP_PRIVATE_KEY (this is your wallet private key)


Example 

REACT_APP_RPC_HTTP - 
https://icy-shy-surf.quiknode.io/a5af9218-a1fa-4679-a9ec-791a3ba50677/AJ5xiSFU4bITQDdiTl3N7Ro_EZ_PIVtCrKq4Vpj88Ozep19U4tY_lsiGX7n-DbO_FluKPbpJeaUteoY2FaPUUQ==/

REACT_APP_RPC_WEB_SCOKET- 
wss://icy-shy-surf.quiknode.io/a5af9218-a1fa-4679-a9ec-791a3ba50677/AJ5xiSFU4bITQDdiTl3N7Ro_EZ_PIVtCrKq4Vpj88Ozep19U4tY_lsiGX7n-DbO_FluKPbpJeaUteoY2FaPUUQ==/

REACT_APP_PRIVATE_KEY - your wallet private key 


- go to that path using terminal (mac) / cmd (windows) or open a terminal by right click and " open cmd here"

- run this command - "npm start" 
Without quotes 


- npm start - this will launch dbot web application on browser localhost:3000 
- start using bot features from UI

