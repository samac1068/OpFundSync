import {DataService} from '../../services/data.service';
import {CommService} from '../../services/comm.service';
import {DatastoreService} from '../../services/datastore.service';
import {Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import {NgxSpinnerService} from 'ngx-spinner';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {OperationDialogComponent} from 'src/app/dialog/operation-dialog/operation-dialog.component';
import {LocationsDialogComponent} from 'src/app/dialog/locations-dialog/locations-dialog.component';
import {ColDef, ColGroupDef, ColumnApi, ModuleRegistry} from "@ag-grid-community/core";
import {ClientSideRowModelModule} from "@ag-grid-community/client-side-row-model";
import {ConlogService} from "../../modules/conlog/conlog.service";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

@Component({
  selector: 'app-datawindow',
  templateUrl: './datawindow.component.html',
  styleUrls: ['./datawindow.component.css']
})

export class DatawindowComponent implements OnInit {
  @ViewChild('rightcol', {static: false}) rightcol: ElementRef;

  dgData: any = []; // Currently loaded information
  dgDataRaw: any = []; // Contains the displayed list of information and is used to reset back to norm before a filter is applied
  localPamams: any;
  colHeadData: (ColDef<any> | ColGroupDef<any>)[]
  colDefaults: any;
  showEditor: boolean = false;  // Display the edit panel or hide it.  Default is hidden
  availWidth: number;
  isNewRecord: boolean = false;
  subOpList: string [];
  curOperation: string;
  allDataLoaded: boolean = false;
  gridIsReady: boolean = false;
  operationDialogRef: MatDialogRef<OperationDialogComponent>;
  locationDialogRef: MatDialogRef<LocationsDialogComponent>;
  intVal: number = -1;
  private gridColumnApi!: ColumnApi;
  dataObj: any = {loopCount: 0, operation:  [], opsLoadSuccess: false};

  constructor(public ds: DatastoreService, private comm: CommService, private data: DataService, private spinner: NgxSpinnerService,
              private dialog: MatDialog, private cdRef: ChangeDetectorRef, private conlog: ConlogService) {
  }

  ngOnInit() {
    // Load the column headers
    this.showLoaderAni();
    this.ds.columnHeaders = this.data.getColumnData();
    this.colDefaults = {resizable: true, sortable: false, editable: false};

    // Subscriptions
    this.comm.navbarClicked.subscribe(() => {
      this.curOperation = this.ds.curSelectedButton;
      this.showEditor = false;
      this.isNewRecord = false;
      this.loadSelectedButton();
    });

    // Canceled clicked
    this.comm.cancelRecClicked.subscribe(() => {
      this.isNewRecord = false;
      this.showEditor = false;
    });

    // Reload of Datagrid signaled
    this.comm.signalReload.subscribe(() => {
      this.showEditor = false;
      this.showLoaderAni();
      this.getSelectedOperationData();
    });

    //Cog was clicked
    this.comm.cogClicked.subscribe((results) => {
      //console.log("Passed To Edit Window", results);
      this.editRecordHandler(results);
    });

    //Close Location Dialog
    this.comm.closeLocation.subscribe(() => {
      this.closeLocationDialog();
    });

  }

  getSelectedOperationData(): void {
    this.conlog.log("getSelectedOperationData");
    let repeatCnt: number = 0;
    this.intVal = setInterval(() => {
      if(this.gridIsReady) {
        clearInterval(this.intVal);
        this.pullSelectedOperationData();
      } else if (repeatCnt >= 10) {
        clearInterval(this.intVal);
        this.dataGridFailed();
      }
      else repeatCnt++;
    }, 500);
  }

  dataGridFailed():void {
    this.ds.generateToast("The Datagrid Failed to Response. System Aborted.", false);
  }
  onGridReady(params: any) {
    this.localPamams = params;
    this.gridIsReady = true;
  }

  loadSelectedButton() {
    // Load the necessary sub-operation information for the selected operation
    this.showLoaderAni();

    switch (this.ds.curSelectedButton) {
      case 'damps':
        this.subOpList = ['pay', 'tcs', 'conusa', 'operations', 'cycles'];
        break;
      case 'orders':
        this.subOpList = ['operations', 'cycles', 'damps'];
        break;
      case 'pay':
        this.subOpList = ['record', 'transfer'];
        break;
      case 'tcs':
        this.subOpList = ['geoloc'];
        break;
      case 'conusa':
        this.subOpList = [];
        break;
      case 'missionlocations':
        this.subOpList = ['country', 'states'];
        break;
      case 'fundcites':
        this.subOpList = ['fundtypes'];
        break;
      case 'operations':
        this.subOpList = ['missionlocations', 'missionassign', 'locationid', 'command'];
        break;
      case 'tpfdd':
        this.subOpList = ['operations'];
        break;
      case 'cycles':
        this.subOpList = [];
        break;
    }

    // Grab the support data for the selected operation button - recusive loop
    this.dataObj.loopCount = 0;
    this.dataObj.operation = this.subOpList;
    this.recuGetSubOpData();
  }

  recuGetSubOpData():void {
    if(this.dataObj.loopCount < this.dataObj.operation.length) {
      this.getSubOpData(this.dataObj.operation[this.dataObj.loopCount]);
    } else {
      // Now with the subs in, we need to get the primary data
      this.dataObj.opsLoadSuccess = true;
      this.conlog.log("loading primary data: " + this.ds.curSelectedButton);
      this.getSelectedOperationData();
    }
  }
  getSubOpData(subop: string) {
    this.conlog.log("getSubOpData - " + subop);

    // Get the provided sub operation data and store it in the appropriate location
    this.data.getSubOperationData(subop)
      .subscribe((results) => {
        this.conlog.log("storing subdata " + subop + " for button " + this.ds.curSelectedButton);
        this.ds.opsData[subop] = results;
        this.dataObj.loopCount++;

        //After it is store, run recursive loop
        this.recuGetSubOpData();
      });
  }

  pullSelectedOperationData() {
    this.conlog.log("pullSelectedOperationData");
    this.data.getOperationData()
      .subscribe((results) => {
        this.conlog.log("storing data for " + this.ds.curSelectedButton);
        this.dgData = this.ds.checkForCustomError(results); // Load the returning data to be displayed
        this.dgDataRaw = results;
        this.ds.opsData[this.ds.curSelectedButton] = this.dgData;
        this.colHeadData = this.ds.columnHeaders[this.ds.curSelectedButton]; // Load the list of column headers for the selected operation
        this.hideLoaderAni();
      });

    this.cdRef.detectChanges();
    this.availWidth = this.rightcol.nativeElement.offsetWidth;
    this.setTableResize();
    //this.autoSizeAll(true);
  }


  hideLoaderAni() {
    this.spinner.hide();
    this.allDataLoaded = true;
  }

  showLoaderAni() {
    this.allDataLoaded = false;
    this.spinner.show();
  }

  /*sepClickHandler() {
      this.showEditor = !this.showEditor;
  }*/

  setTableResize() {
    let totWidth = 0;
    this.ds.columnHeaders[this.ds.curSelectedButton].forEach((column: any) => {
      totWidth += column.width;
    });

    const scale = (this.availWidth - 5) / totWidth;
    this.ds.columnHeaders[this.ds.curSelectedButton].forEach((column: any) => {
      column.width *= scale;
      this.setColumnWidth(column);
    });
  }

  setColumnWidth(column: any) {
    const columnEls: Element[] = Array.from(document.getElementsByClassName('mat-column-' + column.columnDef));
    columnEls.forEach((el: any) => {
      el.style.width = column.width + 'px';
    });
  }

  autoSizeAll(skipHeader: boolean) {
    const allColumnIds: string[] = [];
    this.gridColumnApi.getColumns()!.forEach((column) => {
      allColumnIds.push(column.getId());
    });
    this.gridColumnApi.autoSizeColumns(allColumnIds, skipHeader);
  }

  createNewRecordHandler() {
    if (this.ds.curSelectedButton == 'missionlocations') { // Show new location entry window
      this.showEditor = false;
      this.locationDialogRef = this.dialog.open(LocationsDialogComponent, {panelClass: 'locationDialogClass'});
    } else {   // Show standard new item entry window
      this.isNewRecord = true;
      this.showEditor = true;
      this.comm.createNewClicked.emit();
    }
  }

  closeLocationDialog(){
    this.locationDialogRef.close();
  }
  editRecordHandler(selectedRow: any) {
    this.ds.curSelectedRecord = selectedRow;
    this.isNewRecord = false;

    // tslint:disable-next-line:triple-equals
    if (this.ds.curSelectedButton == 'operations') {     // Show Unique Operations Window
      this.showEditor = false;
      this.operationDialogRef = this.dialog.open(OperationDialogComponent, {height: '780px', width: '620px'});
    } else {    // Show standard edit entry window
      this.showEditor = true;
      this.comm.editRecClicked.emit();
    }
  }

  clickedAutoAttach() {
    this.data.getAutoAttach()
      .subscribe(() => {
        this.ds.generateToast("Auto Attach - Executed", true);
      });
  }
}
