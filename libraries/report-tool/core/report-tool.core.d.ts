import { SelectItem } from "primeng/api";
import { IReportDetails, IReportRow } from "report-tool/models";
export declare const validDetails: IReportDetails;
export declare const validOrderBy: IReportDetails;
export declare const validGroupingEligible: IReportDetails;
export declare const validGroupBy: IReportDetails;
export declare const validSumField: IReportDetails;
export declare const validRunningTotal: IReportDetails;
export declare const validGroupTotal: IReportDetails;
export declare const validGrandTotal: IReportDetails;
export declare const validFilterField: IReportDetails;
export declare const fillColor: IReportRow;
export declare const dateRange: SelectItem[];
export declare class OrderByPref {
    static ASC: string;
    static DESC: string;
}
export declare class FilterByRef {
    static Number: {
        label: string;
        value: number;
    }[];
    static String: {
        label: string;
        value: number;
    }[];
    static WhereCondition(field: string, operator: string, value: string): string;
}
export declare class SampleReport {
    static columns: any[];
    static reports: any[];
    static metaColumns: any;
    static metaData: any;
}
