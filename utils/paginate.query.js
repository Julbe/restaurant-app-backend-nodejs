export const paginate = async ({
    model,
    filter = {},
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    populate = [],
    _fields = ""
}) => {
    if (page < 1) {
        throw new Error("page must to be mayor than 0");
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    let query = model.find(filter).sort(sort).skip(skip).limit(limit).lean();

    if (_fields != "") query = query.select(_fields);

    if (populate && populate.length > 0) {
        if (Array.isArray(populate)) {
            populate.forEach((p) => query.populate(p));
        } else {
            query.populate(populate);
        }
    }

    const [data, totalResults] = await Promise.all([
        query.exec(),
        model.countDocuments(filter),
    ]);

    return {
        data,
        page,
        limit,
        totalPages: Math.ceil(totalResults / limit),
        results: totalResults,
    };
};
