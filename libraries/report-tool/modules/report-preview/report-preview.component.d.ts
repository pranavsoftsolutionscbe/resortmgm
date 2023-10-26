import { SimpleChanges, ElementRef, OnInit, OnChanges } from "@angular/core";
import * as i0 from "@angular/core";
export declare class ReportPreviewComponent implements OnInit, OnChanges {
    dateFormat: string;
    reportTitle: any;
    reportMetaData: any;
    devidHeight: number;
    Title: string;
    requestData: any[];
    columns: any[];
    reportData: any[];
    reportMetaDataColumns: any;
    orientation: string;
    pageSize: string;
    FromDate: string;
    ToDate: string;
    CustId: number;
    DistanceSplit: boolean;
    ReportDate: {
        title: string;
        format: string;
    };
    fillColor: import("report-tool/models").IReportRow;
    emptyMessage: string;
    isResponsive: boolean;
    TABLE: ElementRef;
    private get exportTable();
    constructor();
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    print(): void;
    exportPdf(): void;
    exportExcel(): void;
    private getReportTitle;
    private setReportColumns;
    private setReportMetaData;
    get currentTime(): Date;
    private get exportOptions();
    static ɵfac: i0.ɵɵFactoryDeclaration<ReportPreviewComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ReportPreviewComponent, "lib-report-preview", never, { "Title": { "alias": "Title"; "required": false; }; "requestData": { "alias": "requestData"; "required": false; }; "columns": { "alias": "columns"; "required": false; }; "reportData": { "alias": "reportData"; "required": false; }; "reportMetaDataColumns": { "alias": "reportMetaDataColumns"; "required": false; }; "orientation": { "alias": "orientation"; "required": false; }; "pageSize": { "alias": "pageSize"; "required": false; }; "FromDate": { "alias": "FromDate"; "required": false; }; "ToDate": { "alias": "ToDate"; "required": false; }; "CustId": { "alias": "CustId"; "required": false; }; "DistanceSplit": { "alias": "DistanceSplit"; "required": false; }; "ReportDate": { "alias": "ReportDate"; "required": false; }; "fillColor": { "alias": "fillColor"; "required": false; }; "emptyMessage": { "alias": "emptyMessage"; "required": false; }; "isResponsive": { "alias": "isResponsive"; "required": false; }; }, {}, never, never, false, never>;
}
