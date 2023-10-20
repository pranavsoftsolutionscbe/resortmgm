import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})


export class CustomDatepickerService {

    convertStringToJson(value: string, DELIMITER: string) {
        const date = value.split(DELIMITER);
        return {
            'day': parseInt(date[2], 10),
            'month': parseInt(date[1], 10),
            'year': parseInt(date[0], 10),
        };
    }
    ConvertDatetoJson(ChDate:Date,obj:any)
    {
        let y = new Date(ChDate).getFullYear();
        let mm = new Date(ChDate).getMonth();
        let d =  new Date(ChDate).getDay();
        obj = { 'year': + y ,  'month': mm, 'day': d  };
        return "";
    }
}