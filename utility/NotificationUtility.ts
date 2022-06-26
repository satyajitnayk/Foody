const Twilio = require('twilio');
// Email

// notification

// OTP
export const GenerateOtp = () => {
  const otp = Math.floor(Math.random() * 900000 + 100000);
  let expiry = new Date(Date.now() + 1000 * 60 * 30);
  return { otp, expiry };
};

export const OnRequestOTP = async (otp: number, toPhoneNumber: string) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = Twilio(accountSid, authToken);

  const response = await client.messages.create({
    body: `Your OTP is ${otp}`,
    from: process.env.TWILIO_PHONE_NUMBER ?? '',
    to: `+91${toPhoneNumber}`,
  });
  return response;
};

// Payment notification or emails
