import { Injectable } from '@angular/core';
import {AGEditIconRendererComponent} from '../components/renderers/AGEditIconRendererComponent';
import {AGCheckBoxRendererComponent} from '../components/renderers/AGCheckBoxRendererComponent';
import {System} from "../models/System";
import {User} from "../models/User";
import {Toaster} from 'ngx-toast-notifications';
import {ConlogService} from '../modules/conlog/conlog.service';

@Injectable({
  providedIn: 'root'
})
export class DatastoreService {

  constructor(private toaster: Toaster, private conlog: ConlogService) { }

  //Variables
  private _passKey: string = "4A3F6BD3-61FB-467B-83D0-0EFBAF72AFC4";
  private _devKey = "6A586E327235753778214125442A472D";
  private _appVersion: string = '2.1.23.0621';

  system: System = new System();
  user: User = new User();
  curSelectedButton: string = "";
  opsData: any = {};
  btnData: any[] = [
                    ["damps","ID"], ["orders","ID"], ["pay","ID"],["tcs","ID"], ["conusa","ID"],
                    ["missionlocations","ID"], ["fundcites","ID"], ["operations","ID"], ["tpfdd","ID"], ["cycles","ID"]
                  ];
  btnStatus: boolean[] = [false, false, false, false, false, false, false, false, false, false];
  columnHeaders:{[index: string]:any} = {};
  curSelectedRecord: any = null;
  acknowTitle: string = "Operation Status";

  submitTriggered: boolean = false;

  dgColumnData: any = {
      "damps":
          [
              {"headerName": "EDIT", "field": "ID", "cellRenderer": AGEditIconRendererComponent },
              {"headerName": "ID", "field": "ID" },
              {"headerName": "HIDDEN", "field": "opHidden", "cellRenderer": AGCheckBoxRendererComponent},
              {"headerName": "DESCRIPTION", "field": "Description", "filter": true, floatingFilter: true},
              {"headerName": "PAY OP", "field": "PAY_Operation", "filter": true, floatingFilter: true},
              {"headerName": "TCS OP", "field": "TCS_Operation", "filter": true, floatingFilter: true},
              {"headerName": "SHORT NAME", "field": "opShortName", "filter": true, floatingFilter: true},
              {"headerName": "RECORD STATUS", "field": "Record_Status_Description", "filter": true},
              {"headerName": "TRANSFER STATUS", "field": "Transfer_Status_Description",  "filter": true},
              {"headerName": "12301D", "field": "ma12301_d", "cellRenderer": AGCheckBoxRendererComponent},
              {"headerName": "12302", "field": "ma12302", "cellRenderer": AGCheckBoxRendererComponent},
              {"headerName": "12304", "field": "ma12304", "cellRenderer": AGCheckBoxRendererComponent},
              {"headerName": "12304A", "field": "ma12304_a", "cellRenderer": AGCheckBoxRendererComponent},
              {"headerName": "12304B", "field": "ma12304_b", "cellRenderer": AGCheckBoxRendererComponent},
              {"headerName": "12302 BORDER", "field": "ma12302_Border", "cellRenderer": AGCheckBoxRendererComponent},
              {"headerName": "12302 CORONA", "field": "ma12302_Corona", "cellRenderer": AGCheckBoxRendererComponent},
              {"headerName": "12302 COUNTERDRUG", "field": "ma12302_Counterdrug", "cellRenderer": AGCheckBoxRendererComponent},
              {"headerName": "MOBCAP", "field": "MOBCAP", "filter": true, floatingFilter: true},
              {"headerName": "CYCLE", "field": "Cycle", "filter": true, floatingFilter: true},
              {"headerName": "LONG NAME", "field": "opLongName", "filter": true, floatingFilter: true},
              {"headerName": "UIC TO NIPR", "field": "UIC_ToNipr", "cellRenderer": AGCheckBoxRendererComponent}
          ],
      "orders":
          [
              {"headerName": "EDIT", "field": "ID", "cellRenderer": AGEditIconRendererComponent },
              {"headerName": "Visible", "field": "isVisible", "cellRenderer": AGCheckBoxRendererComponent },
              {"headerName": "ID", "field": "ID", "filter": true, floatingFilter: true},
              {"headerName": "OPERATION", "field": "operation", "filter": true, floatingFilter: true},
              {"headerName": "CYCLE", "field": "cycle", "filter": true, floatingFilter: true},
              {"headerName": "IN PLANNING", "field": "plan_id", "cellRenderer": AGCheckBoxRendererComponent },
              {"headerName": "ORDERS", "field": "ord_id", "filter": true, floatingFilter: true },
              {"headerName": "ASSIGNED DAMPS", "field": "Description", "filter": true, floatingFilter: true }
          ],
      "pay":
          [
              {"headerName": "EDIT", "field": "PAY_Operation_ID", "cellRenderer": AGEditIconRendererComponent },
              {"headerName": "ID", "field": "PAY_Operation_ID", "filter": true, floatingFilter: true },
              {"headerName": "OPERATION", "field": "PAY_Operation", "filter": true, floatingFilter: true },
              {"headerName": "DESCRIPTION", "field": "PAY_Operation_Description", "filter": true, floatingFilter: true },
              {"headerName": "RECORD STATUS", "field": "Record_Status_Description", "filter": true, floatingFilter: true },
              {"headerName": "TRANSFER STATUS", "field": "Transfer_Status_Description", "filter": true, floatingFilter: true }
          ],
      "tcs":
          [
              {"headerName": "EDIT", "field": "TCS_Operation_ID", "cellRenderer": AGEditIconRendererComponent },
              {"headerName": "ID", "field": "TCS_Operation_ID", "filter": true, floatingFilter: true },
              {"headerName": "OPERATION", "field": "TCS_Operation", "filter": true, floatingFilter: true },
              {"headerName": "DESCRIPTION", "field": "TCS_Operation_Description", "filter": true, floatingFilter: true },
              {"headerName": "RECORD STATUS", "field": "Record_Status_Description", "filter": true, floatingFilter: true },
              {"headerName": "TRANSFER STATUS", "field": "Transfer_Status_Description", "filter": true, floatingFilter: true }
          ],
      "conusa":
          [
              {"headerName": "EDIT", "field": "opId", "cellRenderer": AGEditIconRendererComponent },
              {"headerName": "ID", "field": "opId", "filter": true, floatingFilter: true },
              {"headerName": "SHORTNAME", "field": "opShortName", "filter": true, floatingFilter: true},
              {"headerName": "LONGNAME", "field": "opLongName", "filter": true, floatingFilter: true },
              {"headerName": "AUTH ID", "field": "opAuthId", "filter": true, floatingFilter: true },
              {"headerName": "HIDDEN", "field": "opHidden", "cellRenderer": AGCheckBoxRendererComponent },
              {"headerName": "RECORD STATUS", "field": "Record_Status_Description", "filter": true, floatingFilter: true },
              {"headerName": "TRANSFER STATUS", "field": "Transfer_Status_Description", "filter": true, floatingFilter: true }
          ],
      "operations":
          [
              {"headerName": "EDIT", "field": "op_id", "cellRenderer": AGEditIconRendererComponent },
              {"headerName": "ID", "field": "op_id", "filter": true, floatingFilter: true },
              {"headerName": "OPERATION", "field": "operation", "filter": true, floatingFilter: true },
              {"headerName": "VISIBLE", "field": "unitrqmt_visible", "cellRenderer": AGCheckBoxRendererComponent  },
              {"headerName": "LONG NAME", "field": "operation_long", "filter": true, floatingFilter: true },
              {"headerName": "TO CRC", "field": "CRC", "cellRenderer": AGCheckBoxRendererComponent},
              {"headerName": "TO NIPR", "field": "toNIPR", "cellRenderer": AGCheckBoxRendererComponent },
              {"headerName": "SPT CMD", "field": "sptcmd", "filter": true, floatingFilter: true },
              {"headerName": "FUNDING", "field": "funding", "filter": true, floatingFilter: true },
              {"headerName": "MOBSLIDE NAME", "field": "mobslide_opname", "filter": true, floatingFilter: true }
          ],
      "cycles":
          [
              {"headerName": "EDIT", "field": "cyc_id", "cellRenderer": AGEditIconRendererComponent },
              {"headerName": "CYCLE ID", "field": "cyc_id", "filter": true, floatingFilter: true },
              {"headerName": "CYCLE", "field": "cycle", "filter": true, floatingFilter: true },
              {"headerName": "FY", "field": "FY", "filter": true, floatingFilter: true },
              {"headerName": "HIDDEN", "field": "opHidden", "cellRenderer": AGCheckBoxRendererComponent},
              {"headerName": "RECORD STATUS", "field": "Record_Status_Description", "filter": true, floatingFilter: true },
              {"headerName": "TRANSFER STATUS", "field": "Transfer_Status_Description", "filter": true, floatingFilter: true },
              {"headerName": "FISCAL START", "field": "Fiscal_Start", "filter": true, floatingFilter: true },
              {"headerName": "FISCAL END", "field": "Fiscal_End", "filter": true, floatingFilter: true }
          ],
      "missionlocations":
          [
              {"headerName": "EDIT", "field": "lngMissionLocationID", "cellRenderer": AGEditIconRendererComponent },
              {"headerName": "ID", "field": "lngMissionLocationID", "filter": true, floatingFilter: true },
              {"headerName": "HIDDEN", "field": "opHidden", "cellRenderer": AGCheckBoxRendererComponent },
              {"headerName": "LOCATION", "field": "strMissionLocation", "filter": true, floatingFilter: true },
              {"headerName": "CONUS", "field": "MissionConus", "cellRenderer": AGCheckBoxRendererComponent },
              {"headerName": "COUNTRY", "field": "Country", "filter": true, floatingFilter: true },
              {"headerName": "COUNTRY CODE", "field": "CountryCode", "filter": true, floatingFilter: true },
              {"headerName": "STATE", "field": "STATEAB", "filter": true, floatingFilter: true },
              {"headerName": "ZIP CODE", "field": "ZipCode", "filter": true, floatingFilter: true },
              {"headerName": "INSTALLATION", "field": "Installation", "filter": true, floatingFilter: true },
              {"headerName": "GEO LOCATION", "field": "GeoLocation", "filter": true, floatingFilter: true },
              {"headerName": "GEO COORDS", "field": "Geographic_Coord", "filter": true, floatingFilter: true },
              {"headerName": "LATITUDE", "field": "Latitude", "filter": true, floatingFilter: true },
              {"headerName": "LONGITUDE", "field": "Longitude", "filter": true, floatingFilter: true },
              {"headerName": "UN CTRY CODE", "field": "UN_CC", "filter": true, floatingFilter: true },
              {"headerName": "ARLOC", "field": "ARLOC", "filter": true, floatingFilter: true },
              {"headerName": "COMBAT ZONE", "field": "CZ", "cellRenderer": AGCheckBoxRendererComponent },
              {"headerName": "RECORD STATUS", "field": "Record_Status_Description", "filter": true, floatingFilter: true },
              {"headerName": "TRANSFER STATUS", "field": "Transfer_Status_Description", "filter": true, floatingFilter: true }
          ],
      "fundcites":
          [
              {"headerName": "EDIT", "field": "FundId", "cellRenderer": AGEditIconRendererComponent },
              {"headerName": "FUND ID", "field": "FundId", "filter": true, floatingFilter: true },
              {"headerName": "FUND CODE", "field": "FundCode", "filter": true, floatingFilter: true },
              {"headerName": "EFFECTIVE DATE", "field": "FundEffDate", "filter": true, floatingFilter: true },
              {"headerName": "FUND TYPE", "field": "FundTypeName", "filter": true, floatingFilter: true },
              {"headerName": "CIC", "field": "CIC", "filter": true, floatingFilter: true },
              {"headerName": "MDC", "field": "MDC", "filter": true, floatingFilter: true },
              {"headerName": "CONUS BASED", "field": "IsConusBased", "cellRenderer": AGCheckBoxRendererComponent },
              {"headerName": "FY1", "field": "FY1", "filter": true, floatingFilter: true },
              {"headerName": "FY2", "field": "FY2", "filter": true, floatingFilter: true },
              {"headerName": "FY3", "field": "FY3", "filter": true, floatingFilter: true },
              {"headerName": "DEPT", "field": "DEPT", "filter": true, floatingFilter: true },
              {"headerName": "FY", "field": "FY", "filter": true, floatingFilter: true },
              {"headerName": "BSN", "field": "BSN", "filter": true, floatingFilter: true },
              {"headerName": "LIMIT", "field": "LIMIT", "filter": true, floatingFilter: true },
              {"headerName": "OA", "field": "OA", "filter": true, floatingFilter: true },
              {"headerName": "ASN", "field": "ASN", "filter": true, floatingFilter: true },
              {"headerName": "AMS", "field": "AMS", "filter": true, floatingFilter: true },
              {"headerName": "EOR", "field": "EOR", "filter": true, floatingFilter: true },
              {"headerName": "MDEP", "field": "MDEP", "filter": true, floatingFilter: true },
              {"headerName": "FCC", "field": "FCC", "filter": true, floatingFilter: true },
              {"headerName": "STATUS ID", "field": "STATUS_ID", "filter": true, floatingFilter: true },
              {"headerName": "APC", "field": "APC", "filter": true, floatingFilter: true },
              {"headerName": "FSN", "field": "FSN", "filter": true, floatingFilter: true }
          ],
      "tpfdd":
          [
              {"headerName": "EDIT", "field": "PID", "cellRenderer": AGEditIconRendererComponent },
              {"headerName": "PID", "field": "PID", "filter": true, floatingFilter: true },
              {"headerName": "DESCRIPTION SHORT", "field": "DESCRIPTION_SHORT", "filter": true, floatingFilter: true },
              {"headerName": "DESCRIPTION LONG", "field": "DESCRIPTION_LONG", "filter": true, floatingFilter: true },
              {"headerName": "CDATE", "field": "CDATE", "filter": true, floatingFilter: true },
              {"headerName": "TYPE", "field": "TYPE", "filter": true, floatingFilter: true },
              {"headerName": "ACTIVE", "field": "ACTIVE", "cellRenderer": AGCheckBoxRendererComponent },
              {"headerName": "DEPLOY", "field": "DEPLOY", "cellRenderer": AGCheckBoxRendererComponent },
              {"headerName": "OPERATION LONG", "field": "operation_long", "filter": true, floatingFilter: true }
          ]
  };

  // Getter and Setters
  getPassKey() {
    return this._passKey;
  }

  getVersion() {
    return this._appVersion;
  }

  getDevKey() {
    return this._devKey;
  }

  getSKey(): string {
    return this.user["sKey"];
  }

  ///////////////////////////////////////// Global Services and functions
  public getSelectedRow(arr: any, id: number) {
    return arr.find((x: any) => x.ID == id);
  }

  public getArrayIndex(arr: any, value: any) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] == value)
        return i;
    }

    return -1;
  }

  public get2DArrayIndex(arr: any, col: string, value: any): number {
     for(let i = 0; i < arr.length; i++) {
         if (arr[i][col] == value)
             return i;
     }

     return -1;
  }

  // Used to return any column values based on the found information
  public getValuesFromArray(arr: any, col: string, value: any, rtncol: string) : any {
    return arr.filter((row: any): boolean => row[col] == value)[0][rtncol];
  }

  public getBtnStatus(title: string) {
    return this.btnStatus[this.getArrayIndex(this.btnData, title)];
  }

  public isNullOrEmpty(str: string): string {
    if(str == null || str.length == 0)
      str = "na";

    return str;
  }

  public isUndefined(val: any): boolean | null {
    return (val == undefined || null);
  }

  generateToast(text: string,issuccess: boolean = true): void {
    this.conlog.log("Toast Generated: " + text + "(" + issuccess + ")");
    this.toaster.open({
      text: text,
      caption: 'Notification',
      type: (!issuccess) ? 'warning' : 'success',
      position: 'top-center'
    });
  }


}
