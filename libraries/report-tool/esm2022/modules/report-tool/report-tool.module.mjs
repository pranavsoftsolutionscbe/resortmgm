import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DropdownModule } from "primeng/dropdown";
import { AutoCompleteModule } from "primeng/autocomplete";
import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE, } from "ng-pick-datetime-ex";
import { ColorPickerModule } from "ngx-color-picker";
import { MOMENT_DATE_FORMATE } from "report-tool/core";
import { FilterPipeModule } from "report-tool/pipes";
import { ReportTableModule } from "report-tool/modules/report-table";
import { ReportToolComponent } from "./report-tool.component";
import * as i0 from "@angular/core";
export class ReportToolModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportToolModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.2.1", ngImport: i0, type: ReportToolModule, declarations: [ReportToolComponent], imports: [CommonModule,
            FormsModule,
            DropdownModule,
            AutoCompleteModule,
            OwlDateTimeModule,
            OwlNativeDateTimeModule,
            FilterPipeModule,
            ColorPickerModule,
            ReportTableModule], exports: [ReportToolComponent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportToolModule, providers: [
            {
                provide: OWL_DATE_TIME_FORMATS,
                useValue: MOMENT_DATE_FORMATE,
            },
            { provide: OWL_DATE_TIME_LOCALE, useValue: "en-IN" },
        ], imports: [CommonModule,
            FormsModule,
            DropdownModule,
            AutoCompleteModule,
            OwlDateTimeModule,
            OwlNativeDateTimeModule,
            FilterPipeModule,
            ColorPickerModule,
            ReportTableModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: ReportToolModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [ReportToolComponent],
                    imports: [
                        CommonModule,
                        FormsModule,
                        DropdownModule,
                        AutoCompleteModule,
                        OwlDateTimeModule,
                        OwlNativeDateTimeModule,
                        FilterPipeModule,
                        ColorPickerModule,
                        ReportTableModule
                    ],
                    providers: [
                        {
                            provide: OWL_DATE_TIME_FORMATS,
                            useValue: MOMENT_DATE_FORMATE,
                        },
                        { provide: OWL_DATE_TIME_LOCALE, useValue: "en-IN" },
                    ],
                    exports: [ReportToolComponent],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3J0LXRvb2wubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcmVwb3J0LXRvb2wvbW9kdWxlcy9yZXBvcnQtdG9vbC9yZXBvcnQtdG9vbC5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUMxRCxPQUFPLEVBQ0wsaUJBQWlCLEVBQ2pCLHVCQUF1QixFQUN2QixxQkFBcUIsRUFDckIsb0JBQW9CLEdBQ3JCLE1BQU0scUJBQXFCLENBQUM7QUFDN0IsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFFckQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDdkQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDckQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFFckUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0seUJBQXlCLENBQUM7O0FBd0I5RCxNQUFNLE9BQU8sZ0JBQWdCOzhHQUFoQixnQkFBZ0I7K0dBQWhCLGdCQUFnQixpQkFyQlosbUJBQW1CLGFBRWhDLFlBQVk7WUFDWixXQUFXO1lBQ1gsY0FBYztZQUNkLGtCQUFrQjtZQUNsQixpQkFBaUI7WUFDakIsdUJBQXVCO1lBQ3ZCLGdCQUFnQjtZQUNoQixpQkFBaUI7WUFDakIsaUJBQWlCLGFBU1QsbUJBQW1COytHQUVsQixnQkFBZ0IsYUFUaEI7WUFDVDtnQkFDRSxPQUFPLEVBQUUscUJBQXFCO2dCQUM5QixRQUFRLEVBQUUsbUJBQW1CO2FBQzlCO1lBQ0QsRUFBRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRTtTQUNyRCxZQWhCQyxZQUFZO1lBQ1osV0FBVztZQUNYLGNBQWM7WUFDZCxrQkFBa0I7WUFDbEIsaUJBQWlCO1lBQ2pCLHVCQUF1QjtZQUN2QixnQkFBZ0I7WUFDaEIsaUJBQWlCO1lBQ2pCLGlCQUFpQjs7MkZBV1IsZ0JBQWdCO2tCQXRCNUIsUUFBUTttQkFBQztvQkFDUixZQUFZLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQztvQkFDbkMsT0FBTyxFQUFFO3dCQUNQLFlBQVk7d0JBQ1osV0FBVzt3QkFDWCxjQUFjO3dCQUNkLGtCQUFrQjt3QkFDbEIsaUJBQWlCO3dCQUNqQix1QkFBdUI7d0JBQ3ZCLGdCQUFnQjt3QkFDaEIsaUJBQWlCO3dCQUNqQixpQkFBaUI7cUJBQ2xCO29CQUNELFNBQVMsRUFBRTt3QkFDVDs0QkFDRSxPQUFPLEVBQUUscUJBQXFCOzRCQUM5QixRQUFRLEVBQUUsbUJBQW1CO3lCQUM5Qjt3QkFDRCxFQUFFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFO3FCQUNyRDtvQkFDRCxPQUFPLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQztpQkFDL0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uXCI7XG5pbXBvcnQgeyBOZ01vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBGb3Jtc01vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9mb3Jtc1wiO1xuaW1wb3J0IHsgRHJvcGRvd25Nb2R1bGUgfSBmcm9tIFwicHJpbWVuZy9kcm9wZG93blwiO1xuaW1wb3J0IHsgQXV0b0NvbXBsZXRlTW9kdWxlIH0gZnJvbSBcInByaW1lbmcvYXV0b2NvbXBsZXRlXCI7XG5pbXBvcnQge1xuICBPd2xEYXRlVGltZU1vZHVsZSxcbiAgT3dsTmF0aXZlRGF0ZVRpbWVNb2R1bGUsXG4gIE9XTF9EQVRFX1RJTUVfRk9STUFUUyxcbiAgT1dMX0RBVEVfVElNRV9MT0NBTEUsXG59IGZyb20gXCJuZy1waWNrLWRhdGV0aW1lLWV4XCI7XG5pbXBvcnQgeyBDb2xvclBpY2tlck1vZHVsZSB9IGZyb20gXCJuZ3gtY29sb3ItcGlja2VyXCI7XG5cbmltcG9ydCB7IE1PTUVOVF9EQVRFX0ZPUk1BVEUgfSBmcm9tIFwicmVwb3J0LXRvb2wvY29yZVwiO1xuaW1wb3J0IHsgRmlsdGVyUGlwZU1vZHVsZSB9IGZyb20gXCJyZXBvcnQtdG9vbC9waXBlc1wiO1xuaW1wb3J0IHsgUmVwb3J0VGFibGVNb2R1bGUgfSBmcm9tIFwicmVwb3J0LXRvb2wvbW9kdWxlcy9yZXBvcnQtdGFibGVcIjtcblxuaW1wb3J0IHsgUmVwb3J0VG9vbENvbXBvbmVudCB9IGZyb20gXCIuL3JlcG9ydC10b29sLmNvbXBvbmVudFwiO1xuXG5ATmdNb2R1bGUoe1xuICBkZWNsYXJhdGlvbnM6IFtSZXBvcnRUb29sQ29tcG9uZW50XSxcbiAgaW1wb3J0czogW1xuICAgIENvbW1vbk1vZHVsZSxcbiAgICBGb3Jtc01vZHVsZSxcbiAgICBEcm9wZG93bk1vZHVsZSxcbiAgICBBdXRvQ29tcGxldGVNb2R1bGUsXG4gICAgT3dsRGF0ZVRpbWVNb2R1bGUsXG4gICAgT3dsTmF0aXZlRGF0ZVRpbWVNb2R1bGUsXG4gICAgRmlsdGVyUGlwZU1vZHVsZSxcbiAgICBDb2xvclBpY2tlck1vZHVsZSxcbiAgICBSZXBvcnRUYWJsZU1vZHVsZVxuICBdLFxuICBwcm92aWRlcnM6IFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBPV0xfREFURV9USU1FX0ZPUk1BVFMsXG4gICAgICB1c2VWYWx1ZTogTU9NRU5UX0RBVEVfRk9STUFURSxcbiAgICB9LFxuICAgIHsgcHJvdmlkZTogT1dMX0RBVEVfVElNRV9MT0NBTEUsIHVzZVZhbHVlOiBcImVuLUlOXCIgfSxcbiAgXSxcbiAgZXhwb3J0czogW1JlcG9ydFRvb2xDb21wb25lbnRdLFxufSlcbmV4cG9ydCBjbGFzcyBSZXBvcnRUb29sTW9kdWxlIHt9XG4iXX0=