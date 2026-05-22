import { createInListFilterBlock } from "../../utils/filters/in-list.filter.js";
import { createFilterBlocksBuilder } from "../../utils/filters/filter-blocks.builder.js";
import { GENERAL_FILTER_BLOCKS } from "../../utils/filters/manager.filters.js";

const TICKET_STATUS = ["OPEN", "CLOSE", "PENDING_PAYMENT", "CANCELED"];

const statusFilterBlock = createInListFilterBlock({
    key: "_status",
    field: "status",
    allowedValues: TICKET_STATUS,
});

const BUSINESS_FILTER_BLOCKS = {
    ...GENERAL_FILTER_BLOCKS,
    _status: statusFilterBlock,
};

const buildBusinessBlocks = createFilterBlocksBuilder(BUSINESS_FILTER_BLOCKS);

export {
    buildBusinessBlocks,
};
