'use-strict';

const {Contract} = require("fabric-contract-api");

//Defining the statuses of the logoical working statuses
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

class officerContract extends Contract{

    constructor(){
        super('org.officer-dashboard.officer');

    }


//A. Intantiate Function which is used to trigger or invoke function while deploying or committing

async instantiate(ctx){

    console.log("Officer Contract was successfully deployed.");

}

//1. Approving user to be eligible to vote
//approveUser
async approveUser(ctx, name, voterID, location){

    //Creating the composite key for the user to check pre-existance
    const userKey = ctx.stub.createCompositeKey('voting-registration.user', [name, voterID, location]);
    let userBuffer = await ctx.stub.getState(userKey).catch(err => console.log(err));

        //Condition check if user is existing and allowed to vote for the location or not
        if(userBuffer.length != 0){
            throw new Error('User with details already exist on the network. Name:' +name+ ' voterID:' +voterID+ ' location:' +location);
        }
        else {
            //Taking out the user data back to the JSON format
            let userObject = JSON.parse(userBuffer.toString());
            
            //Checking if user is approved to vote for the location or already voted
            if(userObject.state == 'APPROVED'){
                throw new Error('User is already approved for voting. Check the viewUser for user details and status.');    
            }
            else{

            //Changing the status to VOTED with the user details and timestamp
            userObject.state = status.approved,
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



//2. To View the user details
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

//3. Count details for the choices
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