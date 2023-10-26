import { Component, Input } from "@angular/core";
import { fillColor } from "report-tool/core";
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
// const classNames = ["table-row", "row-group", "row-childgroup"];
export class ReportPreviewComponent {
    constructor() {
        this.reportMetaData = {};
        this.devidHeight = 0;
        this.columns = [];
        this.reportData = [];
        this.emptyMessage = "";
        this.fillColor = fillColor;
        this.isResponsive = true;
        this.setDevidHeight();
    }
    getColumnWidth(width) {
        return typeof width === "string" ? width : `${width}px`;
    }
    getMetaDataRow(rowData, index, metaColumns) {
        return {
            rowData,
            index,
            metaColumns,
        };
    }
    showMetaDataRow(rowData, index, metaColumns) {
        if (metaColumns) {
            const fields = (metaColumns.fields || []);
            const metaData = fields.reduce((init, current) => {
                if (init.columns) {
                    init = init.columns[rowData[current]] || {};
                }
                else {
                    init = this.reportMetaData[rowData[current]] || {};
                }
                return init;
            }, {});
            return metaData.index === index;
        }
        return false;
    }
    showMetaDataSubTotalRow(rowData, index, metaColumns) {
        if (metaColumns) {
            const fields = (metaColumns.fields || []);
            const metaData = fields.reduce((init, current, i) => {
                if (init.columns) {
                    init = init.columns[rowData[current]] || {};
                }
                else {
                    init = this.reportMetaData[rowData[current]] || {};
                }
                return init;
            }, {});
            return (metaData.subTotal || {}).index === index;
        }
        return false;
    }
    showMetaDataSubTotalCol(column, metaColumns) {
        const subFields = metaColumns ? metaColumns.subTotal || [] : [];
        return subFields.includes(column);
    }
    getMetadataSubTotal(rowData, column, metaColumns) {
        if (this.showMetaDataSubTotalCol(column, metaColumns)) {
            const fields = (metaColumns.fields || []);
            const metaData = fields.reduce((init, current, i) => {
                if (init.columns) {
                    init = init.columns[rowData[current]] || {};
                }
                else {
                    init = this.reportMetaData[rowData[current]] || {};
                }
                return init;
            }, {});
            return (metaData.subTotal || {})[column] || 0;
        }
        return 0;
    }
    getTextColor(rowData, textColors) {
        if (textColors) {
            const data = textColors.colors.find((f) => f.FieldID === rowData[textColors.field]);
            return data ? data.FieldDesc : "";
        }
        return "";
    }
    setDevidHeight(count = 0) {
        const elem = document.getElementById("exportTable");
        if (elem && this.devidHeight) {
            this.devidHeight = elem.offsetTop;
        }
        else if (count < 10) {
            setTimeout(() => {
                this.setDevidHeight(count + 1);
            }, 1000);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportPreviewComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.2.1", type: ReportPreviewComponent, selector: "lib-report-preview", inputs: { reportMetaData: "reportMetaData", devidHeight: "devidHeight", columns: "columns", reportData: "reportData", reportMetaDataColumns: "reportMetaDataColumns", emptyMessage: "emptyMessage", fillColor: "fillColor", isResponsive: "isResponsive" }, ngImport: i0, template: "<div\r\n  class=\"{{ isResponsive ? 'table-responsive-sm table-responsive' : '' }}\"\r\n  style=\"width: 100%; overflow: auto\"\r\n  style.maxHeight=\"calc(100vh - {{ devidHeight + 8 }}px)\"\r\n>\r\n  <table\r\n    class=\"table table-bordered text-nowrap\"\r\n    id=\"exportTable\"\r\n    style=\"width: max-content\"\r\n  >\r\n    <thead>\r\n      <tr>\r\n        <th\r\n          *ngFor=\"let col of columns\"\r\n          [style.width]=\"getColumnWidth(col.width)\"\r\n          class=\"position-sticky\"\r\n        >\r\n          <b>{{ col.header }}</b>\r\n        </th>\r\n      </tr>\r\n    </thead>\r\n    <tbody>\r\n      <ng-container *ngFor=\"let rowData of reportData; let index = index\">\r\n        <ng-container\r\n          [ngTemplateOutlet]=\"rowGroup\"\r\n          [ngTemplateOutletContext]=\"\r\n            getMetaDataRow(rowData, index, reportMetaDataColumns)\r\n          \"\r\n        ></ng-container>\r\n        <ng-container\r\n          [ngTemplateOutlet]=\"tableRow\"\r\n          [ngTemplateOutletContext]=\"\r\n            getMetaDataRow(rowData, index, reportMetaDataColumns)\r\n          \"\r\n        ></ng-container>\r\n        <ng-container\r\n          [ngTemplateOutlet]=\"subTotal\"\r\n          [ngTemplateOutletContext]=\"\r\n            getMetaDataRow(rowData, index, reportMetaDataColumns)\r\n          \"\r\n        ></ng-container>\r\n      </ng-container>\r\n    </tbody>\r\n    <tbody>\r\n      <tr class=\"table-row\" *ngIf=\"!reportData.length\">\r\n        <td colSpan=\"{{ columns.length }}\" class=\"text-center\">\r\n          {{ emptyMessage }}\r\n        </td>\r\n      </tr>\r\n    </tbody>\r\n  </table>\r\n</div>\r\n\r\n<ng-template #tableRow let-rowData=\"rowData\" let-index=\"index\">\r\n  <tr class=\"table-row\">\r\n    <td\r\n      class=\"text-wrap\"\r\n      *ngFor=\"let col of columns\"\r\n      [class.text-right]=\"col.type == 'number' || col.type == 'id'\"\r\n      [class.text-center]=\"col.type == 'checked'\"\r\n      [style.color]=\"getTextColor(rowData, col.TextColors)\"\r\n      style.backgroundColor=\"#{{\r\n        (rowData.SNo || index + 1) % 2 ? fillColor.odd : fillColor.even\r\n      }}\"\r\n    >\r\n      <ng-container [ngSwitch]=\"col.type\">\r\n        <ng-container\r\n          *ngSwitchCase=\"'url'\"\r\n          [ngTemplateOutlet]=\"urlField\"\r\n        ></ng-container>\r\n        <ng-container\r\n          *ngSwitchCase=\"'checked'\"\r\n          [ngTemplateOutlet]=\"checkedField\"\r\n        ></ng-container>\r\n        <ng-container\r\n          *ngSwitchCase=\"'number'\"\r\n          [ngTemplateOutlet]=\"numberField\"\r\n        ></ng-container>\r\n        <ng-container\r\n          *ngSwitchDefault\r\n          [ngTemplateOutlet]=\"defaultField\"\r\n        ></ng-container>\r\n      </ng-container>\r\n\r\n      <ng-template #urlField>\r\n        <a [href]=\"rowData[col.field]\" target=\"_blank\">\r\n          {{ rowData[col.field] }}\r\n        </a>\r\n      </ng-template>\r\n\r\n      <ng-template #checkedField>\r\n        <ng-container *ngIf=\"rowData[col.field]\">\r\n          <i class=\"fa fa-solid fa-check\"></i>\r\n        </ng-container>\r\n        <ng-container\r\n          *ngIf=\"!rowData[col.field]\"\r\n          style=\"font-weight: 1200; font-size: xx-large\"\r\n          >-</ng-container\r\n        >\r\n      </ng-template>\r\n\r\n      <ng-template #numberField>\r\n        <span [style.color]=\"rowData[col.field] ? '' : 'transparent'\">\r\n          {{ rowData[col.field] || 0 }}\r\n        </span>\r\n      </ng-template>\r\n\r\n      <ng-template #defaultField>{{ rowData[col.field] }}</ng-template>\r\n    </td>\r\n  </tr>\r\n</ng-template>\r\n\r\n<ng-template\r\n  #rowGroup\r\n  let-rowData=\"rowData\"\r\n  let-index=\"index\"\r\n  let-metaColumns=\"metaColumns\"\r\n>\r\n  <ng-container *ngIf=\"metaColumns && metaColumns.field\">\r\n    <tr\r\n      [class]=\"metaColumns.classNames\"\r\n      *ngIf=\"showMetaDataRow(rowData, index, metaColumns)\"\r\n    >\r\n      <td colSpan=\"{{ columns.length }}\" class=\"text-center\">\r\n        {{ metaColumns.header }}\r\n        {{ rowData[metaColumns.field] }}\r\n      </td>\r\n    </tr>\r\n    <ng-container\r\n      [ngTemplateOutlet]=\"rowGroup\"\r\n      [ngTemplateOutletContext]=\"\r\n        getMetaDataRow(rowData, index, metaColumns.columns)\r\n      \"\r\n    ></ng-container>\r\n  </ng-container>\r\n</ng-template>\r\n\r\n<ng-template\r\n  #subTotal\r\n  let-rowData=\"rowData\"\r\n  let-index=\"index\"\r\n  let-metaColumns=\"metaColumns\"\r\n>\r\n  <ng-container *ngIf=\"metaColumns\">\r\n    <tr\r\n      [class]=\"metaColumns.classNames\"\r\n      *ngIf=\"showMetaDataSubTotalRow(rowData, index, metaColumns)\"\r\n    >\r\n      <td\r\n        class=\"text-right\"\r\n        *ngFor=\"let col of columns\"\r\n        style.backgroundColor=\"#{{ fillColor.groupTotal }}\"\r\n      >\r\n        <span\r\n          *ngIf=\"showMetaDataSubTotalCol(col.field, metaColumns)\"\r\n          [style.color]=\"\r\n            getMetadataSubTotal(rowData, col.field, metaColumns)\r\n              ? ''\r\n              : 'transparent'\r\n          \"\r\n        >\r\n          {{ getMetadataSubTotal(rowData, col.field, metaColumns) }}\r\n        </span>\r\n      </td>\r\n    </tr>\r\n    <ng-container\r\n      [ngTemplateOutlet]=\"subTotal\"\r\n      [ngTemplateOutletContext]=\"\r\n        getMetaDataRow(rowData, index, metaColumns.columns)\r\n      \"\r\n    ></ng-container>\r\n  </ng-container>\r\n</ng-template>\r\n", styles: ["th{background-color:#ffc!important;font-family:var(--default-font)!important;font-size:16px!important;text-align:center}.table-row:nth-child(2n){background-color:#eee!important}.table-row:nth-child(odd){background-color:#fff!important}.row-group td{background-color:#bfffac}.row-childgroup td{background-color:#fce}tr td.vehicle_row{background-color:#beffac}tr td.date_row{background-color:#ffceac!important}.company_name{text-transform:uppercase!important;background-color:#fff!important;border:none}.address{background-color:#fff!important;border:none}.company_name,.address{border:none;text-align:center}.report-title{text-align:center;background-color:#fdc!important;border:none}.report-date{background-color:#e6f2ff!important;border:none;text-align:right}.request-data{background-color:#e6f2ff!important}@media print{th{background-color:#ffc!important;font-family:var(--default-font)!important;font-size:16px!important;-webkit-print-color-adjust:exact}.table-row:nth-child(2n){background-color:#eee!important;-webkit-print-color-adjust:exact}.table-row:nth-child(odd){background-color:#fff!important;-webkit-print-color-adjust:exact}.row-group td{background-color:#bfffac;-webkit-print-color-adjust:exact}.row-childgroup td{background-color:#fce;-webkit-print-color-adjust:exact}tr td.vehicle_row{background-color:#beffac!important;-webkit-print-color-adjust:exact}tr td.date_row{background-color:#ffceac!important;-webkit-print-color-adjust:exact}.company_name{text-transform:uppercase}.company_name,.address{font-weight:700;border:none!important;text-align:center}.report-title{text-align:center;background-color:#fdc!important;border:none!important;-webkit-print-color-adjust:exact}.report-date{background-color:#e6f2ff!important;border:none!important;text-align:right;-webkit-print-color-adjust:exact}.request-data{background-color:#e6f2ff!important;border:none!important;-webkit-print-color-adjust:exact}}@media all and (min-width: 767px) and (max-width: 870px){.table-responsive-md-lg{display:block!important;width:100%;overflow-x:auto}}.table td,.table th{padding:.35rem .25rem}.position-sticky{position:sticky;top:-1px;z-index:1}\n"], dependencies: [{ kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i1.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "directive", type: i1.NgSwitch, selector: "[ngSwitch]", inputs: ["ngSwitch"] }, { kind: "directive", type: i1.NgSwitchCase, selector: "[ngSwitchCase]", inputs: ["ngSwitchCase"] }, { kind: "directive", type: i1.NgSwitchDefault, selector: "[ngSwitchDefault]" }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportPreviewComponent, decorators: [{
            type: Component,
            args: [{ selector: "lib-report-preview", template: "<div\r\n  class=\"{{ isResponsive ? 'table-responsive-sm table-responsive' : '' }}\"\r\n  style=\"width: 100%; overflow: auto\"\r\n  style.maxHeight=\"calc(100vh - {{ devidHeight + 8 }}px)\"\r\n>\r\n  <table\r\n    class=\"table table-bordered text-nowrap\"\r\n    id=\"exportTable\"\r\n    style=\"width: max-content\"\r\n  >\r\n    <thead>\r\n      <tr>\r\n        <th\r\n          *ngFor=\"let col of columns\"\r\n          [style.width]=\"getColumnWidth(col.width)\"\r\n          class=\"position-sticky\"\r\n        >\r\n          <b>{{ col.header }}</b>\r\n        </th>\r\n      </tr>\r\n    </thead>\r\n    <tbody>\r\n      <ng-container *ngFor=\"let rowData of reportData; let index = index\">\r\n        <ng-container\r\n          [ngTemplateOutlet]=\"rowGroup\"\r\n          [ngTemplateOutletContext]=\"\r\n            getMetaDataRow(rowData, index, reportMetaDataColumns)\r\n          \"\r\n        ></ng-container>\r\n        <ng-container\r\n          [ngTemplateOutlet]=\"tableRow\"\r\n          [ngTemplateOutletContext]=\"\r\n            getMetaDataRow(rowData, index, reportMetaDataColumns)\r\n          \"\r\n        ></ng-container>\r\n        <ng-container\r\n          [ngTemplateOutlet]=\"subTotal\"\r\n          [ngTemplateOutletContext]=\"\r\n            getMetaDataRow(rowData, index, reportMetaDataColumns)\r\n          \"\r\n        ></ng-container>\r\n      </ng-container>\r\n    </tbody>\r\n    <tbody>\r\n      <tr class=\"table-row\" *ngIf=\"!reportData.length\">\r\n        <td colSpan=\"{{ columns.length }}\" class=\"text-center\">\r\n          {{ emptyMessage }}\r\n        </td>\r\n      </tr>\r\n    </tbody>\r\n  </table>\r\n</div>\r\n\r\n<ng-template #tableRow let-rowData=\"rowData\" let-index=\"index\">\r\n  <tr class=\"table-row\">\r\n    <td\r\n      class=\"text-wrap\"\r\n      *ngFor=\"let col of columns\"\r\n      [class.text-right]=\"col.type == 'number' || col.type == 'id'\"\r\n      [class.text-center]=\"col.type == 'checked'\"\r\n      [style.color]=\"getTextColor(rowData, col.TextColors)\"\r\n      style.backgroundColor=\"#{{\r\n        (rowData.SNo || index + 1) % 2 ? fillColor.odd : fillColor.even\r\n      }}\"\r\n    >\r\n      <ng-container [ngSwitch]=\"col.type\">\r\n        <ng-container\r\n          *ngSwitchCase=\"'url'\"\r\n          [ngTemplateOutlet]=\"urlField\"\r\n        ></ng-container>\r\n        <ng-container\r\n          *ngSwitchCase=\"'checked'\"\r\n          [ngTemplateOutlet]=\"checkedField\"\r\n        ></ng-container>\r\n        <ng-container\r\n          *ngSwitchCase=\"'number'\"\r\n          [ngTemplateOutlet]=\"numberField\"\r\n        ></ng-container>\r\n        <ng-container\r\n          *ngSwitchDefault\r\n          [ngTemplateOutlet]=\"defaultField\"\r\n        ></ng-container>\r\n      </ng-container>\r\n\r\n      <ng-template #urlField>\r\n        <a [href]=\"rowData[col.field]\" target=\"_blank\">\r\n          {{ rowData[col.field] }}\r\n        </a>\r\n      </ng-template>\r\n\r\n      <ng-template #checkedField>\r\n        <ng-container *ngIf=\"rowData[col.field]\">\r\n          <i class=\"fa fa-solid fa-check\"></i>\r\n        </ng-container>\r\n        <ng-container\r\n          *ngIf=\"!rowData[col.field]\"\r\n          style=\"font-weight: 1200; font-size: xx-large\"\r\n          >-</ng-container\r\n        >\r\n      </ng-template>\r\n\r\n      <ng-template #numberField>\r\n        <span [style.color]=\"rowData[col.field] ? '' : 'transparent'\">\r\n          {{ rowData[col.field] || 0 }}\r\n        </span>\r\n      </ng-template>\r\n\r\n      <ng-template #defaultField>{{ rowData[col.field] }}</ng-template>\r\n    </td>\r\n  </tr>\r\n</ng-template>\r\n\r\n<ng-template\r\n  #rowGroup\r\n  let-rowData=\"rowData\"\r\n  let-index=\"index\"\r\n  let-metaColumns=\"metaColumns\"\r\n>\r\n  <ng-container *ngIf=\"metaColumns && metaColumns.field\">\r\n    <tr\r\n      [class]=\"metaColumns.classNames\"\r\n      *ngIf=\"showMetaDataRow(rowData, index, metaColumns)\"\r\n    >\r\n      <td colSpan=\"{{ columns.length }}\" class=\"text-center\">\r\n        {{ metaColumns.header }}\r\n        {{ rowData[metaColumns.field] }}\r\n      </td>\r\n    </tr>\r\n    <ng-container\r\n      [ngTemplateOutlet]=\"rowGroup\"\r\n      [ngTemplateOutletContext]=\"\r\n        getMetaDataRow(rowData, index, metaColumns.columns)\r\n      \"\r\n    ></ng-container>\r\n  </ng-container>\r\n</ng-template>\r\n\r\n<ng-template\r\n  #subTotal\r\n  let-rowData=\"rowData\"\r\n  let-index=\"index\"\r\n  let-metaColumns=\"metaColumns\"\r\n>\r\n  <ng-container *ngIf=\"metaColumns\">\r\n    <tr\r\n      [class]=\"metaColumns.classNames\"\r\n      *ngIf=\"showMetaDataSubTotalRow(rowData, index, metaColumns)\"\r\n    >\r\n      <td\r\n        class=\"text-right\"\r\n        *ngFor=\"let col of columns\"\r\n        style.backgroundColor=\"#{{ fillColor.groupTotal }}\"\r\n      >\r\n        <span\r\n          *ngIf=\"showMetaDataSubTotalCol(col.field, metaColumns)\"\r\n          [style.color]=\"\r\n            getMetadataSubTotal(rowData, col.field, metaColumns)\r\n              ? ''\r\n              : 'transparent'\r\n          \"\r\n        >\r\n          {{ getMetadataSubTotal(rowData, col.field, metaColumns) }}\r\n        </span>\r\n      </td>\r\n    </tr>\r\n    <ng-container\r\n      [ngTemplateOutlet]=\"subTotal\"\r\n      [ngTemplateOutletContext]=\"\r\n        getMetaDataRow(rowData, index, metaColumns.columns)\r\n      \"\r\n    ></ng-container>\r\n  </ng-container>\r\n</ng-template>\r\n", styles: ["th{background-color:#ffc!important;font-family:var(--default-font)!important;font-size:16px!important;text-align:center}.table-row:nth-child(2n){background-color:#eee!important}.table-row:nth-child(odd){background-color:#fff!important}.row-group td{background-color:#bfffac}.row-childgroup td{background-color:#fce}tr td.vehicle_row{background-color:#beffac}tr td.date_row{background-color:#ffceac!important}.company_name{text-transform:uppercase!important;background-color:#fff!important;border:none}.address{background-color:#fff!important;border:none}.company_name,.address{border:none;text-align:center}.report-title{text-align:center;background-color:#fdc!important;border:none}.report-date{background-color:#e6f2ff!important;border:none;text-align:right}.request-data{background-color:#e6f2ff!important}@media print{th{background-color:#ffc!important;font-family:var(--default-font)!important;font-size:16px!important;-webkit-print-color-adjust:exact}.table-row:nth-child(2n){background-color:#eee!important;-webkit-print-color-adjust:exact}.table-row:nth-child(odd){background-color:#fff!important;-webkit-print-color-adjust:exact}.row-group td{background-color:#bfffac;-webkit-print-color-adjust:exact}.row-childgroup td{background-color:#fce;-webkit-print-color-adjust:exact}tr td.vehicle_row{background-color:#beffac!important;-webkit-print-color-adjust:exact}tr td.date_row{background-color:#ffceac!important;-webkit-print-color-adjust:exact}.company_name{text-transform:uppercase}.company_name,.address{font-weight:700;border:none!important;text-align:center}.report-title{text-align:center;background-color:#fdc!important;border:none!important;-webkit-print-color-adjust:exact}.report-date{background-color:#e6f2ff!important;border:none!important;text-align:right;-webkit-print-color-adjust:exact}.request-data{background-color:#e6f2ff!important;border:none!important;-webkit-print-color-adjust:exact}}@media all and (min-width: 767px) and (max-width: 870px){.table-responsive-md-lg{display:block!important;width:100%;overflow-x:auto}}.table td,.table th{padding:.35rem .25rem}.position-sticky{position:sticky;top:-1px;z-index:1}\n"] }]
        }], ctorParameters: function () { return []; }, propDecorators: { reportMetaData: [{
                type: Input
            }], devidHeight: [{
                type: Input
            }], columns: [{
                type: Input
            }], reportData: [{
                type: Input
            }], reportMetaDataColumns: [{
                type: Input
            }], emptyMessage: [{
                type: Input
            }], fillColor: [{
                type: Input
            }], isResponsive: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3J0LXByZXZpZXcuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcmVwb3J0LXRvb2wvdG9vbHMvcmVwb3J0LXByZXZpZXcvcmVwb3J0LXByZXZpZXcuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcmVwb3J0LXRvb2wvdG9vbHMvcmVwb3J0LXByZXZpZXcvcmVwb3J0LXByZXZpZXcuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDakQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGtCQUFrQixDQUFDOzs7QUFFN0MsbUVBQW1FO0FBT25FLE1BQU0sT0FBTyxzQkFBc0I7SUFVakM7UUFUZ0IsbUJBQWMsR0FBUSxFQUFFLENBQUM7UUFDekIsZ0JBQVcsR0FBRyxDQUFDLENBQUM7UUFDaEIsWUFBTyxHQUFVLEVBQUUsQ0FBQztRQUNwQixlQUFVLEdBQVUsRUFBRSxDQUFDO1FBRXZCLGlCQUFZLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLGNBQVMsR0FBRyxTQUFTLENBQUM7UUFDdEIsaUJBQVksR0FBRyxJQUFJLENBQUM7UUFHbEMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFFTSxjQUFjLENBQUMsS0FBVTtRQUM5QixPQUFPLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDO0lBQzFELENBQUM7SUFFTSxjQUFjLENBQUMsT0FBWSxFQUFFLEtBQWEsRUFBRSxXQUFnQjtRQUNqRSxPQUFPO1lBQ0wsT0FBTztZQUNQLEtBQUs7WUFDTCxXQUFXO1NBQ1osQ0FBQztJQUNKLENBQUM7SUFFTSxlQUFlLENBQ3BCLE9BQVksRUFDWixLQUFhLEVBQ2IsV0FB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VSxTQUFTO3NCQUF4QixLQUFLO2dCQUNVLFlBQVk7c0JBQTNCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0IH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcclxuaW1wb3J0IHsgZmlsbENvbG9yIH0gZnJvbSBcInJlcG9ydC10b29sL2NvcmVcIjtcclxuXHJcbi8vIGNvbnN0IGNsYXNzTmFtZXMgPSBbXCJ0YWJsZS1yb3dcIiwgXCJyb3ctZ3JvdXBcIiwgXCJyb3ctY2hpbGRncm91cFwiXTtcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiBcImxpYi1yZXBvcnQtcHJldmlld1wiLFxyXG4gIHRlbXBsYXRlVXJsOiBcIi4vcmVwb3J0LXByZXZpZXcuY29tcG9uZW50Lmh0bWxcIixcclxuICBzdHlsZVVybHM6IFtcIi4vcmVwb3J0LXByZXZpZXcuY29tcG9uZW50LmNzc1wiXSxcclxufSlcclxuZXhwb3J0IGNsYXNzIFJlcG9ydFByZXZpZXdDb21wb25lbnQge1xyXG4gIEBJbnB1dCgpIHB1YmxpYyByZXBvcnRNZXRhRGF0YTogYW55ID0ge307XHJcbiAgQElucHV0KCkgcHVibGljIGRldmlkSGVpZ2h0ID0gMDtcclxuICBASW5wdXQoKSBwdWJsaWMgY29sdW1uczogYW55W10gPSBbXTtcclxuICBASW5wdXQoKSBwdWJsaWMgcmVwb3J0RGF0YTogYW55W10gPSBbXTtcclxuICBASW5wdXQoKSBwdWJsaWMgcmVwb3J0TWV0YURhdGFDb2x1bW5zOiBhbnk7XHJcbiAgQElucHV0KCkgcHVibGljIGVtcHR5TWVzc2FnZSA9IFwiXCI7XHJcbiAgQElucHV0KCkgcHVibGljIGZpbGxDb2xvciA9IGZpbGxDb2xvcjtcclxuICBASW5wdXQoKSBwdWJsaWMgaXNSZXNwb25zaXZlID0gdHJ1ZTtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLnNldERldmlkSGVpZ2h0KCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0Q29sdW1uV2lkdGgod2lkdGg6IGFueSk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdHlwZW9mIHdpZHRoID09PSBcInN0cmluZ1wiID8gd2lkdGggOiBgJHt3aWR0aH1weGA7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0TWV0YURhdGFSb3cocm93RGF0YTogYW55LCBpbmRleDogbnVtYmVyLCBtZXRhQ29sdW1uczogYW55KTogYW55IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHJvd0RhdGEsXHJcbiAgICAgIGluZGV4LFxyXG4gICAgICBtZXRhQ29sdW1ucyxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2hvd01ldGFEYXRhUm93KFxyXG4gICAgcm93RGF0YTogYW55LFxyXG4gICAgaW5kZXg6IG51bWJlcixcclxuICAgIG1ldGFDb2x1bW5zOiBhbnlcclxuICApOiBib29sZWFuIHtcclxuICAgIGlmIChtZXRhQ29sdW1ucykge1xyXG4gICAgICBjb25zdCBmaWVsZHMgPSAobWV0YUNvbHVtbnMuZmllbGRzIHx8IFtdKSBhcyBzdHJpbmdbXTtcclxuICAgICAgY29uc3QgbWV0YURhdGEgPSBmaWVsZHMucmVkdWNlKChpbml0LCBjdXJyZW50KSA9PiB7XHJcbiAgICAgICAgaWYgKGluaXQuY29sdW1ucykge1xyXG4gICAgICAgICAgaW5pdCA9IGluaXQuY29sdW1uc1tyb3dEYXRhW2N1cnJlbnRdXSB8fCB7fTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaW5pdCA9IHRoaXMucmVwb3J0TWV0YURhdGFbcm93RGF0YVtjdXJyZW50XV0gfHwge307XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpbml0O1xyXG4gICAgICB9LCB7fSBhcyBhbnkpO1xyXG4gICAgICByZXR1cm4gbWV0YURhdGEuaW5kZXggPT09IGluZGV4O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNob3dNZXRhRGF0YVN1YlRvdGFsUm93KFxyXG4gICAgcm93RGF0YTogYW55LFxyXG4gICAgaW5kZXg6IG51bWJlcixcclxuICAgIG1ldGFDb2x1bW5zOiBhbnlcclxuICApOiBib29sZWFuIHtcclxuICAgIGlmIChtZXRhQ29sdW1ucykge1xyXG4gICAgICBjb25zdCBmaWVsZHMgPSAobWV0YUNvbHVtbnMuZmllbGRzIHx8IFtdKSBhcyBzdHJpbmdbXTtcclxuICAgICAgY29uc3QgbWV0YURhdGEgPSBmaWVsZHMucmVkdWNlKChpbml0LCBjdXJyZW50LCBpKSA9PiB7XHJcbiAgICAgICAgaWYgKGluaXQuY29sdW1ucykge1xyXG4gICAgICAgICAgaW5pdCA9IGluaXQuY29sdW1uc1tyb3dEYXRhW2N1cnJlbnRdXSB8fCB7fTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaW5pdCA9IHRoaXMucmVwb3J0TWV0YURhdGFbcm93RGF0YVtjdXJyZW50XV0gfHwge307XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpbml0O1xyXG4gICAgICB9LCB7fSBhcyBhbnkpO1xyXG4gICAgICByZXR1cm4gKG1ldGFEYXRhLnN1YlRvdGFsIHx8IHt9KS5pbmRleCA9PT0gaW5kZXg7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2hvd01ldGFEYXRhU3ViVG90YWxDb2woY29sdW1uOiBzdHJpbmcsIG1ldGFDb2x1bW5zOiBhbnkpOiBib29sZWFuIHtcclxuICAgIGNvbnN0IHN1YkZpZWxkcyA9IG1ldGFDb2x1bW5zID8gbWV0YUNvbHVtbnMuc3ViVG90YWwgfHwgW10gOiBbXTtcclxuICAgIHJldHVybiBzdWJGaWVsZHMuaW5jbHVkZXMoY29sdW1uKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRNZXRhZGF0YVN1YlRvdGFsKFxyXG4gICAgcm93RGF0YTogYW55LFxyXG4gICAgY29sdW1uOiBzdHJpbmcsXHJcbiAgICBtZXRhQ29sdW1uczogYW55XHJcbiAgKTogbnVtYmVyIHtcclxuICAgIGlmICh0aGlzLnNob3dNZXRhRGF0YVN1YlRvdGFsQ29sKGNvbHVtbiwgbWV0YUNvbHVtbnMpKSB7XHJcbiAgICAgIGNvbnN0IGZpZWxkcyA9IChtZXRhQ29sdW1ucy5maWVsZHMgfHwgW10pIGFzIHN0cmluZ1tdO1xyXG4gICAgICBjb25zdCBtZXRhRGF0YSA9IGZpZWxkcy5yZWR1Y2UoKGluaXQsIGN1cnJlbnQsIGkpID0+IHtcclxuICAgICAgICBpZiAoaW5pdC5jb2x1bW5zKSB7XHJcbiAgICAgICAgICBpbml0ID0gaW5pdC5jb2x1bW5zW3Jvd0RhdGFbY3VycmVudF1dIHx8IHt9O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBpbml0ID0gdGhpcy5yZXBvcnRNZXRhRGF0YVtyb3dEYXRhW2N1cnJlbnRdXSB8fCB7fTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGluaXQ7XHJcbiAgICAgIH0sIHt9IGFzIGFueSk7XHJcbiAgICAgIHJldHVybiAobWV0YURhdGEuc3ViVG90YWwgfHwge30pW2NvbHVtbl0gfHwgMDtcclxuICAgIH1cclxuICAgIHJldHVybiAwO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldFRleHRDb2xvcihyb3dEYXRhOiBhbnksIHRleHRDb2xvcnM6IGFueSk6IHN0cmluZyB7XHJcbiAgICBpZiAodGV4dENvbG9ycykge1xyXG4gICAgICBjb25zdCBkYXRhID0gdGV4dENvbG9ycy5jb2xvcnMuZmluZChcclxuICAgICAgICAoZikgPT4gZi5GaWVsZElEID09PSByb3dEYXRhW3RleHRDb2xvcnMuZmllbGRdXHJcbiAgICAgICk7XHJcbiAgICAgIHJldHVybiBkYXRhID8gZGF0YS5GaWVsZERlc2MgOiBcIlwiO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFwiXCI7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNldERldmlkSGVpZ2h0KGNvdW50ID0gMCk6IHZvaWQge1xyXG4gICAgY29uc3QgZWxlbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZXhwb3J0VGFibGVcIik7XHJcbiAgICBpZiAoZWxlbSAmJiB0aGlzLmRldmlkSGVpZ2h0KSB7XHJcbiAgICAgIHRoaXMuZGV2aWRIZWlnaHQgPSAoZWxlbSBhcyBhbnkpLm9mZnNldFRvcDtcclxuICAgIH0gZWxzZSBpZiAoY291bnQgPCAxMCkge1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICB0aGlzLnNldERldmlkSGVpZ2h0KGNvdW50ICsgMSk7XHJcbiAgICAgIH0sIDEwMDApO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCI8ZGl2XHJcbiAgY2xhc3M9XCJ7eyBpc1Jlc3BvbnNpdmUgPyAndGFibGUtcmVzcG9uc2l2ZS1zbSB0YWJsZS1yZXNwb25zaXZlJyA6ICcnIH19XCJcclxuICBzdHlsZT1cIndpZHRoOiAxMDAlOyBvdmVyZmxvdzogYXV0b1wiXHJcbiAgc3R5bGUubWF4SGVpZ2h0PVwiY2FsYygxMDB2aCAtIHt7IGRldmlkSGVpZ2h0ICsgOCB9fXB4KVwiXHJcbj5cclxuICA8dGFibGVcclxuICAgIGNsYXNzPVwidGFibGUgdGFibGUtYm9yZGVyZWQgdGV4dC1ub3dyYXBcIlxyXG4gICAgaWQ9XCJleHBvcnRUYWJsZVwiXHJcbiAgICBzdHlsZT1cIndpZHRoOiBtYXgtY29udGVudFwiXHJcbiAgPlxyXG4gICAgPHRoZWFkPlxyXG4gICAgICA8dHI+XHJcbiAgICAgICAgPHRoXHJcbiAgICAgICAgICAqbmdGb3I9XCJsZXQgY29sIG9mIGNvbHVtbnNcIlxyXG4gICAgICAgICAgW3N0eWxlLndpZHRoXT1cImdldENvbHVtbldpZHRoKGNvbC53aWR0aClcIlxyXG4gICAgICAgICAgY2xhc3M9XCJwb3NpdGlvbi1zdGlja3lcIlxyXG4gICAgICAgID5cclxuICAgICAgICAgIDxiPnt7IGNvbC5oZWFkZXIgfX08L2I+XHJcbiAgICAgICAgPC90aD5cclxuICAgICAgPC90cj5cclxuICAgIDwvdGhlYWQ+XHJcbiAgICA8dGJvZHk+XHJcbiAgICAgIDxuZy1jb250YWluZXIgKm5nRm9yPVwibGV0IHJvd0RhdGEgb2YgcmVwb3J0RGF0YTsgbGV0IGluZGV4ID0gaW5kZXhcIj5cclxuICAgICAgICA8bmctY29udGFpbmVyXHJcbiAgICAgICAgICBbbmdUZW1wbGF0ZU91dGxldF09XCJyb3dHcm91cFwiXHJcbiAgICAgICAgICBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdPVwiXHJcbiAgICAgICAgICAgIGdldE1ldGFEYXRhUm93KHJvd0RhdGEsIGluZGV4LCByZXBvcnRNZXRhRGF0YUNvbHVtbnMpXHJcbiAgICAgICAgICBcIlxyXG4gICAgICAgID48L25nLWNvbnRhaW5lcj5cclxuICAgICAgICA8bmctY29udGFpbmVyXHJcbiAgICAgICAgICBbbmdUZW1wbGF0ZU91dGxldF09XCJ0YWJsZVJvd1wiXHJcbiAgICAgICAgICBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdPVwiXHJcbiAgICAgICAgICAgIGdldE1ldGFEYXRhUm93KHJvd0RhdGEsIGluZGV4LCByZXBvcnRNZXRhRGF0YUNvbHVtbnMpXHJcbiAgICAgICAgICBcIlxyXG4gICAgICAgID48L25nLWNvbnRhaW5lcj5cclxuICAgICAgICA8bmctY29udGFpbmVyXHJcbiAgICAgICAgICBbbmdUZW1wbGF0ZU91dGxldF09XCJzdWJUb3RhbFwiXHJcbiAgICAgICAgICBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdPVwiXHJcbiAgICAgICAgICAgIGdldE1ldGFEYXRhUm93KHJvd0RhdGEsIGluZGV4LCByZXBvcnRNZXRhRGF0YUNvbHVtbnMpXHJcbiAgICAgICAgICBcIlxyXG4gICAgICAgID48L25nLWNvbnRhaW5lcj5cclxuICAgICAgPC9uZy1jb250YWluZXI+XHJcbiAgICA8L3Rib2R5PlxyXG4gICAgPHRib2R5PlxyXG4gICAgICA8dHIgY2xhc3M9XCJ0YWJsZS1yb3dcIiAqbmdJZj1cIiFyZXBvcnREYXRhLmxlbmd0aFwiPlxyXG4gICAgICAgIDx0ZCBjb2xTcGFuPVwie3sgY29sdW1ucy5sZW5ndGggfX1cIiBjbGFzcz1cInRleHQtY2VudGVyXCI+XHJcbiAgICAgICAgICB7eyBlbXB0eU1lc3NhZ2UgfX1cclxuICAgICAgICA8L3RkPlxyXG4gICAgICA8L3RyPlxyXG4gICAgPC90Ym9keT5cclxuICA8L3RhYmxlPlxyXG48L2Rpdj5cclxuXHJcbjxuZy10ZW1wbGF0ZSAjdGFibGVSb3cgbGV0LXJvd0RhdGE9XCJyb3dEYXRhXCIgbGV0LWluZGV4PVwiaW5kZXhcIj5cclxuICA8dHIgY2xhc3M9XCJ0YWJsZS1yb3dcIj5cclxuICAgIDx0ZFxyXG4gICAgICBjbGFzcz1cInRleHQtd3JhcFwiXHJcbiAgICAgICpuZ0Zvcj1cImxldCBjb2wgb2YgY29sdW1uc1wiXHJcbiAgICAgIFtjbGFzcy50ZXh0LXJpZ2h0XT1cImNvbC50eXBlID09ICdudW1iZXInIHx8IGNvbC50eXBlID09ICdpZCdcIlxyXG4gICAgICBbY2xhc3MudGV4dC1jZW50ZXJdPVwiY29sLnR5cGUgPT0gJ2NoZWNrZWQnXCJcclxuICAgICAgW3N0eWxlLmNvbG9yXT1cImdldFRleHRDb2xvcihyb3dEYXRhLCBjb2wuVGV4dENvbG9ycylcIlxyXG4gICAgICBzdHlsZS5iYWNrZ3JvdW5kQ29sb3I9XCIje3tcclxuICAgICAgICAocm93RGF0YS5TTm8gfHwgaW5kZXggKyAxKSAlIDIgPyBmaWxsQ29sb3Iub2RkIDogZmlsbENvbG9yLmV2ZW5cclxuICAgICAgfX1cIlxyXG4gICAgPlxyXG4gICAgICA8bmctY29udGFpbmVyIFtuZ1N3aXRjaF09XCJjb2wudHlwZVwiPlxyXG4gICAgICAgIDxuZy1jb250YWluZXJcclxuICAgICAgICAgICpuZ1N3aXRjaENhc2U9XCIndXJsJ1wiXHJcbiAgICAgICAgICBbbmdUZW1wbGF0ZU91dGxldF09XCJ1cmxGaWVsZFwiXHJcbiAgICAgICAgPjwvbmctY29udGFpbmVyPlxyXG4gICAgICAgIDxuZy1jb250YWluZXJcclxuICAgICAgICAgICpuZ1N3aXRjaENhc2U9XCInY2hlY2tlZCdcIlxyXG4gICAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRdPVwiY2hlY2tlZEZpZWxkXCJcclxuICAgICAgICA+PC9uZy1jb250YWluZXI+XHJcbiAgICAgICAgPG5nLWNvbnRhaW5lclxyXG4gICAgICAgICAgKm5nU3dpdGNoQ2FzZT1cIidudW1iZXInXCJcclxuICAgICAgICAgIFtuZ1RlbXBsYXRlT3V0bGV0XT1cIm51bWJlckZpZWxkXCJcclxuICAgICAgICA+PC9uZy1jb250YWluZXI+XHJcbiAgICAgICAgPG5nLWNvbnRhaW5lclxyXG4gICAgICAgICAgKm5nU3dpdGNoRGVmYXVsdFxyXG4gICAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRdPVwiZGVmYXVsdEZpZWxkXCJcclxuICAgICAgICA+PC9uZy1jb250YWluZXI+XHJcbiAgICAgIDwvbmctY29udGFpbmVyPlxyXG5cclxuICAgICAgPG5nLXRlbXBsYXRlICN1cmxGaWVsZD5cclxuICAgICAgICA8YSBbaHJlZl09XCJyb3dEYXRhW2NvbC5maWVsZF1cIiB0YXJnZXQ9XCJfYmxhbmtcIj5cclxuICAgICAgICAgIHt7IHJvd0RhdGFbY29sLmZpZWxkXSB9fVxyXG4gICAgICAgIDwvYT5cclxuICAgICAgPC9uZy10ZW1wbGF0ZT5cclxuXHJcbiAgICAgIDxuZy10ZW1wbGF0ZSAjY2hlY2tlZEZpZWxkPlxyXG4gICAgICAgIDxuZy1jb250YWluZXIgKm5nSWY9XCJyb3dEYXRhW2NvbC5maWVsZF1cIj5cclxuICAgICAgICAgIDxpIGNsYXNzPVwiZmEgZmEtc29saWQgZmEtY2hlY2tcIj48L2k+XHJcbiAgICAgICAgPC9uZy1jb250YWluZXI+XHJcbiAgICAgICAgPG5nLWNvbnRhaW5lclxyXG4gICAgICAgICAgKm5nSWY9XCIhcm93RGF0YVtjb2wuZmllbGRdXCJcclxuICAgICAgICAgIHN0eWxlPVwiZm9udC13ZWlnaHQ6IDEyMDA7IGZvbnQtc2l6ZTogeHgtbGFyZ2VcIlxyXG4gICAgICAgICAgPi08L25nLWNvbnRhaW5lclxyXG4gICAgICAgID5cclxuICAgICAgPC9uZy10ZW1wbGF0ZT5cclxuXHJcbiAgICAgIDxuZy10ZW1wbGF0ZSAjbnVtYmVyRmllbGQ+XHJcbiAgICAgICAgPHNwYW4gW3N0eWxlLmNvbG9yXT1cInJvd0RhdGFbY29sLmZpZWxkXSA/ICcnIDogJ3RyYW5zcGFyZW50J1wiPlxyXG4gICAgICAgICAge3sgcm93RGF0YVtjb2wuZmllbGRdIHx8IDAgfX1cclxuICAgICAgICA8L3NwYW4+XHJcbiAgICAgIDwvbmctdGVtcGxhdGU+XHJcblxyXG4gICAgICA8bmctdGVtcGxhdGUgI2RlZmF1bHRGaWVsZD57eyByb3dEYXRhW2NvbC5maWVsZF0gfX08L25nLXRlbXBsYXRlPlxyXG4gICAgPC90ZD5cclxuICA8L3RyPlxyXG48L25nLXRlbXBsYXRlPlxyXG5cclxuPG5nLXRlbXBsYXRlXHJcbiAgI3Jvd0dyb3VwXHJcbiAgbGV0LXJvd0RhdGE9XCJyb3dEYXRhXCJcclxuICBsZXQtaW5kZXg9XCJpbmRleFwiXHJcbiAgbGV0LW1ldGFDb2x1bW5zPVwibWV0YUNvbHVtbnNcIlxyXG4+XHJcbiAgPG5nLWNvbnRhaW5lciAqbmdJZj1cIm1ldGFDb2x1bW5zICYmIG1ldGFDb2x1bW5zLmZpZWxkXCI+XHJcbiAgICA8dHJcclxuICAgICAgW2NsYXNzXT1cIm1ldGFDb2x1bW5zLmNsYXNzTmFtZXNcIlxyXG4gICAgICAqbmdJZj1cInNob3dNZXRhRGF0YVJvdyhyb3dEYXRhLCBpbmRleCwgbWV0YUNvbHVtbnMpXCJcclxuICAgID5cclxuICAgICAgPHRkIGNvbFNwYW49XCJ7eyBjb2x1bW5zLmxlbmd0aCB9fVwiIGNsYXNzPVwidGV4dC1jZW50ZXJcIj5cclxuICAgICAgICB7eyBtZXRhQ29sdW1ucy5oZWFkZXIgfX1cclxuICAgICAgICB7eyByb3dEYXRhW21ldGFDb2x1bW5zLmZpZWxkXSB9fVxyXG4gICAgICA8L3RkPlxyXG4gICAgPC90cj5cclxuICAgIDxuZy1jb250YWluZXJcclxuICAgICAgW25nVGVtcGxhdGVPdXRsZXRdPVwicm93R3JvdXBcIlxyXG4gICAgICBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdPVwiXHJcbiAgICAgICAgZ2V0TWV0YURhdGFSb3cocm93RGF0YSwgaW5kZXgsIG1ldGFDb2x1bW5zLmNvbHVtbnMpXHJcbiAgICAgIFwiXHJcbiAgICA+PC9uZy1jb250YWluZXI+XHJcbiAgPC9uZy1jb250YWluZXI+XHJcbjwvbmctdGVtcGxhdGU+XHJcblxyXG48bmctdGVtcGxhdGVcclxuICAjc3ViVG90YWxcclxuICBsZXQtcm93RGF0YT1cInJvd0RhdGFcIlxyXG4gIGxldC1pbmRleD1cImluZGV4XCJcclxuICBsZXQtbWV0YUNvbHVtbnM9XCJtZXRhQ29sdW1uc1wiXHJcbj5cclxuICA8bmctY29udGFpbmVyICpuZ0lmPVwibWV0YUNvbHVtbnNcIj5cclxuICAgIDx0clxyXG4gICAgICBbY2xhc3NdPVwibWV0YUNvbHVtbnMuY2xhc3NOYW1lc1wiXHJcbiAgICAgICpuZ0lmPVwic2hvd01ldGFEYXRhU3ViVG90YWxSb3cocm93RGF0YSwgaW5kZXgsIG1ldGFDb2x1bW5zKVwiXHJcbiAgICA+XHJcbiAgICAgIDx0ZFxyXG4gICAgICAgIGNsYXNzPVwidGV4dC1yaWdodFwiXHJcbiAgICAgICAgKm5nRm9yPVwibGV0IGNvbCBvZiBjb2x1bW5zXCJcclxuICAgICAgICBzdHlsZS5iYWNrZ3JvdW5kQ29sb3I9XCIje3sgZmlsbENvbG9yLmdyb3VwVG90YWwgfX1cIlxyXG4gICAgICA+XHJcbiAgICAgICAgPHNwYW5cclxuICAgICAgICAgICpuZ0lmPVwic2hvd01ldGFEYXRhU3ViVG90YWxDb2woY29sLmZpZWxkLCBtZXRhQ29sdW1ucylcIlxyXG4gICAgICAgICAgW3N0eWxlLmNvbG9yXT1cIlxyXG4gICAgICAgICAgICBnZXRNZXRhZGF0YVN1YlRvdGFsKHJvd0RhdGEsIGNvbC5maWVsZCwgbWV0YUNvbHVtbnMpXHJcbiAgICAgICAgICAgICAgPyAnJ1xyXG4gICAgICAgICAgICAgIDogJ3RyYW5zcGFyZW50J1xyXG4gICAgICAgICAgXCJcclxuICAgICAgICA+XHJcbiAgICAgICAgICB7eyBnZXRNZXRhZGF0YVN1YlRvdGFsKHJvd0RhdGEsIGNvbC5maWVsZCwgbWV0YUNvbHVtbnMpIH19XHJcbiAgICAgICAgPC9zcGFuPlxyXG4gICAgICA8L3RkPlxyXG4gICAgPC90cj5cclxuICAgIDxuZy1jb250YWluZXJcclxuICAgICAgW25nVGVtcGxhdGVPdXRsZXRdPVwic3ViVG90YWxcIlxyXG4gICAgICBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdPVwiXHJcbiAgICAgICAgZ2V0TWV0YURhdGFSb3cocm93RGF0YSwgaW5kZXgsIG1ldGFDb2x1bW5zLmNvbHVtbnMpXHJcbiAgICAgIFwiXHJcbiAgICA+PC9uZy1jb250YWluZXI+XHJcbiAgPC9uZy1jb250YWluZXI+XHJcbjwvbmctdGVtcGxhdGU+XHJcbiJdfQ==