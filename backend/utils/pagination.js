const paginate = async (model, query, queryParams, populate = '') => {
  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 20;
  const skip = (page - 1) * limit;

  const sort = queryParams.sort || '-createdAt';

  let q = model.find(query).sort(sort).skip(skip).limit(limit);
  if (populate) q = q.populate(populate);

  const [data, total] = await Promise.all([q, model.countDocuments(query)]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
};

module.exports = paginate;
