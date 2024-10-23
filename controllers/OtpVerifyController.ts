import { Request, Response } from 'express';
import { Otp } from '../models/userModel'
import axios from 'axios'
const FormData = require('form-data');


export const sendOtp = async (req: Request, res: Response) => {
  const { contactNumber } = req.body
  if (!contactNumber) {
    console.error('Mobile number is required');
    return { success: false, message: 'Mobile number is required' };
  }

  try {
    const otp = Math.floor(10000 + Math.random() * 90000);
    const smsMessage = `Welcome to Dosso21! Use ${otp} to complete your registration. This code is valid for 10 minutes.\nDosso21 Services Private Limited`;

    const formData = new FormData();
    formData.append('sender_id', 'DOSSOS');
    formData.append('mobile_no', contactNumber);
    formData.append('message', smsMessage);
    formData.append('dlt_template_id', '1207171714044829349');

    console.log("Formdata:", formData);


    const headers = {
      ...formData.getHeaders(),
      'Authorization': 'Bearer o9eYsyt3_musEsKcMTobrfvWl3Eies0LyieQfvKXW_iuRPtnCZEwC7nh3H3Rf7XC',
    };

    const response = await axios.post('http://sms.jaipursmshub.in/api_v2/message/send', formData, { headers });

    // Log the response
    console.log('Status:', response.status);
    console.log('Data:', response.data);

    if (response.status === 200) {
      let otpEntry = await Otp.findOne({ where: { contactNumber } });

      if (otpEntry) {
        otpEntry.otp = otp;
        await otpEntry.save();
      } else {
        console.log("Contact number:", contactNumber)
        console.log("Contact number OTP:", otp)
        otpEntry = await Otp.create({ contactNumber, otp });
      }

      return res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP',
        data: response.data,
      });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({ success: false, message: 'Error sending OTP' });
  }
};



export const verifyOtp = async (req: Request, res: Response) => {
  const { contactNumber, otp } = req.body;

  try {
    const otpEntry = await Otp.findOne({
      where: {
        contactNumber: contactNumber,
      },
    });

    if (!otpEntry) {
      return res.status(404).json({ message: 'OTP not found for this contact number.' });
    }

    if (otpEntry.otp === parseInt(otp, 10)) {
      await Otp.destroy({ where: { contactNumber: contactNumber } });

      return res.status(200).json({ message: 'OTP verified successfully!' });
    } else {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};