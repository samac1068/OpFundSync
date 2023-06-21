import { ConfirmDialogService } from '../../../dialog/confirm-dialog/confirm-dialog.service';
import { CommService } from '../../../services/comm.service';
import { Component, OnInit, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DatastoreService } from 'src/app/services/datastore.service';
import { DataService } from 'src/app/services/data.service';
import { Operation } from 'src/app/models/operation';
import { Tpfdd } from 'src/app/models/tpfdd';
import { MatDatepickerInput } from '@angular/material/datepicker';

@Component({
  selector: 'app-tpfdd',
  templateUrl: './tpfdd.component.html',
  styleUrls: ['./tpfdd.component.css']
})
export class TpfddComponent implements OnInit {

  @Input() public isNewRecord:boolean;

  //Data providers
  selRec: any = {};
  chgArr: string[] = [];
  invalidMsg: string[] = [];
  operations: Operation[] = [];
  tpfddtypes: string[] = ["EXEC", "PLAN"];
  convertedDt: Date | null;

  //Form Validators
  nmshortControl = new FormControl('', [Validators.required]);
  nmlongControl = new FormControl('', [Validators.required]);
  typeControl = new FormControl('', [Validators.required]);
  opControl = new FormControl('');
  pidControl = new FormControl('');

  constructor(private comm:CommService, private ds: DatastoreService, private cds: ConfirmDialogService, private data: DataService) { }

  ngOnInit() {
    this.comm.submitRecClicked.subscribe(() => {
      if(this.ds.curSelectedButton == "tpfdd" && this.ds.submitTriggered) {
        this.ds.submitTriggered = false;
        if(this.chgArr.length > 0) {
          this.ValidateFormData();
          if(this.invalidMsg.length == 0){
            this.cds.confirm('TPFDD - Submission', 'Confirm you want to submit the ' + this.chgArr.length + ' change(s)?', 'Yes', 'No')
            .then((confirmed) => {
              if (confirmed) {
                this.selRec.CDATE = (this.convertedDt != null) ? this.convertedDt.toISOString().split("T")[0] : '-1';
                this.selRec.operation_id = (this.selRec.operation_id == null) ? 0 : this.selRec.operation_id;
                this.ds.curSelectedRecord = this.selRec;
                this.data.updateTPFDDRecord()
                .subscribe((results) => {
                  if(results.processMsg.indexOf("Successfully") > -1) {   // Successful insert/update
                    this.resetAllFields();
                    this.comm.signalReload.emit();
                    this.cds.acknowledge(this.ds.acknowTitle, results.processMsg);
                  } else
                    this.cds.acknowledge(this.ds.acknowTitle, 'Failed - Reason: ' + results.processMsg, 'OK');
                });
              }
            })
            .catch(() => console.log('User dismissed the dialog or System Error'));
          }
          else
            this.cds.acknowledge('TPFDD: Incomplete Form', 'You must ' + this.invalidMsg.join(', ') + '.', 'OK', 'lg');
        }
        else
          this.cds.acknowledge('TPFDD: Invalid Submission', "You have not made any changes to this record.", 'OK');
      }
    });

    this.comm.createNewClicked.subscribe(() => {
      if(this.ds.curSelectedButton == 'tpfdd') {
        this.updateDataLoad();
        this.chgArr = [];
        this.selRec = new Tpfdd();
        this.setDefaultItems();
      }
    });

    this.comm.editRecClicked.subscribe(() => {
      if(this.ds.curSelectedButton == 'tpfdd') {
        this.updateDataLoad();
        this.chgArr = [];
        this.selRec = this.ds.curSelectedRecord;
        this.selRec.isNewRecord = false;
        this.convertedDt = (this.selRec.CDATE != null) ? new Date(this.selRec.CDATE) : null;
      }
    });
  }

  setDefaultItems(){
    this.selRec.isNewRecord = true;   //Indication that this is a new record.
    this.selRec.active = false;
    this.selRec.deploy = false;
  }

  // Used to get the latest batch of stored DDL information
  updateDataLoad() {
    this.operations = this.ds.opsData["operations"];
    //this.tpfddtypes = this.ds.opsData["tpfddtypes"];
  }

  resetAllFields(){
    this.selRec = new Tpfdd();
  }

  storeAllChanges(e: any) {
    if(this.chgArr.indexOf(e.source.id) == -1)
      this.chgArr.push(e.source.id);
  }

  textChanges(e: any){
    if(e.target instanceof MatDatepickerInput){
      this.chgArr.push('cdate');
    } else if(this.chgArr.indexOf(e.target.id) == -1) {
      this.chgArr.push(e.target.id);
      console.log(this.chgArr);
    }
  }

  ValidateFormData() {
    // Check each of the list form controls to make sure they are valid
    this.invalidMsg = [];

    if(this.nmshortControl.invalid) this.invalidMsg.push("enter a short name");
    if(this.nmlongControl.invalid) this.invalidMsg.push("enter a long name");
    if(this.typeControl.invalid) this.invalidMsg.push("enter a type");
    if(this.selRec.isNewRecord && this.selRec.PID.length == 0) this.invalidMsg.push("enter a PID");

    //if(this.cdateControl.invalid) this.invalidMsg.push("enter a CDATE");
    //if(this.opControl.invalid) this.invalidMsg.push("select a operation");
  }
}
