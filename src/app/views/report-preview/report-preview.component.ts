import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { fillColor } from "report-tool/core";
import { decrypt } from "report-tool/methods";
import { IReportDynamic, OrientationType } from "report-tool/models";
import { Endpoint } from "src/app/shared/API/Endpoint.model";
import { DataserviceService } from "src/app/shared/dataservice/dataservice.service";

@Component({
  selector: "my-report-preview",
  templateUrl: "./report-preview.component.html",
  styleUrls: ["./report-preview.component.css"],
})
export class ReportPreviewComponent implements OnInit {
  public Title = "Report";
  public requestData: any[] = [];
  public columns: any[] = [];
  public reportData: any[] = [];
  public reportMetaDataColumns: any;
  public orientation = OrientationType.Portrait;
  public pageSize = "a4";
  public FromDate: string;
  public ToDate: string;
  public CustId = 1511;
  public ReportDate = {
    title: "Report Date",
    format: "dd-MM-yyyy",
  };
  public emptyMessage = "";
  public bgColor = fillColor;

  private sqlRequest: any;
  private numberFormat = "";

  [option: string]: any;

  constructor(private route: ActivatedRoute, private apiSvc: DataserviceService) {}

  ngOnInit() {
    const errorAlert = () => {
      alert("Invalid Report");
    };
    this.route.queryParams.subscribe((params) => {
      const sessionId = params["key"]
      if (sessionId) {
        const data =
          localStorage.getItem(sessionId) || sessionStorage.getItem(sessionId);
        if (data) {
          const dataObj: any = JSON.parse(decrypt(data));
          Object.keys(dataObj).forEach((key) => {
            if (dataObj[key]) {
              this[key] = dataObj[key];
            }
          });
          sessionStorage.setItem(sessionId, data);
          localStorage.removeItem(sessionId);
          this.getReport();
        } else {
          errorAlert();
        }
      } else {
        errorAlert();
      }
    });
  }

  private getReport(): void {
    const request: IReportDynamic = {
      CustID: this.CustId,
      SqlQuery: this.sqlRequest,
    };
    this.apiSvc.post(Endpoint.GetReportDynamic, request).subscribe(
      (response: any) => {
        this.reportData = response;
        this.emptyMessage = "No data found";
      },
      (err: any) => {
        console.log("err", err);
        // alert("Invalid Query");
      }
    );
  }
}
