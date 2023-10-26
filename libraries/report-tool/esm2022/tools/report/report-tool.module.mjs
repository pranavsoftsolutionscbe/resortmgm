import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DropdownModule } from "primeng/dropdown";
import { OwlDateTimeModule, OwlNativeDateTimeModule, } from "ng-pick-datetime-ex";
import { ReportToolComponent } from "./report-tool.component";
import * as i0 from "@angular/core";
export class ReportToolModule {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3J0LXRvb2wubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcmVwb3J0LXRvb2wvdG9vbHMvcmVwb3J0L3JlcG9ydC10b29sLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDN0MsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ2xELE9BQU8sRUFDTCxpQkFBaUIsRUFDakIsdUJBQXVCLEdBR3hCLE1BQU0scUJBQXFCLENBQUM7QUFFN0IsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0seUJBQXlCLENBQUM7O0FBYzlELE1BQU0sT0FBTyxnQkFBZ0I7OEdBQWhCLGdCQUFnQjsrR0FBaEIsZ0JBQWdCLGlCQVZaLG1CQUFtQixhQUVoQyxZQUFZO1lBQ1osV0FBVztZQUNYLGNBQWM7WUFDZCxpQkFBaUI7WUFDakIsdUJBQXVCLGFBRWYsbUJBQW1COytHQUVsQixnQkFBZ0IsWUFSekIsWUFBWTtZQUNaLFdBQVc7WUFDWCxjQUFjO1lBQ2QsaUJBQWlCO1lBQ2pCLHVCQUF1Qjs7MkZBSWQsZ0JBQWdCO2tCQVg1QixRQUFRO21CQUFDO29CQUNSLFlBQVksRUFBRSxDQUFDLG1CQUFtQixDQUFDO29CQUNuQyxPQUFPLEVBQUU7d0JBQ1AsWUFBWTt3QkFDWixXQUFXO3dCQUNYLGNBQWM7d0JBQ2QsaUJBQWlCO3dCQUNqQix1QkFBdUI7cUJBQ3hCO29CQUNELE9BQU8sRUFBRSxDQUFDLG1CQUFtQixDQUFDO2lCQUMvQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9jb21tb25cIjtcbmltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IEZvcm1zTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL2Zvcm1zXCI7XG5pbXBvcnQgeyBEcm9wZG93bk1vZHVsZSB9IGZyb20gXCJwcmltZW5nL2Ryb3Bkb3duXCI7XG5pbXBvcnQge1xuICBPd2xEYXRlVGltZU1vZHVsZSxcbiAgT3dsTmF0aXZlRGF0ZVRpbWVNb2R1bGUsXG4gIE9XTF9EQVRFX1RJTUVfRk9STUFUUyxcbiAgT1dMX0RBVEVfVElNRV9MT0NBTEUsXG59IGZyb20gXCJuZy1waWNrLWRhdGV0aW1lLWV4XCI7XG5cbmltcG9ydCB7IFJlcG9ydFRvb2xDb21wb25lbnQgfSBmcm9tIFwiLi9yZXBvcnQtdG9vbC5jb21wb25lbnRcIjtcbmltcG9ydCB7IFRvYXN0ck1vZHVsZSB9IGZyb20gXCJuZ3gtdG9hc3RyXCI7XG5cbkBOZ01vZHVsZSh7XG4gIGRlY2xhcmF0aW9uczogW1JlcG9ydFRvb2xDb21wb25lbnRdLFxuICBpbXBvcnRzOiBbXG4gICAgQ29tbW9uTW9kdWxlLFxuICAgIEZvcm1zTW9kdWxlLFxuICAgIERyb3Bkb3duTW9kdWxlLFxuICAgIE93bERhdGVUaW1lTW9kdWxlLFxuICAgIE93bE5hdGl2ZURhdGVUaW1lTW9kdWxlXG4gIF0sXG4gIGV4cG9ydHM6IFtSZXBvcnRUb29sQ29tcG9uZW50XSxcbn0pXG5leHBvcnQgY2xhc3MgUmVwb3J0VG9vbE1vZHVsZSB7fVxuIl19