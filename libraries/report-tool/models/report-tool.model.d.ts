import { IMenuItem } from "./common.model";
export interface IReportHeads {
    ReportId?: number;
    Cust_ID?: number;
    MasterId?: number;
    SortOrder?: number;
    ReportName?: string;
    ReportDescription?: string;
    SqlQuery?: string;
    WhereCondition?: string;
    CustomWhere?: string;
    GroupByCondition?: string;
    HavingCondition?: string;
    NoOfDateFields?: number;
    SubQry?: string;
    ISColumnar?: boolean;
    LedgerQuery?: string;
    LedgerFieldName?: string;
    DateDefault?: string;
    Groupwise?: boolean;
    FixedGroup?: boolean;
    CustomFunction?: string;
    CalculateFunction?: string;
    WarningMessage?: string;
    DateFields?: string;
    DateCaptions?: string;
    DateField?: string;
    ZoomField?: string;
    OrderBy?: string;
    NextMasterId?: number;
    NextReportId?: number;
    ExcelCompatability?: boolean;
    TableBorder?: boolean;
    StyleSheet?: string;
    Record1Color?: string;
    Record1ColorRGB?: string;
    Record2Color?: string;
    Record2ColorRGB?: string;
    GroupTotalColor?: string;
    GroupTotalColorRGB?: string;
    GrandTotalColor?: string;
    GrandTotalColorRGB?: string;
    ShowinMenu?: boolean;
    PrinterName?: string;
    PaperSize?: string;
    Portrait?: boolean;
    Header?: string;
    Footer?: string;
    LeftMargin?: number;
    RightMargin?: number;
    TopMargin?: number;
    BottomMargin?: number;
    SavedBy?: number;
    IsStdReport?: boolean;
    ColumnWidth?: number;
    IsDelete?: boolean;
}
export interface IReportDetails {
    RDAutoId?: number;
    ReportId?: number;
    FieldId?: number;
    FieldsName?: string;
    ReferenceName?: string;
    DisplayName?: string;
    AlignMent?: string;
    ComboQuery?: string;
    ISColumnar?: boolean;
    ConditionEnabled?: boolean;
    DType?: string;
    SumField?: boolean;
    GroupingEligible?: boolean;
    GroupBy?: boolean;
    OrderBy?: boolean;
    OrderByPref?: string;
    FilterField?: boolean;
    RunningTotal?: boolean;
    GroupTotal?: boolean;
    GrandTotal?: number;
    Width?: number;
    CompulsaryField?: boolean;
    ViewDisabled?: boolean;
    ZoomField?: boolean;
}
export interface IReportHeadsDetail {
    MasterId: number;
    MyReportHead?: IReportHeads[];
    ReportGroup: string;
}
export interface IReportDynamic {
    CustID: number;
    SqlQuery: string;
}
export interface IMyReportDetails extends IReportDetails {
    GroupByAdd?: boolean;
    SumFieldAdd?: boolean;
    MyFieldName?: string;
    IsDelete?: boolean;
}
export interface IReportHeadsCUD {
    MyReportHead: IReportHeads;
    MyReportDetails: IMyReportDetails[];
}
export interface IFilterReportDetails {
    RDAutoId?: number;
    FieldsName?: string;
    DisplayName?: string;
    MyFieldName?: string;
    FilterOperator?: string;
    FilterCondition?: string;
    FilterRemove?: boolean;
    WhereCondition?: string;
}
export interface IReportPortReq {
    FromDate?: any;
    ToDate?: any;
    LedgerField?: any;
    LedgerValue?: any;
    LedgerList?: IMenuItem<any>[];
    OrderByAdd?: number;
    OrderByRemove?: number;
    RunningTotalPrev?: number;
    RunningTotalNext?: number;
    RunningTotalOperator?: string;
    FilterField?: number;
    FilterOperator?: string;
    FilterCondition?: string;
    ddFilterOperator?: IMenuItem<any>[];
    ddFilterListAll?: string[];
    ddFilterList?: string[];
    FilterFieldList?: IFilterReportDetails[];
}
export interface IDateRange {
    label?: string;
    value?: string;
    FromDate?: any;
    ToDate?: any;
}
export interface IReportRow {
    header?: string;
    odd?: string;
    even?: string;
    group?: string;
    subgroup?: string;
    groupTotal?: string;
    grandTotal?: string;
}
export interface IUrlRequestParams {
    Title?: string;
    requestData?: any[];
    columns?: any[];
    reportData?: any[];
    reportMetaDataColumns?: any;
    orientation?: string;
    pageSize?: string;
    FromDate?: string;
    ToDate?: string;
    CustId?: number;
    ReportDate?: any[];
    emptyMessage?: any;
    sqlRequest?: any;
    bgColor?: IReportRow;
    numberFormat?: string;
}
export interface IQueryField {
    query: string;
    field: string;
}
