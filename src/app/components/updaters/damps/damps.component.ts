import {Conusa} from 'src/app/models/conusa';
import {TCS} from 'src/app/models/tcs';
import {Pay} from 'src/app/models/pay';
import {ConfirmDialogService} from 'src/app/dialog/confirm-dialog/confirm-dialog.service';
import {Damps} from 'src/app/models/damps';
import {CommService} from 'src/app/services/comm.service';
import {Component, OnInit, Input, NgIterable} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {DatastoreService} from 'src/app/services/datastore.service';
import {DataService} from 'src/app/services/data.service';
import {Cycle} from 'src/app/models/cycle';
import {MatCheckbox} from '@angular/material/checkbox';

@Component({
  selector: 'app-damps',
  templateUrl: './damps.component.html',
  styleUrls: ['./damps.component.css']
})
export class DampsComponent implements OnInit {

  @Input() public isNewRecord: boolean;

  //Data providers
  selRec: any = {};
  opsdll: NgIterable<any> = null;
  cycledll: Cycle[] = [];
  paydll: Pay[] = [];
  tcsdll: TCS[] = [];
  conusadll: Conusa[] = [];
  chgArr: string[] = [];
  invalidMsg: string[] = [];

  dampsFormGrp: FormGroup = new FormGroup({
    ID: new FormControl(''),
    UIC_ToNipr: new FormControl(''),
    opHidden: new FormControl(''),
    Description: new FormControl('', [Validators.required]),
    Op_ID: new FormControl('', [Validators.required]),
    Cyc_ID: new FormControl('', [Validators.required]),
    PAY_Operation_ID: new FormControl('', [Validators.required]),
    TCS_Operation_ID: new FormControl('', [Validators.required]),
    Conusa_OpID: new FormControl('', [Validators.required]),
    MOBCAP: new FormControl(''),
    ma12301_d: new FormControl(''),
    ma12302: new FormControl(''),
    ma12304: new FormControl(''),
    ma12304_a: new FormControl(''),
    ma12304_b: new FormControl(''),
    ma12302_Border: new FormControl(''),
    ma12302_Corona: new FormControl(''),
    ma12302_Counterdrug: new FormControl('')
  });

  /*dampsFormGrp: FormGroup = new FormGroup({
    UIC_ToNipr: new FormControl(this.selRec.UIC_ToNipr),
    opHidden: new FormControl(this.selRec.opHidden),
    Description: new FormControl(this.selRec.Description, [Validators.required]),
    Op_ID: new FormControl(this.selRec.Op_ID, [Validators.required]),
    Cyc_ID: new FormControl(this.selRec.Cyc_ID, [Validators.required]),
    PAY_Operation_ID: new FormControl(this.selRec.PAY_Operation_ID, [Validators.required]),
    TCS_Operation_ID: new FormControl(this.selRec.TCS_Operation_ID, [Validators.required]),
    Conusa_OpID: new FormControl(this.selRec.Conusa_OpID, [Validators.required]),
    MOBCAP: new FormControl(this.selRec.MOBCAP),
    ma12301_d: new FormControl(this.selRec.ma12301_d),
    ma12302: new FormControl(this.selRec.ma12302),
    ma12304: new FormControl(this.selRec.ma12304),
    ma12304_a: new FormControl(this.selRec.ma12304_a),
    ma12304_b: new FormControl(this.selRec.ma12304_b),
    ma12302_Border: new FormControl(this.selRec.ma12302_Border),
    ma12302_Corona: new FormControl(this.selRec.ma12302_Corona),
    ma12302_Counterdrug: new FormControl(this.selRec.ma12302_Counterdrug)
  });*/

  /// GETTERS FOR VALIDATORS
  get Op_ID() { return this.dampsFormGrp.get('Op_ID'); }
  get Cyc_ID() { return this.dampsFormGrp.get('Cyc_ID'); }
  get PAY_Operation_ID() { return this.dampsFormGrp.get('PAY_Operation_ID'); }
  get TCS_Operation_ID() { return this.dampsFormGrp.get('TCS_Operation_ID'); }
  get Conusa_OpID() { return this.dampsFormGrp.get('Conusa_OpID'); }

  constructor(private comm: CommService, private ds: DatastoreService, private cds: ConfirmDialogService, private data: DataService) { }

  ngOnInit() {
    this.comm.submitRecClicked
      .subscribe(() => {
      if (this.ds.curSelectedButton == 'damps' && this.ds.submitTriggered) {
        this.ds.submitTriggered = false;
        if (this.chgArr.length > 0) {
          this.correctForNulls();
          console.log('selRec', this.selRec);
          this.ds.curSelectedRecord = this.selRec;
          if (this.invalidMsg.length == 0) {
            this.cds.confirm('DAMPS - Submission', 'Confirm you want to submit the ' + this.chgArr.length + ' change(s)?', 'Yes', 'No')
              .then((confirmed) => {
                if (confirmed) {
                  this.updateEnteredValues(); // Need to update the stored variable with the new updated values
                  this.data.modifyFPOperationRecord()
                    .subscribe((results) => {
                      if (results.ID == 0 && results.processMsg != "SUCCESS") {
                        this.cds.acknowledge(this.ds.acknowTitle, 'Failed - Reason: ' + results.processMsg, 'OK').then(() => {});
                      } else {
                        this.resetAllFields();
                        this.comm.signalReload.emit();
                        this.cds.acknowledge(this.ds.acknowTitle, 'Operation Successful!', 'OK').then(() => {});
                      }
                    });
                }
              })
              .catch(() => console.log('User dismissed the dialog'));
          } else {
            this.cds.acknowledge('DAMPS: Incomplete Form', 'You must ' + this.invalidMsg.join(', ') + '.', 'OK', 'lg').then(() => {});
          }
        } else {
          this.cds.acknowledge('DAMPS: Invalid Submission', 'You have not made any changes to this record.', 'OK').then(() => {});
        }
        console.log('============================');
      }
    });

    this.comm.createNewClicked.subscribe(() => {
      if(this.ds.curSelectedButton == 'damps') {
        this.updateDataLoad();
        this.chgArr = [];
        this.selRec = new Damps();
        this.setDefaultItems();
        this.dampsFormGrp.setValue(this.convertToFG(this.selRec));
      }
    });

    this.comm.editRecClicked.subscribe(() => {
      if(this.ds.curSelectedButton == 'damps') {
        this.updateDataLoad();
        this.chgArr = [];
        this.selRec = this.ds.curSelectedRecord;
        this.dampsFormGrp.setValue(this.convertToFG(this.selRec));
      }
    });

    this.comm.cancelRecClicked.subscribe(() => {
      this.chgArr = [];
    });
  }

  convertToFG(data: Damps): any {
    return {
      ID: data.ID,
      UIC_ToNipr: data.UIC_ToNipr,
      opHidden: data.opHidden,
      Description: data.Description,
      Op_ID: data.Op_ID,
      Cyc_ID: data.Cyc_ID,
      PAY_Operation_ID: data.PAY_Operation_ID,
      TCS_Operation_ID: data.TCS_Operation_ID,
      Conusa_OpID: data.Conusa_OpID,
      MOBCAP: data.MOBCAP,
      ma12301_d: data.ma12301_d,
      ma12302: data.ma12302,
      ma12304: data.ma12304,
      ma12304_a: data.ma12304_a,
      ma12304_b: data.ma12304_b,
      ma12302_Border: data.ma12302_Border,
      ma12302_Corona: data.ma12302_Corona,
      ma12302_Counterdrug: data.ma12302_Counterdrug
    }
  }

  setDefaultItems() {
    this.selRec.ID = 0;  //Indication that this is a new record.
    this.selRec.opHidden = 0;
    this.selRec.ma12301_d = 0;
    this.selRec.ma12302 = 0;
    this.selRec.ma12302_Corona = 0;
    this.selRec.ma12302_Border = 0;
    this.selRec.ma12302_Counterdrug = 0;
    this.selRec.ma12304 = 0;
    this.selRec.ma12304_a = 0;
    this.selRec.ma12304_b = 0;
    this.selRec.UIC_ToNipr = 0;
    this.selRec.MOBCAP = -1;
  }

  // Used to get the latest batch of stored DDL information
  updateDataLoad() {
    this.opsdll = this.ds.opsData['operations'];
    this.tcsdll = this.ds.opsData['tcs'];
    this.paydll = this.ds.opsData['pay'];
    this.conusadll = this.ds.opsData['conusa'];
    this.cycledll = this.ds.opsData['cycles'];
  }

  resetAllFields() {
    this.selRec = new Damps();
    this.chgArr = [];
  }

  storeAllChanges(e: any) {
    if (e.source instanceof MatCheckbox) { //So remove the selected checkbox from the change event - but only if a checkbox
      if(this.chgArr.indexOf(e.source.id) != -1)
        this.chgArr.splice(this.chgArr.indexOf(e.source.id), 1);  // Remove the value
      else {
        this.chgArr.push(e.source.id);
      }
    } else if (this.chgArr.indexOf(e.source.id) == -1) {
      this.chgArr.push(e.source.id);
    }

    console.log('storeAllChanges', this.chgArr);
  }

  textChanges(e: any) {
    if (this.chgArr.indexOf(e.target.id) == -1) {
      this.chgArr.push(e.target.id);
    }
  }

  updateEnteredValues() { // When ready update the stored values with the new value based on the number of changes in the chgArr
    let fg: FormGroup = this.dampsFormGrp;

    console.log('DAMPS - Initial values', this.ds.curSelectedRecord);
    this.chgArr.forEach((item) => {
      this.ds.curSelectedRecord[item] = fg.get(item).value;
    });

    console.log('DAMPS - Following Updates', this.ds.curSelectedRecord);
  }

  correctForNulls() {
    // Make sure value isn't null
    if (this.selRec.ID == null) this.selRec.ID = 0;
    if (this.selRec.MOBCAP == null || this.selRec.MOBCAP.length == 0) this.selRec.MOBCAP = -1;
    if (this.selRec.Description == null || this.selRec.Description.length == 0) this.selRec.Description = '';
    if (this.selRec.opHidden == null) this.selRec.opHidden = 0;
    if (this.selRec.ma12301_d == null) this.selRec.ma12301_d = 0;
    if (this.selRec.ma12302 == null) this.selRec.ma12302 = 0;
    if (this.selRec.ma12304 == null) this.selRec.ma12304 = 0;
    if (this.selRec.ma12304_a == null) this.selRec.ma12304_a = 0;
    if (this.selRec.ma12304_b == null) this.selRec.ma12304_b = 0;
    if (this.selRec.ma12302_Corona == null) this.selRec.ma12302_Corona = 0;
    if (this.selRec.ma12302_Border == null) this.selRec.ma12302_Border = 0;
    if (this.selRec.ma12302_Counterdrug == null) this.selRec.ma12302_Counterdrug = 0;
    if (this.selRec.UIC_ToNipr == null) this.selRec.UIC_ToNipr = 0;
  }
}
