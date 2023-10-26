import { IMenuItem } from "report-tool/models";
export declare function pageCaptions(captions: any[]): any;
export declare function xmlToJson(xml: string): any;
export declare function hexToRgb(hex: string): any;
export declare function rgbToHex(r: number, g: number, b: number): string;
export declare function loginNumberFormat(value: number | string, digits?: number, numberFormat?: string): string;
export declare function changeMenuItem<T>(array: T[], keys: string[], isSort?: boolean): IMenuItem<T>[];
export declare function num2Word(num: number, locale: any): string;
