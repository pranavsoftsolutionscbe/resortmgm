import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";

import { ReportPreviewModule as LibReportPreviewModule } from "report-tool/modules/report-preview"

import { ReportPreviewComponent } from "./report-preview.component";

const routes: Routes = [
  { path: "", component: ReportPreviewComponent },
];

@NgModule({
  declarations: [ReportPreviewComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    LibReportPreviewModule
  ],
})
export class ReportPreviewModule {}
