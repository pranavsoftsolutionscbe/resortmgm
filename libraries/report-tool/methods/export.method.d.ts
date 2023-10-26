import { UserOptions } from "jspdf-autotable";
import { ExcelOptions, PdfOptions, IReportRow } from "report-tool/models";
export declare function exportPdfTable(orientation: any): void;
export declare function exportPdf(pdfOptions: PdfOptions): Blob;
export declare function autoTableOptions(doc: any, options: any, totalPagesExp: string, bgColor: IReportRow): UserOptions;
export declare function exportExcel(excelOptions: ExcelOptions): Promise<Blob>;
