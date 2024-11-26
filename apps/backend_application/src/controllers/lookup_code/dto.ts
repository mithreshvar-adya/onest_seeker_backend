const createUpdateDeleteSelectedFields = {
    "id": true,
  }
  
  const GetLookupType = {
    "id": true,
    "display_name": true,
    "lookup_type": true,
   "is_active" :true,
  };
  
  
  const GetLookupCode = {
    "id": true,
    "lookup_type_id":true,
    "display_name" :true,
    "lookup_code" :true,
    "is_active" :true,
  };
  
  export {
    createUpdateDeleteSelectedFields,
    GetLookupType,
    GetLookupCode
  }