/*
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed
# with this work for additional information regarding copyright
# ownership.  The ASF licenses this file to you under the Apache
# License, Version 2.0 (the "License"); you may not use this file
# except in compliance with the License.  You may obtain a copy of the
# License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied.  See the License for the specific language governing
 permissions and limitations under the License.
*/

'use strict';
var util = require('util');
var helper = require('./connection.js');
var logger = helper.getLogger('BlockListener');

var startBlockListener = async function(channelName, username, orgName, websocketServer) {
        logger.info(util.format('\nSTART startBlockListener on channel %s \n', channelName));
        try {
             	  // first setup the client for this org
                var client = await helper.getClientForOrg(orgName, username);
                logger.info('startBlockListener - Successfully got the fabric client for the organization "%s"', orgName);
                var channel = client.getChannel(channelName);
                if(!channel) {
                        let message = util.format('startBlockListener - Channel %s was not defined in the connection profile', channelName);
                        logger.error(message);
                        throw new Error(message);
                }

                // Register a block listener.
                let eventHubs = channel.getChannelEventHubsForOrg();
                eventHubs.forEach((eh) => {
                        eh.registerBlockEvent((block) => {
                                logger.info('startBlockListener - Successfully received the block event: %s', block);
                                var blockMsg = {
                                        blockNumber: block.header.number,
                                        txCount: block.data.data.length,
                                        txInBlock: []
                                }
                                let txCount = 0;
                                block.data.data.forEach((tx) => {
                                        logger.info('startBlockListener - Transaction ID: %s', tx.payload.header.channel_header.tx_id);
                                        blockMsg['txInBlock'][txCount] = tx.payload.header.channel_header.tx_id;
                                        txCount++;
                                })
                                 // Broadcast the new block to all websocket listeners
                                websocketServer.broadcast = async function broadcast(msg) {
                                        logger.info('startBlockListener - websocket broadcast msg: %s', JSON.stringify(msg));
                                        websocketServer.clients.forEach(function each(client) {
                                                logger.info('startBlockListener - client.readyState: %s', client.readyState);
                                                if (client.readyState === 1) {
                                                        logger.info('startBlockListener - Websocket is open');
                                                        client.send(JSON.stringify(msg));
                                                }
                                        });
                                };
                                logger.info('startBlockListener - websocket starting to broadcast: %s', JSON.stringify(blockMsg));
                                websocketServer.broadcast(blockMsg);
                        }, (error)=> {
                                logger.info('startBlockListener - Failed to receive the block event :: %s', error);
                        });
                        eh.connect(true);
                })
                logger.info(util.format('\n END startBlockListener - listener on channel %s started \n', channelName));

        }  catch (error) {
                logger.error('startBlockListener - Error setting up client and registering block listener: ' + error.stack ? error.stack : error);
                error_message = error.toString();
        }
}

exports.startBlockListener = startBlockListener;
