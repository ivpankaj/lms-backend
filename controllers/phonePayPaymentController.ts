import  crypto  from 'crypto';
import  axios from 'axios';
import {Request,Response} from 'express';
// const {salt_key, merchant_id} = require('./secret')

export const PhonePayPaymentInitiate = async (req : Request, res : Response) => {
    try {
        const merchant_id = "M228QYEMQERGS"
        const salt_key = 'b7dbb332-a97f-4dfc-b6eb-64d397216248'

        const merchantTransactionId = req.body.transactionId;
        const data = {
            merchantId: merchant_id,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: req.body.MUID,
            name: req.body.name,
            amount: req.body.amount * 100,
            // redirectUrl: `http://localhost:5000/api/status/${merchantTransactionId}`,
            redirectUrl: `https://skillontime.com`,
            redirectMode: 'POST',
            mobileNumber: req.body.number,
            paymentInstrument: {
                type: 'PAY_PAGE'
            },
        };
        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        const keyIndex = 1;
        const string = payloadMain + '/pg/v1/pay' + salt_key;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + '###' + keyIndex;

        const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay"
                         
        // const prod_URL =  'https://api.phonepe.com/apis/hermes'
        const options = {
            method: 'POST',
            url: prod_URL,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
            },
            data: {
                request: payloadMain
            }
        };

        axios.request(options).then(function (response) {
            // console.log(response.data)
            console.log('data url ', response.data.data.instrumentResponse.redirectInfo.url)
            return res.status(200).send({ redirectUrl : response.data.data.instrumentResponse.redirectInfo.url})
        })
        .catch(function (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('Request data:', error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error message:', error.message);
            }
            res.status(500).send({
                message: 'Error contacting payment gateway',
                success: false
            });
        });

    } catch (error) {
        res.status(500).send({
            message: error,
            success: false
        })
    }
}




export const checkStatus = async (req: Request, res: Response) => {
    const salt_key = 'b7dbb332-a97f-4dfc-b6eb-64d397216248';
  
    const { transactionId, merchantId } = req.body; // Corrected access
  
    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${transactionId}` + salt_key;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + '###' + keyIndex;
  
    const options = {
      method: 'GET',
      url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${transactionId}`,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': merchantId
      }
    };
  
    try {
      const response = await axios.request(options);
      const url = response.data.success ? 'http://localhost:3000/success' : 'http://localhost:3000/failure';
      res.redirect(url);
    } catch (error) {
      console.error(error);
      res.redirect('http://localhost:3000/failure');
    }
  };
  

// export const checkStatus = async(req :Request, res : Response) => {
//     const salt_key = 'b7dbb332-a97f-4dfc-b6eb-64d397216248'

//     const merchantTransactionId = res.req.body.transactionId
//     const merchantId = res.req.body.merchantId

//     const keyIndex = 1;
//     const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
//     const sha256 = crypto.createHash('sha256').update(string).digest('hex');
//     const checksum = sha256 + "###" + keyIndex;

//     const options = {
//     method: 'GET',
//     url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
//     headers: {
//         accept: 'application/json',
//         'Content-Type': 'application/json',
//         'X-VERIFY': checksum,
//         'X-MERCHANT-ID': `${merchantId}`
//     }
//     };

//     // CHECK PAYMENT TATUS
//     axios.request(options).then(async(response) => {
//         if (response.data.success === true) {
//             const url = `http://localhost:3000/success`
//             return res.redirect(url)
//         } else {
//             const url = `http://localhost:3000/failure`
//             return res.redirect(url)
//         }
//     })
//     .catch((error) => {
//         console.error(error);
//     });
// };


