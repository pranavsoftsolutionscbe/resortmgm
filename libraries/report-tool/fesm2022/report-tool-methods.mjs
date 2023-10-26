import { AES, enc } from 'crypto-js';
import { DatePipe } from '@angular/common';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import * as FileSaver from 'file-saver';
import { ExportExtentions, ExportTypes } from 'report-tool/models';
import { fillColor } from 'report-tool/core';
import { ToWords } from 'to-words';

function joinPaths(...paths) {
    return paths.join("/");
}
function filter(array, filterKey, value) {
    return array.filter((f) => (value ? f[filterKey] === value : f[filterKey]));
}
function filterByMenu(array, keys, value) {
    const [childKey, filterKey] = keys;
    if (value && value.length) {
        const filterData = (data, predicate) => {
            return !!!data
                ? null
                : data.reduce((list, entry) => {
                    let clone = null;
                    if (predicate(entry)) {
                        // if the object matches the filter, clone it as it is
                        clone = Object.assign({}, entry);
                    }
                    else if (entry[childKey] != null) {
                        // if the object has childrens, filter the list of children
                        const children = filterData(entry[childKey], predicate);
                        if (children.length > 0) {
                            // if any of the children matches, clone the parent object, overwrite
                            // the children list with the filtered list
                            clone = Object.assign({}, entry, { children: [...children] });
                        }
                    }
                    // if there's a cloned object, push it to the output list
                    // tslint:disable-next-line: no-unused-expression
                    clone && list.push(clone);
                    return list;
                }, []);
        };
        return filterData(array, (item) => {
            return (item[filterKey] &&
                item[filterKey]
                    .toString()
                    .toLowerCase()
                    .includes(value.toString().toLowerCase()));
        });
    }
    return array;
}
function parseValue(v) {
    // extract number (defaults to 0 if not present)
    const n = +(v.match(/\d+$/) || [0])[0];
    const str = v.replace(n.toString(), ""); // extract string part
    return [str, n];
}
function sort(array, key, isCompare = false) {
    const compare = (x, y) => {
        if (isCompare && typeof x === "string" && typeof y === "string") {
            const a = parseValue(x);
            const b = parseValue(y);
            const result = a[0].localeCompare(b[0]);
            return result === 0 ? a[1] - b[1] : result;
        }
        else if (typeof x === "boolean" && typeof y === "boolean") {
            return x && !y ? -1 : x && y ? 0 : 1;
        }
        return x < y ? -1 : x > y ? 1 : 0;
    };
    return array.sort((a, b) => {
        const x = key
            ? typeof a[key] === "string"
                ? a[key].toLowerCase()
                : a[key]
            : a;
        const y = key
            ? typeof b[key] === "string"
                ? b[key].toLowerCase()
                : b[key]
            : b;
        return compare(x, y);
    });
}
function multiSort(array, keys, isCompare = false) {
    const compare = (x, y) => {
        if (isCompare && typeof x === "string" && typeof y === "string") {
            const a = parseValue(x);
            const b = parseValue(y);
            const result = a[0].localeCompare(b[0]);
            return result === 0 ? a[1] - b[1] : result;
        }
        else if (typeof x === "boolean" && typeof y === "boolean") {
            return x === y ? 0 : x ? -1 : 1;
        }
        return x < y ? -1 : x > y ? 1 : 0;
    };
    let returnArray = array;
    keys.forEach((key) => {
        returnArray = returnArray.sort((a, b) => {
            const x = typeof a[key] === "string" ? a[key].toLowerCase() : a[key];
            const y = typeof b[key] === "string" ? b[key].toLowerCase() : b[key];
            return compare(x, y);
        });
    });
    return returnArray;
}
function groupBy(array, keys) {
    const [parentKey, childKey, sortKey] = keys;
    let parentList = array.filter((f) => !f[parentKey]);
    const childList = filter(array, parentKey);
    parentList.forEach((parent) => {
        const items = filter(childList, parentKey, parent[childKey]);
        if (sortKey) {
            if (typeof sortKey === "string") {
                parent.items = sort(items, sortKey);
            }
            else {
                parent.items = multiSort(items, sortKey);
            }
        }
        else {
            parent.items = items;
        }
    });
    parentList = sortKey ? sort(parentList, sortKey) : parentList;
    return [...parentList];
}
function between(value, min, max) {
    return value >= min && value <= max;
}
function percentage(value, total) {
    return Math.round((value * 100) / total);
}
function isJson(str) {
    try {
        JSON.parse(str);
    }
    catch (e) {
        return false;
    }
    return true;
}

const CypherKey = "cypher123";
function encrypt(plainData) {
    return AES.encrypt(JSON.stringify(plainData), CypherKey);
}
function decrypt(encryptData) {
    if (encryptData) {
        const val = AES.decrypt(encryptData, CypherKey).toString(enc.Utf8);
        return JSON.parse(val);
    }
    else {
        return null;
    }
}

function formatDate(date, format = 'yyyy-MM-ddTHH:mm:ss.SSS') {
    return new DatePipe('en-US').transform(date, format);
}

function pageCaptions(captions) {
    const returnVal = captions.reduce((init, item) => {
        init[item.ControlName] = item.ControlCaption;
        return init;
    }, {});
    return returnVal;
}
function xmlToJson(xml) {
    const xml2json = (srcDOM) => {
        const children = [];
        Object.keys(srcDOM.children).forEach((key) => {
            children.push(srcDOM.children[key]);
        });
        // base case for recursion.
        if (!children.length) {
            return srcDOM.innerHTML;
        }
        // initializing object to be returned.
        const jsonResult = {};
        children.forEach((child) => {
            // checking is child has siblings of same name.
            const childIsArray = children.filter((eachChild) => eachChild.nodeName === child.nodeName)
                .length > 1;
            // if child is array, save the values as array, else as strings.
            if (childIsArray) {
                if (jsonResult[child.nodeName] === undefined) {
                    jsonResult[child.nodeName] = [xml2json(child)];
                }
                else {
                    jsonResult[child.nodeName].push(xml2json(child));
                }
            }
            else {
                jsonResult[child.nodeName] = xml2json(child);
            }
        });
        return jsonResult;
    };
    const parser = new DOMParser();
    return xml2json(parser.parseFromString(xml, "application/xml"));
}
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
        ]
        : null;
}
function rgbToHex(r, g, b) {
    function componentToHex(c) {
        const hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function loginNumberFormat(value, digits = -1, numberFormat = "") {
    value = value && value.toString().length ? value : "0";
    const [fDecimal, fFraction] = numberFormat.toString().split(".");
    const seperators = fDecimal.split(",").reverse();
    const [vDecimal, vFraction] = value.toString().split(".");
    const vDecimalRev = vDecimal.split("").reverse();
    const returnDecimal = seperators.reduce((init, current, idx) => {
        const start = init.replace(",", "").length;
        const end = start + current.length;
        const val = vDecimalRev.slice(start, end).reverse().join("");
        init = val + (val.length && init.length ? "," : "") + init;
        if (idx === seperators.length - 1) {
            const lastStart = init.replace(",", "").length;
            const lastEnd = vDecimalRev.length;
            const lastVal = vDecimalRev.slice(lastStart, lastEnd).reverse().join("");
            init = lastVal + (lastVal.length && init.length ? "," : "") + init;
        }
        return init;
    }, "");
    if (digits === -1) {
        digits = fFraction ? fFraction.length : 0;
    }
    const returnFraction = digits
        ? Number("." + (vFraction || 0))
            .toFixed(digits)
            .substr(1)
        : "";
    return returnDecimal + returnFraction;
}
function changeMenuItem(array, keys, isSort = false) {
    let [labelKey, valueKey] = keys;
    valueKey = valueKey || labelKey;
    const returnValue = array.map((item) => ({
        label: item[labelKey],
        value: valueKey ? item[valueKey] : item,
        data: item,
    }));
    return isSort ? sort(returnValue, "label") : returnValue;
}
function num2Word(num, locale) {
    const converterOptions = { currency: !!locale };
    const toWord = new ToWords({
        localeCode: locale || "en-US",
        converterOptions,
    });
    return toWord.convert(num);
}

function exportPdfTable(orientation) {
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
function exportPdf(pdfOptions) {
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
function autoTableOptions(doc, options, totalPagesExp, bgColor) {
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
async function exportExcel(excelOptions) {
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

/*
 * Public API Surface of report-tool
 */

/**
 * Generated bundle index. Do not edit.
 */

export { autoTableOptions, between, changeMenuItem, decrypt, encrypt, exportExcel, exportPdf, exportPdfTable, filter, filterByMenu, formatDate, groupBy, hexToRgb, isJson, joinPaths, loginNumberFormat, multiSort, num2Word, pageCaptions, parseValue, percentage, rgbToHex, sort, xmlToJson };
//# sourceMappingURL=report-tool-methods.mjs.map
