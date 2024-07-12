
module.exports = (limitItem, query, count) => {
    const objectPagination = {
        currentPage: 1,
        limitItem: limitItem
    };
    if(query.page) {
        objectPagination.currentPage = parseInt(query.page);
    }
    if(query.limit) {
        objectPagination.limitItem = parseInt(query.limit);
    }    
    objectPagination.skip = (objectPagination.currentPage - 1)* objectPagination.limitItem;
    
    objectPagination.totalPage = Math.ceil(count/objectPagination.limitItem);

    return objectPagination;
}