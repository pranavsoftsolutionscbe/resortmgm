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
        if (changes.CustId) {
            this.getReportTitle();
        }
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
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.2.1", type: ReportPreviewComponent, selector: "lib-report-preview", inputs: { Title: "Title", requestData: "requestData", columns: "columns", reportData: "reportData", reportMetaDataColumns: "reportMetaDataColumns", orientation: "orientation", pageSize: "pageSize", FromDate: "FromDate", ToDate: "ToDate", CustId: "CustId", DistanceSplit: "DistanceSplit", ReportDate: "ReportDate", fillColor: "fillColor", emptyMessage: "emptyMessage", isResponsive: "isResponsive" }, viewQueries: [{ propertyName: "TABLE", first: true, predicate: ["exportTable"], descendants: true }], usesOnChanges: true, ngImport: i0, template: "<div class=\"m-1 float-right d-none d-lg-block\">\r\n  <button\r\n    type=\"button\"\r\n    pButton\r\n    icon=\"fa fa-print\"\r\n    iconPos=\"left\"\r\n    label=\"PRINT\"\r\n    (click)=\"print()\"\r\n    class=\"ui-button-info rounded-pill mx-2\"\r\n  ></button>\r\n  <button\r\n    type=\"button\"\r\n    pButton\r\n    icon=\"fa fa-file-pdf-o\"\r\n    iconPos=\"left\"\r\n    label=\"PDF\"\r\n    (click)=\"exportPdf()\"\r\n    class=\"ui-button-danger rounded-pill mx-2 text-white\"\r\n  ></button>\r\n  <button\r\n    type=\"button\"\r\n    pButton\r\n    icon=\"fa fa-file-excel-o\"\r\n    iconPos=\"left\"\r\n    label=\"EXCEL\"\r\n    (click)=\"exportExcel()\"\r\n    class=\"ui-button-success rounded-pill mx-2\"\r\n  ></button>\r\n</div>\r\n<div id=\"export-table\" #exportTable>\r\n  <table\r\n    class=\"d-md-table mb-0 table table-responsive-sm table-responsive-md-lg text-nowrap\"\r\n  >\r\n    <tbody>\r\n      <tr>\r\n        <td colSpan=\"{{ columns.length }}\" class=\"border-0 company_name p-0\">\r\n          <h2 class=\"m-0\">\r\n            <b>{{ reportTitle.CompanyRegName }}</b>\r\n          </h2>\r\n        </td>\r\n      </tr>\r\n      <tr>\r\n        <td colSpan=\"{{ columns.length }}\" class=\"border-0 address p-0 pb-2\">\r\n          {{ reportTitle.Address }}\r\n        </td>\r\n      </tr>\r\n      <tr>\r\n        <td colSpan=\"{{ columns.length }}\" class=\"border-0 report-title\">\r\n          <b>{{ Title }}</b>\r\n        </td>\r\n      </tr>\r\n      <tr>\r\n        <td\r\n          *ngIf=\"FromDate\"\r\n          style=\"text-align: left\"\r\n          class=\"border-top-0 report-date pr-4\"\r\n        >\r\n          <b>From Date:</b> {{ FromDate }}\r\n        </td>\r\n        <td\r\n          *ngIf=\"ToDate\"\r\n          style=\"text-align: center\"\r\n          class=\"border-top-0 report-date pr-4\"\r\n        >\r\n          <b>To Date:</b> {{ ToDate }}\r\n        </td>\r\n        <td\r\n          colSpan=\"{{ columns.length }}\"\r\n          class=\"border-top-0 report-date pr-4\"\r\n        >\r\n          <b>{{ ReportDate.title }}: </b>\r\n          {{ currentTime | date: ReportDate.format }}\r\n        </td>\r\n      </tr>\r\n    </tbody>\r\n  </table>\r\n  <lib-report-table\r\n    [reportMetaData]=\"reportMetaData\"\r\n    [devidHeight]=\"devidHeight\"\r\n    [columns]=\"columns\"\r\n    [reportData]=\"reportData\"\r\n    [reportMetaDataColumns]=\"reportMetaDataColumns\"\r\n    [emptyMessage]=\"emptyMessage\"\r\n    [fillColor]=\"fillColor\"\r\n  ></lib-report-table>\r\n</div>\r\n\r\n<!-- <ng-template #reportHeader let-classNames=\"classNames\" >\r\n  <tr>\r\n    <td colSpan=\"{{ columns.length }}\" class=\"border-0 company_name p-0\">\r\n      <h2 class=\"m-0\">\r\n        <b>{{ reportTitle.CompanyRegName }}</b>\r\n      </h2>\r\n    </td>\r\n  </tr>\r\n</ng-template> -->\r\n", dependencies: [{ kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i2.ButtonDirective, selector: "[pButton]", inputs: ["iconPos", "loadingIcon", "label", "icon", "loading"] }, { kind: "component", type: i3.ReportTableComponent, selector: "lib-report-table", inputs: ["reportMetaData", "devidHeight", "columns", "reportData", "reportMetaDataColumns", "emptyMessage", "fillColor", "isResponsive"] }, { kind: "pipe", type: i1.DatePipe, name: "date" }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportPreviewComponent, decorators: [{
            type: Component,
            args: [{ selector: "lib-report-preview", template: "<div class=\"m-1 float-right d-none d-lg-block\">\r\n  <button\r\n    type=\"button\"\r\n    pButton\r\n    icon=\"fa fa-print\"\r\n    iconPos=\"left\"\r\n    label=\"PRINT\"\r\n    (click)=\"print()\"\r\n    class=\"ui-button-info rounded-pill mx-2\"\r\n  ></button>\r\n  <button\r\n    type=\"button\"\r\n    pButton\r\n    icon=\"fa fa-file-pdf-o\"\r\n    iconPos=\"left\"\r\n    label=\"PDF\"\r\n    (click)=\"exportPdf()\"\r\n    class=\"ui-button-danger rounded-pill mx-2 text-white\"\r\n  ></button>\r\n  <button\r\n    type=\"button\"\r\n    pButton\r\n    icon=\"fa fa-file-excel-o\"\r\n    iconPos=\"left\"\r\n    label=\"EXCEL\"\r\n    (click)=\"exportExcel()\"\r\n    class=\"ui-button-success rounded-pill mx-2\"\r\n  ></button>\r\n</div>\r\n<div id=\"export-table\" #exportTable>\r\n  <table\r\n    class=\"d-md-table mb-0 table table-responsive-sm table-responsive-md-lg text-nowrap\"\r\n  >\r\n    <tbody>\r\n      <tr>\r\n        <td colSpan=\"{{ columns.length }}\" class=\"border-0 company_name p-0\">\r\n          <h2 class=\"m-0\">\r\n            <b>{{ reportTitle.CompanyRegName }}</b>\r\n          </h2>\r\n        </td>\r\n      </tr>\r\n      <tr>\r\n        <td colSpan=\"{{ columns.length }}\" class=\"border-0 address p-0 pb-2\">\r\n          {{ reportTitle.Address }}\r\n        </td>\r\n      </tr>\r\n      <tr>\r\n        <td colSpan=\"{{ columns.length }}\" class=\"border-0 report-title\">\r\n          <b>{{ Title }}</b>\r\n        </td>\r\n      </tr>\r\n      <tr>\r\n        <td\r\n          *ngIf=\"FromDate\"\r\n          style=\"text-align: left\"\r\n          class=\"border-top-0 report-date pr-4\"\r\n        >\r\n          <b>From Date:</b> {{ FromDate }}\r\n        </td>\r\n        <td\r\n          *ngIf=\"ToDate\"\r\n          style=\"text-align: center\"\r\n          class=\"border-top-0 report-date pr-4\"\r\n        >\r\n          <b>To Date:</b> {{ ToDate }}\r\n        </td>\r\n        <td\r\n          colSpan=\"{{ columns.length }}\"\r\n          class=\"border-top-0 report-date pr-4\"\r\n        >\r\n          <b>{{ ReportDate.title }}: </b>\r\n          {{ currentTime | date: ReportDate.format }}\r\n        </td>\r\n      </tr>\r\n    </tbody>\r\n  </table>\r\n  <lib-report-table\r\n    [reportMetaData]=\"reportMetaData\"\r\n    [devidHeight]=\"devidHeight\"\r\n    [columns]=\"columns\"\r\n    [reportData]=\"reportData\"\r\n    [reportMetaDataColumns]=\"reportMetaDataColumns\"\r\n    [emptyMessage]=\"emptyMessage\"\r\n    [fillColor]=\"fillColor\"\r\n  ></lib-report-table>\r\n</div>\r\n\r\n<!-- <ng-template #reportHeader let-classNames=\"classNames\" >\r\n  <tr>\r\n    <td colSpan=\"{{ columns.length }}\" class=\"border-0 company_name p-0\">\r\n      <h2 class=\"m-0\">\r\n        <b>{{ reportTitle.CompanyRegName }}</b>\r\n      </h2>\r\n    </td>\r\n  </tr>\r\n</ng-template> -->\r\n" }]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3J0LXByZXZpZXcuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcmVwb3J0LXRvb2wvbW9kdWxlcy9yZXBvcnQtcHJldmlldy9yZXBvcnQtcHJldmlldy5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9yZXBvcnQtdG9vbC9tb2R1bGVzL3JlcG9ydC1wcmV2aWV3L3JlcG9ydC1wcmV2aWV3LmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsS0FBSyxFQUVMLFNBQVMsRUFDVCxVQUFVLEdBR1gsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUMvRSxPQUFPLEVBR0wsZUFBZSxHQUVoQixNQUFNLG9CQUFvQixDQUFDOzs7OztBQU01QixNQUFNLE9BQU8sc0JBQXNCO0lBOEJqQyxJQUFZLFdBQVc7UUFDckIsT0FBTyxRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRDtRQWpDQSxlQUFVLEdBQUcsWUFBWSxDQUFDO1FBQzFCLGdCQUFXLEdBQVE7WUFDakIsV0FBVyxFQUFFLGFBQWE7WUFDMUIsT0FBTyxFQUFFLEVBQUU7U0FDWixDQUFDO1FBQ0YsbUJBQWMsR0FBUSxFQUFFLENBQUM7UUFDekIsZ0JBQVcsR0FBRyxDQUFDLENBQUM7UUFFUCxVQUFLLEdBQUcsUUFBUSxDQUFDO1FBQ2pCLGdCQUFXLEdBQVUsRUFBRSxDQUFDO1FBQ3hCLFlBQU8sR0FBVSxFQUFFLENBQUM7UUFDcEIsZUFBVSxHQUFVLEVBQUUsQ0FBQztRQUV2QixnQkFBVyxHQUFHLGVBQWUsQ0FBQyxRQUFR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Q0YsTUFBTSxZQUFZLEdBQWlCO1lBQ2pDLE9BQU8sRUFBRSxhQUFhO1lBQ3RCLE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVTtZQUN4QixVQUFVLEVBQUUsR0FBRyxVQUFVLEVBQUU7WUFDM0IsUUFBUSxFQUFFLEdBQUcsUUFBUSxFQUFFO1lBQ3ZCLE1BQU0sRUFBRSxHQUFHLE1BQU0sRUFBRTtZQUNuQixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7WUFDakIsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLHFCQUFxQjtZQUM1QyxHQUFHLE9BQU87U0FDWCxDQUFDO1FBQ0YsT0FBTyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsQ0FBQztJQUN0QyxDQUFDOzhHQWpNVSxzQkFBc0I7a0dBQXRCLHNCQUFzQixxa0JDdkJuQyw2eUZBZ0dBOzsyRkR6RWEsc0JBQXNCO2tCQUpsQyxTQUFTOytCQUNFLG9CQUFvQjswRUFZckIsS0FBSztzQkFBYixLQUFLO2dCQUNHLFdBQVc7c0JBQW5CLEtBQUs7Z0JBQ0csT0FBTztzQkFBZixLQUFLO2dCQUNHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBQ0cscUJBQXFCO3NCQUE3QixLQUFLO2dCQUNHLFdBQVc7c0JBQW5CLEtBQUs7Z0JBQ0csUUFBUTtzQkFBaEIsS0FBSztnQkFDRyxRQUFRO3NCQUFoQixLQUFLO2dCQUNHLE1BQU07c0JBQWQsS0FBSztnQkFDRyxNQUFNO3NCQUFkLEtBQUs7Z0JBQ0csYUFBYTtzQkFBckIsS0FBSztnQkFDRyxVQUFVO3NCQUFsQixLQUFLO2dCQUlHLFNBQVM7c0JBQWpCLEtBQUs7Z0JBQ0csWUFBWTtzQkFBcEIsS0FBSztnQkFDRyxZQUFZO3NCQUFwQixLQUFLO2dCQUVvQixLQUFLO3NCQUE5QixTQUFTO3VCQUFDLGFBQWEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xyXG4gIENvbXBvbmVudCxcclxuICBJbnB1dCxcclxuICBTaW1wbGVDaGFuZ2VzLFxyXG4gIFZpZXdDaGlsZCxcclxuICBFbGVtZW50UmVmLFxyXG4gIE9uSW5pdCxcclxuICBPbkNoYW5nZXMsXHJcbn0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcclxuXHJcbmltcG9ydCB7IGZpbGxDb2xvciB9IGZyb20gXCJyZXBvcnQtdG9vbC9jb3JlXCI7XHJcbmltcG9ydCB7IGV4cG9ydFBkZiwgZXhwb3J0RXhjZWwsIGZvcm1hdERhdGUsIHNvcnQgfSBmcm9tIFwicmVwb3J0LXRvb2wvbWV0aG9kc1wiO1xyXG5pbXBvcnQge1xyXG4gIEV4Y2VsT3B0aW9ucyxcclxuICBJQ29tbW9uT3B0aW9ucyxcclxuICBPcmllbnRhdGlvblR5cGUsXHJcbiAgUGRmT3B0aW9ucyxcclxufSBmcm9tIFwicmVwb3J0LXRvb2wvbW9kZWxzXCI7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogXCJsaWItcmVwb3J0LXByZXZpZXdcIixcclxuICB0ZW1wbGF0ZVVybDogXCIuL3JlcG9ydC1wcmV2aWV3LmNvbXBvbmVudC5odG1sXCIsXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBSZXBvcnRQcmV2aWV3Q29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMge1xyXG4gIGRhdGVGb3JtYXQgPSBcImRkLU1NLXl5eXlcIjtcclxuICByZXBvcnRUaXRsZTogYW55ID0ge1xyXG4gICAgQ29tcGFueU5hbWU6IFwiUmVwb3J0IFRvb2xcIixcclxuICAgIEFkZHJlc3M6IFwiXCIsXHJcbiAgfTtcclxuICByZXBvcnRNZXRhRGF0YTogYW55ID0ge307XHJcbiAgZGV2aWRIZWlnaHQgPSAwO1xyXG5cclxuICBASW5wdXQoKSBUaXRsZSA9IFwiUmVwb3J0XCI7XHJcbiAgQElucHV0KCkgcmVxdWVzdERhdGE6IGFueVtdID0gW107XHJcbiAgQElucHV0KCkgY29sdW1uczogYW55W10gPSBbXTtcclxuICBASW5wdXQoKSByZXBvcnREYXRhOiBhbnlbXSA9IFtdO1xyXG4gIEBJbnB1dCgpIHJlcG9ydE1ldGFEYXRhQ29sdW1uczogYW55O1xyXG4gIEBJbnB1dCgpIG9yaWVudGF0aW9uID0gT3JpZW50YXRpb25UeXBlLlBvcnRyYWl0O1xyXG4gIEBJbnB1dCgpIHBhZ2VTaXplID0gXCJhNFwiO1xyXG4gIEBJbnB1dCgpIEZyb21EYXRlOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgVG9EYXRlOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgQ3VzdElkOiBudW1iZXI7XHJcbiAgQElucHV0KCkgRGlzdGFuY2VTcGxpdDogYm9vbGVhbjtcclxuICBASW5wdXQoKSBSZXBvcnREYXRlID0ge1xyXG4gICAgdGl0bGU6IFwiUmVwb3J0IERhdGVcIixcclxuICAgIGZvcm1hdDogdGhpcy5kYXRlRm9ybWF0LFxyXG4gIH07XHJcbiAgQElucHV0KCkgZmlsbENvbG9yID0gZmlsbENvbG9yO1xyXG4gIEBJbnB1dCgpIGVtcHR5TWVzc2FnZSA9IFwiXCI7XHJcbiAgQElucHV0KCkgaXNSZXNwb25zaXZlID0gdHJ1ZTtcclxuXHJcbiAgQFZpZXdDaGlsZChcImV4cG9ydFRhYmxlXCIpIFRBQkxFOiBFbGVtZW50UmVmO1xyXG5cclxuICBwcml2YXRlIGdldCBleHBvcnRUYWJsZSgpOiBIVE1MRWxlbWVudCB7XHJcbiAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJleHBvcnQtdGFibGVcIik7XHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RvcigpIHt9XHJcblxyXG4gIG5nT25Jbml0KCkge1xyXG4gICAgY29uc3QgY29udGVudFdyYXBwZXIgPVxyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiY29udGVudC13cmFwcGVyXCIpWzBdO1xyXG4gICAgaWYgKGNvbnRlbnRXcmFwcGVyKSB7XHJcbiAgICAgIGNvbnRlbnRXcmFwcGVyLmNsYXNzTmFtZSArPSBcIiBtYi0wXCI7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5DdXN0SWQpIHtcclxuICAgICAgdGhpcy5nZXRSZXBvcnRUaXRsZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xyXG4gICAgaWYgKGNoYW5nZXMuQ3VzdElkKSB7XHJcbiAgICAgIHRoaXMuZ2V0UmVwb3J0VGl0bGUoKTtcclxuICAgIH1cclxuICAgIGlmIChjaGFuZ2VzLmNvbHVtbnMpIHtcclxuICAgICAgdGhpcy5zZXRSZXBvcnRDb2x1bW5zKCk7XHJcbiAgICB9XHJcbiAgICBpZiAoY2hhbmdlcy5yZXBvcnRNZXRhRGF0YUNvbHVtbnMpIHtcclxuICAgICAgdGhpcy5zZXRSZXBvcnRNZXRhRGF0YSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpbnQoKTogdm9pZCB7XHJcbiAgICBjb25zdCBib2R5Q29udGVudCA9IGRvY3VtZW50LmJvZHk7XHJcbiAgICBjb25zdCBwcmludENvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYm9keVwiKTtcclxuICAgIHByaW50Q29udGVudC5pbm5lckhUTUwgPSB0aGlzLmV4cG9ydFRhYmxlLmlubmVySFRNTDtcclxuICAgIGRvY3VtZW50LmJvZHkgPSBwcmludENvbnRlbnQ7XHJcbiAgICB3aW5kb3cucHJpbnQoKTtcclxuICAgIGRvY3VtZW50LmJvZHkgPSBib2R5Q29udGVudDtcclxuICB9XHJcblxyXG4gIGV4cG9ydFBkZigpOiB2b2lkIHtcclxuICAgIGNvbnN0IHBkZk9wdGlvbnMgPSB0aGlzLmV4cG9ydE9wdGlvbnMucGRmT3B0aW9ucztcclxuICAgIGV4cG9ydFBkZihwZGZPcHRpb25zKTtcclxuICB9XHJcblxyXG4gIGV4cG9ydEV4Y2VsKCk6IHZvaWQge1xyXG4gICAgY29uc3QgZXhjZWxPcHRpb25zID0gdGhpcy5leHBvcnRPcHRpb25zLmV4Y2VsT3B0aW9ucztcclxuICAgIGV4cG9ydEV4Y2VsKGV4Y2VsT3B0aW9ucyk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFJlcG9ydFRpdGxlKCk6IHZvaWQge31cclxuXHJcbiAgcHJpdmF0ZSBzZXRSZXBvcnRDb2x1bW5zKCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLmNvbHVtbnMuc29tZSgocykgPT4gcy5maWVsZCA9PT0gXCJTTm9cIikpIHtcclxuICAgICAgdGhpcy5jb2x1bW5zLnVuc2hpZnQoe1xyXG4gICAgICAgIGhlYWRlcjogXCJTLk5vXCIsXHJcbiAgICAgICAgZmllbGQ6IFwiU05vXCIsXHJcbiAgICAgICAgdHlwZTogXCJpZFwiLFxyXG4gICAgICAgIHdpZHRoOiBcIjc1cHhcIixcclxuICAgICAgICBQZGZXaWR0aDogNSxcclxuICAgICAgICBFeGNlbFdpZHRoOiA4LFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2V0UmVwb3J0TWV0YURhdGEoKTogdm9pZCB7XHJcbiAgICBsZXQgU05vID0gMDtcclxuICAgIHRoaXMucmVwb3J0TWV0YURhdGEgPSB7fTtcclxuICAgIGNvbnN0IHJlcG9ydExpc3QgPSB0aGlzLnJlcG9ydE1ldGFEYXRhQ29sdW1uc1xyXG4gICAgICA/IHNvcnQodGhpcy5yZXBvcnREYXRhLCB0aGlzLnJlcG9ydE1ldGFEYXRhQ29sdW1ucy5maWVsZClcclxuICAgICAgOiB0aGlzLnJlcG9ydERhdGE7XHJcbiAgICByZXBvcnRMaXN0LmZvckVhY2goKHJlcG9ydCwgaW5kZXgpID0+IHtcclxuICAgICAgY29uc3Qgc2V0TWV0YURhdGEgPSAobWV0YWRhdGE6IGFueSwgY29sdW1uczogYW55LCBmaWVsZHMgPSBbXSkgPT4ge1xyXG4gICAgICAgIGlmIChjb2x1bW5zICYmIGNvbHVtbnMuZmllbGQpIHtcclxuICAgICAgICAgIGNvbnN0IGZpZWxkID0gcmVwb3J0W2NvbHVtbnMuZmllbGRdO1xyXG4gICAgICAgICAgY29sdW1ucy5jbGFzc05hbWVzID0gZmllbGRzLmxlbmd0aCA/IFwicm93LWNoaWxkZ3JvdXBcIiA6IFwicm93LWdyb3VwXCI7XHJcbiAgICAgICAgICBjb2x1bW5zLmZpZWxkcyA9IFsuLi5maWVsZHMsIGNvbHVtbnMuZmllbGRdO1xyXG4gICAgICAgICAgaWYgKCFtZXRhZGF0YVtmaWVsZF0pIHtcclxuICAgICAgICAgICAgU05vID0gMDtcclxuICAgICAgICAgICAgbWV0YWRhdGFbZmllbGRdID0ge1xyXG4gICAgICAgICAgICAgIGhlYWRlcjogdGhpcy5yZXBvcnRNZXRhRGF0YUNvbHVtbnMuaGVhZGVyLFxyXG4gICAgICAgICAgICAgIGluZGV4OiAraW5kZXgsXHJcbiAgICAgICAgICAgICAgY29sdW1uczoge30sXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoKGNvbHVtbnMuc3ViVG90YWwgfHwgW10pLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAoY29sdW1ucy5zdWJUb3RhbCBhcyBzdHJpbmdbXSkuZm9yRWFjaCgoc3ViVG90YWxGaWVsZCkgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRWYWwgPSArcmVwb3J0W3N1YlRvdGFsRmllbGRdIHx8IDA7XHJcbiAgICAgICAgICAgICAgaWYgKCFtZXRhZGF0YVtmaWVsZF0uc3ViVG90YWwpIHtcclxuICAgICAgICAgICAgICAgIG1ldGFkYXRhW2ZpZWxkXS5zdWJUb3RhbCA9IHt9O1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBjb25zdCBzdWJUb3RhbCA9IG1ldGFkYXRhW2ZpZWxkXS5zdWJUb3RhbFtzdWJUb3RhbEZpZWxkXSB8fCAwO1xyXG4gICAgICAgICAgICAgIG1ldGFkYXRhW2ZpZWxkXS5zdWJUb3RhbFtzdWJUb3RhbEZpZWxkXSA9IHN1YlRvdGFsICsgY3VycmVudFZhbDtcclxuICAgICAgICAgICAgICBtZXRhZGF0YVtmaWVsZF0uc3ViVG90YWwuaW5kZXggPSBpbmRleDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBzZXRNZXRhRGF0YShtZXRhZGF0YVtmaWVsZF0uY29sdW1ucywgY29sdW1ucy5jb2x1bW5zLCBjb2x1bW5zLmZpZWxkcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICBzZXRNZXRhRGF0YSh0aGlzLnJlcG9ydE1ldGFEYXRhLCB0aGlzLnJlcG9ydE1ldGFEYXRhQ29sdW1ucyk7XHJcbiAgICAgIHJlcG9ydC5TTm8gPSArK1NObztcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGN1cnJlbnRUaW1lKCk6IERhdGUge1xyXG4gICAgcmV0dXJuIG5ldyBEYXRlKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldCBleHBvcnRPcHRpb25zKCk6IHtcclxuICAgIHBkZk9wdGlvbnM6IFBkZk9wdGlvbnM7XHJcbiAgICBleGNlbE9wdGlvbnM6IEV4Y2VsT3B0aW9ucztcclxuICB9IHtcclxuICAgIGNvbnN0IEZyb21EYXRlID0gYCR7dGhpcy5Gcm9tRGF0ZSA/IFwiRnJvbSBEYXRlOiBcIiArIHRoaXMuRnJvbURhdGUgOiBcIlwifWA7XHJcbiAgICBjb25zdCBUb0RhdGUgPSBgICR7dGhpcy5Ub0RhdGUgPyBcIlRvIERhdGU6IFwiICsgdGhpcy5Ub0RhdGUgOiBcIlwifWA7XHJcbiAgICBjb25zdCByZXBvcnREYXRlID0gYCR7dGhpcy5SZXBvcnREYXRlLnRpdGxlfTogJHtmb3JtYXREYXRlKFxyXG4gICAgICB0aGlzLmN1cnJlbnRUaW1lLFxyXG4gICAgICB0aGlzLlJlcG9ydERhdGUuZm9ybWF0XHJcbiAgICApfWA7XHJcbiAgICBjb25zdCBwVGFibGVDb2x1bW5zID0gdGhpcy5jb2x1bW5zLm1hcCgoY29sKSA9PiB7XHJcbiAgICAgIGNvbC5kYXRhS2V5ID0gY29sLmZpZWxkO1xyXG4gICAgICByZXR1cm4gY29sO1xyXG4gICAgfSk7XHJcbiAgICBjb25zdCBlVGFibGVDb2x1bW5zID0gdGhpcy5jb2x1bW5zLm1hcCgoY29sKSA9PiB7XHJcbiAgICAgIGNvbnN0IHJldHVyblZhbHVlID0ge1xyXG4gICAgICAgIGhlYWRlcjogY29sLmhlYWRlcixcclxuICAgICAgICBrZXk6IGNvbC5maWVsZCxcclxuICAgICAgICB3aWR0aDogY29sLkV4Y2VsV2lkdGgsXHJcbiAgICAgICAgdHlwZTogY29sLnR5cGUsXHJcbiAgICAgIH07XHJcbiAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnM6IElDb21tb25PcHRpb25zID0ge1xyXG4gICAgICBiZ0NvbG9yOiB0aGlzLmZpbGxDb2xvcixcclxuICAgICAgcmVwb3J0VGl0bGU6IHRoaXMucmVwb3J0VGl0bGUsXHJcbiAgICAgIHJvd0RhdGFHcm91cDogdGhpcy5yZXBvcnRNZXRhRGF0YUNvbHVtbnMgPyB0aGlzLnJlcG9ydE1ldGFEYXRhIDogbnVsbCxcclxuICAgICAgaXNCbG9iOiBmYWxzZSxcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgcGRmT3B0aW9uczogUGRmT3B0aW9ucyA9IHtcclxuICAgICAgb3JpZW50YXRpb246IHRoaXMub3JpZW50YXRpb24sXHJcbiAgICAgIHBhZ2VTaXplOiB0aGlzLnBhZ2VTaXplLFxyXG4gICAgICByb3dEYXRhOiB0aGlzLnJlcG9ydERhdGEsXHJcbiAgICAgIGNvbHVtbnM6IHBUYWJsZUNvbHVtbnMsXHJcbiAgICAgIHJlcXVlc3RUaXRsZTogW3JlcG9ydERhdGVdLFxyXG4gICAgICBGcm9tRGF0ZTogW0Zyb21EYXRlXSxcclxuICAgICAgVG9EYXRlOiBbVG9EYXRlXSxcclxuICAgICAgdGFibGVPcHRpb25zOiB7XHJcbiAgICAgICAgc3RhcnRZOiAxMCxcclxuICAgICAgICB0aXRsZTogdGhpcy5UaXRsZSxcclxuICAgICAgICBGaWVsZHM6IHRoaXMucmVwb3J0TWV0YURhdGFDb2x1bW5zLFxyXG4gICAgICB9LFxyXG4gICAgICAuLi5vcHRpb25zLFxyXG4gICAgfTtcclxuICAgIGNvbnN0IGV4Y2VsT3B0aW9uczogRXhjZWxPcHRpb25zID0ge1xyXG4gICAgICBjb2x1bW5zOiBlVGFibGVDb2x1bW5zLFxyXG4gICAgICByZXBvcnRzOiB0aGlzLnJlcG9ydERhdGEsXHJcbiAgICAgIHJlcG9ydERhdGU6IGAke3JlcG9ydERhdGV9YCxcclxuICAgICAgRnJvbURhdGU6IGAke0Zyb21EYXRlfWAsXHJcbiAgICAgIFRvRGF0ZTogYCR7VG9EYXRlfWAsXHJcbiAgICAgIHRpdGxlOiB0aGlzLlRpdGxlLFxyXG4gICAgICByb3dEYXRhR3JvdXBDb2xzOiB0aGlzLnJlcG9ydE1ldGFEYXRhQ29sdW1ucyxcclxuICAgICAgLi4ub3B0aW9ucyxcclxuICAgIH07XHJcbiAgICByZXR1cm4geyBwZGZPcHRpb25zLCBleGNlbE9wdGlvbnMgfTtcclxuICB9XHJcbn1cclxuIiwiPGRpdiBjbGFzcz1cIm0tMSBmbG9hdC1yaWdodCBkLW5vbmUgZC1sZy1ibG9ja1wiPlxyXG4gIDxidXR0b25cclxuICAgIHR5cGU9XCJidXR0b25cIlxyXG4gICAgcEJ1dHRvblxyXG4gICAgaWNvbj1cImZhIGZhLXByaW50XCJcclxuICAgIGljb25Qb3M9XCJsZWZ0XCJcclxuICAgIGxhYmVsPVwiUFJJTlRcIlxyXG4gICAgKGNsaWNrKT1cInByaW50KClcIlxyXG4gICAgY2xhc3M9XCJ1aS1idXR0b24taW5mbyByb3VuZGVkLXBpbGwgbXgtMlwiXHJcbiAgPjwvYnV0dG9uPlxyXG4gIDxidXR0b25cclxuICAgIHR5cGU9XCJidXR0b25cIlxyXG4gICAgcEJ1dHRvblxyXG4gICAgaWNvbj1cImZhIGZhLWZpbGUtcGRmLW9cIlxyXG4gICAgaWNvblBvcz1cImxlZnRcIlxyXG4gICAgbGFiZWw9XCJQREZcIlxyXG4gICAgKGNsaWNrKT1cImV4cG9ydFBkZigpXCJcclxuICAgIGNsYXNzPVwidWktYnV0dG9uLWRhbmdlciByb3VuZGVkLXBpbGwgbXgtMiB0ZXh0LXdoaXRlXCJcclxuICA+PC9idXR0b24+XHJcbiAgPGJ1dHRvblxyXG4gICAgdHlwZT1cImJ1dHRvblwiXHJcbiAgICBwQnV0dG9uXHJcbiAgICBpY29uPVwiZmEgZmEtZmlsZS1leGNlbC1vXCJcclxuICAgIGljb25Qb3M9XCJsZWZ0XCJcclxuICAgIGxhYmVsPVwiRVhDRUxcIlxyXG4gICAgKGNsaWNrKT1cImV4cG9ydEV4Y2VsKClcIlxyXG4gICAgY2xhc3M9XCJ1aS1idXR0b24tc3VjY2VzcyByb3VuZGVkLXBpbGwgbXgtMlwiXHJcbiAgPjwvYnV0dG9uPlxyXG48L2Rpdj5cclxuPGRpdiBpZD1cImV4cG9ydC10YWJsZVwiICNleHBvcnRUYWJsZT5cclxuICA8dGFibGVcclxuICAgIGNsYXNzPVwiZC1tZC10YWJsZSBtYi0wIHRhYmxlIHRhYmxlLXJlc3BvbnNpdmUtc20gdGFibGUtcmVzcG9uc2l2ZS1tZC1sZyB0ZXh0LW5vd3JhcFwiXHJcbiAgPlxyXG4gICAgPHRib2R5PlxyXG4gICAgICA8dHI+XHJcbiAgICAgICAgPHRkIGNvbFNwYW49XCJ7eyBjb2x1bW5zLmxlbmd0aCB9fVwiIGNsYXNzPVwiYm9yZGVyLTAgY29tcGFueV9uYW1lIHAtMFwiPlxyXG4gICAgICAgICAgPGgyIGNsYXNzPVwibS0wXCI+XHJcbiAgICAgICAgICAgIDxiPnt7IHJlcG9ydFRpdGxlLkNvbXBhbnlSZWdOYW1lIH19PC9iPlxyXG4gICAgICAgICAgPC9oMj5cclxuICAgICAgICA8L3RkPlxyXG4gICAgICA8L3RyPlxyXG4gICAgICA8dHI+XHJcbiAgICAgICAgPHRkIGNvbFNwYW49XCJ7eyBjb2x1bW5zLmxlbmd0aCB9fVwiIGNsYXNzPVwiYm9yZGVyLTAgYWRkcmVzcyBwLTAgcGItMlwiPlxyXG4gICAgICAgICAge3sgcmVwb3J0VGl0bGUuQWRkcmVzcyB9fVxyXG4gICAgICAgIDwvdGQ+XHJcbiAgICAgIDwvdHI+XHJcbiAgICAgIDx0cj5cclxuICAgICAgICA8dGQgY29sU3Bhbj1cInt7IGNvbHVtbnMubGVuZ3RoIH19XCIgY2xhc3M9XCJib3JkZXItMCByZXBvcnQtdGl0bGVcIj5cclxuICAgICAgICAgIDxiPnt7IFRpdGxlIH19PC9iPlxyXG4gICAgICAgIDwvdGQ+XHJcbiAgICAgIDwvdHI+XHJcbiAgICAgIDx0cj5cclxuICAgICAgICA8dGRcclxuICAgICAgICAgICpuZ0lmPVwiRnJvbURhdGVcIlxyXG4gICAgICAgICAgc3R5bGU9XCJ0ZXh0LWFsaWduOiBsZWZ0XCJcclxuICAgICAgICAgIGNsYXNzPVwiYm9yZGVyLXRvcC0wIHJlcG9ydC1kYXRlIHByLTRcIlxyXG4gICAgICAgID5cclxuICAgICAgICAgIDxiPkZyb20gRGF0ZTo8L2I+IHt7IEZyb21EYXRlIH19XHJcbiAgICAgICAgPC90ZD5cclxuICAgICAgICA8dGRcclxuICAgICAgICAgICpuZ0lmPVwiVG9EYXRlXCJcclxuICAgICAgICAgIHN0eWxlPVwidGV4dC1hbGlnbjogY2VudGVyXCJcclxuICAgICAgICAgIGNsYXNzPVwiYm9yZGVyLXRvcC0wIHJlcG9ydC1kYXRlIHByLTRcIlxyXG4gICAgICAgID5cclxuICAgICAgICAgIDxiPlRvIERhdGU6PC9iPiB7eyBUb0RhdGUgfX1cclxuICAgICAgICA8L3RkPlxyXG4gICAgICAgIDx0ZFxyXG4gICAgICAgICAgY29sU3Bhbj1cInt7IGNvbHVtbnMubGVuZ3RoIH19XCJcclxuICAgICAgICAgIGNsYXNzPVwiYm9yZGVyLXRvcC0wIHJlcG9ydC1kYXRlIHByLTRcIlxyXG4gICAgICAgID5cclxuICAgICAgICAgIDxiPnt7IFJlcG9ydERhdGUudGl0bGUgfX06IDwvYj5cclxuICAgICAgICAgIHt7IGN1cnJlbnRUaW1lIHwgZGF0ZTogUmVwb3J0RGF0ZS5mb3JtYXQgfX1cclxuICAgICAgICA8L3RkPlxyXG4gICAgICA8L3RyPlxyXG4gICAgPC90Ym9keT5cclxuICA8L3RhYmxlPlxyXG4gIDxsaWItcmVwb3J0LXRhYmxlXHJcbiAgICBbcmVwb3J0TWV0YURhdGFdPVwicmVwb3J0TWV0YURhdGFcIlxyXG4gICAgW2RldmlkSGVpZ2h0XT1cImRldmlkSGVpZ2h0XCJcclxuICAgIFtjb2x1bW5zXT1cImNvbHVtbnNcIlxyXG4gICAgW3JlcG9ydERhdGFdPVwicmVwb3J0RGF0YVwiXHJcbiAgICBbcmVwb3J0TWV0YURhdGFDb2x1bW5zXT1cInJlcG9ydE1ldGFEYXRhQ29sdW1uc1wiXHJcbiAgICBbZW1wdHlNZXNzYWdlXT1cImVtcHR5TWVzc2FnZVwiXHJcbiAgICBbZmlsbENvbG9yXT1cImZpbGxDb2xvclwiXHJcbiAgPjwvbGliLXJlcG9ydC10YWJsZT5cclxuPC9kaXY+XHJcblxyXG48IS0tIDxuZy10ZW1wbGF0ZSAjcmVwb3J0SGVhZGVyIGxldC1jbGFzc05hbWVzPVwiY2xhc3NOYW1lc1wiID5cclxuICA8dHI+XHJcbiAgICA8dGQgY29sU3Bhbj1cInt7IGNvbHVtbnMubGVuZ3RoIH19XCIgY2xhc3M9XCJib3JkZXItMCBjb21wYW55X25hbWUgcC0wXCI+XHJcbiAgICAgIDxoMiBjbGFzcz1cIm0tMFwiPlxyXG4gICAgICAgIDxiPnt7IHJlcG9ydFRpdGxlLkNvbXBhbnlSZWdOYW1lIH19PC9iPlxyXG4gICAgICA8L2gyPlxyXG4gICAgPC90ZD5cclxuICA8L3RyPlxyXG48L25nLXRlbXBsYXRlPiAtLT5cclxuIl19