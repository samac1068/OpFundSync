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
  getWSPath(): string { // This updates the relative path depending on running locally or on a server.
    let wspath: string = (this.ds.system.path != undefined) ? this.ds.system.path : "";   // Prefix the provided path to the string
    wspath += (this.ds.system.type == 'production') ? "/MOBAPI/OFS" : "/OFS";             // Are we on production or development
    //this.conlog.log("This api URL is: " + wspath);
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
    return this.http.get(`${this.getWSPath()}/CheckAPIComms`);
  }

  // Retrieve Data from local file
  getColumnData(): any {
    return this.ds.dgColumnData;
  }

  // Establish Secure Connection and Store Retrieved Token
  getSessionToken(userid: number, username: string): Observable<any> {
    /*this.conlog.log('getSessionToken');
    const reqbody: any = {
      devkey: this.ds.getDevKey(),
      userid: userid,
      username: username
    };
    return this.http.post<string>(`${this.getWSPath()}/RequestSessionToken`, reqbody)
      .pipe(catchError(this.errorHandler));*/

    // Access via HttpGet
    const params: any = new HttpParams().set('devKey', this.ds.getDevKey()).set('userid', userid).set('username', username);
    return (this.http.get<any>(`${this.getWSPath()}/RequestSessionToken`, {params})
      .pipe(catchError(this.errorHandler)));
  }

  // Retrieve Data from Server
  getOperationData(): Observable<any> {
    /*this.conlog.log('getOperationData -' + this.ds.curSelectedButton);
    const reqbody: any = {
      sKey: this.ds.getSKey(),
      apiKey: this.ds.getPassKey(),
      op: this.ds.curSelectedButton
    };
    return this.http.post<any>(`${this.getWSPath()}/GetOperationData`, reqbody)
      .pipe(catchError(this.errorHandler));*/

    // Access via HttpGet
    const params: any = new HttpParams().set('sKey', this.ds.getSKey()).set('apiKey', this.ds.getPassKey()).set('op', this.ds.curSelectedButton);
    return (this.http.get<any>(`${this.getWSPath()}/GetOperationData`, {params})
      .pipe(catchError(this.errorHandler)));
  }

  getSubOperationData(subop: string): Observable<any> {
    /*this.conlog.log('getSubOperationData - ' + subop);
    const reqbody: any = {
      sKey: this.ds.getSKey(),
      apiKey: this.ds.getPassKey(),
      op: subop
    };
    return this.http.post<any>(`${this.getWSPath()}/GetOperationData`, reqbody)
      .pipe(catchError(this.errorHandler));*/

    const params: any = new HttpParams().set('sKey', this.ds.getSKey()).set('apiKey', this.ds.getPassKey()).set('op', subop);
    return (this.http.get<any>(`${this.getWSPath()}/GetOperationData`, {params})
      .pipe(catchError(this.errorHandler)));
  }

  searchMissionLocation(locName: string): Observable<any> {
    /*this.conlog.log('searchMissionLocation - ' + locName);
    const reqbody: any = {
      sKey: this.ds.getSKey(),
      apiKey: this.ds.getPassKey(),
      locName: locName
    };
    return this.http.post<any>(`${this.getWSPath()}/SearchMissionLocation`, reqbody)
      .pipe(catchError(this.errorHandler));*/

    const params: any = new HttpParams().set('sKey', this.ds.getSKey()).set('apiKey', this.ds.getPassKey()).set('locName', locName);
    return (this.http.get<any>(`${this.getWSPath()}/SearchMissionLocation`, {params})
      .pipe(catchError(this.errorHandler)));
  }

  searchGeoLocation(locName: string): Observable<any> {
    /*this.conlog.log('searchMissionLocation - ' + locName);
    const reqbody: any = {
      sKey: this.ds.getSKey(),
      apiKey: this.ds.getPassKey(),
      locName: locName
    };
    return this.http.post<any>(`${this.getWSPath()}/SearchGeoLocation`, reqbody)
      .pipe(catchError(this.errorHandler));*/

    const params: any = new HttpParams().set('sKey', this.ds.getSKey()).set('apiKey', this.ds.getPassKey()).set('locName', locName);
    return (this.http.get<any>(`${this.getWSPath()}/SearchGeoLocation`, {params})
      .pipe(catchError(this.errorHandler)));
  }

  getPayLOA(opID: string): Observable<any> {
    /*this.conlog.log('getPayLOA - ' + opID);
    const reqbody: any = {
      sKey: this.ds.getSKey(),
      apiKey: this.ds.getPassKey(),
      opID: opID
    };
    return this.http.post<any>(`${this.getWSPath()}/GetPayLinesOfAccounting`, reqbody)
      .pipe(catchError(this.errorHandler));*/

    const params: any = new HttpParams().set('sKey', this.ds.getSKey()).set('apiKey', this.ds.getPassKey()).set('opID', opID);
    return (this.http.get<any>(`${this.getWSPath()}/GetPayLinesOfAccounting`, {params})
      .pipe(catchError(this.errorHandler)));
  }

  getTCSLOA(opID: string): Observable<any> {
    /*this.conlog.log('getTCSLOA - ' + opID);
    const reqbody: any = {
      sKey: this.ds.getSKey(),
      apiKey: this.ds.getPassKey(),
      opID: opID
    };
    return this.http.post<any>(`${this.getWSPath()}/GetTCSLinesOfAccounting`, reqbody)
      .pipe(catchError(this.errorHandler));*/

    const params: any = new HttpParams().set('sKey', this.ds.getSKey()).set('apiKey', this.ds.getPassKey()).set('opID', opID);
    return (this.http.get<any>(`${this.getWSPath()}/GetTCSLinesOfAccounting`, {params})
      .pipe(catchError(this.errorHandler)));
  }

  getAllLOA(ftype: number): Observable<any> {
    /*this.conlog.log('getAllLOA - ' + ftype);
    const reqbody: any = {
      sKey: this.ds.getSKey(),
      apiKey: this.ds.getPassKey(),
      ftype: ftype
    };
    return this.http.post<any>(`${this.getWSPath()}/GetAllLinesOfAccounting`, reqbody)
      .pipe(catchError(this.errorHandler));*/

    const params: any = new HttpParams().set('sKey', this.ds.getSKey()).set('apiKey', this.ds.getPassKey()).set('type', ftype);
    return (this.http.get<any>(`${this.getWSPath()}/GetAllLinesOfAccounting`, {params})
      .pipe(catchError(this.errorHandler)));
  }

  getAutoAttach(): Observable<any> {
    /*this.conlog.log('getAutoAttach');
    const reqbody: any = {
      devKey: this.ds.getDevKey()
    };
    return this.http.get<any>(`${this.getWSPath()}/ExecAutoAttach`, reqbody)
      .pipe(catchError(this.errorHandler));*/

    const params: any = new HttpParams().set('devKey', this.ds.getDevKey());
    return (this.http.get<any>(`${this.getWSPath()}/ExecAutoAttach`, {params})
      .pipe(catchError(this.errorHandler)));
  }

  /////////////////////// POSTS
  modifyFPOperationRecord(): Observable<any> {
    let fullDomain: string = this.getWSPath() + `/UpdateFPOperationData`;
    return (this.http.post<Damps>(fullDomain + '?kid=' + this.createKeyObject(), this.ds.curSelectedRecord, httpHeaders)
        .pipe(catchError(this.errorHandler)));
  }

  modifyOrdersRecord(): Observable<any> {
    let fullDomain: string = this.getWSPath() + `/UpdateOrdersData`;
    return (this.http.post<Orders>(fullDomain + '?kid=' + this.createKeyObject(), this.ds.curSelectedRecord, httpHeaders)
        .pipe(catchError(this.errorHandler)));
  }

  modifyOpsLocationData(locationData: MissionAssign): Observable<any> {
    let fullDomain: string = this.getWSPath() + `/UpdateOpsLocationData`;
    return (this.http.post<MissionAssign>(fullDomain + '?kid=' + this.createKeyObject(), locationData, httpHeaders)
        .pipe(catchError(this.errorHandler)));
  }

  updatePayRecord(): Observable<any> {
    let fullDomain: string = this.getWSPath() + `/UpdatePayData`;
    return (this.http.post<Pay>(fullDomain + '?kid=' + this.createKeyObject(), this.ds.curSelectedRecord, httpHeaders)
        .pipe(catchError(this.errorHandler)));
  }

  updateTCSRecord(): Observable<any> {
    let fullDomain: string = this.getWSPath() + `/UpdateTCSData`;
    return (this.http.post<TCS>(fullDomain + '?kid=' + this.createKeyObject(), this.ds.curSelectedRecord, httpHeaders)
        .pipe(catchError(this.errorHandler)));
  }

  updateCONUSARecord(): Observable<any> {
    let fullDomain: string = this.getWSPath() + `/UpdateCONUSAData`;
    return (this.http.post<Conusa>(fullDomain + '?kid=' + this.createKeyObject(), this.ds.curSelectedRecord, httpHeaders)
        .pipe(catchError(this.errorHandler)));
  }

  updateLocationData(): Observable<any> {
    let fullDomain: string = this.getWSPath() + `/UpdateLocationData`;
    return (this.http.post<Location>(fullDomain + '?kid=' + this.createKeyObject(), this.ds.curSelectedRecord, httpHeaders)
        .pipe(catchError(this.errorHandler)));
  }

  saveMissionLocation(LocationInfo: LocationSearch): Observable<any> {
    let fullDomain: string = this.getWSPath() + `/SaveMissionLocation`;
    return (this.http.post<Location>(fullDomain + '?kid=' + this.createKeyObject(), LocationInfo, httpHeaders)
        .pipe(catchError(this.errorHandler)));
  }

  updateFundCiteData(): Observable<any> {
    let fullDomain: string = this.getWSPath() + `/UpdateFundCiteData`;
    return (this.http.post<Fundcites>(fullDomain + '?kid=' + this.createKeyObject(), this.ds.curSelectedRecord, httpHeaders)
        .pipe(catchError(this.errorHandler)));
  }

  updateOperationData(): Observable<any> {
    let fullDomain: string = this.getWSPath() + `/UpdateOpsLookupData`;
    console.log(this.ds.curSelectedRecord);
    return (this.http.post<Operation>(fullDomain + '?kid=' + this.createKeyObject(), this.ds.curSelectedRecord as Operation, httpHeaders)
        .pipe(catchError(this.errorHandler)));
  }

  updateOperationSptData(OpSptCmdInfo: OpSptCmd): Observable<any> {
    let fullDomain: string = this.getWSPath() + `/UpdateOpsLookupSptData`;
    return (this.http.post<Operation>(fullDomain + '?kid=' + this.createKeyObject(), OpSptCmdInfo, httpHeaders)
        .pipe(catchError(this.errorHandler)));
  }

  updateTPFDDRecord(): Observable<any> {
    let fullDomain: string = this.getWSPath() + `/UpdateTPFDDData`;
    return (this.http.post<Tpfdd>(fullDomain + '?kid=' + this.createKeyObject(), this.ds.curSelectedRecord, httpHeaders)
        .pipe(catchError(this.errorHandler)));
  }

  updateCycleRecord(): Observable<any> {
    let fullDomain: string = this.getWSPath() + `/UpdateCycleData`;
    return (this.http.post<Cycle>(fullDomain + '?kid=' + this.createKeyObject(), this.ds.curSelectedRecord, httpHeaders)
        .pipe(catchError(this.errorHandler)));
  }

}
