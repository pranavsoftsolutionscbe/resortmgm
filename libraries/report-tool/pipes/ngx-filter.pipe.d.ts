import { PipeTransform } from "@angular/core";
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
export declare class FilterPipe implements PipeTransform {
    /**
     * @param {any} value
     * @param {string} key
     * @return {boolean}
     */
    static isFoundOnWalking(value: any, key: string): boolean;
    /**
     * @param {any} value
     * @return {boolean}
     */
    static isNumber(value: any): boolean;
    /**
     * Checks function's value if type is function otherwise same value
     * @param {?} value
     * @return {?}
     */
    static getValue(value: any): any;
    /**
     * @param {?} filter
     * @return {?}
     */
    filterByString(filter: string): any;
    /**
     * @param {?} filter
     * @return {?}
     */
    filterByBoolean(filter: boolean): any;
    /**
     * @param {?} filter
     * @return {?}
     */
    filterByObject(filter: any): any;
    /**
     * @param {?} filter
     * @param {?} val
     * @return {?}
     */
    isMatching(filter: any, val: any): any;
    /**
     * Filter value by $or
     * @param {?} filter
     * @return {?}
     */
    filterByOr(filter: any): any;
    /**
     * Default filterDefault function
     * @param {?} filter
     * @return {?}
     */
    filterDefault(filter: any): any;
    /**
     * @param {?} array
     * @param {?} filter
     * @return {?}
     */
    transform(array: any[], filter: any): any[];
    static ɵfac: i0.ɵɵFactoryDeclaration<FilterPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<FilterPipe, "filterBy", false>;
}
export declare class FilterPipeModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<FilterPipeModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<FilterPipeModule, [typeof FilterPipe], [typeof i1.CommonModule], [typeof FilterPipe]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<FilterPipeModule>;
}
