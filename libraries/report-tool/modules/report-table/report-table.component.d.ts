import * as i0 from "@angular/core";
export declare class ReportTableComponent {
    reportMetaData: any;
    devidHeight: number;
    columns: any[];
    reportData: any[];
    reportMetaDataColumns: any;
    emptyMessage: string;
    fillColor: import("report-tool/models").IReportRow;
    isResponsive: boolean;
    constructor();
    getColumnWidth(width: any): string;
    getMetaDataRow(rowData: any, index: number, metaColumns: any): any;
    showMetaDataRow(rowData: any, index: number, metaColumns: any): boolean;
    showMetaDataSubTotalRow(rowData: any, index: number, metaColumns: any): boolean;
    showMetaDataSubTotalCol(column: string, metaColumns: any): boolean;
    getMetadataSubTotal(rowData: any, column: string, metaColumns: any): number;
    getTextColor(rowData: any, textColors: any): string;
    private setDevidHeight;
    static ɵfac: i0.ɵɵFactoryDeclaration<ReportTableComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ReportTableComponent, "lib-report-table", never, { "reportMetaData": { "alias": "reportMetaData"; "required": false; }; "devidHeight": { "alias": "devidHeight"; "required": false; }; "columns": { "alias": "columns"; "required": false; }; "reportData": { "alias": "reportData"; "required": false; }; "reportMetaDataColumns": { "alias": "reportMetaDataColumns"; "required": false; }; "emptyMessage": { "alias": "emptyMessage"; "required": false; }; "fillColor": { "alias": "fillColor"; "required": false; }; "isResponsive": { "alias": "isResponsive"; "required": false; }; }, {}, never, never, false, never>;
}
