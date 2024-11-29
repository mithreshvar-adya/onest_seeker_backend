import service from './service';
import { apiResponse, JsonWebToken } from "@adya/shared";
import { GlobalEnv } from "../../config/env";
import { UserProfile } from '@adya/shared';

const newService = service.getInstance();
const user_profile_model = UserProfile.getInstance()

const jwtInstance = new JsonWebToken();

class Handler {

    private static instance: Handler | null = null;

    // Private constructor to prevent direct instantiation
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() { }

    // Static method to get the singleton instance
    public static getInstance(): Handler {
        if (this.instance === null) {
            this.instance = new Handler();
        }
        return this.instance;
    }

    async create(req, res, next) {
        try {
            const { body } = req
            await newService.create(body)
            return res.status(200).json(apiResponse.SUCCESS_RESP({}, "Job Description Created Successfully"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async get(req, res, next) {
        try {
            const { body, params, headers } = req
            const decoded = await jwtInstance.verify(headers.authorization.split(' ')[1]);
            const user_id = decoded.id
            const query = {
                "items.course_id": params?.id,
                user_id: user_id,
                state: "Created"
            }

            const resp = await newService.get(query)
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "success"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async getCacheCourse(req, res, next) {
        try {
            const { params } = req
            const resp = await newService.getCache({ course_id: params?.id })
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "success"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async update(req, res, next) {
        try {
            const { body, params } = req

            const resp = await newService.getCache({ id: params?.id })
            if (resp) {
                const query = {
                    id: resp?.id
                }
                await newService.update(query, body)
            } else {
                return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                    name: "Record Not Found Error",
                    message: `Record Not Found`
                }, "Record Not Found"))
            }
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "success"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async listMyCourses(req, res, next) {
        try {
            const { query, headers } = req
            const decoded = await jwtInstance.verify((headers.authorization).split(" ")[1])
            const page_no = parseInt(query?.page_no) || 1;
            const per_page = parseInt(query?.per_page) || 10;
            delete query?.page_no
            delete query?.per_page
            query.user_id = decoded.id
            query.state = "Created"
            if (query?.status) {
                query["fulfillment_status.code"] = query?.status
                delete query?.status
            }
            if (query?.payment_status) {
                query["payments.status"] = query?.payment_status
                delete query?.payment_status
            }
            const { sort_by, order } = req.query;
            const sort = {}
            if (sort_by && order) {
                const sortOrder = order === 'desc' ? -1 : 1;
                if (sort_by === 'price') {
                    sort["total_price"] = sortOrder;
                } else if (sort_by === 'ratings') {
                    sort['items.ratings'] = sortOrder;
                } else if (sort_by === 'name') {
                    sort['items.course_descriptor.name'] = sortOrder;
                }
                delete query.sort_by
                delete query.order
            }
            if (query?.is_certificate_available) {
                query["items.is_certificate_available"] = true
                delete query.is_certificate_available
            }
            console.log("Query for listMy Course---->", query, sort);

            const resp = await newService.list(query, page_no, per_page, sort)
            return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.data, "Data retrieved Successfully"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async homePagelist(req, res, next) {
        try {
            const { query, headers } = req
            const decoded = await jwtInstance.verify((headers.authorization).split(" ")[1])
            const user_id = decoded?.id

            const { sort_by, order } = req.query;
            const sort = {};

            const { topics, providers, minPrice, maxPrice } = req.query;
            if (topics) {
                const topicList = topics.split(',');
                query.category_ids = { $in: topicList }
                delete query.topics
            }
            if (providers) {
                const providerList = providers.split(',');
                query['provider_descriptor.name'] = { $in: providerList };
                delete query.providers
            }
            if (minPrice || maxPrice) {
                query.total_price = {};
                if (minPrice) {
                    query.total_price.$gte = parseFloat(minPrice);
                }
                if (maxPrice) {
                    query.total_price.$lte = parseFloat(maxPrice);
                }
                delete query.minPrice
                delete query.maxPrice
            }
            if (sort_by && order) {
                const sortOrder = order === 'desc' ? -1 : 1;
                if (sort_by === 'price') {
                    sort["quote.price.value"] = sortOrder;
                } else if (sort_by === 'rating') {
                    sort['rating'] = sortOrder;
                } else {
                    sort['course_descriptor.name'] = sortOrder;
                }
            }

            let filterQuery = {}

            const page_no = parseInt(query?.page_no) || 1;
            const per_page = parseInt(query?.per_page) || 5;
            const allCourseFilter = filterQuery
            allCourseFilter['user_id'] = user_id
            if (query?.course_name) {
                allCourseFilter["course_descriptor.name"] = { $regex: query.course_name, $options: "i" }
                delete query?.course_name
            }

            const allCourse = await newService.cacheCourses(allCourseFilter, page_no, per_page, sort)

            const user = await user_profile_model.findOne(
                GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME,
                { user_id: query.user_id }
            )

            filterQuery = {}
            filterQuery['user_id'] = user_id
            let recentViewedCourse = []
            if (user?.recent_viewed_course && user.recent_viewed_course.length > 0) {
                filterQuery = {
                    course_id: { $in: user.recent_viewed_course }
                };
                recentViewedCourse = await newService.cacheCourses(filterQuery, page_no, per_page, {});
            }

            filterQuery = {}
            filterQuery['user_id'] = user_id
            const popularCourse = (await newService.cacheCourses(filterQuery, 1, 10, { ratings: -1 }))

            const data = {
                allCourse: allCourse,
                recentViewedCourse: recentViewedCourse,
                popularCourse: popularCourse
            }
            return res.status(200).json(apiResponse.SUCCESS_RESP(data, "Data retrieved Successfully"))

        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async landingPageCacheCourses(req, res, next) {
        try {
            const { query } = req
            let filterQuery = {}
            const page_no = parseInt(query?.page_no) || 1;
            const per_page = parseInt(query?.per_page) || 5;
            const sort = {}
            const allCourse = await newService.cacheCourses(filterQuery, page_no, per_page, sort)
            filterQuery = {
                is_popular: true
            }
            const popularCourse = await newService.cacheCourses(filterQuery, page_no, per_page, sort)
            const data = {
                allCourse: allCourse,
                popularCourse: popularCourse
            }
            return res.status(200).json(apiResponse.SUCCESS_RESP(data, "Data retrieved Successfully"))

            // return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.data, "Data retrieved Successfully"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async listCacheCourses(req, res, next) {
        try {
            const { query, headers } = req
            const decoded = await jwtInstance.verify((headers.authorization).split(" ")[1])
            query.user_id = decoded?.id

            const page_no = parseInt(query?.page_no) || 1;
            const per_page = parseInt(query?.per_page) || 10;
            delete query?.page_no
            delete query?.per_page

            const { sort_by, order } = req.query;
            const sort = {}

            const { topics, providers, minPrice, maxPrice, learner_level } = req.query;
            if (topics) {
                const topicList = topics.split(',');
                query.category_ids = { $in: topicList }
                delete query.topics
            }
            if (providers) {
                const providerList = providers.split(',');
                query['provider_descriptor.name'] = { $in: providerList };
                delete query.providers
            }
            if (learner_level) {
                const learnerLevelList = learner_level.split(',');
                query['content_metadata.learner_level'] = { $in: learnerLevelList };
                delete query.learner_level
            }

            if (minPrice || maxPrice) {
                query.total_price = {};
                if (minPrice) {
                    query.total_price.$gte = parseFloat(minPrice);
                }
                if (maxPrice) {
                    query.total_price.$lte = parseFloat(maxPrice);
                }
                delete query.minPrice
                delete query.maxPrice
            }

            if (sort_by && order) {
                const sortOrder = order === 'desc' ? -1 : 1;
                if (sort_by === 'price') {
                    sort["total_price"] = sortOrder;
                } else if (sort_by === 'ratings') {
                    sort['ratings'] = sortOrder;
                } else if (sort_by === 'name') {
                    sort['course_descriptor.name'] = sortOrder;
                }
                delete query.sort_by
                delete query.order
            }

            if (query?.course_name) {
                query["course_descriptor.name"] = { $regex: query.course_name, $options: "i" }
                delete query?.course_name
            }
            const resp = await newService.listCacheCourses(query, page_no, per_page, sort)
            return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.data, "Data retrieved Successfully"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async listScholarship(req, res, next) {
        try {
            const resp = [
                {
                    "name": "ICCR Scholarship",
                    "images": ["https://media.licdn.com/dms/image/D4D12AQGJ7O5i1Q1ciw/article-cover_image-shrink_423_752/0/1702790505226?e=1725494400&v=beta&t=5faPGHghuARI-5LVoTnnUudz3MKPtA4833wqAYE9SxM"],
                    "provider_name": "Indian Council for Cultural Relations (ICCR)",
                    "education": "Undergraduate, Master's, PhD (excluding MBBS, BDS, MD, MS)",
                    "address": {
                        "city": "New Delhi",
                        "country": "India"
                    }
                },
                {
                    "name": "Fulbright Scholarship Awards",
                    "images": ["https://d2v9ipibika81v.cloudfront.net/uploads/sites/249/Fulbright-Logo_750x450.jpg"],
                    "provider_name": "California Institute of Technology",
                    "education": "PHD",
                    "address": {
                        "city": "Punjab",
                        "country": "India"
                    }
                },

                {
                    "name": "Central Sector Scholarship Scheme (CSSS)",
                    "images": ["https://scholarshipexam.in/wp-content/uploads/2018/09/CSSS-570x347.jpg"],
                    "provider_name": "All India Council for Technical Education (AICTE)",
                    "education": "Various levels (check official website)",
                    "address": {
                        "city": "New Delhi",
                        "country": "India"
                    }
                },
                {
                    "name": "Indian Institutes of Technology (IIT) Scholarships",
                    "images": ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTr2Kj9PLwcQFgmBAEm6HarhJl8WpSJV5CV4kPsYTkOG1fbGZ-eHmqccl6LOwPb453UhGA&usqp=CAU"],
                    "provider_name": "Ministry of Education (India)",
                    "education": "Bachelor's, Master's",
                    "address": {
                        "city": "Various locations across India",
                        "country": "India"
                    }
                },
                {
                    "name": "JN Tata Endowment for the Higher Education of Indians",
                    "images": ["https://static.joonsite.com/careerbrick/2304111640067852.jpeg"],
                    "provider_name": "JN Tata Endowment",
                    "education": "Master's, PhD (for study abroad)",
                    "address": {
                        "city": "Mumbai",
                        "country": "India"
                    }
                }
            ]
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "Data retrieved Successfully"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async enrolled(req, res, next) {
        try {
            const { body, params, headers } = req
            const decoded = await jwtInstance.verify(headers.authorization.split(" ")[1]);

            const filterQuery = {
                user_id: decoded?.id,
                "items.course_id": body?.course_id
            }
            const resp = await newService.get(filterQuery)
            if (resp) {
                const query = {
                    id: resp?.id
                }
                const update_body = {
                    is_enrolled: true
                }
                const response = await newService.update(query, update_body)
                return res.status(200).json(apiResponse.SUCCESS_RESP({}, "Enrolled Successfully"))
            } else {
                return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                    name: "Record Not Found Error",
                    message: `Record Not Found`
                }, "Record Not Found"))
            }

        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async payment(req, res, next) {
        try {
            const { body, params, headers } = req
            const decoded = await jwtInstance.verify(headers.authorization.split(" ")[1]);

            const filterQuery = {
                "items.course_id": body?.course_id
            }
            const resp = await newService.get(filterQuery)
            if (resp) {
                const query = {
                    "items.course_id": body?.course_id
                }
                const update_body = {
                    billing: body?.billing_address,
                    user_id: decoded?.id,
                    payment_amount: body?.payment_amount,
                    is_enrolled: true
                }
                const response = await newService.update(query, update_body)
                return res.status(200).json(apiResponse.SUCCESS_RESP({}, "Enrolled Successfully"))
            } else {
                return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                    name: "Record Not Found Error",
                    message: `Record Not Found`
                }, "Record Not Found"))
            }

        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async CourseDetail(req, res, next) {
        try {
            const { body, query, params, headers } = req
            
            if (headers.authorization) {
                const decoded = await jwtInstance.verify((headers.authorization).split(" ")[1])
                query.user_id = decoded.id
                query.state = "Created"
                const recent = await newService.getCourseDetail({ user_id: query.user_id, course_id: params?.id })
                return res.status(200).json(apiResponse.SUCCESS_RESP(recent, "Data Retrieved Successfully"))
            } else {
                const resp = await newService.getCache({ course_id: params?.id })
                return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "Data Retrieved Successfully"))
            }
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async filterDetail(req, res, next) {
        try {
            const { body, params } = req
            const resp = await newService.getFilterDetail()
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "Data Retrieved Successfully"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async listAllCourses(req, res, next) {
        try {
            const { query } = req
            // query.state = "Created"
            const page_no = parseInt(query?.page_no) || 1;
            const per_page = parseInt(query?.per_page) || 10;
            delete query?.page_no
            delete query?.per_page

            const filterQuery = {
                state: "Created"
            }
            const sort = {}

            const resp = await newService.adminlistAllCourses(filterQuery, page_no, per_page, sort)
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "Data retrieved Successfully"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async getAllCertificate(req, res, next) {
        try {
            const { query } = req;
            const { course_name } = query;
            query.state = "Created"
            const page_no = parseInt(query?.page_no) || 1;
            const per_page = parseInt(query?.per_page) || 10;
            delete query?.page_no
            delete query?.per_page

            const filterQuery = { 'items.is_certificate_available': true }
            if (course_name) {
                filterQuery['course_name'] = {
                    $regex: course_name,
                    $options: 'i',
                };
            }

            const sort = {}

            const resp = await newService.getAllCertificate(filterQuery, page_no, per_page, sort)
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "Data retrieved Successfully"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async getOnAction(req, res, next) {
        try {
            const { query, headers } = req
            const resp = await newService.getOnAction(query)
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "Data retrieved Successfully"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async saveCourse(req, res, next) {
        try {
            const { headers, query } = req;

            const decoded = await jwtInstance.verify(
                headers.authorization.split(' ')[1]
            );

            const user_id = decoded.id;
            const course_id = query.course_id;
            const type = query.type;

            const resp = await newService.saveCourseCache({ user_id: user_id, course_id: course_id, type: type })


            return res
                .status(200)
                .json(apiResponse.SUCCESS_RESP({}, resp));

        } catch (err) {
            console.log('Handler Error in saveCourse ===========>>>> ', err);
            return res.status(500).json(
                apiResponse.FAILURE_RESP(
                    {},
                    {
                        name: 'Handler Error in saveCourse',
                        message: `${err}`,
                    },
                    'Handler error in saveCourse'
                )
            );
        }
    }

    async recommendedCourses(req, res, next) {
        try {
            const { headers, query } = req;

            const decoded = await jwtInstance.verify(
                headers.authorization.split(' ')[1]
            );

            const user_id = decoded.id;
            const user_profile: any = await user_profile_model.findOne(
                GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME,
                { user_id: user_id }
            );
            if (user_profile) {
                const course_skills_query = new Set<string>();

                // Combine work preferences, work experiences, and skills processing
                [user_profile?.education_details]
                    .forEach(list => {
                        list?.forEach(item => {
                            if (item?.degree) {
                                course_skills_query.add(item.degree);
                            }
                        });
                    });

                user_profile?.skills?.forEach(skill => {
                    if (skill?.code) {
                        course_skills_query.add(skill.code);
                    }
                });

                const course_skills_query_array = Array.from(course_skills_query);

                console.log("course_skills_query_array", course_skills_query_array);
                //   course_skills_query_array=['B.tech']
                //   console.log("mmmmmmm",course_skills_query_array);


                // const course_cache_query = {
                //     'content_metadata.prerequisite': {
                //       $elemMatch: {
                //         $in: course_skills_query_array.map(skill => new RegExp(`^${skill}$`, 'i'))
                //       }
                //     }
                //   };

                const course_cache_query = {
                    'content_metadata.prerequisite': {
                        $in: course_skills_query_array.map(skill => new RegExp(skill, 'i'))
                    }
                };


                console.log("course_cache_query", JSON.stringify(course_cache_query));


                const page_no = parseInt(query.page_no as string) || 1;
                const per_page = parseInt(query.per_page as string) || 10;
                const sort = {};

                const resp = await newService.listCacheCourses(
                    course_cache_query,
                    page_no,
                    per_page,
                    sort
                );

                // const jobs = resp?.data.map(job => {
                //   const { saved_userIds, applied_userIds, ...restOfJob } = job;     
                //   return {
                //     ...restOfJob,
                //     is_saved: saved_userIds?.includes(decoded?.id) || false,
                //     is_applied: applied_userIds?.includes(decoded?.id) || false
                //   };
                // });


                return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp, "Course Data retrieved Successfully"))

            } else {
                return res.status(404).json(
                    apiResponse.FAILURE_RESP(
                        {},
                        { name: 'Not Found', message: 'User not found' },
                        'User not found'
                    )
                );
            }


        } catch (err) {
            console.log('Handler Error in saveCourse ===========>>>> ', err);
            return res.status(500).json(
                apiResponse.FAILURE_RESP(
                    {},
                    {
                        name: 'Handler Error in saveCourse',
                        message: `${err}`,
                    },
                    'Handler error in saveCourse'
                )
            );
        }
    }



}

export default Handler