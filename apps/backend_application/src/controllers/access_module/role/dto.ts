const createUpdateDeleteSelectedFields = {
  "id": true,
}

const getrole = {
  "id":true,
  "name": true,
}

const Get = {
  "id":true,                                
  "name":true,
  "description":true,    
  "is_active":true,                      
}

const GetAll = {
  "_id": false,
  "id":true,   
  "createdAt":true,                             
  "name":true,   
  "code": true,   
  "description": true,
  "is_active":true, 
  "company_id": true,
  "created_by_id": true,
  "role_assign_module": true
}

export {
  createUpdateDeleteSelectedFields,
  Get,
  GetAll,
  getrole
}