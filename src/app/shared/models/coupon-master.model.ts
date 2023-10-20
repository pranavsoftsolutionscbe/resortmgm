export class CouponMaster {
  CouponID: number = 0;
  CouponType: string = "";
  ClassID: number = 0;
  RoomRate: number = 0;

  RateName: string = "";
  NoOfGuest: number = 0;
  BreakFast: string = "";
  BreakFastRate: number = 0;
  TotalRate: number = 0;
  TaxIncluded: number = 0;
  ServiceChargeIncluded:  number = 0;
  ServiceChargePercent: number = 0;
  ServiceChargeAccount: number = 0;
  IsLunchIncluded:  number = 0;
  IsDinnerIncluded:  number = 0;
  IsSpecialDinnerIncluded:  number = 0;
  IsBreakFastInclued:  number = 0;
  LunchRate: number = 0;
  DinnerRate: number = 0;
  SpecialDinnerRate: number = 0;
  ValidDays:number=0;
  FromDate:Date= new Date();;
  ToDate:Date= new Date();;
}
