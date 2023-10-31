import * as i0 from '@angular/core';
import { Component, Input, ViewChild, NgModule } from '@angular/core';
import { fillColor } from 'report-tool/core';
import { exportPdf, exportExcel, sort, formatDate } from 'report-tool/methods';
import { OrientationType } from 'report-tool/models';
import * as i1 from '@angular/common';
import { CommonModule, DatePipe } from '@angular/common';
import * as i2 from 'primeng/button';
import { ButtonModule } from 'primeng/button';
import * as i3 from 'report-tool/modules/report-table';
import { ReportTableModule } from 'report-tool/modules/report-table';

class ReportPreviewComponent {
    get exportTable() {
        // return document.getElementById(this.id);
        return document.querySelector("#" + this.id);
    }
    constructor() {
        this.dateFormat = "dd-MM-yyyy";
        this.reportMetaData = {};
        this.devidHeight = 0;
        this.id = "export-table";
        this.reportTitle = {
            CompanyName: "Report Tool",
            Address: "",
        };
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
    }
    ngOnChanges(changes) {
        if (changes.columns) {
            this.setReportColumns();
        }
        if (changes.reportMetaDataColumns) {
            this.setReportMetaData();
        }
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
    setReportColumns() {
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
    }
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportPreviewComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.2.1", type: ReportPreviewComponent, selector: "lib-report-preview", inputs: { reportTitle: "reportTitle", Title: "Title", requestData: "requestData", columns: "columns", reportData: "reportData", reportMetaDataColumns: "reportMetaDataColumns", orientation: "orientation", pageSize: "pageSize", FromDate: "FromDate", ToDate: "ToDate", DistanceSplit: "DistanceSplit", ReportDate: "ReportDate", fillColor: "fillColor", emptyMessage: "emptyMessage", isResponsive: "isResponsive" }, viewQueries: [{ propertyName: "TABLE", first: true, predicate: ["exportTable"], descendants: true }], usesOnChanges: true, ngImport: i0, template: "<div class=\"m-1 float-end d-none d-lg-block\">\r\n  <button\r\n    type=\"button\"\r\n    pButton\r\n    icon=\"fa fa-print\"\r\n    iconPos=\"left\"\r\n    label=\"PRINT\"\r\n    (click)=\"print()\"\r\n    class=\"ui-button-info rounded-pill mx-2\"\r\n  ></button>\r\n  <button\r\n    type=\"button\"\r\n    pButton\r\n    icon=\"fa fa-file-pdf-o\"\r\n    iconPos=\"left\"\r\n    label=\"PDF\"\r\n    (click)=\"exportPdf()\"\r\n    class=\"ui-button-danger rounded-pill mx-2 text-white\"\r\n  ></button>\r\n  <button\r\n    type=\"button\"\r\n    pButton\r\n    icon=\"fa fa-file-excel-o\"\r\n    iconPos=\"left\"\r\n    label=\"EXCEL\"\r\n    (click)=\"exportExcel()\"\r\n    class=\"ui-button-success rounded-pill mx-2\"\r\n  ></button>\r\n</div>\r\n<div [id]=\"id\" #exportTable>\r\n  <table\r\n    class=\"d-md-table mb-0 table table-responsive-sm table-responsive-md-lg text-nowrap\"\r\n  >\r\n    <tbody>\r\n      <tr>\r\n        <td colSpan=\"{{ columns.length }}\" class=\"border-0 company_name p-0\">\r\n          <h2 class=\"m-0\">\r\n            <b>{{ reportTitle.CompanyRegName || reportTitle.CompanyName }}</b>\r\n          </h2>\r\n        </td>\r\n      </tr>\r\n      <tr>\r\n        <td colSpan=\"{{ columns.length }}\" class=\"border-0 address p-0 pb-2\">\r\n          {{ reportTitle.Address }}\r\n        </td>\r\n      </tr>\r\n      <tr>\r\n        <td colSpan=\"{{ columns.length }}\" class=\"border-0 report-title\">\r\n          <b>{{ Title }}</b>\r\n        </td>\r\n      </tr>\r\n      <tr>\r\n        <td\r\n          *ngIf=\"FromDate\"\r\n          style=\"text-align: left\"\r\n          class=\"border-top-0 report-date pr-4\"\r\n        >\r\n          <b>From Date:</b> {{ FromDate }}\r\n        </td>\r\n        <td\r\n          *ngIf=\"ToDate\"\r\n          style=\"text-align: center\"\r\n          class=\"border-top-0 report-date pr-4\"\r\n        >\r\n          <b>To Date:</b> {{ ToDate }}\r\n        </td>\r\n        <td\r\n          colSpan=\"{{ columns.length }}\"\r\n          class=\"border-top-0 report-date pr-4\"\r\n        >\r\n          <b>{{ ReportDate.title }}: </b>\r\n          {{ currentTime | date: ReportDate.format }}\r\n        </td>\r\n      </tr>\r\n    </tbody>\r\n  </table>\r\n  <lib-report-table\r\n    [reportMetaData]=\"reportMetaData\"\r\n    [devidHeight]=\"devidHeight\"\r\n    [columns]=\"columns\"\r\n    [reportData]=\"reportData\"\r\n    [reportMetaDataColumns]=\"reportMetaDataColumns\"\r\n    [emptyMessage]=\"emptyMessage\"\r\n    [fillColor]=\"fillColor\"\r\n  ></lib-report-table>\r\n</div>\r\n\r\n<!-- <ng-template #reportHeader let-classNames=\"classNames\" >\r\n  <tr>\r\n    <td colSpan=\"{{ columns.length }}\" class=\"border-0 company_name p-0\">\r\n      <h2 class=\"m-0\">\r\n        <b>{{ reportTitle.CompanyRegName }}</b>\r\n      </h2>\r\n    </td>\r\n  </tr>\r\n</ng-template> -->\r\n", dependencies: [{ kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i2.ButtonDirective, selector: "[pButton]", inputs: ["iconPos", "loadingIcon", "label", "icon", "loading"] }, { kind: "component", type: i3.ReportTableComponent, selector: "lib-report-table", inputs: ["reportMetaData", "devidHeight", "columns", "reportData", "reportMetaDataColumns", "emptyMessage", "fillColor", "isResponsive"] }, { kind: "pipe", type: i1.DatePipe, name: "date" }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportPreviewComponent, decorators: [{
            type: Component,
            args: [{ selector: "lib-report-preview", template: "<div class=\"m-1 float-end d-none d-lg-block\">\r\n  <button\r\n    type=\"button\"\r\n    pButton\r\n    icon=\"fa fa-print\"\r\n    iconPos=\"left\"\r\n    label=\"PRINT\"\r\n    (click)=\"print()\"\r\n    class=\"ui-button-info rounded-pill mx-2\"\r\n  ></button>\r\n  <button\r\n    type=\"button\"\r\n    pButton\r\n    icon=\"fa fa-file-pdf-o\"\r\n    iconPos=\"left\"\r\n    label=\"PDF\"\r\n    (click)=\"exportPdf()\"\r\n    class=\"ui-button-danger rounded-pill mx-2 text-white\"\r\n  ></button>\r\n  <button\r\n    type=\"button\"\r\n    pButton\r\n    icon=\"fa fa-file-excel-o\"\r\n    iconPos=\"left\"\r\n    label=\"EXCEL\"\r\n    (click)=\"exportExcel()\"\r\n    class=\"ui-button-success rounded-pill mx-2\"\r\n  ></button>\r\n</div>\r\n<div [id]=\"id\" #exportTable>\r\n  <table\r\n    class=\"d-md-table mb-0 table table-responsive-sm table-responsive-md-lg text-nowrap\"\r\n  >\r\n    <tbody>\r\n      <tr>\r\n        <td colSpan=\"{{ columns.length }}\" class=\"border-0 company_name p-0\">\r\n          <h2 class=\"m-0\">\r\n            <b>{{ reportTitle.CompanyRegName || reportTitle.CompanyName }}</b>\r\n          </h2>\r\n        </td>\r\n      </tr>\r\n      <tr>\r\n        <td colSpan=\"{{ columns.length }}\" class=\"border-0 address p-0 pb-2\">\r\n          {{ reportTitle.Address }}\r\n        </td>\r\n      </tr>\r\n      <tr>\r\n        <td colSpan=\"{{ columns.length }}\" class=\"border-0 report-title\">\r\n          <b>{{ Title }}</b>\r\n        </td>\r\n      </tr>\r\n      <tr>\r\n        <td\r\n          *ngIf=\"FromDate\"\r\n          style=\"text-align: left\"\r\n          class=\"border-top-0 report-date pr-4\"\r\n        >\r\n          <b>From Date:</b> {{ FromDate }}\r\n        </td>\r\n        <td\r\n          *ngIf=\"ToDate\"\r\n          style=\"text-align: center\"\r\n          class=\"border-top-0 report-date pr-4\"\r\n        >\r\n          <b>To Date:</b> {{ ToDate }}\r\n        </td>\r\n        <td\r\n          colSpan=\"{{ columns.length }}\"\r\n          class=\"border-top-0 report-date pr-4\"\r\n        >\r\n          <b>{{ ReportDate.title }}: </b>\r\n          {{ currentTime | date: ReportDate.format }}\r\n        </td>\r\n      </tr>\r\n    </tbody>\r\n  </table>\r\n  <lib-report-table\r\n    [reportMetaData]=\"reportMetaData\"\r\n    [devidHeight]=\"devidHeight\"\r\n    [columns]=\"columns\"\r\n    [reportData]=\"reportData\"\r\n    [reportMetaDataColumns]=\"reportMetaDataColumns\"\r\n    [emptyMessage]=\"emptyMessage\"\r\n    [fillColor]=\"fillColor\"\r\n  ></lib-report-table>\r\n</div>\r\n\r\n<!-- <ng-template #reportHeader let-classNames=\"classNames\" >\r\n  <tr>\r\n    <td colSpan=\"{{ columns.length }}\" class=\"border-0 company_name p-0\">\r\n      <h2 class=\"m-0\">\r\n        <b>{{ reportTitle.CompanyRegName }}</b>\r\n      </h2>\r\n    </td>\r\n  </tr>\r\n</ng-template> -->\r\n" }]
        }], ctorParameters: function () { return []; }, propDecorators: { reportTitle: [{
                type: Input
            }], Title: [{
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

class ReportPreviewModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportPreviewModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.2.1", ngImport: i0, type: ReportPreviewModule, declarations: [ReportPreviewComponent], imports: [CommonModule, ButtonModule, ReportTableModule], exports: [ReportPreviewComponent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportPreviewModule, providers: [DatePipe], imports: [CommonModule, ButtonModule, ReportTableModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportPreviewModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [ReportPreviewComponent],
                    imports: [CommonModule, ButtonModule, ReportTableModule],
                    exports: [ReportPreviewComponent],
                    providers: [DatePipe],
                }]
        }] });

/*
 * Public API Surface of report-tool
 */

/**
 * Generated bundle index. Do not edit.
 */

export { ReportPreviewComponent, ReportPreviewModule };
//# sourceMappingURL=report-tool-modules-report-preview.mjs.map
