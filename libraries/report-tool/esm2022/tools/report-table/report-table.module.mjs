import { NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { ReportTableComponent } from "./report-table.component";
import { ReportPreviewModule } from "report-tool/tools/report-preview";
import * as i0 from "@angular/core";
export class ReportTableModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportTableModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.2.1", ngImport: i0, type: ReportTableModule, declarations: [ReportTableComponent], imports: [CommonModule, ButtonModule, ReportPreviewModule], exports: [ReportTableComponent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportTableModule, providers: [DatePipe], imports: [CommonModule, ButtonModule, ReportPreviewModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportTableModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [ReportTableComponent],
                    imports: [CommonModule, ButtonModule, ReportPreviewModule],
                    exports: [ReportTableComponent],
                    providers: [DatePipe],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3J0LXRhYmxlLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3JlcG9ydC10b29sL3Rvb2xzL3JlcG9ydC10YWJsZS9yZXBvcnQtdGFibGUubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFOUMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDaEUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7O0FBUXZFLE1BQU0sT0FBTyxpQkFBaUI7OEdBQWpCLGlCQUFpQjsrR0FBakIsaUJBQWlCLGlCQUxiLG9CQUFvQixhQUN6QixZQUFZLEVBQUUsWUFBWSxFQUFFLG1CQUFtQixhQUMvQyxvQkFBb0I7K0dBR25CLGlCQUFpQixhQUZqQixDQUFDLFFBQVEsQ0FBQyxZQUZYLFlBQVksRUFBRSxZQUFZLEVBQUUsbUJBQW1COzsyRkFJOUMsaUJBQWlCO2tCQU43QixRQUFRO21CQUFDO29CQUNSLFlBQVksRUFBRSxDQUFDLG9CQUFvQixDQUFDO29CQUNwQyxPQUFPLEVBQUUsQ0FBQyxZQUFZLEVBQUUsWUFBWSxFQUFFLG1CQUFtQixDQUFDO29CQUMxRCxPQUFPLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztvQkFDL0IsU0FBUyxFQUFFLENBQUMsUUFBUSxDQUFDO2lCQUN0QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcclxuaW1wb3J0IHsgQ29tbW9uTW9kdWxlLCBEYXRlUGlwZSB9IGZyb20gXCJAYW5ndWxhci9jb21tb25cIjtcclxuaW1wb3J0IHsgQnV0dG9uTW9kdWxlIH0gZnJvbSBcInByaW1lbmcvYnV0dG9uXCI7XHJcblxyXG5pbXBvcnQgeyBSZXBvcnRUYWJsZUNvbXBvbmVudCB9IGZyb20gXCIuL3JlcG9ydC10YWJsZS5jb21wb25lbnRcIjtcclxuaW1wb3J0IHsgUmVwb3J0UHJldmlld01vZHVsZSB9IGZyb20gXCJyZXBvcnQtdG9vbC90b29scy9yZXBvcnQtcHJldmlld1wiO1xyXG5cclxuQE5nTW9kdWxlKHtcclxuICBkZWNsYXJhdGlvbnM6IFtSZXBvcnRUYWJsZUNvbXBvbmVudF0sXHJcbiAgaW1wb3J0czogW0NvbW1vbk1vZHVsZSwgQnV0dG9uTW9kdWxlLCBSZXBvcnRQcmV2aWV3TW9kdWxlXSxcclxuICBleHBvcnRzOiBbUmVwb3J0VGFibGVDb21wb25lbnRdLFxyXG4gIHByb3ZpZGVyczogW0RhdGVQaXBlXSxcclxufSlcclxuZXhwb3J0IGNsYXNzIFJlcG9ydFRhYmxlTW9kdWxlIHt9XHJcbiJdfQ==