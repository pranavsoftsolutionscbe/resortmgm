import {Injectable, PipeTransform} from '@angular/core';
import {BehaviorSubject,  Observable, of, Subject} from 'rxjs';
import {tabelstr} from './tabelstur';
import {DecimalPipe} from '@angular/common';
import {debounceTime, delay, switchMap, tap} from 'rxjs/operators';
// import {SortDirection} from './sortable.directive';

interface SearchResult {
  countries: any[];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: string;
  // sortDirection: SortDirection;
  tabeldatas:tabelstr[];
}

function compare(v1, v2) {
  return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
}

function sort(countries: tabelstr[], column: string, direction: string): tabelstr[] {
  if (direction === '') {
    return countries;
  } else {
    return [...countries].sort((a, b) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}

function matches(country: tabelstr, term: string, pipe: PipeTransform) {
  return country.column1.toLowerCase().includes(term)
    || pipe.transform(country.column2).includes(term)
    || pipe.transform(country.column3).includes(term);
}

@Injectable({providedIn: 'root'})
export class Tabelservice {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _countries$ = new BehaviorSubject<tabelstr[]>([]);
  private tables :tabelstr[]=[];
  private _test = new BehaviorSubject<number>(2);
  private tabestore: {tbls:tabelstr[]}={tbls:[]};
  readonly tbls = this._countries$.asObservable();
  private _total$ = new BehaviorSubject<number>(0);
  
  
  private _state: State = {
    page: 1,
    pageSize: 4,
    searchTerm: '',
    sortColumn: '',
    // sortDirection: '',
    tabeldatas:[]
  };

  constructor(private pipe: DecimalPipe) {
    // this._search$.pipe(
    //   tap(() => this._loading$.next(true)),
    //   debounceTime(200),
    //   switchMap(() => this._search()),
    //   delay(200),
    //   tap(() => this._loading$.next(false))
    // ).subscribe(result => {
    //   this._countries$.next(result.countries);
    //   this._total$.next(result.total);
    // });

    // this._search$.next();
  }
 get tbldata(){
   return this.tables;
 }
 set tbldata (tdata:tabelstr[]){
   this.tables = tdata;
 }
  get countries$()
   {
      return  this._countries$.asObservable(); 
    }
  get total$() { return this._total$.asObservable(); }

  get loading$() { return this._loading$.asObservable(); }
  get page() { return this._state.page; }
  get pageSize() { return this._state.pageSize; }
  get searchTerm() { return this._state.searchTerm; }

  set page(page: number) { this._set({page}); }
  set pageSize(pageSize: number) { this._set({pageSize}); }
  set searchTerm(searchTerm: string) { this._set({searchTerm}); }
  set sortColumn(sortColumn: string) { this._set({sortColumn}); }
  // set sortDirection(sortDirection: SortDirection) { this._set({sortDirection}); }
  set countries(tabeldatas:tabelstr[]){
    console.log("items,tabelstr[]",tabeldatas)
    
    this._set({tabeldatas});
  } 
  
  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    console.log(this._state,"items _set",patch);
    this._search$.next();
  }

  // private _search(): Observable<SearchResult> {
  //   const {sortColumn, sortDirection, pageSize, page, searchTerm} = this._state;

  //   // 1. sort
  //   let countries = sort(this.countries, sortColumn, sortDirection);

  //   // 2. filter
  //   countries = countries.filter(country => matches(country, searchTerm, this.pipe));
  //   const total = countries.length;

  //   // 3. paginate
  //   countries = countries.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
  //   return of({countries, total});
  // }
}