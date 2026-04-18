export const wrapResponse = (req, res, next) => {
  const oldJson = res.json.bind(res);

  res.json = (payload) => {
    const isErrorStatus = res.statusCode >= 400;


    if (payload && typeof payload.success === "boolean") {
      return oldJson(payload);
    }

    if (
      payload &&
      typeof payload === "object" &&
      ("page" in payload || "limit" in payload || "total" in payload)
    ) {
      const { data, ...meta } = payload;

      const content = data || payload.data || [];

      return oldJson({
        success: !isErrorStatus,
        ...meta,
        data: content,
      });
    }

    return oldJson({
      success: !isErrorStatus,
      data: payload,
    });
  };
  next();
};
