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

const GetUser = {
    id: true,
    first_name: true,
    middle_name: true,
    last_name: true,
    name: true,
    email: true,
    mobile_number: true,
    dob: true,
    language_preference: true,
    gender: true,
    nationality: true,
    address: true,
    otp: true,
    roles: true,
    company_id: true,
    created_by_id: true,
    updated_by_id: true,
    is_active: true,
    status: true,
    _id: false
  };

  const CourseOrderDetail = {
    _id: false,
    course_id: true,
    category_ids: true,
    course_descriptor: true,
    provider_descriptor: {
      name:true,
      short_description:true,
      images:true,
      media:true
    },
    total_price: true,
    ratings: true,
    provider_performance: true,
    content_metadata: true
  };

  const jobDetail = {
    id: true,
    provider_id: true,
    order_id: true,
    provider_descriptor: {
      name: true,
      short_description: true,
      images: true,
      media: {
        mimetype: true,
        url: true,
      },
    },
    job_id: true,
    job_descriptor: {
      name: true,
      short_description: true,
      images: true,
      media: {
        mimetype: true,
        url: true,
      },
    },
    content_metadata: {
      academic_eligibility: [
        {
          name: true,
          code: true,
          value: true,
          display: true,
        },
      ],
      job_requirements: [
        {
          name: true,
          code: true,
          value: true,
          display: true,
        },
      ],
      job_responsibilities: [
        {
          name: true,
          code: true,
          value: true,
          display: true,
        },
      ],
      listing_details: [
        {
          name: true,
          code: true,
          value: true,
          display: true,
        },
      ],
      salary_info: [
        {
          name: true,
          code: true,
          value: true,
          display: true,
        },
      ],
      emp_details: [
        {
          name: true,
          code: true,
          value: true,
          display: true,
        },
      ],
      document: [
        {
          name: true,
          code: true,
          value: true,
          display: true,
        },
      ],
      required_docs: [
        {
          name: true,
          code: true,
          value: true,
          display: true,
        },
      ],
    },
    fulfillments: [
      {
        id: true,
        type: true,
      },
    ],
    quantity: {
      available: {
        count: true,
      },
    },
    locations: [
      {
        id: true,
        city: {
          name: true,
          code: true,
        },
        state: {
          name: true,
          code: true,
        },
      },
    ],
  };

  const getUserServerSettings = {
    id:true,
    code:true,
    logo:true,
    name:true,
    setting_type_id:true,
    setting_type:true,
    description:true,
    redirection_link:true,
    sections:true,
    company_id:true,
    is_active:true,
    status:true,
    documentation_link:true,
    banner_url:true,
    tag_text:true,
    createdAt:true,
    updatedAt:true,
}
  export {GetNotificationTemplate, GetUser, CourseOrderDetail, jobDetail,getUserServerSettings}