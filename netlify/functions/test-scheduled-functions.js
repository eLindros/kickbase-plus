const handler = async function(event, context) {
    console.log("Received event:", event)

    return {
        statusCode: 200,
    };
};

module.exports.handler = handler