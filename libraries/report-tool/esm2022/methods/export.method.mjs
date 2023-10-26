import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as Excel from "exceljs/dist/exceljs.min.js";
import * as FileSaver from "file-saver";
import { ExportExtentions, ExportTypes, } from "report-tool/models";
import { fillColor } from "report-tool/core";
import { hexToRgb } from "./type-change.method";
export function exportPdfTable(orientation) {
    const totalPagesExp = "{total_pages_count_string}";
    const doc = new jsPDF(orientation);
    autoTable(doc, {
        html: "#exportTable",
        theme: "grid",
    });
    // Total page number plugin only available in jspdf v1.0+
    if (typeof doc.putTotalPages === "function") {
        doc.putTotalPages(totalPagesExp);
    }
    // doc.output("dataurlnewwindow");
    doc.save(`Reports${Date.now()}.pdf`);
}
export function exportPdf(pdfOptions) {
    const { orientation, pageSize, rowData, columns, subColumns, reportTitle, requestTitle, FromDate, ToDate, tableOptions, rowDataGroup, isBlob, } = pdfOptions;
    let options = tableOptions;
    const metaReports = [];
    const bgColor = pdfOptions.bgColor || {};
    const rowDataGroupCols = options.Fields;
    const headerRowFillColor = hexToRgb(bgColor.header || fillColor.header);
    const groupFillColor = hexToRgb(bgColor.group || fillColor.group);
    const subGroupFillColor = hexToRgb(bgColor.subgroup || fillColor.subgroup);
    const totalPagesExp = "{total_pages_count_string}";
    const doc = new jsPDF(orientation, null, pageSize);
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    const xOffset = pageWidth / 2;
    const colStyles = {};
    columns.map((col) => {
        if (col.PdfWidth) {
            colStyles[col.field] = {
                cellWidth: (+col.PdfWidth * (pageWidth - 16)) / 100,
            };
        }
        if (col.type === "number" || col.type === "id") {
            colStyles[col.field].halign = "right";
        }
    });
    options.colStyles = {
        ...colStyles,
    };
    options.hFillColor = headerRowFillColor;
    options.hTextColor = [0, 0, 0];
    const setFillText = (option) => {
        const value = option.value;
        const hStart = option.hStart || options.startY;
        const height = option.height || 8;
        const x = option.x || xOffset;
        const y = option.y || options.startY;
        const align = option.align || "center";
        doc.rect(7, hStart, pageWidth - 14, height, "F");
        doc.text(value, x, y, align);
    };
    const addTable = (reports, cols = columns, tblOptions = options) => {
        doc.setFontSize(6);
        const atOption = autoTableOptions(doc, tblOptions, totalPagesExp, bgColor);
        atOption.columns = cols;
        atOption.body = reports;
        autoTable(doc, atOption);
        // options.startY = doc.previousAutoTable.finalY;
    };
    const addAutoTable = (reports) => {
        if (subColumns && subColumns.length) {
            const subColStyles = {};
            subColumns.map((col) => {
                if (col.PdfWidth) {
                    subColStyles[col.field] = {
                        cellWidth: (+col.PdfWidth * (pageWidth - 16)) / 100,
                    };
                }
                if (col.type === "number" || col.type === "id") {
                    subColStyles[col.field].halign = "right";
                }
            });
            options.colStyles = { ...subColStyles, ...options.colStyles };
            const parentField = subColumns[0].parentField;
            reports.forEach((groupRow) => {
                addTable([groupRow]);
                const reportRows = groupRow[parentField];
                const tblOptions = {
                    ...options,
                    hFillColor: [0, 0, 0],
                    hTextColor: [255, 255, 255],
                };
                addTable(reportRows, subColumns, tblOptions);
            });
        }
        else {
            addTable(reports);
        }
    };
    const setMetaDataRow = (metadata, metaColumns, reports, metaRows = []) => {
        if (metadata && metaColumns && metaColumns.field) {
            const { field, header, subTotal } = metaColumns;
            const fields = metaColumns.fields || [];
            const fillcolors = fields.length > 1 ? subGroupFillColor : groupFillColor;
            Object.keys(metadata).forEach((groupCol, index) => {
                const groupTitle = header + " " + groupCol;
                if (pageHeight - 20 < options.startY) {
                    doc.addPage();
                    options.startY = 10;
                }
                const data = [
                    {
                        content: groupTitle.trim(),
                        colSpan: columns.length,
                        styles: {
                            fillColor: fillcolors,
                            halign: "center",
                            fontSize: 9,
                            fontStyle: "bold",
                        },
                    },
                ];
                const subMetaRows = [...metaRows, data];
                const subMetadata = metadata[groupCol] || {};
                const subGroup = subMetadata.columns;
                const subGroupCols = metaColumns.columns;
                const filterReports = reports.filter((f) => f[field] === groupCol || !(groupCol && f[field]));
                if (subTotal && subTotal.length) {
                    const subTotalData = columns.reduce((init, current) => {
                        init[current.dataKey] =
                            (subMetadata.subTotal || {})[current.dataKey] || "";
                        return init;
                    }, { isGroupTotal: true });
                    filterReports.push(subTotalData);
                }
                setMetaDataRow(subGroup, subGroupCols, filterReports, subMetaRows);
            });
        }
        else {
            metaReports.push(...metaRows, ...reports);
            const reportLast = reports.reduce((init, current) => {
                if (!current.isGroupTotal) {
                    init = current;
                }
                return init;
            }, {});
            const rowDataLast = rowData[rowData.length - 1];
            if (JSON.stringify(reportLast) === JSON.stringify(rowDataLast)) {
                addAutoTable(metaReports);
            }
        }
    };
    // Company Name
    doc.setFont("", "bold");
    doc.text(reportTitle.CompanyName.toUpperCase(), xOffset, options.startY + 15, { align: "center" });
    // Address and Phone No
    options = { ...options, startY: options.startY + 25 };
    doc.setFontSize(10);
    doc.setFont("", "normal");
    const subTitle = [];
    if (reportTitle.Address1) {
        subTitle.push(reportTitle.Address1);
    }
    if (reportTitle.District || reportTitle.State) {
        subTitle.push(`${reportTitle.District ? reportTitle.District + ", " : ""}${reportTitle.State ? reportTitle.State : ""}`);
    }
    if (reportTitle.PhoneNo) {
        subTitle.push(`Telephone No : ${reportTitle.PhoneNo}`);
    }
    doc.text(subTitle, xOffset, options.startY - 3, { align: "center" });
    // Report Title
    options = { ...options, startY: subTitle.length * 5 + options.startY };
    doc.setFont("", "bold");
    doc.setFillColor(255, 221, 204);
    const titleOption = { value: options.title, hStart: options.startY - 5 };
    setFillText(titleOption);
    // Report Date
    options = { ...options, startY: options.startY + 7.5 };
    doc.setFont("", "normal");
    doc.setFontSize(9);
    doc.setFillColor(230, 242, 255);
    doc.rect(7, options.startY - 4.5, pageWidth - 14, Math.round(requestTitle.length / 2) * 7.5, "F");
    if (FromDate) {
        doc.text(FromDate, 8, options.startY, { align: "left" });
    }
    if (ToDate) {
        doc.text(ToDate, xOffset, options.startY, { align: "center" });
    }
    doc.text(requestTitle, pageWidth - 8, options.startY, { align: "right" });
    // Auto Table
    options = { ...options, startY: requestTitle.length * 5 + options.startY };
    setMetaDataRow(rowDataGroup, rowDataGroupCols, rowData);
    // Total page number plugin only available in jspdf v1.0+
    if (typeof doc.putTotalPages === "function") {
        doc.putTotalPages(totalPagesExp);
    }
    const blobPDF = new Blob([doc.output()], { type: "application/pdf" });
    // fileSaver.saveAs(blobPDF, options.title);
    if (!isBlob) {
        FileSaver.saveAs(blobPDF, options.title.trim().replace(/[^a-zA-Z0-9]/g, "_") + ExportExtentions.PDF);
    }
    return blobPDF;
}
export function autoTableOptions(doc, options, totalPagesExp, bgColor) {
    const oddRowFillColor = hexToRgb(bgColor.odd || fillColor.odd);
    const evenRowFillColor = hexToRgb(bgColor.even || fillColor.even);
    const groupTotalFillColor = hexToRgb(bgColor.groupTotal || fillColor.groupTotal);
    return {
        ...options,
        theme: "grid",
        pageBreak: "auto",
        rowPageBreak: "avoid",
        headStyles: {
            fontSize: 7,
            cellPadding: 1,
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
            valign: "middle",
            halign: "center",
            minCellHeight: 7,
            ...options.headStyles,
        },
        bodyStyles: {
            fontSize: 7,
            cellPadding: 1,
            valign: "middle",
            minCellHeight: 7,
            ...options.bodyStyles,
        },
        columnStyles: { lineColor: 100, valign: "middle", ...options.colStyles },
        margin: { top: 10, left: 7, right: 7 },
        didParseCell: (data) => {
            // data.
            if (data.section === "head") {
                data.cell.styles.fillColor = options.hFillColor;
                data.cell.styles.textColor = options.hTextColor;
            }
            else if (data.section === "body" && !data.row.raw[0]) {
                data.cell.styles.fillColor = data.row.raw["isGroupTotal"]
                    ? groupTotalFillColor
                    : (data.row.raw["SNo"] || data.row.index) % 2
                        ? oddRowFillColor
                        : evenRowFillColor;
            }
            if (data.section === "body" && data.column.raw["type"] === "checked") {
                const cells = data.row.cells[data.column.dataKey];
                cells.styles.font = "Wingdings";
                cells.styles.halign = "center";
                cells.text = [cells.raw ? "1" : "-"];
            }
        },
        didDrawPage: (data) => {
            // Footer
            let str = "Page " + doc.getNumberOfPages();
            if (typeof doc.putTotalPages === "function") {
                str = `${str} of ${totalPagesExp}`;
            }
            doc.setFontSize(7);
            const pageSize = doc.internal.pageSize;
            const pageHeight = pageSize.height
                ? pageSize.height
                : pageSize.getHeight();
            doc.text(str, data.settings.margin.right, pageHeight - 10);
        },
    };
}
export async function exportExcel(excelOptions) {
    // Excel Title, Header, Data
    const header = excelOptions.columns;
    const data = excelOptions.reports;
    const reportTitle = excelOptions.reportTitle;
    const reportDate = excelOptions.reportDate;
    const FromDate = excelOptions.FromDate;
    const ToDate = excelOptions.ToDate;
    const rowDataGroup = excelOptions.rowDataGroup;
    const title = excelOptions.title;
    const rowDataGroupCols = excelOptions.rowDataGroupCols;
    const isBlob = excelOptions.isBlob;
    const bgColor = excelOptions.bgColor || {};
    const headerRowFillColor = bgColor.header || fillColor.header;
    const oddRowFillColor = bgColor.odd || fillColor.odd;
    const evenRowFillColor = bgColor.even || fillColor.even;
    const groupFillColor = bgColor.group || fillColor.group;
    const subGroupFillColor = bgColor.subgroup || fillColor.subgroup;
    const subTotalFillColor = bgColor.groupTotal || fillColor.groupTotal;
    const urlKeys = header.filter((f) => f.type === "url").map((m) => m.key);
    const checkedKeys = header
        .filter((f) => f.type === "checked")
        .map((m) => m.key);
    const keys = {
        start: header[0].key,
        end: header[header.length - 1].key,
    };
    const workbook = new Excel.Workbook();
    const centerAlign = { vertical: "middle", horizontal: "center" };
    const defaultBorder = {
        top: { style: "thin", color: { argb: "AAAAAA" } },
        left: { style: "thin", color: { argb: "AAAAAA" } },
        bottom: { style: "thin", color: { argb: "AAAAAA" } },
        right: { style: "thin", color: { argb: "AAAAAA" } },
    };
    const worksheet = workbook.addWorksheet("Sheet1", { views: [] });
    worksheet.columns = header;
    const getFillColor = (color) => {
        return {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: color },
            bgColor: { argb: color },
        };
    };
    const getCellBorder = (style = defaultBorder) => {
        return {
            top: style.top,
            bottom: style.bottom,
            left: style.left,
            right: style.right,
        };
    };
    const mergeCells = (row, style) => {
        const start = row.getCell(keys.start);
        start.alignment = centerAlign;
        Object.keys(style).forEach((field) => {
            start[field] = style[field];
        });
        const end = row.getCell(keys.end);
        worksheet.mergeCells(`${start.address}:${end.address}`);
    };
    if (reportTitle) {
        const titleRow = worksheet.addRow([reportTitle.CompanyName.toUpperCase()]);
        titleRow.height = 27.5;
        const titleStyle = { font: { size: 16, bold: true } };
        mergeCells(titleRow, titleStyle);
        const addressRow = worksheet.addRow([reportTitle.Address]);
        addressRow.height = 25;
        const addressStyle = { font: { size: 14 } };
        mergeCells(addressRow, addressStyle);
    }
    const subtitleRow = worksheet.addRow([title]);
    subtitleRow.height = 25;
    const subtitleStyle = {
        font: { size: 14, bold: true },
        fill: getFillColor("FFDDCC"),
    };
    mergeCells(subtitleRow, subtitleStyle);
    // const requestRow = worksheet.addRow([`${FromDate} ${ToDate} ${reportDate}`]);
    const requestRow = worksheet.addRow(header.map((m, i) => {
        if (i === 0) {
            return FromDate;
        }
        else if (i === 2) {
            return ToDate;
        }
        else if (i === header.length - 2) {
            return reportDate;
        }
        else {
            return "";
        }
    }));
    requestRow.height = 21.25;
    const requestStyle = {
        font: { size: 12 },
        alignment: { vertical: "middle", horizontal: "distributed" },
        fill: getFillColor("E6F2FF"),
    };
    const fromDateStart = requestRow.getCell(keys.start);
    const fromDateEnd = requestRow.getCell(header[1].key);
    fromDateStart.font = { size: 12 };
    fromDateStart.alignment = { vertical: "middle", horizontal: "left" };
    fromDateStart.fill = getFillColor("E6F2FF");
    worksheet.mergeCells(`${fromDateStart.address}:${fromDateEnd.address}`);
    const toDateStart = requestRow.getCell(header[2].key);
    const toDateEnd = requestRow.getCell(header[header.length > 4 ? header.length - 3 : 2].key);
    toDateStart.font = { size: 12 };
    toDateStart.alignment = { vertical: "middle", horizontal: "center" };
    toDateStart.fill = getFillColor("E6F2FF");
    worksheet.mergeCells(`${toDateStart.address}:${toDateEnd.address}`);
    const reportDateStart = requestRow.getCell(header[header.length > 4 ? header.length - 2 : 3].key);
    const reportDateEnd = requestRow.getCell(keys.end);
    reportDateStart.font = { size: 12 };
    reportDateStart.alignment = { vertical: "middle", horizontal: "right" };
    reportDateStart.fill = getFillColor("E6F2FF");
    worksheet.mergeCells(`${reportDateStart.address}:${reportDateEnd.address}`);
    // const start = requestRow.getCell(keys.start);
    // start.alignment = centerAlign;
    // Object.keys(requestStyle).forEach((field) => {
    //   start[field] = requestStyle[field];
    // });
    // const end = requestRow.getCell(keys.end);
    // worksheet.mergeCells(`${start.address}:${end.address}`);
    // mergeCells(requestRow, requestStyle);
    const headerRow = worksheet.addRow(header.map((m) => m.header));
    headerRow.height = 20;
    const headerRowIndex = Number(headerRow.getCell(keys.start).row);
    worksheet.views.push({ state: "frozen", ySplit: headerRowIndex });
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.fill = getFillColor(headerRowFillColor);
        cell.font = { bold: true };
        cell.alignment = centerAlign;
        cell.border = getCellBorder();
    });
    data.forEach((rowData, index) => {
        const setMetaDataRow = (metadata, metaColumns) => {
            if (metadata && metaColumns && metaColumns.field) {
                const field = metaColumns.field;
                const gHeader = metaColumns.header;
                const filedList = metaColumns.fields || [];
                const fillClr = filedList.length > 1 ? subGroupFillColor : groupFillColor;
                const currentData = filedList.reduce((init, current) => {
                    if (init.columns) {
                        init = init.columns[rowData[current]] || {};
                    }
                    else {
                        init = metadata[rowData[current]] || {};
                    }
                    return init;
                }, {});
                if (currentData.index === index) {
                    const groupRow = worksheet.addRow([gHeader + " " + rowData[field]]);
                    groupRow.height = 20;
                    const groupStyle = {
                        fill: getFillColor(fillClr),
                        border: getCellBorder(),
                    };
                    mergeCells(groupRow, groupStyle);
                }
                const subMetadata = currentData;
                const subMetaColumns = metaColumns.columns;
                setMetaDataRow(subMetadata.columns, subMetaColumns);
            }
        };
        const setMetaDataSubTotalRow = (metadata, metaColumns) => {
            if (metadata && metaColumns && metaColumns.field) {
                const filedList = metaColumns.fields || [];
                const fillClr = subTotalFillColor;
                const currentData = filedList.reduce((init, current) => {
                    if (init.columns) {
                        init = init.columns[rowData[current]] || {};
                    }
                    else {
                        init = metadata[rowData[current]] || {};
                    }
                    return init;
                }, {});
                if ((currentData.subTotal || {}).index === index) {
                    const subtotalData = header.reduce((init, current) => {
                        init[current.key] = currentData.subTotal[current.key] || "";
                        return init;
                    }, {});
                    console.log("subtotalData", subtotalData);
                    const subTotalRow = worksheet.addRow(subtotalData);
                    subTotalRow.height = 20;
                    subTotalRow.eachCell({ includeEmpty: true }, (cell) => {
                        cell.fill = getFillColor(fillClr);
                        cell.alignment = { vertical: "middle" };
                        cell.border = getCellBorder();
                    });
                }
                const subMetadata = currentData;
                const subMetaColumns = metaColumns.columns;
                setMetaDataRow(subMetadata.columns, subMetaColumns);
            }
        };
        setMetaDataRow(rowDataGroup, rowDataGroupCols);
        const reportRow = worksheet.addRow(rowData);
        setMetaDataSubTotalRow(rowDataGroup, rowDataGroupCols);
        reportRow.height = 20;
        reportRow.eachCell({ includeEmpty: true }, (cell) => {
            if ((rowData.SNo || index) % 2) {
                cell.fill = getFillColor(oddRowFillColor);
            }
            else {
                cell.fill = getFillColor(evenRowFillColor);
            }
            cell.alignment = { vertical: "middle" };
            cell.border = getCellBorder();
        });
        urlKeys.forEach((key) => {
            const urlCell = reportRow.getCell(key);
            urlCell.value = {
                text: rowData[key],
                hyperlink: rowData[key],
            };
            urlCell.font = {
                color: { argb: "0000FF" },
            };
        });
        checkedKeys.forEach((key) => {
            const checkedCell = reportRow.getCell(key);
            if (rowData[key]) {
                checkedCell.font = {
                    name: "Wingdings",
                    vertical: "middle",
                    horizontal: "center",
                };
                checkedCell.value = "ü";
            }
            else {
                checkedCell.font = {
                    vertical: "middle",
                    horizontal: "center",
                };
                checkedCell.value = "-";
            }
            checkedCell.alignment = centerAlign;
        });
    });
    worksheet.addRow([]);
    worksheet.getRow(1).hidden = true;
    return workbook.xlsx.writeBuffer().then((rowData) => {
        const blob = new Blob([rowData], { type: ExportTypes.EXCEL });
        if (!isBlob) {
            FileSaver.saveAs(blob, title.trim().replace(/[^a-zA-Z0-9]/g, "_") + ExportExtentions.EXCEL);
        }
        return blob;
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwb3J0Lm1ldGhvZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL3JlcG9ydC10b29sL21ldGhvZHMvZXhwb3J0Lm1ldGhvZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBQzlCLE9BQU8sU0FBMEIsTUFBTSxpQkFBaUIsQ0FBQztBQUN6RCxPQUFPLEtBQUssS0FBSyxNQUFNLDZCQUE2QixDQUFDO0FBQ3JELE9BQU8sS0FBSyxTQUFTLE1BQU0sWUFBWSxDQUFDO0FBRXhDLE9BQU8sRUFFTCxnQkFBZ0IsRUFDaEIsV0FBVyxHQUlaLE1BQU0sb0JBQW9CLENBQUM7QUFDNUIsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRTdDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUVoRCxNQUFNLFVBQVUsY0FBYyxDQUFDLFdBQWdCO0lBQzdDLE1BQU0sYUFBYSxHQUFHLDRCQUE0QixDQUFDO0lBQ25ELE1BQU0sR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ25DLFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDYixJQUFJLEVBQUUsY0FBYztRQUNwQixLQUFLLEVBQUUsTUFBTTtLQUNkLENBQUMsQ0FBQztJQUVILHlEQUF5RDtJQUN6RCxJQUFJLE9BQU8sR0FBRyxDQUFDLGFBQWEsS0FBSyxVQUFVLEVBQUU7UUFDM0MsR0FBRyxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUNsQztJQUNELGtDQUFrQztJQUNsQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN2QyxDQUFDO0FBRUQsTUFBTSxVQUFVLFNBQVMsQ0FBQyxVQUFzQjtJQUM5QyxNQUFNLEVBQ0osV0FBVyxFQUNYLFFBQVEsRUFDUixPQUFPLEVBQ1AsT0FBTyxFQUNQLFVBQVUsRUFDVixXQUFXLEVBQ1gsWUFBWSxFQUNaLFFBQVEsRUFDUixNQUFNLEVBQ04sWUFBWSxFQUNaLFlBQVksRUFDWixNQUFNLEdBQ1AsR0FBRyxVQUFVLENBQUM7SUFDZixJQUFJLE9BQU8sR0FBRyxZQUFZLENBQUM7SUFDM0IsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDO0lBQ3ZCLE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO0lBQ3pDLE1BQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUN4QyxNQUFNLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN4RSxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbEUsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDM0UsTUFBTSxhQUFhLEdBQUcsNEJBQTRCLENBQUM7SUFDbkQsTUFBTSxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUVuRCxNQUFNLFVBQVUsR0FDZCxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDcEUsTUFBTSxTQUFTLEdBQ2IsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2xFLE1BQU0sT0FBTyxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUM7SUFFOUIsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtRQUNsQixJQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUU7WUFDaEIsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRztnQkFDckIsU0FBUyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFHLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRzthQUNwRCxDQUFDO1NBQ0g7UUFDRCxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssUUFBUSxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO1lBQzlDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQztTQUN2QztJQUNILENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxDQUFDLFNBQVMsR0FBRztRQUNsQixHQUFHLFNBQVM7S0FDYixDQUFDO0lBQ0YsT0FBTyxDQUFDLFVBQVUsR0FBRyxrQkFBa0IsQ0FBQztJQUN4QyxPQUFPLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUUvQixNQUFNLFdBQVcsR0FBRyxDQUFDLE1BQW1CLEVBQUUsRUFBRTtRQUMxQyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQzNCLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUMvQyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztRQUNsQyxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQztRQUM5QixNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDckMsTUFBTSxLQUFLLEdBQVEsTUFBTSxDQUFDLEtBQUssSUFBSSxRQUFRLENBQUM7UUFDNUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLFNBQVMsR0FBRyxFQUFFLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2pELEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDL0IsQ0FBQyxDQUFDO0lBRUYsTUFBTSxRQUFRLEdBQUcsQ0FBQyxPQUFjLEVBQUUsSUFBSSxHQUFHLE9BQU8sRUFBRSxVQUFVLEdBQUcsT0FBTyxFQUFFLEVBQUU7UUFDeEUsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuQixNQUFNLFFBQVEsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMzRSxRQUFRLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUN4QixRQUFRLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztRQUN4QixTQUFTLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3pCLGlEQUFpRDtJQUNuRCxDQUFDLENBQUM7SUFFRixNQUFNLFlBQVksR0FBRyxDQUFDLE9BQWMsRUFBRSxFQUFFO1FBQ3RDLElBQUksVUFBVSxJQUFJLFVBQVUsQ0FBQyxNQUFNLEVBQUU7WUFDbkMsTUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDO1lBQ3hCLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDckIsSUFBSSxHQUFHLENBQUMsUUFBUSxFQUFFO29CQUNoQixZQUFZLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHO3dCQUN4QixTQUFTLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHO3FCQUNwRCxDQUFDO2lCQUNIO2dCQUNELElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxRQUFRLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7b0JBQzlDLFlBQVksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQztpQkFDMUM7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sQ0FBQyxTQUFTLEdBQUcsRUFBRSxHQUFHLFlBQVksRUFBRSxHQUFHLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUM5RCxNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO1lBQzlDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDM0IsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDckIsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUN6QyxNQUFNLFVBQVUsR0FBRztvQkFDakIsR0FBRyxPQUFPO29CQUNWLFVBQVUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNyQixVQUFVLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztpQkFDNUIsQ0FBQztnQkFDRixRQUFRLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUMvQyxDQUFDLENBQUMsQ0FBQztTQUNKO2FBQU07WUFDTCxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDbkI7SUFDSCxDQUFDLENBQUM7SUFFRixNQUFNLGNBQWMsR0FBRyxDQUNyQixRQUFhLEVBQ2IsV0FBZ0IsRUFDaEIsT0FBYyxFQUNkLFFBQVEsR0FBRyxFQUFFLEVBQ2IsRUFBRTtRQUNGLElBQUksUUFBUSxJQUFJLFdBQVcsSUFBSSxXQUFXLENBQUMsS0FBSyxFQUFFO1lBQ2hELE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLFdBQVcsQ0FBQztZQUNoRCxNQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQztZQUN4QyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQztZQUMxRSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDaEQsTUFBTSxVQUFVLEdBQUcsTUFBTSxHQUFHLEdBQUcsR0FBRyxRQUFRLENBQUM7Z0JBQzNDLElBQUksVUFBVSxHQUFHLEVBQUUsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFO29CQUNwQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ2QsT0FBTyxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7aUJBQ3JCO2dCQUNELE1BQU0sSUFBSSxHQUFHO29CQUNYO3dCQUNFLE9BQU8sRUFBRSxVQUFVLENBQUMsSUFBSSxFQUFFO3dCQUMxQixPQUFPLEVBQUUsT0FBTyxDQUFDLE1BQU07d0JBQ3ZCLE1BQU0sRUFBRTs0QkFDTixTQUFTLEVBQUUsVUFBVTs0QkFDckIsTUFBTSxFQUFFLFFBQVE7NEJBQ2hCLFFBQVEsRUFBRSxDQUFDOzRCQUNYLFNBQVMsRUFBRSxNQUFNO3lCQUNsQjtxQkFDRjtpQkFDRixDQUFDO2dCQUNGLE1BQU0sV0FBVyxHQUFHLENBQUMsR0FBRyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3hDLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQzdDLE1BQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUM7Z0JBQ3JDLE1BQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUM7Z0JBQ3pDLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQ2xDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssUUFBUSxJQUFJLENBQUMsQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQ3hELENBQUM7Z0JBQ0YsSUFBSSxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sRUFBRTtvQkFDL0IsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FDakMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUU7d0JBQ2hCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDOzRCQUNuQixDQUFDLFdBQVcsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDdEQsT0FBTyxJQUFJLENBQUM7b0JBQ2QsQ0FBQyxFQUNELEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxDQUN2QixDQUFDO29CQUNGLGFBQWEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7aUJBQ2xDO2dCQUNELGNBQWMsQ0FBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNyRSxDQUFDLENBQUMsQ0FBQztTQUNKO2FBQU07WUFDTCxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxFQUFFLEdBQUcsT0FBTyxDQUFDLENBQUM7WUFDMUMsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRTtnQkFDbEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUU7b0JBQ3pCLElBQUksR0FBRyxPQUFPLENBQUM7aUJBQ2hCO2dCQUNELE9BQU8sSUFBSSxDQUFDO1lBQ2QsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ1AsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDaEQsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQzlELFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUMzQjtTQUNGO0lBQ0gsQ0FBQyxDQUFDO0lBRUYsZUFBZTtJQUNmLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3hCLEdBQUcsQ0FBQyxJQUFJLENBQ04sV0FBVyxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsRUFDckMsT0FBTyxFQUNQLE9BQU8sQ0FBQyxNQUFNLEdBQUcsRUFBRSxFQUNuQixFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FDcEIsQ0FBQztJQUVGLHVCQUF1QjtJQUN2QixPQUFPLEdBQUcsRUFBRSxHQUFHLE9BQU8sRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sR0FBRyxFQUFFLEVBQUUsQ0FBQztJQUN0RCxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3BCLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzFCLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUNwQixJQUFJLFdBQVcsQ0FBQyxRQUFRLEVBQUU7UUFDeEIsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDckM7SUFDRCxJQUFJLFdBQVcsQ0FBQyxRQUFRLElBQUksV0FBVyxDQUFDLEtBQUssRUFBRTtRQUM3QyxRQUFRLENBQUMsSUFBSSxDQUNYLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FDeEQsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFDMUMsRUFBRSxDQUNILENBQUM7S0FDSDtJQUNELElBQUksV0FBVyxDQUFDLE9BQU8sRUFBRTtRQUN2QixRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixXQUFXLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztLQUN4RDtJQUNELEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBRXJFLGVBQWU7SUFDZixPQUFPLEdBQUcsRUFBRSxHQUFHLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3ZFLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3hCLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNoQyxNQUFNLFdBQVcsR0FBRyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO0lBQ3pFLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUV6QixjQUFjO0lBQ2QsT0FBTyxHQUFHLEVBQUUsR0FBRyxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUM7SUFDdkQsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDMUIsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNuQixHQUFHLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDaEMsR0FBRyxDQUFDLElBQUksQ0FDTixDQUFDLEVBQ0QsT0FBTyxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQ3BCLFNBQVMsR0FBRyxFQUFFLEVBQ2QsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFDekMsR0FBRyxDQUNKLENBQUM7SUFDRixJQUFJLFFBQVEsRUFBRTtRQUNaLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7S0FDMUQ7SUFDRCxJQUFJLE1BQU0sRUFBRTtRQUNWLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7S0FDaEU7SUFDRCxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxTQUFTLEdBQUcsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUUxRSxhQUFhO0lBQ2IsT0FBTyxHQUFHLEVBQUUsR0FBRyxPQUFPLEVBQUUsTUFBTSxFQUFFLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUUzRSxjQUFjLENBQUMsWUFBWSxFQUFFLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRXhELHlEQUF5RDtJQUN6RCxJQUFJLE9BQU8sR0FBRyxDQUFDLGFBQWEsS0FBSyxVQUFVLEVBQUU7UUFDM0MsR0FBRyxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUNsQztJQUNELE1BQU0sT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO0lBQ3RFLDRDQUE0QztJQUM1QyxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ1gsU0FBUyxDQUFDLE1BQU0sQ0FDZCxPQUFPLEVBQ1AsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FDMUUsQ0FBQztLQUNIO0lBQ0QsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQztBQUVELE1BQU0sVUFBVSxnQkFBZ0IsQ0FDOUIsR0FBUSxFQUNSLE9BQVksRUFDWixhQUFxQixFQUNyQixPQUFtQjtJQUVuQixNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDL0QsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbEUsTUFBTSxtQkFBbUIsR0FBRyxRQUFRLENBQ2xDLE9BQU8sQ0FBQyxVQUFVLElBQUksU0FBUyxDQUFDLFVBQVUsQ0FDM0MsQ0FBQztJQUNGLE9BQU87UUFDTCxHQUFHLE9BQU87UUFDVixLQUFLLEVBQUUsTUFBTTtRQUNiLFNBQVMsRUFBRSxNQUFNO1FBQ2pCLFlBQVksRUFBRSxPQUFPO1FBQ3JCLFVBQVUsRUFBRTtZQUNWLFFBQVEsRUFBRSxDQUFDO1lBQ1gsV0FBVyxFQUFFLENBQUM7WUFDZCxTQUFTLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztZQUMxQixTQUFTLEVBQUUsR0FBRztZQUNkLE1BQU0sRUFBRSxRQUFRO1lBQ2hCLE1BQU0sRUFBRSxRQUFRO1lBQ2hCLGFBQWEsRUFBRSxDQUFDO1lBQ2hCLEdBQUcsT0FBTyxDQUFDLFVBQVU7U0FDdEI7UUFDRCxVQUFVLEVBQUU7WUFDVixRQUFRLEVBQUUsQ0FBQztZQUNYLFdBQVcsRUFBRSxDQUFDO1lBQ2QsTUFBTSxFQUFFLFFBQVE7WUFDaEIsYUFBYSxFQUFFLENBQUM7WUFDaEIsR0FBRyxPQUFPLENBQUMsVUFBVTtTQUN0QjtRQUNELFlBQVksRUFBRSxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE9BQU8sQ0FBQyxTQUFTLEVBQUU7UUFDeEUsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUU7UUFDdEMsWUFBWSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDckIsUUFBUTtZQUNSLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxNQUFNLEVBQUU7Z0JBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO2dCQUNoRCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQzthQUNqRDtpQkFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3RELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUM7b0JBQ3ZELENBQUMsQ0FBQyxtQkFBbUI7b0JBQ3JCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQzt3QkFDN0MsQ0FBQyxDQUFDLGVBQWU7d0JBQ2pCLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQzthQUN0QjtZQUNELElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssU0FBUyxFQUFFO2dCQUNwRSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNsRCxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxXQUFXLENBQUM7Z0JBQ2hDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQztnQkFDL0IsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDdEM7UUFDSCxDQUFDO1FBRUQsV0FBVyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDcEIsU0FBUztZQUNULElBQUksR0FBRyxHQUFHLE9BQU8sR0FBRyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUMzQyxJQUFJLE9BQU8sR0FBRyxDQUFDLGFBQWEsS0FBSyxVQUFVLEVBQUU7Z0JBQzNDLEdBQUcsR0FBRyxHQUFHLEdBQUcsT0FBTyxhQUFhLEVBQUUsQ0FBQzthQUNwQztZQUNELEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkIsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7WUFDdkMsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLE1BQU07Z0JBQ2hDLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTTtnQkFDakIsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUN6QixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRyxJQUFJLENBQUMsUUFBZ0IsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLFVBQVUsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUN0RSxDQUFDO0tBQ0YsQ0FBQztBQUNKLENBQUM7QUFFRCxNQUFNLENBQUMsS0FBSyxVQUFVLFdBQVcsQ0FBQyxZQUEwQjtJQUMxRCw0QkFBNEI7SUFDNUIsTUFBTSxNQUFNLEdBQVUsWUFBWSxDQUFDLE9BQU8sQ0FBQztJQUMzQyxNQUFNLElBQUksR0FBVSxZQUFZLENBQUMsT0FBTyxDQUFDO0lBQ3pDLE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxXQUFXLENBQUM7SUFDN0MsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQztJQUMzQyxNQUFNLFFBQVEsR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDO0lBQ3ZDLE1BQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUM7SUFDbkMsTUFBTSxZQUFZLEdBQUcsWUFBWSxDQUFDLFlBQVksQ0FBQztJQUMvQyxNQUFNLEtBQUssR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDO0lBQ2pDLE1BQU0sZ0JBQWdCLEdBQUcsWUFBWSxDQUFDLGdCQUFnQixDQUFDO0lBQ3ZELE1BQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUM7SUFDbkMsTUFBTSxPQUFPLEdBQUcsWUFBWSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUM7SUFDM0MsTUFBTSxrQkFBa0IsR0FBRyxPQUFPLENBQUMsTUFBTSxJQUFJLFNBQVMsQ0FBQyxNQUFNLENBQUM7SUFDOUQsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLEdBQUcsSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDO0lBQ3JELE1BQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLElBQUksSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDO0lBQ3hELE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxLQUFLLElBQUksU0FBUyxDQUFDLEtBQUssQ0FBQztJQUN4RCxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxRQUFRLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQztJQUNqRSxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxVQUFVLElBQUksU0FBUyxDQUFDLFVBQVUsQ0FBQztJQUNyRSxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3pFLE1BQU0sV0FBVyxHQUFHLE1BQU07U0FDdkIsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQztTQUNuQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUVyQixNQUFNLElBQUksR0FBRztRQUNYLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRztRQUNwQixHQUFHLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRztLQUNuQyxDQUFDO0lBRUYsTUFBTSxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFdEMsTUFBTSxXQUFXLEdBQUcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsQ0FBQztJQUNqRSxNQUFNLGFBQWEsR0FBRztRQUNwQixHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRTtRQUNqRCxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRTtRQUNsRCxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRTtRQUNwRCxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRTtLQUNwRCxDQUFDO0lBRUYsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNqRSxTQUFTLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUUzQixNQUFNLFlBQVksR0FBRyxDQUFDLEtBQWEsRUFBRSxFQUFFO1FBQ3JDLE9BQU87WUFDTCxJQUFJLEVBQUUsU0FBUztZQUNmLE9BQU8sRUFBRSxPQUFPO1lBQ2hCLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUU7WUFDeEIsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRTtTQUN6QixDQUFDO0lBQ0osQ0FBQyxDQUFDO0lBRUYsTUFBTSxhQUFhLEdBQUcsQ0FBQyxRQUFhLGFBQWEsRUFBRSxFQUFFO1FBQ25ELE9BQU87WUFDTCxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUc7WUFDZCxNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU07WUFDcEIsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO1lBQ2hCLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSztTQUNuQixDQUFDO0lBQ0osQ0FBQyxDQUFDO0lBRUYsTUFBTSxVQUFVLEdBQUcsQ0FBQyxHQUFRLEVBQUUsS0FBVSxFQUFFLEVBQUU7UUFDMUMsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEMsS0FBSyxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUM7UUFDOUIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUNuQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlCLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbEMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDMUQsQ0FBQyxDQUFDO0lBRUYsSUFBSSxXQUFXLEVBQUU7UUFDZixNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDM0UsUUFBUSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDdkIsTUFBTSxVQUFVLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDO1FBQ3RELFVBQVUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFakMsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQzNELFVBQVUsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLE1BQU0sWUFBWSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFDNUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztLQUN0QztJQUVELE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzlDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ3hCLE1BQU0sYUFBYSxHQUFHO1FBQ3BCLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRTtRQUM5QixJQUFJLEVBQUUsWUFBWSxDQUFDLFFBQVEsQ0FBQztLQUM3QixDQUFDO0lBQ0YsVUFBVSxDQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUV2QyxnRkFBZ0Y7SUFDaEYsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FDakMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNsQixJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDWCxPQUFPLFFBQVEsQ0FBQztTQUNqQjthQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNsQixPQUFPLE1BQU0sQ0FBQztTQUNmO2FBQU0sSUFBSSxDQUFDLEtBQUssTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDbEMsT0FBTyxVQUFVLENBQUM7U0FDbkI7YUFBTTtZQUNMLE9BQU8sRUFBRSxDQUFDO1NBQ1g7SUFDSCxDQUFDLENBQUMsQ0FDSCxDQUFDO0lBQ0YsVUFBVSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7SUFDMUIsTUFBTSxZQUFZLEdBQUc7UUFDbkIsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRTtRQUNsQixTQUFTLEVBQUUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUU7UUFDNUQsSUFBSSxFQUFFLFlBQVksQ0FBQyxRQUFRLENBQUM7S0FDN0IsQ0FBQztJQUNGLE1BQU0sYUFBYSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3JELE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RELGFBQWEsQ0FBQyxJQUFJLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUM7SUFDbEMsYUFBYSxDQUFDLFNBQVMsR0FBRyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxDQUFDO0lBQ3JFLGFBQWEsQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzVDLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxhQUFhLENBQUMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQ3hFLE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RELE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQ2xDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FDdEQsQ0FBQztJQUNGLFdBQVcsQ0FBQyxJQUFJLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUM7SUFDaEMsV0FBVyxDQUFDLFNBQVMsR0FBRyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxDQUFDO0lBQ3JFLFdBQVcsQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxXQUFXLENBQUMsT0FBTyxJQUFJLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQ3BFLE1BQU0sZUFBZSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQ3hDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FDdEQsQ0FBQztJQUNGLE1BQU0sYUFBYSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25ELGVBQWUsQ0FBQyxJQUFJLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUM7SUFDcEMsZUFBZSxDQUFDLFNBQVMsR0FBRyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxDQUFDO0lBQ3hFLGVBQWUsQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzlDLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxlQUFlLENBQUMsT0FBTyxJQUFJLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQzVFLGdEQUFnRDtJQUNoRCxpQ0FBaUM7SUFDakMsaURBQWlEO0lBQ2pELHdDQUF3QztJQUN4QyxNQUFNO0lBQ04sNENBQTRDO0lBQzVDLDJEQUEyRDtJQUMzRCx3Q0FBd0M7SUFFeEMsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNoRSxTQUFTLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUN0QixNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDakUsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFDO0lBQ2xFLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUNsRCxJQUFJLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUM7UUFDN0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxhQUFhLEVBQUUsQ0FBQztJQUNoQyxDQUFDLENBQUMsQ0FBQztJQUVILElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDOUIsTUFBTSxjQUFjLEdBQUcsQ0FBQyxRQUFhLEVBQUUsV0FBZ0IsRUFBRSxFQUFFO1lBQ3pELElBQUksUUFBUSxJQUFJLFdBQVcsSUFBSSxXQUFXLENBQUMsS0FBSyxFQUFFO2dCQUNoRCxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDO2dCQUNoQyxNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO2dCQUNuQyxNQUFNLFNBQVMsR0FBYSxXQUFXLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQztnQkFDckQsTUFBTSxPQUFPLEdBQ1gsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUM7Z0JBQzVELE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUU7b0JBQ3JELElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTt3QkFDaEIsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO3FCQUM3Qzt5QkFBTTt3QkFDTCxJQUFJLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztxQkFDekM7b0JBQ0QsT0FBTyxJQUFJLENBQUM7Z0JBQ2QsQ0FBQyxFQUFFLEVBQVMsQ0FBQyxDQUFDO2dCQUNkLElBQUksV0FBVyxDQUFDLEtBQUssS0FBSyxLQUFLLEVBQUU7b0JBQy9CLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3BFLFFBQVEsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO29CQUNyQixNQUFNLFVBQVUsR0FBRzt3QkFDakIsSUFBSSxFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUM7d0JBQzNCLE1BQU0sRUFBRSxhQUFhLEVBQUU7cUJBQ3hCLENBQUM7b0JBQ0YsVUFBVSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztpQkFDbEM7Z0JBQ0QsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDO2dCQUNoQyxNQUFNLGNBQWMsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDO2dCQUMzQyxjQUFjLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQzthQUNyRDtRQUNILENBQUMsQ0FBQztRQUNGLE1BQU0sc0JBQXNCLEdBQUcsQ0FBQyxRQUFhLEVBQUUsV0FBZ0IsRUFBRSxFQUFFO1lBQ2pFLElBQUksUUFBUSxJQUFJLFdBQVcsSUFBSSxXQUFXLENBQUMsS0FBSyxFQUFFO2dCQUNoRCxNQUFNLFNBQVMsR0FBYSxXQUFXLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQztnQkFDckQsTUFBTSxPQUFPLEdBQUcsaUJBQWlCLENBQUM7Z0JBQ2xDLE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUU7b0JBQ3JELElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTt3QkFDaEIsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO3FCQUM3Qzt5QkFBTTt3QkFDTCxJQUFJLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztxQkFDekM7b0JBQ0QsT0FBTyxJQUFJLENBQUM7Z0JBQ2QsQ0FBQyxFQUFFLEVBQVMsQ0FBQyxDQUFDO2dCQUNkLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxLQUFLLEVBQUU7b0JBQ2hELE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUU7d0JBQ25ELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO3dCQUM1RCxPQUFPLElBQUksQ0FBQztvQkFDZCxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsWUFBWSxDQUFDLENBQUM7b0JBQzFDLE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQ25ELFdBQVcsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO29CQUN4QixXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7d0JBQ3BELElBQUksQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUNsQyxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDO3dCQUN4QyxJQUFJLENBQUMsTUFBTSxHQUFHLGFBQWEsRUFBRSxDQUFDO29CQUNoQyxDQUFDLENBQUMsQ0FBQztpQkFDSjtnQkFDRCxNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUM7Z0JBQ2hDLE1BQU0sY0FBYyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUM7Z0JBQzNDLGNBQWMsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO2FBQ3JEO1FBQ0gsQ0FBQyxDQUFDO1FBQ0YsY0FBYyxDQUFDLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQy9DLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDNUMsc0JBQXNCLENBQUMsWUFBWSxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDdkQsU0FBUyxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDdEIsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFO1lBQ2xELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDOUIsSUFBSSxDQUFDLElBQUksR0FBRyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDM0M7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLElBQUksR0FBRyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzthQUM1QztZQUNELElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUM7WUFDeEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxhQUFhLEVBQUUsQ0FBQztRQUNoQyxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUN0QixNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZDLE9BQU8sQ0FBQyxLQUFLLEdBQUc7Z0JBQ2QsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUM7Z0JBQ2xCLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDO2FBQ3hCLENBQUM7WUFDRixPQUFPLENBQUMsSUFBSSxHQUFHO2dCQUNiLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7YUFDMUIsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBQ0gsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQzFCLE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0MsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2hCLFdBQVcsQ0FBQyxJQUFJLEdBQUc7b0JBQ2pCLElBQUksRUFBRSxXQUFXO29CQUNqQixRQUFRLEVBQUUsUUFBUTtvQkFDbEIsVUFBVSxFQUFFLFFBQVE7aUJBQ3JCLENBQUM7Z0JBQ0YsV0FBVyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7YUFDekI7aUJBQU07Z0JBQ0wsV0FBVyxDQUFDLElBQUksR0FBRztvQkFDakIsUUFBUSxFQUFFLFFBQVE7b0JBQ2xCLFVBQVUsRUFBRSxRQUFRO2lCQUNyQixDQUFDO2dCQUNGLFdBQVcsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDO2FBQ3pCO1lBQ0QsV0FBVyxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUM7UUFDdEMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUNILFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFckIsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBRWxDLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtRQUNsRCxNQUFNLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzlELElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDWCxTQUFTLENBQUMsTUFBTSxDQUNkLElBQUksRUFDSixLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxLQUFLLENBQ3BFLENBQUM7U0FDSDtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsganNQREYgfSBmcm9tIFwianNwZGZcIjtcclxuaW1wb3J0IGF1dG9UYWJsZSwgeyBVc2VyT3B0aW9ucyB9IGZyb20gXCJqc3BkZi1hdXRvdGFibGVcIjtcclxuaW1wb3J0ICogYXMgRXhjZWwgZnJvbSBcImV4Y2VsanMvZGlzdC9leGNlbGpzLm1pbi5qc1wiO1xyXG5pbXBvcnQgKiBhcyBGaWxlU2F2ZXIgZnJvbSBcImZpbGUtc2F2ZXJcIjtcclxuXHJcbmltcG9ydCB7XHJcbiAgRXhjZWxPcHRpb25zLFxyXG4gIEV4cG9ydEV4dGVudGlvbnMsXHJcbiAgRXhwb3J0VHlwZXMsXHJcbiAgUERGRmlsbFRleHQsXHJcbiAgUGRmT3B0aW9ucyxcclxuICBJUmVwb3J0Um93LFxyXG59IGZyb20gXCJyZXBvcnQtdG9vbC9tb2RlbHNcIjtcclxuaW1wb3J0IHsgZmlsbENvbG9yIH0gZnJvbSBcInJlcG9ydC10b29sL2NvcmVcIjtcclxuXHJcbmltcG9ydCB7IGhleFRvUmdiIH0gZnJvbSBcIi4vdHlwZS1jaGFuZ2UubWV0aG9kXCI7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZXhwb3J0UGRmVGFibGUob3JpZW50YXRpb246IGFueSk6IHZvaWQge1xyXG4gIGNvbnN0IHRvdGFsUGFnZXNFeHAgPSBcInt0b3RhbF9wYWdlc19jb3VudF9zdHJpbmd9XCI7XHJcbiAgY29uc3QgZG9jID0gbmV3IGpzUERGKG9yaWVudGF0aW9uKTtcclxuICBhdXRvVGFibGUoZG9jLCB7XHJcbiAgICBodG1sOiBcIiNleHBvcnRUYWJsZVwiLFxyXG4gICAgdGhlbWU6IFwiZ3JpZFwiLFxyXG4gIH0pO1xyXG5cclxuICAvLyBUb3RhbCBwYWdlIG51bWJlciBwbHVnaW4gb25seSBhdmFpbGFibGUgaW4ganNwZGYgdjEuMCtcclxuICBpZiAodHlwZW9mIGRvYy5wdXRUb3RhbFBhZ2VzID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgIGRvYy5wdXRUb3RhbFBhZ2VzKHRvdGFsUGFnZXNFeHApO1xyXG4gIH1cclxuICAvLyBkb2Mub3V0cHV0KFwiZGF0YXVybG5ld3dpbmRvd1wiKTtcclxuICBkb2Muc2F2ZShgUmVwb3J0cyR7RGF0ZS5ub3coKX0ucGRmYCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBleHBvcnRQZGYocGRmT3B0aW9uczogUGRmT3B0aW9ucyk6IEJsb2Ige1xyXG4gIGNvbnN0IHtcclxuICAgIG9yaWVudGF0aW9uLFxyXG4gICAgcGFnZVNpemUsXHJcbiAgICByb3dEYXRhLFxyXG4gICAgY29sdW1ucyxcclxuICAgIHN1YkNvbHVtbnMsXHJcbiAgICByZXBvcnRUaXRsZSxcclxuICAgIHJlcXVlc3RUaXRsZSxcclxuICAgIEZyb21EYXRlLFxyXG4gICAgVG9EYXRlLFxyXG4gICAgdGFibGVPcHRpb25zLFxyXG4gICAgcm93RGF0YUdyb3VwLFxyXG4gICAgaXNCbG9iLFxyXG4gIH0gPSBwZGZPcHRpb25zO1xyXG4gIGxldCBvcHRpb25zID0gdGFibGVPcHRpb25zO1xyXG4gIGNvbnN0IG1ldGFSZXBvcnRzID0gW107XHJcbiAgY29uc3QgYmdDb2xvciA9IHBkZk9wdGlvbnMuYmdDb2xvciB8fCB7fTtcclxuICBjb25zdCByb3dEYXRhR3JvdXBDb2xzID0gb3B0aW9ucy5GaWVsZHM7XHJcbiAgY29uc3QgaGVhZGVyUm93RmlsbENvbG9yID0gaGV4VG9SZ2IoYmdDb2xvci5oZWFkZXIgfHwgZmlsbENvbG9yLmhlYWRlcik7XHJcbiAgY29uc3QgZ3JvdXBGaWxsQ29sb3IgPSBoZXhUb1JnYihiZ0NvbG9yLmdyb3VwIHx8IGZpbGxDb2xvci5ncm91cCk7XHJcbiAgY29uc3Qgc3ViR3JvdXBGaWxsQ29sb3IgPSBoZXhUb1JnYihiZ0NvbG9yLnN1Ymdyb3VwIHx8IGZpbGxDb2xvci5zdWJncm91cCk7XHJcbiAgY29uc3QgdG90YWxQYWdlc0V4cCA9IFwie3RvdGFsX3BhZ2VzX2NvdW50X3N0cmluZ31cIjtcclxuICBjb25zdCBkb2MgPSBuZXcganNQREYob3JpZW50YXRpb24sIG51bGwsIHBhZ2VTaXplKTtcclxuXHJcbiAgY29uc3QgcGFnZUhlaWdodCA9XHJcbiAgICBkb2MuaW50ZXJuYWwucGFnZVNpemUuaGVpZ2h0IHx8IGRvYy5pbnRlcm5hbC5wYWdlU2l6ZS5nZXRIZWlnaHQoKTtcclxuICBjb25zdCBwYWdlV2lkdGggPVxyXG4gICAgZG9jLmludGVybmFsLnBhZ2VTaXplLndpZHRoIHx8IGRvYy5pbnRlcm5hbC5wYWdlU2l6ZS5nZXRXaWR0aCgpO1xyXG4gIGNvbnN0IHhPZmZzZXQgPSBwYWdlV2lkdGggLyAyO1xyXG5cclxuICBjb25zdCBjb2xTdHlsZXMgPSB7fTtcclxuICBjb2x1bW5zLm1hcCgoY29sKSA9PiB7XHJcbiAgICBpZiAoY29sLlBkZldpZHRoKSB7XHJcbiAgICAgIGNvbFN0eWxlc1tjb2wuZmllbGRdID0ge1xyXG4gICAgICAgIGNlbGxXaWR0aDogKCtjb2wuUGRmV2lkdGggKiAocGFnZVdpZHRoIC0gMTYpKSAvIDEwMCxcclxuICAgICAgfTtcclxuICAgIH1cclxuICAgIGlmIChjb2wudHlwZSA9PT0gXCJudW1iZXJcIiB8fCBjb2wudHlwZSA9PT0gXCJpZFwiKSB7XHJcbiAgICAgIGNvbFN0eWxlc1tjb2wuZmllbGRdLmhhbGlnbiA9IFwicmlnaHRcIjtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgb3B0aW9ucy5jb2xTdHlsZXMgPSB7XHJcbiAgICAuLi5jb2xTdHlsZXMsXHJcbiAgfTtcclxuICBvcHRpb25zLmhGaWxsQ29sb3IgPSBoZWFkZXJSb3dGaWxsQ29sb3I7XHJcbiAgb3B0aW9ucy5oVGV4dENvbG9yID0gWzAsIDAsIDBdO1xyXG5cclxuICBjb25zdCBzZXRGaWxsVGV4dCA9IChvcHRpb246IFBERkZpbGxUZXh0KSA9PiB7XHJcbiAgICBjb25zdCB2YWx1ZSA9IG9wdGlvbi52YWx1ZTtcclxuICAgIGNvbnN0IGhTdGFydCA9IG9wdGlvbi5oU3RhcnQgfHwgb3B0aW9ucy5zdGFydFk7XHJcbiAgICBjb25zdCBoZWlnaHQgPSBvcHRpb24uaGVpZ2h0IHx8IDg7XHJcbiAgICBjb25zdCB4ID0gb3B0aW9uLnggfHwgeE9mZnNldDtcclxuICAgIGNvbnN0IHkgPSBvcHRpb24ueSB8fCBvcHRpb25zLnN0YXJ0WTtcclxuICAgIGNvbnN0IGFsaWduOiBhbnkgPSBvcHRpb24uYWxpZ24gfHwgXCJjZW50ZXJcIjtcclxuICAgIGRvYy5yZWN0KDcsIGhTdGFydCwgcGFnZVdpZHRoIC0gMTQsIGhlaWdodCwgXCJGXCIpO1xyXG4gICAgZG9jLnRleHQodmFsdWUsIHgsIHksIGFsaWduKTtcclxuICB9O1xyXG5cclxuICBjb25zdCBhZGRUYWJsZSA9IChyZXBvcnRzOiBhbnlbXSwgY29scyA9IGNvbHVtbnMsIHRibE9wdGlvbnMgPSBvcHRpb25zKSA9PiB7XHJcbiAgICBkb2Muc2V0Rm9udFNpemUoNik7XHJcbiAgICBjb25zdCBhdE9wdGlvbiA9IGF1dG9UYWJsZU9wdGlvbnMoZG9jLCB0YmxPcHRpb25zLCB0b3RhbFBhZ2VzRXhwLCBiZ0NvbG9yKTtcclxuICAgIGF0T3B0aW9uLmNvbHVtbnMgPSBjb2xzO1xyXG4gICAgYXRPcHRpb24uYm9keSA9IHJlcG9ydHM7XHJcbiAgICBhdXRvVGFibGUoZG9jLCBhdE9wdGlvbik7XHJcbiAgICAvLyBvcHRpb25zLnN0YXJ0WSA9IGRvYy5wcmV2aW91c0F1dG9UYWJsZS5maW5hbFk7XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgYWRkQXV0b1RhYmxlID0gKHJlcG9ydHM6IGFueVtdKSA9PiB7XHJcbiAgICBpZiAoc3ViQ29sdW1ucyAmJiBzdWJDb2x1bW5zLmxlbmd0aCkge1xyXG4gICAgICBjb25zdCBzdWJDb2xTdHlsZXMgPSB7fTtcclxuICAgICAgc3ViQ29sdW1ucy5tYXAoKGNvbCkgPT4ge1xyXG4gICAgICAgIGlmIChjb2wuUGRmV2lkdGgpIHtcclxuICAgICAgICAgIHN1YkNvbFN0eWxlc1tjb2wuZmllbGRdID0ge1xyXG4gICAgICAgICAgICBjZWxsV2lkdGg6ICgrY29sLlBkZldpZHRoICogKHBhZ2VXaWR0aCAtIDE2KSkgLyAxMDAsXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY29sLnR5cGUgPT09IFwibnVtYmVyXCIgfHwgY29sLnR5cGUgPT09IFwiaWRcIikge1xyXG4gICAgICAgICAgc3ViQ29sU3R5bGVzW2NvbC5maWVsZF0uaGFsaWduID0gXCJyaWdodFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIG9wdGlvbnMuY29sU3R5bGVzID0geyAuLi5zdWJDb2xTdHlsZXMsIC4uLm9wdGlvbnMuY29sU3R5bGVzIH07XHJcbiAgICAgIGNvbnN0IHBhcmVudEZpZWxkID0gc3ViQ29sdW1uc1swXS5wYXJlbnRGaWVsZDtcclxuICAgICAgcmVwb3J0cy5mb3JFYWNoKChncm91cFJvdykgPT4ge1xyXG4gICAgICAgIGFkZFRhYmxlKFtncm91cFJvd10pO1xyXG4gICAgICAgIGNvbnN0IHJlcG9ydFJvd3MgPSBncm91cFJvd1twYXJlbnRGaWVsZF07XHJcbiAgICAgICAgY29uc3QgdGJsT3B0aW9ucyA9IHtcclxuICAgICAgICAgIC4uLm9wdGlvbnMsXHJcbiAgICAgICAgICBoRmlsbENvbG9yOiBbMCwgMCwgMF0sXHJcbiAgICAgICAgICBoVGV4dENvbG9yOiBbMjU1LCAyNTUsIDI1NV0sXHJcbiAgICAgICAgfTtcclxuICAgICAgICBhZGRUYWJsZShyZXBvcnRSb3dzLCBzdWJDb2x1bW5zLCB0YmxPcHRpb25zKTtcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBhZGRUYWJsZShyZXBvcnRzKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBjb25zdCBzZXRNZXRhRGF0YVJvdyA9IChcclxuICAgIG1ldGFkYXRhOiBhbnksXHJcbiAgICBtZXRhQ29sdW1uczogYW55LFxyXG4gICAgcmVwb3J0czogYW55W10sXHJcbiAgICBtZXRhUm93cyA9IFtdXHJcbiAgKSA9PiB7XHJcbiAgICBpZiAobWV0YWRhdGEgJiYgbWV0YUNvbHVtbnMgJiYgbWV0YUNvbHVtbnMuZmllbGQpIHtcclxuICAgICAgY29uc3QgeyBmaWVsZCwgaGVhZGVyLCBzdWJUb3RhbCB9ID0gbWV0YUNvbHVtbnM7XHJcbiAgICAgIGNvbnN0IGZpZWxkcyA9IG1ldGFDb2x1bW5zLmZpZWxkcyB8fCBbXTtcclxuICAgICAgY29uc3QgZmlsbGNvbG9ycyA9IGZpZWxkcy5sZW5ndGggPiAxID8gc3ViR3JvdXBGaWxsQ29sb3IgOiBncm91cEZpbGxDb2xvcjtcclxuICAgICAgT2JqZWN0LmtleXMobWV0YWRhdGEpLmZvckVhY2goKGdyb3VwQ29sLCBpbmRleCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGdyb3VwVGl0bGUgPSBoZWFkZXIgKyBcIiBcIiArIGdyb3VwQ29sO1xyXG4gICAgICAgIGlmIChwYWdlSGVpZ2h0IC0gMjAgPCBvcHRpb25zLnN0YXJ0WSkge1xyXG4gICAgICAgICAgZG9jLmFkZFBhZ2UoKTtcclxuICAgICAgICAgIG9wdGlvbnMuc3RhcnRZID0gMTA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnRlbnQ6IGdyb3VwVGl0bGUudHJpbSgpLFxyXG4gICAgICAgICAgICBjb2xTcGFuOiBjb2x1bW5zLmxlbmd0aCxcclxuICAgICAgICAgICAgc3R5bGVzOiB7XHJcbiAgICAgICAgICAgICAgZmlsbENvbG9yOiBmaWxsY29sb3JzLFxyXG4gICAgICAgICAgICAgIGhhbGlnbjogXCJjZW50ZXJcIixcclxuICAgICAgICAgICAgICBmb250U2l6ZTogOSxcclxuICAgICAgICAgICAgICBmb250U3R5bGU6IFwiYm9sZFwiLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICBdO1xyXG4gICAgICAgIGNvbnN0IHN1Yk1ldGFSb3dzID0gWy4uLm1ldGFSb3dzLCBkYXRhXTtcclxuICAgICAgICBjb25zdCBzdWJNZXRhZGF0YSA9IG1ldGFkYXRhW2dyb3VwQ29sXSB8fCB7fTtcclxuICAgICAgICBjb25zdCBzdWJHcm91cCA9IHN1Yk1ldGFkYXRhLmNvbHVtbnM7XHJcbiAgICAgICAgY29uc3Qgc3ViR3JvdXBDb2xzID0gbWV0YUNvbHVtbnMuY29sdW1ucztcclxuICAgICAgICBjb25zdCBmaWx0ZXJSZXBvcnRzID0gcmVwb3J0cy5maWx0ZXIoXHJcbiAgICAgICAgICAoZikgPT4gZltmaWVsZF0gPT09IGdyb3VwQ29sIHx8ICEoZ3JvdXBDb2wgJiYgZltmaWVsZF0pXHJcbiAgICAgICAgKTtcclxuICAgICAgICBpZiAoc3ViVG90YWwgJiYgc3ViVG90YWwubGVuZ3RoKSB7XHJcbiAgICAgICAgICBjb25zdCBzdWJUb3RhbERhdGEgPSBjb2x1bW5zLnJlZHVjZShcclxuICAgICAgICAgICAgKGluaXQsIGN1cnJlbnQpID0+IHtcclxuICAgICAgICAgICAgICBpbml0W2N1cnJlbnQuZGF0YUtleV0gPVxyXG4gICAgICAgICAgICAgICAgKHN1Yk1ldGFkYXRhLnN1YlRvdGFsIHx8IHt9KVtjdXJyZW50LmRhdGFLZXldIHx8IFwiXCI7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGluaXQ7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHsgaXNHcm91cFRvdGFsOiB0cnVlIH1cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBmaWx0ZXJSZXBvcnRzLnB1c2goc3ViVG90YWxEYXRhKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2V0TWV0YURhdGFSb3coc3ViR3JvdXAsIHN1Ykdyb3VwQ29scywgZmlsdGVyUmVwb3J0cywgc3ViTWV0YVJvd3MpO1xyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG1ldGFSZXBvcnRzLnB1c2goLi4ubWV0YVJvd3MsIC4uLnJlcG9ydHMpO1xyXG4gICAgICBjb25zdCByZXBvcnRMYXN0ID0gcmVwb3J0cy5yZWR1Y2UoKGluaXQsIGN1cnJlbnQpID0+IHtcclxuICAgICAgICBpZiAoIWN1cnJlbnQuaXNHcm91cFRvdGFsKSB7XHJcbiAgICAgICAgICBpbml0ID0gY3VycmVudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGluaXQ7XHJcbiAgICAgIH0sIHt9KTtcclxuICAgICAgY29uc3Qgcm93RGF0YUxhc3QgPSByb3dEYXRhW3Jvd0RhdGEubGVuZ3RoIC0gMV07XHJcbiAgICAgIGlmIChKU09OLnN0cmluZ2lmeShyZXBvcnRMYXN0KSA9PT0gSlNPTi5zdHJpbmdpZnkocm93RGF0YUxhc3QpKSB7XHJcbiAgICAgICAgYWRkQXV0b1RhYmxlKG1ldGFSZXBvcnRzKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8vIENvbXBhbnkgTmFtZVxyXG4gIGRvYy5zZXRGb250KFwiXCIsIFwiYm9sZFwiKTtcclxuICBkb2MudGV4dChcclxuICAgIHJlcG9ydFRpdGxlLkNvbXBhbnlOYW1lLnRvVXBwZXJDYXNlKCksXHJcbiAgICB4T2Zmc2V0LFxyXG4gICAgb3B0aW9ucy5zdGFydFkgKyAxNSxcclxuICAgIHsgYWxpZ246IFwiY2VudGVyXCIgfVxyXG4gICk7XHJcblxyXG4gIC8vIEFkZHJlc3MgYW5kIFBob25lIE5vXHJcbiAgb3B0aW9ucyA9IHsgLi4ub3B0aW9ucywgc3RhcnRZOiBvcHRpb25zLnN0YXJ0WSArIDI1IH07XHJcbiAgZG9jLnNldEZvbnRTaXplKDEwKTtcclxuICBkb2Muc2V0Rm9udChcIlwiLCBcIm5vcm1hbFwiKTtcclxuICBjb25zdCBzdWJUaXRsZSA9IFtdO1xyXG4gIGlmIChyZXBvcnRUaXRsZS5BZGRyZXNzMSkge1xyXG4gICAgc3ViVGl0bGUucHVzaChyZXBvcnRUaXRsZS5BZGRyZXNzMSk7XHJcbiAgfVxyXG4gIGlmIChyZXBvcnRUaXRsZS5EaXN0cmljdCB8fCByZXBvcnRUaXRsZS5TdGF0ZSkge1xyXG4gICAgc3ViVGl0bGUucHVzaChcclxuICAgICAgYCR7cmVwb3J0VGl0bGUuRGlzdHJpY3QgPyByZXBvcnRUaXRsZS5EaXN0cmljdCArIFwiLCBcIiA6IFwiXCJ9JHtcclxuICAgICAgICByZXBvcnRUaXRsZS5TdGF0ZSA/IHJlcG9ydFRpdGxlLlN0YXRlIDogXCJcIlxyXG4gICAgICB9YFxyXG4gICAgKTtcclxuICB9XHJcbiAgaWYgKHJlcG9ydFRpdGxlLlBob25lTm8pIHtcclxuICAgIHN1YlRpdGxlLnB1c2goYFRlbGVwaG9uZSBObyA6ICR7cmVwb3J0VGl0bGUuUGhvbmVOb31gKTtcclxuICB9XHJcbiAgZG9jLnRleHQoc3ViVGl0bGUsIHhPZmZzZXQsIG9wdGlvbnMuc3RhcnRZIC0gMywgeyBhbGlnbjogXCJjZW50ZXJcIiB9KTtcclxuXHJcbiAgLy8gUmVwb3J0IFRpdGxlXHJcbiAgb3B0aW9ucyA9IHsgLi4ub3B0aW9ucywgc3RhcnRZOiBzdWJUaXRsZS5sZW5ndGggKiA1ICsgb3B0aW9ucy5zdGFydFkgfTtcclxuICBkb2Muc2V0Rm9udChcIlwiLCBcImJvbGRcIik7XHJcbiAgZG9jLnNldEZpbGxDb2xvcigyNTUsIDIyMSwgMjA0KTtcclxuICBjb25zdCB0aXRsZU9wdGlvbiA9IHsgdmFsdWU6IG9wdGlvbnMudGl0bGUsIGhTdGFydDogb3B0aW9ucy5zdGFydFkgLSA1IH07XHJcbiAgc2V0RmlsbFRleHQodGl0bGVPcHRpb24pO1xyXG5cclxuICAvLyBSZXBvcnQgRGF0ZVxyXG4gIG9wdGlvbnMgPSB7IC4uLm9wdGlvbnMsIHN0YXJ0WTogb3B0aW9ucy5zdGFydFkgKyA3LjUgfTtcclxuICBkb2Muc2V0Rm9udChcIlwiLCBcIm5vcm1hbFwiKTtcclxuICBkb2Muc2V0Rm9udFNpemUoOSk7XHJcbiAgZG9jLnNldEZpbGxDb2xvcigyMzAsIDI0MiwgMjU1KTtcclxuICBkb2MucmVjdChcclxuICAgIDcsXHJcbiAgICBvcHRpb25zLnN0YXJ0WSAtIDQuNSxcclxuICAgIHBhZ2VXaWR0aCAtIDE0LFxyXG4gICAgTWF0aC5yb3VuZChyZXF1ZXN0VGl0bGUubGVuZ3RoIC8gMikgKiA3LjUsXHJcbiAgICBcIkZcIlxyXG4gICk7XHJcbiAgaWYgKEZyb21EYXRlKSB7XHJcbiAgICBkb2MudGV4dChGcm9tRGF0ZSwgOCwgb3B0aW9ucy5zdGFydFksIHsgYWxpZ246IFwibGVmdFwiIH0pO1xyXG4gIH1cclxuICBpZiAoVG9EYXRlKSB7XHJcbiAgICBkb2MudGV4dChUb0RhdGUsIHhPZmZzZXQsIG9wdGlvbnMuc3RhcnRZLCB7IGFsaWduOiBcImNlbnRlclwiIH0pO1xyXG4gIH1cclxuICBkb2MudGV4dChyZXF1ZXN0VGl0bGUsIHBhZ2VXaWR0aCAtIDgsIG9wdGlvbnMuc3RhcnRZLCB7IGFsaWduOiBcInJpZ2h0XCIgfSk7XHJcblxyXG4gIC8vIEF1dG8gVGFibGVcclxuICBvcHRpb25zID0geyAuLi5vcHRpb25zLCBzdGFydFk6IHJlcXVlc3RUaXRsZS5sZW5ndGggKiA1ICsgb3B0aW9ucy5zdGFydFkgfTtcclxuXHJcbiAgc2V0TWV0YURhdGFSb3cocm93RGF0YUdyb3VwLCByb3dEYXRhR3JvdXBDb2xzLCByb3dEYXRhKTtcclxuXHJcbiAgLy8gVG90YWwgcGFnZSBudW1iZXIgcGx1Z2luIG9ubHkgYXZhaWxhYmxlIGluIGpzcGRmIHYxLjArXHJcbiAgaWYgKHR5cGVvZiBkb2MucHV0VG90YWxQYWdlcyA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICBkb2MucHV0VG90YWxQYWdlcyh0b3RhbFBhZ2VzRXhwKTtcclxuICB9XHJcbiAgY29uc3QgYmxvYlBERiA9IG5ldyBCbG9iKFtkb2Mub3V0cHV0KCldLCB7IHR5cGU6IFwiYXBwbGljYXRpb24vcGRmXCIgfSk7XHJcbiAgLy8gZmlsZVNhdmVyLnNhdmVBcyhibG9iUERGLCBvcHRpb25zLnRpdGxlKTtcclxuICBpZiAoIWlzQmxvYikge1xyXG4gICAgRmlsZVNhdmVyLnNhdmVBcyhcclxuICAgICAgYmxvYlBERixcclxuICAgICAgb3B0aW9ucy50aXRsZS50cmltKCkucmVwbGFjZSgvW15hLXpBLVowLTldL2csIFwiX1wiKSArIEV4cG9ydEV4dGVudGlvbnMuUERGXHJcbiAgICApO1xyXG4gIH1cclxuICByZXR1cm4gYmxvYlBERjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGF1dG9UYWJsZU9wdGlvbnMoXHJcbiAgZG9jOiBhbnksXHJcbiAgb3B0aW9uczogYW55LFxyXG4gIHRvdGFsUGFnZXNFeHA6IHN0cmluZyxcclxuICBiZ0NvbG9yOiBJUmVwb3J0Um93XHJcbik6IFVzZXJPcHRpb25zIHtcclxuICBjb25zdCBvZGRSb3dGaWxsQ29sb3IgPSBoZXhUb1JnYihiZ0NvbG9yLm9kZCB8fCBmaWxsQ29sb3Iub2RkKTtcclxuICBjb25zdCBldmVuUm93RmlsbENvbG9yID0gaGV4VG9SZ2IoYmdDb2xvci5ldmVuIHx8IGZpbGxDb2xvci5ldmVuKTtcclxuICBjb25zdCBncm91cFRvdGFsRmlsbENvbG9yID0gaGV4VG9SZ2IoXHJcbiAgICBiZ0NvbG9yLmdyb3VwVG90YWwgfHwgZmlsbENvbG9yLmdyb3VwVG90YWxcclxuICApO1xyXG4gIHJldHVybiB7XHJcbiAgICAuLi5vcHRpb25zLFxyXG4gICAgdGhlbWU6IFwiZ3JpZFwiLFxyXG4gICAgcGFnZUJyZWFrOiBcImF1dG9cIixcclxuICAgIHJvd1BhZ2VCcmVhazogXCJhdm9pZFwiLFxyXG4gICAgaGVhZFN0eWxlczoge1xyXG4gICAgICBmb250U2l6ZTogNyxcclxuICAgICAgY2VsbFBhZGRpbmc6IDEsXHJcbiAgICAgIGxpbmVDb2xvcjogWzIwMCwgMjAwLCAyMDBdLFxyXG4gICAgICBsaW5lV2lkdGg6IDAuMSxcclxuICAgICAgdmFsaWduOiBcIm1pZGRsZVwiLFxyXG4gICAgICBoYWxpZ246IFwiY2VudGVyXCIsXHJcbiAgICAgIG1pbkNlbGxIZWlnaHQ6IDcsXHJcbiAgICAgIC4uLm9wdGlvbnMuaGVhZFN0eWxlcyxcclxuICAgIH0sXHJcbiAgICBib2R5U3R5bGVzOiB7XHJcbiAgICAgIGZvbnRTaXplOiA3LFxyXG4gICAgICBjZWxsUGFkZGluZzogMSxcclxuICAgICAgdmFsaWduOiBcIm1pZGRsZVwiLFxyXG4gICAgICBtaW5DZWxsSGVpZ2h0OiA3LFxyXG4gICAgICAuLi5vcHRpb25zLmJvZHlTdHlsZXMsXHJcbiAgICB9LFxyXG4gICAgY29sdW1uU3R5bGVzOiB7IGxpbmVDb2xvcjogMTAwLCB2YWxpZ246IFwibWlkZGxlXCIsIC4uLm9wdGlvbnMuY29sU3R5bGVzIH0sXHJcbiAgICBtYXJnaW46IHsgdG9wOiAxMCwgbGVmdDogNywgcmlnaHQ6IDcgfSxcclxuICAgIGRpZFBhcnNlQ2VsbDogKGRhdGEpID0+IHtcclxuICAgICAgLy8gZGF0YS5cclxuICAgICAgaWYgKGRhdGEuc2VjdGlvbiA9PT0gXCJoZWFkXCIpIHtcclxuICAgICAgICBkYXRhLmNlbGwuc3R5bGVzLmZpbGxDb2xvciA9IG9wdGlvbnMuaEZpbGxDb2xvcjtcclxuICAgICAgICBkYXRhLmNlbGwuc3R5bGVzLnRleHRDb2xvciA9IG9wdGlvbnMuaFRleHRDb2xvcjtcclxuICAgICAgfSBlbHNlIGlmIChkYXRhLnNlY3Rpb24gPT09IFwiYm9keVwiICYmICFkYXRhLnJvdy5yYXdbMF0pIHtcclxuICAgICAgICBkYXRhLmNlbGwuc3R5bGVzLmZpbGxDb2xvciA9IGRhdGEucm93LnJhd1tcImlzR3JvdXBUb3RhbFwiXVxyXG4gICAgICAgICAgPyBncm91cFRvdGFsRmlsbENvbG9yXHJcbiAgICAgICAgICA6IChkYXRhLnJvdy5yYXdbXCJTTm9cIl0gfHwgZGF0YS5yb3cuaW5kZXgpICUgMlxyXG4gICAgICAgICAgPyBvZGRSb3dGaWxsQ29sb3JcclxuICAgICAgICAgIDogZXZlblJvd0ZpbGxDb2xvcjtcclxuICAgICAgfVxyXG4gICAgICBpZiAoZGF0YS5zZWN0aW9uID09PSBcImJvZHlcIiAmJiBkYXRhLmNvbHVtbi5yYXdbXCJ0eXBlXCJdID09PSBcImNoZWNrZWRcIikge1xyXG4gICAgICAgIGNvbnN0IGNlbGxzID0gZGF0YS5yb3cuY2VsbHNbZGF0YS5jb2x1bW4uZGF0YUtleV07XHJcbiAgICAgICAgY2VsbHMuc3R5bGVzLmZvbnQgPSBcIldpbmdkaW5nc1wiO1xyXG4gICAgICAgIGNlbGxzLnN0eWxlcy5oYWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgICAgIGNlbGxzLnRleHQgPSBbY2VsbHMucmF3ID8gXCIxXCIgOiBcIi1cIl07XHJcbiAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgZGlkRHJhd1BhZ2U6IChkYXRhKSA9PiB7XHJcbiAgICAgIC8vIEZvb3RlclxyXG4gICAgICBsZXQgc3RyID0gXCJQYWdlIFwiICsgZG9jLmdldE51bWJlck9mUGFnZXMoKTtcclxuICAgICAgaWYgKHR5cGVvZiBkb2MucHV0VG90YWxQYWdlcyA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgc3RyID0gYCR7c3RyfSBvZiAke3RvdGFsUGFnZXNFeHB9YDtcclxuICAgICAgfVxyXG4gICAgICBkb2Muc2V0Rm9udFNpemUoNyk7XHJcbiAgICAgIGNvbnN0IHBhZ2VTaXplID0gZG9jLmludGVybmFsLnBhZ2VTaXplO1xyXG4gICAgICBjb25zdCBwYWdlSGVpZ2h0ID0gcGFnZVNpemUuaGVpZ2h0XHJcbiAgICAgICAgPyBwYWdlU2l6ZS5oZWlnaHRcclxuICAgICAgICA6IHBhZ2VTaXplLmdldEhlaWdodCgpO1xyXG4gICAgICBkb2MudGV4dChzdHIsIChkYXRhLnNldHRpbmdzIGFzIGFueSkubWFyZ2luLnJpZ2h0LCBwYWdlSGVpZ2h0IC0gMTApO1xyXG4gICAgfSxcclxuICB9O1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhwb3J0RXhjZWwoZXhjZWxPcHRpb25zOiBFeGNlbE9wdGlvbnMpOiBQcm9taXNlPEJsb2I+IHtcclxuICAvLyBFeGNlbCBUaXRsZSwgSGVhZGVyLCBEYXRhXHJcbiAgY29uc3QgaGVhZGVyOiBhbnlbXSA9IGV4Y2VsT3B0aW9ucy5jb2x1bW5zO1xyXG4gIGNvbnN0IGRhdGE6IGFueVtdID0gZXhjZWxPcHRpb25zLnJlcG9ydHM7XHJcbiAgY29uc3QgcmVwb3J0VGl0bGUgPSBleGNlbE9wdGlvbnMucmVwb3J0VGl0bGU7XHJcbiAgY29uc3QgcmVwb3J0RGF0ZSA9IGV4Y2VsT3B0aW9ucy5yZXBvcnREYXRlO1xyXG4gIGNvbnN0IEZyb21EYXRlID0gZXhjZWxPcHRpb25zLkZyb21EYXRlO1xyXG4gIGNvbnN0IFRvRGF0ZSA9IGV4Y2VsT3B0aW9ucy5Ub0RhdGU7XHJcbiAgY29uc3Qgcm93RGF0YUdyb3VwID0gZXhjZWxPcHRpb25zLnJvd0RhdGFHcm91cDtcclxuICBjb25zdCB0aXRsZSA9IGV4Y2VsT3B0aW9ucy50aXRsZTtcclxuICBjb25zdCByb3dEYXRhR3JvdXBDb2xzID0gZXhjZWxPcHRpb25zLnJvd0RhdGFHcm91cENvbHM7XHJcbiAgY29uc3QgaXNCbG9iID0gZXhjZWxPcHRpb25zLmlzQmxvYjtcclxuICBjb25zdCBiZ0NvbG9yID0gZXhjZWxPcHRpb25zLmJnQ29sb3IgfHwge307XHJcbiAgY29uc3QgaGVhZGVyUm93RmlsbENvbG9yID0gYmdDb2xvci5oZWFkZXIgfHwgZmlsbENvbG9yLmhlYWRlcjtcclxuICBjb25zdCBvZGRSb3dGaWxsQ29sb3IgPSBiZ0NvbG9yLm9kZCB8fCBmaWxsQ29sb3Iub2RkO1xyXG4gIGNvbnN0IGV2ZW5Sb3dGaWxsQ29sb3IgPSBiZ0NvbG9yLmV2ZW4gfHwgZmlsbENvbG9yLmV2ZW47XHJcbiAgY29uc3QgZ3JvdXBGaWxsQ29sb3IgPSBiZ0NvbG9yLmdyb3VwIHx8IGZpbGxDb2xvci5ncm91cDtcclxuICBjb25zdCBzdWJHcm91cEZpbGxDb2xvciA9IGJnQ29sb3Iuc3ViZ3JvdXAgfHwgZmlsbENvbG9yLnN1Ymdyb3VwO1xyXG4gIGNvbnN0IHN1YlRvdGFsRmlsbENvbG9yID0gYmdDb2xvci5ncm91cFRvdGFsIHx8IGZpbGxDb2xvci5ncm91cFRvdGFsO1xyXG4gIGNvbnN0IHVybEtleXMgPSBoZWFkZXIuZmlsdGVyKChmKSA9PiBmLnR5cGUgPT09IFwidXJsXCIpLm1hcCgobSkgPT4gbS5rZXkpO1xyXG4gIGNvbnN0IGNoZWNrZWRLZXlzID0gaGVhZGVyXHJcbiAgICAuZmlsdGVyKChmKSA9PiBmLnR5cGUgPT09IFwiY2hlY2tlZFwiKVxyXG4gICAgLm1hcCgobSkgPT4gbS5rZXkpO1xyXG5cclxuICBjb25zdCBrZXlzID0ge1xyXG4gICAgc3RhcnQ6IGhlYWRlclswXS5rZXksXHJcbiAgICBlbmQ6IGhlYWRlcltoZWFkZXIubGVuZ3RoIC0gMV0ua2V5LFxyXG4gIH07XHJcblxyXG4gIGNvbnN0IHdvcmtib29rID0gbmV3IEV4Y2VsLldvcmtib29rKCk7XHJcblxyXG4gIGNvbnN0IGNlbnRlckFsaWduID0geyB2ZXJ0aWNhbDogXCJtaWRkbGVcIiwgaG9yaXpvbnRhbDogXCJjZW50ZXJcIiB9O1xyXG4gIGNvbnN0IGRlZmF1bHRCb3JkZXIgPSB7XHJcbiAgICB0b3A6IHsgc3R5bGU6IFwidGhpblwiLCBjb2xvcjogeyBhcmdiOiBcIkFBQUFBQVwiIH0gfSxcclxuICAgIGxlZnQ6IHsgc3R5bGU6IFwidGhpblwiLCBjb2xvcjogeyBhcmdiOiBcIkFBQUFBQVwiIH0gfSxcclxuICAgIGJvdHRvbTogeyBzdHlsZTogXCJ0aGluXCIsIGNvbG9yOiB7IGFyZ2I6IFwiQUFBQUFBXCIgfSB9LFxyXG4gICAgcmlnaHQ6IHsgc3R5bGU6IFwidGhpblwiLCBjb2xvcjogeyBhcmdiOiBcIkFBQUFBQVwiIH0gfSxcclxuICB9O1xyXG5cclxuICBjb25zdCB3b3Jrc2hlZXQgPSB3b3JrYm9vay5hZGRXb3Jrc2hlZXQoXCJTaGVldDFcIiwgeyB2aWV3czogW10gfSk7XHJcbiAgd29ya3NoZWV0LmNvbHVtbnMgPSBoZWFkZXI7XHJcblxyXG4gIGNvbnN0IGdldEZpbGxDb2xvciA9IChjb2xvcjogc3RyaW5nKSA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0eXBlOiBcInBhdHRlcm5cIixcclxuICAgICAgcGF0dGVybjogXCJzb2xpZFwiLFxyXG4gICAgICBmZ0NvbG9yOiB7IGFyZ2I6IGNvbG9yIH0sXHJcbiAgICAgIGJnQ29sb3I6IHsgYXJnYjogY29sb3IgfSxcclxuICAgIH07XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgZ2V0Q2VsbEJvcmRlciA9IChzdHlsZTogYW55ID0gZGVmYXVsdEJvcmRlcikgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdG9wOiBzdHlsZS50b3AsXHJcbiAgICAgIGJvdHRvbTogc3R5bGUuYm90dG9tLFxyXG4gICAgICBsZWZ0OiBzdHlsZS5sZWZ0LFxyXG4gICAgICByaWdodDogc3R5bGUucmlnaHQsXHJcbiAgICB9O1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IG1lcmdlQ2VsbHMgPSAocm93OiBhbnksIHN0eWxlOiBhbnkpID0+IHtcclxuICAgIGNvbnN0IHN0YXJ0ID0gcm93LmdldENlbGwoa2V5cy5zdGFydCk7XHJcbiAgICBzdGFydC5hbGlnbm1lbnQgPSBjZW50ZXJBbGlnbjtcclxuICAgIE9iamVjdC5rZXlzKHN0eWxlKS5mb3JFYWNoKChmaWVsZCkgPT4ge1xyXG4gICAgICBzdGFydFtmaWVsZF0gPSBzdHlsZVtmaWVsZF07XHJcbiAgICB9KTtcclxuICAgIGNvbnN0IGVuZCA9IHJvdy5nZXRDZWxsKGtleXMuZW5kKTtcclxuICAgIHdvcmtzaGVldC5tZXJnZUNlbGxzKGAke3N0YXJ0LmFkZHJlc3N9OiR7ZW5kLmFkZHJlc3N9YCk7XHJcbiAgfTtcclxuXHJcbiAgaWYgKHJlcG9ydFRpdGxlKSB7XHJcbiAgICBjb25zdCB0aXRsZVJvdyA9IHdvcmtzaGVldC5hZGRSb3coW3JlcG9ydFRpdGxlLkNvbXBhbnlOYW1lLnRvVXBwZXJDYXNlKCldKTtcclxuICAgIHRpdGxlUm93LmhlaWdodCA9IDI3LjU7XHJcbiAgICBjb25zdCB0aXRsZVN0eWxlID0geyBmb250OiB7IHNpemU6IDE2LCBib2xkOiB0cnVlIH0gfTtcclxuICAgIG1lcmdlQ2VsbHModGl0bGVSb3csIHRpdGxlU3R5bGUpO1xyXG5cclxuICAgIGNvbnN0IGFkZHJlc3NSb3cgPSB3b3Jrc2hlZXQuYWRkUm93KFtyZXBvcnRUaXRsZS5BZGRyZXNzXSk7XHJcbiAgICBhZGRyZXNzUm93LmhlaWdodCA9IDI1O1xyXG4gICAgY29uc3QgYWRkcmVzc1N0eWxlID0geyBmb250OiB7IHNpemU6IDE0IH0gfTtcclxuICAgIG1lcmdlQ2VsbHMoYWRkcmVzc1JvdywgYWRkcmVzc1N0eWxlKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHN1YnRpdGxlUm93ID0gd29ya3NoZWV0LmFkZFJvdyhbdGl0bGVdKTtcclxuICBzdWJ0aXRsZVJvdy5oZWlnaHQgPSAyNTtcclxuICBjb25zdCBzdWJ0aXRsZVN0eWxlID0ge1xyXG4gICAgZm9udDogeyBzaXplOiAxNCwgYm9sZDogdHJ1ZSB9LFxyXG4gICAgZmlsbDogZ2V0RmlsbENvbG9yKFwiRkZERENDXCIpLFxyXG4gIH07XHJcbiAgbWVyZ2VDZWxscyhzdWJ0aXRsZVJvdywgc3VidGl0bGVTdHlsZSk7XHJcblxyXG4gIC8vIGNvbnN0IHJlcXVlc3RSb3cgPSB3b3Jrc2hlZXQuYWRkUm93KFtgJHtGcm9tRGF0ZX0gJHtUb0RhdGV9ICR7cmVwb3J0RGF0ZX1gXSk7XHJcbiAgY29uc3QgcmVxdWVzdFJvdyA9IHdvcmtzaGVldC5hZGRSb3coXHJcbiAgICBoZWFkZXIubWFwKChtLCBpKSA9PiB7XHJcbiAgICAgIGlmIChpID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIEZyb21EYXRlO1xyXG4gICAgICB9IGVsc2UgaWYgKGkgPT09IDIpIHtcclxuICAgICAgICByZXR1cm4gVG9EYXRlO1xyXG4gICAgICB9IGVsc2UgaWYgKGkgPT09IGhlYWRlci5sZW5ndGggLSAyKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlcG9ydERhdGU7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIFwiXCI7XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgKTtcclxuICByZXF1ZXN0Um93LmhlaWdodCA9IDIxLjI1O1xyXG4gIGNvbnN0IHJlcXVlc3RTdHlsZSA9IHtcclxuICAgIGZvbnQ6IHsgc2l6ZTogMTIgfSxcclxuICAgIGFsaWdubWVudDogeyB2ZXJ0aWNhbDogXCJtaWRkbGVcIiwgaG9yaXpvbnRhbDogXCJkaXN0cmlidXRlZFwiIH0sXHJcbiAgICBmaWxsOiBnZXRGaWxsQ29sb3IoXCJFNkYyRkZcIiksXHJcbiAgfTtcclxuICBjb25zdCBmcm9tRGF0ZVN0YXJ0ID0gcmVxdWVzdFJvdy5nZXRDZWxsKGtleXMuc3RhcnQpO1xyXG4gIGNvbnN0IGZyb21EYXRlRW5kID0gcmVxdWVzdFJvdy5nZXRDZWxsKGhlYWRlclsxXS5rZXkpO1xyXG4gIGZyb21EYXRlU3RhcnQuZm9udCA9IHsgc2l6ZTogMTIgfTtcclxuICBmcm9tRGF0ZVN0YXJ0LmFsaWdubWVudCA9IHsgdmVydGljYWw6IFwibWlkZGxlXCIsIGhvcml6b250YWw6IFwibGVmdFwiIH07XHJcbiAgZnJvbURhdGVTdGFydC5maWxsID0gZ2V0RmlsbENvbG9yKFwiRTZGMkZGXCIpO1xyXG4gIHdvcmtzaGVldC5tZXJnZUNlbGxzKGAke2Zyb21EYXRlU3RhcnQuYWRkcmVzc306JHtmcm9tRGF0ZUVuZC5hZGRyZXNzfWApO1xyXG4gIGNvbnN0IHRvRGF0ZVN0YXJ0ID0gcmVxdWVzdFJvdy5nZXRDZWxsKGhlYWRlclsyXS5rZXkpO1xyXG4gIGNvbnN0IHRvRGF0ZUVuZCA9IHJlcXVlc3RSb3cuZ2V0Q2VsbChcclxuICAgIGhlYWRlcltoZWFkZXIubGVuZ3RoID4gNCA/IGhlYWRlci5sZW5ndGggLSAzIDogMl0ua2V5XHJcbiAgKTtcclxuICB0b0RhdGVTdGFydC5mb250ID0geyBzaXplOiAxMiB9O1xyXG4gIHRvRGF0ZVN0YXJ0LmFsaWdubWVudCA9IHsgdmVydGljYWw6IFwibWlkZGxlXCIsIGhvcml6b250YWw6IFwiY2VudGVyXCIgfTtcclxuICB0b0RhdGVTdGFydC5maWxsID0gZ2V0RmlsbENvbG9yKFwiRTZGMkZGXCIpO1xyXG4gIHdvcmtzaGVldC5tZXJnZUNlbGxzKGAke3RvRGF0ZVN0YXJ0LmFkZHJlc3N9OiR7dG9EYXRlRW5kLmFkZHJlc3N9YCk7XHJcbiAgY29uc3QgcmVwb3J0RGF0ZVN0YXJ0ID0gcmVxdWVzdFJvdy5nZXRDZWxsKFxyXG4gICAgaGVhZGVyW2hlYWRlci5sZW5ndGggPiA0ID8gaGVhZGVyLmxlbmd0aCAtIDIgOiAzXS5rZXlcclxuICApO1xyXG4gIGNvbnN0IHJlcG9ydERhdGVFbmQgPSByZXF1ZXN0Um93LmdldENlbGwoa2V5cy5lbmQpO1xyXG4gIHJlcG9ydERhdGVTdGFydC5mb250ID0geyBzaXplOiAxMiB9O1xyXG4gIHJlcG9ydERhdGVTdGFydC5hbGlnbm1lbnQgPSB7IHZlcnRpY2FsOiBcIm1pZGRsZVwiLCBob3Jpem9udGFsOiBcInJpZ2h0XCIgfTtcclxuICByZXBvcnREYXRlU3RhcnQuZmlsbCA9IGdldEZpbGxDb2xvcihcIkU2RjJGRlwiKTtcclxuICB3b3Jrc2hlZXQubWVyZ2VDZWxscyhgJHtyZXBvcnREYXRlU3RhcnQuYWRkcmVzc306JHtyZXBvcnREYXRlRW5kLmFkZHJlc3N9YCk7XHJcbiAgLy8gY29uc3Qgc3RhcnQgPSByZXF1ZXN0Um93LmdldENlbGwoa2V5cy5zdGFydCk7XHJcbiAgLy8gc3RhcnQuYWxpZ25tZW50ID0gY2VudGVyQWxpZ247XHJcbiAgLy8gT2JqZWN0LmtleXMocmVxdWVzdFN0eWxlKS5mb3JFYWNoKChmaWVsZCkgPT4ge1xyXG4gIC8vICAgc3RhcnRbZmllbGRdID0gcmVxdWVzdFN0eWxlW2ZpZWxkXTtcclxuICAvLyB9KTtcclxuICAvLyBjb25zdCBlbmQgPSByZXF1ZXN0Um93LmdldENlbGwoa2V5cy5lbmQpO1xyXG4gIC8vIHdvcmtzaGVldC5tZXJnZUNlbGxzKGAke3N0YXJ0LmFkZHJlc3N9OiR7ZW5kLmFkZHJlc3N9YCk7XHJcbiAgLy8gbWVyZ2VDZWxscyhyZXF1ZXN0Um93LCByZXF1ZXN0U3R5bGUpO1xyXG5cclxuICBjb25zdCBoZWFkZXJSb3cgPSB3b3Jrc2hlZXQuYWRkUm93KGhlYWRlci5tYXAoKG0pID0+IG0uaGVhZGVyKSk7XHJcbiAgaGVhZGVyUm93LmhlaWdodCA9IDIwO1xyXG4gIGNvbnN0IGhlYWRlclJvd0luZGV4ID0gTnVtYmVyKGhlYWRlclJvdy5nZXRDZWxsKGtleXMuc3RhcnQpLnJvdyk7XHJcbiAgd29ya3NoZWV0LnZpZXdzLnB1c2goeyBzdGF0ZTogXCJmcm96ZW5cIiwgeVNwbGl0OiBoZWFkZXJSb3dJbmRleCB9KTtcclxuICBoZWFkZXJSb3cuZWFjaENlbGwoeyBpbmNsdWRlRW1wdHk6IHRydWUgfSwgKGNlbGwpID0+IHtcclxuICAgIGNlbGwuZmlsbCA9IGdldEZpbGxDb2xvcihoZWFkZXJSb3dGaWxsQ29sb3IpO1xyXG4gICAgY2VsbC5mb250ID0geyBib2xkOiB0cnVlIH07XHJcbiAgICBjZWxsLmFsaWdubWVudCA9IGNlbnRlckFsaWduO1xyXG4gICAgY2VsbC5ib3JkZXIgPSBnZXRDZWxsQm9yZGVyKCk7XHJcbiAgfSk7XHJcblxyXG4gIGRhdGEuZm9yRWFjaCgocm93RGF0YSwgaW5kZXgpID0+IHtcclxuICAgIGNvbnN0IHNldE1ldGFEYXRhUm93ID0gKG1ldGFkYXRhOiBhbnksIG1ldGFDb2x1bW5zOiBhbnkpID0+IHtcclxuICAgICAgaWYgKG1ldGFkYXRhICYmIG1ldGFDb2x1bW5zICYmIG1ldGFDb2x1bW5zLmZpZWxkKSB7XHJcbiAgICAgICAgY29uc3QgZmllbGQgPSBtZXRhQ29sdW1ucy5maWVsZDtcclxuICAgICAgICBjb25zdCBnSGVhZGVyID0gbWV0YUNvbHVtbnMuaGVhZGVyO1xyXG4gICAgICAgIGNvbnN0IGZpbGVkTGlzdDogc3RyaW5nW10gPSBtZXRhQ29sdW1ucy5maWVsZHMgfHwgW107XHJcbiAgICAgICAgY29uc3QgZmlsbENsciA9XHJcbiAgICAgICAgICBmaWxlZExpc3QubGVuZ3RoID4gMSA/IHN1Ykdyb3VwRmlsbENvbG9yIDogZ3JvdXBGaWxsQ29sb3I7XHJcbiAgICAgICAgY29uc3QgY3VycmVudERhdGEgPSBmaWxlZExpc3QucmVkdWNlKChpbml0LCBjdXJyZW50KSA9PiB7XHJcbiAgICAgICAgICBpZiAoaW5pdC5jb2x1bW5zKSB7XHJcbiAgICAgICAgICAgIGluaXQgPSBpbml0LmNvbHVtbnNbcm93RGF0YVtjdXJyZW50XV0gfHwge307XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpbml0ID0gbWV0YWRhdGFbcm93RGF0YVtjdXJyZW50XV0gfHwge307XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gaW5pdDtcclxuICAgICAgICB9LCB7fSBhcyBhbnkpO1xyXG4gICAgICAgIGlmIChjdXJyZW50RGF0YS5pbmRleCA9PT0gaW5kZXgpIHtcclxuICAgICAgICAgIGNvbnN0IGdyb3VwUm93ID0gd29ya3NoZWV0LmFkZFJvdyhbZ0hlYWRlciArIFwiIFwiICsgcm93RGF0YVtmaWVsZF1dKTtcclxuICAgICAgICAgIGdyb3VwUm93LmhlaWdodCA9IDIwO1xyXG4gICAgICAgICAgY29uc3QgZ3JvdXBTdHlsZSA9IHtcclxuICAgICAgICAgICAgZmlsbDogZ2V0RmlsbENvbG9yKGZpbGxDbHIpLFxyXG4gICAgICAgICAgICBib3JkZXI6IGdldENlbGxCb3JkZXIoKSxcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICBtZXJnZUNlbGxzKGdyb3VwUm93LCBncm91cFN0eWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgc3ViTWV0YWRhdGEgPSBjdXJyZW50RGF0YTtcclxuICAgICAgICBjb25zdCBzdWJNZXRhQ29sdW1ucyA9IG1ldGFDb2x1bW5zLmNvbHVtbnM7XHJcbiAgICAgICAgc2V0TWV0YURhdGFSb3coc3ViTWV0YWRhdGEuY29sdW1ucywgc3ViTWV0YUNvbHVtbnMpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgY29uc3Qgc2V0TWV0YURhdGFTdWJUb3RhbFJvdyA9IChtZXRhZGF0YTogYW55LCBtZXRhQ29sdW1uczogYW55KSA9PiB7XHJcbiAgICAgIGlmIChtZXRhZGF0YSAmJiBtZXRhQ29sdW1ucyAmJiBtZXRhQ29sdW1ucy5maWVsZCkge1xyXG4gICAgICAgIGNvbnN0IGZpbGVkTGlzdDogc3RyaW5nW10gPSBtZXRhQ29sdW1ucy5maWVsZHMgfHwgW107XHJcbiAgICAgICAgY29uc3QgZmlsbENsciA9IHN1YlRvdGFsRmlsbENvbG9yO1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnREYXRhID0gZmlsZWRMaXN0LnJlZHVjZSgoaW5pdCwgY3VycmVudCkgPT4ge1xyXG4gICAgICAgICAgaWYgKGluaXQuY29sdW1ucykge1xyXG4gICAgICAgICAgICBpbml0ID0gaW5pdC5jb2x1bW5zW3Jvd0RhdGFbY3VycmVudF1dIHx8IHt9O1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaW5pdCA9IG1ldGFkYXRhW3Jvd0RhdGFbY3VycmVudF1dIHx8IHt9O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIGluaXQ7XHJcbiAgICAgICAgfSwge30gYXMgYW55KTtcclxuICAgICAgICBpZiAoKGN1cnJlbnREYXRhLnN1YlRvdGFsIHx8IHt9KS5pbmRleCA9PT0gaW5kZXgpIHtcclxuICAgICAgICAgIGNvbnN0IHN1YnRvdGFsRGF0YSA9IGhlYWRlci5yZWR1Y2UoKGluaXQsIGN1cnJlbnQpID0+IHtcclxuICAgICAgICAgICAgaW5pdFtjdXJyZW50LmtleV0gPSBjdXJyZW50RGF0YS5zdWJUb3RhbFtjdXJyZW50LmtleV0gfHwgXCJcIjtcclxuICAgICAgICAgICAgcmV0dXJuIGluaXQ7XHJcbiAgICAgICAgICB9LCB7fSk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcInN1YnRvdGFsRGF0YVwiLCBzdWJ0b3RhbERhdGEpO1xyXG4gICAgICAgICAgY29uc3Qgc3ViVG90YWxSb3cgPSB3b3Jrc2hlZXQuYWRkUm93KHN1YnRvdGFsRGF0YSk7XHJcbiAgICAgICAgICBzdWJUb3RhbFJvdy5oZWlnaHQgPSAyMDtcclxuICAgICAgICAgIHN1YlRvdGFsUm93LmVhY2hDZWxsKHsgaW5jbHVkZUVtcHR5OiB0cnVlIH0sIChjZWxsKSA9PiB7XHJcbiAgICAgICAgICAgIGNlbGwuZmlsbCA9IGdldEZpbGxDb2xvcihmaWxsQ2xyKTtcclxuICAgICAgICAgICAgY2VsbC5hbGlnbm1lbnQgPSB7IHZlcnRpY2FsOiBcIm1pZGRsZVwiIH07XHJcbiAgICAgICAgICAgIGNlbGwuYm9yZGVyID0gZ2V0Q2VsbEJvcmRlcigpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHN1Yk1ldGFkYXRhID0gY3VycmVudERhdGE7XHJcbiAgICAgICAgY29uc3Qgc3ViTWV0YUNvbHVtbnMgPSBtZXRhQ29sdW1ucy5jb2x1bW5zO1xyXG4gICAgICAgIHNldE1ldGFEYXRhUm93KHN1Yk1ldGFkYXRhLmNvbHVtbnMsIHN1Yk1ldGFDb2x1bW5zKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIHNldE1ldGFEYXRhUm93KHJvd0RhdGFHcm91cCwgcm93RGF0YUdyb3VwQ29scyk7XHJcbiAgICBjb25zdCByZXBvcnRSb3cgPSB3b3Jrc2hlZXQuYWRkUm93KHJvd0RhdGEpO1xyXG4gICAgc2V0TWV0YURhdGFTdWJUb3RhbFJvdyhyb3dEYXRhR3JvdXAsIHJvd0RhdGFHcm91cENvbHMpO1xyXG4gICAgcmVwb3J0Um93LmhlaWdodCA9IDIwO1xyXG4gICAgcmVwb3J0Um93LmVhY2hDZWxsKHsgaW5jbHVkZUVtcHR5OiB0cnVlIH0sIChjZWxsKSA9PiB7XHJcbiAgICAgIGlmICgocm93RGF0YS5TTm8gfHwgaW5kZXgpICUgMikge1xyXG4gICAgICAgIGNlbGwuZmlsbCA9IGdldEZpbGxDb2xvcihvZGRSb3dGaWxsQ29sb3IpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNlbGwuZmlsbCA9IGdldEZpbGxDb2xvcihldmVuUm93RmlsbENvbG9yKTtcclxuICAgICAgfVxyXG4gICAgICBjZWxsLmFsaWdubWVudCA9IHsgdmVydGljYWw6IFwibWlkZGxlXCIgfTtcclxuICAgICAgY2VsbC5ib3JkZXIgPSBnZXRDZWxsQm9yZGVyKCk7XHJcbiAgICB9KTtcclxuICAgIHVybEtleXMuZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgIGNvbnN0IHVybENlbGwgPSByZXBvcnRSb3cuZ2V0Q2VsbChrZXkpO1xyXG4gICAgICB1cmxDZWxsLnZhbHVlID0ge1xyXG4gICAgICAgIHRleHQ6IHJvd0RhdGFba2V5XSxcclxuICAgICAgICBoeXBlcmxpbms6IHJvd0RhdGFba2V5XSxcclxuICAgICAgfTtcclxuICAgICAgdXJsQ2VsbC5mb250ID0ge1xyXG4gICAgICAgIGNvbG9yOiB7IGFyZ2I6IFwiMDAwMEZGXCIgfSxcclxuICAgICAgfTtcclxuICAgIH0pO1xyXG4gICAgY2hlY2tlZEtleXMuZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgIGNvbnN0IGNoZWNrZWRDZWxsID0gcmVwb3J0Um93LmdldENlbGwoa2V5KTtcclxuICAgICAgaWYgKHJvd0RhdGFba2V5XSkge1xyXG4gICAgICAgIGNoZWNrZWRDZWxsLmZvbnQgPSB7XHJcbiAgICAgICAgICBuYW1lOiBcIldpbmdkaW5nc1wiLFxyXG4gICAgICAgICAgdmVydGljYWw6IFwibWlkZGxlXCIsXHJcbiAgICAgICAgICBob3Jpem9udGFsOiBcImNlbnRlclwiLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY2hlY2tlZENlbGwudmFsdWUgPSBcIsO8XCI7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY2hlY2tlZENlbGwuZm9udCA9IHtcclxuICAgICAgICAgIHZlcnRpY2FsOiBcIm1pZGRsZVwiLFxyXG4gICAgICAgICAgaG9yaXpvbnRhbDogXCJjZW50ZXJcIixcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNoZWNrZWRDZWxsLnZhbHVlID0gXCItXCI7XHJcbiAgICAgIH1cclxuICAgICAgY2hlY2tlZENlbGwuYWxpZ25tZW50ID0gY2VudGVyQWxpZ247XHJcbiAgICB9KTtcclxuICB9KTtcclxuICB3b3Jrc2hlZXQuYWRkUm93KFtdKTtcclxuXHJcbiAgd29ya3NoZWV0LmdldFJvdygxKS5oaWRkZW4gPSB0cnVlO1xyXG5cclxuICByZXR1cm4gd29ya2Jvb2sueGxzeC53cml0ZUJ1ZmZlcigpLnRoZW4oKHJvd0RhdGEpID0+IHtcclxuICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbcm93RGF0YV0sIHsgdHlwZTogRXhwb3J0VHlwZXMuRVhDRUwgfSk7XHJcbiAgICBpZiAoIWlzQmxvYikge1xyXG4gICAgICBGaWxlU2F2ZXIuc2F2ZUFzKFxyXG4gICAgICAgIGJsb2IsXHJcbiAgICAgICAgdGl0bGUudHJpbSgpLnJlcGxhY2UoL1teYS16QS1aMC05XS9nLCBcIl9cIikgKyBFeHBvcnRFeHRlbnRpb25zLkVYQ0VMXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYmxvYjtcclxuICB9KTtcclxufVxyXG4iXX0=