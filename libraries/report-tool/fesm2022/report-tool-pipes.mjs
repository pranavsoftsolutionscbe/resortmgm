import * as i0 from '@angular/core';
import { Pipe, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

class FilterPipe {
    /**
     * @param {any} value
     * @param {string} key
     * @return {boolean}
     */
    static isFoundOnWalking(value, key) {
        let walker = value;
        let found = false;
        do {
            if (walker.hasOwnProperty(key) || Object.getOwnPropertyDescriptor(walker, key)) {
                found = true;
                break;
            }
        } while (walker = Object.getPrototypeOf(walker));
        return found;
    }
    ;
    /**
     * @param {any} value
     * @return {boolean}
     */
    static isNumber(value) {
        return !isNaN(parseInt(value, 10)) && isFinite(value);
    }
    ;
    /**
     * Checks function's value if type is function otherwise same value
     * @param {?} value
     * @return {?}
     */
    static getValue(value) {
        return typeof value === 'function' ? value() : value;
    }
    ;
    /**
     * @param {?} filter
     * @return {?}
     */
    filterByString(filter) {
        if (filter) {
            filter = filter.toLowerCase();
        }
        return (value) => { return !filter || (value ? ('' + value).toLowerCase().indexOf(filter) !== -1 : false); };
    }
    ;
    /**
     * @param {?} filter
     * @return {?}
     */
    filterByBoolean(filter) {
        return (value) => { return Boolean(value) === filter; };
    }
    ;
    /**
     * @param {?} filter
     * @return {?}
     */
    filterByObject(filter) {
        var _this = this;
        return (value) => {
            for (let key in filter) {
                if (key === '$or') {
                    if (!_this.filterByOr(filter.$or)(FilterPipe.getValue(value))) {
                        return false;
                    }
                    continue;
                }
                if (!value || !FilterPipe.isFoundOnWalking(value, key)) {
                    return false;
                }
                if (!_this.isMatching(filter[key], FilterPipe.getValue(value[key]))) {
                    return false;
                }
            }
            return true;
        };
    }
    ;
    /**
     * @param {?} filter
     * @param {?} val
     * @return {?}
     */
    isMatching(filter, val) {
        switch (typeof filter) {
            case 'boolean':
                return this.filterByBoolean(filter)(val);
            case 'string':
                return this.filterByString(filter)(val);
            case 'object':
                return this.filterByObject(filter)(val);
        }
        return this.filterDefault(filter)(val);
    }
    ;
    /**
     * Filter value by $or
     * @param {?} filter
     * @return {?}
     */
    filterByOr(filter) {
        var _this = this;
        return (value) => {
            let length = filter.length;
            let arrayComparison = function (i) { return value.indexOf(filter[i]) !== -1; };
            let otherComparison = function (i) { return _this.isMatching(filter[i], value); };
            let comparison = Array.isArray(value) ? arrayComparison : otherComparison;
            for (let i = 0; i < length; i++) {
                if (comparison(i)) {
                    return true;
                }
            }
            return false;
        };
    }
    ;
    /**
     * Default filterDefault function
     * @param {?} filter
     * @return {?}
     */
    filterDefault(filter) {
        return function (value) { return filter === undefined || filter == value; };
    }
    ;
    /**
     * @param {?} array
     * @param {?} filter
     * @return {?}
     */
    transform(array, filter) {
        if (!array) {
            return array;
        }
        switch (typeof filter) {
            case 'boolean':
                return array.filter(this.filterByBoolean(filter));
            case 'string':
                if (FilterPipe.isNumber(filter)) {
                    return array.filter(this.filterDefault(filter));
                }
                return array.filter(this.filterByString(filter));
            case 'object':
                return array.filter(this.filterByObject(filter));
            case 'function':
                return array.filter(filter);
        }
        return array.filter(this.filterDefault(filter));
    }
    ;
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: FilterPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "16.2.1", ngImport: i0, type: FilterPipe, name: "filterBy", pure: false }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: FilterPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: "filterBy",
                    pure: false,
                }]
        }] });
class FilterPipeModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: FilterPipeModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.2.1", ngImport: i0, type: FilterPipeModule, declarations: [FilterPipe], imports: [CommonModule], exports: [FilterPipe] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: FilterPipeModule, imports: [CommonModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.1", ngImport: i0, type: FilterPipeModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [FilterPipe],
                    imports: [CommonModule],
                    exports: [FilterPipe],
                }]
        }] });

/*
 * Public API Surface of report-tool
 */

/**
 * Generated bundle index. Do not edit.
 */

export { FilterPipe, FilterPipeModule };
//# sourceMappingURL=report-tool-pipes.mjs.map
