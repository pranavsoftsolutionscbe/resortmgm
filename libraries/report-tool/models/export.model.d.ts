import { Column } from "exceljs";
import { IReportRow } from "./report-tool.model";
export declare class ExportExtentions {
    static readonly PDF = ".pdf";
    static readonly EXCEL = ".xlsx";
}
export declare class ExportTypes {
    static readonly PDF = "application/pdf";
    static readonly EXCEL = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
}
export declare class OrientationType {
    static readonly Portrait = "portrait";
    static readonly Landscape = "landscape";
}
export interface PDFFillText {
    value: string;
    hStart?: number;
    height?: number;
    x?: number;
    y?: number;
    align?: string;
}
export interface ExcelHeader extends Column {
    type?: string;
}
export interface ICommonOptions {
    bgColor?: IReportRow;
    reportTitle?: any;
    rowDataGroup?: any;
    isBlob?: boolean;
}
export interface PdfOptions extends ICommonOptions {
    orientation?: any;
    pageSize?: string;
    rowData?: any[];
    columns?: any[];
    subColumns?: any[];
    requestTitle?: string[];
    tableOptions?: any;
    FromDate?: string[];
    ToDate?: string[];
}
export interface ExcelOptions extends ICommonOptions {
    columns?: Partial<ExcelHeader>[];
    subColumns?: Partial<Column>[];
    reports?: any[];
    rowDataGroupCols?: any;
    title?: any;
    showHeaderRow?: boolean;
    isWrapCell?: boolean;
    FromDate?: string;
    ToDate?: string;
    reportDate?: string;
}
