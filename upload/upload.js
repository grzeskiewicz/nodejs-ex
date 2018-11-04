const aws = require('aws-sdk');
//app.use(express.static('./public'));
const S3_BUCKET = process.env.S3_BUCKET_NAME;
aws.config.region = 'us-east-1';

var signin=function(req,res) {
  console.log('hahaha',S3_BUCKET);
    const s3 = new aws.S3();
    const fileName = req.query['file-name'];
    const fileType = req.query['file-type'];
    const s3Params = {
        Bucket: S3_BUCKET,
        Key: fileName,
        Expires: 60,
        ContentType: fileType,
        ACL: 'public-read'
    };

    s3.getSignedUrl('putObject', s3Params, (err, data) => {
        if (err) {
            console.log(err);
            return res.end();
        }
        const returnData = {
            signedRequest: data,
            url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
        };
        console.log(returnData);
        res.write(JSON.stringify(returnData));
        res.end();
    });
}

module.exports= {signin} ;
