import { Component, Input, ViewChild, ElementRef, } from "@angular/core";
import { fillColor } from "report-tool/core";
import { exportPdf, exportExcel, formatDate, sort } from "report-tool/methods";
import { OrientationType, } from "report-tool/models";
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "primeng/button";
import * as i3 from "report-tool/modules/report-table";
export class ReportPreviewComponent {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3J0LXByZXZpZXcuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcmVwb3J0LXRvb2wvbW9kdWxlcy9yZXBvcnQtcHJldmlldy9yZXBvcnQtcHJldmlldy5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9yZXBvcnQtdG9vbC9tb2R1bGVzL3JlcG9ydC1wcmV2aWV3L3JlcG9ydC1wcmV2aWV3LmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsS0FBSyxFQUVMLFNBQVMsRUFDVCxVQUFVLEdBR1gsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUMvRSxPQUFPLEVBR0wsZUFBZSxHQUVoQixNQUFNLG9CQUFvQixDQUFDOzs7OztBQU01QixNQUFNLE9BQU8sc0JBQXNCO0lBOEJqQyxJQUFZLFdBQVc7UUFDckIsMkNBQTJDO1FBQzNDLE9BQU8sUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRDtRQWxDQSxlQUFVLEdBQUcsWUFBWSxDQUFDO1FBQzFCLG1CQUFjLEdBQVEsRUFBRSxDQUFDO1FBQ3pCLGdCQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLE9BQUUsR0FBRyxjQUFjLENBQUM7UUFFWCxnQkFBVyxHQUFRO1lBQzFCLFdBQVcsRUFBRSxhQUFhO1lBQzFCLE9BQU8sRUFBRSxFQUFFO1NBQ1osQ0FBQztRQUNPLFVBQUssR0FBRyxRQUFRLENBQUM7UUFDakIsZ0JBQVcsR0FBVSxFQUFFLENBQUM7UUFDeEIsWUFBTyxHQUFVLEVBQUUsQ0FB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eEIsVUFBVSxFQUFFLEdBQUcsVUFBVSxFQUFFO1lBQzNCLFFBQVEsRUFBRSxHQUFHLFFBQVEsRUFBRTtZQUN2QixNQUFNLEVBQUUsR0FBRyxNQUFNLEVBQUU7WUFDbkIsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1lBQ2pCLGdCQUFnQixFQUFFLElBQUksQ0FBQyxxQkFBcUI7WUFDNUMsR0FBRyxPQUFPO1NBQ1gsQ0FBQztRQUNGLE9BQU8sRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLENBQUM7SUFDdEMsQ0FBQzs4R0E1TFUsc0JBQXNCO2tHQUF0QixzQkFBc0IsK2tCQ3ZCbkMsOHpGQWdHQTs7MkZEekVhLHNCQUFzQjtrQkFKbEMsU0FBUzsrQkFDRSxvQkFBb0I7MEVBU3JCLFdBQVc7c0JBQW5CLEtBQUs7Z0JBSUcsS0FBSztzQkFBYixLQUFLO2dCQUNHLFdBQVc7c0JBQW5CLEtBQUs7Z0JBQ0csT0FBTztzQkFBZixLQUFLO2dCQUNHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBQ0cscUJBQXFCO3NCQUE3QixLQUFLO2dCQUNHLFdBQVc7c0JBQW5CLEtBQUs7Z0JBQ0csUUFBUTtzQkFBaEIsS0FBSztnQkFDRyxRQUFRO3NCQUFoQixLQUFLO2dCQUNHLE1BQU07c0JBQWQsS0FBSztnQkFDRyxhQUFhO3NCQUFyQixLQUFLO2dCQUNHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBSUcsU0FBUztzQkFBakIsS0FBSztnQkFDRyxZQUFZO3NCQUFwQixLQUFLO2dCQUNHLFlBQVk7c0JBQXBCLEtBQUs7Z0JBRW9CLEtBQUs7c0JBQTlCLFNBQVM7dUJBQUMsYUFBYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XHJcbiAgQ29tcG9uZW50LFxyXG4gIElucHV0LFxyXG4gIFNpbXBsZUNoYW5nZXMsXHJcbiAgVmlld0NoaWxkLFxyXG4gIEVsZW1lbnRSZWYsXHJcbiAgT25Jbml0LFxyXG4gIE9uQ2hhbmdlcyxcclxufSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5cclxuaW1wb3J0IHsgZmlsbENvbG9yIH0gZnJvbSBcInJlcG9ydC10b29sL2NvcmVcIjtcclxuaW1wb3J0IHsgZXhwb3J0UGRmLCBleHBvcnRFeGNlbCwgZm9ybWF0RGF0ZSwgc29ydCB9IGZyb20gXCJyZXBvcnQtdG9vbC9tZXRob2RzXCI7XHJcbmltcG9ydCB7XHJcbiAgRXhjZWxPcHRpb25zLFxyXG4gIElDb21tb25PcHRpb25zLFxyXG4gIE9yaWVudGF0aW9uVHlwZSxcclxuICBQZGZPcHRpb25zLFxyXG59IGZyb20gXCJyZXBvcnQtdG9vbC9tb2RlbHNcIjtcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiBcImxpYi1yZXBvcnQtcHJldmlld1wiLFxyXG4gIHRlbXBsYXRlVXJsOiBcIi4vcmVwb3J0LXByZXZpZXcuY29tcG9uZW50Lmh0bWxcIixcclxufSlcclxuZXhwb3J0IGNsYXNzIFJlcG9ydFByZXZpZXdDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcyB7XHJcbiAgZGF0ZUZvcm1hdCA9IFwiZGQtTU0teXl5eVwiO1xyXG4gIHJlcG9ydE1ldGFEYXRhOiBhbnkgPSB7fTtcclxuICBkZXZpZEhlaWdodCA9IDA7XHJcbiAgaWQgPSBcImV4cG9ydC10YWJsZVwiO1xyXG5cclxuICBASW5wdXQoKSByZXBvcnRUaXRsZTogYW55ID0ge1xyXG4gICAgQ29tcGFueU5hbWU6IFwiUmVwb3J0IFRvb2xcIixcclxuICAgIEFkZHJlc3M6IFwiXCIsXHJcbiAgfTtcclxuICBASW5wdXQoKSBUaXRsZSA9IFwiUmVwb3J0XCI7XHJcbiAgQElucHV0KCkgcmVxdWVzdERhdGE6IGFueVtdID0gW107XHJcbiAgQElucHV0KCkgY29sdW1uczogYW55W10gPSBbXTtcclxuICBASW5wdXQoKSByZXBvcnREYXRhOiBhbnlbXSA9IFtdO1xyXG4gIEBJbnB1dCgpIHJlcG9ydE1ldGFEYXRhQ29sdW1uczogYW55O1xyXG4gIEBJbnB1dCgpIG9yaWVudGF0aW9uID0gT3JpZW50YXRpb25UeXBlLlBvcnRyYWl0O1xyXG4gIEBJbnB1dCgpIHBhZ2VTaXplID0gXCJhNFwiO1xyXG4gIEBJbnB1dCgpIEZyb21EYXRlOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgVG9EYXRlOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgRGlzdGFuY2VTcGxpdDogYm9vbGVhbjtcclxuICBASW5wdXQoKSBSZXBvcnREYXRlID0ge1xyXG4gICAgdGl0bGU6IFwiUmVwb3J0IERhdGVcIixcclxuICAgIGZvcm1hdDogdGhpcy5kYXRlRm9ybWF0LFxyXG4gIH07XHJcbiAgQElucHV0KCkgZmlsbENvbG9yID0gZmlsbENvbG9yO1xyXG4gIEBJbnB1dCgpIGVtcHR5TWVzc2FnZSA9IFwiXCI7XHJcbiAgQElucHV0KCkgaXNSZXNwb25zaXZlID0gdHJ1ZTtcclxuXHJcbiAgQFZpZXdDaGlsZChcImV4cG9ydFRhYmxlXCIpIFRBQkxFOiBFbGVtZW50UmVmO1xyXG5cclxuICBwcml2YXRlIGdldCBleHBvcnRUYWJsZSgpOiBIVE1MRWxlbWVudCB7XHJcbiAgICAvLyByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZCk7XHJcbiAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIHRoaXMuaWQpO1xyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IoKSB7fVxyXG5cclxuICBuZ09uSW5pdCgpIHtcclxuICAgIGNvbnN0IGNvbnRlbnRXcmFwcGVyID1cclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImNvbnRlbnQtd3JhcHBlclwiKVswXTtcclxuICAgIGlmIChjb250ZW50V3JhcHBlcikge1xyXG4gICAgICBjb250ZW50V3JhcHBlci5jbGFzc05hbWUgKz0gXCIgbWItMFwiO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xyXG4gICAgaWYgKGNoYW5nZXMuY29sdW1ucykge1xyXG4gICAgICB0aGlzLnNldFJlcG9ydENvbHVtbnMoKTtcclxuICAgIH1cclxuICAgIGlmIChjaGFuZ2VzLnJlcG9ydE1ldGFEYXRhQ29sdW1ucykge1xyXG4gICAgICB0aGlzLnNldFJlcG9ydE1ldGFEYXRhKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcmludCgpOiB2b2lkIHtcclxuICAgIGNvbnN0IGJvZHlDb250ZW50ID0gZG9jdW1lbnQuYm9keTtcclxuICAgIGNvbnN0IHByaW50Q29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJib2R5XCIpO1xyXG4gICAgcHJpbnRDb250ZW50LmlubmVySFRNTCA9IHRoaXMuZXhwb3J0VGFibGUuaW5uZXJIVE1MO1xyXG4gICAgZG9jdW1lbnQuYm9keSA9IHByaW50Q29udGVudDtcclxuICAgIHdpbmRvdy5wcmludCgpO1xyXG4gICAgZG9jdW1lbnQuYm9keSA9IGJvZHlDb250ZW50O1xyXG4gIH1cclxuXHJcbiAgZXhwb3J0UGRmKCk6IHZvaWQge1xyXG4gICAgY29uc3QgcGRmT3B0aW9ucyA9IHRoaXMuZXhwb3J0T3B0aW9ucy5wZGZPcHRpb25zO1xyXG4gICAgZXhwb3J0UGRmKHBkZk9wdGlvbnMpO1xyXG4gIH1cclxuXHJcbiAgZXhwb3J0RXhjZWwoKTogdm9pZCB7XHJcbiAgICBjb25zdCBleGNlbE9wdGlvbnMgPSB0aGlzLmV4cG9ydE9wdGlvbnMuZXhjZWxPcHRpb25zO1xyXG4gICAgZXhwb3J0RXhjZWwoZXhjZWxPcHRpb25zKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0UmVwb3J0VGl0bGUoKTogdm9pZCB7fVxyXG5cclxuICBwcml2YXRlIHNldFJlcG9ydENvbHVtbnMoKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuY29sdW1ucy5zb21lKChzKSA9PiBzLmZpZWxkID09PSBcIlNOb1wiKSkge1xyXG4gICAgICB0aGlzLmNvbHVtbnMudW5zaGlmdCh7XHJcbiAgICAgICAgaGVhZGVyOiBcIlMuTm9cIixcclxuICAgICAgICBmaWVsZDogXCJTTm9cIixcclxuICAgICAgICB0eXBlOiBcImlkXCIsXHJcbiAgICAgICAgd2lkdGg6IFwiNzVweFwiLFxyXG4gICAgICAgIFBkZldpZHRoOiA1LFxyXG4gICAgICAgIEV4Y2VsV2lkdGg6IDgsXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzZXRSZXBvcnRNZXRhRGF0YSgpOiB2b2lkIHtcclxuICAgIGxldCBTTm8gPSAwO1xyXG4gICAgdGhpcy5yZXBvcnRNZXRhRGF0YSA9IHt9O1xyXG4gICAgY29uc3QgcmVwb3J0TGlzdCA9IHRoaXMucmVwb3J0TWV0YURhdGFDb2x1bW5zXHJcbiAgICAgID8gc29ydCh0aGlzLnJlcG9ydERhdGEsIHRoaXMucmVwb3J0TWV0YURhdGFDb2x1bW5zLmZpZWxkKVxyXG4gICAgICA6IHRoaXMucmVwb3J0RGF0YTtcclxuICAgIHJlcG9ydExpc3QuZm9yRWFjaCgocmVwb3J0LCBpbmRleCkgPT4ge1xyXG4gICAgICBjb25zdCBzZXRNZXRhRGF0YSA9IChtZXRhZGF0YTogYW55LCBjb2x1bW5zOiBhbnksIGZpZWxkcyA9IFtdKSA9PiB7XHJcbiAgICAgICAgaWYgKGNvbHVtbnMgJiYgY29sdW1ucy5maWVsZCkge1xyXG4gICAgICAgICAgY29uc3QgZmllbGQgPSByZXBvcnRbY29sdW1ucy5maWVsZF07XHJcbiAgICAgICAgICBjb2x1bW5zLmNsYXNzTmFtZXMgPSBmaWVsZHMubGVuZ3RoID8gXCJyb3ctY2hpbGRncm91cFwiIDogXCJyb3ctZ3JvdXBcIjtcclxuICAgICAgICAgIGNvbHVtbnMuZmllbGRzID0gWy4uLmZpZWxkcywgY29sdW1ucy5maWVsZF07XHJcbiAgICAgICAgICBpZiAoIW1ldGFkYXRhW2ZpZWxkXSkge1xyXG4gICAgICAgICAgICBTTm8gPSAwO1xyXG4gICAgICAgICAgICBtZXRhZGF0YVtmaWVsZF0gPSB7XHJcbiAgICAgICAgICAgICAgaGVhZGVyOiB0aGlzLnJlcG9ydE1ldGFEYXRhQ29sdW1ucy5oZWFkZXIsXHJcbiAgICAgICAgICAgICAgaW5kZXg6ICtpbmRleCxcclxuICAgICAgICAgICAgICBjb2x1bW5zOiB7fSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICgoY29sdW1ucy5zdWJUb3RhbCB8fCBbXSkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIChjb2x1bW5zLnN1YlRvdGFsIGFzIHN0cmluZ1tdKS5mb3JFYWNoKChzdWJUb3RhbEZpZWxkKSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3QgY3VycmVudFZhbCA9ICtyZXBvcnRbc3ViVG90YWxGaWVsZF0gfHwgMDtcclxuICAgICAgICAgICAgICBpZiAoIW1ldGFkYXRhW2ZpZWxkXS5zdWJUb3RhbCkge1xyXG4gICAgICAgICAgICAgICAgbWV0YWRhdGFbZmllbGRdLnN1YlRvdGFsID0ge307XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGNvbnN0IHN1YlRvdGFsID0gbWV0YWRhdGFbZmllbGRdLnN1YlRvdGFsW3N1YlRvdGFsRmllbGRdIHx8IDA7XHJcbiAgICAgICAgICAgICAgbWV0YWRhdGFbZmllbGRdLnN1YlRvdGFsW3N1YlRvdGFsRmllbGRdID0gc3ViVG90YWwgKyBjdXJyZW50VmFsO1xyXG4gICAgICAgICAgICAgIG1ldGFkYXRhW2ZpZWxkXS5zdWJUb3RhbC5pbmRleCA9IGluZGV4O1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHNldE1ldGFEYXRhKG1ldGFkYXRhW2ZpZWxkXS5jb2x1bW5zLCBjb2x1bW5zLmNvbHVtbnMsIGNvbHVtbnMuZmllbGRzKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIHNldE1ldGFEYXRhKHRoaXMucmVwb3J0TWV0YURhdGEsIHRoaXMucmVwb3J0TWV0YURhdGFDb2x1bW5zKTtcclxuICAgICAgcmVwb3J0LlNObyA9ICsrU05vO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBnZXQgY3VycmVudFRpbWUoKTogRGF0ZSB7XHJcbiAgICByZXR1cm4gbmV3IERhdGUoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0IGV4cG9ydE9wdGlvbnMoKToge1xyXG4gICAgcGRmT3B0aW9uczogUGRmT3B0aW9ucztcclxuICAgIGV4Y2VsT3B0aW9uczogRXhjZWxPcHRpb25zO1xyXG4gIH0ge1xyXG4gICAgY29uc3QgRnJvbURhdGUgPSBgJHt0aGlzLkZyb21EYXRlID8gXCJGcm9tIERhdGU6IFwiICsgdGhpcy5Gcm9tRGF0ZSA6IFwiXCJ9YDtcclxuICAgIGNvbnN0IFRvRGF0ZSA9IGAgJHt0aGlzLlRvRGF0ZSA/IFwiVG8gRGF0ZTogXCIgKyB0aGlzLlRvRGF0ZSA6IFwiXCJ9YDtcclxuICAgIGNvbnN0IHJlcG9ydERhdGUgPSBgJHt0aGlzLlJlcG9ydERhdGUudGl0bGV9OiAke2Zvcm1hdERhdGUoXHJcbiAgICAgIHRoaXMuY3VycmVudFRpbWUsXHJcbiAgICAgIHRoaXMuUmVwb3J0RGF0ZS5mb3JtYXRcclxuICAgICl9YDtcclxuICAgIGNvbnN0IHBUYWJsZUNvbHVtbnMgPSB0aGlzLmNvbHVtbnMubWFwKChjb2wpID0+IHtcclxuICAgICAgY29sLmRhdGFLZXkgPSBjb2wuZmllbGQ7XHJcbiAgICAgIHJldHVybiBjb2w7XHJcbiAgICB9KTtcclxuICAgIGNvbnN0IGVUYWJsZUNvbHVtbnMgPSB0aGlzLmNvbHVtbnMubWFwKChjb2wpID0+IHtcclxuICAgICAgY29uc3QgcmV0dXJuVmFsdWUgPSB7XHJcbiAgICAgICAgaGVhZGVyOiBjb2wuaGVhZGVyLFxyXG4gICAgICAgIGtleTogY29sLmZpZWxkLFxyXG4gICAgICAgIHdpZHRoOiBjb2wuRXhjZWxXaWR0aCxcclxuICAgICAgICB0eXBlOiBjb2wudHlwZSxcclxuICAgICAgfTtcclxuICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9uczogSUNvbW1vbk9wdGlvbnMgPSB7XHJcbiAgICAgIGJnQ29sb3I6IHRoaXMuZmlsbENvbG9yLFxyXG4gICAgICByZXBvcnRUaXRsZTogdGhpcy5yZXBvcnRUaXRsZSxcclxuICAgICAgcm93RGF0YUdyb3VwOiB0aGlzLnJlcG9ydE1ldGFEYXRhQ29sdW1ucyA/IHRoaXMucmVwb3J0TWV0YURhdGEgOiBudWxsLFxyXG4gICAgICBpc0Jsb2I6IGZhbHNlLFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBwZGZPcHRpb25zOiBQZGZPcHRpb25zID0ge1xyXG4gICAgICBvcmllbnRhdGlvbjogdGhpcy5vcmllbnRhdGlvbixcclxuICAgICAgcGFnZVNpemU6IHRoaXMucGFnZVNpemUsXHJcbiAgICAgIHJvd0RhdGE6IHRoaXMucmVwb3J0RGF0YSxcclxuICAgICAgY29sdW1uczogcFRhYmxlQ29sdW1ucyxcclxuICAgICAgcmVxdWVzdFRpdGxlOiBbcmVwb3J0RGF0ZV0sXHJcbiAgICAgIEZyb21EYXRlOiBbRnJvbURhdGVdLFxyXG4gICAgICBUb0RhdGU6IFtUb0RhdGVdLFxyXG4gICAgICB0YWJsZU9wdGlvbnM6IHtcclxuICAgICAgICBzdGFydFk6IDEwLFxyXG4gICAgICAgIHRpdGxlOiB0aGlzLlRpdGxlLFxyXG4gICAgICAgIEZpZWxkczogdGhpcy5yZXBvcnRNZXRhRGF0YUNvbHVtbnMsXHJcbiAgICAgIH0sXHJcbiAgICAgIC4uLm9wdGlvbnMsXHJcbiAgICB9O1xyXG4gICAgY29uc3QgZXhjZWxPcHRpb25zOiBFeGNlbE9wdGlvbnMgPSB7XHJcbiAgICAgIGNvbHVtbnM6IGVUYWJsZUNvbHVtbnMsXHJcbiAgICAgIHJlcG9ydHM6IHRoaXMucmVwb3J0RGF0YSxcclxuICAgICAgcmVwb3J0RGF0ZTogYCR7cmVwb3J0RGF0ZX1gLFxyXG4gICAgICBGcm9tRGF0ZTogYCR7RnJvbURhdGV9YCxcclxuICAgICAgVG9EYXRlOiBgJHtUb0RhdGV9YCxcclxuICAgICAgdGl0bGU6IHRoaXMuVGl0bGUsXHJcbiAgICAgIHJvd0RhdGFHcm91cENvbHM6IHRoaXMucmVwb3J0TWV0YURhdGFDb2x1bW5zLFxyXG4gICAgICAuLi5vcHRpb25zLFxyXG4gICAgfTtcclxuICAgIHJldHVybiB7IHBkZk9wdGlvbnMsIGV4Y2VsT3B0aW9ucyB9O1xyXG4gIH1cclxufVxyXG4iLCI8ZGl2IGNsYXNzPVwibS0xIGZsb2F0LWVuZCBkLW5vbmUgZC1sZy1ibG9ja1wiPlxyXG4gIDxidXR0b25cclxuICAgIHR5cGU9XCJidXR0b25cIlxyXG4gICAgcEJ1dHRvblxyXG4gICAgaWNvbj1cImZhIGZhLXByaW50XCJcclxuICAgIGljb25Qb3M9XCJsZWZ0XCJcclxuICAgIGxhYmVsPVwiUFJJTlRcIlxyXG4gICAgKGNsaWNrKT1cInByaW50KClcIlxyXG4gICAgY2xhc3M9XCJ1aS1idXR0b24taW5mbyByb3VuZGVkLXBpbGwgbXgtMlwiXHJcbiAgPjwvYnV0dG9uPlxyXG4gIDxidXR0b25cclxuICAgIHR5cGU9XCJidXR0b25cIlxyXG4gICAgcEJ1dHRvblxyXG4gICAgaWNvbj1cImZhIGZhLWZpbGUtcGRmLW9cIlxyXG4gICAgaWNvblBvcz1cImxlZnRcIlxyXG4gICAgbGFiZWw9XCJQREZcIlxyXG4gICAgKGNsaWNrKT1cImV4cG9ydFBkZigpXCJcclxuICAgIGNsYXNzPVwidWktYnV0dG9uLWRhbmdlciByb3VuZGVkLXBpbGwgbXgtMiB0ZXh0LXdoaXRlXCJcclxuICA+PC9idXR0b24+XHJcbiAgPGJ1dHRvblxyXG4gICAgdHlwZT1cImJ1dHRvblwiXHJcbiAgICBwQnV0dG9uXHJcbiAgICBpY29uPVwiZmEgZmEtZmlsZS1leGNlbC1vXCJcclxuICAgIGljb25Qb3M9XCJsZWZ0XCJcclxuICAgIGxhYmVsPVwiRVhDRUxcIlxyXG4gICAgKGNsaWNrKT1cImV4cG9ydEV4Y2VsKClcIlxyXG4gICAgY2xhc3M9XCJ1aS1idXR0b24tc3VjY2VzcyByb3VuZGVkLXBpbGwgbXgtMlwiXHJcbiAgPjwvYnV0dG9uPlxyXG48L2Rpdj5cclxuPGRpdiBbaWRdPVwiaWRcIiAjZXhwb3J0VGFibGU+XHJcbiAgPHRhYmxlXHJcbiAgICBjbGFzcz1cImQtbWQtdGFibGUgbWItMCB0YWJsZSB0YWJsZS1yZXNwb25zaXZlLXNtIHRhYmxlLXJlc3BvbnNpdmUtbWQtbGcgdGV4dC1ub3dyYXBcIlxyXG4gID5cclxuICAgIDx0Ym9keT5cclxuICAgICAgPHRyPlxyXG4gICAgICAgIDx0ZCBjb2xTcGFuPVwie3sgY29sdW1ucy5sZW5ndGggfX1cIiBjbGFzcz1cImJvcmRlci0wIGNvbXBhbnlfbmFtZSBwLTBcIj5cclxuICAgICAgICAgIDxoMiBjbGFzcz1cIm0tMFwiPlxyXG4gICAgICAgICAgICA8Yj57eyByZXBvcnRUaXRsZS5Db21wYW55UmVnTmFtZSB8fCByZXBvcnRUaXRsZS5Db21wYW55TmFtZSB9fTwvYj5cclxuICAgICAgICAgIDwvaDI+XHJcbiAgICAgICAgPC90ZD5cclxuICAgICAgPC90cj5cclxuICAgICAgPHRyPlxyXG4gICAgICAgIDx0ZCBjb2xTcGFuPVwie3sgY29sdW1ucy5sZW5ndGggfX1cIiBjbGFzcz1cImJvcmRlci0wIGFkZHJlc3MgcC0wIHBiLTJcIj5cclxuICAgICAgICAgIHt7IHJlcG9ydFRpdGxlLkFkZHJlc3MgfX1cclxuICAgICAgICA8L3RkPlxyXG4gICAgICA8L3RyPlxyXG4gICAgICA8dHI+XHJcbiAgICAgICAgPHRkIGNvbFNwYW49XCJ7eyBjb2x1bW5zLmxlbmd0aCB9fVwiIGNsYXNzPVwiYm9yZGVyLTAgcmVwb3J0LXRpdGxlXCI+XHJcbiAgICAgICAgICA8Yj57eyBUaXRsZSB9fTwvYj5cclxuICAgICAgICA8L3RkPlxyXG4gICAgICA8L3RyPlxyXG4gICAgICA8dHI+XHJcbiAgICAgICAgPHRkXHJcbiAgICAgICAgICAqbmdJZj1cIkZyb21EYXRlXCJcclxuICAgICAgICAgIHN0eWxlPVwidGV4dC1hbGlnbjogbGVmdFwiXHJcbiAgICAgICAgICBjbGFzcz1cImJvcmRlci10b3AtMCByZXBvcnQtZGF0ZSBwci00XCJcclxuICAgICAgICA+XHJcbiAgICAgICAgICA8Yj5Gcm9tIERhdGU6PC9iPiB7eyBGcm9tRGF0ZSB9fVxyXG4gICAgICAgIDwvdGQ+XHJcbiAgICAgICAgPHRkXHJcbiAgICAgICAgICAqbmdJZj1cIlRvRGF0ZVwiXHJcbiAgICAgICAgICBzdHlsZT1cInRleHQtYWxpZ246IGNlbnRlclwiXHJcbiAgICAgICAgICBjbGFzcz1cImJvcmRlci10b3AtMCByZXBvcnQtZGF0ZSBwci00XCJcclxuICAgICAgICA+XHJcbiAgICAgICAgICA8Yj5UbyBEYXRlOjwvYj4ge3sgVG9EYXRlIH19XHJcbiAgICAgICAgPC90ZD5cclxuICAgICAgICA8dGRcclxuICAgICAgICAgIGNvbFNwYW49XCJ7eyBjb2x1bW5zLmxlbmd0aCB9fVwiXHJcbiAgICAgICAgICBjbGFzcz1cImJvcmRlci10b3AtMCByZXBvcnQtZGF0ZSBwci00XCJcclxuICAgICAgICA+XHJcbiAgICAgICAgICA8Yj57eyBSZXBvcnREYXRlLnRpdGxlIH19OiA8L2I+XHJcbiAgICAgICAgICB7eyBjdXJyZW50VGltZSB8IGRhdGU6IFJlcG9ydERhdGUuZm9ybWF0IH19XHJcbiAgICAgICAgPC90ZD5cclxuICAgICAgPC90cj5cclxuICAgIDwvdGJvZHk+XHJcbiAgPC90YWJsZT5cclxuICA8bGliLXJlcG9ydC10YWJsZVxyXG4gICAgW3JlcG9ydE1ldGFEYXRhXT1cInJlcG9ydE1ldGFEYXRhXCJcclxuICAgIFtkZXZpZEhlaWdodF09XCJkZXZpZEhlaWdodFwiXHJcbiAgICBbY29sdW1uc109XCJjb2x1bW5zXCJcclxuICAgIFtyZXBvcnREYXRhXT1cInJlcG9ydERhdGFcIlxyXG4gICAgW3JlcG9ydE1ldGFEYXRhQ29sdW1uc109XCJyZXBvcnRNZXRhRGF0YUNvbHVtbnNcIlxyXG4gICAgW2VtcHR5TWVzc2FnZV09XCJlbXB0eU1lc3NhZ2VcIlxyXG4gICAgW2ZpbGxDb2xvcl09XCJmaWxsQ29sb3JcIlxyXG4gID48L2xpYi1yZXBvcnQtdGFibGU+XHJcbjwvZGl2PlxyXG5cclxuPCEtLSA8bmctdGVtcGxhdGUgI3JlcG9ydEhlYWRlciBsZXQtY2xhc3NOYW1lcz1cImNsYXNzTmFtZXNcIiA+XHJcbiAgPHRyPlxyXG4gICAgPHRkIGNvbFNwYW49XCJ7eyBjb2x1bW5zLmxlbmd0aCB9fVwiIGNsYXNzPVwiYm9yZGVyLTAgY29tcGFueV9uYW1lIHAtMFwiPlxyXG4gICAgICA8aDIgY2xhc3M9XCJtLTBcIj5cclxuICAgICAgICA8Yj57eyByZXBvcnRUaXRsZS5Db21wYW55UmVnTmFtZSB9fTwvYj5cclxuICAgICAgPC9oMj5cclxuICAgIDwvdGQ+XHJcbiAgPC90cj5cclxuPC9uZy10ZW1wbGF0ZT4gLS0+XHJcbiJdfQ==