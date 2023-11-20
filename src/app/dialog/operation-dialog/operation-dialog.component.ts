import {CommService} from 'src/app/services/comm.service';
import {MissionAssign} from 'src/app/models/missionassign';
import {DataService} from 'src/app/services/data.service';
import {Component, OnInit} from '@angular/core';
import {DatastoreService} from 'src/app/services/datastore.service';
import {DualListComponent} from 'angular-dual-listbox';
import {MatDialogRef} from '@angular/material/dialog';
import {Operation} from 'src/app/models/operation';
import {Locations} from 'src/app/models/locations';
import {Command} from 'src/app/models/command';
import {ConfirmDialogService} from '../confirm-dialog/confirm-dialog.service';
import {OpSptCmd} from '../../models/opsptcmd';
import {ConlogService} from '../../modules/conlog/conlog.service';

@Component({
  selector: 'app-operation-dialog',
  templateUrl: './operation-dialog.component.html',
  styleUrls: ['./operation-dialog.component.css']
})
export class OperationDialogComponent implements OnInit {

  dlHeight: string = '220px';
  dlFormat: any = {
    add: 'ADD',
    remove: 'REMOVE',
    all: 'ALL',
    none: 'NONE',
    direction: DualListComponent.RTL,
    draggable: true,
    locale: undefined
  };

  currList: Locations[] = [];
  selOp: Operation | null = null;
  missionAssign: MissionAssign[] = [];
  locations: any = [];
  commands: Command[] = [];
  availCount: number = 0;
  assignedCount: number = 0;
  assignedStorage: Locations[] = [];
  killCalled: boolean = false;
  curListBuilt: boolean = false;
  chgArr: any = [];
  msgArr: any = [];
  chgLoop: number = -1;
  currentList: any = [];

  constructor(private ds: DatastoreService, private data: DataService, public dialogRef: MatDialogRef<OperationDialogComponent>,
              private cds: ConfirmDialogService, private comm: CommService, private conlog: ConlogService) {
  }

  ngOnInit() {
    this.killCalled = false;
    this.selOp = this.ds.curSelectedRecord;
    this.curListBuilt = false;
    this.updateDataLoad();
  }

  updateDataLoad() {
    this.conlog.log("updateDataLoad");
    this.locations = this.ds.opsData['missionlocations'];
    this.commands = this.ds.opsData['command'];

    // Update the mission assigned list to reflect the recent change
    this.conlog.log("get missionassign");
    this.data.getSubOperationData('missionassign')
      .subscribe((results) => {
        if(results != null) {
          this.ds.opsData['missionAssign'] = results;
          this.missionAssign = results;

          this.conlog.log("MissionAssign Length: " + this.missionAssign.length);
        } else this.conlog.log("No assigned missions found - this is a fatal error.");

        this.conlog.log("List of Available Locations:");
        this.conlog.log(this.locations);

        // Depending on the timing, either display the list or kill the dialog
        if (!this.killCalled)
          this.buildListsForOperation();
         else
          this.killDialog();
      });
  }

  buildListsForOperation() {
    this.conlog.log("buildListsForOperation");
    // Get all the location ID for this specific operation
    this.currList = [];
    this.assignedStorage = [];

    if(this.missionAssign.length > 0) {
      this.currentList = this.missionAssign.filter(ma => { return ma.op_id == this.selOp.op_id });
    } else this.conlog.log("currentList - NO MISSION ASSIGNED VALUES FOUND");

    // Based on that list, loop through and build the CurrList
    this.conlog.log("Loop through currentList to find selected locations.");
    if(this.currentList.length > 0) {
      for (let row of this.currentList) {
        let local: Locations = this.locations.find((lo: any) => lo.lngMissionLocationID == row.location_id );
        if (local != null) this.currList.push(local);
        this.assignedStorage.push(local)
      }

      this.conlog.log("List of selected values");
      this.conlog.log(this.currList);
    }

    this.setSortOnChg();
    this.curListBuilt = true;
    this.conlog.log("curListBuild: " + this.curListBuilt);
  }

  processRequestedChange() {
    // Reset default values
    let l: number;
    this.msgArr = [];
    this.chgArr = [];
    this.chgLoop = -1;

    this.setSortOnChg();  //Sort it out

    //perform comparison and identify the one item that has changes (added or removed)
    let atob: any = this.assignedStorage.filter(item => this.currList.indexOf(item) < 0);  // Removed from Current
    let btoa: any = this.currList.filter(item => this.assignedStorage.indexOf(item) < 0);  // Added to Current

    if (atob.length == 0 && btoa.length > 0) {//Added
      for(l = 0; l < btoa.length; l++) {
        //chgValue = {id: 0, op_id: this.selOp.op_id, location_id: btoa[0].lngMissionLocationID};
        this.chgArr.push({id: 0, op_id: this.selOp.op_id, location_id: btoa[l].lngMissionLocationID, location_name: btoa[l].strMissionLocation})
      }
    } else if (atob.length > 0 && btoa.length == 0) {  //Removed
      for(l = 0; l < atob.length; l++) {
        //chgValue = {id: -1, op_id: this.selOp.op_id, location_id: atob[0].lngMissionLocationID};
        this.chgArr.push({id: -1, op_id: this.selOp.op_id, location_id: atob[l].lngMissionLocationID, location_name: atob[l].strMissionLocation})
      }
    }
    this.processLocationChanges();  // This is now recursive.
  }

  processLocationChanges() {
    this.chgLoop++;

    if(this.chgLoop < this.chgArr.length) {
      this.pushLocationChange(this.chgArr[this.chgLoop]);
    } else {
      // Do we have any failures in this change
      let haveFailed = this.msgArr.filter((item: any) => item.msgtype == "FAILED");
      if(haveFailed.length > 0) {
        this.cds.acknowledge(this.ds.acknowTitle, "The following location failed to last modification: " + this.createErrorMsg()).then();
      } else {
        this.cds.acknowledge(this.ds.acknowTitle, (this.chgArr.length > 1) ? 'Successfully Updated Records' : 'Successfully Updated Record').then();
      }
      this.updateDataLoad();
    }
  }

  createErrorMsg() {
    let str: string = "";

    for(let a = 0; a < this.msgArr.length; a++) {
      if(this.msgArr[a].msgtype == "ERROR") {
        str += this.chgArr[this.msgArr[a].index].location_name + ", ";
      }
    }

    return str;
  }

  pushLocationChange(chgValue: MissionAssign) {
    this.data.modifyOpsLocationData(chgValue)
      .subscribe((results) => {
        this.msgArr.push({ index: this.chgLoop, msg: results.processMsg, msgtype: (results.ID == 0) ? 'FAILED' : 'SUCCESS' });
        this.processLocationChanges();
      });
  }

  processUpdateSptFields() {
    // Used to update the support field information for an existing operations.  New operations will use the previous system.
    if (this.selOp.op_id < 0 || this.selOp.op_id == null) {
      this.cds.acknowledge('Update Support Fields - Failed', 'The Operations ID is not available.  Please verify.', 'OK');
    } else {
      let opsptcmd: OpSptCmd = new OpSptCmd();
      opsptcmd.op_id = this.ds.curSelectedRecord.op_id;
      opsptcmd.sptcmd = this.ds.curSelectedRecord.sptcmdid;
      opsptcmd.funding = this.ds.isNullOrEmpty(this.ds.curSelectedRecord.funding);
      opsptcmd.mobslide_opname = this.ds.isNullOrEmpty(this.ds.curSelectedRecord.mobslide_opname);
      opsptcmd.unitrqmt_visible = this.ds.curSelectedRecord.unitrqmt_visible;
      opsptcmd.tonipr = this.ds.curSelectedRecord.toNIPR;
      opsptcmd.crc = this.ds.curSelectedRecord.CRC;
      opsptcmd.cocom_id = this.ds.curSelectedRecord.cocom_id;
      opsptcmd.campid = this.ds.curSelectedRecord.campid;
      opsptcmd.projcode = this.ds.curSelectedRecord.projcode;

      this.data.updateOperationSptData(opsptcmd)
        .subscribe((results) => {
          if (results.ID == 0)
            this.cds.acknowledge(this.ds.acknowTitle, 'Failed - Reason: ' + results.processMsg, 'OK');
          else
            this.cds.acknowledge(this.ds.acknowTitle, results.processMsg);
        });
    }
  }

  updateAndClose() {
    // Update the full data because they may have added a piece of information
    this.killCalled = true;
    this.updateDataLoad();
  }

  setSortOnChg() {
    //Sort both of the lists
    this.sortMLArray(this.currList);
    this.sortMLArray(this.locations);

    this.availCount = this.locations.length;
    this.assignedCount = this.currList.length;
  }

  sortMLArray(arr: any) {
    arr.sort((a: any, b: any) => {
      if (a.strMissionLocation < b.strMissionLocation)
        return -1;
      if (a.strMissionLocation > b.strMissionLocation)
        return 1;

      return 0;
    });

    return arr;
  }

  killDialog() {
    this.comm.signalReload.emit();
    this.dialogRef.close();
    console.log("All changes have been saved");
  }
}
