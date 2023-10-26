export const validDetails = { ViewDisabled: false };
export const validOrderBy = { ...validDetails, OrderBy: true };
export const validGroupingEligible = {
    ...validDetails,
    GroupingEligible: true,
};
export const validGroupBy = {
    ...validGroupingEligible,
    GroupBy: true,
};
export const validSumField = {
    ...validDetails,
    SumField: true,
};
export const validRunningTotal = {
    ...validSumField,
    RunningTotal: true,
};
export const validGroupTotal = {
    ...validSumField,
    GroupTotal: true,
};
export const validGrandTotal = {
    ...validSumField,
    GrandTotal: 1,
};
export const validFilterField = {
    ...validDetails,
    FilterField: true,
};
export const fillColor = {
    header: "FFFF99",
    odd: "EBF9F8",
    even: "D9EBE9",
    group: "BFFFAC",
    subgroup: "FFCCAA",
    groupTotal: "A4FFFA",
    grandTotal: "A4FFC9",
};
export class OrderByPref {
    static { this.ASC = "Asc"; }
    static { this.DESC = "Desc"; }
}
export class FilterByRef {
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
export class SampleReport {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3J0LXRvb2wuY29yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3JlcG9ydC10b29sL3NyYy9jb3JlL3JlcG9ydC10b29sLmNvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFtQixFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUVwRSxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQW1CLEVBQUUsR0FBRyxZQUFZLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDO0FBRS9FLE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUFtQjtJQUNuRCxHQUFHLFlBQVk7SUFDZixnQkFBZ0IsRUFBRSxJQUFJO0NBQ3ZCLENBQUM7QUFFRixNQUFNLENBQUMsTUFBTSxZQUFZLEdBQW1CO0lBQzFDLEdBQUcscUJBQXFCO0lBQ3hCLE9BQU8sRUFBRSxJQUFJO0NBQ2QsQ0FBQztBQUVGLE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBbUI7SUFDM0MsR0FBRyxZQUFZO0lBQ2YsUUFBUSxFQUFFLElBQUk7Q0FDZixDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0saUJBQWlCLEdBQW1CO0lBQy9DLEdBQUcsYUFBYTtJQUNoQixZQUFZLEVBQUUsSUFBSTtDQUNuQixDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFtQjtJQUM3QyxHQUFHLGFBQWE7SUFDaEIsVUFBVSxFQUFFLElBQUk7Q0FDakIsQ0FBQztBQUVGLE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBbUI7SUFDN0MsR0FBRyxhQUFhO0lBQ2hCLFVBQVUsRUFBRSxDQUFDO0NBQ2QsQ0FBQztBQUVGLE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFtQjtJQUM5QyxHQUFHLFlBQVk7SUFDZixXQUFXLEVBQUUsSUFBSTtDQUNsQixDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUFlO0lBQ25DLE1BQU0sRUFB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QUNqQixRQUFRLEVBQUUsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDO0tBQy9CLENBQUM7YUFDSyxhQUFRLEdBQVE7UUFDckIsY0FBYyxFQUFFO1lBQ2QsS0FBSyxFQUFFLENBQUM7WUFDUixRQUFRLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFLEdBQUc7Z0JBQ1gsTUFBTSxFQUFFLEdBQUc7Z0JBQ1gsS0FBSyxFQUFFLENBQUM7YUFDVDtTQUNGO1FBQ0QsY0FBYyxFQUFFO1lBQ2QsS0FBSyxFQUFFLENBQUM7WUFDUixRQUFRLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFLEVBQUU7Z0JBQ1YsTUFBTSxFQUFFLEVBQUU7Z0JBQ1YsS0FBSyxFQUFFLENBQUM7YUFDVDtTQUNGO0tBQ0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElSZXBvcnREZXRhaWxzLCBJUmVwb3J0Um93IH0gZnJvbSBcInJlcG9ydC10b29sL3NyYy9tb2RlbHNcIjtcclxuXHJcbmV4cG9ydCBjb25zdCB2YWxpZERldGFpbHM6IElSZXBvcnREZXRhaWxzID0geyBWaWV3RGlzYWJsZWQ6IGZhbHNlIH07XHJcblxyXG5leHBvcnQgY29uc3QgdmFsaWRPcmRlckJ5OiBJUmVwb3J0RGV0YWlscyA9IHsgLi4udmFsaWREZXRhaWxzLCBPcmRlckJ5OiB0cnVlIH07XHJcblxyXG5leHBvcnQgY29uc3QgdmFsaWRHcm91cGluZ0VsaWdpYmxlOiBJUmVwb3J0RGV0YWlscyA9IHtcclxuICAuLi52YWxpZERldGFpbHMsXHJcbiAgR3JvdXBpbmdFbGlnaWJsZTogdHJ1ZSxcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCB2YWxpZEdyb3VwQnk6IElSZXBvcnREZXRhaWxzID0ge1xyXG4gIC4uLnZhbGlkR3JvdXBpbmdFbGlnaWJsZSxcclxuICBHcm91cEJ5OiB0cnVlLFxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHZhbGlkU3VtRmllbGQ6IElSZXBvcnREZXRhaWxzID0ge1xyXG4gIC4uLnZhbGlkRGV0YWlscyxcclxuICBTdW1GaWVsZDogdHJ1ZSxcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCB2YWxpZFJ1bm5pbmdUb3RhbDogSVJlcG9ydERldGFpbHMgPSB7XHJcbiAgLi4udmFsaWRTdW1GaWVsZCxcclxuICBSdW5uaW5nVG90YWw6IHRydWUsXHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgdmFsaWRHcm91cFRvdGFsOiBJUmVwb3J0RGV0YWlscyA9IHtcclxuICAuLi52YWxpZFN1bUZpZWxkLFxyXG4gIEdyb3VwVG90YWw6IHRydWUsXHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgdmFsaWRHcmFuZFRvdGFsOiBJUmVwb3J0RGV0YWlscyA9IHtcclxuICAuLi52YWxpZFN1bUZpZWxkLFxyXG4gIEdyYW5kVG90YWw6IDEsXHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgdmFsaWRGaWx0ZXJGaWVsZDogSVJlcG9ydERldGFpbHMgPSB7XHJcbiAgLi4udmFsaWREZXRhaWxzLFxyXG4gIEZpbHRlckZpZWxkOiB0cnVlLFxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGZpbGxDb2xvcjogSVJlcG9ydFJvdyA9IHtcclxuICBoZWFkZXI6IFwiRkZGRjk5XCIsXHJcbiAgb2RkOiBcIkVCRjlGOFwiLFxyXG4gIGV2ZW46IFwiRDlFQkU5XCIsXHJcbiAgZ3JvdXA6IFwiQkZGRkFDXCIsXHJcbiAgc3ViZ3JvdXA6IFwiRkZDQ0FBXCIsXHJcbiAgZ3JvdXBUb3RhbDogXCJBNEZGRkFcIixcclxuICBncmFuZFRvdGFsOiBcIkE0RkZDOVwiLFxyXG59O1xyXG5cclxuZXhwb3J0IGNsYXNzIE9yZGVyQnlQcmVmIHtcclxuICBzdGF0aWMgQVNDID0gXCJBc2NcIjtcclxuICBzdGF0aWMgREVTQyA9IFwiRGVzY1wiO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgRmlsdGVyQnlSZWYge1xyXG4gIHN0YXRpYyBOdW1iZXIgPSBbXHJcbiAgICB7IGxhYmVsOiBcIj1cIiwgdmFsdWU6IDAgfSxcclxuICAgIHsgbGFiZWw6IFwiPlwiLCB2YWx1ZTogMCB9LFxyXG4gICAgeyBsYWJlbDogXCI8XCIsIHZhbHVlOiAwIH0sXHJcbiAgICB7IGxhYmVsOiBcIj49XCIsIHZhbHVlOiAwIH0sXHJcbiAgICB7IGxhYmVsOiBcIjw9XCIsIHZhbHVlOiAwIH0sXHJcbiAgICB7IGxhYmVsOiBcIjw+XCIsIHZhbHVlOiAxIH0sXHJcbiAgXTtcclxuICBzdGF0aWMgU3RyaW5nID0gW1xyXG4gICAgeyBsYWJlbDogXCJTdGFydHMgV2l0aFwiLCB2YWx1ZTogMCB9LFxyXG4gICAgeyBsYWJlbDogXCJDb250YWluc1wiLCB2YWx1ZTogMCB9LFxyXG4gICAgeyBsYWJlbDogXCJEb2VzIE5vdCBDb250YWluc1wiLCB2YWx1ZTogMCB9LFxyXG4gICAgeyBsYWJlbDogXCJFcXVhbHMgdG9cIiwgdmFsdWU6IDAgfSxcclxuICAgIHsgbGFiZWw6IFwiTm90IEVxdWFscyB0b1wiLCB2YWx1ZTogMCB9LFxyXG4gICAgeyBsYWJlbDogXCI8U2VsZWN0ZWQgSXRlbT5cIiwgdmFsdWU6IDEgfSxcclxuICBdO1xyXG4gIHN0YXRpYyBXaGVyZUNvbmRpdGlvbihcclxuICAgIGZpZWxkOiBzdHJpbmcsXHJcbiAgICBvcGVyYXRvcjogc3RyaW5nLFxyXG4gICAgdmFsdWU6IHN0cmluZ1xyXG4gICk6IHN0cmluZyB7XHJcbiAgICBzd2l0Y2ggKG9wZXJhdG9yKSB7XHJcbiAgICAgIGNhc2UgXCJTdGFydHMgV2l0aFwiOlxyXG4gICAgICAgIHJldHVybiBgJHtmaWVsZH0gTElLRSAnJHt2YWx1ZX0lJ2A7XHJcbiAgICAgIGNhc2UgXCJDb250YWluc1wiOlxyXG4gICAgICAgIHJldHVybiBgJHtmaWVsZH0gTElLRSAnJSR7dmFsdWV9JSdgO1xyXG4gICAgICBjYXNlIFwiRG9lcyBOb3QgQ29udGFpblwiOlxyXG4gICAgICAgIHJldHVybiBgJHtmaWVsZH0gTk9UIExJS0UgJyUke3ZhbHVlfSUnYDtcclxuICAgICAgY2FzZSBcIkVxdWFscyB0b1wiOlxyXG4gICAgICAgIHJldHVybiBgJHtmaWVsZH0gPSAnJHt2YWx1ZX0nYDtcclxuICAgICAgY2FzZSBcIk5vdCBFcXVhbHMgdG9cIjpcclxuICAgICAgICByZXR1cm4gYCR7ZmllbGR9IDw+ICcke3ZhbHVlfSdgO1xyXG4gICAgICBjYXNlIFwiPFNlbGVjdGVkIEl0ZW0+XCI6XHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZVxyXG4gICAgICAgICAgLnNwbGl0KFwiLFwiKVxyXG4gICAgICAgICAgLm1hcCgobSkgPT4gYCcke219J2ApXHJcbiAgICAgICAgICAuam9pbigpO1xyXG4gICAgICAgIHJldHVybiBgJHtmaWVsZH0gaW4gKCR7dmFsdWV9KWA7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgcmV0dXJuIGAke2ZpZWxkfSAke29wZXJhdG9yfSAke3ZhbHVlfWA7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU2FtcGxlUmVwb3J0IHtcclxuICBzdGF0aWMgY29sdW1uczogYW55W10gPSBbXHJcbiAgICB7XHJcbiAgICAgIGhlYWRlcjogXCJGaWVsZCAxXCIsXHJcbiAgICAgIGZpZWxkOiBcImZpZWxkMVwiLFxyXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxyXG4gICAgICB3aWR0aDogXCIyMCVcIixcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGhlYWRlcjogXCJGaWVsZCAyXCIsXHJcbiAgICAgIGZpZWxkOiBcImZpZWxkMlwiLFxyXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxyXG4gICAgICB3aWR0aDogXCIyMCVcIixcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGhlYWRlcjogXCJGaWVsZCAzXCIsXHJcbiAgICAgIGZpZWxkOiBcImZpZWxkM1wiLFxyXG4gICAgICB0eXBlOiBcIm51bWJlclwiLFxyXG4gICAgICB3aWR0aDogXCIyMCVcIixcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGhlYWRlcjogXCJGaWVsZCA0XCIsXHJcbiAgICAgIGZpZWxkOiBcImZpZWxkNFwiLFxyXG4gICAgICB0eXBlOiBcIm51bWJlclwiLFxyXG4gICAgICB3aWR0aDogXCIyMCVcIixcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGhlYWRlcjogXCJCYWxhbmNlXCIsXHJcbiAgICAgIGZpZWxkOiBcImFkdmFuY2VUb3RhbFwiLFxyXG4gICAgICB0eXBlOiBcIm51bWJlclwiLFxyXG4gICAgICB3aWR0aDogXCIyMCVcIixcclxuICAgIH0sXHJcbiAgXTtcclxuICBzdGF0aWMgcmVwb3J0czogYW55W10gPSBbXHJcbiAgICB7XHJcbiAgICAgIGdyb3VwOiBcIkdyb3VwIE5hbWUgMVwiLFxyXG4gICAgICBmaWVsZDE6IFwiVm91Y2hlciAxXCIsXHJcbiAgICAgIGZpZWxkMjogXCJBY2NvdW50TmFtZSAxXCIsXHJcbiAgICAgIGZpZWxkMzogMzMsXHJcbiAgICAgIGZpZWxkNDogMCxcclxuICAgICAgYWR2YW5jZVRvdGFsOiA1MzMsXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBncm91cDogXCJHcm91cCBOYW1lIDFcIixcclxuICAgICAgZmllbGQxOiBcIlZvdWNoZXIgMlwiLFxyXG4gICAgICBmaWVsZDI6IFwiQWNjb3VudE5hbWUgMlwiLFxyXG4gICAgICBmaWVsZDM6IDAsXHJcbiAgICAgIGZpZWxkNDogNTAwLFxyXG4gICAgICBhZHZhbmNlVG90YWw6IDMzLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgZ3JvdXA6IFwiR3JvdXAgTmFtZSAyXCIsXHJcbiAgICAgIGZpZWxkMTogXCJWb3VjaGVyIDNcIixcclxuICAgICAgZmllbGQyOiBcIkFjY291bnROYW1lIDNcIixcclxuICAgICAgZmllbGQzOiA1MCxcclxuICAgICAgZmllbGQ0OiAwLFxyXG4gICAgICBhZHZhbmNlVG90YWw6IDgzLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgZ3JvdXA6IFwiR3JvdXAgTmFtZSAyXCIsXHJcbiAgICAgIGZpZWxkMTogXCJWb3VjaGVyIDRcIixcclxuICAgICAgZmllbGQyOiBcIkFjY291bnROYW1lIDRcIixcclxuICAgICAgZmllbGQzOiAwLFxyXG4gICAgICBmaWVsZDQ6IDUwLFxyXG4gICAgICBhZHZhbmNlVG90YWw6IDMzLFxyXG4gICAgfSxcclxuICBdO1xyXG4gIHN0YXRpYyBtZXRhQ29sdW1uczogYW55ID0ge1xyXG4gICAgaGVhZGVyOiBcIlwiLFxyXG4gICAgZmllbGQ6IFwiZ3JvdXBcIixcclxuICAgIGNsYXNzTmFtZXM6IFwicm93LWdyb3VwXCIsXHJcbiAgICBmaWVsZHM6IFtcImdyb3VwXCJdLFxyXG4gICAgc3ViVG90YWw6IFtcImZpZWxkM1wiLCBcImZpZWxkNFwiXSxcclxuICB9O1xyXG4gIHN0YXRpYyBtZXRhRGF0YTogYW55ID0ge1xyXG4gICAgXCJHcm91cCBOYW1lIDFcIjoge1xyXG4gICAgICBpbmRleDogMCxcclxuICAgICAgc3ViVG90YWw6IHtcclxuICAgICAgICBmaWVsZDM6IDUzMyxcclxuICAgICAgICBmaWVsZDQ6IDUwMCxcclxuICAgICAgICBpbmRleDogMSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBcIkdyb3VwIE5hbWUgMlwiOiB7XHJcbiAgICAgIGluZGV4OiAyLFxyXG4gICAgICBzdWJUb3RhbDoge1xyXG4gICAgICAgIGZpZWxkMzogNTAsXHJcbiAgICAgICAgZmllbGQ0OiA1MCxcclxuICAgICAgICBpbmRleDogMyxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfTtcclxufVxyXG4iXX0=