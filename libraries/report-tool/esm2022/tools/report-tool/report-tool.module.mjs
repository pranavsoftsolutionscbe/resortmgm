import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DropdownModule } from "primeng/dropdown";
import { OwlDateTimeModule, OwlNativeDateTimeModule, } from "ng-pick-datetime-ex";
import { FilterPipeModule } from "report-tool/pipes";
import { ReportToolComponent } from "./report-tool.component";
import * as i0 from "@angular/core";
export class ReportToolModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportToolModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.2.1", ngImport: i0, type: ReportToolModule, declarations: [ReportToolComponent], imports: [CommonModule,
            FormsModule,
            DropdownModule,
            OwlDateTimeModule,
            OwlNativeDateTimeModule,
            FilterPipeModule], exports: [ReportToolComponent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportToolModule, imports: [CommonModule,
            FormsModule,
            DropdownModule,
            OwlDateTimeModule,
            OwlNativeDateTimeModule,
            FilterPipeModule] }); }
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
                        OwlNativeDateTimeModule,
                        FilterPipeModule
                    ],
                    exports: [ReportToolComponent],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3J0LXRvb2wubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcmVwb3J0LXRvb2wvdG9vbHMvcmVwb3J0LXRvb2wvcmVwb3J0LXRvb2wubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUM3QyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDbEQsT0FBTyxFQUNMLGlCQUFpQixFQUNqQix1QkFBdUIsR0FDeEIsTUFBTSxxQkFBcUIsQ0FBQztBQUU3QixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQUVwRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQzs7QUFjOUQsTUFBTSxPQUFPLGdCQUFnQjs4R0FBaEIsZ0JBQWdCOytHQUFoQixnQkFBZ0IsaUJBWFosbUJBQW1CLGFBRWhDLFlBQVk7WUFDWixXQUFXO1lBQ1gsY0FBYztZQUNkLGlCQUFpQjtZQUNqQix1QkFBdUI7WUFDdkIsZ0JBQWdCLGFBRVIsbUJBQW1COytHQUVsQixnQkFBZ0IsWUFUekIsWUFBWTtZQUNaLFdBQVc7WUFDWCxjQUFjO1lBQ2QsaUJBQWlCO1lBQ2pCLHVCQUF1QjtZQUN2QixnQkFBZ0I7OzJGQUlQLGdCQUFnQjtrQkFaNUIsUUFBUTttQkFBQztvQkFDUixZQUFZLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQztvQkFDbkMsT0FBTyxFQUFFO3dCQUNQLFlBQVk7d0JBQ1osV0FBVzt3QkFDWCxjQUFjO3dCQUNkLGlCQUFpQjt3QkFDakIsdUJBQXVCO3dCQUN2QixnQkFBZ0I7cUJBQ2pCO29CQUNELE9BQU8sRUFBRSxDQUFDLG1CQUFtQixDQUFDO2lCQUMvQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9jb21tb25cIjtcbmltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IEZvcm1zTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL2Zvcm1zXCI7XG5pbXBvcnQgeyBEcm9wZG93bk1vZHVsZSB9IGZyb20gXCJwcmltZW5nL2Ryb3Bkb3duXCI7XG5pbXBvcnQge1xuICBPd2xEYXRlVGltZU1vZHVsZSxcbiAgT3dsTmF0aXZlRGF0ZVRpbWVNb2R1bGUsXG59IGZyb20gXCJuZy1waWNrLWRhdGV0aW1lLWV4XCI7XG5cbmltcG9ydCB7IEZpbHRlclBpcGVNb2R1bGUgfSBmcm9tIFwicmVwb3J0LXRvb2wvcGlwZXNcIlxuXG5pbXBvcnQgeyBSZXBvcnRUb29sQ29tcG9uZW50IH0gZnJvbSBcIi4vcmVwb3J0LXRvb2wuY29tcG9uZW50XCI7XG5cbkBOZ01vZHVsZSh7XG4gIGRlY2xhcmF0aW9uczogW1JlcG9ydFRvb2xDb21wb25lbnRdLFxuICBpbXBvcnRzOiBbXG4gICAgQ29tbW9uTW9kdWxlLFxuICAgIEZvcm1zTW9kdWxlLFxuICAgIERyb3Bkb3duTW9kdWxlLFxuICAgIE93bERhdGVUaW1lTW9kdWxlLFxuICAgIE93bE5hdGl2ZURhdGVUaW1lTW9kdWxlLFxuICAgIEZpbHRlclBpcGVNb2R1bGVcbiAgXSxcbiAgZXhwb3J0czogW1JlcG9ydFRvb2xDb21wb25lbnRdLFxufSlcbmV4cG9ydCBjbGFzcyBSZXBvcnRUb29sTW9kdWxlIHt9XG4iXX0=