import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";

import { ReportToolModule } from "report-tool/modules/report-tool";

import { ReportPortComponent } from "./report-port.component";

const routes: Routes = [
  { path: "", component: ReportPortComponent },
];

@NgModule({
  declarations: [ReportPortComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReportToolModule,
  ],
})
export class ReportPortModule {}
