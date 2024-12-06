
const createUpdateDeleteSelectedFields = {
  "id": true,
}

const unwantedFields = {
  _id: false
}

const orderWantedFields = {
  _id: false,
  order_id: true,
  user_id: true,
  provider_descriptor:true,
  provider_id: true,
  course_performance: true,
  invoice_link: true,
  total_price: true,
  items: {
    course_id: true,
    course_descriptor:true,
    creator_descriptor:true,
    content_metadata: true,
    // completion_percentage: true,
    // current_lesson: true,
    // status: true,
    ratings: true,
    course_completion_details: true,
  },
  payments: {
    status: true
  },
  fulfillment_status: true,
  createdAt: true
}

const getForAdmin = {
  _id: false,
  order_id: true,
  user_id: true,
  provider_descriptor: {
    name: true,
    images: true
  },
  students: true,
  provider_id: true,
  // course_performance: true,
  // invoice_link: true,
  // total_price: true,
  items: {
    course_id: true,
    course_descriptor:true,
    creator_descriptor:true,
    content_metadata:true,
    completion_percentage: true,
    is_certificate_available: true,
    current_lesson: true,
    // status: true,
    ratings: true,
    price: true,
    course_completion_details: {
      course_certificate: true
    },
  },
  payments: {
    status: true
  },
  fulfillment_status: true,
  createdAt: true
}


const cacheWantedFields = {
  _id: false,
  course_id: true,
  context: true,
  provider_id: true,
  category_ids: true,
  course_descriptor: true,
  creator_descriptor: true,
  provider_descriptor:true,
  fulfillments: true,
  total_price: true,
  ratings: true,
  // provider_performance: true,
  content_metadata: true,
  purchased_userIds: true
}


const CourseDetail = {
  id: true,
  course_id: true,
  order_id: true,
  user_id: true,
  provider_id: true,
  provider_descriptor: true,
  items: {
    course_descriptor: true,
    creator_descriptor: true,
    content_metadata: true,
    price: true
  },
  fulfillment_status: true,
  course_performance: true
};

const CourseOrderDetail = {
  id: true,
  order_id: true,
  user_id: true,
  np_name: true,
  context: true,
  provider_id: true,
  provider_descriptor: true,
  items: {
    course_id: true,
    course_descriptor: true,
    content_metadata: true,
    creator_descriptor: true,
    // course_outline: true,
    prelim_quiz: true,
    is_certificate_available: true,
    // category_ids: true,
    // fulfillment_ids: true,
    // fulfillments: true,
    price: true,
    quantity: true,
    course_materials: true,
    course_completion_details: true,
    // status: true,
    fulfillment_status: true,
    ratings: true,
    updated_at: true,
    // completion_percentage: true,
    // current_lesson: true
  },
  invoice_link: true,
  quote: true,
  fulfillments: true,
  billing: true,
  payments: true,
  fulfillment_status: true,
  is_enrolled: true,
  createdAt: true
};

const CertificateDetails = {
  order_id: true,
  user_id: true,
  items: {
    course_id: true,
    course_descriptor: true,
    course_completion_details: true
  },
  billing: {
    name: true,
    phone: true,
    email: true,
    address: true
  },
  total_price:true
}

const jobDetail = {
  _id: false,
  id: true,
  context: true,
  provider_id: true,
  order_id: true,
  provider_descriptor: true,
  job_id: true,
  job_descriptor: true,
  content_metadata: true,
  fulfillments: true,
  fulfillment_status: true,
  quantity: true,
  locations: true,
  saved_userIds: true,
  applied_userIds: true
};

export {
  createUpdateDeleteSelectedFields,
  unwantedFields,
  orderWantedFields,
  cacheWantedFields,
  CourseDetail,
  CourseOrderDetail,
  getForAdmin,
  CertificateDetails,
  jobDetail
}