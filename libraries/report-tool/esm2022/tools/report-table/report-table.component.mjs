import { Component, Input, ViewChild, ElementRef, } from "@angular/core";
import { fillColor } from "report-tool/core";
import { exportPdf, exportExcel, formatDate, sort } from "report-tool/methods";
import { OrientationType, } from "report-tool/models";
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "primeng/button";
import * as i3 from "report-tool/tools/report-preview";
export class ReportTableComponent {
    get exportTable() {
        return document.getElementById("export-table");
    }
    constructor() {
        this.dateFormat = "dd-MM-yyyy";
        this.reportTitle = {
            CompanyName: "Report Tool",
            Address: "",
        };
        this.reportMetaData = {};
        this.devidHeight = 0;
        this.Title = "Report";
        this.requestData = [];
        this.columns = [];
        this.reportData = [];
        this.orientation = OrientationType.Portrait;
        this.pageSize = "a4";
        this.ReportDate = {
            title: "Report Date",
            format: this.dateFormat,
        };
        this.fillColor = fillColor;
        this.emptyMessage = "";
        this.isResponsive = true;
    }
    ngOnInit() {
        const contentWrapper = document.getElementsByClassName("content-wrapper")[0];
        if (contentWrapper) {
            contentWrapper.className += " mb-0";
        }
        if (this.CustId) {
            this.getReportTitle();
        }
    }
    ngOnChanges(changes) {
        if (!this.columns.some((s) => s.field === "SNo")) {
            this.columns.unshift({
                header: "S.No",
                field: "SNo",
                type: "id",
                width: "75px",
                PdfWidth: 5,
                ExcelWidth: 8,
            });
        }
        if (this.CustId) {
            this.getReportTitle();
        }
        this.setReportMetaData();
    }
    print() {
        const bodyContent = document.body;
        const printContent = document.createElement("body");
        printContent.innerHTML = this.exportTable.innerHTML;
        document.body = printContent;
        window.print();
        document.body = bodyContent;
    }
    exportPdf() {
        const pdfOptions = this.exportOptions.pdfOptions;
        exportPdf(pdfOptions);
    }
    exportExcel() {
        const excelOptions = this.exportOptions.excelOptions;
        exportExcel(excelOptions);
    }
    getReportTitle() { }
    setReportMetaData() {
        let SNo = 0;
        this.reportMetaData = {};
        const reportList = this.reportMetaDataColumns
            ? sort(this.reportData, this.reportMetaDataColumns.field)
            : this.reportData;
        reportList.forEach((report, index) => {
            const setMetaData = (metadata, columns, fields = []) => {
                if (columns && columns.field) {
                    const field = report[columns.field];
                    columns.classNames = fields.length ? "row-childgroup" : "row-group";
                    columns.fields = [...fields, columns.field];
                    if (!metadata[field]) {
                        SNo = 0;
                        metadata[field] = {
                            header: this.reportMetaDataColumns.header,
                            index: +index,
                            columns: {},
                        };
                    }
                    if ((columns.subTotal || []).length) {
                        columns.subTotal.forEach((subTotalField) => {
                            const currentVal = +report[subTotalField] || 0;
                            if (!metadata[field].subTotal) {
                                metadata[field].subTotal = {};
                            }
                            const subTotal = metadata[field].subTotal[subTotalField] || 0;
                            metadata[field].subTotal[subTotalField] = subTotal + currentVal;
                            metadata[field].subTotal.index = index;
                        });
                    }
                    setMetaData(metadata[field].columns, columns.columns, columns.fields);
                }
            };
            setMetaData(this.reportMetaData, this.reportMetaDataColumns);
            report.SNo = ++SNo;
        });
    }
    get currentTime() {
        return new Date();
    }
    get exportOptions() {
        const FromDate = `${this.FromDate ? "From Date: " + this.FromDate : ""}`;
        const ToDate = ` ${this.ToDate ? "To Date: " + this.ToDate : ""}`;
        const reportDate = `${this.ReportDate.title}: ${formatDate(this.currentTime, this.ReportDate.format)}`;
        const pTableColumns = this.columns.map((col) => {
            col.dataKey = col.field;
            return col;
        });
        const eTableColumns = this.columns.map((col) => {
            const returnValue = {
                header: col.header,
                key: col.field,
                width: col.ExcelWidth,
                type: col.type,
            };
            return returnValue;
        });
        const options = {
            bgColor: this.fillColor,
            reportTitle: this.reportTitle,
            rowDataGroup: this.reportMetaDataColumns ? this.reportMetaData : null,
            isBlob: false,
        };
        const pdfOptions = {
            orientation: this.orientation,
            pageSize: this.pageSize,
            rowData: this.reportData,
            columns: pTableColumns,
            requestTitle: [reportDate],
            FromDate: [FromDate],
            ToDate: [ToDate],
            tableOptions: {
                startY: 10,
                title: this.Title,
                Fields: this.reportMetaDataColumns,
            },
            ...options,
        };
        const excelOptions = {
            columns: eTableColumns,
            reports: this.reportData,
            reportDate: `${reportDate}`,
            FromDate: `${FromDate}`,
            ToDate: `${ToDate}`,
            title: this.Title,
            rowDataGroupCols: this.reportMetaDataColumns,
            ...options,
        };
        return { pdfOptions, excelOptions };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportTableComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.2.1", type: ReportTableComponent, selector: "lib-report-table", inputs: { Title: "Title", requestData: "requestData", columns: "columns", reportData: "reportData", reportMetaDataColumns: "reportMetaDataColumns", orientation: "orientation", pageSize: "pageSize", FromDate: "FromDate", ToDate: "ToDate", CustId: "CustId", DistanceSplit: "DistanceSplit", ReportDate: "ReportDate", fillColor: "fillColor", emptyMessage: "emptyMessage", isResponsive: "isResponsive" }, viewQueries: [{ propertyName: "TABLE", first: true, predicate: ["exportTable"], descendants: true }], usesOnChanges: true, ngImport: i0, template: "<div class=\"m-1 float-right d-none d-lg-block\">\r\n  <button\r\n    type=\"button\"\r\n    pButton\r\n    icon=\"fa fa-print\"\r\n    iconPos=\"left\"\r\n    label=\"PRINT\"\r\n    (click)=\"print()\"\r\n    class=\"ui-button-info rounded-pill mx-2\"\r\n  ></button>\r\n  <button\r\n    type=\"button\"\r\n    pButton\r\n    icon=\"fa fa-file-pdf-o\"\r\n    iconPos=\"left\"\r\n    label=\"PDF\"\r\n    (click)=\"exportPdf()\"\r\n    class=\"ui-button-danger rounded-pill mx-2 text-white\"\r\n  ></button>\r\n  <button\r\n    type=\"button\"\r\n    pButton\r\n    icon=\"fa fa-file-excel-o\"\r\n    iconPos=\"left\"\r\n    label=\"EXCEL\"\r\n    (click)=\"exportExcel()\"\r\n    class=\"ui-button-success rounded-pill mx-2\"\r\n  ></button>\r\n</div>\r\n<div id=\"export-table\" #exportTable>\r\n  <table\r\n    class=\"d-md-table mb-0 table table-responsive-sm table-responsive-md-lg text-nowrap\"\r\n  >\r\n    <tbody>\r\n      <tr>\r\n        <td colSpan=\"{{ columns.length }}\" class=\"border-0 company_name p-0\">\r\n          <h2 class=\"m-0\">\r\n            <b>{{ reportTitle.CompanyRegName }}</b>\r\n          </h2>\r\n        </td>\r\n      </tr>\r\n      <tr>\r\n        <td colSpan=\"{{ columns.length }}\" class=\"border-0 address p-0 pb-2\">\r\n          {{ reportTitle.Address }}\r\n        </td>\r\n      </tr>\r\n      <tr>\r\n        <td colSpan=\"{{ columns.length }}\" class=\"border-0 report-title\">\r\n          <b>{{ Title }}</b>\r\n        </td>\r\n      </tr>\r\n      <tr>\r\n        <td\r\n          *ngIf=\"FromDate\"\r\n          style=\"text-align: left\"\r\n          class=\"border-top-0 report-date pr-4\"\r\n        >\r\n          <b>From Date:</b> {{ FromDate }}\r\n        </td>\r\n        <td\r\n          *ngIf=\"ToDate\"\r\n          style=\"text-align: center\"\r\n          class=\"border-top-0 report-date pr-4\"\r\n        >\r\n          <b>To Date:</b> {{ ToDate }}\r\n        </td>\r\n        <td\r\n          colSpan=\"{{ columns.length }}\"\r\n          class=\"border-top-0 report-date pr-4\"\r\n        >\r\n          <b>{{ ReportDate.title }}: </b>\r\n          {{ currentTime | date: ReportDate.format }}\r\n        </td>\r\n      </tr>\r\n    </tbody>\r\n  </table>\r\n  <lib-report-preview\r\n    [reportMetaData]=\"reportMetaData\"\r\n    [devidHeight]=\"devidHeight\"\r\n    [columns]=\"columns\"\r\n    [reportData]=\"reportData\"\r\n    [reportMetaDataColumns]=\"reportMetaDataColumns\"\r\n    [emptyMessage]=\"emptyMessage\"\r\n    [fillColor]=\"fillColor\"\r\n  ></lib-report-preview>\r\n</div>\r\n\r\n<!-- <ng-template #reportHeader let-classNames=\"classNames\" >\r\n  <tr>\r\n    <td colSpan=\"{{ columns.length }}\" class=\"border-0 company_name p-0\">\r\n      <h2 class=\"m-0\">\r\n        <b>{{ reportTitle.CompanyRegName }}</b>\r\n      </h2>\r\n    </td>\r\n  </tr>\r\n</ng-template> -->\r\n", styles: ["th{background-color:#ffc!important;font-family:var(--default-font)!important;font-size:16px!important;text-align:center}.table-row:nth-child(2n){background-color:#eee!important}.table-row:nth-child(odd){background-color:#fff!important}.row-group{background-color:#bfffac}.row-childgroup{background-color:#fce}tr td.vehicle_row{background-color:#beffac}tr td.date_row{background-color:#ffceac!important}.company_name{text-transform:uppercase!important;background-color:#fff!important;border:none}.address{background-color:#fff!important;border:none}.company_name,.address{border:none;text-align:center}.report-title{text-align:center;background-color:#fdc!important;border:none}.report-date{background-color:#e6f2ff!important;border:none;text-align:right}.request-data{background-color:#e6f2ff!important}@media print{th{background-color:#ffc!important;font-family:var(--default-font)!important;font-size:16px!important;-webkit-print-color-adjust:exact}.table-row:nth-child(2n){background-color:#eee!important;-webkit-print-color-adjust:exact}.table-row:nth-child(odd){background-color:#fff!important;-webkit-print-color-adjust:exact}.row-group{background-color:#bfffac;-webkit-print-color-adjust:exact}.row-childgroup{background-color:#fce;-webkit-print-color-adjust:exact}tr td.vehicle_row{background-color:#beffac!important;-webkit-print-color-adjust:exact}tr td.date_row{background-color:#ffceac!important;-webkit-print-color-adjust:exact}.company_name{text-transform:uppercase}.company_name,.address{font-weight:700;border:none!important;text-align:center}.report-title{text-align:center;background-color:#fdc!important;border:none!important;-webkit-print-color-adjust:exact}.report-date{background-color:#e6f2ff!important;border:none!important;text-align:right;-webkit-print-color-adjust:exact}.request-data{background-color:#e6f2ff!important;border:none!important;-webkit-print-color-adjust:exact}}@media all and (min-width: 767px) and (max-width: 870px){.table-responsive-md-lg{display:block!important;width:100%;overflow-x:auto}}.table td,.table th{padding:.35rem .25rem}.position-sticky{position:sticky;top:-1px;z-index:1}\n"], dependencies: [{ kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i2.ButtonDirective, selector: "[pButton]", inputs: ["iconPos", "loadingIcon", "label", "icon", "loading"] }, { kind: "component", type: i3.ReportPreviewComponent, selector: "lib-report-preview", inputs: ["reportMetaData", "devidHeight", "columns", "reportData", "reportMetaDataColumns", "emptyMessage", "fillColor", "isResponsive"] }, { kind: "pipe", type: i1.DatePipe, name: "date" }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportTableComponent, decorators: [{
            type: Component,
            args: [{ selector: "lib-report-table", template: "<div class=\"m-1 float-right d-none d-lg-block\">\r\n  <button\r\n    type=\"button\"\r\n    pButton\r\n    icon=\"fa fa-print\"\r\n    iconPos=\"left\"\r\n    label=\"PRINT\"\r\n    (click)=\"print()\"\r\n    class=\"ui-button-info rounded-pill mx-2\"\r\n  ></button>\r\n  <button\r\n    type=\"button\"\r\n    pButton\r\n    icon=\"fa fa-file-pdf-o\"\r\n    iconPos=\"left\"\r\n    label=\"PDF\"\r\n    (click)=\"exportPdf()\"\r\n    class=\"ui-button-danger rounded-pill mx-2 text-white\"\r\n  ></button>\r\n  <button\r\n    type=\"button\"\r\n    pButton\r\n    icon=\"fa fa-file-excel-o\"\r\n    iconPos=\"left\"\r\n    label=\"EXCEL\"\r\n    (click)=\"exportExcel()\"\r\n    class=\"ui-button-success rounded-pill mx-2\"\r\n  ></button>\r\n</div>\r\n<div id=\"export-table\" #exportTable>\r\n  <table\r\n    class=\"d-md-table mb-0 table table-responsive-sm table-responsive-md-lg text-nowrap\"\r\n  >\r\n    <tbody>\r\n      <tr>\r\n        <td colSpan=\"{{ columns.length }}\" class=\"border-0 company_name p-0\">\r\n          <h2 class=\"m-0\">\r\n            <b>{{ reportTitle.CompanyRegName }}</b>\r\n          </h2>\r\n        </td>\r\n      </tr>\r\n      <tr>\r\n        <td colSpan=\"{{ columns.length }}\" class=\"border-0 address p-0 pb-2\">\r\n          {{ reportTitle.Address }}\r\n        </td>\r\n      </tr>\r\n      <tr>\r\n        <td colSpan=\"{{ columns.length }}\" class=\"border-0 report-title\">\r\n          <b>{{ Title }}</b>\r\n        </td>\r\n      </tr>\r\n      <tr>\r\n        <td\r\n          *ngIf=\"FromDate\"\r\n          style=\"text-align: left\"\r\n          class=\"border-top-0 report-date pr-4\"\r\n        >\r\n          <b>From Date:</b> {{ FromDate }}\r\n        </td>\r\n        <td\r\n          *ngIf=\"ToDate\"\r\n          style=\"text-align: center\"\r\n          class=\"border-top-0 report-date pr-4\"\r\n        >\r\n          <b>To Date:</b> {{ ToDate }}\r\n        </td>\r\n        <td\r\n          colSpan=\"{{ columns.length }}\"\r\n          class=\"border-top-0 report-date pr-4\"\r\n        >\r\n          <b>{{ ReportDate.title }}: </b>\r\n          {{ currentTime | date: ReportDate.format }}\r\n        </td>\r\n      </tr>\r\n    </tbody>\r\n  </table>\r\n  <lib-report-preview\r\n    [reportMetaData]=\"reportMetaData\"\r\n    [devidHeight]=\"devidHeight\"\r\n    [columns]=\"columns\"\r\n    [reportData]=\"reportData\"\r\n    [reportMetaDataColumns]=\"reportMetaDataColumns\"\r\n    [emptyMessage]=\"emptyMessage\"\r\n    [fillColor]=\"fillColor\"\r\n  ></lib-report-preview>\r\n</div>\r\n\r\n<!-- <ng-template #reportHeader let-classNames=\"classNames\" >\r\n  <tr>\r\n    <td colSpan=\"{{ columns.length }}\" class=\"border-0 company_name p-0\">\r\n      <h2 class=\"m-0\">\r\n        <b>{{ reportTitle.CompanyRegName }}</b>\r\n      </h2>\r\n    </td>\r\n  </tr>\r\n</ng-template> -->\r\n", styles: ["th{background-color:#ffc!important;font-family:var(--default-font)!important;font-size:16px!important;text-align:center}.table-row:nth-child(2n){background-color:#eee!important}.table-row:nth-child(odd){background-color:#fff!important}.row-group{background-color:#bfffac}.row-childgroup{background-color:#fce}tr td.vehicle_row{background-color:#beffac}tr td.date_row{background-color:#ffceac!important}.company_name{text-transform:uppercase!important;background-color:#fff!important;border:none}.address{background-color:#fff!important;border:none}.company_name,.address{border:none;text-align:center}.report-title{text-align:center;background-color:#fdc!important;border:none}.report-date{background-color:#e6f2ff!important;border:none;text-align:right}.request-data{background-color:#e6f2ff!important}@media print{th{background-color:#ffc!important;font-family:var(--default-font)!important;font-size:16px!important;-webkit-print-color-adjust:exact}.table-row:nth-child(2n){background-color:#eee!important;-webkit-print-color-adjust:exact}.table-row:nth-child(odd){background-color:#fff!important;-webkit-print-color-adjust:exact}.row-group{background-color:#bfffac;-webkit-print-color-adjust:exact}.row-childgroup{background-color:#fce;-webkit-print-color-adjust:exact}tr td.vehicle_row{background-color:#beffac!important;-webkit-print-color-adjust:exact}tr td.date_row{background-color:#ffceac!important;-webkit-print-color-adjust:exact}.company_name{text-transform:uppercase}.company_name,.address{font-weight:700;border:none!important;text-align:center}.report-title{text-align:center;background-color:#fdc!important;border:none!important;-webkit-print-color-adjust:exact}.report-date{background-color:#e6f2ff!important;border:none!important;text-align:right;-webkit-print-color-adjust:exact}.request-data{background-color:#e6f2ff!important;border:none!important;-webkit-print-color-adjust:exact}}@media all and (min-width: 767px) and (max-width: 870px){.table-responsive-md-lg{display:block!important;width:100%;overflow-x:auto}}.table td,.table th{padding:.35rem .25rem}.position-sticky{position:sticky;top:-1px;z-index:1}\n"] }]
        }], ctorParameters: function () { return []; }, propDecorators: { Title: [{
                type: Input
            }], requestData: [{
                type: Input
            }], columns: [{
                type: Input
            }], reportData: [{
                type: Input
            }], reportMetaDataColumns: [{
                type: Input
            }], orientation: [{
                type: Input
            }], pageSize: [{
                type: Input
            }], FromDate: [{
                type: Input
            }], ToDate: [{
                type: Input
            }], CustId: [{
                type: Input
            }], DistanceSplit: [{
                type: Input
            }], ReportDate: [{
                type: Input
            }], fillColor: [{
                type: Input
            }], emptyMessage: [{
                type: Input
            }], isResponsive: [{
                type: Input
            }], TABLE: [{
                type: ViewChild,
                args: ["exportTable"]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3J0LXRhYmxlLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3JlcG9ydC10b29sL3Rvb2xzL3JlcG9ydC10YWJsZS9yZXBvcnQtdGFibGUuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcmVwb3J0LXRvb2wvdG9vbHMvcmVwb3J0LXRhYmxlL3JlcG9ydC10YWJsZS5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsU0FBUyxFQUVULEtBQUssRUFHTCxTQUFTLEVBQ1QsVUFBVSxHQUNYLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUM3QyxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDL0UsT0FBTyxFQUdMLGVBQWUsR0FFaEIsTUFBTSxvQkFBb0IsQ0FBQzs7Ozs7QUFPNUIsTUFBTSxPQUFPLG9CQUFvQjtJQThCL0IsSUFBWSxXQUFXO1FBQ3JCLE9BQU8sUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRUQ7UUFqQ0EsZUFBVSxHQUFHLFlBQVksQ0FBQztRQUMxQixnQkFBVyxHQUFRO1lBQ2pCLFdBQVcsRUFBRSxhQUFhO1lBQzFCLE9BQU8sRUFBRSxFQUFFO1NBQ1osQ0FBQztRQUNGLG1CQUFjLEdBQVEsRUFBRSxDQUFDO1FBQ3pCLGdCQUFXLEdBQUcsQ0FBQyxDQUFDO1FBRVAsVUFBSyxHQUFHLFFBQVEsQ0FBQztRQUNqQixnQkFBVyxHQUFVLEVBQUUsQ0FBQztRQUN4QixZQUFPLEdBQVUsRUFBRSxDQUFDO1FBQ3BCLGVBQVUsR0FBVSxFQUFFLENBQUM7UUFFdkIsZ0JBQVcsR0FBRyxlQUFlLENBQUMsUUFBUSxDQUFDO1FBQ3ZDLGFB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QUFFLEdBQUcsTUFBTSxFQUFFO1lBQ25CLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztZQUNqQixnQkFBZ0IsRUFBRSxJQUFJLENBQUMscUJBQXFCO1lBQzVDLEdBQUcsT0FBTztTQUNYLENBQUM7UUFDRixPQUFPLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxDQUFDO0lBQ3RDLENBQUM7OEdBekxVLG9CQUFvQjtrR0FBcEIsb0JBQW9CLG1rQkN4QmpDLGl6RkFnR0E7OzJGRHhFYSxvQkFBb0I7a0JBTGhDLFNBQVM7K0JBQ0Usa0JBQWtCOzBFQWFuQixLQUFLO3NCQUFiLEtBQUs7Z0JBQ0csV0FBVztzQkFBbkIsS0FBSztnQkFDRyxPQUFPO3NCQUFmLEtBQUs7Z0JBQ0csVUFBVTtzQkFBbEIsS0FBSztnQkFDRyxxQkFBcUI7c0JBQTdCLEtBQUs7Z0JBQ0csV0FBVztzQkFBbkIsS0FBSztnQkFDRyxRQUFRO3NCQUFoQixLQUFLO2dCQUNHLFFBQVE7c0JBQWhCLEtBQUs7Z0JBQ0csTUFBTTtzQkFBZCxLQUFLO2dCQUNHLE1BQU07c0JBQWQsS0FBSztnQkFDRyxhQUFhO3NCQUFyQixLQUFLO2dCQUNHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBSUcsU0FBUztzQkFBakIsS0FBSztnQkFDRyxZQUFZO3NCQUFwQixLQUFLO2dCQUNHLFlBQVk7c0JBQXBCLEtBQUs7Z0JBRW9CLEtBQUs7c0JBQTlCLFNBQVM7dUJBQUMsYUFBYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XHJcbiAgQ29tcG9uZW50LFxyXG4gIE9uSW5pdCxcclxuICBJbnB1dCxcclxuICBPbkNoYW5nZXMsXHJcbiAgU2ltcGxlQ2hhbmdlcyxcclxuICBWaWV3Q2hpbGQsXHJcbiAgRWxlbWVudFJlZixcclxufSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5cclxuaW1wb3J0IHsgZmlsbENvbG9yIH0gZnJvbSBcInJlcG9ydC10b29sL2NvcmVcIjtcclxuaW1wb3J0IHsgZXhwb3J0UGRmLCBleHBvcnRFeGNlbCwgZm9ybWF0RGF0ZSwgc29ydCB9IGZyb20gXCJyZXBvcnQtdG9vbC9tZXRob2RzXCI7XHJcbmltcG9ydCB7XHJcbiAgRXhjZWxPcHRpb25zLFxyXG4gIElDb21tb25PcHRpb25zLFxyXG4gIE9yaWVudGF0aW9uVHlwZSxcclxuICBQZGZPcHRpb25zLFxyXG59IGZyb20gXCJyZXBvcnQtdG9vbC9tb2RlbHNcIjtcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiBcImxpYi1yZXBvcnQtdGFibGVcIixcclxuICB0ZW1wbGF0ZVVybDogXCIuL3JlcG9ydC10YWJsZS5jb21wb25lbnQuaHRtbFwiLFxyXG4gIHN0eWxlVXJsczogW1wiLi9yZXBvcnQtdGFibGUuY29tcG9uZW50LmNzc1wiXSxcclxufSlcclxuZXhwb3J0IGNsYXNzIFJlcG9ydFRhYmxlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMge1xyXG4gIGRhdGVGb3JtYXQgPSBcImRkLU1NLXl5eXlcIjtcclxuICByZXBvcnRUaXRsZTogYW55ID0ge1xyXG4gICAgQ29tcGFueU5hbWU6IFwiUmVwb3J0IFRvb2xcIixcclxuICAgIEFkZHJlc3M6IFwiXCIsXHJcbiAgfTtcclxuICByZXBvcnRNZXRhRGF0YTogYW55ID0ge307XHJcbiAgZGV2aWRIZWlnaHQgPSAwO1xyXG5cclxuICBASW5wdXQoKSBUaXRsZSA9IFwiUmVwb3J0XCI7XHJcbiAgQElucHV0KCkgcmVxdWVzdERhdGE6IGFueVtdID0gW107XHJcbiAgQElucHV0KCkgY29sdW1uczogYW55W10gPSBbXTtcclxuICBASW5wdXQoKSByZXBvcnREYXRhOiBhbnlbXSA9IFtdO1xyXG4gIEBJbnB1dCgpIHJlcG9ydE1ldGFEYXRhQ29sdW1uczogYW55O1xyXG4gIEBJbnB1dCgpIG9yaWVudGF0aW9uID0gT3JpZW50YXRpb25UeXBlLlBvcnRyYWl0O1xyXG4gIEBJbnB1dCgpIHBhZ2VTaXplID0gXCJhNFwiO1xyXG4gIEBJbnB1dCgpIEZyb21EYXRlOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgVG9EYXRlOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgQ3VzdElkOiBudW1iZXI7XHJcbiAgQElucHV0KCkgRGlzdGFuY2VTcGxpdDogYm9vbGVhbjtcclxuICBASW5wdXQoKSBSZXBvcnREYXRlID0ge1xyXG4gICAgdGl0bGU6IFwiUmVwb3J0IERhdGVcIixcclxuICAgIGZvcm1hdDogdGhpcy5kYXRlRm9ybWF0LFxyXG4gIH07XHJcbiAgQElucHV0KCkgZmlsbENvbG9yID0gZmlsbENvbG9yO1xyXG4gIEBJbnB1dCgpIGVtcHR5TWVzc2FnZSA9IFwiXCI7XHJcbiAgQElucHV0KCkgaXNSZXNwb25zaXZlID0gdHJ1ZTtcclxuXHJcbiAgQFZpZXdDaGlsZChcImV4cG9ydFRhYmxlXCIpIFRBQkxFOiBFbGVtZW50UmVmO1xyXG5cclxuICBwcml2YXRlIGdldCBleHBvcnRUYWJsZSgpOiBIVE1MRWxlbWVudCB7XHJcbiAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJleHBvcnQtdGFibGVcIik7XHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RvcigpIHt9XHJcblxyXG4gIG5nT25Jbml0KCkge1xyXG4gICAgY29uc3QgY29udGVudFdyYXBwZXIgPVxyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiY29udGVudC13cmFwcGVyXCIpWzBdO1xyXG4gICAgaWYgKGNvbnRlbnRXcmFwcGVyKSB7XHJcbiAgICAgIGNvbnRlbnRXcmFwcGVyLmNsYXNzTmFtZSArPSBcIiBtYi0wXCI7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5DdXN0SWQpIHtcclxuICAgICAgdGhpcy5nZXRSZXBvcnRUaXRsZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xyXG4gICAgaWYgKCF0aGlzLmNvbHVtbnMuc29tZSgocykgPT4gcy5maWVsZCA9PT0gXCJTTm9cIikpIHtcclxuICAgICAgdGhpcy5jb2x1bW5zLnVuc2hpZnQoe1xyXG4gICAgICAgIGhlYWRlcjogXCJTLk5vXCIsXHJcbiAgICAgICAgZmllbGQ6IFwiU05vXCIsXHJcbiAgICAgICAgdHlwZTogXCJpZFwiLFxyXG4gICAgICAgIHdpZHRoOiBcIjc1cHhcIixcclxuICAgICAgICBQZGZXaWR0aDogNSxcclxuICAgICAgICBFeGNlbFdpZHRoOiA4LFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLkN1c3RJZCkge1xyXG4gICAgICB0aGlzLmdldFJlcG9ydFRpdGxlKCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnNldFJlcG9ydE1ldGFEYXRhKCk7XHJcbiAgfVxyXG5cclxuICBwcmludCgpOiB2b2lkIHtcclxuICAgIGNvbnN0IGJvZHlDb250ZW50ID0gZG9jdW1lbnQuYm9keTtcclxuICAgIGNvbnN0IHByaW50Q29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJib2R5XCIpO1xyXG4gICAgcHJpbnRDb250ZW50LmlubmVySFRNTCA9IHRoaXMuZXhwb3J0VGFibGUuaW5uZXJIVE1MO1xyXG4gICAgZG9jdW1lbnQuYm9keSA9IHByaW50Q29udGVudDtcclxuICAgIHdpbmRvdy5wcmludCgpO1xyXG4gICAgZG9jdW1lbnQuYm9keSA9IGJvZHlDb250ZW50O1xyXG4gIH1cclxuXHJcbiAgZXhwb3J0UGRmKCk6IHZvaWQge1xyXG4gICAgY29uc3QgcGRmT3B0aW9ucyA9IHRoaXMuZXhwb3J0T3B0aW9ucy5wZGZPcHRpb25zO1xyXG4gICAgZXhwb3J0UGRmKHBkZk9wdGlvbnMpO1xyXG4gIH1cclxuXHJcbiAgZXhwb3J0RXhjZWwoKTogdm9pZCB7XHJcbiAgICBjb25zdCBleGNlbE9wdGlvbnMgPSB0aGlzLmV4cG9ydE9wdGlvbnMuZXhjZWxPcHRpb25zO1xyXG4gICAgZXhwb3J0RXhjZWwoZXhjZWxPcHRpb25zKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0UmVwb3J0VGl0bGUoKTogdm9pZCB7fVxyXG5cclxuICBwcml2YXRlIHNldFJlcG9ydE1ldGFEYXRhKCk6IHZvaWQge1xyXG4gICAgbGV0IFNObyA9IDA7XHJcbiAgICB0aGlzLnJlcG9ydE1ldGFEYXRhID0ge307XHJcbiAgICBjb25zdCByZXBvcnRMaXN0ID0gdGhpcy5yZXBvcnRNZXRhRGF0YUNvbHVtbnNcclxuICAgICAgPyBzb3J0KHRoaXMucmVwb3J0RGF0YSwgdGhpcy5yZXBvcnRNZXRhRGF0YUNvbHVtbnMuZmllbGQpXHJcbiAgICAgIDogdGhpcy5yZXBvcnREYXRhO1xyXG4gICAgcmVwb3J0TGlzdC5mb3JFYWNoKChyZXBvcnQsIGluZGV4KSA9PiB7XHJcbiAgICAgIGNvbnN0IHNldE1ldGFEYXRhID0gKG1ldGFkYXRhOiBhbnksIGNvbHVtbnM6IGFueSwgZmllbGRzID0gW10pID0+IHtcclxuICAgICAgICBpZiAoY29sdW1ucyAmJiBjb2x1bW5zLmZpZWxkKSB7XHJcbiAgICAgICAgICBjb25zdCBmaWVsZCA9IHJlcG9ydFtjb2x1bW5zLmZpZWxkXTtcclxuICAgICAgICAgIGNvbHVtbnMuY2xhc3NOYW1lcyA9IGZpZWxkcy5sZW5ndGggPyBcInJvdy1jaGlsZGdyb3VwXCIgOiBcInJvdy1ncm91cFwiO1xyXG4gICAgICAgICAgY29sdW1ucy5maWVsZHMgPSBbLi4uZmllbGRzLCBjb2x1bW5zLmZpZWxkXTtcclxuICAgICAgICAgIGlmICghbWV0YWRhdGFbZmllbGRdKSB7XHJcbiAgICAgICAgICAgIFNObyA9IDA7XHJcbiAgICAgICAgICAgIG1ldGFkYXRhW2ZpZWxkXSA9IHtcclxuICAgICAgICAgICAgICBoZWFkZXI6IHRoaXMucmVwb3J0TWV0YURhdGFDb2x1bW5zLmhlYWRlcixcclxuICAgICAgICAgICAgICBpbmRleDogK2luZGV4LFxyXG4gICAgICAgICAgICAgIGNvbHVtbnM6IHt9LFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKChjb2x1bW5zLnN1YlRvdGFsIHx8IFtdKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgKGNvbHVtbnMuc3ViVG90YWwgYXMgc3RyaW5nW10pLmZvckVhY2goKHN1YlRvdGFsRmllbGQpID0+IHtcclxuICAgICAgICAgICAgICBjb25zdCBjdXJyZW50VmFsID0gK3JlcG9ydFtzdWJUb3RhbEZpZWxkXSB8fCAwO1xyXG4gICAgICAgICAgICAgIGlmICghbWV0YWRhdGFbZmllbGRdLnN1YlRvdGFsKSB7XHJcbiAgICAgICAgICAgICAgICBtZXRhZGF0YVtmaWVsZF0uc3ViVG90YWwgPSB7fTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgY29uc3Qgc3ViVG90YWwgPSBtZXRhZGF0YVtmaWVsZF0uc3ViVG90YWxbc3ViVG90YWxGaWVsZF0gfHwgMDtcclxuICAgICAgICAgICAgICBtZXRhZGF0YVtmaWVsZF0uc3ViVG90YWxbc3ViVG90YWxGaWVsZF0gPSBzdWJUb3RhbCArIGN1cnJlbnRWYWw7XHJcbiAgICAgICAgICAgICAgbWV0YWRhdGFbZmllbGRdLnN1YlRvdGFsLmluZGV4ID0gaW5kZXg7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgc2V0TWV0YURhdGEobWV0YWRhdGFbZmllbGRdLmNvbHVtbnMsIGNvbHVtbnMuY29sdW1ucywgY29sdW1ucy5maWVsZHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgc2V0TWV0YURhdGEodGhpcy5yZXBvcnRNZXRhRGF0YSwgdGhpcy5yZXBvcnRNZXRhRGF0YUNvbHVtbnMpO1xyXG4gICAgICByZXBvcnQuU05vID0gKytTTm87XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGdldCBjdXJyZW50VGltZSgpOiBEYXRlIHtcclxuICAgIHJldHVybiBuZXcgRGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXQgZXhwb3J0T3B0aW9ucygpOiB7XHJcbiAgICBwZGZPcHRpb25zOiBQZGZPcHRpb25zO1xyXG4gICAgZXhjZWxPcHRpb25zOiBFeGNlbE9wdGlvbnM7XHJcbiAgfSB7XHJcbiAgICBjb25zdCBGcm9tRGF0ZSA9IGAke3RoaXMuRnJvbURhdGUgPyBcIkZyb20gRGF0ZTogXCIgKyB0aGlzLkZyb21EYXRlIDogXCJcIn1gO1xyXG4gICAgY29uc3QgVG9EYXRlID0gYCAke3RoaXMuVG9EYXRlID8gXCJUbyBEYXRlOiBcIiArIHRoaXMuVG9EYXRlIDogXCJcIn1gO1xyXG4gICAgY29uc3QgcmVwb3J0RGF0ZSA9IGAke3RoaXMuUmVwb3J0RGF0ZS50aXRsZX06ICR7Zm9ybWF0RGF0ZShcclxuICAgICAgdGhpcy5jdXJyZW50VGltZSxcclxuICAgICAgdGhpcy5SZXBvcnREYXRlLmZvcm1hdFxyXG4gICAgKX1gO1xyXG4gICAgY29uc3QgcFRhYmxlQ29sdW1ucyA9IHRoaXMuY29sdW1ucy5tYXAoKGNvbCkgPT4ge1xyXG4gICAgICBjb2wuZGF0YUtleSA9IGNvbC5maWVsZDtcclxuICAgICAgcmV0dXJuIGNvbDtcclxuICAgIH0pO1xyXG4gICAgY29uc3QgZVRhYmxlQ29sdW1ucyA9IHRoaXMuY29sdW1ucy5tYXAoKGNvbCkgPT4ge1xyXG4gICAgICBjb25zdCByZXR1cm5WYWx1ZSA9IHtcclxuICAgICAgICBoZWFkZXI6IGNvbC5oZWFkZXIsXHJcbiAgICAgICAga2V5OiBjb2wuZmllbGQsXHJcbiAgICAgICAgd2lkdGg6IGNvbC5FeGNlbFdpZHRoLFxyXG4gICAgICAgIHR5cGU6IGNvbC50eXBlLFxyXG4gICAgICB9O1xyXG4gICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zOiBJQ29tbW9uT3B0aW9ucyA9IHtcclxuICAgICAgYmdDb2xvcjogdGhpcy5maWxsQ29sb3IsXHJcbiAgICAgIHJlcG9ydFRpdGxlOiB0aGlzLnJlcG9ydFRpdGxlLFxyXG4gICAgICByb3dEYXRhR3JvdXA6IHRoaXMucmVwb3J0TWV0YURhdGFDb2x1bW5zID8gdGhpcy5yZXBvcnRNZXRhRGF0YSA6IG51bGwsXHJcbiAgICAgIGlzQmxvYjogZmFsc2UsXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHBkZk9wdGlvbnM6IFBkZk9wdGlvbnMgPSB7XHJcbiAgICAgIG9yaWVudGF0aW9uOiB0aGlzLm9yaWVudGF0aW9uLFxyXG4gICAgICBwYWdlU2l6ZTogdGhpcy5wYWdlU2l6ZSxcclxuICAgICAgcm93RGF0YTogdGhpcy5yZXBvcnREYXRhLFxyXG4gICAgICBjb2x1bW5zOiBwVGFibGVDb2x1bW5zLFxyXG4gICAgICByZXF1ZXN0VGl0bGU6IFtyZXBvcnREYXRlXSxcclxuICAgICAgRnJvbURhdGU6IFtGcm9tRGF0ZV0sXHJcbiAgICAgIFRvRGF0ZTogW1RvRGF0ZV0sXHJcbiAgICAgIHRhYmxlT3B0aW9uczoge1xyXG4gICAgICAgIHN0YXJ0WTogMTAsXHJcbiAgICAgICAgdGl0bGU6IHRoaXMuVGl0bGUsXHJcbiAgICAgICAgRmllbGRzOiB0aGlzLnJlcG9ydE1ldGFEYXRhQ29sdW1ucyxcclxuICAgICAgfSxcclxuICAgICAgLi4ub3B0aW9ucyxcclxuICAgIH07XHJcbiAgICBjb25zdCBleGNlbE9wdGlvbnM6IEV4Y2VsT3B0aW9ucyA9IHtcclxuICAgICAgY29sdW1uczogZVRhYmxlQ29sdW1ucyxcclxuICAgICAgcmVwb3J0czogdGhpcy5yZXBvcnREYXRhLFxyXG4gICAgICByZXBvcnREYXRlOiBgJHtyZXBvcnREYXRlfWAsXHJcbiAgICAgIEZyb21EYXRlOiBgJHtGcm9tRGF0ZX1gLFxyXG4gICAgICBUb0RhdGU6IGAke1RvRGF0ZX1gLFxyXG4gICAgICB0aXRsZTogdGhpcy5UaXRsZSxcclxuICAgICAgcm93RGF0YUdyb3VwQ29sczogdGhpcy5yZXBvcnRNZXRhRGF0YUNvbHVtbnMsXHJcbiAgICAgIC4uLm9wdGlvbnMsXHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIHsgcGRmT3B0aW9ucywgZXhjZWxPcHRpb25zIH07XHJcbiAgfVxyXG59XHJcbiIsIjxkaXYgY2xhc3M9XCJtLTEgZmxvYXQtcmlnaHQgZC1ub25lIGQtbGctYmxvY2tcIj5cclxuICA8YnV0dG9uXHJcbiAgICB0eXBlPVwiYnV0dG9uXCJcclxuICAgIHBCdXR0b25cclxuICAgIGljb249XCJmYSBmYS1wcmludFwiXHJcbiAgICBpY29uUG9zPVwibGVmdFwiXHJcbiAgICBsYWJlbD1cIlBSSU5UXCJcclxuICAgIChjbGljayk9XCJwcmludCgpXCJcclxuICAgIGNsYXNzPVwidWktYnV0dG9uLWluZm8gcm91bmRlZC1waWxsIG14LTJcIlxyXG4gID48L2J1dHRvbj5cclxuICA8YnV0dG9uXHJcbiAgICB0eXBlPVwiYnV0dG9uXCJcclxuICAgIHBCdXR0b25cclxuICAgIGljb249XCJmYSBmYS1maWxlLXBkZi1vXCJcclxuICAgIGljb25Qb3M9XCJsZWZ0XCJcclxuICAgIGxhYmVsPVwiUERGXCJcclxuICAgIChjbGljayk9XCJleHBvcnRQZGYoKVwiXHJcbiAgICBjbGFzcz1cInVpLWJ1dHRvbi1kYW5nZXIgcm91bmRlZC1waWxsIG14LTIgdGV4dC13aGl0ZVwiXHJcbiAgPjwvYnV0dG9uPlxyXG4gIDxidXR0b25cclxuICAgIHR5cGU9XCJidXR0b25cIlxyXG4gICAgcEJ1dHRvblxyXG4gICAgaWNvbj1cImZhIGZhLWZpbGUtZXhjZWwtb1wiXHJcbiAgICBpY29uUG9zPVwibGVmdFwiXHJcbiAgICBsYWJlbD1cIkVYQ0VMXCJcclxuICAgIChjbGljayk9XCJleHBvcnRFeGNlbCgpXCJcclxuICAgIGNsYXNzPVwidWktYnV0dG9uLXN1Y2Nlc3Mgcm91bmRlZC1waWxsIG14LTJcIlxyXG4gID48L2J1dHRvbj5cclxuPC9kaXY+XHJcbjxkaXYgaWQ9XCJleHBvcnQtdGFibGVcIiAjZXhwb3J0VGFibGU+XHJcbiAgPHRhYmxlXHJcbiAgICBjbGFzcz1cImQtbWQtdGFibGUgbWItMCB0YWJsZSB0YWJsZS1yZXNwb25zaXZlLXNtIHRhYmxlLXJlc3BvbnNpdmUtbWQtbGcgdGV4dC1ub3dyYXBcIlxyXG4gID5cclxuICAgIDx0Ym9keT5cclxuICAgICAgPHRyPlxyXG4gICAgICAgIDx0ZCBjb2xTcGFuPVwie3sgY29sdW1ucy5sZW5ndGggfX1cIiBjbGFzcz1cImJvcmRlci0wIGNvbXBhbnlfbmFtZSBwLTBcIj5cclxuICAgICAgICAgIDxoMiBjbGFzcz1cIm0tMFwiPlxyXG4gICAgICAgICAgICA8Yj57eyByZXBvcnRUaXRsZS5Db21wYW55UmVnTmFtZSB9fTwvYj5cclxuICAgICAgICAgIDwvaDI+XHJcbiAgICAgICAgPC90ZD5cclxuICAgICAgPC90cj5cclxuICAgICAgPHRyPlxyXG4gICAgICAgIDx0ZCBjb2xTcGFuPVwie3sgY29sdW1ucy5sZW5ndGggfX1cIiBjbGFzcz1cImJvcmRlci0wIGFkZHJlc3MgcC0wIHBiLTJcIj5cclxuICAgICAgICAgIHt7IHJlcG9ydFRpdGxlLkFkZHJlc3MgfX1cclxuICAgICAgICA8L3RkPlxyXG4gICAgICA8L3RyPlxyXG4gICAgICA8dHI+XHJcbiAgICAgICAgPHRkIGNvbFNwYW49XCJ7eyBjb2x1bW5zLmxlbmd0aCB9fVwiIGNsYXNzPVwiYm9yZGVyLTAgcmVwb3J0LXRpdGxlXCI+XHJcbiAgICAgICAgICA8Yj57eyBUaXRsZSB9fTwvYj5cclxuICAgICAgICA8L3RkPlxyXG4gICAgICA8L3RyPlxyXG4gICAgICA8dHI+XHJcbiAgICAgICAgPHRkXHJcbiAgICAgICAgICAqbmdJZj1cIkZyb21EYXRlXCJcclxuICAgICAgICAgIHN0eWxlPVwidGV4dC1hbGlnbjogbGVmdFwiXHJcbiAgICAgICAgICBjbGFzcz1cImJvcmRlci10b3AtMCByZXBvcnQtZGF0ZSBwci00XCJcclxuICAgICAgICA+XHJcbiAgICAgICAgICA8Yj5Gcm9tIERhdGU6PC9iPiB7eyBGcm9tRGF0ZSB9fVxyXG4gICAgICAgIDwvdGQ+XHJcbiAgICAgICAgPHRkXHJcbiAgICAgICAgICAqbmdJZj1cIlRvRGF0ZVwiXHJcbiAgICAgICAgICBzdHlsZT1cInRleHQtYWxpZ246IGNlbnRlclwiXHJcbiAgICAgICAgICBjbGFzcz1cImJvcmRlci10b3AtMCByZXBvcnQtZGF0ZSBwci00XCJcclxuICAgICAgICA+XHJcbiAgICAgICAgICA8Yj5UbyBEYXRlOjwvYj4ge3sgVG9EYXRlIH19XHJcbiAgICAgICAgPC90ZD5cclxuICAgICAgICA8dGRcclxuICAgICAgICAgIGNvbFNwYW49XCJ7eyBjb2x1bW5zLmxlbmd0aCB9fVwiXHJcbiAgICAgICAgICBjbGFzcz1cImJvcmRlci10b3AtMCByZXBvcnQtZGF0ZSBwci00XCJcclxuICAgICAgICA+XHJcbiAgICAgICAgICA8Yj57eyBSZXBvcnREYXRlLnRpdGxlIH19OiA8L2I+XHJcbiAgICAgICAgICB7eyBjdXJyZW50VGltZSB8IGRhdGU6IFJlcG9ydERhdGUuZm9ybWF0IH19XHJcbiAgICAgICAgPC90ZD5cclxuICAgICAgPC90cj5cclxuICAgIDwvdGJvZHk+XHJcbiAgPC90YWJsZT5cclxuICA8bGliLXJlcG9ydC1wcmV2aWV3XHJcbiAgICBbcmVwb3J0TWV0YURhdGFdPVwicmVwb3J0TWV0YURhdGFcIlxyXG4gICAgW2RldmlkSGVpZ2h0XT1cImRldmlkSGVpZ2h0XCJcclxuICAgIFtjb2x1bW5zXT1cImNvbHVtbnNcIlxyXG4gICAgW3JlcG9ydERhdGFdPVwicmVwb3J0RGF0YVwiXHJcbiAgICBbcmVwb3J0TWV0YURhdGFDb2x1bW5zXT1cInJlcG9ydE1ldGFEYXRhQ29sdW1uc1wiXHJcbiAgICBbZW1wdHlNZXNzYWdlXT1cImVtcHR5TWVzc2FnZVwiXHJcbiAgICBbZmlsbENvbG9yXT1cImZpbGxDb2xvclwiXHJcbiAgPjwvbGliLXJlcG9ydC1wcmV2aWV3PlxyXG48L2Rpdj5cclxuXHJcbjwhLS0gPG5nLXRlbXBsYXRlICNyZXBvcnRIZWFkZXIgbGV0LWNsYXNzTmFtZXM9XCJjbGFzc05hbWVzXCIgPlxyXG4gIDx0cj5cclxuICAgIDx0ZCBjb2xTcGFuPVwie3sgY29sdW1ucy5sZW5ndGggfX1cIiBjbGFzcz1cImJvcmRlci0wIGNvbXBhbnlfbmFtZSBwLTBcIj5cclxuICAgICAgPGgyIGNsYXNzPVwibS0wXCI+XHJcbiAgICAgICAgPGI+e3sgcmVwb3J0VGl0bGUuQ29tcGFueVJlZ05hbWUgfX08L2I+XHJcbiAgICAgIDwvaDI+XHJcbiAgICA8L3RkPlxyXG4gIDwvdHI+XHJcbjwvbmctdGVtcGxhdGU+IC0tPlxyXG4iXX0=