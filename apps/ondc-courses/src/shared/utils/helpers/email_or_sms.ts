import { CourseCache, CourseOrder, JobCache, Jobs, NotificationHistory, NotificationTemplate, User, sendSMSUsingMSG91, sendEmailUsingMSG91, UserServerSettings } from "@adya/shared"
import { GlobalEnv } from "../../../config/env";
import { CourseOrderDetail, GetNotificationTemplate, GetUser, jobDetail, getUserServerSettings } from "./dto";
import { getLookupCodeId } from "./getlookupcodeid"

const notificationTemplate = NotificationTemplate.getInstance();
const user_model = User.getInstance();
const course_model = CourseOrder.getInstance();
const job_model = Jobs.getInstance();
const notificationHistory = NotificationHistory.getInstance();
const user_server_setting = UserServerSettings.getInstance();

const SendEmailOrSMS = async (template_name, core_user_id = 0, course_order_id = 0, job_order_id = 0, otp = "") => {
    try {
        const variable_details: any = {
            otp: otp,
            app_name: "Skillsetu",
            valid_min: "5"
        }
        let to_email = ""
        let to_mobile_number = ""

        const filterQuery = {
            $and: [
                {
                    "template_category": template_name
                },
                {
                    is_active: true
                }
            ]
        }
        console.log("Filter Query", filterQuery)
        // let resp = await GetNotificationTemplate(filterQuery)
        const select_fields = GetNotificationTemplate
        const resp = await notificationTemplate.findOneWithProjection(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, filterQuery, select_fields)


        if (!resp) {
            return
        }
        const template_details = JSON.parse(JSON.stringify(resp))
        let user_data = {}
        console.log("user id == ", core_user_id)

        let core_user_resp: any = {}

        if (core_user_id != 0) {
            const filterQuery = {
                id: core_user_id
            }

            // let core_user_resp = await get_core_user(filterQuery)
            const select_fields = GetUser
            core_user_resp = await user_model.readUser(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, filterQuery, select_fields)

            if (core_user_resp) {
                user_data = core_user_resp
                to_email = core_user_resp?.email
                to_mobile_number = core_user_resp?.mobile_number
                template_details.subject = template_details?.subject.replaceAll("[USER_NAME]", (core_user_resp.first_name != '' ? core_user_resp.first_name : core_user_resp?.email != '' ? core_user_resp.email : core_user_resp.mobile_number))
                template_details.subject = template_details?.subject.replaceAll("[APP_NAME]", "Skillsetu")
                template_details.description = template_details?.description.replaceAll("[USER_NAME]", (core_user_resp.first_name != '' ? core_user_resp.first_name : core_user_resp?.email != '' ? core_user_resp.email : core_user_resp.mobile_number))
                template_details.description = template_details?.description.replaceAll("[APP_NAME]", "Skillsetu")
                template_details.description = template_details?.description.replaceAll("[OTP]", otp)

                variable_details.user_name = core_user_resp?.first_name
            }
        }

        if (course_order_id != 0) {
            const filterQuery = {
                order_id: course_order_id
            }
            const select_fields = CourseOrderDetail
            const course_resp: any = await course_model.findOneWithProjection(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, filterQuery, select_fields)
            console.log(course_resp)
            if (course_resp) {
                template_details.subject = template_details.subject.replaceAll("[COURSE_NAME]", course_resp?.course_descriptor?.name)
                template_details.description = template_details.description.replaceAll("[COURSE_NAME]", course_resp?.course_descriptor?.name)
                // template_details.description = template_details.description.replaceAll("[ORDER_NUMBER]",order_number)
                variable_details.course_name = course_resp?.course_descriptor?.name

            }
        }

        if (job_order_id != 0) {
            const filterQuery = {
                order_id: job_order_id
            }
            const select_fields = jobDetail;
            const job_resp = await job_model.findOneWithProjection(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, filterQuery, select_fields)

            if (job_resp) {
                template_details.subject = template_details.subject.replaceAll("[JOB_TITLE]", job_resp?.job_descriptor?.name)
                template_details.description = template_details.description.replaceAll("[JOB_TITLE]", job_resp?.job_descriptor?.name)
                template_details.description = template_details.description.replaceAll("[COMPANY_NAME]", job_resp?.provider_descriptor?.name)

                variable_details.job_role = job_resp?.job_descriptor?.name
                variable_details.company_name = job_resp?.provider_descriptor?.name
            }
        }
        //  const notification_history_data = {
        //         message: template_details.description,
        //         subject: template_details.subject,
        //         user_id: core_user_id,
        //         user_details: core_user_resp,
        //         // created_at: new Date()
        //     }
        //     console.log(notification_history_data)
        //     // await CreateNotificationHistory(notification_history_data)
        //     await notificationHistory.createNotificationHistory(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, notification_history_data)



        // -------------- user server settings --------------------




        const mobileRegex = /^[0-9]{10}$/;
        const emailRegex = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+/;
        if (template_details?.message_type == "EMAIL" && emailRegex.test(to_email)) {
            console.log("email-------------------", to_email);

            const filterQuery_ = {
                id: core_user_id
            }
            const auth_select_fields = GetUser
            const core_user_resp = await user_model.readUser(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, filterQuery_, auth_select_fields)

            const setting_type_id = await getLookupCodeId('SERVER_SETTING_TYPE', 'EMAIL')
            const server_query = {
                // company_id:template_details?.company_id,
                setting_type_id: setting_type_id,
                status: "ACTIVATED",
                is_active: true
            }
            // console.log("server_query",server_query);

            const server_settings_fields = getUserServerSettings
            const user_server_settings_details = await user_server_setting.findOneWithProjection(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, server_query, server_settings_fields)



            // console.log("=====================================0",template_details)
            // console.log("user_server_settings_details---------------------",user_server_settings_details)

            if (to_email != "" && to_email != null && user_server_settings_details) {

                switch (user_server_settings_details?.code) {
                    case 'MSG91_EMAIL': {
                        const msg91_auth_key = user_server_settings_details.sections.flatMap(section => section.fields)
                            .find(field => field.env_key === "MSG91_AUTH_KEY")
                        const msg91_email_url = user_server_settings_details.sections.flatMap(section => section.fields)
                            .find(field => field.env_key === "MSG91_EMAIL_URL")
                        const msg91_email = user_server_settings_details.sections.flatMap(section => section.fields)
                            .find(field => field.env_key === "MSG91_EMAIL")
                        const msg91_domain = user_server_settings_details.sections.flatMap(section => section.fields)
                            .find(field => field.env_key === "MSG91_DOMAIN")
                        const msg91_from_name = user_server_settings_details.sections.flatMap(section => section.fields)
                            .find(field => field.env_key === "MSG91_FROM_NAME")

                        await sendEmailUsingMSG91(template_details?.email_template_id, msg91_from_name?.value, msg91_email?.value, msg91_domain?.value, msg91_auth_key?.value, msg91_email_url?.value, to_email, "", variable_details)
                        break;
                    }

                }

            }

            const notification_history_data = {
                message: template_details.description,
                subject: template_details.subject,
                user_id: core_user_id,
                user_details: core_user_resp,
                // created_at: new Date()
            }
            await notificationHistory.createNotificationHistory(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, notification_history_data)

        }
        else if (template_details?.message_type == "SMS" && mobileRegex.test(to_mobile_number)) {
            const filterQuery_ = {
                id: core_user_id
            }
            const auth_select_fields = GetUser
            const core_user_resp = await user_model.readUser(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, filterQuery_, auth_select_fields)
            console.log("SMS", otp)
            const sms_details = {}

            // if(to_mobile_number!=""){
            //     sms_details = await  sendSMSUsingMSG91(template_details?.sms_template_id,to_mobile_number, order_id,"","https://logistics.zionmart.in/",otp)
            // }
            const setting_type_id = await getLookupCodeId('SERVER_SETTING_TYPE', 'SMS')
            const server_query = {
                // company_id:template_details?.company_id,
                setting_type_id: setting_type_id,
                status: "ACTIVATED",
                is_active: true
            }
            const server_settings = getUserServerSettings
            const user_server_settings_details = await user_server_setting.getUserServerSettings(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, server_query, server_settings)


            if (to_mobile_number != "" && to_mobile_number != null && user_server_settings_details) {

                const message = ""
                switch (user_server_settings_details?.code) {

                    case 'MSG91_SMS': {
                        const msg91_auth_key = user_server_settings_details.sections.flatMap(section => section.fields)
                            .find(field => field.env_key === "MSG91_AUTH_KEY")
                        const msg91_url = user_server_settings_details.sections.flatMap(section => section.fields)
                            .find(field => field.env_key === "MSG91_URL")
                        await sendSMSUsingMSG91(template_details?.sms_template_id, to_mobile_number, msg91_auth_key?.value, msg91_url?.value, "", variable_details)
                        break;
                    }
                }

            }

            const notification_history_data = {
                message: template_details.description,
                subject: template_details.subject,
                user_id: core_user_id,
                user_details: core_user_resp
            }
            await notificationHistory.createNotificationHistory(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, notification_history_data)
            console.log("SMS SENT SUCCESSFULLY ===================>", sms_details)
        } else {
            const filterQuery_ = {
                id: core_user_id
            }
            const auth_select_fields = GetUser
            const core_user_resp = await user_model.readUser(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, filterQuery_, auth_select_fields)
            console.log("EMAIL AND SMS OTP :- ", otp, to_mobile_number)

            let setting_type_id = await getLookupCodeId('SERVER_SETTING_TYPE', 'SMS')
            let server_query = {
                // company_id:template_details?.company_id,
                setting_type_id: setting_type_id,
                status: "ACTIVATED",
                is_active: true
            }
            // console.log(server_query)
            const server_settings = getUserServerSettings
            let user_server_settings_details = await user_server_setting.getUserServerSettings(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, server_query, server_settings)
            //  console.log("user server settings = >",JSON.stringify(user_server_settings_details)) 
            // console.log("user_server_settings_details =>",JSON.stringify(user_server_settings_details))
            if (to_mobile_number != "" && to_mobile_number != null && user_server_settings_details) {

                const message = ""
                switch (user_server_settings_details?.code) {

                    case 'MSG91_SMS': {
                        const msg91_auth_key = user_server_settings_details.sections.flatMap(section => section.fields)
                            .find(field => field.env_key === "MSG91_AUTH_KEY")
                        const msg91_url = user_server_settings_details.sections.flatMap(section => section.fields)
                            .find(field => field.env_key === "MSG91_URL")
                        await sendSMSUsingMSG91(template_details?.sms_template_id, to_mobile_number, msg91_auth_key?.value, msg91_url?.value, "", variable_details)
                        break;
                    }
                }

            }


            // let email_details = await GetEmailTemplateSetting(filterQuery)
            // if(to_mobile_number!=""){
            //     let sms_details = await  sendSMSUsingMSG91(template_details?.sms_template_id,to_mobile_number, order_id,"https://logistics.zionmart.in/",otp)
            //     console.log("sms_details == > ",JSON.stringify(sms_details))
            // }

            setting_type_id = await getLookupCodeId('SERVER_SETTING_TYPE', 'EMAIL')
            server_query = {
                // company_id:template_details?.company_id,
                setting_type_id: setting_type_id,
                status: "ACTIVATED",
                is_active: true
            }

            user_server_settings_details = await user_server_setting.getUserServerSettings(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, server_query, server_settings)


            // console.log("=====================================0",template_details)
            if (to_email != "" && to_email != null && user_server_settings_details) {

                switch (user_server_settings_details?.code) {
                    case 'MSG91_EMAIL': {
                        const msg91_auth_key = user_server_settings_details.sections.flatMap(section => section.fields)
                            .find(field => field.env_key === "MSG91_AUTH_KEY")
                        const msg91_email_url = user_server_settings_details.sections.flatMap(section => section.fields)
                            .find(field => field.env_key === "MSG91_EMAIL_URL")
                        const msg91_email = user_server_settings_details.sections.flatMap(section => section.fields)
                            .find(field => field.env_key === "MSG91_EMAIL")
                        const msg91_domain = user_server_settings_details.sections.flatMap(section => section.fields)
                            .find(field => field.env_key === "MSG91_DOMAIN")
                        const msg91_from_name = user_server_settings_details.sections.flatMap(section => section.fields)
                            .find(field => field.env_key === "MSG91_FROM_NAME")

                        await sendEmailUsingMSG91(template_details?.email_template_id, msg91_from_name?.value, msg91_email?.value, msg91_domain?.value, msg91_auth_key?.value, msg91_email_url?.value, to_email, "", variable_details)
                        break;
                    }

                }

            }
            //notification history - final desc, final sub
            // to_email = "kausic.m@adya.ai"
            // if(to_email!=""){
            //     await SendEmailBasedOnServerSettings(email_details?.host_name, email_details?.port, email_details?.user_name, email_details?.password, to_email,template_details?.subject, template_details?.description)
            // }


            const notification_history_data = {
                message: template_details.description,
                subject: template_details.subject,
                user_id: core_user_id,
                user_details: core_user_resp,
                // created_at: new Date()
            }
            await notificationHistory.createNotificationHistory(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, notification_history_data)
        }
    }
    catch (err) {
        console.log("error =========>>>>", err)
    }
}

export { SendEmailOrSMS }