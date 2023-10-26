import * as i0 from '@angular/core';
import { Component, Input, NgModule } from '@angular/core';
import { fillColor } from 'report-tool/core';
import * as i1 from '@angular/common';
import { CommonModule, DatePipe } from '@angular/common';

// const classNames = ["table-row", "row-group", "row-childgroup"];
class ReportTableComponent {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportTableComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.2.1", type: ReportTableComponent, selector: "lib-report-table", inputs: { reportMetaData: "reportMetaData", devidHeight: "devidHeight", columns: "columns", reportData: "reportData", reportMetaDataColumns: "reportMetaDataColumns", emptyMessage: "emptyMessage", fillColor: "fillColor", isResponsive: "isResponsive" }, ngImport: i0, template: "<div\r\n  class=\"{{ isResponsive ? 'table-responsive-sm table-responsive' : '' }}\"\r\n  style=\"width: 100%; overflow: auto\"\r\n  style.maxHeight=\"calc(100vh - {{ devidHeight + 8 }}px)\"\r\n>\r\n  <table\r\n    class=\"table table-bordered text-nowrap\"\r\n    id=\"exportTable\"\r\n    style=\"width: max-content\"\r\n  >\r\n    <thead>\r\n      <tr>\r\n        <th\r\n          *ngFor=\"let col of columns\"\r\n          [style.width]=\"getColumnWidth(col.width)\"\r\n          class=\"position-sticky\"\r\n        >\r\n          <b>{{ col.header }}</b>\r\n        </th>\r\n      </tr>\r\n    </thead>\r\n    <tbody>\r\n      <ng-container *ngFor=\"let rowData of reportData; let index = index\">\r\n        <ng-container\r\n          [ngTemplateOutlet]=\"rowGroup\"\r\n          [ngTemplateOutletContext]=\"\r\n            getMetaDataRow(rowData, index, reportMetaDataColumns)\r\n          \"\r\n        ></ng-container>\r\n        <ng-container\r\n          [ngTemplateOutlet]=\"tableRow\"\r\n          [ngTemplateOutletContext]=\"\r\n            getMetaDataRow(rowData, index, reportMetaDataColumns)\r\n          \"\r\n        ></ng-container>\r\n        <ng-container\r\n          [ngTemplateOutlet]=\"subTotal\"\r\n          [ngTemplateOutletContext]=\"\r\n            getMetaDataRow(rowData, index, reportMetaDataColumns)\r\n          \"\r\n        ></ng-container>\r\n      </ng-container>\r\n    </tbody>\r\n    <tbody>\r\n      <tr class=\"table-row\" *ngIf=\"!reportData.length\">\r\n        <td colSpan=\"{{ columns.length }}\" class=\"text-center\">\r\n          {{ emptyMessage }}\r\n        </td>\r\n      </tr>\r\n    </tbody>\r\n  </table>\r\n</div>\r\n\r\n<ng-template #tableRow let-rowData=\"rowData\" let-index=\"index\">\r\n  <tr class=\"table-row\">\r\n    <td\r\n      class=\"text-wrap\"\r\n      *ngFor=\"let col of columns\"\r\n      [class.text-right]=\"col.type == 'number' || col.type == 'id'\"\r\n      [class.text-center]=\"col.type == 'checked'\"\r\n      [style.color]=\"getTextColor(rowData, col.TextColors)\"\r\n      style.backgroundColor=\"#{{\r\n        (rowData.SNo || index + 1) % 2 ? fillColor.odd : fillColor.even\r\n      }}\"\r\n    >\r\n      <ng-container [ngSwitch]=\"col.type\">\r\n        <ng-container\r\n          *ngSwitchCase=\"'url'\"\r\n          [ngTemplateOutlet]=\"urlField\"\r\n        ></ng-container>\r\n        <ng-container\r\n          *ngSwitchCase=\"'checked'\"\r\n          [ngTemplateOutlet]=\"checkedField\"\r\n        ></ng-container>\r\n        <ng-container\r\n          *ngSwitchCase=\"'number'\"\r\n          [ngTemplateOutlet]=\"numberField\"\r\n        ></ng-container>\r\n        <ng-container\r\n          *ngSwitchDefault\r\n          [ngTemplateOutlet]=\"defaultField\"\r\n        ></ng-container>\r\n      </ng-container>\r\n\r\n      <ng-template #urlField>\r\n        <a [href]=\"rowData[col.field]\" target=\"_blank\">\r\n          {{ rowData[col.field] }}\r\n        </a>\r\n      </ng-template>\r\n\r\n      <ng-template #checkedField>\r\n        <ng-container *ngIf=\"rowData[col.field]\">\r\n          <i class=\"fa fa-solid fa-check\"></i>\r\n        </ng-container>\r\n        <ng-container\r\n          *ngIf=\"!rowData[col.field]\"\r\n          style=\"font-weight: 1200; font-size: xx-large\"\r\n          >-</ng-container\r\n        >\r\n      </ng-template>\r\n\r\n      <ng-template #numberField>\r\n        <span [style.color]=\"rowData[col.field] ? '' : 'transparent'\">\r\n          {{ rowData[col.field] || 0 }}\r\n        </span>\r\n      </ng-template>\r\n\r\n      <ng-template #defaultField>{{ rowData[col.field] }}</ng-template>\r\n    </td>\r\n  </tr>\r\n</ng-template>\r\n\r\n<ng-template\r\n  #rowGroup\r\n  let-rowData=\"rowData\"\r\n  let-index=\"index\"\r\n  let-metaColumns=\"metaColumns\"\r\n>\r\n  <ng-container *ngIf=\"metaColumns && metaColumns.field\">\r\n    <tr\r\n      [class]=\"metaColumns.classNames\"\r\n      *ngIf=\"showMetaDataRow(rowData, index, metaColumns)\"\r\n    >\r\n      <td colSpan=\"{{ columns.length }}\" class=\"text-center\">\r\n        {{ metaColumns.header }}\r\n        {{ rowData[metaColumns.field] }}\r\n      </td>\r\n    </tr>\r\n    <ng-container\r\n      [ngTemplateOutlet]=\"rowGroup\"\r\n      [ngTemplateOutletContext]=\"\r\n        getMetaDataRow(rowData, index, metaColumns.columns)\r\n      \"\r\n    ></ng-container>\r\n  </ng-container>\r\n</ng-template>\r\n\r\n<ng-template\r\n  #subTotal\r\n  let-rowData=\"rowData\"\r\n  let-index=\"index\"\r\n  let-metaColumns=\"metaColumns\"\r\n>\r\n  <ng-container *ngIf=\"metaColumns\">\r\n    <tr\r\n      [class]=\"metaColumns.classNames\"\r\n      *ngIf=\"showMetaDataSubTotalRow(rowData, index, metaColumns)\"\r\n    >\r\n      <td\r\n        class=\"text-right\"\r\n        *ngFor=\"let col of columns\"\r\n        style.backgroundColor=\"#{{ fillColor.groupTotal }}\"\r\n      >\r\n        <span\r\n          *ngIf=\"showMetaDataSubTotalCol(col.field, metaColumns)\"\r\n          [style.color]=\"\r\n            getMetadataSubTotal(rowData, col.field, metaColumns)\r\n              ? ''\r\n              : 'transparent'\r\n          \"\r\n        >\r\n          {{ getMetadataSubTotal(rowData, col.field, metaColumns) }}\r\n        </span>\r\n      </td>\r\n    </tr>\r\n    <ng-container\r\n      [ngTemplateOutlet]=\"subTotal\"\r\n      [ngTemplateOutletContext]=\"\r\n        getMetaDataRow(rowData, index, metaColumns.columns)\r\n      \"\r\n    ></ng-container>\r\n  </ng-container>\r\n</ng-template>\r\n", dependencies: [{ kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i1.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "directive", type: i1.NgSwitch, selector: "[ngSwitch]", inputs: ["ngSwitch"] }, { kind: "directive", type: i1.NgSwitchCase, selector: "[ngSwitchCase]", inputs: ["ngSwitchCase"] }, { kind: "directive", type: i1.NgSwitchDefault, selector: "[ngSwitchDefault]" }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportTableComponent, decorators: [{
            type: Component,
            args: [{ selector: "lib-report-table", template: "<div\r\n  class=\"{{ isResponsive ? 'table-responsive-sm table-responsive' : '' }}\"\r\n  style=\"width: 100%; overflow: auto\"\r\n  style.maxHeight=\"calc(100vh - {{ devidHeight + 8 }}px)\"\r\n>\r\n  <table\r\n    class=\"table table-bordered text-nowrap\"\r\n    id=\"exportTable\"\r\n    style=\"width: max-content\"\r\n  >\r\n    <thead>\r\n      <tr>\r\n        <th\r\n          *ngFor=\"let col of columns\"\r\n          [style.width]=\"getColumnWidth(col.width)\"\r\n          class=\"position-sticky\"\r\n        >\r\n          <b>{{ col.header }}</b>\r\n        </th>\r\n      </tr>\r\n    </thead>\r\n    <tbody>\r\n      <ng-container *ngFor=\"let rowData of reportData; let index = index\">\r\n        <ng-container\r\n          [ngTemplateOutlet]=\"rowGroup\"\r\n          [ngTemplateOutletContext]=\"\r\n            getMetaDataRow(rowData, index, reportMetaDataColumns)\r\n          \"\r\n        ></ng-container>\r\n        <ng-container\r\n          [ngTemplateOutlet]=\"tableRow\"\r\n          [ngTemplateOutletContext]=\"\r\n            getMetaDataRow(rowData, index, reportMetaDataColumns)\r\n          \"\r\n        ></ng-container>\r\n        <ng-container\r\n          [ngTemplateOutlet]=\"subTotal\"\r\n          [ngTemplateOutletContext]=\"\r\n            getMetaDataRow(rowData, index, reportMetaDataColumns)\r\n          \"\r\n        ></ng-container>\r\n      </ng-container>\r\n    </tbody>\r\n    <tbody>\r\n      <tr class=\"table-row\" *ngIf=\"!reportData.length\">\r\n        <td colSpan=\"{{ columns.length }}\" class=\"text-center\">\r\n          {{ emptyMessage }}\r\n        </td>\r\n      </tr>\r\n    </tbody>\r\n  </table>\r\n</div>\r\n\r\n<ng-template #tableRow let-rowData=\"rowData\" let-index=\"index\">\r\n  <tr class=\"table-row\">\r\n    <td\r\n      class=\"text-wrap\"\r\n      *ngFor=\"let col of columns\"\r\n      [class.text-right]=\"col.type == 'number' || col.type == 'id'\"\r\n      [class.text-center]=\"col.type == 'checked'\"\r\n      [style.color]=\"getTextColor(rowData, col.TextColors)\"\r\n      style.backgroundColor=\"#{{\r\n        (rowData.SNo || index + 1) % 2 ? fillColor.odd : fillColor.even\r\n      }}\"\r\n    >\r\n      <ng-container [ngSwitch]=\"col.type\">\r\n        <ng-container\r\n          *ngSwitchCase=\"'url'\"\r\n          [ngTemplateOutlet]=\"urlField\"\r\n        ></ng-container>\r\n        <ng-container\r\n          *ngSwitchCase=\"'checked'\"\r\n          [ngTemplateOutlet]=\"checkedField\"\r\n        ></ng-container>\r\n        <ng-container\r\n          *ngSwitchCase=\"'number'\"\r\n          [ngTemplateOutlet]=\"numberField\"\r\n        ></ng-container>\r\n        <ng-container\r\n          *ngSwitchDefault\r\n          [ngTemplateOutlet]=\"defaultField\"\r\n        ></ng-container>\r\n      </ng-container>\r\n\r\n      <ng-template #urlField>\r\n        <a [href]=\"rowData[col.field]\" target=\"_blank\">\r\n          {{ rowData[col.field] }}\r\n        </a>\r\n      </ng-template>\r\n\r\n      <ng-template #checkedField>\r\n        <ng-container *ngIf=\"rowData[col.field]\">\r\n          <i class=\"fa fa-solid fa-check\"></i>\r\n        </ng-container>\r\n        <ng-container\r\n          *ngIf=\"!rowData[col.field]\"\r\n          style=\"font-weight: 1200; font-size: xx-large\"\r\n          >-</ng-container\r\n        >\r\n      </ng-template>\r\n\r\n      <ng-template #numberField>\r\n        <span [style.color]=\"rowData[col.field] ? '' : 'transparent'\">\r\n          {{ rowData[col.field] || 0 }}\r\n        </span>\r\n      </ng-template>\r\n\r\n      <ng-template #defaultField>{{ rowData[col.field] }}</ng-template>\r\n    </td>\r\n  </tr>\r\n</ng-template>\r\n\r\n<ng-template\r\n  #rowGroup\r\n  let-rowData=\"rowData\"\r\n  let-index=\"index\"\r\n  let-metaColumns=\"metaColumns\"\r\n>\r\n  <ng-container *ngIf=\"metaColumns && metaColumns.field\">\r\n    <tr\r\n      [class]=\"metaColumns.classNames\"\r\n      *ngIf=\"showMetaDataRow(rowData, index, metaColumns)\"\r\n    >\r\n      <td colSpan=\"{{ columns.length }}\" class=\"text-center\">\r\n        {{ metaColumns.header }}\r\n        {{ rowData[metaColumns.field] }}\r\n      </td>\r\n    </tr>\r\n    <ng-container\r\n      [ngTemplateOutlet]=\"rowGroup\"\r\n      [ngTemplateOutletContext]=\"\r\n        getMetaDataRow(rowData, index, metaColumns.columns)\r\n      \"\r\n    ></ng-container>\r\n  </ng-container>\r\n</ng-template>\r\n\r\n<ng-template\r\n  #subTotal\r\n  let-rowData=\"rowData\"\r\n  let-index=\"index\"\r\n  let-metaColumns=\"metaColumns\"\r\n>\r\n  <ng-container *ngIf=\"metaColumns\">\r\n    <tr\r\n      [class]=\"metaColumns.classNames\"\r\n      *ngIf=\"showMetaDataSubTotalRow(rowData, index, metaColumns)\"\r\n    >\r\n      <td\r\n        class=\"text-right\"\r\n        *ngFor=\"let col of columns\"\r\n        style.backgroundColor=\"#{{ fillColor.groupTotal }}\"\r\n      >\r\n        <span\r\n          *ngIf=\"showMetaDataSubTotalCol(col.field, metaColumns)\"\r\n          [style.color]=\"\r\n            getMetadataSubTotal(rowData, col.field, metaColumns)\r\n              ? ''\r\n              : 'transparent'\r\n          \"\r\n        >\r\n          {{ getMetadataSubTotal(rowData, col.field, metaColumns) }}\r\n        </span>\r\n      </td>\r\n    </tr>\r\n    <ng-container\r\n      [ngTemplateOutlet]=\"subTotal\"\r\n      [ngTemplateOutletContext]=\"\r\n        getMetaDataRow(rowData, index, metaColumns.columns)\r\n      \"\r\n    ></ng-container>\r\n  </ng-container>\r\n</ng-template>\r\n" }]
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

class ReportTableModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportTableModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.2.1", ngImport: i0, type: ReportTableModule, declarations: [ReportTableComponent], imports: [CommonModule], exports: [ReportTableComponent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportTableModule, providers: [DatePipe], imports: [CommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportTableModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [ReportTableComponent],
                    imports: [CommonModule],
                    exports: [ReportTableComponent],
                    providers: [DatePipe],
                }]
        }] });

/*
 * Public API Surface of report-tool
 */

/**
 * Generated bundle index. Do not edit.
 */

export { ReportTableComponent, ReportTableModule };
//# sourceMappingURL=report-tool-modules-report-table.mjs.map
