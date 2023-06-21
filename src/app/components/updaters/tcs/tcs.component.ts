import { Component, OnInit, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CommService } from 'src/app/services/comm.service';
import { DatastoreService } from 'src/app/services/datastore.service';
import { ConfirmDialogService } from 'src/app/dialog/confirm-dialog/confirm-dialog.service';
import { DataService } from 'src/app/services/data.service';
import { TCS } from 'src/app/models/tcs';

@Component({
  selector: 'app-tcs',
  templateUrl: './tcs.component.html',
  styleUrls: ['./tcs.component.css']
})
export class TcsComponent implements OnInit {

  @Input() public isNewRecord:boolean;

  selRec: any = {};
  chgArr: string[] = [];
  invalidMsg: string[] = [];

  opControl = new FormControl('', [Validators.required]);
  descControl = new FormControl('', [Validators.required]);

  constructor(private comm:CommService, private ds: DatastoreService, private cds: ConfirmDialogService, private data: DataService) { }

  ngOnInit() {
    this.comm.submitRecClicked.subscribe(() => {
      if(this.ds.curSelectedButton == "tcs" && this.ds.submitTriggered) {
        this.ds.submitTriggered = false;
        if(this.chgArr.length > 0) {
          this.ValidateFormData();
          if(this.invalidMsg.length == 0){
            this.cds.confirm('TCS - Submission', 'Confirm you want to submit the ' + this.chgArr.length + ' change(s)?', 'Yes', 'No')
            .then((confirmed) => {
              if (confirmed) {
                this.ds.curSelectedRecord = this.selRec;
                this.data.updateTCSRecord()
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
            this.cds.acknowledge('TCS: Incomplete Form', 'You must ' + this.invalidMsg.join(', ') + '.', 'OK', 'lg');
        }
        else
          this.cds.acknowledge('TCS: Invalid Submission', "You have not made any changes to this record.", 'OK');
      }
    });

    this.comm.createNewClicked.subscribe(() => {
      if(this.ds.curSelectedButton == 'tcs') {
        this.updateDataLoad();
        this.chgArr = [];
        this.selRec = new TCS();
        this.setDefaultItems();
      }
    });

    this.comm.editRecClicked.subscribe(() => {
      if(this.ds.curSelectedButton == 'tcs') {
        this.updateDataLoad();
        this.chgArr = [];
        this.selRec = this.ds.curSelectedRecord;
      }
    });
  }

  setDefaultItems(){

  }

  updateDataLoad() {
    // No DDL to load
  }

  resetAllFields(){
    this.selRec = new TCS();
  }

  storeAllChanges(e: any) {
    if(this.chgArr.indexOf(e.source.id) == -1)
      this.chgArr.push(e.source.id);
  }

  textChanges(e: any){
    if(this.chgArr.indexOf(e.target.id) == -1)
      this.chgArr.push(e.target.id);
  }

  ValidateFormData(): void {
    // Check each of the list form controls to make sure they are valid
    this.invalidMsg = [];

    if(this.descControl.invalid) this.invalidMsg.push("enter a description");
    if(this.opControl.invalid) this.invalidMsg.push("select an operation");

    //return null;
  }
}
