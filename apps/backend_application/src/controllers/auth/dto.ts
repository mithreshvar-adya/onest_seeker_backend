interface ProjectionFields {
  [key: string]: boolean;
}

 const GetUser: ProjectionFields = {
  id: true,
  first_name: true,
  middle_name: true,
  last_name: true,
  name: true,
  email: true,
  mobile_number: true,
  profile_image: true,
  dob: true,
  language_preference: true,
  age: true,
  profession: true,
  gender: true,
  nationality: true,
  address: true,
  otp: true,
  role: true,
  company_id: true,
  created_by_id: true,
  updated_by_id: true,
  is_active: true,
  status: true,
  _id: false
};

 const createUpdateDeleteSelectedFields: ProjectionFields = {
  id: true
};

 const unwantedFields: ProjectionFields = {
  _id: false,
  _collectionName: false,
  created_by_id: false,
  updated_by_id: false,
  createdAt: false,
  updatedAt: false
};

 const AdminUserList: ProjectionFields = {
  id: true,
  first_name: true,
  middle_name: true,
  last_name: true,
  name: true,
  email: true,
  mobile_number: true,
  profile_image: true,
  last_login_date: true,
  createdAt: true,
  is_active: true,
  status: true,
  _id: false
};




export {
  GetUser,
  createUpdateDeleteSelectedFields,
  unwantedFields,
  AdminUserList
}