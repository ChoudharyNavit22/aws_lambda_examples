'use strict';

const fetch = require("node-fetch");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

module.exports.uploadImage = (event, context, callback) => {
  console.log(`event: ${event.body}`)
  let requestBody = JSON.parse(event.body);
  console.log(`requestBody: ${typeof requestBody}, ${requestBody.photoUrl}, ${requestBody.key}`)
  fetch(requestBody.photoUrl)
    .then((response) => {
      if(response.ok) {
        return response;
      }
      return Promise.reject(new Error(`Failed to fetch ${response.url}: ${response.status} ${response.statusText}`));
    })
    .then(response => response.buffer())
    .then(buffer => (
      s3.putObject({
        Bucket: process.env.BUCKET,
        Key: requestBody.key,
        Body: buffer,
      }).promise()
    ))
    .then(function(response) {
      console.log(`Image was uploaded and resized`);
      callback(null, {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*', // Required for CORS support to work
          },
          body: JSON.stringify({
            statusCode: 200,
            data: response,
          })
      });
  }).catch(error => console.log(error));
};
