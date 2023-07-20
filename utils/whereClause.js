class WhereClause {
    constructor(base, bigQ) {
        this.base = base
        this.bigQ = bigQ
    }

    search() {
        const searchWord = this.bigQ.search ? {
            name: {
                $regex: this.bigQ.search,
                $options: "i"
            }
        }
            : {};

        this.base = this.base.find({ ...searchWord });
        return this;
    };

    filter() {
        const copyQ = { ...this.bigQ };

        delete copyQ["search"];
        delete copyQ["limit"];
        delete copyQ["page"];

        let strCopyQ = JSON.stringify(copyQ);

        strCopyQ = strCopyQ.replace(
            /\b(gte|lte|gt|lt)\b/g,
            (x) => `$${x}`
        );

        const jsonCopyQ = JSON.parse(strCopyQ);

        this.base = this.base.find(jsonCopyQ);
        return this;
    };

    pager(resultPerPage) {
        let currentPage = 1;
        if (this.bigQ.page) {
            currentPage = this.bigQ.page;
        };

        const skipVal = resultPerPage * (currentPage - 1);

        this.base = this.base.limit(resultPerPage).skip(skipVal);
        return this;
    };

}

module.exports = WhereClause