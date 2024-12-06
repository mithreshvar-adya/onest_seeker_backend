import service from './service';
import { apiResponse, JsonWebToken } from '@adya/shared';

const newService = service.getInstance();
const jwtInstance = new JsonWebToken();

class Handler {
  private static instance: Handler | null = null;

  // Private constructor to prevent direct instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  // Static method to get the singleton instance
  public static getInstance(): Handler {
    if (this.instance === null) {
      this.instance = new Handler();
    }
    return this.instance;
  }

  async createBulkLookupCode(req, res, next){
    try {
      const payload = req?.body;
      if (!payload || !payload.lookup_codes) {
        return res.status(400).send('Invalid payload');
      }

      let resp;
      payload.lookup_codes.forEach(async(code) => {
        console.log(`Lookup Code: ${code.lookup_code}, Display Name: ${code.display_name}`);
        resp = await newService.createLookupCode(code);
      });
      return res.status(200).json(apiResponse.SUCCESS_RESP(payload, 'LookupCode Created Successfully'));
    } catch (err) {
      console.log('Handler Error ===========>>>> ', err);
      return res.status(500).json(apiResponse.FAILURE_RESP({},
          {name: 'Handler Error',message: `${err}`},
          'Handler error'
        )
      );
    }
  }

  async createLookupCode(req, res, next) {
    try {
      const { body } = req;
      const resp = await newService.createLookupCode(body);
      return res
        .status(200)
        .json(
          apiResponse.SUCCESS_RESP(resp, 'LookupCode Created Successfully')
        );
    } catch (err) {
      console.log('Handler Error ===========>>>> ', err);
      return res.status(500).json(
        apiResponse.FAILURE_RESP(
          {},
          {
            name: 'Handler Error',
            message: `${err}`,
          },
          'Handler error'
        )
      );
    }
  }

  async getLookupCode(req, res, next) {
    try {
      const { params } = req;
      const resp = await newService.get({ id: params?.id });
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, 'success'));
    } catch (err) {
      console.log('Handler Error ===========>>>> ', err);
      return res.status(500).json(
        apiResponse.FAILURE_RESP(
          {},
          {
            name: 'Handler Error',
            message: `${err}`,
          },
          'Handler error'
        )
      );
    }
  }

  async listLookupCode(req, res, next) {
    try {
      const { query } = req;
      const filterQuery = {lookup_type: query.lookup_type};
      const page_no = parseInt(query?.page_no as string) || 1;
      const per_page = parseInt(query?.per_page as string) || 10;
      const sort = {};
      const resp = await newService.list(filterQuery, page_no, per_page, sort);
      return res
        .status(200)
        .json(
          apiResponse.SUCCESS_RESP_WITH_PAGINATION(
            resp?.pagination,
            resp?.data,
            'Data retrieved Successfully'
          )
        );
    } catch (err) {
      console.log('Handler Error ===========>>>> ', err);
      return res.status(500).json(
        apiResponse.FAILURE_RESP(
          {},
          {
            name: 'Handler Error',
            message: `${err}`,
          },
          'Handler error'
        )
      );
    }
  }

  async updateLookupCode(req, res, next) {
    try {
      const { body, params } = req;
      const resp = await newService.get({ id: params?.id });
      if (resp) {
        const query = { id: resp?.id };
        await newService.update(query, body);
      } else {
        return res.status(500).json(
          apiResponse.FAILURE_RESP(
            {},
            {
              name: 'Record Not Found Error',
              message: `Record Not Found`,
            },
            'Record Not Found'
          )
        );
      }
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, 'success'));
    } catch (err) {
      console.log('Handler Error ===========>>>> ', err);
      return res.status(500).json(
        apiResponse.FAILURE_RESP(
          {},
          {
            name: 'Handler Error',
            message: `${err}`,
          },
          'Handler error'
        )
      );
    }
  }

  async deleteLookupCode(req, res, next) {
    try {
      const { params } = req;
      const resp = await newService.delete({ id: params?.id  });
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, 'success'));
    } catch (err) {
      console.log('Handler Error ===========>>>> ', err);
      return res.status(500).json(
        apiResponse.FAILURE_RESP(
          {},
          {
            name: 'Handler Error',
            message: `${err}`,
          },
          'Handler error'
        )
      );
    }
  }

  async createEnv(req, res) {
    try {
      const { body } = req;
      const env = await newService.getEnv(body.CODE);
      console.log(env)
      if (env) {
        return res.status(400).json(apiResponse.FAILURE_RESP({}, {
          name: "Env already exisis error",
          message: "Env already exisis"
        }, "Env already exisis error"))
      }
      const resp = await newService.createEnv(body);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, 'success'));
    } catch (err) {
      console.log('Handler Error ===========>>>> ', err);
      return res.status(500).json(
        apiResponse.FAILURE_RESP(
          {},
          {
            name: 'Handler Error',
            message: `${err}`,
          },
          'Handler error'
        )
      );
    }
  }

  async updateEnv(req, res) {
    try {
      const { body } = req;
      const env = await newService.getEnv(body.CODE);
      console.log(env)
      if (!env) {
        return res.status(404).json(apiResponse.FAILURE_RESP({}, {
          name: "Env not found error",
          message: "Env not found"
        }, "Env not found error"))
      }
      const query = {
        CODE: env.CODE
      }

      const resp = await newService.updateEnv(query, body);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, 'success'));

    } catch (err) {
      console.log('Handler Error ===========>>>> ', err);
      return res.status(500).json(
        apiResponse.FAILURE_RESP(
          {},
          {
            name: 'Handler Error',
            message: `${err}`,
          },
          'Handler error'
        )
      );
    }
  }

  // async updateLookupCode(req, res, next) {
  //     try {
  //         let { body, params } = req
  //         let getLookupCode = await newService.getLookupCode({ id: parseInt(params?.id) })
  //         if(getLookupCode){
  //             let query={
  //                 id:getLookupCode?.id
  //             }
  //            let response= await newService.updateLookupCode(query,body)
  //             return res.status(200).json(apiResponse.SUCCESS_RESP(response, "LookupCode Updated Successfully"))
  //         }else{
  //             return res.status(500).json(apiResponse.FAILURE_RESP({}, {
  //                 name: "Record Not Found Error",
  //                 message: `Record Not Found`
  //             }, "Record Not Found"))
  //         }
  //     } catch (err) {
  //         console.log("Handler Error ===========>>>> ", err)
  //         return res.status(500).json(apiResponse.FAILURE_RESP({}, {
  //             name: "Handler Error",
  //             message: `${err}`
  //         }, "Handler error"))
  //     }
  // }

  // async listLookupCode(req, res, next) {
  //     try {
  //         let {query } = req
  //         let filterQuery={}
  //         let page_no = parseInt(query?.page_no) || 1;
  //         let per_page = parseInt(query?.per_page) || 10;
  //         let sort = [
  //             { "createdAt": -1 },
  //             { "updatedAt": -1 },
  //         ]
  //         let resp = await newService.listLookupCode(filterQuery,page_no,per_page,sort)
  //         return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination,resp?.data, "LookupCodes Retrieved Successfully"))
  //     } catch (err) {
  //         console.log("Handler Error ===========>>>> ", err)
  //         return res.status(500).json(apiResponse.FAILURE_RESP({}, {
  //             name: "Handler Error",
  //             message: `${err}`
  //         }, "Handler error"))
  //     }
  // }
  // async deleteLookupCode(req, res, next) {
  //     try {
  //         let {  params } = req
  //         let getLookupCode = await newService.getLookupCode({ id: parseInt(params?.id) })
  //         if(getLookupCode){
  //             let query={
  //                 id:getLookupCode?.id
  //             }
  //             let Delete = await newService.deleteLookupCode(query)
  //             return res.status(200).json(apiResponse.SUCCESS_RESP(Delete, "LookupCode Deleted Successfully"))
  //         }else{
  //             return res.status(500).json(apiResponse.FAILURE_RESP({}, {
  //                 name: "Record Not Found Error",
  //                 message: `Record Not Found`
  //             }, "Record Not Found"))
  //         }

  //     } catch (err) {
  //         console.log("Handler Error ===========>>>> ", err)
  //         return res.status(500).json(apiResponse.FAILURE_RESP({}, {
  //             name: "Handler Error",
  //             message: `${err}`
  //         }, "Handler error"))
  //     }
  // }

  // async listLookupCodeByLookupType(req, res, next) {
  //     try {
  //         let {query,params } = req
  //         console.log("lookup_type",params)
  //         let getLookupType = await newService.getLookupType({ lookup_type: params?.lookup_type })
  //         console.log("getLookupType",getLookupType)
  //         if(!getLookupType){
  //             return res.status(500).json(apiResponse.FAILURE_RESP({}, {
  //                 name: "Record Not Found Error",
  //                 message: `LookupType Not Found`
  //             }, "LookupType Not Found"))
  //         }
  //         let filterQuery={
  //             "lookup_type":{
  //               "lookup_type"  :getLookupType?.lookup_type
  //             }

  //         }
  //         let page_no = parseInt(query?.page_no) || 1;
  //         let per_page = parseInt(query?.per_page) || 10;
  //         let sort = [
  //             { "createdAt": 'desc' },
  //             { "updatedAt": 'desc' },
  //         ]
  //         let resp = await newService.listLookupCodeByLookupType(filterQuery,page_no,per_page,sort)
  //         return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination,resp?.data, "LookupCodes Retrieved Successfully"))
  //     } catch (err) {
  //         console.log("Handler Error ===========>>>> ", err)
  //         return res.status(500).json(apiResponse.FAILURE_RESP({}, {
  //             name: "Handler Error",
  //             message: `${err}`
  //         }, "Handler error"))
  //     }
  // }
}

export default Handler;
