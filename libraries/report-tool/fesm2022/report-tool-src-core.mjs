const validDetails = { ViewDisabled: false };
const validOrderBy = { ...validDetails, OrderBy: true };
const validGroupingEligible = {
    ...validDetails,
    GroupingEligible: true,
};
const validGroupBy = {
    ...validGroupingEligible,
    GroupBy: true,
};
const validSumField = {
    ...validDetails,
    SumField: true,
};
const validRunningTotal = {
    ...validSumField,
    RunningTotal: true,
};
const validGroupTotal = {
    ...validSumField,
    GroupTotal: true,
};
const validGrandTotal = {
    ...validSumField,
    GrandTotal: 1,
};
const validFilterField = {
    ...validDetails,
    FilterField: true,
};
const fillColor = {
    header: "FFFF99",
    odd: "EBF9F8",
    even: "D9EBE9",
    group: "BFFFAC",
    subgroup: "FFCCAA",
    groupTotal: "A4FFFA",
    grandTotal: "A4FFC9",
};
class OrderByPref {
    static { this.ASC = "Asc"; }
    static { this.DESC = "Desc"; }
}
class FilterByRef {
    static { this.Number = [
        { label: "=", value: 0 },
        { label: ">", value: 0 },
        { label: "<", value: 0 },
        { label: ">=", value: 0 },
        { label: "<=", value: 0 },
        { label: "<>", value: 1 },
    ]; }
    static { this.String = [
        { label: "Starts With", value: 0 },
        { label: "Contains", value: 0 },
        { label: "Does Not Contains", value: 0 },
        { label: "Equals to", value: 0 },
        { label: "Not Equals to", value: 0 },
        { label: "<Selected Item>", value: 1 },
    ]; }
    static WhereCondition(field, operator, value) {
        switch (operator) {
            case "Starts With":
                return `${field} LIKE '${value}%'`;
            case "Contains":
                return `${field} LIKE '%${value}%'`;
            case "Does Not Contain":
                return `${field} NOT LIKE '%${value}%'`;
            case "Equals to":
                return `${field} = '${value}'`;
            case "Not Equals to":
                return `${field} <> '${value}'`;
            case "<Selected Item>":
                value = value
                    .split(",")
                    .map((m) => `'${m}'`)
                    .join();
                return `${field} in (${value})`;
            default:
                return `${field} ${operator} ${value}`;
        }
    }
}
class SampleReport {
    static { this.columns = [
        {
            header: "Field 1",
            field: "field1",
            type: "string",
            width: "20%",
        },
        {
            header: "Field 2",
            field: "field2",
            type: "string",
            width: "20%",
        },
        {
            header: "Field 3",
            field: "field3",
            type: "number",
            width: "20%",
        },
        {
            header: "Field 4",
            field: "field4",
            type: "number",
            width: "20%",
        },
        {
            header: "Balance",
            field: "advanceTotal",
            type: "number",
            width: "20%",
        },
    ]; }
    static { this.reports = [
        {
            group: "Group Name 1",
            field1: "Voucher 1",
            field2: "AccountName 1",
            field3: 33,
            field4: 0,
            advanceTotal: 533,
        },
        {
            group: "Group Name 1",
            field1: "Voucher 2",
            field2: "AccountName 2",
            field3: 0,
            field4: 500,
            advanceTotal: 33,
        },
        {
            group: "Group Name 2",
            field1: "Voucher 3",
            field2: "AccountName 3",
            field3: 50,
            field4: 0,
            advanceTotal: 83,
        },
        {
            group: "Group Name 2",
            field1: "Voucher 4",
            field2: "AccountName 4",
            field3: 0,
            field4: 50,
            advanceTotal: 33,
        },
    ]; }
    static { this.metaColumns = {
        header: "",
        field: "group",
        classNames: "row-group",
        fields: ["group"],
        subTotal: ["field3", "field4"],
    }; }
    static { this.metaData = {
        "Group Name 1": {
            index: 0,
            subTotal: {
                field3: 533,
                field4: 500,
                index: 1,
            },
        },
        "Group Name 2": {
            index: 2,
            subTotal: {
                field3: 50,
                field4: 50,
                index: 3,
            },
        },
    }; }
}

/*
 * Public API Surface of report-tool
 */

/**
 * Generated bundle index. Do not edit.
 */

export { FilterByRef, OrderByPref, SampleReport, fillColor, validDetails, validFilterField, validGrandTotal, validGroupBy, validGroupTotal, validGroupingEligible, validOrderBy, validRunningTotal, validSumField };
//# sourceMappingURL=report-tool-src-core.mjs.map
