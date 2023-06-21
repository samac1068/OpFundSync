import { ConfirmDialogService } from '../../../dialog/confirm-dialog/confirm-dialog.service';
import { CommService } from '../../../services/comm.service';
import { Component, OnInit, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DatastoreService } from 'src/app/services/datastore.service';
import { DataService } from 'src/app/services/data.service';
import { Operation } from 'src/app/models/operation';
import {Command} from '../../../models/command';

@Component({
  selector: 'app-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.css']
})
export class OperationsComponent implements OnInit {

  @Input() public isNewRecord:boolean;

  //Data providers
  selRec: any = {};
  chgArr: string[] = [];
  invalidMsg: string[] = [];
  commands: Command[] = [];

  //Form Validators
  opshortControl = new FormControl('', [Validators.required]);
  oplongControl = new FormControl('', [Validators.required]);

  constructor(private comm:CommService, private ds: DatastoreService, private cds: ConfirmDialogService, private data: DataService) { }

  ngOnInit() {
    this.comm.submitRecClicked.subscribe(() => {
      if(this.ds.curSelectedButton == "operations" && this.ds.submitTriggered) {
        this.ds.submitTriggered = false;
        if(this.chgArr.length > 0) {
          this.ValidateFormData();
          if(this.invalidMsg.length == 0){
            this.cds.confirm('OPERATIONS - Submission', 'Confirm you want to submit the ' + this.chgArr.length + ' change(s)?', 'Yes', 'No')
            .then((confirmed) => {
              if (confirmed) {
                // Need to populate all variables at this point
                if(this.selRec.sptcmd == "") this.selRec.sptcmd = this.ds.getValuesFromArray(this.commands, "CommandID", this.selRec.sptcmdid, "CommandName");
                this.selRec.unitrqmt_visible = this.selRec.unitrqmt_visible ? 1 : 0;
                this.selRec.funding = this.ds.isNullOrEmpty(this.selRec.funding);
                this.selRec.mobslide_opname = this.ds.isNullOrEmpty(this.selRec.mobslide_opname);
                this.ds.curSelectedRecord = this.selRec;

                this.data.updateOperationData()
                .subscribe((results) => {
                  if(results.ID == 0)
                    this.cds.acknowledge(this.ds.acknowTitle, 'Failed - Reason: ' + results.processMsg, 'OK');
                  else
                  {
                    this.resetAllFields();
                    this.comm.signalReload.emit();
                    this.cds.acknowledge(this.ds.acknowTitle, 'Operation Successful!', 'OK');
                  }
                });
              }
            })
            .catch(() => console.log('User dismissed the dialog'));
          }
          else
            this.cds.acknowledge('OPERATIONS: Incomplete Form', 'You must ' + this.invalidMsg.join(', ') + '.', 'OK', 'lg');
        }
        else
          this.cds.acknowledge('OPERATIONS: Invalid Submission', "You have not made any changes to this record.", 'OK');
      }
    });

    this.comm.createNewClicked.subscribe(() => {
      if(this.ds.curSelectedButton == 'operations') {
        this.updateDataLoad();
        this.chgArr = [];
        this.selRec = new Operation();
        this.setDefaultItems();
      }
    });

    this.comm.editRecClicked.subscribe(() => {
      if(this.ds.curSelectedButton == 'operations') {
        this.updateDataLoad();
        this.chgArr = [];
        this.selRec = this.ds.curSelectedRecord;
      }
    });
  }

  setDefaultItems(){
    this.selRec.op_id = 0;  //Indication that this is a new record.
    this.selRec.operation = "";
    this.selRec.operation_long = "";
    this.selRec.sptcmdid = 0;
    this.selRec.sptcmd = "";
    this.selRec.funding = "";
    this.selRec.mobslide_opname = "";
    this.selRec.toNIPR = 0;
    this.selRec.unitrqmt_visible = 0;
  }

  // Used to get the latest batch of stored DDL information
  updateDataLoad() {
    this.commands = this.ds.opsData['command'];
  }

  resetAllFields(){
    this.selRec = new Operation();
  }

  storeAllChanges(e: any) {
    if(this.chgArr.indexOf(e.source.id) == -1)
      this.chgArr.push(e.source.id);
  }

  textChanges(e: any){
    if(this.chgArr.indexOf(e.target.id) == -1)
      this.chgArr.push(e.target.id);
  }

  ValidateFormData() {
    // Check each of the list form controls to make sure they are valid
    this.invalidMsg = [];

    if(this.opshortControl.invalid) this.invalidMsg.push("enter a short description");
    if(this.oplongControl.invalid) this.invalidMsg.push("enter a long description");
  }
}
