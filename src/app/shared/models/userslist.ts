export class userslist{
    UserID?:number;
    CustID?:number;
    UserCode?:string;
    Password?:string;
    UserName?:string;
    LanguageID?:number;
    UserType?:string;
    Active?:number;
    CreatedBy?:number;
    CreatedDate?:Date;
    UpdatedBy?:number;
    UpdateDate?:Date;
}

export interface SimpleDataModel {
    name: string;
    value: string;
    color?: string;
}
export class userrights{
    MenuID:number;
    MenuName:string;
    ParentMenuID:number;
    MenuItemName:string;
    userID?:number;
    sortno?:number;
    active:boolean;
}
