import { NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { ReportPreviewComponent } from "./report-preview.component";
import { ReportTableModule } from "report-tool/modules/report-table";
import * as i0 from "@angular/core";
export class ReportPreviewModule {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3J0LXByZXZpZXcubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcmVwb3J0LXRvb2wvbW9kdWxlcy9yZXBvcnQtcHJldmlldy9yZXBvcnQtcHJldmlldy5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3pELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU5QyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUNwRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQzs7QUFRckUsTUFBTSxPQUFPLG1CQUFtQjs4R0FBbkIsbUJBQW1COytHQUFuQixtQkFBbUIsaUJBTGYsc0JBQXNCLGFBQzNCLFlBQVksRUFBRSxZQUFZLEVBQUUsaUJBQWlCLGFBQzdDLHNCQUFzQjsrR0FHckIsbUJBQW1CLGFBRm5CLENBQUMsUUFBUSxDQUFDLFlBRlgsWUFBWSxFQUFFLFlBQVksRUFBRSxpQkFBaUI7OzJGQUk1QyxtQkFBbUI7a0JBTi9CLFFBQVE7bUJBQUM7b0JBQ1IsWUFBWSxFQUFFLENBQUMsc0JBQXNCLENBQUM7b0JBQ3RDLE9BQU8sRUFBRSxDQUFDLFlBQVksRUFBRSxZQUFZLEVBQUUsaUJBQWlCLENBQUM7b0JBQ3hELE9BQU8sRUFBRSxDQUFDLHNCQUFzQixDQUFDO29CQUNqQyxTQUFTLEVBQUUsQ0FBQyxRQUFRLENBQUM7aUJBQ3RCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5pbXBvcnQgeyBDb21tb25Nb2R1bGUsIERhdGVQaXBlIH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vblwiO1xyXG5pbXBvcnQgeyBCdXR0b25Nb2R1bGUgfSBmcm9tIFwicHJpbWVuZy9idXR0b25cIjtcclxuXHJcbmltcG9ydCB7IFJlcG9ydFByZXZpZXdDb21wb25lbnQgfSBmcm9tIFwiLi9yZXBvcnQtcHJldmlldy5jb21wb25lbnRcIjtcclxuaW1wb3J0IHsgUmVwb3J0VGFibGVNb2R1bGUgfSBmcm9tIFwicmVwb3J0LXRvb2wvbW9kdWxlcy9yZXBvcnQtdGFibGVcIjtcclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgZGVjbGFyYXRpb25zOiBbUmVwb3J0UHJldmlld0NvbXBvbmVudF0sXHJcbiAgaW1wb3J0czogW0NvbW1vbk1vZHVsZSwgQnV0dG9uTW9kdWxlLCBSZXBvcnRUYWJsZU1vZHVsZV0sXHJcbiAgZXhwb3J0czogW1JlcG9ydFByZXZpZXdDb21wb25lbnRdLFxyXG4gIHByb3ZpZGVyczogW0RhdGVQaXBlXSxcclxufSlcclxuZXhwb3J0IGNsYXNzIFJlcG9ydFByZXZpZXdNb2R1bGUge31cclxuIl19