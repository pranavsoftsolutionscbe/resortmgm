import { Component, OnInit } from "@angular/core";

import {
  IMyReportDetails,
  IQueryField,
  IReportDetails,
  IReportDynamic,
  IReportHeads,
  IReportHeadsCUD,
  IReportHeadsDetail,
  IReportPortReq,
  IUrlRequestParams,
} from "report-tool/models";

import { Observable } from "rxjs";
import { changeMenuItem, encrypt, joinPaths } from "report-tool/methods";
import { DataserviceService } from "src/app/shared/dataservice/dataservice.service";
import { Endpoint } from "src/app/shared/API/Endpoint.model";

@Component({
  selector: "my-report-port",
  templateUrl: "./report-port.component.html",
  styleUrls: ["./report-port.component.css"],
})
export class ReportPortComponent implements OnInit {
  custId = 1511;
  reportPort: IReportPortReq = {};
  obsReportList: Observable<IReportHeadsDetail[]>;
  obsReportHeads: Observable<IReportHeads>;
  obsReportDetails: Observable<IMyReportDetails[]>;

  constructor(private apiSvc: DataserviceService) {}

  ngOnInit() {
    this.initialize();
  }

  onSelectReport(reportId: number): void {
    const headUrl = joinPaths(Endpoint.ReportHeads, reportId);
    const detailUrl = joinPaths(Endpoint.GetRportDetailList, reportId);
    this.obsReportHeads = this.apiSvc.get(headUrl);
    this.obsReportDetails = this.apiSvc.get(detailUrl);
  }

  onLedgerQuery(query: string): void {
    this.getReportQuery(query).subscribe((result: any[]) => {
      this.reportPort.LedgerList = [];
      const firstLedger = result[0];
      if (firstLedger) {
        const keys = Object.keys(firstLedger);
        const labelField = keys[0];
        this.reportPort.LedgerField = keys[1];
        if (!this.reportPort.LedgerField.length) {
          this.reportPort.LedgerField = labelField;
        }
        this.reportPort.LedgerValue = firstLedger[this.reportPort.LedgerField];
        this.reportPort.LedgerList = changeMenuItem(result, keys, true);
        this.reportPort = { ...this.reportPort };
      }
    });
  }

  onComboQuery({ query, field }: IQueryField): void {
    this.getReportQuery(query).subscribe((result: any[]) => {
      this.reportPort.ddFilterListAll = result.map((m) => m[field]);
      this.reportPort = { ...this.reportPort };
    });
  }

  onReportEvent(urlRequest: IUrlRequestParams): void {
    const time = Date.now();
    const base64Data = encrypt(JSON.stringify(urlRequest));
    localStorage.setItem(`${time}`, base64Data);
    const link = location.origin + "/#/report-preview?key=" + time;
    window.open(link);
  }

  onSaveReport(request: IReportHeadsCUD): void {
    this.apiSvc.post(Endpoint.ReportHeadsCUD, request).subscribe((res) => {
      if (res.FieldID) {
        this.initialize();
      } else {
      }
    });
  }

  private initialize(): void {
    this.getReportList();
  }

  private getReportList(): void {
    const endpoint = Endpoint.GetReportHeadDetails;
    const url = joinPaths(endpoint, this.custId);
    this.obsReportList = this.apiSvc.get(url);
  }

  private getReportQuery(query: string): Observable<any> {
    const request: IReportDynamic = {
      CustID: this.custId,
      SqlQuery: query,
    };
    return this.apiSvc.post(Endpoint.GetReportDynamic, request);
  }
}
