const jobCacheDetail = {
  id: true,
  provider_id: true,
  provider_descriptor: true,
  job_id: true,
  job_descriptor: true,
  fulfillments: true,
  locations: true,
  content_metadata: true,
  saved_userIds: true,
  applied_userIds: true,
  context: true,
  quantity: true,
};

const adminJobListing = {
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
  time:true
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
  applied_userIds: true,
  time:true,
  user_id:true
};

export { jobCacheDetail, jobDetail, adminJobListing };
