import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Pipe } from "@angular/core";
import * as i0 from "@angular/core";
export class FilterPipe {
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
export class FilterPipeModule {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWZpbHRlci5waXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvcmVwb3J0LXRvb2wvcGlwZXMvbmd4LWZpbHRlci5waXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxJQUFJLEVBQWlCLE1BQU0sZUFBZSxDQUFDOztBQU1wRCxNQUFNLE9BQU8sVUFBVTtJQUNuQjs7OztPQUlHO0lBQ0gsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEtBQVUsRUFBRSxHQUFXO1FBQzNDLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbEIsR0FBRztZQUNDLElBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxNQUFNLENBQUMsd0JBQXdCLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxFQUFFO2dCQUM1RSxLQUFLLEdBQUcsSUFBSSxDQUFDO2dCQUNiLE1BQU07YUFDVDtTQUNKLFFBQVEsTUFBTSxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDakQsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUFBLENBQUM7SUFDRjs7O09BR0c7SUFDSCxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQVU7UUFDdEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFBQSxDQUFDO0lBQ0Y7Ozs7T0FJRztJQUNILE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBVTtRQUN0QixPQUFPLE9BQU8sS0FBSyxLQUFLLFVBQVUsQ0FBQyxDQUFDLENB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LEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3JELEtBQUssUUFBUTtnQkFDVCxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3JELEtBQUssVUFBVTtnQkFDWCxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDbkM7UUFDRCxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFBQSxDQUFDOzhHQTVJTyxVQUFVOzRHQUFWLFVBQVU7OzJGQUFWLFVBQVU7a0JBSnRCLElBQUk7bUJBQUM7b0JBQ0YsSUFBSSxFQUFFLFVBQVU7b0JBQ2hCLElBQUksRUFBRSxLQUFLO2lCQUNkOztBQXFKRCxNQUFNLE9BQU8sZ0JBQWdCOzhHQUFoQixnQkFBZ0I7K0dBQWhCLGdCQUFnQixpQkFwSmhCLFVBQVUsYUFpSlQsWUFBWSxhQWpKYixVQUFVOytHQW9KVixnQkFBZ0IsWUFIZixZQUFZOzsyRkFHYixnQkFBZ0I7a0JBTDVCLFFBQVE7bUJBQUM7b0JBQ04sWUFBWSxFQUFFLENBQUMsVUFBVSxDQUFDO29CQUMxQixPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUM7b0JBQ3ZCLE9BQU8sRUFBRSxDQUFDLFVBQVUsQ0FBQztpQkFDeEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XHJcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9jb21tb25cIjtcclxuaW1wb3J0IHsgUGlwZSwgUGlwZVRyYW5zZm9ybSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XHJcblxyXG5AUGlwZSh7XHJcbiAgICBuYW1lOiBcImZpbHRlckJ5XCIsXHJcbiAgICBwdXJlOiBmYWxzZSxcclxufSlcclxuZXhwb3J0IGNsYXNzIEZpbHRlclBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHthbnl9IHZhbHVlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgaXNGb3VuZE9uV2Fsa2luZyh2YWx1ZTogYW55LCBrZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCB3YWxrZXIgPSB2YWx1ZTtcclxuICAgICAgICBsZXQgZm91bmQgPSBmYWxzZTtcclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIGlmICh3YWxrZXIuaGFzT3duUHJvcGVydHkoa2V5KSB8fCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHdhbGtlciwga2V5KSkge1xyXG4gICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IHdoaWxlICh3YWxrZXIgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yod2Fsa2VyKSk7XHJcbiAgICAgICAgcmV0dXJuIGZvdW5kO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHthbnl9IHZhbHVlXHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgaXNOdW1iZXIodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAhaXNOYU4ocGFyc2VJbnQodmFsdWUsIDEwKSkgJiYgaXNGaW5pdGUodmFsdWUpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIGZ1bmN0aW9uJ3MgdmFsdWUgaWYgdHlwZSBpcyBmdW5jdGlvbiBvdGhlcndpc2Ugc2FtZSB2YWx1ZVxyXG4gICAgICogQHBhcmFtIHs/fSB2YWx1ZVxyXG4gICAgICogQHJldHVybiB7P31cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldFZhbHVlKHZhbHVlOiBhbnkpOiBhbnkge1xyXG4gICAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgPyB2YWx1ZSgpIDogdmFsdWU7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0gez99IGZpbHRlclxyXG4gICAgICogQHJldHVybiB7P31cclxuICAgICAqL1xyXG4gICAgZmlsdGVyQnlTdHJpbmcoZmlsdGVyOiBzdHJpbmcpOiBhbnkge1xyXG4gICAgICAgIGlmIChmaWx0ZXIpIHtcclxuICAgICAgICAgICAgZmlsdGVyID0gZmlsdGVyLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAodmFsdWU6IGFueSkgPT4geyByZXR1cm4gIWZpbHRlciB8fCAodmFsdWUgPyAoJycgKyB2YWx1ZSkudG9Mb3dlckNhc2UoKS5pbmRleE9mKGZpbHRlcikgIT09IC0xIDogZmFsc2UpOyB9O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHs/fSBmaWx0ZXJcclxuICAgICAqIEByZXR1cm4gez99XHJcbiAgICAgKi9cclxuICAgIGZpbHRlckJ5Qm9vbGVhbihmaWx0ZXI6IGJvb2xlYW4pOiBhbnkge1xyXG4gICAgICAgIHJldHVybiAodmFsdWUpID0+IHsgcmV0dXJuIEJvb2xlYW4odmFsdWUpID09PSBmaWx0ZXI7IH07XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0gez99IGZpbHRlclxyXG4gICAgICogQHJldHVybiB7P31cclxuICAgICAqL1xyXG4gICAgZmlsdGVyQnlPYmplY3QoZmlsdGVyOiBhbnkpOiBhbnkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuICh2YWx1ZTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiBmaWx0ZXIpIHtcclxuICAgICAgICAgICAgICAgIGlmIChrZXkgPT09ICckb3InKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5maWx0ZXJCeU9yKGZpbHRlci4kb3IpKEZpbHRlclBpcGUuZ2V0VmFsdWUodmFsdWUpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSB8fCAhRmlsdGVyUGlwZS5pc0ZvdW5kT25XYWxraW5nKHZhbHVlLCBrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5pc01hdGNoaW5nKGZpbHRlcltrZXldLCBGaWx0ZXJQaXBlLmdldFZhbHVlKHZhbHVlW2tleV0pKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHs/fSBmaWx0ZXJcclxuICAgICAqIEBwYXJhbSB7P30gdmFsXHJcbiAgICAgKiBAcmV0dXJuIHs/fVxyXG4gICAgICovXHJcbiAgICBpc01hdGNoaW5nKGZpbHRlcjogYW55LCB2YWw6IGFueSk6IGFueSB7XHJcbiAgICAgICAgc3dpdGNoICh0eXBlb2YgZmlsdGVyKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlsdGVyQnlCb29sZWFuKGZpbHRlcikodmFsKTtcclxuICAgICAgICAgICAgY2FzZSAnc3RyaW5nJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbHRlckJ5U3RyaW5nKGZpbHRlcikodmFsKTtcclxuICAgICAgICAgICAgY2FzZSAnb2JqZWN0JzpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbHRlckJ5T2JqZWN0KGZpbHRlcikodmFsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsdGVyRGVmYXVsdChmaWx0ZXIpKHZhbCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBGaWx0ZXIgdmFsdWUgYnkgJG9yXHJcbiAgICAgKiBAcGFyYW0gez99IGZpbHRlclxyXG4gICAgICogQHJldHVybiB7P31cclxuICAgICAqL1xyXG4gICAgZmlsdGVyQnlPcihmaWx0ZXI6IGFueSk6IGFueSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICByZXR1cm4gKHZhbHVlOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgbGV0IGxlbmd0aCA9IGZpbHRlci5sZW5ndGg7XHJcbiAgICAgICAgICAgIGxldCBhcnJheUNvbXBhcmlzb24gPSBmdW5jdGlvbiAoaSkgeyByZXR1cm4gdmFsdWUuaW5kZXhPZihmaWx0ZXJbaV0pICE9PSAtMTsgfTtcclxuICAgICAgICAgICAgbGV0IG90aGVyQ29tcGFyaXNvbiA9IGZ1bmN0aW9uIChpKSB7IHJldHVybiBfdGhpcy5pc01hdGNoaW5nKGZpbHRlcltpXSwgdmFsdWUpOyB9O1xyXG4gICAgICAgICAgICBsZXQgY29tcGFyaXNvbiA9IEFycmF5LmlzQXJyYXkodmFsdWUpID8gYXJyYXlDb21wYXJpc29uIDogb3RoZXJDb21wYXJpc29uO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29tcGFyaXNvbihpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogRGVmYXVsdCBmaWx0ZXJEZWZhdWx0IGZ1bmN0aW9uXHJcbiAgICAgKiBAcGFyYW0gez99IGZpbHRlclxyXG4gICAgICogQHJldHVybiB7P31cclxuICAgICAqL1xyXG4gICAgZmlsdGVyRGVmYXVsdChmaWx0ZXI6IGFueSk6IGFueSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gZmlsdGVyID09PSB1bmRlZmluZWQgfHwgZmlsdGVyID09IHZhbHVlOyB9O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHs/fSBhcnJheVxyXG4gICAgICogQHBhcmFtIHs/fSBmaWx0ZXJcclxuICAgICAqIEByZXR1cm4gez99XHJcbiAgICAgKi9cclxuICAgIHRyYW5zZm9ybShhcnJheTogYW55W10sIGZpbHRlcjogYW55KTogYW55W10ge1xyXG4gICAgICAgIGlmICghYXJyYXkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGFycmF5O1xyXG4gICAgICAgIH1cclxuICAgICAgICBzd2l0Y2ggKHR5cGVvZiBmaWx0ZXIpIHtcclxuICAgICAgICAgICAgY2FzZSAnYm9vbGVhbic6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJyYXkuZmlsdGVyKHRoaXMuZmlsdGVyQnlCb29sZWFuKGZpbHRlcikpO1xyXG4gICAgICAgICAgICBjYXNlICdzdHJpbmcnOlxyXG4gICAgICAgICAgICAgICAgaWYgKEZpbHRlclBpcGUuaXNOdW1iZXIoZmlsdGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhcnJheS5maWx0ZXIodGhpcy5maWx0ZXJEZWZhdWx0KGZpbHRlcikpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFycmF5LmZpbHRlcih0aGlzLmZpbHRlckJ5U3RyaW5nKGZpbHRlcikpO1xyXG4gICAgICAgICAgICBjYXNlICdvYmplY3QnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFycmF5LmZpbHRlcih0aGlzLmZpbHRlckJ5T2JqZWN0KGZpbHRlcikpO1xyXG4gICAgICAgICAgICBjYXNlICdmdW5jdGlvbic6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJyYXkuZmlsdGVyKGZpbHRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBhcnJheS5maWx0ZXIodGhpcy5maWx0ZXJEZWZhdWx0KGZpbHRlcikpO1xyXG4gICAgfTtcclxufVxyXG5cclxuQE5nTW9kdWxlKHtcclxuICAgIGRlY2xhcmF0aW9uczogW0ZpbHRlclBpcGVdLFxyXG4gICAgaW1wb3J0czogW0NvbW1vbk1vZHVsZV0sXHJcbiAgICBleHBvcnRzOiBbRmlsdGVyUGlwZV0sXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBGaWx0ZXJQaXBlTW9kdWxlIHsgfSJdfQ==