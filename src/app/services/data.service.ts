import {DatastoreService} from './datastore.service';
import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {throwError, Observable} from 'rxjs';
import {catchError} from 'rxjs/operators';

import {Damps} from '../models/damps';
import {Cycle} from '../models/cycle';
import {Tpfdd} from '../models/tpfdd';
import {Conusa} from '../models/conusa';
import {TCS} from '../models/tcs';
import {Pay} from '../models/pay';
import {Orders} from '../models/orders';
import {Operation} from '../models/operation';
import {LocationSearch} from '../models/LocationSearch';
import {OpSptCmd} from '../models/opsptcmd';
import {MissionAssign} from '../models/missionassign';
import {Fundcites} from '../models/fundcites';

import {ConlogService} from '../modules/conlog/conlog.service';
import {CommCheck} from "../models/CommCheck";

const httpHeaders = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class DataService {

  errorInfo: any;
  systemUrl = 'assets/config.xml';
  constructor(private http: HttpClient, private ds: DatastoreService, private conlog: ConlogService) { }

  ngOnInit(): void { }

  // Error Handling
  private errorHandler(error: any) {
    let errorMessage: string;

    if(error["errmess"] != null) {
      errorMessage = error["errmess"];
    } else {
      let errorDetails: string = (error.error instanceof ErrorEvent) ? `(Client Error: ${error.error.message})` : `(Server Error: ${error.status}\nMessage: ${error.message})`;

      switch (error.status) {
        case 504:  //Gateway Timeout Error
          errorMessage = `${error.status}: Gateway Timeout Error.\n${errorDetails}`;
          break;
        case 500:   // Internal Server Error
          errorMessage = `The access entry key is now invalid. It is not recommended to use the refresh page at anytime while using this application.  You must close this tab and open from DAMPS-Orders.\n${errorDetails}`;
          break;
        case 401:   // Unauthorized Error
        case 403:   // Forbidden Error
          errorMessage = `Your access cannot be validated, therefore, you are not permitted to use this application.\n${errorDetails}`;
          break;
        case 404:   // Page not Found Error
          errorMessage = `Somehow the yellow brick road has disappeared.  Please return to the hosting application and try again. We apologize for the inconvenience.\n${errorDetails}`;
          break;
        case 0:     // Unknown Error
          errorMessage = `Error Status: ${this.errorInfo.status}: ${this.errorInfo.message}. Recommend executing API comms check.`;
          break;
        case 200:
          errorMessage = `Error Status: TRANSLATION FAILURE (OK: ${error.ok}): ${error.message}. Need to validate translation of returned information.`;
          break;
        default:
          errorMessage = `Error Status: ${this.errorInfo.status}: ${this.errorInfo.message}`;
          break;
      }
    }
    //alert(errorMessage);
    this.ds.generateToast(errorMessage, false);
    this.conlog.log(errorMessage);
    this.conlog.log("WS path: " + this.getWSPath());
    return throwError(errorMessage);
  }

  // This will identify which server is being targeted.
  getWSPath(showPath: boolean = false): string { // This updates the relative path depending on running locally or on a server.
    let wspath: string = (this.ds.system.path != undefined) ? this.ds.system.path : ".";      // Prefix the provided path to the string
    if(this.ds.system.type == 'production') wspath += "/MOBAPI"; // Are we on production or development
    wspath += "/API/OFS";

    if(showPath) this.conlog.log("path is: " + wspath);
    return wspath;
  }

  getSystemConfig() {
    const xml = new XMLHttpRequest();
    xml.open('GET', this.systemUrl, false);
    xml.send();

    const xmlData: any | null = xml.responseXML;
    const sys = xmlData.getElementsByTagName('system');
    for (let i = 0; i < sys.length; i++) {
      if (sys[i].getAttribute('active') === 'true') {
        return {type: sys[i].getAttribute('type'), network: sys[i].getAttribute('network'), path: sys[i].getAttribute('path') };
      }
    }
    return null;
  }

  createKeyObject(){
    let date: Date = new Date();
    let da: number = date.getDate();
    let sep: string = String.fromCharCode((da - 6) + 73);
    return this.ds.getSKey() + sep + this.ds.getPassKey();
  }
  ///////////////////////////////////////////////////////////////////////////////////////

  apiGetCommsCheck() {  // This is used to confirm that the API is accessible
    this.conlog.log("Performing Get Comms Check");
    const params: any = new HttpParams().set('id', 'GET-TEST');
    return this.http.get(`${this.getWSPath(true)}/CheckGetAPICheckWithParam`, {params});
  }

  apiPostCommsCheck() {
    this.conlog.log("Performing Post Comms Check");
    let fullDomain: string = this.getWSPath() + `/CheckPostAPICheckWithParam`;
    const params: CommCheck = {id: 'POST-TEST'};
    return (this.http.post<CommCheck>(fullDomain, params, httpHeaders)
      .pipe(catchError(this.errorHandler)));
  }

  // Retrieve Data from local file
  getColumnData(): any {
    return this.ds.dgColumnData;
  }

  // Establish Secure Connection and Store Retrieved Token
  getSessionToken(userid: number, username: string): Observable<any> {
    // Access via HttpGet
    const params: any = new HttpParams().set('devKey', this.ds.getDevKey()).set('userid', userid).set('username', username);
    return (this.http.get<any>(`${this.getWSPath()}/RequestSessionToken`, {params})
      .pipe(catchError(this.errorHandler)));
  }

  getBearerToken(userid: number) :Observable<any> {
    const params: any = new HttpParams().set('devKey', this.ds.getDevKey()).set('userid', userid);
    return (this.http.get<any>(`${this.getWSPath()}/GetToken`, {params})
      .pipe(catchError(this.errorHandler)));
  }

  // Retrieve Data from Server
  getOperationData(): Observable<any> {
    // Access via HttpGet
    const params: any = new HttpParams().set('sKey', this.ds.getSKey()).set('apiKey', this.ds.getPassKey()).set('op', this.ds.curSelectedButton);
    return (this.http.get<any>(`${this.getWSPath()}/GetOperationData`, {params})
      .pipe(catchError(this.errorHandler)));
  }

  getSubOperationData(subop: string): Observable<any> {
    const params: any = new HttpParams().set('sKey', this.ds.getSKey()).set('apiKey', this.ds.getPassKey()).set('op', subop);
    this.conlog.log("getSubOperationData: " + subop + " with PARAMS: " + this.ds.getSKey() + " " +  this.ds.getPassKey());
    return (this.http.get<any>(`${this.getWSPath()}/GetOperationData`, {params})
      .pipe(catchError(this.errorHandler)));
  }

  searchMissionLocation(locName: string): Observable<any> {
    const params: any = new HttpParams().set('sKey', this.ds.getSKey()).set('apiKey', this.ds.getPassKey()).set('locName', locName);
    return (this.http.get<any>(`${this.getWSPath()}/SearchMissionLocation`, {params})
      .pipe(catchError(this.errorHandler)));
  }

  searchGeoLocation(locName: string): Observable<any> {
    const params: any = new HttpParams().set('sKey', this.ds.getSKey()).set('apiKey', this.ds.getPassKey()).set('locName', locName);
    return (this.http.get<any>(`${this.getWSPath()}/SearchGeoLocation`, {params})
      .pipe(catchError(this.errorHandler)));
  }

  getPayLOA(opID: string): Observable<any> {
    const params: any = new HttpParams().set('sKey', this.ds.getSKey()).set('apiKey', this.ds.getPassKey()).set('opID', opID);
    return (this.http.get<any>(`${this.getWSPath()}/GetPayLinesOfAccounting`, {params})
      .pipe(catchError(this.errorHandler)));
  }

  getTCSLOA(opID: string): Observable<any> {
    const params: any = new HttpParams().set('sKey', this.ds.getSKey()).set('apiKey', this.ds.getPassKey()).set('opID', opID);
    return (this.http.get<any>(`${this.getWSPath()}/GetTCSLinesOfAccounting`, {params})
      .pipe(catchError(this.errorHandler)));
  }

  getAllLOA(ftype: number): Observable<any> {
    const params: any = new HttpParams().set('sKey', this.ds.getSKey()).set('apiKey', this.ds.getPassKey()).set('type', ftype);
    return (this.http.get<any>(`${this.getWSPath()}/GetAllLinesOfAccounting`, {params})
      .pipe(catchError(this.errorHandler)));
  }

  getAutoAttach(): Observable<any> {
    const params: any = new HttpParams().set('devKey', this.ds.getDevKey());
    return (this.http.get<any>(`${this.getWSPath()}/ExecAutoAttach`, {params})
      .pipe(catchError(this.errorHandler)));
  }

  /////////////////////// POSTS
  modifyFPOperationRecord(): Observable<any> {
    let fullDomain: string = this.getWSPath() + `/UpdateFPOperationData`;
    this.ds.curSelectedRecord.kid = this.createKeyObject();
    return (this.http.post<Damps>(fullDomain, this.ds.curSelectedRecord, httpHeaders)
        .pipe(catchError(this.errorHandler)));
  }

  modifyOrdersRecord(): Observable<any> {
    let fullDomain: string = this.getWSPath() + `/UpdateOrdersData`;
    this.ds.curSelectedRecord.kid = this.createKeyObject();
    return (this.http.post<Orders>(fullDomain, this.ds.curSelectedRecord, httpHeaders)
        .pipe(catchError(this.errorHandler)));
  }

  modifyOpsLocationData(locationData: MissionAssign): Observable<any> {
    let fullDomain: string = this.getWSPath() + `/UpdateOpsLocationData`;
    locationData.kid = this.createKeyObject();
    return (this.http.post<MissionAssign>(fullDomain, locationData, httpHeaders)
        .pipe(catchError(this.errorHandler)));
  }

  updatePayRecord(): Observable<any> {
    let fullDomain: string = this.getWSPath() + `/UpdatePayData`;
    this.ds.curSelectedRecord.kid = this.createKeyObject();
    return (this.http.post<Pay>(fullDomain, this.ds.curSelectedRecord, httpHeaders)
        .pipe(catchError(this.errorHandler)));
  }

  updateTCSRecord(): Observable<any> {
    let fullDomain: string = this.getWSPath() + `/UpdateTCSData`;
    this.ds.curSelectedRecord.kid = this.createKeyObject();
    return (this.http.post<TCS>(fullDomain, this.ds.curSelectedRecord, httpHeaders)
        .pipe(catchError(this.errorHandler)));
  }

  updateCONUSARecord(): Observable<any> {
    let fullDomain: string = this.getWSPath() + `/UpdateCONUSAData`;
    this.ds.curSelectedRecord.kid = this.createKeyObject();
    return (this.http.post<Conusa>(fullDomain, this.ds.curSelectedRecord, httpHeaders)
        .pipe(catchError(this.errorHandler)));
  }

  updateLocationData(): Observable<any> {
    let fullDomain: string = this.getWSPath() + `/UpdateLocationData`;
    this.ds.curSelectedRecord.kid = this.createKeyObject();
    return (this.http.post<Location>(fullDomain, this.ds.curSelectedRecord, httpHeaders)
        .pipe(catchError(this.errorHandler)));
  }

  saveMissionLocation(LocationInfo: LocationSearch): Observable<any> {
    let fullDomain: string = this.getWSPath() + `/SaveMissionLocation`;

    if(LocationInfo != null) {
      LocationInfo.kid = this.createKeyObject();
      return (this.http.post<Location>(fullDomain, LocationInfo, httpHeaders)
        .pipe(catchError(this.errorHandler)));
    } else {
      this.ds.generateToast("There is no record selected. Action Aborted.", false);
      return null;
    }
  }

  updateFundCiteData(): Observable<any> {
    let fullDomain: string = this.getWSPath() + `/UpdateFundCiteData`;
    this.ds.curSelectedRecord.kid = this.createKeyObject();
    return (this.http.post<Fundcites>(fullDomain, this.ds.curSelectedRecord, httpHeaders)
        .pipe(catchError(this.errorHandler)));
  }

  updateOperationData(): Observable<any> {
    let fullDomain: string = this.getWSPath() + `/UpdateOpsLookupData`;
    console.log(this.ds.curSelectedRecord);
    this.ds.curSelectedRecord.kid = this.createKeyObject();
    return (this.http.post<Operation>(fullDomain, this.ds.curSelectedRecord as Operation, httpHeaders)
        .pipe(catchError(this.errorHandler)));
  }

  updateOperationSptData(OpSptCmdInfo: OpSptCmd): Observable<any> {
    let fullDomain: string = this.getWSPath() + `/UpdateOpsLookupSptData`;
    OpSptCmdInfo.kid = this.createKeyObject();
    return (this.http.post<Operation>(fullDomain, OpSptCmdInfo, httpHeaders)
        .pipe(catchError(this.errorHandler)));
  }

  updateTPFDDRecord(): Observable<any> {
    let fullDomain: string = this.getWSPath() + `/UpdateTPFDDData`;
    this.ds.curSelectedRecord.kid = this.createKeyObject();
    return (this.http.post<Tpfdd>(fullDomain, this.ds.curSelectedRecord, httpHeaders)
        .pipe(catchError(this.errorHandler)));
  }

  updateCycleRecord(): Observable<any> {
    let fullDomain: string = this.getWSPath() + `/UpdateCycleData`;
    this.ds.curSelectedRecord.kid = this.createKeyObject();
    return (this.http.post<Cycle>(fullDomain, this.ds.curSelectedRecord, httpHeaders)
        .pipe(catchError(this.errorHandler)));
  }
}
