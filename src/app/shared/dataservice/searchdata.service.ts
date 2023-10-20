import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class SearchDataService {

    filterMembers(data: any, keyword: string) {
        return data.filter((data: any) => data.toLowerCase().includes(keyword.toLowerCase()));
    }
}