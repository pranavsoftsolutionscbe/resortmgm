import * as i0 from '@angular/core';
import { Injectable, EventEmitter, Component, Input, Output, NgModule } from '@angular/core';
import * as i2 from '@angular/common';
import { formatDate, CommonModule } from '@angular/common';
import 'rxjs';
import * as i1 from 'ngx-toastr';
import { OrientationType } from 'report-tool/models';
import { validDetails, validOrderBy, validGroupingEligible, validGroupBy, validSumField, validRunningTotal, validGroupTotal, validGrandTotal, validFilterField, SampleReport, OrderByPref, FilterByRef, dateRange, ListType, fillColor } from 'report-tool/core';
import * as i3 from '@angular/forms';
import { FormsModule } from '@angular/forms';
import * as i4 from 'primeng/dropdown';
import { DropdownModule } from 'primeng/dropdown';
import * as i5 from 'ng-pick-datetime-ex';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime-ex';

class ReportToolService {
    constructor() { }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportToolService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportToolService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportToolService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: function () { return []; } });

class ReportToolComponent {
    constructor(toastr) {
        this.toastr = toastr;
        this.reportTreeNode = [];
        this.reportList = [];
        this.reportHeads = {};
        this.reportDetails = [];
        this.reportPort = {};
        this.pdDateRange = [];
        this.phDateFormat = "dd-MM-yyyy";
        this.validViewDisabled = validDetails;
        this.validOrderBy = validOrderBy;
        this.validGroupingEligible = validGroupingEligible;
        this.validGroupBy = validGroupBy;
        this.validSumField = validSumField;
        this.validRunningTotal = validRunningTotal;
        this.validGroupTotal = validGroupTotal;
        this.validGrandTotal = validGrandTotal;
        this.validFilterField = validFilterField;
        this.showList = true;
        this.onSelectReport = new EventEmitter();
        this.onLedgerQuery = new EventEmitter();
        this.onReportEvent = new EventEmitter();
        this.onSaveReport = new EventEmitter();
        this.sampleReport = SampleReport;
        this.pdStyleSheets = [];
        this.initialize();
    }
    ngOnChanges(changes) {
        if (this.obsReportList && changes.obsReportList) {
            this.getReportList();
        }
        if (this.obsReportHeads && changes.obsReportHeads) {
            this.getReportHeads();
        }
        if (this.obsReportDetails && changes.obsReportDetails) {
            this.getReportDetails();
        }
    }
    onChangeDateRange() {
        const { DateDefault } = this.reportHeads;
        const { FromDate, ToDate } = this.reportPort;
        const dateRange = this.dateRangeList.find((f) => f.value === DateDefault);
        const data = dateRange || {};
        this.reportPort.FromDate = data.FromDate || FromDate;
        this.reportPort.ToDate = data.ToDate || ToDate;
    }
    toggleOrderByField(field = "OrderByRemove") {
        const detail = this.reportDetails.find((f) => f.RDAutoId === this.reportPort[field]);
        if (detail) {
            detail.OrderBy = !detail.OrderBy;
            detail.OrderByPref = detail.OrderByPref || OrderByPref.ASC;
            this.reportPort[field] = 0;
        }
    }
    toggleOrderByPref(detail) {
        detail.OrderByPref =
            detail.OrderByPref === OrderByPref.DESC
                ? OrderByPref.ASC
                : OrderByPref.DESC;
    }
    toggleGroupByField(isGroupBy = true, fixedGroup = false) {
        const setMetadataColumns = (columns, index = 0, gIndex = 1) => {
            const detail = this.reportDetails[index];
            if ((columns || {}).field) {
                setMetadataColumns(columns.columns, index, gIndex + 1);
            }
            else {
                if (detail) {
                    if (detail.GroupByAdd) {
                        detail.GroupBy = true;
                        detail.GroupByAdd = false;
                        columns = columns || {};
                        columns.header = "";
                        columns.label = detail.DisplayName;
                        columns.field = detail.MyFieldName;
                        // columns.subTotal = subTotalFields;
                        columns.columns = {};
                        columns.gIndex = gIndex;
                        setMetadataColumns(columns.columns, index + 1, gIndex + 1);
                    }
                    else {
                        setMetadataColumns(columns, index + 1, gIndex);
                    }
                }
                else {
                    this.setSumFields();
                }
            }
        };
        const removeMetadataColumns = () => {
            this.reportMetadataCols = null;
            this.reportDetails.forEach((detail) => {
                detail.GroupBy = false;
                detail.GroupByAdd = false;
            });
        };
        this.reportMetadataCols = this.reportMetadataCols || {};
        if (fixedGroup) {
            this.toastr.warning(`Fixed Group not modified`);
        }
        else {
            if (isGroupBy) {
                setMetadataColumns(this.reportMetadataCols);
            }
            else {
                removeMetadataColumns();
            }
        }
    }
    toggleSumField(field, isAdd = true) {
        const value = field === "GrandTotal" ? (isAdd ? 1 : 0) : isAdd;
        this.reportDetails.forEach((detail) => {
            if (detail.SumField && (detail.SumFieldAdd || !isAdd)) {
                detail[field] = value;
            }
        });
        this.setSumFields();
    }
    toggleFilterField(detail) {
        this.reportPort.FilterField = detail.RDAutoId;
        this.reportPort.ddFilterOperator =
            detail.DType.toLowerCase() === "string"
                ? FilterByRef.String
                : FilterByRef.Number;
        this.reportPort.ddFilterListAll = [];
        this.reportPort.ddFilterList = [];
        this.reportPort.FilterOperator = this.reportPort.ddFilterOperator[0].value;
        this.reportPort.FilterCondition = "";
        if (detail.ComboQuery) {
            const splitted = detail.FieldsName.split(".");
            const field = splitted[splitted.length - 1];
            const query = this.replaceQueryValues(detail.ComboQuery);
            const request = {
                CustID: this.reportHeads.Cust_ID,
                SqlQuery: query,
            };
            // this.smatrixSvc
            //   .post(Endpoint.GetReportDynamic, request)
            //   .subscribe((response: any[]) => {
            //     this.reportPort.ddFilterListAll = response.map(
            //       (m) => m[field || detail.MyFieldName]
            //     );
            //   });
        }
    }
    onSearchFilterList(query) {
        this.reportPort.ddFilterList = this.reportPort.ddFilterListAll.filter((f) => (f || "").toLowerCase().includes(query.trim().toLowerCase()));
    }
    addToFilterField() {
        const detail = this.reportDetails.find((f) => f.RDAutoId === this.reportPort.FilterField);
        this.reportPort.FilterCondition = (this.reportPort.FilterCondition || "").trim();
        if (detail && this.reportPort.FilterCondition.length) {
            const { FieldsName, DType } = detail;
            const condition = this.reportPort.FilterCondition;
            const operator = this.reportPort.FilterOperator;
            const filterField = this.reportPort.FilterFieldList.find((f) => f.RDAutoId === detail.RDAutoId &&
                f.FilterOperator === this.reportPort.FilterOperator);
            if (filterField) {
                const filterOperator = this.reportPort.ddFilterOperator.find((f) => f.label === this.reportPort.FilterOperator);
                if (filterOperator.value) {
                    const conditions = filterField.FilterCondition.split(",");
                    if (!conditions.includes(condition)) {
                        conditions.push(condition);
                        filterField.FilterCondition = conditions.join();
                        filterField.WhereCondition = FilterByRef.WhereCondition(FieldsName, operator, condition);
                    }
                }
                else {
                    this.toastr.warning(`"${detail.DisplayName}" field condition already added.\nDelete the existing condition and proceed`);
                }
            }
            else {
                const data = {
                    RDAutoId: detail.RDAutoId,
                    FieldsName: detail.FieldsName,
                    DisplayName: detail.DisplayName,
                    MyFieldName: detail.MyFieldName,
                    FilterOperator: this.reportPort.FilterOperator,
                    FilterCondition: condition,
                    WhereCondition: FilterByRef.WhereCondition(FieldsName, operator, condition),
                };
                this.reportPort.FilterFieldList.push(data);
            }
        }
    }
    onChangeStyleSheet() {
    }
    doSave() {
        const removeFields = ["ReportId", "RDAutoId"];
        const head = Object.keys(this.reportHeads).reduce((init, key) => {
            if (!removeFields.includes(key) || !this.reportHeads.IsStdReport) {
                init[key] = this.reportHeads[key];
            }
            return init;
        }, {});
        const details = this.reportDetails.map((item) => {
            const detail = Object.keys(item).reduce((init, key) => {
                if (!removeFields.includes(key) || !head.IsStdReport) {
                    init[key] = item[key];
                }
                return init;
            }, {});
            return detail;
        });
        let count = 1;
        const saveReportHead = () => {
            const request = {
                MyReportHead: head,
                MyReportDetails: details,
            };
            this.onSaveReport.emit(request);
        };
        const askReportName = (rName = head.ReportName) => {
            const reportName = prompt("Report Name is already exist", rName);
            if (reportName) {
                checkExistingName(reportName);
            }
            else {
                // askReportName();
            }
        };
        const checkExistingName = (reportName = head.ReportName) => {
            if (this.isExistReportName(reportName)) {
                ++count;
                askReportName(reportName);
            }
            else {
                head.ReportName = reportName;
                head.IsStdReport = false;
                saveReportHead();
            }
        };
        if (head.IsStdReport) {
            checkExistingName();
        }
        else {
            checkExistingName();
        }
    }
    getReport() {
        if (!(this.reportHeads.LedgerFieldName || "").trim().length ||
            this.reportPort.LedgerValue) {
            const urlRequest = {
                Title: this.reportHeads.ReportName,
                columns: this.reportColumns,
                reportMetaDataColumns: this.reportMetadataCols,
                orientation: this.reportHeads.Portrait
                    ? OrientationType.Portrait
                    : OrientationType.Landscape,
                pageSize: this.reportHeads.PaperSize,
                sqlRequest: this.sqlQuery,
                CustId: this.reportHeads.Cust_ID,
                bgColor: this.fillColor,
                numberFormat: this.numberFormat,
            };
            this.onReportEvent.emit(urlRequest);
        }
        else {
            this.toastr.warning(`Please select ${this.reportHeads.WarningMessage}`);
        }
    }
    initialize() {
        const today = new Date();
        this.reportList = [];
        this.reportHeads = { DateDefault: this.reportHeads.DateDefault || "Today" };
        this.reportDetails = [];
        this.reportMetadataCols = {};
        this.reportPort = {
            FromDate: today,
            ToDate: today,
            LedgerList: [],
            ddFilterOperator: [],
            ddFilterListAll: [],
            ddFilterList: [],
            FilterFieldList: [],
        };
        this.pdDateRange = dateRange;
    }
    getReportList() {
        this.obsReportList.subscribe((result) => {
            this.reportList = result;
            this.setTreeNode();
        });
    }
    getReportHeads() {
        this.obsReportHeads.subscribe((result) => {
            this.reportHeads = result;
            this.setReportHeads();
        });
    }
    getReportDetails() {
        this.obsReportDetails.subscribe((result) => {
            this.reportDetails = result;
            this.setReportDetails();
        });
    }
    setTreeNode() {
        this.reportTreeNode = [];
        this.reportTreeNode = this.reportList.map((item) => {
            const node = {
                label: item.ReportGroup,
                data: item.MasterId,
                type: ListType.GROUP,
                children: [],
            };
            node.children = item.MyReportHead.map((subItem) => {
                return {
                    label: subItem.ReportName,
                    data: subItem.ReportId,
                    type: ListType.LEDGER,
                };
            });
            return node;
        });
    }
    setReportHeads() {
        this.reportHeads.DateDefault = this.reportHeads.DateDefault || "Today";
        this.onChangeDateRange();
        this.setLedgerQuery();
    }
    setReportDetails() {
        this.reportDetails = this.reportDetails.map((detail) => {
            return {
                ...detail,
                GroupByAdd: detail.GroupBy,
                MyFieldName: detail.DisplayName.replace(/[^a-zA-Z0-9]/g, ""),
            };
        });
        this.toggleGroupByField();
        this.onChangeStyleSheet();
    }
    setLedgerQuery() {
        const { LedgerFieldName, LedgerQuery } = this.reportHeads;
        if ((LedgerQuery || "").trim().length) {
            const splitted = (LedgerFieldName || "").split(".");
            this.reportPort.LedgerField = splitted[splitted.length - 1];
            const query = this.replaceQueryValues(LedgerQuery);
            this.onLedgerQuery.emit(query);
        }
    }
    replaceQueryValues(query) {
        const { Cust_ID } = this.reportHeads;
        const DT1 = formatDate(this.reportPort.FromDate, "yyyy-MM-dd", "en-IN");
        const DT2 = formatDate(this.reportPort.ToDate, "yyyy-MM-dd", "en-IN");
        const LedgerValue = this.reportPort.LedgerValue || 0;
        const LedgerField = this.reportPort.LedgerField;
        return query
            .split("#Cust_ID")
            .join(Cust_ID.toString())
            .split("#DT1")
            .join(`'${DT1}'`)
            .split("#DT2")
            .join(`'${DT2}'`)
            .split(`#${LedgerField}`)
            .join(LedgerValue.toString());
    }
    setSumFields() {
        const subTotalFields = this.reportDetails.reduce((init, current) => {
            if (current.GroupTotal) {
                init.push(current.MyFieldName);
            }
            return init;
        }, []);
        this.reportMetadataCols = this.reportMetadataCols || {};
        const setMetadataColumns = (columns) => {
            if ((columns || {}).field) {
                columns.subTotal = subTotalFields;
                setMetadataColumns(columns.columns);
            }
        };
        setMetadataColumns(this.reportMetadataCols);
    }
    isExistReportName(name) {
        return this.reportList.some((s) => s.MyReportHead.some((ss) => ss.ReportName.trim().toLowerCase() === name.trim().toLowerCase()));
    }
    isChange(data) {
        if (data) {
            const previous = JSON.stringify(data.previousValue);
            const current = JSON.stringify(data.currentValue);
            return previous !== current;
        }
        return false;
    }
    get fillColor() {
        return {
            header: fillColor.header.replace("#", ""),
            odd: (this.reportHeads.Record1Color || fillColor.odd).replace("#", ""),
            even: (this.reportHeads.Record2Color || fillColor.even).replace("#", ""),
            group: fillColor.group.replace("#", ""),
            subgroup: fillColor.subgroup.replace("#", ""),
            groupTotal: (this.reportHeads.GroupTotalColor || fillColor.groupTotal).replace("#", ""),
            grandTotal: (this.reportHeads.GrandTotalColor || fillColor.grandTotal).replace("#", ""),
        };
    }
    get sqlQuery() {
        const { SqlQuery, WhereCondition, LedgerFieldName } = this.reportHeads;
        // Columns Query
        const columns = this.reportDetails.reduce((init, current) => {
            if (!current.ViewDisabled) {
                const fieldName = current.MyFieldName;
                const queryName = this.replaceQueryValues(current.FieldsName);
                init.push(`${fieldName}=${queryName}`);
            }
            return init;
        }, []);
        // Where Condition
        let Where = "";
        if ((WhereCondition || "").length) {
            Where = this.replaceQueryValues(WhereCondition);
        }
        Where = this.reportPort.FilterFieldList.reduce((init, current) => {
            const query = this.replaceQueryValues(current.WhereCondition);
            init += `${init.length ? " and" : ""} ${query}`;
            return init;
        }, Where);
        if (this.reportPort.LedgerField && this.reportPort.LedgerValue) {
            Where =
                (Where.length ? Where + " AND " : "") +
                    LedgerFieldName +
                    "=" +
                    this.reportPort.LedgerValue;
        }
        Where = Where.length ? "WHERE " + Where : "";
        // OrderBy Columns
        const OrderBy = this.reportDetails
            .filter((f) => !f.ViewDisabled)
            .reduce((init, current, i) => {
            if (current.OrderBy) {
                const orderByPref = current.OrderByPref;
                init.push(`${i + 1} ${orderByPref}`);
            }
            return init;
        }, []);
        return `SELECT ${columns.join()} ${SqlQuery} ${Where} ORDER BY ${OrderBy.join()}`;
    }
    get dateRangeList() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const date = today.getDate();
        const day = today.getDay();
        const quarter = Math.floor(today.getMonth() / 3);
        const weekStart = new Date(year, month, date - day);
        const monthStart = new Date(year, month, 1);
        const quarterStart = new Date(today.getFullYear(), quarter * 3, 1);
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const yesterDay = new Date(year, month, date - 1);
        const lastWeekStart = new Date(year, month, date - (day + 7));
        const lastWeekEnd = new Date(year, month, date - (day + 1));
        const lastMonthStart = new Date(year, month - 1, 1);
        const lastMonthEnd = new Date(year, month, 0);
        const lastQuarterStart = new Date(today.getFullYear(), quarter * 3 - 3, 1);
        const lastQuarterEnd = new Date(today.getFullYear(), quarter * 3, 0);
        const dateRange = this.pdDateRange;
        return (dateRange || []).map((item) => {
            item.data = { ...item };
            if (item.value === "Today") {
                item.data.FromDate = today;
                item.data.ToDate = today;
            }
            else if (item.value === "This Week To Date") {
                item.data.FromDate = weekStart;
                item.data.ToDate = today;
            }
            else if (item.value === "This Month To Date") {
                item.data.FromDate = monthStart;
                item.data.ToDate = today;
            }
            else if (item.value === "This Quarter To Date") {
                item.data.FromDate = quarterStart;
                item.data.ToDate = today;
            }
            else if (item.value === "This Fiscal Year To Date") {
                item.data.FromDate = yearStart;
                item.data.ToDate = today;
            }
            else if (item.value === "Yesterday") {
                item.data.FromDate = yesterDay;
                item.data.ToDate = yesterDay;
            }
            else if (item.value === "Last Week") {
                item.data.FromDate = lastWeekStart;
                item.data.ToDate = lastWeekEnd;
            }
            else if (item.value === "Last Month") {
                item.data.FromDate = lastMonthStart;
                item.data.ToDate = lastMonthEnd;
            }
            else if (item.value === "Last Quarter") {
                item.data.FromDate = lastQuarterStart;
                item.data.ToDate = lastQuarterEnd;
            }
            return { ...item };
        });
    }
    get reportColumns() {
        const totalWidth = this.reportDetails.reduce((init, current) => {
            if (!(current.ViewDisabled || current.ZoomField || current.GroupBy)) {
                init += current.Width || 0;
            }
            return init;
        }, 0);
        const widthDivision = totalWidth / 95;
        return this.reportDetails.reduce((init, current) => {
            if (!(current.ViewDisabled || current.ZoomField || current.GroupBy)) {
                const col = {
                    header: current.DisplayName,
                    field: current.MyFieldName,
                    type: current.DType.toLowerCase(),
                    width: current.Width,
                    PdfWidth: current.Width / widthDivision,
                    ExcelWidth: current.Width / 8,
                };
                init.push(col);
            }
            return init;
        }, []);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportToolComponent, deps: [{ token: i1.ToastrService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.2.1", type: ReportToolComponent, selector: "lib-report-tool", inputs: { showList: "showList", obsReportList: "obsReportList", obsReportHeads: "obsReportHeads", obsReportDetails: "obsReportDetails", reportMetadataCols: "reportMetadataCols", pdStyleSheets: "pdStyleSheets", numberFormat: "numberFormat" }, outputs: { onSelectReport: "onSelectReport", onLedgerQuery: "onLedgerQuery", onReportEvent: "onReportEvent", onSaveReport: "onSaveReport" }, usesOnChanges: true, ngImport: i0, template: "<div class=\"contaner-fluid\">\r\n  <div class=\"row row-eq-height\">\r\n    <div class=\"col-md-3 pe-0\" *ngIf=\"showList\">\r\n      <div class=\"card h-100\">\r\n        <div class=\"card-body\">\r\n          <div class=\"input-group\">\r\n            <span class=\"input-group-text\">\r\n              <i class=\"fa fa-search\"></i>\r\n            </span>\r\n            <input\r\n              type=\"text\"\r\n              class=\"form-control\"\r\n              placeholder=\"Search report...\"\r\n              #searchReport\r\n            />\r\n          </div>\r\n          <div class=\"accordion accordion-flush\" id=\"reportList\">\r\n            <ng-container *ngFor=\"let report of reportTreeNode\">\r\n              <div class=\"accordion-item\">\r\n                <h2 class=\"accordion-header\" id=\"report-head-{{ report.data }}\">\r\n                  <button\r\n                    class=\"accordion-button collapsed\"\r\n                    type=\"button\"\r\n                    data-bs-toggle=\"collapse\"\r\n                    attr.data-bs-target=\"#report-body-{{ report.data }}\"\r\n                    aria-expanded=\"false\"\r\n                    attr.aria-controls=\"report-body-{{ report.data }}\"\r\n                  >\r\n                    {{ report.label }}\r\n                  </button>\r\n                </h2>\r\n                <div\r\n                  id=\"report-body-{{ report.data }}\"\r\n                  class=\"accordion-collapse collapse\"\r\n                  aria-labelledby=\"report-head-{{ report.data }}\"\r\n                  data-bs-parent=\"#reportList\"\r\n                >\r\n                  <div class=\"list-group list-group-flush\">\r\n                    <a\r\n                      *ngFor=\"let subReport of report.children\"\r\n                      href=\"javascript:void(0)\"\r\n                      class=\"list-group-item list-group-item-action text-truncate\"\r\n                      [class.active]=\"subReport.data == reportHeads.ReportId\"\r\n                      [title]=\"subReport.label\"\r\n                      (click)=\"onSelectReport.emit(subReport.data)\"\r\n                    >\r\n                      <span class=\"fa fa-file-text mr-2\"></span>\r\n                      {{ subReport.label }}\r\n                    </a>\r\n                  </div>\r\n                </div>\r\n              </div>\r\n            </ng-container>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n\r\n    <div class=\"col-md\">\r\n      <div class=\"card report-details\">\r\n        <h6 class=\"card-header text-bg-secondary\">Report Details</h6>\r\n        <ng-container\r\n          [ngTemplateOutlet]=\"commonFieldsTab\"\r\n          [ngTemplateOutletContext]=\"{ readonly: true }\"\r\n        ></ng-container>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n<div class=\"bg-secondary avbar navbar-expand-lg navbar-light sticky-bottom\">\r\n  <div class=\"text-center d-lg-none w-100\">\r\n    <button\r\n      type=\"button\"\r\n      class=\"navbar-toggler dropdown-toggle\"\r\n      data-bs-toggle=\"collapse\"\r\n      data-bs-target=\"#navbar-footer\"\r\n    >\r\n      <i class=\"fa fa-cogs\"></i>\r\n      &nbsp;Controls\r\n    </button>\r\n  </div>\r\n\r\n  <div class=\"navbar-collapse collapse\" id=\"navbar-footer\">\r\n    <div class=\"w-100 p-2\">\r\n      <div class=\"d-flex justify-content-evenly\">\r\n        <button type=\"button\" class=\"btn btn-primary\">\r\n          <span class=\"fa fa-history\"></span>&nbsp;Memories\r\n        </button>\r\n        <button\r\n          type=\"button\"\r\n          class=\"btn btn-secondary\"\r\n          data-bs-toggle=\"modal\"\r\n          data-bs-target=\"#modifiedReportPort\"\r\n        >\r\n          <span class=\"fa fa-history\"></span>&nbsp;Modified\r\n        </button>\r\n        <button type=\"button\" class=\"btn btn-success\">\r\n          <span class=\"fa fa-history\"></span>&nbsp;Report\r\n        </button>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n<div\r\n  class=\"modal\"\r\n  id=\"modifiedReportPort\"\r\n  tabindex=\"-1\"\r\n  role=\"dialog\"\r\n  aria-labelledby=\"modifiedReportPortTitle\"\r\n  aria-hidden=\"true\"\r\n  data-backdrop=\"static\"\r\n>\r\n  <div class=\"modal-dialog modal-lg m-auto\" role=\"document\">\r\n    <div class=\"modal-content\">\r\n      <div class=\"modal-header p-1\">\r\n        <h5 class=\"modal-title\">Report Setup - {{ reportHeads.ReportName }}</h5>\r\n        <button\r\n          type=\"button\"\r\n          class=\"close\"\r\n          data-dismiss=\"modal\"\r\n          aria-label=\"Close\"\r\n        >\r\n          <span aria-hidden=\"true\">&times;</span>\r\n        </button>\r\n      </div>\r\n      <div class=\"modal-body p-0\">\r\n        <ul\r\n          class=\"nav nav-tabs nav-tabs-solid bg-teal-400 border-0 nav-justified\"\r\n        >\r\n          <li class=\"nav-item flex-basis border-right\">\r\n            <a\r\n              href=\"#fields-tab\"\r\n              class=\"nav-link font-weight-bold active show px-2\"\r\n              data-toggle=\"tab\"\r\n            >\r\n              Fields\r\n            </a>\r\n          </li>\r\n          <li class=\"nav-item flex-basis border-right\">\r\n            <a\r\n              href=\"#grouping-tab\"\r\n              class=\"nav-link font-weight-bold px-2\"\r\n              data-toggle=\"tab\"\r\n            >\r\n              Grouping\r\n            </a>\r\n          </li>\r\n          <li class=\"nav-item flex-basis border-right\">\r\n            <a\r\n              href=\"#sum-tab\"\r\n              class=\"nav-link font-weight-bold px-2\"\r\n              data-toggle=\"tab\"\r\n            >\r\n              Sum\r\n            </a>\r\n          </li>\r\n          <li class=\"nav-item flex-basis border-right\">\r\n            <a\r\n              href=\"#filter-tab\"\r\n              class=\"nav-link font-weight-bold px-2\"\r\n              data-toggle=\"tab\"\r\n            >\r\n              Filter\r\n            </a>\r\n          </li>\r\n          <li class=\"nav-item flex-basis border-right\">\r\n            <a\r\n              href=\"#styles-tab\"\r\n              class=\"nav-link font-weight-bold px-2\"\r\n              data-toggle=\"tab\"\r\n            >\r\n              Styles\r\n            </a>\r\n          </li>\r\n          <li class=\"nav-item flex-basis border-right\">\r\n            <a\r\n              href=\"#page-setup-tab\"\r\n              class=\"nav-link font-weight-bold px-2\"\r\n              data-toggle=\"tab\"\r\n            >\r\n              Page setup\r\n            </a>\r\n          </li>\r\n        </ul>\r\n        <div class=\"detail-tabs tab-content\">\r\n          <div class=\"tab-pane fade active show\" id=\"fields-tab\">\r\n            <ng-container [ngTemplateOutlet]=\"fieldsTab\"></ng-container>\r\n          </div>\r\n\r\n          <div class=\"tab-pane fade\" id=\"grouping-tab\">\r\n            <ng-container [ngTemplateOutlet]=\"groupTab\"></ng-container>\r\n          </div>\r\n\r\n          <div class=\"tab-pane fade\" id=\"sum-tab\">\r\n            <ng-container [ngTemplateOutlet]=\"sumTab\"></ng-container>\r\n          </div>\r\n\r\n          <div class=\"tab-pane fade\" id=\"filter-tab\">\r\n            <ng-container [ngTemplateOutlet]=\"filterTab\"></ng-container>\r\n          </div>\r\n\r\n          <div class=\"tab-pane fade\" id=\"styles-tab\">\r\n            <ng-container [ngTemplateOutlet]=\"styleTab\"></ng-container>\r\n          </div>\r\n\r\n          <div class=\"tab-pane fade\" id=\"page-setup-tab\">\r\n            <ng-container [ngTemplateOutlet]=\"pageSetupTab\"></ng-container>\r\n          </div>\r\n        </div>\r\n      </div>\r\n      <div class=\"modal-footer p-1\">\r\n        <button class=\"btn btn-success\" (click)=\"doSave()\">\r\n          {{ reportHeads.IsStdReport ? \"Save As\" : \"Save\" }}\r\n        </button>\r\n        <button class=\"btn btn-success\" (click)=\"getReport()\">Report</button>\r\n        <button class=\"btn btn-secondary\" data-dismiss=\"modal\">Close</button>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n<ng-template #commonFieldsTab let-readonly=\"readonly\">\r\n  <div class=\"card-body\">\r\n    <div class=\"row form-group\">\r\n      <div class=\"col-lg-4\">\r\n        <label>Report Title</label>\r\n        <input\r\n          type=\"text\"\r\n          class=\"form-control\"\r\n          [(ngModel)]=\"reportHeads.ReportName\"\r\n          [readonly]=\"readonly\"\r\n        />\r\n      </div>\r\n      <div class=\"col-lg-8\">\r\n        <label>Report Description</label>\r\n        <input\r\n          type=\"text\"\r\n          class=\"form-control\"\r\n          [(ngModel)]=\"reportHeads.ReportDescription\"\r\n          [readonly]=\"readonly\"\r\n        />\r\n      </div>\r\n    </div>\r\n  </div>\r\n\r\n  <h6\r\n    class=\"card-header text-bg-secondary\"\r\n    *ngIf=\"reportHeads.NoOfDateFields || true\"\r\n  >\r\n    Report Date Range\r\n  </h6>\r\n  <div class=\"card-body\" *ngIf=\"reportHeads.NoOfDateFields || true\">\r\n    <div class=\"row form-group\">\r\n      <div class=\"col-md-4\">\r\n        <label>Date Range</label>\r\n        <p-dropdown\r\n          [styleClass]=\"'form-control'\"\r\n          [placeholder]=\"'Select date range'\"\r\n          [options]=\"pdDateRange\"\r\n          [(ngModel)]=\"reportHeads.DateDefault\"\r\n          [appendTo]=\"'body'\"\r\n          [filter]=\"pdDateRange.length > 5\"\r\n          [resetFilterOnHide]=\"true\"\r\n          (onChange)=\"onChangeDateRange()\"\r\n          [baseZIndex]=\"1040\"\r\n          itemSize=\"1\"\r\n          appendTo=\"body\"\r\n        >\r\n        </p-dropdown>\r\n      </div>\r\n      <div class=\"col-md-4\" *ngIf=\"reportHeads.NoOfDateFields >= 1 || true\">\r\n        <label>From Date</label>\r\n        <input\r\n          class=\"form-control\"\r\n          [owlDateTime]=\"fromDt\"\r\n          [owlDateTimeTrigger]=\"fromDt\"\r\n          [placeholder]=\"phDateFormat\"\r\n          [(ngModel)]=\"reportPort.FromDate\"\r\n        />\r\n        <owl-date-time #fromDt [pickerType]=\"'calendar'\"></owl-date-time>\r\n      </div>\r\n      <div class=\"col-md-4\" *ngIf=\"reportHeads.NoOfDateFields >= 2 || true\">\r\n        <label>To Date</label>\r\n        <input\r\n          class=\"form-control\"\r\n          [owlDateTime]=\"toDt\"\r\n          [owlDateTimeTrigger]=\"toDt\"\r\n          [placeholder]=\"phDateFormat\"\r\n          [(ngModel)]=\"reportPort.ToDate\"\r\n        />\r\n        <owl-date-time #toDt [pickerType]=\"'calendar'\"></owl-date-time>\r\n      </div>\r\n    </div>\r\n  </div>\r\n\r\n  <h6 class=\"card-header text-bg-secondary\">\r\n    Select {{ reportHeads.WarningMessage || \"Account\" }}\r\n  </h6>\r\n  <div class=\"card-body\">\r\n    <div class=\"row form-group\">\r\n      <div class=\"col-md-4\">\r\n        <label>{{ reportHeads.WarningMessage || \"Account Name\" }}</label>\r\n        <p-dropdown\r\n          [styleClass]=\"'form-control'\"\r\n          [placeholder]=\"\r\n            'Select ' + (reportHeads.WarningMessage || 'Account Name')\r\n          \"\r\n          [options]=\"reportPort.LedgerList\"\r\n          [(ngModel)]=\"reportPort.LedgerValue\"\r\n          [appendTo]=\"'body'\"\r\n          [filter]=\"reportPort.LedgerList.length > 5\"\r\n          [resetFilterOnHide]=\"true\"\r\n          [baseZIndex]=\"1040\"\r\n          appendTo=\"body\"\r\n          itemSize=\"1\"\r\n        >\r\n        </p-dropdown>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</ng-template>\r\n\r\n<ng-template #fieldsTab>\r\n  <div class=\"card mb-0 p-1\">\r\n    <ng-container\r\n      [ngTemplateOutlet]=\"commonFieldsTab\"\r\n      [ngTemplateOutletContext]=\"{ readonly: false }\"\r\n    ></ng-container>\r\n    <h5 class=\"bg-teal-400 mb-0 p-1\">Fields to Display</h5>\r\n    <div class=\"card-body\">\r\n      <div class=\"row\">\r\n        <div class=\"col-lg-6\">\r\n          <div style=\"height: 200px; overflow-y: auto\">\r\n            <table class=\"table table-bordered\">\r\n              <thead class=\"table-head-bg\">\r\n                <tr>\r\n                  <th class=\"p-1 w-25\">Action</th>\r\n                  <th class=\"p-1 w-75\">Display Name</th>\r\n                  <th class=\"p-1 w-25\">Width</th>\r\n                </tr>\r\n              </thead>\r\n              <tbody>\r\n                <tr *ngFor=\"let detail of reportDetails\">\r\n                  <td\r\n                    class=\"text-center pointer py-0\"\r\n                    (click)=\"detail.ViewDisabled = !detail.ViewDisabled\"\r\n                  >\r\n                    <i\r\n                      class=\"fa text-{{\r\n                        detail.ViewDisabled\r\n                          ? 'danger fa-times'\r\n                          : 'success fa-check'\r\n                      }}\"\r\n                    ></i>\r\n                  </td>\r\n                  <td class=\"py-0\">{{ detail.DisplayName }}</td>\r\n                  <td class=\"p-0\">\r\n                    <input\r\n                      type=\"number\"\r\n                      class=\"form-control bg-transparent\"\r\n                      [(ngModel)]=\"detail.Width\"\r\n                    />\r\n                  </td>\r\n                </tr>\r\n              </tbody>\r\n            </table>\r\n          </div>\r\n        </div>\r\n\r\n        <div class=\"col-lg-6\">\r\n          <div class=\"form-group row\">\r\n            <label class=\"col-lg-4\">Sort By</label>\r\n            <div class=\"col-lg-8 input-group\">\r\n              <span class=\"input-group-prepend\">\r\n                <span class=\"input-group-text\"><i class=\"fa fa-user\"></i></span>\r\n              </span>\r\n              <select class=\"form-control\" [(ngModel)]=\"reportPort.OrderByAdd\">\r\n                <ng-container\r\n                  *ngFor=\"\r\n                    let detail of reportDetails | filterBy : validViewDisabled\r\n                  \"\r\n                >\r\n                  <option *ngIf=\"!detail.OrderBy\" [ngValue]=\"detail.RDAutoId\">\r\n                    {{ detail.DisplayName }}\r\n                  </option>\r\n                </ng-container>\r\n              </select>\r\n            </div>\r\n          </div>\r\n          <button\r\n            type=\"button\"\r\n            class=\"btn btn-info ml-3 mb-1\"\r\n            (click)=\"toggleOrderByField('OrderByAdd')\"\r\n          >\r\n            Add\r\n          </button>\r\n          <button\r\n            type=\"button\"\r\n            class=\"btn btn-info ml-3 mb-1\"\r\n            (click)=\"toggleOrderByField()\"\r\n          >\r\n            Remove\r\n          </button>\r\n\r\n          <div style=\"height: 120px; overflow-y: auto\">\r\n            <table class=\"table table-bordered\">\r\n              <thead class=\"table-head-bg position-sticky top\">\r\n                <tr>\r\n                  <th class=\"p-1\">S.No</th>\r\n                  <th class=\"p-1\">Field Name</th>\r\n                  <th class=\"p-1\">Sort By</th>\r\n                </tr>\r\n              </thead>\r\n              <tbody>\r\n                <ng-container\r\n                  *ngFor=\"\r\n                    let detail of reportDetails | filterBy : validOrderBy;\r\n                    let i = index\r\n                  \"\r\n                >\r\n                  <tr (click)=\"reportPort.OrderByRemove = detail.RDAutoId\">\r\n                    <td class=\"p-1\">{{ i + 1 }}</td>\r\n                    <td\r\n                      class=\"p-1\"\r\n                      [class.bg-primary]=\"\r\n                        reportPort.OrderByRemove == detail.RDAutoId\r\n                      \"\r\n                    >\r\n                      {{ detail.DisplayName }}\r\n                    </td>\r\n                    <td class=\"p-1 pointer\" (click)=\"toggleOrderByPref(detail)\">\r\n                      {{ detail.OrderByPref }}\r\n                    </td>\r\n                  </tr>\r\n                </ng-container>\r\n              </tbody>\r\n            </table>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</ng-template>\r\n\r\n<ng-template #groupTab>\r\n  <div class=\"card mb-0 p-1\">\r\n    <h5 class=\"bg-teal-400 mb-0 p-1\">Available Fields for Grouping</h5>\r\n\r\n    <div class=\"card-body\">\r\n      <div class=\"row\">\r\n        <div class=\"col-lg-5\">\r\n          <table class=\"table table-bordered\">\r\n            <thead class=\"table-head-bg position-sticky top\">\r\n              <tr>\r\n                <th class=\"p-1 w-25\"></th>\r\n                <th class=\"p-1 w-75\">Display Name</th>\r\n              </tr>\r\n            </thead>\r\n            <tbody>\r\n              <ng-container\r\n                *ngFor=\"\r\n                  let detail of reportDetails | filterBy : validGroupingEligible\r\n                \"\r\n              >\r\n                <tr *ngIf=\"!detail.GroupBy\">\r\n                  <td\r\n                    class=\"p-1 pointer text-center text-success\"\r\n                    (click)=\"detail.GroupByAdd = !detail.GroupByAdd\"\r\n                  >\r\n                    <span *ngIf=\"detail.GroupByAdd\" class=\"fa fa-check\"></span>\r\n                  </td>\r\n                  <td class=\"p-1\">{{ detail.DisplayName }}</td>\r\n                </tr>\r\n              </ng-container>\r\n            </tbody>\r\n          </table>\r\n        </div>\r\n\r\n        <div\r\n          class=\"col-lg-2 row d-flex justify-content-center text-center align-self-center mx-auto\"\r\n        >\r\n          <button\r\n            class=\"btn btn-primary\"\r\n            (click)=\"toggleGroupByField(true, reportHeads.FixedGroup)\"\r\n          >\r\n            <li class=\"fa fa-fast-forward\" aria-hidden=\"true\"></li>\r\n          </button>\r\n        </div>\r\n\r\n        <div class=\"col-lg-5 text-center\">\r\n          <div class=\"card h-100\">\r\n            <div class=\"card-body\">\r\n              <ng-template #treeView let-data=\"columns\">\r\n                <ul\r\n                  class=\"list-style-none text-left pl-3\"\r\n                  *ngIf=\"data && data.field\"\r\n                >\r\n                  <li class=\"\">\r\n                    <span>\r\n                      <span class=\"badge badge-success\">{{ data.gIndex }}</span>\r\n                      {{ data.label }}\r\n                    </span>\r\n                    <ng-container\r\n                      [ngTemplateOutlet]=\"treeView\"\r\n                      [ngTemplateOutletContext]=\"{ columns: data.columns }\"\r\n                    ></ng-container>\r\n                  </li>\r\n                </ul>\r\n              </ng-template>\r\n              <ng-container\r\n                [ngTemplateOutlet]=\"treeView\"\r\n                [ngTemplateOutletContext]=\"{ columns: reportMetadataCols }\"\r\n              ></ng-container>\r\n            </div>\r\n          </div>\r\n\r\n          <button\r\n            type=\"button\"\r\n            class=\"btn btn-danger mt-auto\"\r\n            (click)=\"toggleGroupByField(false, reportHeads.FixedGroup)\"\r\n          >\r\n            Clear\r\n          </button>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</ng-template>\r\n\r\n<ng-template #sumTab>\r\n  <div class=\"card\">\r\n    <div class=\"card-body\">\r\n      <h5 class=\"bg-teal-400 p-1\">Available Sum Fields</h5>\r\n      <ul class=\"list-group\">\r\n        <li\r\n          class=\"list-group-item\"\r\n          *ngFor=\"let detail of reportDetails | filterBy : validSumField\"\r\n        >\r\n          <div class=\"custom-control custom-checkbox primary\">\r\n            <input\r\n              type=\"checkbox\"\r\n              class=\"custom-control-input\"\r\n              id=\"sumFieldCheck{{ detail.RDAutoId }}\"\r\n              [(ngModel)]=\"detail.SumFieldAdd\"\r\n            />\r\n            <label\r\n              class=\"custom-control-label\"\r\n              for=\"sumFieldCheck{{ detail.RDAutoId }}\"\r\n            >\r\n              {{ detail.DisplayName }}\r\n            </label>\r\n          </div>\r\n        </li>\r\n      </ul>\r\n    </div>\r\n    <div class=\"card-body\">\r\n      <div class=\"row\">\r\n        <div class=\"col-lg-4\">\r\n          <div class=\"text-center p-1\">\r\n            <button\r\n              type=\"button\"\r\n              class=\"btn btn-info\"\r\n              (click)=\"toggleSumField('RunningTotal')\"\r\n            >\r\n              Add To Running Total\r\n            </button>\r\n          </div>\r\n          <div class=\"card p-1\">\r\n            <h5 class=\"bg-teal-400 mb-0 p-1\">Advanced Running Total</h5>\r\n            <div class=\"card-body\">\r\n              <select\r\n                class=\"form-control\"\r\n                [(ngModel)]=\"reportPort.RunningTotalPrev\"\r\n              >\r\n                <ng-container\r\n                  *ngFor=\"\r\n                    let detail of reportDetails | filterBy : validRunningTotal\r\n                  \"\r\n                >\r\n                  <option\r\n                    *ngIf=\"reportPort.RunningTotalNext != detail.RDAutoId\"\r\n                  >\r\n                    {{ detail.DisplayName }}\r\n                  </option>\r\n                </ng-container>\r\n              </select>\r\n              <select class=\"form-control my-1\">\r\n                <option>+</option>\r\n                <option>-</option>\r\n              </select>\r\n              <select\r\n                class=\"form-control\"\r\n                [(ngModel)]=\"reportPort.RunningTotalNext\"\r\n              >\r\n                <ng-container\r\n                  *ngFor=\"\r\n                    let detail of reportDetails | filterBy : validRunningTotal\r\n                  \"\r\n                >\r\n                  <option\r\n                    *ngIf=\"reportPort.RunningTotalPrev != detail.RDAutoId\"\r\n                  >\r\n                    {{ detail.DisplayName }}\r\n                  </option>\r\n                </ng-container>\r\n              </select>\r\n            </div>\r\n            <button\r\n              type=\"button\"\r\n              class=\"btn btn-info m-auto my-1\"\r\n              (click)=\"toggleSumField('RunningTotal', false)\"\r\n            >\r\n              Remove\r\n            </button>\r\n          </div>\r\n        </div>\r\n\r\n        <div class=\"col-lg-4\">\r\n          <div class=\"text-center p-1\">\r\n            <button\r\n              type=\"button\"\r\n              class=\"btn btn-info\"\r\n              (click)=\"toggleSumField('GroupTotal')\"\r\n            >\r\n              Add To Group Total\r\n            </button>\r\n          </div>\r\n          <div class=\"card p-1\">\r\n            <h5 class=\"bg-teal-400 mb-0 p-1\">Group Total</h5>\r\n            <div class=\"card-body\">\r\n              <ul class=\"list-group\">\r\n                <li\r\n                  *ngFor=\"\r\n                    let detail of reportDetails | filterBy : validGroupTotal\r\n                  \"\r\n                  class=\"list-group-item\"\r\n                >\r\n                  {{ detail.DisplayName }}\r\n                </li>\r\n              </ul>\r\n            </div>\r\n            <button\r\n              type=\"button\"\r\n              class=\"btn btn-info m-auto my-1\"\r\n              (click)=\"toggleSumField('GroupTotal', false)\"\r\n            >\r\n              Remove\r\n            </button>\r\n          </div>\r\n        </div>\r\n\r\n        <div class=\"col-lg-4\">\r\n          <div class=\"text-center p-1\">\r\n            <button\r\n              type=\"button\"\r\n              class=\"btn btn-info\"\r\n              (click)=\"toggleSumField('GrandTotal')\"\r\n            >\r\n              Add To Grand Total\r\n            </button>\r\n          </div>\r\n          <div class=\"card p-1\">\r\n            <h5 class=\"bg-teal-400 mb-0 p-1\">Grand Total</h5>\r\n            <div class=\"card-body\">\r\n              <ul class=\"list-group\">\r\n                <li\r\n                  *ngFor=\"\r\n                    let detail of reportDetails | filterBy : validGrandTotal\r\n                  \"\r\n                  class=\"list-group-item\"\r\n                >\r\n                  {{ detail.DisplayName }}\r\n                </li>\r\n              </ul>\r\n            </div>\r\n            <button\r\n              type=\"button\"\r\n              class=\"btn btn-info m-auto my-1\"\r\n              (click)=\"toggleSumField('GrandTotal', false)\"\r\n            >\r\n              Remove\r\n            </button>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</ng-template>\r\n\r\n<ng-template #filterTab>\r\n  <div class=\"card\">\r\n    <div class=\"card-body\">\r\n      <div class=\"row\">\r\n        <div class=\"col-lg-5 d-flex\">\r\n          <div class=\"card w-100\">\r\n            <h5 class=\"p-1 bg-teal-400 mb-0 text-center\">\r\n              Available Filter Fields\r\n            </h5>\r\n            <div\r\n              class=\"card-body p-0\"\r\n              style=\"height: 120px; overflow-y: scroll\"\r\n            >\r\n              <ul class=\"list-group\">\r\n                <li\r\n                  *ngFor=\"\r\n                    let detail of reportDetails | filterBy : validFilterField\r\n                  \"\r\n                  class=\"list-group-item\"\r\n                  [class.active]=\"detail.RDAutoId == reportPort.FilterField\"\r\n                  (click)=\"toggleFilterField(detail)\"\r\n                >\r\n                  {{ detail.DisplayName }}\r\n                </li>\r\n              </ul>\r\n            </div>\r\n          </div>\r\n        </div>\r\n        <div class=\"col-lg-7 d-flex\">\r\n          <div class=\"card w-100\">\r\n            <h5 class=\"p-1 bg-teal-400 mb-1 w-100\">Select Filter Option</h5>\r\n            <div class=\"card-body\">\r\n              <div class=\"ml-2\">\r\n                <div class=\"input-group w-50 pb-2\">\r\n                  <span class=\"input-group-prepend\">\r\n                    <span class=\"input-group-text\">\r\n                      <i class=\"fa fa-user\" aria-hidden=\"true\"></i>\r\n                    </span>\r\n                  </span>\r\n                  <select\r\n                    class=\"form-control\"\r\n                    [(ngModel)]=\"reportPort.FilterOperator\"\r\n                  >\r\n                    <option\r\n                      *ngFor=\"let operator of reportPort.ddFilterOperator\"\r\n                    >\r\n                      {{ operator.label }}\r\n                    </option>\r\n                  </select>\r\n                </div>\r\n                <div class=\"input-group w-50 pb-2\">\r\n                  <span class=\"input-group-prepend\">\r\n                    <span class=\"input-group-text\">\r\n                      <i class=\"fa fa-user\" aria-hidden=\"true\"></i>\r\n                    </span>\r\n                  </span>\r\n                  <p-autoComplete\r\n                    [inputStyleClass]=\"'form-control'\"\r\n                    [styleClass]=\"'p-0'\"\r\n                    [suggestions]=\"reportPort.ddFilterList\"\r\n                    [minLength]=\"1\"\r\n                    [dropdown]=\"false\"\r\n                    [(ngModel)]=\"reportPort.FilterCondition\"\r\n                    (completeMethod)=\"onSearchFilterList($event.query)\"\r\n                    (onDropdownClick)=\"\r\n                      reportPort.ddFilterList = reportPort.ddFilterListAll\r\n                    \"\r\n                  >\r\n                  </p-autoComplete>\r\n                </div>\r\n                <div class=\"float-right pr-3 pb-2\">\r\n                  <button\r\n                    type=\"submit\"\r\n                    class=\"btn btn-md btn-success\"\r\n                    (click)=\"addToFilterField()\"\r\n                  >\r\n                    Add\r\n                  </button>\r\n                </div>\r\n              </div>\r\n            </div>\r\n          </div>\r\n        </div>\r\n      </div>\r\n      <div class=\"row\">\r\n        <div class=\"col-lg-12\">\r\n          <div class=\"table-responsive\">\r\n            <div class=\"table-wrapper-scroll-y my-custom-scrollbar\">\r\n              <table class=\"table table-bordered table-striped mb-1\">\r\n                <thead class=\"table-head-bg\">\r\n                  <tr>\r\n                    <th style=\"width: 10%\"></th>\r\n                    <th style=\"width: 25%\">Field Name</th>\r\n                    <th style=\"width: 25%\">Operator</th>\r\n                    <th style=\"width: 40%\">Condition</th>\r\n                  </tr>\r\n                </thead>\r\n                <tbody>\r\n                  <tr *ngFor=\"let filter of reportPort.FilterFieldList\">\r\n                    <td\r\n                      (click)=\"filter.FilterRemove = !filter.FilterRemove\"\r\n                      class=\"text-center\"\r\n                    >\r\n                      <span\r\n                        *ngIf=\"filter.FilterRemove\"\r\n                        class=\"fa fa-check text-success\"\r\n                      ></span>\r\n                    </td>\r\n                    <td>{{ filter.DisplayName }}</td>\r\n                    <td>{{ filter.FilterOperator }}</td>\r\n                    <td>{{ filter.FilterCondition }}</td>\r\n                  </tr>\r\n                </tbody>\r\n              </table>\r\n            </div>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</ng-template>\r\n\r\n<ng-template #styleTab>\r\n  <div class=\"card\">\r\n    <div class=\"card-body\">\r\n      <h5 class=\"p-1 bg-teal-400\">Available Styles</h5>\r\n      <div class=\"form-group row\">\r\n        <div class=\"col-lg-3\">Odd Rows Color</div>\r\n        <div class=\"col-lg-3\">\r\n          <div class=\"input-group\">\r\n            <span class=\"input-group-prepend\">\r\n              <span class=\"input-group-text\">\r\n                <i class=\"fa fa-user\" aria-hidden=\"true\"></i>\r\n              </span>\r\n            </span>\r\n            <input\r\n              class=\"form-control\"\r\n              [cpOutputFormat]=\"'hex'\"\r\n              [(colorPicker)]=\"reportHeads.Record1Color\"\r\n              style.background=\"#{{ fillColor.odd }}\"\r\n              [value]=\"reportHeads.Record1Color\"\r\n              readonly\r\n            />\r\n          </div>\r\n        </div>\r\n\r\n        <div class=\"col-lg-3\">Even Rows Color</div>\r\n        <div class=\"col-lg-3\">\r\n          <div class=\"input-group\">\r\n            <span class=\"input-group-prepend\">\r\n              <span class=\"input-group-text\">\r\n                <i class=\"fa fa-user\" aria-hidden=\"true\"></i>\r\n              </span>\r\n            </span>\r\n            <input\r\n              class=\"form-control\"\r\n              [cpOutputFormat]=\"'hex'\"\r\n              [(colorPicker)]=\"reportHeads.Record2Color\"\r\n              style.background=\"#{{ fillColor.even }}\"\r\n              [value]=\"reportHeads.Record2Color\"\r\n              readonly\r\n            />\r\n          </div>\r\n        </div>\r\n      </div>\r\n\r\n      <div class=\"form-group row\">\r\n        <div class=\"col-lg-3\">Group Total</div>\r\n        <div class=\"col-lg-3\">\r\n          <div class=\"input-group\">\r\n            <span class=\"input-group-prepend\">\r\n              <span class=\"input-group-text\">\r\n                <i class=\"fa fa-user\" aria-hidden=\"true\"></i>\r\n              </span>\r\n            </span>\r\n            <input\r\n              class=\"form-control\"\r\n              [cpOutputFormat]=\"'hex'\"\r\n              [(colorPicker)]=\"reportHeads.GroupTotalColor\"\r\n              style.background=\"#{{ fillColor.groupTotal }}\"\r\n              [value]=\"reportHeads.GroupTotalColor\"\r\n              readonly\r\n            />\r\n          </div>\r\n        </div>\r\n\r\n        <div class=\"col-lg-3\">Grand Total</div>\r\n        <div class=\"col-lg-3\">\r\n          <div class=\"input-group\">\r\n            <span class=\"input-group-prepend\">\r\n              <span class=\"input-group-text\">\r\n                <i class=\"fa fa-user\" aria-hidden=\"true\"></i>\r\n              </span>\r\n            </span>\r\n            <input\r\n              class=\"form-control\"\r\n              [cpOutputFormat]=\"'hex'\"\r\n              [(colorPicker)]=\"reportHeads.GrandTotalColor\"\r\n              style.background=\"#{{ fillColor.grandTotal }}\"\r\n              [value]=\"reportHeads.GrandTotalColor\"\r\n              readonly\r\n            />\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    <h5 class=\"p-1 bg-teal-400 mb-1\">Preview</h5>\r\n    <div class=\"card-body\">\r\n      <h2 class=\"text-center mb-0\">Smatrix Application</h2>\r\n      <h5 class=\"text-center mb-2\">\r\n        <u>{{ reportHeads.ReportName }}</u>\r\n      </h5>\r\n      <div class=\"p-1\">\r\n        <div class=\"table-wrapper-scroll-x my-custom-scrollbar\">\r\n          <app-report-preview\r\n            [columns]=\"sampleReport.columns\"\r\n            [reportData]=\"sampleReport.reports\"\r\n            [reportMetaDataColumns]=\"sampleReport.metaColumns\"\r\n            [reportMetaData]=\"sampleReport.metaData\"\r\n            [fillColor]=\"fillColor\"\r\n            [isResponsive]=\"false\"\r\n          ></app-report-preview>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</ng-template>\r\n\r\n<ng-template #pageSetupTab>\r\n  <div class=\"card w-100\">\r\n    <div class=\"row\">\r\n      <div class=\"col-lg-1\"></div>\r\n      <div class=\"col-lg-10\">\r\n        <div class=\"row mt-2\">\r\n          <div class=\"card w-100\">\r\n            <h5 class=\"p-1 bg-teal-400 mb-0 w-100\">Page Settings</h5>\r\n            <div class=\"row m-1\">\r\n              <div class=\"col-lg-3 d-flex pb-1\">Page Size</div>\r\n              <div class=\"col-lg-9 d-flex pb-1\">\r\n                <input\r\n                  type=\"text\"\r\n                  class=\"form-control\"\r\n                  [(ngModel)]=\"reportHeads.PaperSize\"\r\n                  readonly\r\n                />\r\n              </div>\r\n              <div class=\"col-lg-3 d-flex pb-1\">Orientation</div>\r\n              <div class=\"col-lg-9 form-group d-flex pb-1\">\r\n                <div class=\"custom-control custom-radio custom-control-inline\">\r\n                  <input\r\n                    type=\"radio\"\r\n                    class=\"custom-control-input\"\r\n                    name=\"orientation\"\r\n                    id=\"PotraitCheck1\"\r\n                    [value]=\"true\"\r\n                    [(ngModel)]=\"reportHeads.Portrait\"\r\n                  />\r\n                  <label class=\"custom-control-label\" for=\"PotraitCheck1\"\r\n                    >Potrait</label\r\n                  >\r\n                </div>\r\n                <div class=\"custom-control custom-radio custom-control-inline\">\r\n                  <input\r\n                    type=\"radio\"\r\n                    class=\"custom-control-input\"\r\n                    name=\"orientation\"\r\n                    id=\"PotraitCheck2\"\r\n                    [value]=\"false\"\r\n                    [(ngModel)]=\"reportHeads.Portrait\"\r\n                  />\r\n                  <label class=\"custom-control-label\" for=\"PotraitCheck2\"\r\n                    >Landscape</label\r\n                  >\r\n                </div>\r\n              </div>\r\n            </div>\r\n          </div>\r\n        </div>\r\n\r\n        <div class=\"row mt-2\">\r\n          <div class=\"card w-100\">\r\n            <h5 class=\"p-1 bg-teal-400 mb-0 w-100\">Header & Footer</h5>\r\n            <div class=\"row m-1\">\r\n              <div class=\"col-lg-3 d-flex pb-1\">Header</div>\r\n              <div class=\"col-lg-9 d-flex pb-1\">\r\n                <input\r\n                  type=\"text\"\r\n                  class=\"form-control\"\r\n                  [(ngModel)]=\"reportHeads.Header\"\r\n                />\r\n              </div>\r\n              <div class=\"col-lg-3 d-flex pb-1\">Footer</div>\r\n              <div class=\"col-lg-9 d-flex pb-1\">\r\n                <input\r\n                  type=\"text\"\r\n                  class=\"form-control\"\r\n                  [(ngModel)]=\"reportHeads.Footer\"\r\n                />\r\n              </div>\r\n            </div>\r\n          </div>\r\n        </div>\r\n\r\n        <div class=\"row mt-2\">\r\n          <div class=\"card w-100\">\r\n            <h5 class=\"p-1 bg-teal-400 mb-0 w-100\">Margins</h5>\r\n            <div class=\"row m-1\">\r\n              <div class=\"col-lg-3 d-flex pb-1\">Left :</div>\r\n              <div class=\"col-lg-3 d-flex pb-1\">\r\n                <input\r\n                  type=\"text\"\r\n                  class=\"form-control\"\r\n                  [(ngModel)]=\"reportHeads.LeftMargin\"\r\n                />\r\n              </div>\r\n              <div class=\"col-lg-3 d-flex pb-1\">Right :</div>\r\n              <div class=\"col-lg-3 d-flex pb-1\">\r\n                <input\r\n                  type=\"text\"\r\n                  class=\"form-control\"\r\n                  [(ngModel)]=\"reportHeads.RightMargin\"\r\n                />\r\n              </div>\r\n              <div class=\"col-lg-3 d-flex pb-1\">Top :</div>\r\n              <div class=\"col-lg-3 d-flex pb-1\">\r\n                <input\r\n                  type=\"text\"\r\n                  class=\"form-control\"\r\n                  [(ngModel)]=\"reportHeads.TopMargin\"\r\n                />\r\n              </div>\r\n              <div class=\"col-lg-3 d-flex pb-1\">Bottom :</div>\r\n              <div class=\"col-lg-3 d-flex pb-1\">\r\n                <input\r\n                  type=\"text\"\r\n                  class=\"form-control\"\r\n                  [(ngModel)]=\"reportHeads.BottomMargin\"\r\n                />\r\n              </div>\r\n            </div>\r\n          </div>\r\n        </div>\r\n      </div>\r\n      <div class=\"col-lg-1\"></div>\r\n    </div>\r\n  </div>\r\n</ng-template>\r\n", styles: ["::ng-deep .form-control.p-dropdown .p-inputtext{padding:0}.accordion{height:calc(100vh - 150px);overflow:hidden scroll;border:1px solid #ddd}.accordion-button{--bs-accordion-btn-padding-x: 1rem;--bs-accordion-btn-padding-y: .5rem}.report-details{height:calc(100vh - 75px);overflow:hidden scroll}\n"], dependencies: [{ kind: "directive", type: i2.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i2.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "directive", type: i3.NgSelectOption, selector: "option", inputs: ["ngValue", "value"] }, { kind: "directive", type: i3.ɵNgSelectMultipleOption, selector: "option", inputs: ["ngValue", "value"] }, { kind: "directive", type: i3.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i3.NumberValueAccessor, selector: "input[type=number][formControlName],input[type=number][formControl],input[type=number][ngModel]" }, { kind: "directive", type: i3.CheckboxControlValueAccessor, selector: "input[type=checkbox][formControlName],input[type=checkbox][formControl],input[type=checkbox][ngModel]" }, { kind: "directive", type: i3.SelectControlValueAccessor, selector: "select:not([multiple])[formControlName],select:not([multiple])[formControl],select:not([multiple])[ngModel]", inputs: ["compareWith"] }, { kind: "directive", type: i3.RadioControlValueAccessor, selector: "input[type=radio][formControlName],input[type=radio][formControl],input[type=radio][ngModel]", inputs: ["name", "formControlName", "value"] }, { kind: "directive", type: i3.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i3.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "component", type: i4.Dropdown, selector: "p-dropdown", inputs: ["scrollHeight", "filter", "name", "style", "panelStyle", "styleClass", "panelStyleClass", "readonly", "required", "editable", "appendTo", "tabindex", "placeholder", "filterPlaceholder", "filterLocale", "inputId", "selectId", "dataKey", "filterBy", "autofocus", "resetFilterOnHide", "dropdownIcon", "optionLabel", "optionValue", "optionDisabled", "optionGroupLabel", "optionGroupChildren", "autoDisplayFirst", "group", "showClear", "emptyFilterMessage", "emptyMessage", "lazy", "virtualScroll", "virtualScrollItemSize", "virtualScrollOptions", "overlayOptions", "ariaFilterLabel", "ariaLabel", "ariaLabelledBy", "filterMatchMode", "maxlength", "tooltip", "tooltipPosition", "tooltipPositionStyle", "tooltipStyleClass", "autofocusFilter", "overlayDirection", "disabled", "itemSize", "autoZIndex", "baseZIndex", "showTransitionOptions", "hideTransitionOptions", "filterValue", "options"], outputs: ["onChange", "onFilter", "onFocus", "onBlur", "onClick", "onShow", "onHide", "onClear", "onLazyLoad"] }, { kind: "directive", type: i5.OwlDateTimeTriggerDirective, selector: "[owlDateTimeTrigger]", inputs: ["owlDateTimeTrigger", "disabled"] }, { kind: "directive", type: i5.OwlDateTimeInputDirective, selector: "input[owlDateTime]", inputs: ["owlDateTime", "owlDateTimeFilter", "_disabled", "min", "max", "selectMode", "rangeSeparator", "value", "values"], outputs: ["dateTimeChange", "dateTimeInput"], exportAs: ["owlDateTimeInput"] }, { kind: "component", type: i5.OwlDateTimeComponent, selector: "owl-date-time", inputs: ["backdropClass", "panelClass", "startAt", "pickerType", "pickerMode", "disabled", "opened", "scrollStrategy"], outputs: ["afterPickerClosed", "afterPickerOpen", "yearSelected", "monthSelected"], exportAs: ["owlDateTime"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportToolComponent, decorators: [{
            type: Component,
            args: [{ selector: "lib-report-tool", template: "<div class=\"contaner-fluid\">\r\n  <div class=\"row row-eq-height\">\r\n    <div class=\"col-md-3 pe-0\" *ngIf=\"showList\">\r\n      <div class=\"card h-100\">\r\n        <div class=\"card-body\">\r\n          <div class=\"input-group\">\r\n            <span class=\"input-group-text\">\r\n              <i class=\"fa fa-search\"></i>\r\n            </span>\r\n            <input\r\n              type=\"text\"\r\n              class=\"form-control\"\r\n              placeholder=\"Search report...\"\r\n              #searchReport\r\n            />\r\n          </div>\r\n          <div class=\"accordion accordion-flush\" id=\"reportList\">\r\n            <ng-container *ngFor=\"let report of reportTreeNode\">\r\n              <div class=\"accordion-item\">\r\n                <h2 class=\"accordion-header\" id=\"report-head-{{ report.data }}\">\r\n                  <button\r\n                    class=\"accordion-button collapsed\"\r\n                    type=\"button\"\r\n                    data-bs-toggle=\"collapse\"\r\n                    attr.data-bs-target=\"#report-body-{{ report.data }}\"\r\n                    aria-expanded=\"false\"\r\n                    attr.aria-controls=\"report-body-{{ report.data }}\"\r\n                  >\r\n                    {{ report.label }}\r\n                  </button>\r\n                </h2>\r\n                <div\r\n                  id=\"report-body-{{ report.data }}\"\r\n                  class=\"accordion-collapse collapse\"\r\n                  aria-labelledby=\"report-head-{{ report.data }}\"\r\n                  data-bs-parent=\"#reportList\"\r\n                >\r\n                  <div class=\"list-group list-group-flush\">\r\n                    <a\r\n                      *ngFor=\"let subReport of report.children\"\r\n                      href=\"javascript:void(0)\"\r\n                      class=\"list-group-item list-group-item-action text-truncate\"\r\n                      [class.active]=\"subReport.data == reportHeads.ReportId\"\r\n                      [title]=\"subReport.label\"\r\n                      (click)=\"onSelectReport.emit(subReport.data)\"\r\n                    >\r\n                      <span class=\"fa fa-file-text mr-2\"></span>\r\n                      {{ subReport.label }}\r\n                    </a>\r\n                  </div>\r\n                </div>\r\n              </div>\r\n            </ng-container>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n\r\n    <div class=\"col-md\">\r\n      <div class=\"card report-details\">\r\n        <h6 class=\"card-header text-bg-secondary\">Report Details</h6>\r\n        <ng-container\r\n          [ngTemplateOutlet]=\"commonFieldsTab\"\r\n          [ngTemplateOutletContext]=\"{ readonly: true }\"\r\n        ></ng-container>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n<div class=\"bg-secondary avbar navbar-expand-lg navbar-light sticky-bottom\">\r\n  <div class=\"text-center d-lg-none w-100\">\r\n    <button\r\n      type=\"button\"\r\n      class=\"navbar-toggler dropdown-toggle\"\r\n      data-bs-toggle=\"collapse\"\r\n      data-bs-target=\"#navbar-footer\"\r\n    >\r\n      <i class=\"fa fa-cogs\"></i>\r\n      &nbsp;Controls\r\n    </button>\r\n  </div>\r\n\r\n  <div class=\"navbar-collapse collapse\" id=\"navbar-footer\">\r\n    <div class=\"w-100 p-2\">\r\n      <div class=\"d-flex justify-content-evenly\">\r\n        <button type=\"button\" class=\"btn btn-primary\">\r\n          <span class=\"fa fa-history\"></span>&nbsp;Memories\r\n        </button>\r\n        <button\r\n          type=\"button\"\r\n          class=\"btn btn-secondary\"\r\n          data-bs-toggle=\"modal\"\r\n          data-bs-target=\"#modifiedReportPort\"\r\n        >\r\n          <span class=\"fa fa-history\"></span>&nbsp;Modified\r\n        </button>\r\n        <button type=\"button\" class=\"btn btn-success\">\r\n          <span class=\"fa fa-history\"></span>&nbsp;Report\r\n        </button>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n<div\r\n  class=\"modal\"\r\n  id=\"modifiedReportPort\"\r\n  tabindex=\"-1\"\r\n  role=\"dialog\"\r\n  aria-labelledby=\"modifiedReportPortTitle\"\r\n  aria-hidden=\"true\"\r\n  data-backdrop=\"static\"\r\n>\r\n  <div class=\"modal-dialog modal-lg m-auto\" role=\"document\">\r\n    <div class=\"modal-content\">\r\n      <div class=\"modal-header p-1\">\r\n        <h5 class=\"modal-title\">Report Setup - {{ reportHeads.ReportName }}</h5>\r\n        <button\r\n          type=\"button\"\r\n          class=\"close\"\r\n          data-dismiss=\"modal\"\r\n          aria-label=\"Close\"\r\n        >\r\n          <span aria-hidden=\"true\">&times;</span>\r\n        </button>\r\n      </div>\r\n      <div class=\"modal-body p-0\">\r\n        <ul\r\n          class=\"nav nav-tabs nav-tabs-solid bg-teal-400 border-0 nav-justified\"\r\n        >\r\n          <li class=\"nav-item flex-basis border-right\">\r\n            <a\r\n              href=\"#fields-tab\"\r\n              class=\"nav-link font-weight-bold active show px-2\"\r\n              data-toggle=\"tab\"\r\n            >\r\n              Fields\r\n            </a>\r\n          </li>\r\n          <li class=\"nav-item flex-basis border-right\">\r\n            <a\r\n              href=\"#grouping-tab\"\r\n              class=\"nav-link font-weight-bold px-2\"\r\n              data-toggle=\"tab\"\r\n            >\r\n              Grouping\r\n            </a>\r\n          </li>\r\n          <li class=\"nav-item flex-basis border-right\">\r\n            <a\r\n              href=\"#sum-tab\"\r\n              class=\"nav-link font-weight-bold px-2\"\r\n              data-toggle=\"tab\"\r\n            >\r\n              Sum\r\n            </a>\r\n          </li>\r\n          <li class=\"nav-item flex-basis border-right\">\r\n            <a\r\n              href=\"#filter-tab\"\r\n              class=\"nav-link font-weight-bold px-2\"\r\n              data-toggle=\"tab\"\r\n            >\r\n              Filter\r\n            </a>\r\n          </li>\r\n          <li class=\"nav-item flex-basis border-right\">\r\n            <a\r\n              href=\"#styles-tab\"\r\n              class=\"nav-link font-weight-bold px-2\"\r\n              data-toggle=\"tab\"\r\n            >\r\n              Styles\r\n            </a>\r\n          </li>\r\n          <li class=\"nav-item flex-basis border-right\">\r\n            <a\r\n              href=\"#page-setup-tab\"\r\n              class=\"nav-link font-weight-bold px-2\"\r\n              data-toggle=\"tab\"\r\n            >\r\n              Page setup\r\n            </a>\r\n          </li>\r\n        </ul>\r\n        <div class=\"detail-tabs tab-content\">\r\n          <div class=\"tab-pane fade active show\" id=\"fields-tab\">\r\n            <ng-container [ngTemplateOutlet]=\"fieldsTab\"></ng-container>\r\n          </div>\r\n\r\n          <div class=\"tab-pane fade\" id=\"grouping-tab\">\r\n            <ng-container [ngTemplateOutlet]=\"groupTab\"></ng-container>\r\n          </div>\r\n\r\n          <div class=\"tab-pane fade\" id=\"sum-tab\">\r\n            <ng-container [ngTemplateOutlet]=\"sumTab\"></ng-container>\r\n          </div>\r\n\r\n          <div class=\"tab-pane fade\" id=\"filter-tab\">\r\n            <ng-container [ngTemplateOutlet]=\"filterTab\"></ng-container>\r\n          </div>\r\n\r\n          <div class=\"tab-pane fade\" id=\"styles-tab\">\r\n            <ng-container [ngTemplateOutlet]=\"styleTab\"></ng-container>\r\n          </div>\r\n\r\n          <div class=\"tab-pane fade\" id=\"page-setup-tab\">\r\n            <ng-container [ngTemplateOutlet]=\"pageSetupTab\"></ng-container>\r\n          </div>\r\n        </div>\r\n      </div>\r\n      <div class=\"modal-footer p-1\">\r\n        <button class=\"btn btn-success\" (click)=\"doSave()\">\r\n          {{ reportHeads.IsStdReport ? \"Save As\" : \"Save\" }}\r\n        </button>\r\n        <button class=\"btn btn-success\" (click)=\"getReport()\">Report</button>\r\n        <button class=\"btn btn-secondary\" data-dismiss=\"modal\">Close</button>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n<ng-template #commonFieldsTab let-readonly=\"readonly\">\r\n  <div class=\"card-body\">\r\n    <div class=\"row form-group\">\r\n      <div class=\"col-lg-4\">\r\n        <label>Report Title</label>\r\n        <input\r\n          type=\"text\"\r\n          class=\"form-control\"\r\n          [(ngModel)]=\"reportHeads.ReportName\"\r\n          [readonly]=\"readonly\"\r\n        />\r\n      </div>\r\n      <div class=\"col-lg-8\">\r\n        <label>Report Description</label>\r\n        <input\r\n          type=\"text\"\r\n          class=\"form-control\"\r\n          [(ngModel)]=\"reportHeads.ReportDescription\"\r\n          [readonly]=\"readonly\"\r\n        />\r\n      </div>\r\n    </div>\r\n  </div>\r\n\r\n  <h6\r\n    class=\"card-header text-bg-secondary\"\r\n    *ngIf=\"reportHeads.NoOfDateFields || true\"\r\n  >\r\n    Report Date Range\r\n  </h6>\r\n  <div class=\"card-body\" *ngIf=\"reportHeads.NoOfDateFields || true\">\r\n    <div class=\"row form-group\">\r\n      <div class=\"col-md-4\">\r\n        <label>Date Range</label>\r\n        <p-dropdown\r\n          [styleClass]=\"'form-control'\"\r\n          [placeholder]=\"'Select date range'\"\r\n          [options]=\"pdDateRange\"\r\n          [(ngModel)]=\"reportHeads.DateDefault\"\r\n          [appendTo]=\"'body'\"\r\n          [filter]=\"pdDateRange.length > 5\"\r\n          [resetFilterOnHide]=\"true\"\r\n          (onChange)=\"onChangeDateRange()\"\r\n          [baseZIndex]=\"1040\"\r\n          itemSize=\"1\"\r\n          appendTo=\"body\"\r\n        >\r\n        </p-dropdown>\r\n      </div>\r\n      <div class=\"col-md-4\" *ngIf=\"reportHeads.NoOfDateFields >= 1 || true\">\r\n        <label>From Date</label>\r\n        <input\r\n          class=\"form-control\"\r\n          [owlDateTime]=\"fromDt\"\r\n          [owlDateTimeTrigger]=\"fromDt\"\r\n          [placeholder]=\"phDateFormat\"\r\n          [(ngModel)]=\"reportPort.FromDate\"\r\n        />\r\n        <owl-date-time #fromDt [pickerType]=\"'calendar'\"></owl-date-time>\r\n      </div>\r\n      <div class=\"col-md-4\" *ngIf=\"reportHeads.NoOfDateFields >= 2 || true\">\r\n        <label>To Date</label>\r\n        <input\r\n          class=\"form-control\"\r\n          [owlDateTime]=\"toDt\"\r\n          [owlDateTimeTrigger]=\"toDt\"\r\n          [placeholder]=\"phDateFormat\"\r\n          [(ngModel)]=\"reportPort.ToDate\"\r\n        />\r\n        <owl-date-time #toDt [pickerType]=\"'calendar'\"></owl-date-time>\r\n      </div>\r\n    </div>\r\n  </div>\r\n\r\n  <h6 class=\"card-header text-bg-secondary\">\r\n    Select {{ reportHeads.WarningMessage || \"Account\" }}\r\n  </h6>\r\n  <div class=\"card-body\">\r\n    <div class=\"row form-group\">\r\n      <div class=\"col-md-4\">\r\n        <label>{{ reportHeads.WarningMessage || \"Account Name\" }}</label>\r\n        <p-dropdown\r\n          [styleClass]=\"'form-control'\"\r\n          [placeholder]=\"\r\n            'Select ' + (reportHeads.WarningMessage || 'Account Name')\r\n          \"\r\n          [options]=\"reportPort.LedgerList\"\r\n          [(ngModel)]=\"reportPort.LedgerValue\"\r\n          [appendTo]=\"'body'\"\r\n          [filter]=\"reportPort.LedgerList.length > 5\"\r\n          [resetFilterOnHide]=\"true\"\r\n          [baseZIndex]=\"1040\"\r\n          appendTo=\"body\"\r\n          itemSize=\"1\"\r\n        >\r\n        </p-dropdown>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</ng-template>\r\n\r\n<ng-template #fieldsTab>\r\n  <div class=\"card mb-0 p-1\">\r\n    <ng-container\r\n      [ngTemplateOutlet]=\"commonFieldsTab\"\r\n      [ngTemplateOutletContext]=\"{ readonly: false }\"\r\n    ></ng-container>\r\n    <h5 class=\"bg-teal-400 mb-0 p-1\">Fields to Display</h5>\r\n    <div class=\"card-body\">\r\n      <div class=\"row\">\r\n        <div class=\"col-lg-6\">\r\n          <div style=\"height: 200px; overflow-y: auto\">\r\n            <table class=\"table table-bordered\">\r\n              <thead class=\"table-head-bg\">\r\n                <tr>\r\n                  <th class=\"p-1 w-25\">Action</th>\r\n                  <th class=\"p-1 w-75\">Display Name</th>\r\n                  <th class=\"p-1 w-25\">Width</th>\r\n                </tr>\r\n              </thead>\r\n              <tbody>\r\n                <tr *ngFor=\"let detail of reportDetails\">\r\n                  <td\r\n                    class=\"text-center pointer py-0\"\r\n                    (click)=\"detail.ViewDisabled = !detail.ViewDisabled\"\r\n                  >\r\n                    <i\r\n                      class=\"fa text-{{\r\n                        detail.ViewDisabled\r\n                          ? 'danger fa-times'\r\n                          : 'success fa-check'\r\n                      }}\"\r\n                    ></i>\r\n                  </td>\r\n                  <td class=\"py-0\">{{ detail.DisplayName }}</td>\r\n                  <td class=\"p-0\">\r\n                    <input\r\n                      type=\"number\"\r\n                      class=\"form-control bg-transparent\"\r\n                      [(ngModel)]=\"detail.Width\"\r\n                    />\r\n                  </td>\r\n                </tr>\r\n              </tbody>\r\n            </table>\r\n          </div>\r\n        </div>\r\n\r\n        <div class=\"col-lg-6\">\r\n          <div class=\"form-group row\">\r\n            <label class=\"col-lg-4\">Sort By</label>\r\n            <div class=\"col-lg-8 input-group\">\r\n              <span class=\"input-group-prepend\">\r\n                <span class=\"input-group-text\"><i class=\"fa fa-user\"></i></span>\r\n              </span>\r\n              <select class=\"form-control\" [(ngModel)]=\"reportPort.OrderByAdd\">\r\n                <ng-container\r\n                  *ngFor=\"\r\n                    let detail of reportDetails | filterBy : validViewDisabled\r\n                  \"\r\n                >\r\n                  <option *ngIf=\"!detail.OrderBy\" [ngValue]=\"detail.RDAutoId\">\r\n                    {{ detail.DisplayName }}\r\n                  </option>\r\n                </ng-container>\r\n              </select>\r\n            </div>\r\n          </div>\r\n          <button\r\n            type=\"button\"\r\n            class=\"btn btn-info ml-3 mb-1\"\r\n            (click)=\"toggleOrderByField('OrderByAdd')\"\r\n          >\r\n            Add\r\n          </button>\r\n          <button\r\n            type=\"button\"\r\n            class=\"btn btn-info ml-3 mb-1\"\r\n            (click)=\"toggleOrderByField()\"\r\n          >\r\n            Remove\r\n          </button>\r\n\r\n          <div style=\"height: 120px; overflow-y: auto\">\r\n            <table class=\"table table-bordered\">\r\n              <thead class=\"table-head-bg position-sticky top\">\r\n                <tr>\r\n                  <th class=\"p-1\">S.No</th>\r\n                  <th class=\"p-1\">Field Name</th>\r\n                  <th class=\"p-1\">Sort By</th>\r\n                </tr>\r\n              </thead>\r\n              <tbody>\r\n                <ng-container\r\n                  *ngFor=\"\r\n                    let detail of reportDetails | filterBy : validOrderBy;\r\n                    let i = index\r\n                  \"\r\n                >\r\n                  <tr (click)=\"reportPort.OrderByRemove = detail.RDAutoId\">\r\n                    <td class=\"p-1\">{{ i + 1 }}</td>\r\n                    <td\r\n                      class=\"p-1\"\r\n                      [class.bg-primary]=\"\r\n                        reportPort.OrderByRemove == detail.RDAutoId\r\n                      \"\r\n                    >\r\n                      {{ detail.DisplayName }}\r\n                    </td>\r\n                    <td class=\"p-1 pointer\" (click)=\"toggleOrderByPref(detail)\">\r\n                      {{ detail.OrderByPref }}\r\n                    </td>\r\n                  </tr>\r\n                </ng-container>\r\n              </tbody>\r\n            </table>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</ng-template>\r\n\r\n<ng-template #groupTab>\r\n  <div class=\"card mb-0 p-1\">\r\n    <h5 class=\"bg-teal-400 mb-0 p-1\">Available Fields for Grouping</h5>\r\n\r\n    <div class=\"card-body\">\r\n      <div class=\"row\">\r\n        <div class=\"col-lg-5\">\r\n          <table class=\"table table-bordered\">\r\n            <thead class=\"table-head-bg position-sticky top\">\r\n              <tr>\r\n                <th class=\"p-1 w-25\"></th>\r\n                <th class=\"p-1 w-75\">Display Name</th>\r\n              </tr>\r\n            </thead>\r\n            <tbody>\r\n              <ng-container\r\n                *ngFor=\"\r\n                  let detail of reportDetails | filterBy : validGroupingEligible\r\n                \"\r\n              >\r\n                <tr *ngIf=\"!detail.GroupBy\">\r\n                  <td\r\n                    class=\"p-1 pointer text-center text-success\"\r\n                    (click)=\"detail.GroupByAdd = !detail.GroupByAdd\"\r\n                  >\r\n                    <span *ngIf=\"detail.GroupByAdd\" class=\"fa fa-check\"></span>\r\n                  </td>\r\n                  <td class=\"p-1\">{{ detail.DisplayName }}</td>\r\n                </tr>\r\n              </ng-container>\r\n            </tbody>\r\n          </table>\r\n        </div>\r\n\r\n        <div\r\n          class=\"col-lg-2 row d-flex justify-content-center text-center align-self-center mx-auto\"\r\n        >\r\n          <button\r\n            class=\"btn btn-primary\"\r\n            (click)=\"toggleGroupByField(true, reportHeads.FixedGroup)\"\r\n          >\r\n            <li class=\"fa fa-fast-forward\" aria-hidden=\"true\"></li>\r\n          </button>\r\n        </div>\r\n\r\n        <div class=\"col-lg-5 text-center\">\r\n          <div class=\"card h-100\">\r\n            <div class=\"card-body\">\r\n              <ng-template #treeView let-data=\"columns\">\r\n                <ul\r\n                  class=\"list-style-none text-left pl-3\"\r\n                  *ngIf=\"data && data.field\"\r\n                >\r\n                  <li class=\"\">\r\n                    <span>\r\n                      <span class=\"badge badge-success\">{{ data.gIndex }}</span>\r\n                      {{ data.label }}\r\n                    </span>\r\n                    <ng-container\r\n                      [ngTemplateOutlet]=\"treeView\"\r\n                      [ngTemplateOutletContext]=\"{ columns: data.columns }\"\r\n                    ></ng-container>\r\n                  </li>\r\n                </ul>\r\n              </ng-template>\r\n              <ng-container\r\n                [ngTemplateOutlet]=\"treeView\"\r\n                [ngTemplateOutletContext]=\"{ columns: reportMetadataCols }\"\r\n              ></ng-container>\r\n            </div>\r\n          </div>\r\n\r\n          <button\r\n            type=\"button\"\r\n            class=\"btn btn-danger mt-auto\"\r\n            (click)=\"toggleGroupByField(false, reportHeads.FixedGroup)\"\r\n          >\r\n            Clear\r\n          </button>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</ng-template>\r\n\r\n<ng-template #sumTab>\r\n  <div class=\"card\">\r\n    <div class=\"card-body\">\r\n      <h5 class=\"bg-teal-400 p-1\">Available Sum Fields</h5>\r\n      <ul class=\"list-group\">\r\n        <li\r\n          class=\"list-group-item\"\r\n          *ngFor=\"let detail of reportDetails | filterBy : validSumField\"\r\n        >\r\n          <div class=\"custom-control custom-checkbox primary\">\r\n            <input\r\n              type=\"checkbox\"\r\n              class=\"custom-control-input\"\r\n              id=\"sumFieldCheck{{ detail.RDAutoId }}\"\r\n              [(ngModel)]=\"detail.SumFieldAdd\"\r\n            />\r\n            <label\r\n              class=\"custom-control-label\"\r\n              for=\"sumFieldCheck{{ detail.RDAutoId }}\"\r\n            >\r\n              {{ detail.DisplayName }}\r\n            </label>\r\n          </div>\r\n        </li>\r\n      </ul>\r\n    </div>\r\n    <div class=\"card-body\">\r\n      <div class=\"row\">\r\n        <div class=\"col-lg-4\">\r\n          <div class=\"text-center p-1\">\r\n            <button\r\n              type=\"button\"\r\n              class=\"btn btn-info\"\r\n              (click)=\"toggleSumField('RunningTotal')\"\r\n            >\r\n              Add To Running Total\r\n            </button>\r\n          </div>\r\n          <div class=\"card p-1\">\r\n            <h5 class=\"bg-teal-400 mb-0 p-1\">Advanced Running Total</h5>\r\n            <div class=\"card-body\">\r\n              <select\r\n                class=\"form-control\"\r\n                [(ngModel)]=\"reportPort.RunningTotalPrev\"\r\n              >\r\n                <ng-container\r\n                  *ngFor=\"\r\n                    let detail of reportDetails | filterBy : validRunningTotal\r\n                  \"\r\n                >\r\n                  <option\r\n                    *ngIf=\"reportPort.RunningTotalNext != detail.RDAutoId\"\r\n                  >\r\n                    {{ detail.DisplayName }}\r\n                  </option>\r\n                </ng-container>\r\n              </select>\r\n              <select class=\"form-control my-1\">\r\n                <option>+</option>\r\n                <option>-</option>\r\n              </select>\r\n              <select\r\n                class=\"form-control\"\r\n                [(ngModel)]=\"reportPort.RunningTotalNext\"\r\n              >\r\n                <ng-container\r\n                  *ngFor=\"\r\n                    let detail of reportDetails | filterBy : validRunningTotal\r\n                  \"\r\n                >\r\n                  <option\r\n                    *ngIf=\"reportPort.RunningTotalPrev != detail.RDAutoId\"\r\n                  >\r\n                    {{ detail.DisplayName }}\r\n                  </option>\r\n                </ng-container>\r\n              </select>\r\n            </div>\r\n            <button\r\n              type=\"button\"\r\n              class=\"btn btn-info m-auto my-1\"\r\n              (click)=\"toggleSumField('RunningTotal', false)\"\r\n            >\r\n              Remove\r\n            </button>\r\n          </div>\r\n        </div>\r\n\r\n        <div class=\"col-lg-4\">\r\n          <div class=\"text-center p-1\">\r\n            <button\r\n              type=\"button\"\r\n              class=\"btn btn-info\"\r\n              (click)=\"toggleSumField('GroupTotal')\"\r\n            >\r\n              Add To Group Total\r\n            </button>\r\n          </div>\r\n          <div class=\"card p-1\">\r\n            <h5 class=\"bg-teal-400 mb-0 p-1\">Group Total</h5>\r\n            <div class=\"card-body\">\r\n              <ul class=\"list-group\">\r\n                <li\r\n                  *ngFor=\"\r\n                    let detail of reportDetails | filterBy : validGroupTotal\r\n                  \"\r\n                  class=\"list-group-item\"\r\n                >\r\n                  {{ detail.DisplayName }}\r\n                </li>\r\n              </ul>\r\n            </div>\r\n            <button\r\n              type=\"button\"\r\n              class=\"btn btn-info m-auto my-1\"\r\n              (click)=\"toggleSumField('GroupTotal', false)\"\r\n            >\r\n              Remove\r\n            </button>\r\n          </div>\r\n        </div>\r\n\r\n        <div class=\"col-lg-4\">\r\n          <div class=\"text-center p-1\">\r\n            <button\r\n              type=\"button\"\r\n              class=\"btn btn-info\"\r\n              (click)=\"toggleSumField('GrandTotal')\"\r\n            >\r\n              Add To Grand Total\r\n            </button>\r\n          </div>\r\n          <div class=\"card p-1\">\r\n            <h5 class=\"bg-teal-400 mb-0 p-1\">Grand Total</h5>\r\n            <div class=\"card-body\">\r\n              <ul class=\"list-group\">\r\n                <li\r\n                  *ngFor=\"\r\n                    let detail of reportDetails | filterBy : validGrandTotal\r\n                  \"\r\n                  class=\"list-group-item\"\r\n                >\r\n                  {{ detail.DisplayName }}\r\n                </li>\r\n              </ul>\r\n            </div>\r\n            <button\r\n              type=\"button\"\r\n              class=\"btn btn-info m-auto my-1\"\r\n              (click)=\"toggleSumField('GrandTotal', false)\"\r\n            >\r\n              Remove\r\n            </button>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</ng-template>\r\n\r\n<ng-template #filterTab>\r\n  <div class=\"card\">\r\n    <div class=\"card-body\">\r\n      <div class=\"row\">\r\n        <div class=\"col-lg-5 d-flex\">\r\n          <div class=\"card w-100\">\r\n            <h5 class=\"p-1 bg-teal-400 mb-0 text-center\">\r\n              Available Filter Fields\r\n            </h5>\r\n            <div\r\n              class=\"card-body p-0\"\r\n              style=\"height: 120px; overflow-y: scroll\"\r\n            >\r\n              <ul class=\"list-group\">\r\n                <li\r\n                  *ngFor=\"\r\n                    let detail of reportDetails | filterBy : validFilterField\r\n                  \"\r\n                  class=\"list-group-item\"\r\n                  [class.active]=\"detail.RDAutoId == reportPort.FilterField\"\r\n                  (click)=\"toggleFilterField(detail)\"\r\n                >\r\n                  {{ detail.DisplayName }}\r\n                </li>\r\n              </ul>\r\n            </div>\r\n          </div>\r\n        </div>\r\n        <div class=\"col-lg-7 d-flex\">\r\n          <div class=\"card w-100\">\r\n            <h5 class=\"p-1 bg-teal-400 mb-1 w-100\">Select Filter Option</h5>\r\n            <div class=\"card-body\">\r\n              <div class=\"ml-2\">\r\n                <div class=\"input-group w-50 pb-2\">\r\n                  <span class=\"input-group-prepend\">\r\n                    <span class=\"input-group-text\">\r\n                      <i class=\"fa fa-user\" aria-hidden=\"true\"></i>\r\n                    </span>\r\n                  </span>\r\n                  <select\r\n                    class=\"form-control\"\r\n                    [(ngModel)]=\"reportPort.FilterOperator\"\r\n                  >\r\n                    <option\r\n                      *ngFor=\"let operator of reportPort.ddFilterOperator\"\r\n                    >\r\n                      {{ operator.label }}\r\n                    </option>\r\n                  </select>\r\n                </div>\r\n                <div class=\"input-group w-50 pb-2\">\r\n                  <span class=\"input-group-prepend\">\r\n                    <span class=\"input-group-text\">\r\n                      <i class=\"fa fa-user\" aria-hidden=\"true\"></i>\r\n                    </span>\r\n                  </span>\r\n                  <p-autoComplete\r\n                    [inputStyleClass]=\"'form-control'\"\r\n                    [styleClass]=\"'p-0'\"\r\n                    [suggestions]=\"reportPort.ddFilterList\"\r\n                    [minLength]=\"1\"\r\n                    [dropdown]=\"false\"\r\n                    [(ngModel)]=\"reportPort.FilterCondition\"\r\n                    (completeMethod)=\"onSearchFilterList($event.query)\"\r\n                    (onDropdownClick)=\"\r\n                      reportPort.ddFilterList = reportPort.ddFilterListAll\r\n                    \"\r\n                  >\r\n                  </p-autoComplete>\r\n                </div>\r\n                <div class=\"float-right pr-3 pb-2\">\r\n                  <button\r\n                    type=\"submit\"\r\n                    class=\"btn btn-md btn-success\"\r\n                    (click)=\"addToFilterField()\"\r\n                  >\r\n                    Add\r\n                  </button>\r\n                </div>\r\n              </div>\r\n            </div>\r\n          </div>\r\n        </div>\r\n      </div>\r\n      <div class=\"row\">\r\n        <div class=\"col-lg-12\">\r\n          <div class=\"table-responsive\">\r\n            <div class=\"table-wrapper-scroll-y my-custom-scrollbar\">\r\n              <table class=\"table table-bordered table-striped mb-1\">\r\n                <thead class=\"table-head-bg\">\r\n                  <tr>\r\n                    <th style=\"width: 10%\"></th>\r\n                    <th style=\"width: 25%\">Field Name</th>\r\n                    <th style=\"width: 25%\">Operator</th>\r\n                    <th style=\"width: 40%\">Condition</th>\r\n                  </tr>\r\n                </thead>\r\n                <tbody>\r\n                  <tr *ngFor=\"let filter of reportPort.FilterFieldList\">\r\n                    <td\r\n                      (click)=\"filter.FilterRemove = !filter.FilterRemove\"\r\n                      class=\"text-center\"\r\n                    >\r\n                      <span\r\n                        *ngIf=\"filter.FilterRemove\"\r\n                        class=\"fa fa-check text-success\"\r\n                      ></span>\r\n                    </td>\r\n                    <td>{{ filter.DisplayName }}</td>\r\n                    <td>{{ filter.FilterOperator }}</td>\r\n                    <td>{{ filter.FilterCondition }}</td>\r\n                  </tr>\r\n                </tbody>\r\n              </table>\r\n            </div>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</ng-template>\r\n\r\n<ng-template #styleTab>\r\n  <div class=\"card\">\r\n    <div class=\"card-body\">\r\n      <h5 class=\"p-1 bg-teal-400\">Available Styles</h5>\r\n      <div class=\"form-group row\">\r\n        <div class=\"col-lg-3\">Odd Rows Color</div>\r\n        <div class=\"col-lg-3\">\r\n          <div class=\"input-group\">\r\n            <span class=\"input-group-prepend\">\r\n              <span class=\"input-group-text\">\r\n                <i class=\"fa fa-user\" aria-hidden=\"true\"></i>\r\n              </span>\r\n            </span>\r\n            <input\r\n              class=\"form-control\"\r\n              [cpOutputFormat]=\"'hex'\"\r\n              [(colorPicker)]=\"reportHeads.Record1Color\"\r\n              style.background=\"#{{ fillColor.odd }}\"\r\n              [value]=\"reportHeads.Record1Color\"\r\n              readonly\r\n            />\r\n          </div>\r\n        </div>\r\n\r\n        <div class=\"col-lg-3\">Even Rows Color</div>\r\n        <div class=\"col-lg-3\">\r\n          <div class=\"input-group\">\r\n            <span class=\"input-group-prepend\">\r\n              <span class=\"input-group-text\">\r\n                <i class=\"fa fa-user\" aria-hidden=\"true\"></i>\r\n              </span>\r\n            </span>\r\n            <input\r\n              class=\"form-control\"\r\n              [cpOutputFormat]=\"'hex'\"\r\n              [(colorPicker)]=\"reportHeads.Record2Color\"\r\n              style.background=\"#{{ fillColor.even }}\"\r\n              [value]=\"reportHeads.Record2Color\"\r\n              readonly\r\n            />\r\n          </div>\r\n        </div>\r\n      </div>\r\n\r\n      <div class=\"form-group row\">\r\n        <div class=\"col-lg-3\">Group Total</div>\r\n        <div class=\"col-lg-3\">\r\n          <div class=\"input-group\">\r\n            <span class=\"input-group-prepend\">\r\n              <span class=\"input-group-text\">\r\n                <i class=\"fa fa-user\" aria-hidden=\"true\"></i>\r\n              </span>\r\n            </span>\r\n            <input\r\n              class=\"form-control\"\r\n              [cpOutputFormat]=\"'hex'\"\r\n              [(colorPicker)]=\"reportHeads.GroupTotalColor\"\r\n              style.background=\"#{{ fillColor.groupTotal }}\"\r\n              [value]=\"reportHeads.GroupTotalColor\"\r\n              readonly\r\n            />\r\n          </div>\r\n        </div>\r\n\r\n        <div class=\"col-lg-3\">Grand Total</div>\r\n        <div class=\"col-lg-3\">\r\n          <div class=\"input-group\">\r\n            <span class=\"input-group-prepend\">\r\n              <span class=\"input-group-text\">\r\n                <i class=\"fa fa-user\" aria-hidden=\"true\"></i>\r\n              </span>\r\n            </span>\r\n            <input\r\n              class=\"form-control\"\r\n              [cpOutputFormat]=\"'hex'\"\r\n              [(colorPicker)]=\"reportHeads.GrandTotalColor\"\r\n              style.background=\"#{{ fillColor.grandTotal }}\"\r\n              [value]=\"reportHeads.GrandTotalColor\"\r\n              readonly\r\n            />\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    <h5 class=\"p-1 bg-teal-400 mb-1\">Preview</h5>\r\n    <div class=\"card-body\">\r\n      <h2 class=\"text-center mb-0\">Smatrix Application</h2>\r\n      <h5 class=\"text-center mb-2\">\r\n        <u>{{ reportHeads.ReportName }}</u>\r\n      </h5>\r\n      <div class=\"p-1\">\r\n        <div class=\"table-wrapper-scroll-x my-custom-scrollbar\">\r\n          <app-report-preview\r\n            [columns]=\"sampleReport.columns\"\r\n            [reportData]=\"sampleReport.reports\"\r\n            [reportMetaDataColumns]=\"sampleReport.metaColumns\"\r\n            [reportMetaData]=\"sampleReport.metaData\"\r\n            [fillColor]=\"fillColor\"\r\n            [isResponsive]=\"false\"\r\n          ></app-report-preview>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</ng-template>\r\n\r\n<ng-template #pageSetupTab>\r\n  <div class=\"card w-100\">\r\n    <div class=\"row\">\r\n      <div class=\"col-lg-1\"></div>\r\n      <div class=\"col-lg-10\">\r\n        <div class=\"row mt-2\">\r\n          <div class=\"card w-100\">\r\n            <h5 class=\"p-1 bg-teal-400 mb-0 w-100\">Page Settings</h5>\r\n            <div class=\"row m-1\">\r\n              <div class=\"col-lg-3 d-flex pb-1\">Page Size</div>\r\n              <div class=\"col-lg-9 d-flex pb-1\">\r\n                <input\r\n                  type=\"text\"\r\n                  class=\"form-control\"\r\n                  [(ngModel)]=\"reportHeads.PaperSize\"\r\n                  readonly\r\n                />\r\n              </div>\r\n              <div class=\"col-lg-3 d-flex pb-1\">Orientation</div>\r\n              <div class=\"col-lg-9 form-group d-flex pb-1\">\r\n                <div class=\"custom-control custom-radio custom-control-inline\">\r\n                  <input\r\n                    type=\"radio\"\r\n                    class=\"custom-control-input\"\r\n                    name=\"orientation\"\r\n                    id=\"PotraitCheck1\"\r\n                    [value]=\"true\"\r\n                    [(ngModel)]=\"reportHeads.Portrait\"\r\n                  />\r\n                  <label class=\"custom-control-label\" for=\"PotraitCheck1\"\r\n                    >Potrait</label\r\n                  >\r\n                </div>\r\n                <div class=\"custom-control custom-radio custom-control-inline\">\r\n                  <input\r\n                    type=\"radio\"\r\n                    class=\"custom-control-input\"\r\n                    name=\"orientation\"\r\n                    id=\"PotraitCheck2\"\r\n                    [value]=\"false\"\r\n                    [(ngModel)]=\"reportHeads.Portrait\"\r\n                  />\r\n                  <label class=\"custom-control-label\" for=\"PotraitCheck2\"\r\n                    >Landscape</label\r\n                  >\r\n                </div>\r\n              </div>\r\n            </div>\r\n          </div>\r\n        </div>\r\n\r\n        <div class=\"row mt-2\">\r\n          <div class=\"card w-100\">\r\n            <h5 class=\"p-1 bg-teal-400 mb-0 w-100\">Header & Footer</h5>\r\n            <div class=\"row m-1\">\r\n              <div class=\"col-lg-3 d-flex pb-1\">Header</div>\r\n              <div class=\"col-lg-9 d-flex pb-1\">\r\n                <input\r\n                  type=\"text\"\r\n                  class=\"form-control\"\r\n                  [(ngModel)]=\"reportHeads.Header\"\r\n                />\r\n              </div>\r\n              <div class=\"col-lg-3 d-flex pb-1\">Footer</div>\r\n              <div class=\"col-lg-9 d-flex pb-1\">\r\n                <input\r\n                  type=\"text\"\r\n                  class=\"form-control\"\r\n                  [(ngModel)]=\"reportHeads.Footer\"\r\n                />\r\n              </div>\r\n            </div>\r\n          </div>\r\n        </div>\r\n\r\n        <div class=\"row mt-2\">\r\n          <div class=\"card w-100\">\r\n            <h5 class=\"p-1 bg-teal-400 mb-0 w-100\">Margins</h5>\r\n            <div class=\"row m-1\">\r\n              <div class=\"col-lg-3 d-flex pb-1\">Left :</div>\r\n              <div class=\"col-lg-3 d-flex pb-1\">\r\n                <input\r\n                  type=\"text\"\r\n                  class=\"form-control\"\r\n                  [(ngModel)]=\"reportHeads.LeftMargin\"\r\n                />\r\n              </div>\r\n              <div class=\"col-lg-3 d-flex pb-1\">Right :</div>\r\n              <div class=\"col-lg-3 d-flex pb-1\">\r\n                <input\r\n                  type=\"text\"\r\n                  class=\"form-control\"\r\n                  [(ngModel)]=\"reportHeads.RightMargin\"\r\n                />\r\n              </div>\r\n              <div class=\"col-lg-3 d-flex pb-1\">Top :</div>\r\n              <div class=\"col-lg-3 d-flex pb-1\">\r\n                <input\r\n                  type=\"text\"\r\n                  class=\"form-control\"\r\n                  [(ngModel)]=\"reportHeads.TopMargin\"\r\n                />\r\n              </div>\r\n              <div class=\"col-lg-3 d-flex pb-1\">Bottom :</div>\r\n              <div class=\"col-lg-3 d-flex pb-1\">\r\n                <input\r\n                  type=\"text\"\r\n                  class=\"form-control\"\r\n                  [(ngModel)]=\"reportHeads.BottomMargin\"\r\n                />\r\n              </div>\r\n            </div>\r\n          </div>\r\n        </div>\r\n      </div>\r\n      <div class=\"col-lg-1\"></div>\r\n    </div>\r\n  </div>\r\n</ng-template>\r\n", styles: ["::ng-deep .form-control.p-dropdown .p-inputtext{padding:0}.accordion{height:calc(100vh - 150px);overflow:hidden scroll;border:1px solid #ddd}.accordion-button{--bs-accordion-btn-padding-x: 1rem;--bs-accordion-btn-padding-y: .5rem}.report-details{height:calc(100vh - 75px);overflow:hidden scroll}\n"] }]
        }], ctorParameters: function () { return [{ type: i1.ToastrService }]; }, propDecorators: { showList: [{
                type: Input
            }], obsReportList: [{
                type: Input
            }], obsReportHeads: [{
                type: Input
            }], obsReportDetails: [{
                type: Input
            }], onSelectReport: [{
                type: Output
            }], onLedgerQuery: [{
                type: Output
            }], onReportEvent: [{
                type: Output
            }], onSaveReport: [{
                type: Output
            }], reportMetadataCols: [{
                type: Input
            }], pdStyleSheets: [{
                type: Input
            }], numberFormat: [{
                type: Input
            }] } });

class ReportToolModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportToolModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.2.1", ngImport: i0, type: ReportToolModule, declarations: [ReportToolComponent], imports: [CommonModule,
            FormsModule,
            DropdownModule,
            OwlDateTimeModule,
            OwlNativeDateTimeModule], exports: [ReportToolComponent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportToolModule, imports: [CommonModule,
            FormsModule,
            DropdownModule,
            OwlDateTimeModule,
            OwlNativeDateTimeModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportToolModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [ReportToolComponent],
                    imports: [
                        CommonModule,
                        FormsModule,
                        DropdownModule,
                        OwlDateTimeModule,
                        OwlNativeDateTimeModule
                    ],
                    exports: [ReportToolComponent],
                }]
        }] });

/*
 * Public API Surface of report-tool
 */

/**
 * Generated bundle index. Do not edit.
 */

export { ReportToolComponent, ReportToolModule, ReportToolService };
//# sourceMappingURL=report-tool-tools-report.mjs.map
