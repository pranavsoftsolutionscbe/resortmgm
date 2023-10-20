export class RoomType {
  ClientID: number;
  RoomTypeID: number;
  RoomType: string;
  available_to_agent: number=1;
  MemberDiscunt: number=0;
  AgentCommission: number=0;
  IsOfferAvail: number=0;
  OfferFrom: Date;
  OfferTo: Date;
  Active: number=1;
}
