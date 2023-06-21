import { Fundcites } from '../../../models/fundcites';
import { ConfirmDialogService } from '../../../dialog/confirm-dialog/confirm-dialog.service';
import { CommService } from '../../../services/comm.service';
import { Component, OnInit, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DatastoreService } from 'src/app/services/datastore.service';
import { DataService } from 'src/app/services/data.service';
import { Fundtype } from 'src/app/models/fundtype';

@Component({
  selector: 'app-fundcites',
  templateUrl: './fundcites.component.html',
  styleUrls: ['./fundcites.component.css']
})
export class FundcitesComponent implements OnInit {

  @Input() public isNewRecord:boolean;

  //Data providers
  selRec: any = {};
  chgArr: string[] = [];
  invalidMsg: string[] = [];
  fundtypes: Fundtype[] = [];

  //Form Validators
  fundcodeControl = new FormControl('', [Validators.required]);
  fundeffdateControl = new FormControl('', [Validators.required]);
  cicControl = new FormControl('', [Validators.required]);
  mdcControl = new FormControl('', [Validators.required]);
  fy1Control = new FormControl('', [Validators.required]);
  fy2Control = new FormControl('', [Validators.required]);
  fy3Control = new FormControl('', [Validators.required]);
  fyControl = new FormControl('', [Validators.required]);
  bsnControl = new FormControl('', [Validators.required]);
  limitControl = new FormControl('', [Validators.required]);
  oaControl = new FormControl('', [Validators.required]);
  asnControl = new FormControl('', [Validators.required]);
  eorControl = new FormControl('', [Validators.required]);
  mdepControl = new FormControl('', [Validators.required]);
  fccControl = new FormControl('', [Validators.required]);
  amsControl = new FormControl('', [Validators.required]);
  statusidControl = new FormControl('', [Validators.required]);
  apcControl = new FormControl('', [Validators.required]);
  fsnControl = new FormControl('', [Validators.required]);
  fundtypeControl = new FormControl('', [Validators.required]);

  constructor(private comm:CommService, private ds: DatastoreService, private cds: ConfirmDialogService, private data: DataService) { }

  ngOnInit() {
    this.comm.submitRecClicked.subscribe(() => {
      if(this.ds.curSelectedButton == "fundcites" && this.ds.submitTriggered) {
        this.ds.submitTriggered = false;
        if(this.chgArr.length > 0) {
          this.ValidateFormData();
          if(this.invalidMsg.length == 0){
            this.cds.confirm('FUNDCITES - Submission', 'Confirm you want to submit the ' + this.chgArr.length + ' change(s)?', 'Yes', 'No')
            .then((confirmed) => {
              if (confirmed) {
                this.ds.curSelectedRecord = this.selRec;
                this.data.updateFundCiteData()
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
            this.cds.acknowledge('FUNDCITES: Incomplete Form', 'You must ' + this.invalidMsg.join(', ') + '.', 'OK', 'lg');
        }
        else
          this.cds.acknowledge('FUNDCITES: Invalid Submission', "You have not made any changes to this record.", 'OK');
      }
    });

    this.comm.createNewClicked.subscribe(() => {
      if(this.ds.curSelectedButton == 'fundcites') {
        this.updateDataLoad();
        this.chgArr = [];
        this.selRec = new Fundcites();
        this.setDefaultItems();
      }
    });

    this.comm.editRecClicked.subscribe(() => {
      if(this.ds.curSelectedButton == 'fundcites') {
        this.updateDataLoad();
        this.chgArr = [];
        this.selRec = this.ds.curSelectedRecord;
      }
    });
  }

  setDefaultItems(){
    //this.selRec.ID = 0;  //Indication that this is a new record.
  }

  // Used to get the latest batch of stored DDL information
  updateDataLoad() {
    this.fundtypes = this.ds.opsData["fundtypes"];
  }

  resetAllFields(){
    this.selRec = new Fundcites();
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

    if(this.fundcodeControl.invalid) this.invalidMsg.push("enter a fund code");
    if(this.fundeffdateControl.invalid) this.invalidMsg.push("enter a effective date");
    if(this.fundtypeControl.invalid) this.invalidMsg.push("select a fund type");

    /* if(this.cicControl.invalid) this.invalidMsg.push("enter a CIC");
    if(this.mdcControl.invalid) this.invalidMsg.push("enter a MDC");
    if(this.fy1Control.invalid) this.invalidMsg.push("enter a FY1");
    if(this.fy2Control.invalid) this.invalidMsg.push("enter a FY2");
    if(this.fy3Control.invalid) this.invalidMsg.push("enter a FY3");
    if(this.fyControl.invalid) this.invalidMsg.push("enter a FY");
    if(this.bsnControl.invalid) this.invalidMsg.push("enter a BSN");
    if(this.limitControl.invalid) this.invalidMsg.push("enter a LIMIT");
    if(this.oaControl.invalid) this.invalidMsg.push("enter a OA");
    if(this.asnControl.invalid) this.invalidMsg.push("enter a ASN");
    if(this.eorControl.invalid) this.invalidMsg.push("enter a EOR");
    if(this.mdepControl.invalid) this.invalidMsg.push("enter a MDEP");
    if(this.fccControl.invalid) this.invalidMsg.push("enter a FCC");
    if(this.amsControl.invalid) this.invalidMsg.push("enter a AMS");
    if(this.statusidControl.invalid) this.invalidMsg.push("enter a Status ID");
    if(this.apcControl.invalid) this.invalidMsg.push("enter a APC");
    if(this.fsnControl.invalid) this.invalidMsg.push("enter a FSN"); */

    //return null;
  }
}
