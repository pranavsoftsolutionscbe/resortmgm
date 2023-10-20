export interface SendEmail {
  SrNo?: number;
  NotifyDate: string;
  SentDate?: string;
  ServerSentDate?: string;
  DeviceReceiveDate?: string;
  Mobile_No?: string;
  RespText: string;
  NotifyStatus: number;
  Notify_method: string;
  SendMethod: string;
  Device_OS?: string;
  device_id?: number;
  BGID?: string;
  Cust_ID: number;
  SMSId?: number;
  Emailid: string;
  EmailSubject: string;
  tripid: number;
  VehicleId?: number;
  HeaderText?: string;
  image_URL?: string;
  // ToEmail: string;
  // Sub: string;
  // msg: string;
}
