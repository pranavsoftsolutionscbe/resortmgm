import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { Observable } from "rxjs";
import { retry, catchError, map } from "rxjs/operators";
// import { StringMapWithRename } from "@angular/compiler/src/compiler_facade_interface";
import { NgbModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";

const server = environment.server;

const httpOption = {
  headers: new HttpHeaders({ "Content-Type": "application/json" }),
  params: {},
  body: {},
};

@Injectable({
  providedIn: "root",
})
export class DataserviceService {
  constructor(private httpClient: HttpClient) { }

  public GET(endpoint: string): Observable<any> {
    console.log(server + ' test ' + endpoint);
    httpOption.params = { showSpinner: true };
    return this.httpClient.get(server + endpoint, httpOption);
  }

  get(endpoint: string, args = {}): Observable<any> {
    console.log(server + ' test ' + endpoint);
    httpOption.params = args;

    return this.httpClient.get(server + endpoint, httpOption).pipe(
      // map(res => this.encryptDecrptSvc.decrypt(res)),
      map(res => (res)),
      retry(1),
      // catchError(this.errorHandler.bind(this))
    );
  }
  public post(endpoint: string, args = {}): Observable<any> {
    // let encoded = this.encryptDecrptSvc.encrypt(args);

    let encoded = (args);

    console.log("args", args);
    let params = { encoded: encoded };
    // console.log(server + ' save ' + endpoint + ' values ' + Object.values(args));
    return this.httpClient.post(server + endpoint, args, httpOption).pipe(
      map(res => (res)),
      // this.encryptDecrptSvc.decrypt
      retry(1),
      // catchError(this.errorHandler.bind(this))
    );
  }
  public postFile(endpoint: string, formdata: FormData): Observable<any>  {
    return this.httpClient.post(server + endpoint, formdata, { reportProgress: true, observe: 'events' })
      .pipe(
        map(res => (res)),
        retry(1),
        // catchError(this.errorHandler.bind(this)));
      );
  }
  public POST(endpoint: string, params = {}): Observable<any> {
    httpOption.params = { showSpinner: true };
    return this.httpClient.post(server + endpoint, params, httpOption);
  }

  public Put(endpoint: string, params = {}): Observable<any> {
    httpOption.params = { showSpinner: true };
    return this.httpClient.put(server + endpoint, params, httpOption);
  }
  put(endpoint: string, args = {}): Observable<any> {
    let encoded = args;//this.encryptDecrptSvc.encrypt(args);
    let params = { encoded: encoded };
    // console.log(server + ' Update ' + endpoint + ' values ' + Object.values(args));
    return this.httpClient.put(server + endpoint, args, httpOption).pipe(
      map(res => (res)),
      //this.encryptDecrptSvc.decrypt
      retry(1),
      // catchError(this.errorHandler.bind(this))
    );
  }
  public Delete(endpoint: string, params = {}): Observable<any> {
    httpOption.params = { showSpinner: true };
    return this.httpClient.delete(server + endpoint, httpOption);
  }
  errorHandler(err: HttpErrorResponse) {
    console.log(err);
    // if (err.status === 401 || err.status === 403) {
    //   let options: NgbModalOptions = {
    //     backdrop: "static",
    //     keyboard: false
    //   };
    //   const modalRef = this.modalSvc.open(NgbdModalContent, options);
    //   modalRef.componentInstance.modal = err.error;
    // } else if (err.status == 400) {
    //   this.toastSvc.setToast({ ...err.error, classNames: "bg-danger" });
    // } else {
    //   this.toastSvc.setToast({
    //     header: "Error",
    //     message: "No response from server",
    //     classNames: "bg-danger"
    //   });
    // }
    // return throwError(err);
  }
  public postwhatsApp( args = {}): Observable<any> {
    // let encoded = this.encryptDecrptSvc.encrypt(args);
   
    let endpoint: string;
    endpoint = "https://wapp-api.in/api/send.php" + args;// ?number=917373705232&type=text&message=Test Mesage from WhatsApp&instance_id=6312FEFBD6797&access_token=2ed20c5a127fd2c899b1431beb976811"

    let encoded = (args);

   
    let params = { encoded: encoded };
    
    return this.httpClient.post(endpoint, "", httpOption).pipe(
      map(res => (res)),
      // this.encryptDecrptSvc.decrypt
      retry(0),
      // catchError(this.errorHandler.bind(this))
    );
  }
}
