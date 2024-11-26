import axios from "axios";

//================================== for email sending =====================

async function sendEmailUsingMSG91(templateId: any,from_name: any,from_email: any,domain: any,auth_key: any,email_url: any,recipientEmail: any, shortUrl: any,  variable_details:any) {
    try {
        console.log("sendEmailUsingMSG91---------",templateId,from_name,from_email,domain,auth_key,email_url,recipientEmail, shortUrl);
        
        console.log("Sending EMAIL...",variable_details);
        
        const url = email_url; // Set the MSG91 email sending endpoint

        const data:any = {
            recipients: [
                {
                    to: [{ email: recipientEmail  }],
                    variables: { 
                        OTPCode: variable_details?.otp || '',
                        TimeLimit:variable_details?.valid_min || '',
                        AppName: variable_details?.app_name || '',
                        UserName: variable_details?.user_name || '',
                        COURSENAME: variable_details?.course_name || '',
                        USER_NAME: variable_details?.student_name || '',
                        ORDER_NUMBER: variable_details?.order_number || '',
                        DATE: variable_details?.course_created_time || '',
                        YourName: variable_details?.user_name || '',
                        JobTitle:variable_details?.job_role||'',
                        CompanyName:variable_details?.company_name || '',
                        ApplicantName:variable_details?.user_name||''
                     }
                }
            ],
            from: {
                name: from_name,
                email:from_email
            },
            domain: domain,
           
            template_id: templateId
        };


        if (shortUrl) {
            data.short_url = '1';
        } else {
            data.short_url = '0';
        }

        const headers = {
            'accept': 'application/json',
            'authkey':auth_key, // Set your MSG91 email auth key
            'content-type': 'application/json'
        };
        console.log("email data == >",JSON.stringify(data))
        const response = await axios.post(url, data, { headers });

        console.log('Email sent successfully:', response.data);
        return response.data;
    } catch (error:any) {
        console.log("error-----------------", error);
        
        console.error('Error sending email:', error.response ? error.response.data : error.message);
        return error.response.data ;
    }
}



//================================== for sms sending =====================

async function sendSMSUsingMSG91(
    templateId: any, 
    recipientMobile: string, 
    auth_key: any, 
    mobile_url: any, 
    shortUrl: any, 
    variable_details: any
) {
    try {
        console.log("Sending SMS...",variable_details);

        const url = mobile_url;

        // Default values for var0, var1, and var2
        let var0: any = '';
        let var1: any = '';
        let var2: any = '';

        // Helper function to check non-empty and non-null values
        const isValid = (value: any) => value !== undefined && value !== null && value !== '';

        // Mapping variable details based on available data
        const mappings = [
            { condition: isValid(variable_details?.otp), values: [variable_details.app_name, variable_details.otp, variable_details.valid_min] },
            { condition: isValid(variable_details?.welcome), values: [variable_details.app_name] },
            // { condition: isValid(variable_details?.course_created_time), values: [variable_details.student_name,variable_details.course_name, variable_details.app_name] },
            // { condition: isValid(variable_details?.applicant_name), values: [variable_details.applicant_name, variable_details.job_role, variable_details.order_id] },
            { condition: isValid(variable_details?.course_name), values: [variable_details.course_name, variable_details.app_name] },
            { condition: isValid(variable_details?.job_role), values: [variable_details.job_role, variable_details.company_name, variable_details.app_name] }
        ];

        // Assign the first valid set of values
        for (const mapping of mappings) {
            if (mapping.condition) {
                [var0, var1, var2] = mapping.values;
                break;  // Break after finding the first matching condition
            }
        }

        const data = {
            template_id: templateId,
            short_url: shortUrl ? '1' : '0', // Convert to '1' (On) or '0' (Off) as string
            recipients: [
                {
                    mobiles: "91" + recipientMobile,
                    'var': var0,
                    'var1': var1, 
                    'var2': var2,
                }
            ]
        };

        console.log("SMS payload == >", JSON.stringify(data));

        const headers = {
            accept: 'application/json',
            authkey: auth_key,
            'content-type': 'application/json',
        };

        const options = {
            method: 'POST',
            url: url,
            headers: headers,
            data: data,
        };

        const response = await axios(options);
        console.log('SMS sent successfully:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Error sending SMS:', error.response ? error.response.data : error.message);
        return error.response?.data;
    }
}


export {
    sendSMSUsingMSG91,
    sendEmailUsingMSG91
}