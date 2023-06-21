import {Conusa} from 'src/app/models/conusa';
import {ConfirmDialogService} from 'src/app/dialog/confirm-dialog/confirm-dialog.service';
import {CommService} from 'src/app/services/comm.service';
import {Component, OnInit, Input} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {DatastoreService} from 'src/app/services/datastore.service';
import {DataService} from 'src/app/services/data.service';

@Component({
  selector: 'app-conusa',
  templateUrl: './conusa.component.html',
  styleUrls: ['./conusa.component.css']
})
export class ConusaComponent implements OnInit {

  @Input() public isNewRecord: boolean;

  //Data providers
  selRec: any = {};
  chgArr: string[] = [];
  invalidMsg: string[] = [];

  //Form Validators
  shNameControl = new FormControl('', [Validators.required]);
  lgNameControl = new FormControl('', [Validators.required]);
  authidControl = new FormControl('', [Validators.required]);

  constructor(private comm: CommService, private ds: DatastoreService, private cds: ConfirmDialogService, private data: DataService) {
  }

  ngOnInit() {
    this.comm.submitRecClicked.subscribe(() => {
      if (this.ds.curSelectedButton == 'conusa' && this.ds.submitTriggered) {
        this.ds.submitTriggered = false;
        if (this.chgArr.length > 0) {
          this.ValidateFormData();
          if (this.invalidMsg.length == 0) {
            this.cds.confirm('CONUSA - Submission', 'Confirm you want to submit the ' + this.chgArr.length + ' change(s)?', 'Yes', 'No')
              .then((confirmed) => {
                if (confirmed) {
                  this.ds.curSelectedRecord = this.selRec;
                  this.data.updateCONUSARecord()
                    .subscribe((results) => {
                      if (results.ID == 0) {
                        this.cds.acknowledge(this.ds.acknowTitle, 'Failed - Reason: ' + results.processMsg, 'OK');
                      } else {
                        this.resetAllFields();
                        this.comm.signalReload.emit();
                        this.cds.acknowledge(this.ds.acknowTitle, 'Operation Successful!', 'OK');
                      }
                    });
                }
              })
              .catch(() => console.log('User dismissed the dialog'));
          } else {
            this.cds.acknowledge('CONUSA: Incomplete Form', 'You must ' + this.invalidMsg.join(', ') + '.', 'OK', 'lg');
          }
        } else {
          this.cds.acknowledge('CONUSA: Invalid Submission', 'You have not made any changes to this record.', 'OK');
        }
      }
    });


    this.comm.createNewClicked.subscribe(() => {
      if(this.ds.curSelectedButton == 'conusa') {
        this.updateDataLoad();
        this.chgArr = [];
        this.selRec = new Conusa();
        this.setDefaultItems();
      }
    });

    this.comm.editRecClicked.subscribe(() => {
      if(this.ds.curSelectedButton == 'conusa') {
        this.updateDataLoad();
        this.chgArr = [];
        this.selRec = this.ds.curSelectedRecord;
      }
    });

    this.comm.cancelRecClicked.subscribe(() => {
      this.chgArr = [];
    });
  }

  setDefaultItems() {

  }

  // Used to get the latest batch of stored DDL information
  updateDataLoad() {
    // Nothing to preload for DDL
  }

  resetAllFields() {
    this.selRec = new Conusa();
  }

  storeAllChanges(e: any) {
    if (this.chgArr.indexOf(e.source.id) == -1) {
      this.chgArr.push(e.source.id);
    }
  }

  textChanges(e: any) {
    if (this.chgArr.indexOf(e.target.id) == -1) {
      this.chgArr.push(e.target.id);
    }
  }

  ValidateFormData(): void {
    // Check each of the list form controls to make sure they are valid
    this.invalidMsg = [];

    if (this.shNameControl.invalid) this.invalidMsg.push('enter a short name');
    if (this.lgNameControl.invalid) this.invalidMsg.push('enter a long name');
    if (this.authidControl.invalid) this.invalidMsg.push('enter a authority id');

    this.correctForNulls();

    //return null;
  }

  correctForNulls() {
    // Make sure value isn't null
    if (this.selRec.ID == null) this.selRec.ID = 0;
    if (this.selRec.opHidden == null) this.selRec.opHidden = 0;
  }
}
