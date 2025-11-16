/**
 *
 * @param {object} options
 * @param {object} [options.modelName]
 * @param {object} [options.page]
 * @param {object} [options.filter]
 * @param {object} [options.limit]
 * @param {object} [options.projection]
 * @param {object} [options.populate] - works with basic pagination only
 * @param {object} [options.sort]
 * @param {object} [options.lean]
 * @returns paginated records
 */
const basicPagination = async (options: any) => {
    const { filter, modelName: Model, ...rest } = options;
    return await Model.paginate(filter, rest);
};

const getPaginationMeta = (limit: number, page: number, totalDocs: number) => {
    const totalPages = Math.ceil(totalDocs / limit);
    const prevPage = totalPages < page || page === 1 ? null : page - 1;
    const nextPage = totalPages <= page ? null : page + 1;
    return {
        totalDocs,
        limit,
        page,
        totalPages,
        prevPage,
        nextPage,
        hasPrevPage: Boolean(prevPage),
        hasNextPage: Boolean(nextPage)
    };
};

export const newAggregationPaginator = async (options: any) => {
    const { filter, pipeline, limit, page, modelName: Model, } = options;
    const [totalDocs, docs] = await Promise.all([
        Model.countDocuments(filter),
        Model.aggregate(pipeline)
    ]);
    return { docs, ...getPaginationMeta(limit, page, totalDocs) };
};

/**
 *
 * @param {String} modelName
 * @param {object} options
 * @param {[boolean]} options.useNew
 * @param {[object]} options.pipeline
 * @param {object} [options.page]
 * @param {object} [options.limit]
 * @param {object} [options.sort]
 * @returns paginated records
 */
const legacyAggregationPaginator = async (options: any) => {
    const { modelName: Model, } = options;
    const aggregate = Model.aggregate(options.pipeline);
    return await Model.aggregatePaginate(aggregate, options);
};

/**
 *
 * @param {String} modelName
 * @param {object} options
 * @param {[boolean]} options.useNew
 * @param {[object]} options.pipeline
 * @param {object} [options.page]
 * @param {object} [options.limit]
 * @param {object} [options.sort]
 * @returns paginated records
 */
const paginationWithAggregate = async (options: any) => {
    const paginateFn = options.useNew ? newAggregationPaginator : legacyAggregationPaginator;
    return paginateFn(options);
};

/**
 *
 * @param {String} modelName
 * @param {object} options
 * @param {object} [options.page]
 * @param {object} [options.limit]
 * @param {object} [options.projection]
 * @param {[object]} [options.pipeline]
 * @param {object} [options.populate] - works with basic pagination only
 * @param {object} [options.filter] - works with basic pagination only
 * @param {object} [options.sort]
 * @returns paginated records
 */
const paginate = async (modelName: any, options: any) => {
    options.limit = options.limit || 20;
    if (options.limit > 50) options.limit = 50;
    if (options.exportLimit > 0) options.limit = options.exportLimit;
    options.page = options.page || 1;
    options.lean = true;
    options.sort = options.sort || { createdAt: -1 };
    return options.pipeline ? paginationWithAggregate({ ...options, modelName }) : basicPagination({ ...options, modelName });
};

export default paginate;
