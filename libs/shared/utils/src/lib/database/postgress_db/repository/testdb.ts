import { getDBConnections } from "@adya/shared"


class TestDbService {
    private static instance: TestDbService | null = null;

    // Private constructor to prevent direct instantiation
    private constructor() {}

    // Static method to get the singleton instance
    public static getInstance(): TestDbService {
        if (this.instance === null) {
        this.instance = new TestDbService();
        }
        return this.instance;
    }

    //============================ =========================================================================
    async upsert(db_name:any,db_url:any, select:any,query:any, payload:any){
        try{
                let select_fields = {
                    id: true
                }
                let details = await this.get(db_name,db_url,  select_fields, query)

                if(details){
                    let filterQuery = {
                        id : details?.id
                    }
                    let update = await this.update(db_name,db_url, select,filterQuery, payload)
                    return update
                }
                else{
                    return await this.create(db_name,db_url, select, payload)
                }
        }catch(err){
            console.log("error ==>",err)
        }
    }
    async create(db_name:any,db_url:any, select:any, payload:any) {
        try {

           let prisma = getDBConnections(db_name, db_url)
            await prisma.$connect();
            let resp =  await prisma.addons_custom_groups.create({
                select: select,
                data: payload
            })
            await prisma.$disconnect();
            return resp
            

        } catch (err) {
            console.log("DB Error ==========>>>", err)
            throw err

        }

    }
    async update(db_name:any,db_url:any, select:any, query:any, payload:any) {
        try {
           let prisma = getDBConnections(db_name, db_url)
            await prisma.$connect();
            let resp =  await prisma.addons_custom_groups.update({
                where: query,
                data: payload,
                select: select
            })
            await prisma.$disconnect();
            return resp
             
        } catch (err) {
            console.log("DB Error ==========>>>", err)
            throw err
        }
    }
    async delete(db_name:any,db_url:any, select:any, query:any) {
        try {
           let prisma = getDBConnections(db_name, db_url)
            await prisma.$connect();
            let resp = await prisma.addons_custom_groups.delete({
                where: query,
                select: select
            })
            await prisma.$disconnect();
            return resp
             
        } catch (err) {
            console.log("DB Error ==========>>>", err)
            throw err
        }
    }
    async deleteAll(db_name:any,db_url:any, query:any) {
        try {
           let prisma = getDBConnections(db_name, db_url)
            await prisma.$connect();
            let resp = await prisma.addons_custom_groups.deleteMany({
                where: query
            })
            await prisma.$disconnect();
            return resp
             
        } catch (err) {
            console.log("DB Error ==========>>>", err)
            throw err
        }
    }
    async get(db_name:any,db_url:any, select:any, query:any) {
        try {
           let prisma = getDBConnections(db_name, db_url)
            await prisma.$connect();
            let resp =  await prisma.addons_custom_groups.findFirst({
                where: query,
                select: select
            })
            await prisma.$disconnect();
            return resp

             

        } catch (err) {
            console.log("DB Error ==========>>>", err)
            throw err

        }
    }
    async getAll(db_name:any,db_url:any, select:any, query:any, skip:any = 0, take:any = 10, orderBy:any = {}) {
        try {
           let prisma = getDBConnections(db_name, db_url)
            await prisma.$connect();
            if (take == -1) {
                let resp = await prisma.addons_custom_groups.findMany({
                    where: query,
                    select: select,
                    orderBy: orderBy
                })
                await prisma.$disconnect();
                return resp
            }
            let resp = await prisma.addons_custom_groups.findMany({
                where: query,
                select: select,
                skip: skip,
                take: take,
                orderBy: orderBy
            })
            await prisma.$disconnect();
            return resp

        } catch (err) {
            console.log("DB Error ==========>>>", err)
            throw err

        }
    }
    async get_pagination(db_name:any,db_url:any, page_no:any = 1, per_page:any = 10, query:any = {}) {

        try {
           let prisma = getDBConnections(db_name, db_url)
            await prisma.$connect();
            if (per_page == -1) {
                let total_record = await prisma.addons_custom_groups.count({ where: query })

                let pagination = {
                    "per_page": per_page,
                    "page_no": page_no,
                    "total_rows": total_record,
                    "total_pages": 1
                }
                await prisma.$disconnect();
                return pagination
            }
            else {
                let skip_record = (page_no - 1) * per_page
                let total_record = await prisma.addons_custom_groups.count({ where: query })

                let total_rows = await prisma.addons_custom_groups.count({
                    where: query,
                })

                let total_pages = Math.ceil(total_record / per_page);
                let pagination = {
                    "per_page": per_page,
                    "page_no": page_no,
                    "total_rows": total_rows,
                    "total_pages": total_pages
                }
                await prisma.$disconnect();
                return pagination
            }

        }
        catch (err) {
            throw err
        }
    }
}

export {TestDbService}



