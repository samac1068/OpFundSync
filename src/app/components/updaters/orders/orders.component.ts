import {Component, OnInit, Input} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CommService} from 'src/app/services/comm.service';
import {DatastoreService} from 'src/app/services/datastore.service';
import {ConfirmDialogService} from 'src/app/dialog/confirm-dialog/confirm-dialog.service';
import {DataService} from 'src/app/services/data.service';
import {Operation} from 'src/app/models/operation';
import {Cycle} from 'src/app/models/cycle';
import {Damps} from 'src/app/models/damps';
import {Orders} from 'src/app/models/orders';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {

  @Input() public isNewRecord: boolean;

  selRec: any = {};
  chgArr: string[] = [];
  invalidMsg: string[] = [];
  opdll: Operation[] = [];
  cycledll: Cycle[] = [];
  dampsdll: Damps[] = [];

  ordersFormGrp: FormGroup = new FormGroup({
    ID: new FormControl(''),
    isVisible: new FormControl(''),
    op_id: new FormControl('', [Validators.required]),
    cyc_id: new FormControl('', [Validators.required]),
    fpop_id: new FormControl('', [Validators.required]),
    planIdChk: new FormControl('')
  });

  get op_id() { return this.ordersFormGrp.get('op_id'); }
  get cyc_id() { return this.ordersFormGrp.get('cyc_id'); }
  get fpop_id() { return this.ordersFormGrp.get('fpop_id'); }

  constructor(private comm: CommService, private ds: DatastoreService, private cds: ConfirmDialogService, private data: DataService) { }

  ngOnInit() {
    this.comm.submitRecClicked.subscribe(() => {
      if (this.ds.curSelectedButton == 'orders' && this.ds.submitTriggered) {
        this.ds.submitTriggered = false;
        if (this.chgArr.length > 0) {
          if (this.invalidMsg.length == 0) {
            this.cds.confirm('ORDERS - Submission', 'Confirm you want to submit the ' + this.chgArr.length + ' change(s)?', 'Yes', 'No')
              .then((confirmed) => {
                if (confirmed) {
                  this.correctForAddOperations();
                  this.updateEnteredValues();   // Used to update the changed information in the record and load into a global variable
                  this.data.modifyOrdersRecord()
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
            this.cds.acknowledge('ORDERS: Incomplete Form', 'You must ' + this.invalidMsg.join(', ') + '.', 'OK', 'lg');
          }
        } else {
          this.cds.acknowledge('ORDERS: Invalid Submission', 'You have not made any changes to this record.', 'OK');
        }
      }
    });

    this.comm.createNewClicked.subscribe(() => {
      if(this.ds.curSelectedButton == 'orders') {
        this.updateDataLoad();
        this.chgArr = [];
        this.selRec = new Orders();
        this.correctForNulls();
        this.ordersFormGrp.setValue(this.convertToFG(this.selRec));
      }
    });

    this.comm.editRecClicked.subscribe(() => {
      if(this.ds.curSelectedButton == 'orders') {
        this.updateDataLoad();
        this.chgArr = [];
        this.selRec = this.ds.curSelectedRecord;
        this.selRec.planIdChk = this.selRec.plan_id == 999;
        this.ordersFormGrp.setValue(this.convertToFG(this.selRec));
      }
    });
  }

  convertToFG(data: Orders): any {
    return {
      ID: data.ID,
      isVisible: data.isVisible,
      op_id: data.op_id,
      cyc_id: data.cyc_id,
      fpop_id: data.fpop_id,
      planIdChk: data.planIdChk
    }
  }

  updateDataLoad() {
    this.opdll = this.ds.opsData['operations'];
    this.dampsdll = this.ds.opsData['damps'];
    this.cycledll = this.ds.opsData['cycles'];
  }

  resetAllFields() {
    this.selRec = new Orders();
    this.chgArr = [];
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

  updateEnteredValues() { // When ready update the stored values with the new value based on the number of changes in the chgArr
    let fg: FormGroup = this.ordersFormGrp;

    console.log('ORDERS - Initial values', this.selRec);
    this.chgArr.forEach((item) => {
      this.selRec[item] = fg.get(item).value;
    });

    console.log('ORDERS - Following Updates', this.selRec);
    this.ds.curSelectedRecord = this.selRec;
  }

  correctForNulls() {
    // Make sure value isn't null
    if (this.selRec.id == null) this.selRec.id = 0;
    if (this.selRec.isVisible == null) this.selRec.isVisible = false;
  }

  correctForAddOperations() {
    this.selRec.plan_id = 0;
    this.selRec.ord_id = null;
    this.selRec.Description = null;

    //Loop through and find the string for the respective id
    this.selRec.plan_id = (this.selRec.planIdChk) ? 999 : 0;
    this.selRec.operation = this.opdll.find(o => o.op_id == this.selRec.op_id).operation;
    this.selRec.cycle = this.cycledll.find(c => c.cyc_id == this.selRec.cyc_id).cycle;
  }
}
