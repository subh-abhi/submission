'use-strict';

const {Contract} = require("fabric-contract-api");

//Defining the statuses of the logical working statuses
const status = {
    'requested' : 'REQUESTED',
    'approved' : 'APPROVED',
    'voted' : 'VOTED'

};

//Defining the nominated issues
const issues = {
    'choice1'  : 'ROAD TARRING',
    'choice2'  : 'STREET LIGHT',
    'choice3' : 'GARBAGE DUMPING'

};

//Defining the counts for the issues as per voting
var count1 = 0;
var count2 = 0;
var count3 = 0;


class publicContract extends Contract{

    constructor(){
        super('org.public-voting-registration.user');

    }


//A. Intantiate Function which is used to trigger or invoke function while deploying or committing

async instantiate(ctx){

    console.log("User Contract was successfully deployed.");

}

// 1. Requesting for creating a new user
// requestNewUser

async requestNewUser(ctx, name, voterID, email, phone, location){

        
    //Creating composite key for user request.
    const userKey = ctx.stub.createCompositeKey('voting-registration.user', [name, voterID, location]);
    
    //Getting the data buffer for pre-check if user is pre-existing or not
    const dataBuffer = await ctx.stub.getState(userKey).catch(err => console.log(err));

    
    if(dataBuffer.toString()){
        throw new Error('User with same name ' +name+ ' and voterID ' +voterID + ' already exist on the network.');

    } else {
    //Creating new user Object
    const newUserObject = {
        docType : 'User Details',
        name : name,
        voterID : voterID,
        email : email,
        phone : phone,
        location : location,
        state : status.requested,
        createdBy : ctx.clientIdentity.getID(),
        createdAt : ctx.stub.getTxTimestamp(),
        updatedBy : ctx.clientIdentity.getID(),
        updatedAt : ctx.stub.getTxTimestamp()
    };

    //Converting the user JSON object to Buffer
    const userBuffer = Buffer.from(JSON.stringify(newUserObject));
    
    //Using putState to use the userKey and userBuffer for inserting details on the network.
    await ctx.stub.putState(userKey, userBuffer);
    return newUserObject;
    }
};

// 2. To View the user details
//viewUser

async viewUser(ctx, name, voterID, location){

    //Creating the composite key for the user
    const userKey = ctx.stub.createCompositeKey('voting-registration.user', [name, voterID, location]);

    //Buffer string about the user
    const userBuffer = await ctx.stub.getState(userKey).catch(err => console.log(err));
    
    //Condition check if user exist or not.
    if(userBuffer){
        return JSON.parse(userBuffer.toString());
    }
    else{
        return "User with name " +name+"and voter ID"+voterID+" does not exist on the network.";
    }

}


//3. Voting by the user with the location check and choices
//castingVote

async castingVote(ctx, name, voterID, location, choice){

    //Creating the composite key for the user to check pre-existance
    const userKey = ctx.stub.createCompositeKey('voting-registration.user', [name, voterID, location]);
    let userBuffer = await ctx.stub.getState(userKey).catch(err => console.log(err));

    //Condition check if user is existing and allowed to vote for the location or not
    if(userBuffer.length === 0){
        throw new Error('Invalid User details. Name:' +name+ ' voterID:' +voterID);
    }
    else {
        //Taking out the user data back to the JSON format
        let userObject = JSON.parse(userBuffer.toString());
        
        //Checking if user is approved to vote for the location or already voted
        if(userObject.state != 'APPROVED' || userObject.location != location){
            throw new Error('User might have already voted or yet not approved to vote for the mentioned location. Check the viewUser for user details and status.');    
        }
        //Checking if the input choice matches with the given choices
        else if(!issues[choice]){
            throw new Error('Incorrect Choice for voting. Please use choice1, choice2 or choice3');

        }
        //If all the condtions are justified then incrementing the count of choices
        else{
            if(choice == 'choice1') count1++;
            if(choice == 'choice2') count2++;
            if(choice == 'choice3') count3++;

            //Changing the status to VOTED with the user details and timestamp
            userObject.state = status.voted,
            userObject.updatedBy = ctx.clientIdentity.getID(),
            userObject.updatedAt = ctx.stub.getTxTimestamp();
            

        //Converting the JSON object to a buffer and send it to blockchain for storage
        let dataBuffer = Buffer.from(JSON.stringify(userObject));
        await ctx.stub.putState(userKey,dataBuffer);
        
        //Returning the userObject
        return userObject;

        }




    }

}

//4. Count details for the choices
//voteCount

async voteCount(ctx, choice){

    //Checking if the input choice is the matching one
    if(!issues[choice]){
        throw new Error('Incorrect Choice for voting. Please use choice1, choice2 or choice3');
    }
    //Returning the voting count values
    else{
        if(choice == 'choice1') return count1;
        if(choice == 'choice2') return count2;
        if(choice == 'choice3') return count3;
    }

}

}
