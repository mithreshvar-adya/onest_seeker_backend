
const createUpdateDeleteSelectedFields = {
  id: true,
}

const getServerSettings = {
  id:true,
  code:true,
  logo:true,
  name:true,
  setting_type_id:true,
  setting_type:true,
  description:true,
  redirection_link:true,
  sections:true,
  documentation_link:true,
  banner_url:true,
  tag_text:true,
  createdAt:true,
  updatedAt:true,
}

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


export {
  createUpdateDeleteSelectedFields,
  getUserServerSettings,
  getServerSettings
}
