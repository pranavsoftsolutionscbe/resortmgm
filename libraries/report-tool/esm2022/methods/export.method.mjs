import { jsPDF } from "jspdf";
import { applyPlugin } from "jspdf-autotable";
import autoTable from "jspdf-autotable";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver";
import { ExportExtentions, ExportTypes, } from "report-tool/models";
import { fillColor } from "report-tool/core";
import { hexToRgb } from "./type-change.method";
applyPlugin(jsPDF);
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
        autoTable.default(doc, atOption);
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
        saveAs(blobPDF, options.title.trim().replace(/[^a-zA-Z0-9]/g, "_") + ExportExtentions.PDF);
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
    const workbook = new Workbook();
    const centerAlign = {
        vertical: "middle",
        horizontal: "center",
    };
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
                };
                checkedCell.value = "ü";
            }
            else {
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
            saveAs(blob, title.trim().replace(/[^a-zA-Z0-9]/g, "_") + ExportExtentions.EXCEL);
        }
        return blob;
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwb3J0Lm1ldGhvZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL3JlcG9ydC10b29sL21ldGhvZHMvZXhwb3J0Lm1ldGhvZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBQzlCLE9BQU8sRUFBRSxXQUFXLEVBQWUsTUFBTSxpQkFBaUIsQ0FBQztBQUMzRCxPQUFPLFNBQVMsTUFBTSxpQkFBaUIsQ0FBQztBQUN4QyxPQUFPLEVBQW1CLFFBQVEsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUNwRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRXBDLE9BQU8sRUFFTCxnQkFBZ0IsRUFDaEIsV0FBVyxHQUtaLE1BQU0sb0JBQW9CLENBQUM7QUFDNUIsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRTdDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUVoRCxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7QUFFbkIsTUFBTSxVQUFVLGNBQWMsQ0FBQyxXQUFnQjtJQUM3QyxNQUFNLGFBQWEsR0FBRyw0QkFBNEIsQ0FBQztJQUNuRCxNQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNuQyxTQUFTLENBQUMsR0FBRyxFQUFFO1FBQ2IsSUFBSSxFQUFFLGNBQWM7UUFDcEIsS0FBSyxFQUFFLE1BQU07S0FDZCxDQUFDLENBQUM7SUFFSCx5REFBeUQ7SUFDekQsSUFBSSxPQUFPLEdBQUcsQ0FBQyxhQUFhLEtBQUssVUFBVSxFQUFFO1FBQzNDLEdBQUcsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7S0FDbEM7SUFDRCxrQ0FBa0M7SUFDbEMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDdkMsQ0FBQztBQUVELE1BQU0sVUFBVSxTQUFTLENBQUMsVUFBc0I7SUFDOUMsTUFBTSxFQUNKLFdBQVcsRUFDWCxRQUFRLEVBQ1IsT0FBTyxFQUNQLE9BQU8sRUFDUCxVQUFVLEVBQ1YsV0FBVyxFQUNYLFlBQVksRUFDWixRQUFRLEVBQ1IsTUFBTSxFQUNOLFlBQVksRUFDWixZQUFZLEVBQ1osTUFBTSxHQUNQLEdBQUcsVUFBVSxDQUFDO0lBQ2YsSUFBSSxPQUFPLEdBQUcsWUFBWSxDQUFDO0lBQzNCLE1BQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQztJQUN2QixNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztJQUN6QyxNQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFDeEMsTUFBTSxrQkFBa0IsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDeEUsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLElBQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xFLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzNFLE1BQU0sYUFBYSxHQUFHLDRCQUE0QixDQUFDO0lBQ25ELE1BQU0sR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFFbkQsTUFBTSxVQUFVLEdBQ2QsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ3BFLE1BQU0sU0FBUyxHQUNiLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNsRSxNQUFNLE9BQU8sR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0lBRTlCLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQztJQUNyQixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7UUFDbEIsSUFBSSxHQUFHLENBQUMsUUFBUSxFQUFFO1lBQ2hCLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUc7Z0JBQ3JCLFNBQVMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUc7YUFDcEQsQ0FBQztTQUNIO1FBQ0QsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLFFBQVEsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRTtZQUM5QyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUM7U0FDdkM7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILE9BQU8sQ0FBQyxTQUFTLEdBQUc7UUFDbEIsR0FBRyxTQUFTO0tBQ2IsQ0FBQztJQUNGLE9BQU8sQ0FBQyxVQUFVLEdBQUcsa0JBQWtCLENBQUM7SUFDeEMsT0FBTyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFL0IsTUFBTSxXQUFXLEdBQUcsQ0FBQyxNQUFtQixFQUFFLEVBQUU7UUFDMUMsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUMzQixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDL0MsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7UUFDbEMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUM7UUFDOUIsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQ3JDLE1BQU0sS0FBSyxHQUFRLE1BQU0sQ0FBQyxLQUFLLElBQUksUUFBUSxDQUFDO1FBQzVDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxTQUFTLEdBQUcsRUFBRSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNqRCxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQy9CLENBQUMsQ0FBQztJQUVGLE1BQU0sUUFBUSxHQUFHLENBQUMsT0FBYyxFQUFFLElBQUksR0FBRyxPQUFPLEVBQUUsVUFBVSxHQUFHLE9BQU8sRUFBRSxFQUFFO1FBQ3hFLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkIsTUFBTSxRQUFRLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDM0UsUUFBUSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDeEIsUUFBUSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7UUFDdkIsU0FBaUIsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzFDLGlEQUFpRDtJQUNuRCxDQUFDLENBQUM7SUFFRixNQUFNLFlBQVksR0FBRyxDQUFDLE9BQWMsRUFBRSxFQUFFO1FBQ3RDLElBQUksVUFBVSxJQUFJLFVBQVUsQ0FBQyxNQUFNLEVBQUU7WUFDbkMsTUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDO1lBQ3hCLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDckIsSUFBSSxHQUFHLENBQUMsUUFBUSxFQUFFO29CQUNoQixZQUFZLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHO3dCQUN4QixTQUFTLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHO3FCQUNwRCxDQUFDO2lCQUNIO2dCQUNELElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxRQUFRLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7b0JBQzlDLFlBQVksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQztpQkFDMUM7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sQ0FBQyxTQUFTLEdBQUcsRUFBRSxHQUFHLFlBQVksRUFBRSxHQUFHLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUM5RCxNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO1lBQzlDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDM0IsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDckIsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUN6QyxNQUFNLFVBQVUsR0FBRztvQkFDakIsR0FBRyxPQUFPO29CQUNWLFVBQVUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNyQixVQUFVLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztpQkFDNUIsQ0FBQztnQkFDRixRQUFRLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUMvQyxDQUFDLENBQUMsQ0FBQztTQUNKO2FBQU07WUFDTCxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDbkI7SUFDSCxDQUFDLENBQUM7SUFFRixNQUFNLGNBQWMsR0FBRyxDQUNyQixRQUFhLEVBQ2IsV0FBZ0IsRUFDaEIsT0FBYyxFQUNkLFFBQVEsR0FBRyxFQUFFLEVBQ2IsRUFBRTtRQUNGLElBQUksUUFBUSxJQUFJLFdBQVcsSUFBSSxXQUFXLENBQUMsS0FBSyxFQUFFO1lBQ2hELE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLFdBQVcsQ0FBQztZQUNoRCxNQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQztZQUN4QyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQztZQUMxRSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDaEQsTUFBTSxVQUFVLEdBQUcsTUFBTSxHQUFHLEdBQUcsR0FBRyxRQUFRLENBQUM7Z0JBQzNDLElBQUksVUFBVSxHQUFHLEVBQUUsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFO29CQUNwQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ2QsT0FBTyxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7aUJBQ3JCO2dCQUNELE1BQU0sSUFBSSxHQUFHO29CQUNYO3dCQUNFLE9BQU8sRUFBRSxVQUFVLENBQUMsSUFBSSxFQUFFO3dCQUMxQixPQUFPLEVBQUUsT0FBTyxDQUFDLE1BQU07d0JBQ3ZCLE1BQU0sRUFBRTs0QkFDTixTQUFTLEVBQUUsVUFBVTs0QkFDckIsTUFBTSxFQUFFLFFBQVE7NEJBQ2hCLFFBQVEsRUFBRSxDQUFDOzRCQUNYLFNBQVMsRUFBRSxNQUFNO3lCQUNsQjtxQkFDRjtpQkFDRixDQUFDO2dCQUNGLE1BQU0sV0FBVyxHQUFHLENBQUMsR0FBRyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3hDLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQzdDLE1BQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUM7Z0JBQ3JDLE1BQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUM7Z0JBQ3pDLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQ2xDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssUUFBUSxJQUFJLENBQUMsQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQ3hELENBQUM7Z0JBQ0YsSUFBSSxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sRUFBRTtvQkFDL0IsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FDakMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUU7d0JBQ2hCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDOzRCQUNuQixDQUFDLFdBQVcsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDdEQsT0FBTyxJQUFJLENBQUM7b0JBQ2QsQ0FBQyxFQUNELEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxDQUN2QixDQUFDO29CQUNGLGFBQWEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7aUJBQ2xDO2dCQUNELGNBQWMsQ0FBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNyRSxDQUFDLENBQUMsQ0FBQztTQUNKO2FBQU07WUFDTCxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxFQUFFLEdBQUcsT0FBTyxDQUFDLENBQUM7WUFDMUMsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRTtnQkFDbEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUU7b0JBQ3pCLElBQUksR0FBRyxPQUFPLENBQUM7aUJBQ2hCO2dCQUNELE9BQU8sSUFBSSxDQUFDO1lBQ2QsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ1AsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDaEQsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQzlELFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUMzQjtTQUNGO0lBQ0gsQ0FBQyxDQUFDO0lBRUYsZUFBZTtJQUNmLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3hCLEdBQUcsQ0FBQyxJQUFJLENBQ04sV0FBVyxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsRUFDckMsT0FBTyxFQUNQLE9BQU8sQ0FBQyxNQUFNLEdBQUcsRUFBRSxFQUNuQixFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FDcEIsQ0FBQztJQUVGLHVCQUF1QjtJQUN2QixPQUFPLEdBQUcsRUFBRSxHQUFHLE9BQU8sRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sR0FBRyxFQUFFLEVBQUUsQ0FBQztJQUN0RCxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3BCLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzFCLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUNwQixJQUFJLFdBQVcsQ0FBQyxRQUFRLEVBQUU7UUFDeEIsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDckM7SUFDRCxJQUFJLFdBQVcsQ0FBQyxRQUFRLElBQUksV0FBVyxDQUFDLEtBQUssRUFBRTtRQUM3QyxRQUFRLENBQUMsSUFBSSxDQUNYLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FDeEQsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFDMUMsRUFBRSxDQUNILENBQUM7S0FDSDtJQUNELElBQUksV0FBVyxDQUFDLE9BQU8sRUFBRTtRQUN2QixRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixXQUFXLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztLQUN4RDtJQUNELEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBRXJFLGVBQWU7SUFDZixPQUFPLEdBQUcsRUFBRSxHQUFHLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3ZFLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3hCLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNoQyxNQUFNLFdBQVcsR0FBRyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO0lBQ3pFLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUV6QixjQUFjO0lBQ2QsT0FBTyxHQUFHLEVBQUUsR0FBRyxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUM7SUFDdkQsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDMUIsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNuQixHQUFHLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDaEMsR0FBRyxDQUFDLElBQUksQ0FDTixDQUFDLEVBQ0QsT0FBTyxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQ3BCLFNBQVMsR0FBRyxFQUFFLEVBQ2QsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFDekMsR0FBRyxDQUNKLENBQUM7SUFDRixJQUFJLFFBQVEsRUFBRTtRQUNaLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7S0FDMUQ7SUFDRCxJQUFJLE1BQU0sRUFBRTtRQUNWLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7S0FDaEU7SUFDRCxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxTQUFTLEdBQUcsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUUxRSxhQUFhO0lBQ2IsT0FBTyxHQUFHLEVBQUUsR0FBRyxPQUFPLEVBQUUsTUFBTSxFQUFFLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUUzRSxjQUFjLENBQUMsWUFBWSxFQUFFLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRXhELHlEQUF5RDtJQUN6RCxJQUFJLE9BQU8sR0FBRyxDQUFDLGFBQWEsS0FBSyxVQUFVLEVBQUU7UUFDM0MsR0FBRyxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUNsQztJQUNELE1BQU0sT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO0lBQ3RFLDRDQUE0QztJQUM1QyxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ1gsTUFBTSxDQUNKLE9BQU8sRUFDUCxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsR0FBRyxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUMxRSxDQUFDO0tBQ0g7SUFDRCxPQUFPLE9BQU8sQ0FBQztBQUNqQixDQUFDO0FBRUQsTUFBTSxVQUFVLGdCQUFnQixDQUM5QixHQUFRLEVBQ1IsT0FBWSxFQUNaLGFBQXFCLEVBQ3JCLE9BQW1CO0lBRW5CLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMvRCxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsRSxNQUFNLG1CQUFtQixHQUFHLFFBQVEsQ0FDbEMsT0FBTyxDQUFDLFVBQVUsSUFBSSxTQUFTLENBQUMsVUFBVSxDQUMzQyxDQUFDO0lBQ0YsT0FBTztRQUNMLEdBQUcsT0FBTztRQUNWLEtBQUssRUFBRSxNQUFNO1FBQ2IsU0FBUyxFQUFFLE1BQU07UUFDakIsWUFBWSxFQUFFLE9BQU87UUFDckIsVUFBVSxFQUFFO1lBQ1YsUUFBUSxFQUFFLENBQUM7WUFDWCxXQUFXLEVBQUUsQ0FBQztZQUNkLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1lBQzFCLFNBQVMsRUFBRSxHQUFHO1lBQ2QsTUFBTSxFQUFFLFFBQVE7WUFDaEIsTUFBTSxFQUFFLFFBQVE7WUFDaEIsYUFBYSxFQUFFLENBQUM7WUFDaEIsR0FBRyxPQUFPLENBQUMsVUFBVTtTQUN0QjtRQUNELFVBQVUsRUFBRTtZQUNWLFFBQVEsRUFBRSxDQUFDO1lBQ1gsV0FBVyxFQUFFLENBQUM7WUFDZCxNQUFNLEVBQUUsUUFBUTtZQUNoQixhQUFhLEVBQUUsQ0FBQztZQUNoQixHQUFHLE9BQU8sQ0FBQyxVQUFVO1NBQ3RCO1FBQ0QsWUFBWSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsT0FBTyxDQUFDLFNBQVMsRUFBRTtRQUN4RSxNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRTtRQUN0QyxZQUFZLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNyQixRQUFRO1lBQ1IsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLE1BQU0sRUFBRTtnQkFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7Z0JBQ2hELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO2FBQ2pEO2lCQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDdEQsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQztvQkFDdkQsQ0FBQyxDQUFDLG1CQUFtQjtvQkFDckIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDO3dCQUM3QyxDQUFDLENBQUMsZUFBZTt3QkFDakIsQ0FBQyxDQUFDLGdCQUFnQixDQUFDO2FBQ3RCO1lBQ0QsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxTQUFTLEVBQUU7Z0JBQ3BFLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ2xELEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLFdBQVcsQ0FBQztnQkFDaEMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDO2dCQUMvQixLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN0QztRQUNILENBQUM7UUFFRCxXQUFXLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNwQixTQUFTO1lBQ1QsSUFBSSxHQUFHLEdBQUcsT0FBTyxHQUFHLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzNDLElBQUksT0FBTyxHQUFHLENBQUMsYUFBYSxLQUFLLFVBQVUsRUFBRTtnQkFDM0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxPQUFPLGFBQWEsRUFBRSxDQUFDO2FBQ3BDO1lBQ0QsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQixNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQztZQUN2QyxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsTUFBTTtnQkFDaEMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNO2dCQUNqQixDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3pCLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFHLElBQUksQ0FBQyxRQUFnQixDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsVUFBVSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ3RFLENBQUM7S0FDRixDQUFDO0FBQ0osQ0FBQztBQUVELE1BQU0sQ0FBQyxLQUFLLFVBQVUsV0FBVyxDQUFDLFlBQTBCO0lBQzFELDRCQUE0QjtJQUM1QixNQUFNLE1BQU0sR0FBVSxZQUFZLENBQUMsT0FBTyxDQUFDO0lBQzNDLE1BQU0sSUFBSSxHQUFVLFlBQVksQ0FBQyxPQUFPLENBQUM7SUFDekMsTUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDLFdBQVcsQ0FBQztJQUM3QyxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDO0lBQzNDLE1BQU0sUUFBUSxHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUM7SUFDdkMsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQztJQUNuQyxNQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsWUFBWSxDQUFDO0lBQy9DLE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUM7SUFDakMsTUFBTSxnQkFBZ0IsR0FBRyxZQUFZLENBQUMsZ0JBQWdCLENBQUM7SUFDdkQsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQztJQUNuQyxNQUFNLE9BQU8sR0FBRyxZQUFZLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztJQUMzQyxNQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUksU0FBUyxDQUFDLE1BQU0sQ0FBQztJQUM5RCxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUM7SUFDckQsTUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsSUFBSSxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUM7SUFDeEQsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLEtBQUssSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDO0lBQ3hELE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLFFBQVEsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDO0lBQ2pFLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLFVBQVUsSUFBSSxTQUFTLENBQUMsVUFBVSxDQUFDO0lBQ3JFLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDekUsTUFBTSxXQUFXLEdBQUcsTUFBTTtTQUN2QixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDO1NBQ25DLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRXJCLE1BQU0sSUFBSSxHQUFHO1FBQ1gsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHO1FBQ3BCLEdBQUcsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHO0tBQ25DLENBQUM7SUFFRixNQUFNLFFBQVEsR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDO0lBRWhDLE1BQU0sV0FBVyxHQUF1QjtRQUN0QyxRQUFRLEVBQUUsUUFBUTtRQUNsQixVQUFVLEVBQUUsUUFBUTtLQUNyQixDQUFDO0lBQ0YsTUFBTSxhQUFhLEdBQUc7UUFDcEIsR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUU7UUFDakQsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUU7UUFDbEQsTUFBTSxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUU7UUFDcEQsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUU7S0FDcEQsQ0FBQztJQUVGLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDakUsU0FBUyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7SUFFM0IsTUFBTSxZQUFZLEdBQUcsQ0FBQyxLQUFhLEVBQUUsRUFBRTtRQUNyQyxPQUFPO1lBQ0wsSUFBSSxFQUFFLFNBQVM7WUFDZixPQUFPLEVBQUUsT0FBTztZQUNoQixPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFO1lBQ3hCLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUU7U0FDakIsQ0FBQztJQUNaLENBQUMsQ0FBQztJQUVGLE1BQU0sYUFBYSxHQUFHLENBQUMsUUFBYSxhQUFhLEVBQUUsRUFBRTtRQUNuRCxPQUFPO1lBQ0wsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHO1lBQ2QsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNO1lBQ3BCLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtZQUNoQixLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUs7U0FDbkIsQ0FBQztJQUNKLENBQUMsQ0FBQztJQUVGLE1BQU0sVUFBVSxHQUFHLENBQUMsR0FBUSxFQUFFLEtBQVUsRUFBRSxFQUFFO1FBQzFDLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RDLEtBQUssQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDO1FBQzlCLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDbkMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QixDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxJQUFJLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQzFELENBQUMsQ0FBQztJQUVGLElBQUksV0FBVyxFQUFFO1FBQ2YsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNFLFFBQVEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLE1BQU0sVUFBVSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQztRQUN0RCxVQUFVLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRWpDLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUMzRCxVQUFVLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUN2QixNQUFNLFlBQVksR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO1FBQzVDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7S0FDdEM7SUFFRCxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM5QyxXQUFXLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUN4QixNQUFNLGFBQWEsR0FBRztRQUNwQixJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUU7UUFDOUIsSUFBSSxFQUFFLFlBQVksQ0FBQyxRQUFRLENBQUM7S0FDN0IsQ0FBQztJQUNGLFVBQVUsQ0FBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFFdkMsZ0ZBQWdGO0lBQ2hGLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQ2pDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDbEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ1gsT0FBTyxRQUFRLENBQUM7U0FDakI7YUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDbEIsT0FBTyxNQUFNLENBQUM7U0FDZjthQUFNLElBQUksQ0FBQyxLQUFLLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ2xDLE9BQU8sVUFBVSxDQUFDO1NBQ25CO2FBQU07WUFDTCxPQUFPLEVBQUUsQ0FBQztTQUNYO0lBQ0gsQ0FBQyxDQUFDLENBQ0gsQ0FBQztJQUNGLFVBQVUsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0lBQzFCLE1BQU0sWUFBWSxHQUFHO1FBQ25CLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUU7UUFDbEIsU0FBUyxFQUFFLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFO1FBQzVELElBQUksRUFBRSxZQUFZLENBQUMsUUFBUSxDQUFDO0tBQzdCLENBQUM7SUFDRixNQUFNLGFBQWEsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNyRCxNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN0RCxhQUFhLENBQUMsSUFBSSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDO0lBQ2xDLGFBQWEsQ0FBQyxTQUFTLEdBQUcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsQ0FBQztJQUNyRSxhQUFhLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM1QyxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsYUFBYSxDQUFDLE9BQU8sSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUN4RSxNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN0RCxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUNsQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQ3RELENBQUM7SUFDRixXQUFXLENBQUMsSUFBSSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDO0lBQ2hDLFdBQVcsQ0FBQyxTQUFTLEdBQUcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsQ0FBQztJQUNyRSxXQUFXLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMxQyxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsV0FBVyxDQUFDLE9BQU8sSUFBSSxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUNwRSxNQUFNLGVBQWUsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUN4QyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQ3RELENBQUM7SUFDRixNQUFNLGFBQWEsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNuRCxlQUFlLENBQUMsSUFBSSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDO0lBQ3BDLGVBQWUsQ0FBQyxTQUFTLEdBQUcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsQ0FBQztJQUN4RSxlQUFlLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM5QyxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsZUFBZSxDQUFDLE9BQU8sSUFBSSxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUM1RSxnREFBZ0Q7SUFDaEQsaUNBQWlDO0lBQ2pDLGlEQUFpRDtJQUNqRCx3Q0FBd0M7SUFDeEMsTUFBTTtJQUNOLDRDQUE0QztJQUM1QywyREFBMkQ7SUFDM0Qsd0NBQXdDO0lBRXhDLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDaEUsU0FBUyxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDdEIsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2pFLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQztJQUNsRSxTQUFTLENBQUMsUUFBUSxDQUFDLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7UUFDbEQsSUFBSSxDQUFDLElBQUksR0FBRyxZQUFZLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDO1FBQzNCLElBQUksQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDO1FBQzdCLElBQUksQ0FBQyxNQUFNLEdBQUcsYUFBYSxFQUFFLENBQUM7SUFDaEMsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQzlCLE1BQU0sY0FBYyxHQUFHLENBQUMsUUFBYSxFQUFFLFdBQWdCLEVBQUUsRUFBRTtZQUN6RCxJQUFJLFFBQVEsSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLEtBQUssRUFBRTtnQkFDaEQsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQztnQkFDaEMsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQztnQkFDbkMsTUFBTSxTQUFTLEdBQWEsV0FBVyxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUM7Z0JBQ3JELE1BQU0sT0FBTyxHQUNYLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDO2dCQUM1RCxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFO29CQUNyRCxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7d0JBQ2hCLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztxQkFDN0M7eUJBQU07d0JBQ0wsSUFBSSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7cUJBQ3pDO29CQUNELE9BQU8sSUFBSSxDQUFDO2dCQUNkLENBQUMsRUFBRSxFQUFTLENBQUMsQ0FBQztnQkFDZCxJQUFJLFdBQVcsQ0FBQyxLQUFLLEtBQUssS0FBSyxFQUFFO29CQUMvQixNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNwRSxRQUFRLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztvQkFDckIsTUFBTSxVQUFVLEdBQUc7d0JBQ2pCLElBQUksRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDO3dCQUMzQixNQUFNLEVBQUUsYUFBYSxFQUFFO3FCQUN4QixDQUFDO29CQUNGLFVBQVUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7aUJBQ2xDO2dCQUNELE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQztnQkFDaEMsTUFBTSxjQUFjLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQztnQkFDM0MsY0FBYyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUM7YUFDckQ7UUFDSCxDQUFDLENBQUM7UUFDRixNQUFNLHNCQUFzQixHQUFHLENBQUMsUUFBYSxFQUFFLFdBQWdCLEVBQUUsRUFBRTtZQUNqRSxJQUFJLFFBQVEsSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLEtBQUssRUFBRTtnQkFDaEQsTUFBTSxTQUFTLEdBQWEsV0FBVyxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUM7Z0JBQ3JELE1BQU0sT0FBTyxHQUFHLGlCQUFpQixDQUFDO2dCQUNsQyxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFO29CQUNyRCxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7d0JBQ2hCLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztxQkFDN0M7eUJBQU07d0JBQ0wsSUFBSSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7cUJBQ3pDO29CQUNELE9BQU8sSUFBSSxDQUFDO2dCQUNkLENBQUMsRUFBRSxFQUFTLENBQUMsQ0FBQztnQkFDZCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssS0FBSyxFQUFFO29CQUNoRCxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFO3dCQUNuRCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDNUQsT0FBTyxJQUFJLENBQUM7b0JBQ2QsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLFlBQVksQ0FBQyxDQUFDO29CQUMxQyxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUNuRCxXQUFXLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztvQkFDeEIsV0FBVyxDQUFDLFFBQVEsQ0FBQyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFO3dCQUNwRCxJQUFJLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDbEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQzt3QkFDeEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxhQUFhLEVBQUUsQ0FBQztvQkFDaEMsQ0FBQyxDQUFDLENBQUM7aUJBQ0o7Z0JBQ0QsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDO2dCQUNoQyxNQUFNLGNBQWMsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDO2dCQUMzQyxjQUFjLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQzthQUNyRDtRQUNILENBQUMsQ0FBQztRQUNGLGNBQWMsQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUMvQyxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzVDLHNCQUFzQixDQUFDLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3ZELFNBQVMsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNsRCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2FBQzNDO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDLGdCQUFnQixDQUFDLENBQUM7YUFDNUM7WUFDRCxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDO1lBQ3hDLElBQUksQ0FBQyxNQUFNLEdBQUcsYUFBYSxFQUFFLENBQUM7UUFDaEMsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7WUFDdEIsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN2QyxPQUFPLENBQUMsS0FBSyxHQUFHO2dCQUNkLElBQUksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDO2dCQUNsQixTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQzthQUN4QixDQUFDO1lBQ0YsT0FBTyxDQUFDLElBQUksR0FBRztnQkFDYixLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO2FBQzFCLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUNILFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUMxQixNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNoQixXQUFXLENBQUMsSUFBSSxHQUFHO29CQUNqQixJQUFJLEVBQUUsV0FBVztpQkFDbEIsQ0FBQztnQkFDRixXQUFXLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQzthQUN6QjtpQkFBTTtnQkFDTCxXQUFXLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQzthQUN6QjtZQUNELFdBQVcsQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDO1FBQ3RDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDSCxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRXJCLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztJQUVsQyxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7UUFDbEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUM5RCxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1gsTUFBTSxDQUNKLElBQUksRUFDSixLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxLQUFLLENBQ3BFLENBQUM7U0FDSDtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsganNQREYgfSBmcm9tIFwianNwZGZcIjtcclxuaW1wb3J0IHsgYXBwbHlQbHVnaW4sIFVzZXJPcHRpb25zIH0gZnJvbSBcImpzcGRmLWF1dG90YWJsZVwiO1xyXG5pbXBvcnQgYXV0b1RhYmxlIGZyb20gXCJqc3BkZi1hdXRvdGFibGVcIjtcclxuaW1wb3J0IHsgQWxpZ25tZW50LCBGaWxsLCBXb3JrYm9vayB9IGZyb20gXCJleGNlbGpzXCI7XHJcbmltcG9ydCB7IHNhdmVBcyB9IGZyb20gXCJmaWxlLXNhdmVyXCI7XHJcblxyXG5pbXBvcnQge1xyXG4gIEV4Y2VsT3B0aW9ucyxcclxuICBFeHBvcnRFeHRlbnRpb25zLFxyXG4gIEV4cG9ydFR5cGVzLFxyXG4gIFBERkZpbGxUZXh0LFxyXG4gIFBkZk9wdGlvbnMsXHJcbiAgSVJlcG9ydFJvdyxcclxuICBPcmllbnRhdGlvblR5cGUsXHJcbn0gZnJvbSBcInJlcG9ydC10b29sL21vZGVsc1wiO1xyXG5pbXBvcnQgeyBmaWxsQ29sb3IgfSBmcm9tIFwicmVwb3J0LXRvb2wvY29yZVwiO1xyXG5cclxuaW1wb3J0IHsgaGV4VG9SZ2IgfSBmcm9tIFwiLi90eXBlLWNoYW5nZS5tZXRob2RcIjtcclxuXHJcbmFwcGx5UGx1Z2luKGpzUERGKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBleHBvcnRQZGZUYWJsZShvcmllbnRhdGlvbjogYW55KTogdm9pZCB7XHJcbiAgY29uc3QgdG90YWxQYWdlc0V4cCA9IFwie3RvdGFsX3BhZ2VzX2NvdW50X3N0cmluZ31cIjtcclxuICBjb25zdCBkb2MgPSBuZXcganNQREYob3JpZW50YXRpb24pO1xyXG4gIGF1dG9UYWJsZShkb2MsIHtcclxuICAgIGh0bWw6IFwiI2V4cG9ydFRhYmxlXCIsXHJcbiAgICB0aGVtZTogXCJncmlkXCIsXHJcbiAgfSk7XHJcblxyXG4gIC8vIFRvdGFsIHBhZ2UgbnVtYmVyIHBsdWdpbiBvbmx5IGF2YWlsYWJsZSBpbiBqc3BkZiB2MS4wK1xyXG4gIGlmICh0eXBlb2YgZG9jLnB1dFRvdGFsUGFnZXMgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgZG9jLnB1dFRvdGFsUGFnZXModG90YWxQYWdlc0V4cCk7XHJcbiAgfVxyXG4gIC8vIGRvYy5vdXRwdXQoXCJkYXRhdXJsbmV3d2luZG93XCIpO1xyXG4gIGRvYy5zYXZlKGBSZXBvcnRzJHtEYXRlLm5vdygpfS5wZGZgKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGV4cG9ydFBkZihwZGZPcHRpb25zOiBQZGZPcHRpb25zKTogQmxvYiB7XHJcbiAgY29uc3Qge1xyXG4gICAgb3JpZW50YXRpb24sXHJcbiAgICBwYWdlU2l6ZSxcclxuICAgIHJvd0RhdGEsXHJcbiAgICBjb2x1bW5zLFxyXG4gICAgc3ViQ29sdW1ucyxcclxuICAgIHJlcG9ydFRpdGxlLFxyXG4gICAgcmVxdWVzdFRpdGxlLFxyXG4gICAgRnJvbURhdGUsXHJcbiAgICBUb0RhdGUsXHJcbiAgICB0YWJsZU9wdGlvbnMsXHJcbiAgICByb3dEYXRhR3JvdXAsXHJcbiAgICBpc0Jsb2IsXHJcbiAgfSA9IHBkZk9wdGlvbnM7XHJcbiAgbGV0IG9wdGlvbnMgPSB0YWJsZU9wdGlvbnM7XHJcbiAgY29uc3QgbWV0YVJlcG9ydHMgPSBbXTtcclxuICBjb25zdCBiZ0NvbG9yID0gcGRmT3B0aW9ucy5iZ0NvbG9yIHx8IHt9O1xyXG4gIGNvbnN0IHJvd0RhdGFHcm91cENvbHMgPSBvcHRpb25zLkZpZWxkcztcclxuICBjb25zdCBoZWFkZXJSb3dGaWxsQ29sb3IgPSBoZXhUb1JnYihiZ0NvbG9yLmhlYWRlciB8fCBmaWxsQ29sb3IuaGVhZGVyKTtcclxuICBjb25zdCBncm91cEZpbGxDb2xvciA9IGhleFRvUmdiKGJnQ29sb3IuZ3JvdXAgfHwgZmlsbENvbG9yLmdyb3VwKTtcclxuICBjb25zdCBzdWJHcm91cEZpbGxDb2xvciA9IGhleFRvUmdiKGJnQ29sb3Iuc3ViZ3JvdXAgfHwgZmlsbENvbG9yLnN1Ymdyb3VwKTtcclxuICBjb25zdCB0b3RhbFBhZ2VzRXhwID0gXCJ7dG90YWxfcGFnZXNfY291bnRfc3RyaW5nfVwiO1xyXG4gIGNvbnN0IGRvYyA9IG5ldyBqc1BERihvcmllbnRhdGlvbiwgbnVsbCwgcGFnZVNpemUpO1xyXG5cclxuICBjb25zdCBwYWdlSGVpZ2h0ID1cclxuICAgIGRvYy5pbnRlcm5hbC5wYWdlU2l6ZS5oZWlnaHQgfHwgZG9jLmludGVybmFsLnBhZ2VTaXplLmdldEhlaWdodCgpO1xyXG4gIGNvbnN0IHBhZ2VXaWR0aCA9XHJcbiAgICBkb2MuaW50ZXJuYWwucGFnZVNpemUud2lkdGggfHwgZG9jLmludGVybmFsLnBhZ2VTaXplLmdldFdpZHRoKCk7XHJcbiAgY29uc3QgeE9mZnNldCA9IHBhZ2VXaWR0aCAvIDI7XHJcblxyXG4gIGNvbnN0IGNvbFN0eWxlcyA9IHt9O1xyXG4gIGNvbHVtbnMubWFwKChjb2wpID0+IHtcclxuICAgIGlmIChjb2wuUGRmV2lkdGgpIHtcclxuICAgICAgY29sU3R5bGVzW2NvbC5maWVsZF0gPSB7XHJcbiAgICAgICAgY2VsbFdpZHRoOiAoK2NvbC5QZGZXaWR0aCAqIChwYWdlV2lkdGggLSAxNikpIC8gMTAwLFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gICAgaWYgKGNvbC50eXBlID09PSBcIm51bWJlclwiIHx8IGNvbC50eXBlID09PSBcImlkXCIpIHtcclxuICAgICAgY29sU3R5bGVzW2NvbC5maWVsZF0uaGFsaWduID0gXCJyaWdodFwiO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBvcHRpb25zLmNvbFN0eWxlcyA9IHtcclxuICAgIC4uLmNvbFN0eWxlcyxcclxuICB9O1xyXG4gIG9wdGlvbnMuaEZpbGxDb2xvciA9IGhlYWRlclJvd0ZpbGxDb2xvcjtcclxuICBvcHRpb25zLmhUZXh0Q29sb3IgPSBbMCwgMCwgMF07XHJcblxyXG4gIGNvbnN0IHNldEZpbGxUZXh0ID0gKG9wdGlvbjogUERGRmlsbFRleHQpID0+IHtcclxuICAgIGNvbnN0IHZhbHVlID0gb3B0aW9uLnZhbHVlO1xyXG4gICAgY29uc3QgaFN0YXJ0ID0gb3B0aW9uLmhTdGFydCB8fCBvcHRpb25zLnN0YXJ0WTtcclxuICAgIGNvbnN0IGhlaWdodCA9IG9wdGlvbi5oZWlnaHQgfHwgODtcclxuICAgIGNvbnN0IHggPSBvcHRpb24ueCB8fCB4T2Zmc2V0O1xyXG4gICAgY29uc3QgeSA9IG9wdGlvbi55IHx8IG9wdGlvbnMuc3RhcnRZO1xyXG4gICAgY29uc3QgYWxpZ246IGFueSA9IG9wdGlvbi5hbGlnbiB8fCBcImNlbnRlclwiO1xyXG4gICAgZG9jLnJlY3QoNywgaFN0YXJ0LCBwYWdlV2lkdGggLSAxNCwgaGVpZ2h0LCBcIkZcIik7XHJcbiAgICBkb2MudGV4dCh2YWx1ZSwgeCwgeSwgYWxpZ24pO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGFkZFRhYmxlID0gKHJlcG9ydHM6IGFueVtdLCBjb2xzID0gY29sdW1ucywgdGJsT3B0aW9ucyA9IG9wdGlvbnMpID0+IHtcclxuICAgIGRvYy5zZXRGb250U2l6ZSg2KTtcclxuICAgIGNvbnN0IGF0T3B0aW9uID0gYXV0b1RhYmxlT3B0aW9ucyhkb2MsIHRibE9wdGlvbnMsIHRvdGFsUGFnZXNFeHAsIGJnQ29sb3IpO1xyXG4gICAgYXRPcHRpb24uY29sdW1ucyA9IGNvbHM7XHJcbiAgICBhdE9wdGlvbi5ib2R5ID0gcmVwb3J0cztcclxuICAgIChhdXRvVGFibGUgYXMgYW55KS5kZWZhdWx0KGRvYywgYXRPcHRpb24pO1xyXG4gICAgLy8gb3B0aW9ucy5zdGFydFkgPSBkb2MucHJldmlvdXNBdXRvVGFibGUuZmluYWxZO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGFkZEF1dG9UYWJsZSA9IChyZXBvcnRzOiBhbnlbXSkgPT4ge1xyXG4gICAgaWYgKHN1YkNvbHVtbnMgJiYgc3ViQ29sdW1ucy5sZW5ndGgpIHtcclxuICAgICAgY29uc3Qgc3ViQ29sU3R5bGVzID0ge307XHJcbiAgICAgIHN1YkNvbHVtbnMubWFwKChjb2wpID0+IHtcclxuICAgICAgICBpZiAoY29sLlBkZldpZHRoKSB7XHJcbiAgICAgICAgICBzdWJDb2xTdHlsZXNbY29sLmZpZWxkXSA9IHtcclxuICAgICAgICAgICAgY2VsbFdpZHRoOiAoK2NvbC5QZGZXaWR0aCAqIChwYWdlV2lkdGggLSAxNikpIC8gMTAwLFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNvbC50eXBlID09PSBcIm51bWJlclwiIHx8IGNvbC50eXBlID09PSBcImlkXCIpIHtcclxuICAgICAgICAgIHN1YkNvbFN0eWxlc1tjb2wuZmllbGRdLmhhbGlnbiA9IFwicmlnaHRcIjtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICBvcHRpb25zLmNvbFN0eWxlcyA9IHsgLi4uc3ViQ29sU3R5bGVzLCAuLi5vcHRpb25zLmNvbFN0eWxlcyB9O1xyXG4gICAgICBjb25zdCBwYXJlbnRGaWVsZCA9IHN1YkNvbHVtbnNbMF0ucGFyZW50RmllbGQ7XHJcbiAgICAgIHJlcG9ydHMuZm9yRWFjaCgoZ3JvdXBSb3cpID0+IHtcclxuICAgICAgICBhZGRUYWJsZShbZ3JvdXBSb3ddKTtcclxuICAgICAgICBjb25zdCByZXBvcnRSb3dzID0gZ3JvdXBSb3dbcGFyZW50RmllbGRdO1xyXG4gICAgICAgIGNvbnN0IHRibE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAuLi5vcHRpb25zLFxyXG4gICAgICAgICAgaEZpbGxDb2xvcjogWzAsIDAsIDBdLFxyXG4gICAgICAgICAgaFRleHRDb2xvcjogWzI1NSwgMjU1LCAyNTVdLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgYWRkVGFibGUocmVwb3J0Um93cywgc3ViQ29sdW1ucywgdGJsT3B0aW9ucyk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYWRkVGFibGUocmVwb3J0cyk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY29uc3Qgc2V0TWV0YURhdGFSb3cgPSAoXHJcbiAgICBtZXRhZGF0YTogYW55LFxyXG4gICAgbWV0YUNvbHVtbnM6IGFueSxcclxuICAgIHJlcG9ydHM6IGFueVtdLFxyXG4gICAgbWV0YVJvd3MgPSBbXVxyXG4gICkgPT4ge1xyXG4gICAgaWYgKG1ldGFkYXRhICYmIG1ldGFDb2x1bW5zICYmIG1ldGFDb2x1bW5zLmZpZWxkKSB7XHJcbiAgICAgIGNvbnN0IHsgZmllbGQsIGhlYWRlciwgc3ViVG90YWwgfSA9IG1ldGFDb2x1bW5zO1xyXG4gICAgICBjb25zdCBmaWVsZHMgPSBtZXRhQ29sdW1ucy5maWVsZHMgfHwgW107XHJcbiAgICAgIGNvbnN0IGZpbGxjb2xvcnMgPSBmaWVsZHMubGVuZ3RoID4gMSA/IHN1Ykdyb3VwRmlsbENvbG9yIDogZ3JvdXBGaWxsQ29sb3I7XHJcbiAgICAgIE9iamVjdC5rZXlzKG1ldGFkYXRhKS5mb3JFYWNoKChncm91cENvbCwgaW5kZXgpID0+IHtcclxuICAgICAgICBjb25zdCBncm91cFRpdGxlID0gaGVhZGVyICsgXCIgXCIgKyBncm91cENvbDtcclxuICAgICAgICBpZiAocGFnZUhlaWdodCAtIDIwIDwgb3B0aW9ucy5zdGFydFkpIHtcclxuICAgICAgICAgIGRvYy5hZGRQYWdlKCk7XHJcbiAgICAgICAgICBvcHRpb25zLnN0YXJ0WSA9IDEwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBkYXRhID0gW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBjb250ZW50OiBncm91cFRpdGxlLnRyaW0oKSxcclxuICAgICAgICAgICAgY29sU3BhbjogY29sdW1ucy5sZW5ndGgsXHJcbiAgICAgICAgICAgIHN0eWxlczoge1xyXG4gICAgICAgICAgICAgIGZpbGxDb2xvcjogZmlsbGNvbG9ycyxcclxuICAgICAgICAgICAgICBoYWxpZ246IFwiY2VudGVyXCIsXHJcbiAgICAgICAgICAgICAgZm9udFNpemU6IDksXHJcbiAgICAgICAgICAgICAgZm9udFN0eWxlOiBcImJvbGRcIixcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgXTtcclxuICAgICAgICBjb25zdCBzdWJNZXRhUm93cyA9IFsuLi5tZXRhUm93cywgZGF0YV07XHJcbiAgICAgICAgY29uc3Qgc3ViTWV0YWRhdGEgPSBtZXRhZGF0YVtncm91cENvbF0gfHwge307XHJcbiAgICAgICAgY29uc3Qgc3ViR3JvdXAgPSBzdWJNZXRhZGF0YS5jb2x1bW5zO1xyXG4gICAgICAgIGNvbnN0IHN1Ykdyb3VwQ29scyA9IG1ldGFDb2x1bW5zLmNvbHVtbnM7XHJcbiAgICAgICAgY29uc3QgZmlsdGVyUmVwb3J0cyA9IHJlcG9ydHMuZmlsdGVyKFxyXG4gICAgICAgICAgKGYpID0+IGZbZmllbGRdID09PSBncm91cENvbCB8fCAhKGdyb3VwQ29sICYmIGZbZmllbGRdKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgaWYgKHN1YlRvdGFsICYmIHN1YlRvdGFsLmxlbmd0aCkge1xyXG4gICAgICAgICAgY29uc3Qgc3ViVG90YWxEYXRhID0gY29sdW1ucy5yZWR1Y2UoXHJcbiAgICAgICAgICAgIChpbml0LCBjdXJyZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgaW5pdFtjdXJyZW50LmRhdGFLZXldID1cclxuICAgICAgICAgICAgICAgIChzdWJNZXRhZGF0YS5zdWJUb3RhbCB8fCB7fSlbY3VycmVudC5kYXRhS2V5XSB8fCBcIlwiO1xyXG4gICAgICAgICAgICAgIHJldHVybiBpbml0O1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7IGlzR3JvdXBUb3RhbDogdHJ1ZSB9XHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgZmlsdGVyUmVwb3J0cy5wdXNoKHN1YlRvdGFsRGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldE1ldGFEYXRhUm93KHN1Ykdyb3VwLCBzdWJHcm91cENvbHMsIGZpbHRlclJlcG9ydHMsIHN1Yk1ldGFSb3dzKTtcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBtZXRhUmVwb3J0cy5wdXNoKC4uLm1ldGFSb3dzLCAuLi5yZXBvcnRzKTtcclxuICAgICAgY29uc3QgcmVwb3J0TGFzdCA9IHJlcG9ydHMucmVkdWNlKChpbml0LCBjdXJyZW50KSA9PiB7XHJcbiAgICAgICAgaWYgKCFjdXJyZW50LmlzR3JvdXBUb3RhbCkge1xyXG4gICAgICAgICAgaW5pdCA9IGN1cnJlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpbml0O1xyXG4gICAgICB9LCB7fSk7XHJcbiAgICAgIGNvbnN0IHJvd0RhdGFMYXN0ID0gcm93RGF0YVtyb3dEYXRhLmxlbmd0aCAtIDFdO1xyXG4gICAgICBpZiAoSlNPTi5zdHJpbmdpZnkocmVwb3J0TGFzdCkgPT09IEpTT04uc3RyaW5naWZ5KHJvd0RhdGFMYXN0KSkge1xyXG4gICAgICAgIGFkZEF1dG9UYWJsZShtZXRhUmVwb3J0cyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvLyBDb21wYW55IE5hbWVcclxuICBkb2Muc2V0Rm9udChcIlwiLCBcImJvbGRcIik7XHJcbiAgZG9jLnRleHQoXHJcbiAgICByZXBvcnRUaXRsZS5Db21wYW55TmFtZS50b1VwcGVyQ2FzZSgpLFxyXG4gICAgeE9mZnNldCxcclxuICAgIG9wdGlvbnMuc3RhcnRZICsgMTUsXHJcbiAgICB7IGFsaWduOiBcImNlbnRlclwiIH1cclxuICApO1xyXG5cclxuICAvLyBBZGRyZXNzIGFuZCBQaG9uZSBOb1xyXG4gIG9wdGlvbnMgPSB7IC4uLm9wdGlvbnMsIHN0YXJ0WTogb3B0aW9ucy5zdGFydFkgKyAyNSB9O1xyXG4gIGRvYy5zZXRGb250U2l6ZSgxMCk7XHJcbiAgZG9jLnNldEZvbnQoXCJcIiwgXCJub3JtYWxcIik7XHJcbiAgY29uc3Qgc3ViVGl0bGUgPSBbXTtcclxuICBpZiAocmVwb3J0VGl0bGUuQWRkcmVzczEpIHtcclxuICAgIHN1YlRpdGxlLnB1c2gocmVwb3J0VGl0bGUuQWRkcmVzczEpO1xyXG4gIH1cclxuICBpZiAocmVwb3J0VGl0bGUuRGlzdHJpY3QgfHwgcmVwb3J0VGl0bGUuU3RhdGUpIHtcclxuICAgIHN1YlRpdGxlLnB1c2goXHJcbiAgICAgIGAke3JlcG9ydFRpdGxlLkRpc3RyaWN0ID8gcmVwb3J0VGl0bGUuRGlzdHJpY3QgKyBcIiwgXCIgOiBcIlwifSR7XHJcbiAgICAgICAgcmVwb3J0VGl0bGUuU3RhdGUgPyByZXBvcnRUaXRsZS5TdGF0ZSA6IFwiXCJcclxuICAgICAgfWBcclxuICAgICk7XHJcbiAgfVxyXG4gIGlmIChyZXBvcnRUaXRsZS5QaG9uZU5vKSB7XHJcbiAgICBzdWJUaXRsZS5wdXNoKGBUZWxlcGhvbmUgTm8gOiAke3JlcG9ydFRpdGxlLlBob25lTm99YCk7XHJcbiAgfVxyXG4gIGRvYy50ZXh0KHN1YlRpdGxlLCB4T2Zmc2V0LCBvcHRpb25zLnN0YXJ0WSAtIDMsIHsgYWxpZ246IFwiY2VudGVyXCIgfSk7XHJcblxyXG4gIC8vIFJlcG9ydCBUaXRsZVxyXG4gIG9wdGlvbnMgPSB7IC4uLm9wdGlvbnMsIHN0YXJ0WTogc3ViVGl0bGUubGVuZ3RoICogNSArIG9wdGlvbnMuc3RhcnRZIH07XHJcbiAgZG9jLnNldEZvbnQoXCJcIiwgXCJib2xkXCIpO1xyXG4gIGRvYy5zZXRGaWxsQ29sb3IoMjU1LCAyMjEsIDIwNCk7XHJcbiAgY29uc3QgdGl0bGVPcHRpb24gPSB7IHZhbHVlOiBvcHRpb25zLnRpdGxlLCBoU3RhcnQ6IG9wdGlvbnMuc3RhcnRZIC0gNSB9O1xyXG4gIHNldEZpbGxUZXh0KHRpdGxlT3B0aW9uKTtcclxuXHJcbiAgLy8gUmVwb3J0IERhdGVcclxuICBvcHRpb25zID0geyAuLi5vcHRpb25zLCBzdGFydFk6IG9wdGlvbnMuc3RhcnRZICsgNy41IH07XHJcbiAgZG9jLnNldEZvbnQoXCJcIiwgXCJub3JtYWxcIik7XHJcbiAgZG9jLnNldEZvbnRTaXplKDkpO1xyXG4gIGRvYy5zZXRGaWxsQ29sb3IoMjMwLCAyNDIsIDI1NSk7XHJcbiAgZG9jLnJlY3QoXHJcbiAgICA3LFxyXG4gICAgb3B0aW9ucy5zdGFydFkgLSA0LjUsXHJcbiAgICBwYWdlV2lkdGggLSAxNCxcclxuICAgIE1hdGgucm91bmQocmVxdWVzdFRpdGxlLmxlbmd0aCAvIDIpICogNy41LFxyXG4gICAgXCJGXCJcclxuICApO1xyXG4gIGlmIChGcm9tRGF0ZSkge1xyXG4gICAgZG9jLnRleHQoRnJvbURhdGUsIDgsIG9wdGlvbnMuc3RhcnRZLCB7IGFsaWduOiBcImxlZnRcIiB9KTtcclxuICB9XHJcbiAgaWYgKFRvRGF0ZSkge1xyXG4gICAgZG9jLnRleHQoVG9EYXRlLCB4T2Zmc2V0LCBvcHRpb25zLnN0YXJ0WSwgeyBhbGlnbjogXCJjZW50ZXJcIiB9KTtcclxuICB9XHJcbiAgZG9jLnRleHQocmVxdWVzdFRpdGxlLCBwYWdlV2lkdGggLSA4LCBvcHRpb25zLnN0YXJ0WSwgeyBhbGlnbjogXCJyaWdodFwiIH0pO1xyXG5cclxuICAvLyBBdXRvIFRhYmxlXHJcbiAgb3B0aW9ucyA9IHsgLi4ub3B0aW9ucywgc3RhcnRZOiByZXF1ZXN0VGl0bGUubGVuZ3RoICogNSArIG9wdGlvbnMuc3RhcnRZIH07XHJcblxyXG4gIHNldE1ldGFEYXRhUm93KHJvd0RhdGFHcm91cCwgcm93RGF0YUdyb3VwQ29scywgcm93RGF0YSk7XHJcblxyXG4gIC8vIFRvdGFsIHBhZ2UgbnVtYmVyIHBsdWdpbiBvbmx5IGF2YWlsYWJsZSBpbiBqc3BkZiB2MS4wK1xyXG4gIGlmICh0eXBlb2YgZG9jLnB1dFRvdGFsUGFnZXMgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgZG9jLnB1dFRvdGFsUGFnZXModG90YWxQYWdlc0V4cCk7XHJcbiAgfVxyXG4gIGNvbnN0IGJsb2JQREYgPSBuZXcgQmxvYihbZG9jLm91dHB1dCgpXSwgeyB0eXBlOiBcImFwcGxpY2F0aW9uL3BkZlwiIH0pO1xyXG4gIC8vIGZpbGVTYXZlci5zYXZlQXMoYmxvYlBERiwgb3B0aW9ucy50aXRsZSk7XHJcbiAgaWYgKCFpc0Jsb2IpIHtcclxuICAgIHNhdmVBcyhcclxuICAgICAgYmxvYlBERixcclxuICAgICAgb3B0aW9ucy50aXRsZS50cmltKCkucmVwbGFjZSgvW15hLXpBLVowLTldL2csIFwiX1wiKSArIEV4cG9ydEV4dGVudGlvbnMuUERGXHJcbiAgICApO1xyXG4gIH1cclxuICByZXR1cm4gYmxvYlBERjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGF1dG9UYWJsZU9wdGlvbnMoXHJcbiAgZG9jOiBhbnksXHJcbiAgb3B0aW9uczogYW55LFxyXG4gIHRvdGFsUGFnZXNFeHA6IHN0cmluZyxcclxuICBiZ0NvbG9yOiBJUmVwb3J0Um93XHJcbik6IFVzZXJPcHRpb25zIHtcclxuICBjb25zdCBvZGRSb3dGaWxsQ29sb3IgPSBoZXhUb1JnYihiZ0NvbG9yLm9kZCB8fCBmaWxsQ29sb3Iub2RkKTtcclxuICBjb25zdCBldmVuUm93RmlsbENvbG9yID0gaGV4VG9SZ2IoYmdDb2xvci5ldmVuIHx8IGZpbGxDb2xvci5ldmVuKTtcclxuICBjb25zdCBncm91cFRvdGFsRmlsbENvbG9yID0gaGV4VG9SZ2IoXHJcbiAgICBiZ0NvbG9yLmdyb3VwVG90YWwgfHwgZmlsbENvbG9yLmdyb3VwVG90YWxcclxuICApO1xyXG4gIHJldHVybiB7XHJcbiAgICAuLi5vcHRpb25zLFxyXG4gICAgdGhlbWU6IFwiZ3JpZFwiLFxyXG4gICAgcGFnZUJyZWFrOiBcImF1dG9cIixcclxuICAgIHJvd1BhZ2VCcmVhazogXCJhdm9pZFwiLFxyXG4gICAgaGVhZFN0eWxlczoge1xyXG4gICAgICBmb250U2l6ZTogNyxcclxuICAgICAgY2VsbFBhZGRpbmc6IDEsXHJcbiAgICAgIGxpbmVDb2xvcjogWzIwMCwgMjAwLCAyMDBdLFxyXG4gICAgICBsaW5lV2lkdGg6IDAuMSxcclxuICAgICAgdmFsaWduOiBcIm1pZGRsZVwiLFxyXG4gICAgICBoYWxpZ246IFwiY2VudGVyXCIsXHJcbiAgICAgIG1pbkNlbGxIZWlnaHQ6IDcsXHJcbiAgICAgIC4uLm9wdGlvbnMuaGVhZFN0eWxlcyxcclxuICAgIH0sXHJcbiAgICBib2R5U3R5bGVzOiB7XHJcbiAgICAgIGZvbnRTaXplOiA3LFxyXG4gICAgICBjZWxsUGFkZGluZzogMSxcclxuICAgICAgdmFsaWduOiBcIm1pZGRsZVwiLFxyXG4gICAgICBtaW5DZWxsSGVpZ2h0OiA3LFxyXG4gICAgICAuLi5vcHRpb25zLmJvZHlTdHlsZXMsXHJcbiAgICB9LFxyXG4gICAgY29sdW1uU3R5bGVzOiB7IGxpbmVDb2xvcjogMTAwLCB2YWxpZ246IFwibWlkZGxlXCIsIC4uLm9wdGlvbnMuY29sU3R5bGVzIH0sXHJcbiAgICBtYXJnaW46IHsgdG9wOiAxMCwgbGVmdDogNywgcmlnaHQ6IDcgfSxcclxuICAgIGRpZFBhcnNlQ2VsbDogKGRhdGEpID0+IHtcclxuICAgICAgLy8gZGF0YS5cclxuICAgICAgaWYgKGRhdGEuc2VjdGlvbiA9PT0gXCJoZWFkXCIpIHtcclxuICAgICAgICBkYXRhLmNlbGwuc3R5bGVzLmZpbGxDb2xvciA9IG9wdGlvbnMuaEZpbGxDb2xvcjtcclxuICAgICAgICBkYXRhLmNlbGwuc3R5bGVzLnRleHRDb2xvciA9IG9wdGlvbnMuaFRleHRDb2xvcjtcclxuICAgICAgfSBlbHNlIGlmIChkYXRhLnNlY3Rpb24gPT09IFwiYm9keVwiICYmICFkYXRhLnJvdy5yYXdbMF0pIHtcclxuICAgICAgICBkYXRhLmNlbGwuc3R5bGVzLmZpbGxDb2xvciA9IGRhdGEucm93LnJhd1tcImlzR3JvdXBUb3RhbFwiXVxyXG4gICAgICAgICAgPyBncm91cFRvdGFsRmlsbENvbG9yXHJcbiAgICAgICAgICA6IChkYXRhLnJvdy5yYXdbXCJTTm9cIl0gfHwgZGF0YS5yb3cuaW5kZXgpICUgMlxyXG4gICAgICAgICAgPyBvZGRSb3dGaWxsQ29sb3JcclxuICAgICAgICAgIDogZXZlblJvd0ZpbGxDb2xvcjtcclxuICAgICAgfVxyXG4gICAgICBpZiAoZGF0YS5zZWN0aW9uID09PSBcImJvZHlcIiAmJiBkYXRhLmNvbHVtbi5yYXdbXCJ0eXBlXCJdID09PSBcImNoZWNrZWRcIikge1xyXG4gICAgICAgIGNvbnN0IGNlbGxzID0gZGF0YS5yb3cuY2VsbHNbZGF0YS5jb2x1bW4uZGF0YUtleV07XHJcbiAgICAgICAgY2VsbHMuc3R5bGVzLmZvbnQgPSBcIldpbmdkaW5nc1wiO1xyXG4gICAgICAgIGNlbGxzLnN0eWxlcy5oYWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgICAgIGNlbGxzLnRleHQgPSBbY2VsbHMucmF3ID8gXCIxXCIgOiBcIi1cIl07XHJcbiAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgZGlkRHJhd1BhZ2U6IChkYXRhKSA9PiB7XHJcbiAgICAgIC8vIEZvb3RlclxyXG4gICAgICBsZXQgc3RyID0gXCJQYWdlIFwiICsgZG9jLmdldE51bWJlck9mUGFnZXMoKTtcclxuICAgICAgaWYgKHR5cGVvZiBkb2MucHV0VG90YWxQYWdlcyA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgc3RyID0gYCR7c3RyfSBvZiAke3RvdGFsUGFnZXNFeHB9YDtcclxuICAgICAgfVxyXG4gICAgICBkb2Muc2V0Rm9udFNpemUoNyk7XHJcbiAgICAgIGNvbnN0IHBhZ2VTaXplID0gZG9jLmludGVybmFsLnBhZ2VTaXplO1xyXG4gICAgICBjb25zdCBwYWdlSGVpZ2h0ID0gcGFnZVNpemUuaGVpZ2h0XHJcbiAgICAgICAgPyBwYWdlU2l6ZS5oZWlnaHRcclxuICAgICAgICA6IHBhZ2VTaXplLmdldEhlaWdodCgpO1xyXG4gICAgICBkb2MudGV4dChzdHIsIChkYXRhLnNldHRpbmdzIGFzIGFueSkubWFyZ2luLnJpZ2h0LCBwYWdlSGVpZ2h0IC0gMTApO1xyXG4gICAgfSxcclxuICB9O1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhwb3J0RXhjZWwoZXhjZWxPcHRpb25zOiBFeGNlbE9wdGlvbnMpOiBQcm9taXNlPEJsb2I+IHtcclxuICAvLyBFeGNlbCBUaXRsZSwgSGVhZGVyLCBEYXRhXHJcbiAgY29uc3QgaGVhZGVyOiBhbnlbXSA9IGV4Y2VsT3B0aW9ucy5jb2x1bW5zO1xyXG4gIGNvbnN0IGRhdGE6IGFueVtdID0gZXhjZWxPcHRpb25zLnJlcG9ydHM7XHJcbiAgY29uc3QgcmVwb3J0VGl0bGUgPSBleGNlbE9wdGlvbnMucmVwb3J0VGl0bGU7XHJcbiAgY29uc3QgcmVwb3J0RGF0ZSA9IGV4Y2VsT3B0aW9ucy5yZXBvcnREYXRlO1xyXG4gIGNvbnN0IEZyb21EYXRlID0gZXhjZWxPcHRpb25zLkZyb21EYXRlO1xyXG4gIGNvbnN0IFRvRGF0ZSA9IGV4Y2VsT3B0aW9ucy5Ub0RhdGU7XHJcbiAgY29uc3Qgcm93RGF0YUdyb3VwID0gZXhjZWxPcHRpb25zLnJvd0RhdGFHcm91cDtcclxuICBjb25zdCB0aXRsZSA9IGV4Y2VsT3B0aW9ucy50aXRsZTtcclxuICBjb25zdCByb3dEYXRhR3JvdXBDb2xzID0gZXhjZWxPcHRpb25zLnJvd0RhdGFHcm91cENvbHM7XHJcbiAgY29uc3QgaXNCbG9iID0gZXhjZWxPcHRpb25zLmlzQmxvYjtcclxuICBjb25zdCBiZ0NvbG9yID0gZXhjZWxPcHRpb25zLmJnQ29sb3IgfHwge307XHJcbiAgY29uc3QgaGVhZGVyUm93RmlsbENvbG9yID0gYmdDb2xvci5oZWFkZXIgfHwgZmlsbENvbG9yLmhlYWRlcjtcclxuICBjb25zdCBvZGRSb3dGaWxsQ29sb3IgPSBiZ0NvbG9yLm9kZCB8fCBmaWxsQ29sb3Iub2RkO1xyXG4gIGNvbnN0IGV2ZW5Sb3dGaWxsQ29sb3IgPSBiZ0NvbG9yLmV2ZW4gfHwgZmlsbENvbG9yLmV2ZW47XHJcbiAgY29uc3QgZ3JvdXBGaWxsQ29sb3IgPSBiZ0NvbG9yLmdyb3VwIHx8IGZpbGxDb2xvci5ncm91cDtcclxuICBjb25zdCBzdWJHcm91cEZpbGxDb2xvciA9IGJnQ29sb3Iuc3ViZ3JvdXAgfHwgZmlsbENvbG9yLnN1Ymdyb3VwO1xyXG4gIGNvbnN0IHN1YlRvdGFsRmlsbENvbG9yID0gYmdDb2xvci5ncm91cFRvdGFsIHx8IGZpbGxDb2xvci5ncm91cFRvdGFsO1xyXG4gIGNvbnN0IHVybEtleXMgPSBoZWFkZXIuZmlsdGVyKChmKSA9PiBmLnR5cGUgPT09IFwidXJsXCIpLm1hcCgobSkgPT4gbS5rZXkpO1xyXG4gIGNvbnN0IGNoZWNrZWRLZXlzID0gaGVhZGVyXHJcbiAgICAuZmlsdGVyKChmKSA9PiBmLnR5cGUgPT09IFwiY2hlY2tlZFwiKVxyXG4gICAgLm1hcCgobSkgPT4gbS5rZXkpO1xyXG5cclxuICBjb25zdCBrZXlzID0ge1xyXG4gICAgc3RhcnQ6IGhlYWRlclswXS5rZXksXHJcbiAgICBlbmQ6IGhlYWRlcltoZWFkZXIubGVuZ3RoIC0gMV0ua2V5LFxyXG4gIH07XHJcblxyXG4gIGNvbnN0IHdvcmtib29rID0gbmV3IFdvcmtib29rKCk7XHJcblxyXG4gIGNvbnN0IGNlbnRlckFsaWduOiBQYXJ0aWFsPEFsaWdubWVudD4gPSB7XHJcbiAgICB2ZXJ0aWNhbDogXCJtaWRkbGVcIixcclxuICAgIGhvcml6b250YWw6IFwiY2VudGVyXCIsXHJcbiAgfTtcclxuICBjb25zdCBkZWZhdWx0Qm9yZGVyID0ge1xyXG4gICAgdG9wOiB7IHN0eWxlOiBcInRoaW5cIiwgY29sb3I6IHsgYXJnYjogXCJBQUFBQUFcIiB9IH0sXHJcbiAgICBsZWZ0OiB7IHN0eWxlOiBcInRoaW5cIiwgY29sb3I6IHsgYXJnYjogXCJBQUFBQUFcIiB9IH0sXHJcbiAgICBib3R0b206IHsgc3R5bGU6IFwidGhpblwiLCBjb2xvcjogeyBhcmdiOiBcIkFBQUFBQVwiIH0gfSxcclxuICAgIHJpZ2h0OiB7IHN0eWxlOiBcInRoaW5cIiwgY29sb3I6IHsgYXJnYjogXCJBQUFBQUFcIiB9IH0sXHJcbiAgfTtcclxuXHJcbiAgY29uc3Qgd29ya3NoZWV0ID0gd29ya2Jvb2suYWRkV29ya3NoZWV0KFwiU2hlZXQxXCIsIHsgdmlld3M6IFtdIH0pO1xyXG4gIHdvcmtzaGVldC5jb2x1bW5zID0gaGVhZGVyO1xyXG5cclxuICBjb25zdCBnZXRGaWxsQ29sb3IgPSAoY29sb3I6IHN0cmluZykgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogXCJwYXR0ZXJuXCIsXHJcbiAgICAgIHBhdHRlcm46IFwic29saWRcIixcclxuICAgICAgZmdDb2xvcjogeyBhcmdiOiBjb2xvciB9LFxyXG4gICAgICBiZ0NvbG9yOiB7IGFyZ2I6IGNvbG9yIH0sXHJcbiAgICB9IGFzIEZpbGw7XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgZ2V0Q2VsbEJvcmRlciA9IChzdHlsZTogYW55ID0gZGVmYXVsdEJvcmRlcikgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdG9wOiBzdHlsZS50b3AsXHJcbiAgICAgIGJvdHRvbTogc3R5bGUuYm90dG9tLFxyXG4gICAgICBsZWZ0OiBzdHlsZS5sZWZ0LFxyXG4gICAgICByaWdodDogc3R5bGUucmlnaHQsXHJcbiAgICB9O1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IG1lcmdlQ2VsbHMgPSAocm93OiBhbnksIHN0eWxlOiBhbnkpID0+IHtcclxuICAgIGNvbnN0IHN0YXJ0ID0gcm93LmdldENlbGwoa2V5cy5zdGFydCk7XHJcbiAgICBzdGFydC5hbGlnbm1lbnQgPSBjZW50ZXJBbGlnbjtcclxuICAgIE9iamVjdC5rZXlzKHN0eWxlKS5mb3JFYWNoKChmaWVsZCkgPT4ge1xyXG4gICAgICBzdGFydFtmaWVsZF0gPSBzdHlsZVtmaWVsZF07XHJcbiAgICB9KTtcclxuICAgIGNvbnN0IGVuZCA9IHJvdy5nZXRDZWxsKGtleXMuZW5kKTtcclxuICAgIHdvcmtzaGVldC5tZXJnZUNlbGxzKGAke3N0YXJ0LmFkZHJlc3N9OiR7ZW5kLmFkZHJlc3N9YCk7XHJcbiAgfTtcclxuXHJcbiAgaWYgKHJlcG9ydFRpdGxlKSB7XHJcbiAgICBjb25zdCB0aXRsZVJvdyA9IHdvcmtzaGVldC5hZGRSb3coW3JlcG9ydFRpdGxlLkNvbXBhbnlOYW1lLnRvVXBwZXJDYXNlKCldKTtcclxuICAgIHRpdGxlUm93LmhlaWdodCA9IDI3LjU7XHJcbiAgICBjb25zdCB0aXRsZVN0eWxlID0geyBmb250OiB7IHNpemU6IDE2LCBib2xkOiB0cnVlIH0gfTtcclxuICAgIG1lcmdlQ2VsbHModGl0bGVSb3csIHRpdGxlU3R5bGUpO1xyXG5cclxuICAgIGNvbnN0IGFkZHJlc3NSb3cgPSB3b3Jrc2hlZXQuYWRkUm93KFtyZXBvcnRUaXRsZS5BZGRyZXNzXSk7XHJcbiAgICBhZGRyZXNzUm93LmhlaWdodCA9IDI1O1xyXG4gICAgY29uc3QgYWRkcmVzc1N0eWxlID0geyBmb250OiB7IHNpemU6IDE0IH0gfTtcclxuICAgIG1lcmdlQ2VsbHMoYWRkcmVzc1JvdywgYWRkcmVzc1N0eWxlKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHN1YnRpdGxlUm93ID0gd29ya3NoZWV0LmFkZFJvdyhbdGl0bGVdKTtcclxuICBzdWJ0aXRsZVJvdy5oZWlnaHQgPSAyNTtcclxuICBjb25zdCBzdWJ0aXRsZVN0eWxlID0ge1xyXG4gICAgZm9udDogeyBzaXplOiAxNCwgYm9sZDogdHJ1ZSB9LFxyXG4gICAgZmlsbDogZ2V0RmlsbENvbG9yKFwiRkZERENDXCIpLFxyXG4gIH07XHJcbiAgbWVyZ2VDZWxscyhzdWJ0aXRsZVJvdywgc3VidGl0bGVTdHlsZSk7XHJcblxyXG4gIC8vIGNvbnN0IHJlcXVlc3RSb3cgPSB3b3Jrc2hlZXQuYWRkUm93KFtgJHtGcm9tRGF0ZX0gJHtUb0RhdGV9ICR7cmVwb3J0RGF0ZX1gXSk7XHJcbiAgY29uc3QgcmVxdWVzdFJvdyA9IHdvcmtzaGVldC5hZGRSb3coXHJcbiAgICBoZWFkZXIubWFwKChtLCBpKSA9PiB7XHJcbiAgICAgIGlmIChpID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIEZyb21EYXRlO1xyXG4gICAgICB9IGVsc2UgaWYgKGkgPT09IDIpIHtcclxuICAgICAgICByZXR1cm4gVG9EYXRlO1xyXG4gICAgICB9IGVsc2UgaWYgKGkgPT09IGhlYWRlci5sZW5ndGggLSAyKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlcG9ydERhdGU7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIFwiXCI7XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgKTtcclxuICByZXF1ZXN0Um93LmhlaWdodCA9IDIxLjI1O1xyXG4gIGNvbnN0IHJlcXVlc3RTdHlsZSA9IHtcclxuICAgIGZvbnQ6IHsgc2l6ZTogMTIgfSxcclxuICAgIGFsaWdubWVudDogeyB2ZXJ0aWNhbDogXCJtaWRkbGVcIiwgaG9yaXpvbnRhbDogXCJkaXN0cmlidXRlZFwiIH0sXHJcbiAgICBmaWxsOiBnZXRGaWxsQ29sb3IoXCJFNkYyRkZcIiksXHJcbiAgfTtcclxuICBjb25zdCBmcm9tRGF0ZVN0YXJ0ID0gcmVxdWVzdFJvdy5nZXRDZWxsKGtleXMuc3RhcnQpO1xyXG4gIGNvbnN0IGZyb21EYXRlRW5kID0gcmVxdWVzdFJvdy5nZXRDZWxsKGhlYWRlclsxXS5rZXkpO1xyXG4gIGZyb21EYXRlU3RhcnQuZm9udCA9IHsgc2l6ZTogMTIgfTtcclxuICBmcm9tRGF0ZVN0YXJ0LmFsaWdubWVudCA9IHsgdmVydGljYWw6IFwibWlkZGxlXCIsIGhvcml6b250YWw6IFwibGVmdFwiIH07XHJcbiAgZnJvbURhdGVTdGFydC5maWxsID0gZ2V0RmlsbENvbG9yKFwiRTZGMkZGXCIpO1xyXG4gIHdvcmtzaGVldC5tZXJnZUNlbGxzKGAke2Zyb21EYXRlU3RhcnQuYWRkcmVzc306JHtmcm9tRGF0ZUVuZC5hZGRyZXNzfWApO1xyXG4gIGNvbnN0IHRvRGF0ZVN0YXJ0ID0gcmVxdWVzdFJvdy5nZXRDZWxsKGhlYWRlclsyXS5rZXkpO1xyXG4gIGNvbnN0IHRvRGF0ZUVuZCA9IHJlcXVlc3RSb3cuZ2V0Q2VsbChcclxuICAgIGhlYWRlcltoZWFkZXIubGVuZ3RoID4gNCA/IGhlYWRlci5sZW5ndGggLSAzIDogMl0ua2V5XHJcbiAgKTtcclxuICB0b0RhdGVTdGFydC5mb250ID0geyBzaXplOiAxMiB9O1xyXG4gIHRvRGF0ZVN0YXJ0LmFsaWdubWVudCA9IHsgdmVydGljYWw6IFwibWlkZGxlXCIsIGhvcml6b250YWw6IFwiY2VudGVyXCIgfTtcclxuICB0b0RhdGVTdGFydC5maWxsID0gZ2V0RmlsbENvbG9yKFwiRTZGMkZGXCIpO1xyXG4gIHdvcmtzaGVldC5tZXJnZUNlbGxzKGAke3RvRGF0ZVN0YXJ0LmFkZHJlc3N9OiR7dG9EYXRlRW5kLmFkZHJlc3N9YCk7XHJcbiAgY29uc3QgcmVwb3J0RGF0ZVN0YXJ0ID0gcmVxdWVzdFJvdy5nZXRDZWxsKFxyXG4gICAgaGVhZGVyW2hlYWRlci5sZW5ndGggPiA0ID8gaGVhZGVyLmxlbmd0aCAtIDIgOiAzXS5rZXlcclxuICApO1xyXG4gIGNvbnN0IHJlcG9ydERhdGVFbmQgPSByZXF1ZXN0Um93LmdldENlbGwoa2V5cy5lbmQpO1xyXG4gIHJlcG9ydERhdGVTdGFydC5mb250ID0geyBzaXplOiAxMiB9O1xyXG4gIHJlcG9ydERhdGVTdGFydC5hbGlnbm1lbnQgPSB7IHZlcnRpY2FsOiBcIm1pZGRsZVwiLCBob3Jpem9udGFsOiBcInJpZ2h0XCIgfTtcclxuICByZXBvcnREYXRlU3RhcnQuZmlsbCA9IGdldEZpbGxDb2xvcihcIkU2RjJGRlwiKTtcclxuICB3b3Jrc2hlZXQubWVyZ2VDZWxscyhgJHtyZXBvcnREYXRlU3RhcnQuYWRkcmVzc306JHtyZXBvcnREYXRlRW5kLmFkZHJlc3N9YCk7XHJcbiAgLy8gY29uc3Qgc3RhcnQgPSByZXF1ZXN0Um93LmdldENlbGwoa2V5cy5zdGFydCk7XHJcbiAgLy8gc3RhcnQuYWxpZ25tZW50ID0gY2VudGVyQWxpZ247XHJcbiAgLy8gT2JqZWN0LmtleXMocmVxdWVzdFN0eWxlKS5mb3JFYWNoKChmaWVsZCkgPT4ge1xyXG4gIC8vICAgc3RhcnRbZmllbGRdID0gcmVxdWVzdFN0eWxlW2ZpZWxkXTtcclxuICAvLyB9KTtcclxuICAvLyBjb25zdCBlbmQgPSByZXF1ZXN0Um93LmdldENlbGwoa2V5cy5lbmQpO1xyXG4gIC8vIHdvcmtzaGVldC5tZXJnZUNlbGxzKGAke3N0YXJ0LmFkZHJlc3N9OiR7ZW5kLmFkZHJlc3N9YCk7XHJcbiAgLy8gbWVyZ2VDZWxscyhyZXF1ZXN0Um93LCByZXF1ZXN0U3R5bGUpO1xyXG5cclxuICBjb25zdCBoZWFkZXJSb3cgPSB3b3Jrc2hlZXQuYWRkUm93KGhlYWRlci5tYXAoKG0pID0+IG0uaGVhZGVyKSk7XHJcbiAgaGVhZGVyUm93LmhlaWdodCA9IDIwO1xyXG4gIGNvbnN0IGhlYWRlclJvd0luZGV4ID0gTnVtYmVyKGhlYWRlclJvdy5nZXRDZWxsKGtleXMuc3RhcnQpLnJvdyk7XHJcbiAgd29ya3NoZWV0LnZpZXdzLnB1c2goeyBzdGF0ZTogXCJmcm96ZW5cIiwgeVNwbGl0OiBoZWFkZXJSb3dJbmRleCB9KTtcclxuICBoZWFkZXJSb3cuZWFjaENlbGwoeyBpbmNsdWRlRW1wdHk6IHRydWUgfSwgKGNlbGwpID0+IHtcclxuICAgIGNlbGwuZmlsbCA9IGdldEZpbGxDb2xvcihoZWFkZXJSb3dGaWxsQ29sb3IpO1xyXG4gICAgY2VsbC5mb250ID0geyBib2xkOiB0cnVlIH07XHJcbiAgICBjZWxsLmFsaWdubWVudCA9IGNlbnRlckFsaWduO1xyXG4gICAgY2VsbC5ib3JkZXIgPSBnZXRDZWxsQm9yZGVyKCk7XHJcbiAgfSk7XHJcblxyXG4gIGRhdGEuZm9yRWFjaCgocm93RGF0YSwgaW5kZXgpID0+IHtcclxuICAgIGNvbnN0IHNldE1ldGFEYXRhUm93ID0gKG1ldGFkYXRhOiBhbnksIG1ldGFDb2x1bW5zOiBhbnkpID0+IHtcclxuICAgICAgaWYgKG1ldGFkYXRhICYmIG1ldGFDb2x1bW5zICYmIG1ldGFDb2x1bW5zLmZpZWxkKSB7XHJcbiAgICAgICAgY29uc3QgZmllbGQgPSBtZXRhQ29sdW1ucy5maWVsZDtcclxuICAgICAgICBjb25zdCBnSGVhZGVyID0gbWV0YUNvbHVtbnMuaGVhZGVyO1xyXG4gICAgICAgIGNvbnN0IGZpbGVkTGlzdDogc3RyaW5nW10gPSBtZXRhQ29sdW1ucy5maWVsZHMgfHwgW107XHJcbiAgICAgICAgY29uc3QgZmlsbENsciA9XHJcbiAgICAgICAgICBmaWxlZExpc3QubGVuZ3RoID4gMSA/IHN1Ykdyb3VwRmlsbENvbG9yIDogZ3JvdXBGaWxsQ29sb3I7XHJcbiAgICAgICAgY29uc3QgY3VycmVudERhdGEgPSBmaWxlZExpc3QucmVkdWNlKChpbml0LCBjdXJyZW50KSA9PiB7XHJcbiAgICAgICAgICBpZiAoaW5pdC5jb2x1bW5zKSB7XHJcbiAgICAgICAgICAgIGluaXQgPSBpbml0LmNvbHVtbnNbcm93RGF0YVtjdXJyZW50XV0gfHwge307XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpbml0ID0gbWV0YWRhdGFbcm93RGF0YVtjdXJyZW50XV0gfHwge307XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gaW5pdDtcclxuICAgICAgICB9LCB7fSBhcyBhbnkpO1xyXG4gICAgICAgIGlmIChjdXJyZW50RGF0YS5pbmRleCA9PT0gaW5kZXgpIHtcclxuICAgICAgICAgIGNvbnN0IGdyb3VwUm93ID0gd29ya3NoZWV0LmFkZFJvdyhbZ0hlYWRlciArIFwiIFwiICsgcm93RGF0YVtmaWVsZF1dKTtcclxuICAgICAgICAgIGdyb3VwUm93LmhlaWdodCA9IDIwO1xyXG4gICAgICAgICAgY29uc3QgZ3JvdXBTdHlsZSA9IHtcclxuICAgICAgICAgICAgZmlsbDogZ2V0RmlsbENvbG9yKGZpbGxDbHIpLFxyXG4gICAgICAgICAgICBib3JkZXI6IGdldENlbGxCb3JkZXIoKSxcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICBtZXJnZUNlbGxzKGdyb3VwUm93LCBncm91cFN0eWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgc3ViTWV0YWRhdGEgPSBjdXJyZW50RGF0YTtcclxuICAgICAgICBjb25zdCBzdWJNZXRhQ29sdW1ucyA9IG1ldGFDb2x1bW5zLmNvbHVtbnM7XHJcbiAgICAgICAgc2V0TWV0YURhdGFSb3coc3ViTWV0YWRhdGEuY29sdW1ucywgc3ViTWV0YUNvbHVtbnMpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgY29uc3Qgc2V0TWV0YURhdGFTdWJUb3RhbFJvdyA9IChtZXRhZGF0YTogYW55LCBtZXRhQ29sdW1uczogYW55KSA9PiB7XHJcbiAgICAgIGlmIChtZXRhZGF0YSAmJiBtZXRhQ29sdW1ucyAmJiBtZXRhQ29sdW1ucy5maWVsZCkge1xyXG4gICAgICAgIGNvbnN0IGZpbGVkTGlzdDogc3RyaW5nW10gPSBtZXRhQ29sdW1ucy5maWVsZHMgfHwgW107XHJcbiAgICAgICAgY29uc3QgZmlsbENsciA9IHN1YlRvdGFsRmlsbENvbG9yO1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnREYXRhID0gZmlsZWRMaXN0LnJlZHVjZSgoaW5pdCwgY3VycmVudCkgPT4ge1xyXG4gICAgICAgICAgaWYgKGluaXQuY29sdW1ucykge1xyXG4gICAgICAgICAgICBpbml0ID0gaW5pdC5jb2x1bW5zW3Jvd0RhdGFbY3VycmVudF1dIHx8IHt9O1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaW5pdCA9IG1ldGFkYXRhW3Jvd0RhdGFbY3VycmVudF1dIHx8IHt9O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIGluaXQ7XHJcbiAgICAgICAgfSwge30gYXMgYW55KTtcclxuICAgICAgICBpZiAoKGN1cnJlbnREYXRhLnN1YlRvdGFsIHx8IHt9KS5pbmRleCA9PT0gaW5kZXgpIHtcclxuICAgICAgICAgIGNvbnN0IHN1YnRvdGFsRGF0YSA9IGhlYWRlci5yZWR1Y2UoKGluaXQsIGN1cnJlbnQpID0+IHtcclxuICAgICAgICAgICAgaW5pdFtjdXJyZW50LmtleV0gPSBjdXJyZW50RGF0YS5zdWJUb3RhbFtjdXJyZW50LmtleV0gfHwgXCJcIjtcclxuICAgICAgICAgICAgcmV0dXJuIGluaXQ7XHJcbiAgICAgICAgICB9LCB7fSk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcInN1YnRvdGFsRGF0YVwiLCBzdWJ0b3RhbERhdGEpO1xyXG4gICAgICAgICAgY29uc3Qgc3ViVG90YWxSb3cgPSB3b3Jrc2hlZXQuYWRkUm93KHN1YnRvdGFsRGF0YSk7XHJcbiAgICAgICAgICBzdWJUb3RhbFJvdy5oZWlnaHQgPSAyMDtcclxuICAgICAgICAgIHN1YlRvdGFsUm93LmVhY2hDZWxsKHsgaW5jbHVkZUVtcHR5OiB0cnVlIH0sIChjZWxsKSA9PiB7XHJcbiAgICAgICAgICAgIGNlbGwuZmlsbCA9IGdldEZpbGxDb2xvcihmaWxsQ2xyKTtcclxuICAgICAgICAgICAgY2VsbC5hbGlnbm1lbnQgPSB7IHZlcnRpY2FsOiBcIm1pZGRsZVwiIH07XHJcbiAgICAgICAgICAgIGNlbGwuYm9yZGVyID0gZ2V0Q2VsbEJvcmRlcigpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHN1Yk1ldGFkYXRhID0gY3VycmVudERhdGE7XHJcbiAgICAgICAgY29uc3Qgc3ViTWV0YUNvbHVtbnMgPSBtZXRhQ29sdW1ucy5jb2x1bW5zO1xyXG4gICAgICAgIHNldE1ldGFEYXRhUm93KHN1Yk1ldGFkYXRhLmNvbHVtbnMsIHN1Yk1ldGFDb2x1bW5zKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIHNldE1ldGFEYXRhUm93KHJvd0RhdGFHcm91cCwgcm93RGF0YUdyb3VwQ29scyk7XHJcbiAgICBjb25zdCByZXBvcnRSb3cgPSB3b3Jrc2hlZXQuYWRkUm93KHJvd0RhdGEpO1xyXG4gICAgc2V0TWV0YURhdGFTdWJUb3RhbFJvdyhyb3dEYXRhR3JvdXAsIHJvd0RhdGFHcm91cENvbHMpO1xyXG4gICAgcmVwb3J0Um93LmhlaWdodCA9IDIwO1xyXG4gICAgcmVwb3J0Um93LmVhY2hDZWxsKHsgaW5jbHVkZUVtcHR5OiB0cnVlIH0sIChjZWxsKSA9PiB7XHJcbiAgICAgIGlmICgocm93RGF0YS5TTm8gfHwgaW5kZXgpICUgMikge1xyXG4gICAgICAgIGNlbGwuZmlsbCA9IGdldEZpbGxDb2xvcihvZGRSb3dGaWxsQ29sb3IpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNlbGwuZmlsbCA9IGdldEZpbGxDb2xvcihldmVuUm93RmlsbENvbG9yKTtcclxuICAgICAgfVxyXG4gICAgICBjZWxsLmFsaWdubWVudCA9IHsgdmVydGljYWw6IFwibWlkZGxlXCIgfTtcclxuICAgICAgY2VsbC5ib3JkZXIgPSBnZXRDZWxsQm9yZGVyKCk7XHJcbiAgICB9KTtcclxuICAgIHVybEtleXMuZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgIGNvbnN0IHVybENlbGwgPSByZXBvcnRSb3cuZ2V0Q2VsbChrZXkpO1xyXG4gICAgICB1cmxDZWxsLnZhbHVlID0ge1xyXG4gICAgICAgIHRleHQ6IHJvd0RhdGFba2V5XSxcclxuICAgICAgICBoeXBlcmxpbms6IHJvd0RhdGFba2V5XSxcclxuICAgICAgfTtcclxuICAgICAgdXJsQ2VsbC5mb250ID0ge1xyXG4gICAgICAgIGNvbG9yOiB7IGFyZ2I6IFwiMDAwMEZGXCIgfSxcclxuICAgICAgfTtcclxuICAgIH0pO1xyXG4gICAgY2hlY2tlZEtleXMuZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgIGNvbnN0IGNoZWNrZWRDZWxsID0gcmVwb3J0Um93LmdldENlbGwoa2V5KTtcclxuICAgICAgaWYgKHJvd0RhdGFba2V5XSkge1xyXG4gICAgICAgIGNoZWNrZWRDZWxsLmZvbnQgPSB7XHJcbiAgICAgICAgICBuYW1lOiBcIldpbmdkaW5nc1wiLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY2hlY2tlZENlbGwudmFsdWUgPSBcIsO8XCI7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY2hlY2tlZENlbGwudmFsdWUgPSBcIi1cIjtcclxuICAgICAgfVxyXG4gICAgICBjaGVja2VkQ2VsbC5hbGlnbm1lbnQgPSBjZW50ZXJBbGlnbjtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG4gIHdvcmtzaGVldC5hZGRSb3coW10pO1xyXG5cclxuICB3b3Jrc2hlZXQuZ2V0Um93KDEpLmhpZGRlbiA9IHRydWU7XHJcblxyXG4gIHJldHVybiB3b3JrYm9vay54bHN4LndyaXRlQnVmZmVyKCkudGhlbigocm93RGF0YSkgPT4ge1xyXG4gICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtyb3dEYXRhXSwgeyB0eXBlOiBFeHBvcnRUeXBlcy5FWENFTCB9KTtcclxuICAgIGlmICghaXNCbG9iKSB7XHJcbiAgICAgIHNhdmVBcyhcclxuICAgICAgICBibG9iLFxyXG4gICAgICAgIHRpdGxlLnRyaW0oKS5yZXBsYWNlKC9bXmEtekEtWjAtOV0vZywgXCJfXCIpICsgRXhwb3J0RXh0ZW50aW9ucy5FWENFTFxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGJsb2I7XHJcbiAgfSk7XHJcbn1cclxuIl19