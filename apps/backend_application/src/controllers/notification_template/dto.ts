const GetNotificationTemplate = {
  id: true,
  template_category: true,
  subject: true,
  description: true,
  sms_description: true,
  user_type_id: true,
  user_type: true,
  message_type: true,
  sms_template_id: true,
  email_template_id: true,
  created_by_id: true,
  created_by: true,
  updated_by_id: true,
  updated_by: true,
  company_id: true,
  company_details: true,
  is_active: true,
  createdAt: true,
  updatedAt: true,
};

const createUpdateDeleteSelectedFields = {
  id: true,
}


export {
  GetNotificationTemplate,
  createUpdateDeleteSelectedFields,
}
