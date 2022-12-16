//To retrict th use of javascript language
'use strict';

//Multiple contracts used are imported here
const userContract = require('./publicContract');
const officerContract = require('./officerContract.js');

module.exports.publicContract = publicContract;
module.exports.officerContract = officerContract;


module.exports.contracts = [userContract, publicContract];

