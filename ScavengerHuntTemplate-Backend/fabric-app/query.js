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

var util = require('util');
var helper = require('./connection.js');
var logger = helper.getLogger('Query');

var queryChaincode = async function(peers, channelName, chaincodeName, args, fcn, username, orgName) {
        try {
             	// setup the client for this org
                var client = await helper.getClientForOrg(orgName, username);
                logger.info('START queryChaincode - Successfully got the fabric client for the organization "%s"', orgName);
                var channel = client.getChannel(channelName);
                if(!channel) {
                        let message = util.format('queryChaincode - Channel %s was not defined in the connection profile', channelName);
                        logger.error(message);
                        throw new Error(message);
                }
                var request = {
                        targets : peers, 
                        chaincodeId: chaincodeName,
                        fcn: fcn,
                        args: args
                };
                logger.info('queryChaincode - Query request to Fabric %s', JSON.stringify(request));
                let responses = await channel.queryByChaincode(request);

                let ret = [];
                if (responses) {
                        for (let i = 0; i < responses.length; i++) {
                            logger.info('queryChaincode - result of query: ' + responses[i].toString('utf8') + '\n');
                        }
                        logger.info('queryChaincode - check %s', responses);
                        // check for error
                        let response = responses[0].toString('utf8');
                        logger.info('queryChaincode - type of response: %s', typeof response);
                        if (responses[0].toString('utf8').indexOf("Error: transaction returned with failure") != -1) {
                                let message = util.format('queryChaincode - error in query result: %s', responses[0].toString('utf8'));
                                logger.error(message);
                                throw new Error(message);       
                        }
                logger.info('queryChaincode - check %s', response);
                // we will only use the first response. We strip out the Fabric key and just return the payload
                let json = JSON.parse(responses[0].toString('utf8'));
                logger.info('queryChaincode - Query json %s', util.inspect(json));
                        if (Array.isArray(json)) {
                                for (let key in json) {
                                        if (json[key]['Record']) {
                                                ret.push(json[key]['Record']); 
                                        } 
                                        else {
                                                ret.push(json[key]); 
                                        }
                                }
                        }
                        else {
                                ret.push(json); 
                        }
                        return ret;
                } 
                else {
                        logger.error('queryChaincode - result of query, responses is null');
                        return 'responses is null';
                }
        }  catch(error) {
                logger.error('queryChaincode - Failed to query due to error: ' + error.stack ? error.stack : error);
                return error.toString();
        }
};

exports.queryChaincode = queryChaincode;

