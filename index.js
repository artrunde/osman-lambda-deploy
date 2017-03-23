console.log('Loading function');

var AWS = require('aws-sdk');
var lambda = new AWS.Lambda();

exports.handler = function(event, context) {
    
    console.log(event);
    
    var key             	= event.Records[0].s3.object.key // Filename with extension
    var bucket          	= event.Records[0].s3.bucket.name // Get bucket name
    var functionName        = key.slice(0, -4) // Get function name
    var functionEnvironment = functionName.slice(-3) // Get function env
    var environment         = context.functionName.slice(-3);
      
    console.log("Uploaded to lambda function: " + functionName + " from bucket:" + bucket);
   
   
    var getParams = {
        FunctionName: functionName
    };
    
    var updateParams = {
        FunctionName: functionName,
        S3Key: key,
        S3Bucket: bucket
    };
    
     if( functionEnvironment != environment ) {
         
        console.log("Uploaded function environment " + functionEnvironment + " does not match deploy environment: " + environment);
        
        context.fail("Uploaded function environment " + functionEnvironment + " does not match deploy environment: " + environment);
        
    } else {
    
        lambda.getFunction(getParams, function(err, data) {
            
            if (err) {
                
                console.log("Function " + functionName + " does not exist!..." + functionEnvironment + " " + environment);
                
                console.log(err, err.stack);
                context.fail(err);
                
            } else {
                
                console.log("Function exists, updating...");
                
                lambda.updateFunctionCode(updateParams, function(err, data) {
                    
                    if (err) {
                        console.log("Error while updating...");
                        console.log(err, err.stack);
                        context.fail(err);
                    } else {
                        console.log("Success while updating...");
                        console.log(data);
                        context.succeed(data);
                    }
                });
                
            }
            
        });
        
    }
};
