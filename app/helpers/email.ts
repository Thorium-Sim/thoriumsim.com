import nodemailer from "nodemailer";
import * as aws from "@aws-sdk/client-ses";
const ses = new aws.SES({
  apiVersion: "2010-12-01",
  region: "us-east-1",
});
export let emailSender = nodemailer.createTransport({
  SES: {ses, aws},
});
