import {Locations} from 'src/app/models/locations';
import {ConfirmDialogService} from 'src/app/dialog/confirm-dialog/confirm-dialog.service';
import {CommService} from 'src/app/services/comm.service';
import {Component, OnInit, Input} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {DatastoreService} from 'src/app/services/datastore.service';
import {DataService} from 'src/app/services/data.service';
import {Country} from 'src/app/models/country';
import {States} from 'src/app/models/states';
import {ConlogService} from '../../../modules/conlog/conlog.service';

@Component({
  selector: 'app-missionlocation',
  templateUrl: './missionlocation.component.html',
  styleUrls: ['./missionlocation.component.css']
})
export class MissionlocationComponent implements OnInit {

  @Input() public isNewRecord: boolean;

  //Data providers
  selRec: any = {};
  chgArr: string[] = [];
  invalidMsg: string[] = [];
  country: Country[] = [];
  states: States[] = [];

  //Form Validators
  locationControl = new FormControl('', [Validators.required]);
  displayControl = new FormControl('', [Validators.required]);
  countryControl = new FormControl('', [Validators.required]);
  stateControl = new FormControl('', [Validators.required]);
  installationControl = new FormControl('', [Validators.required]);
  geolocControl = new FormControl('', [Validators.required]);
  geocoordControl = new FormControl('', [Validators.required]);
  latitudeControl = new FormControl('', [Validators.required]);
  longitudeControl = new FormControl('', [Validators.required]);



  constructor(private comm: CommService, private ds: DatastoreService, private cds: ConfirmDialogService, private data: DataService, private conlog: ConlogService) { }

  ngOnInit() {
    this.comm.submitRecClicked.subscribe(() => {
      console.log(this.ds.curSelectedButton);
      if (this.ds.curSelectedButton == 'missionlocations' && this.ds.submitTriggered) {
        this.ds.submitTriggered = false;
        if (this.chgArr.length > 0) {
          this.ValidateFormData();
          if (this.invalidMsg.length == 0) {
            this.cds.confirm('LOCATION - Submission', 'Confirm you want to submit the ' + this.chgArr.length + ' change(s)?', 'Yes', 'No')
                .then((confirmed) => {
                  if (confirmed) {
                    if(this.selRec.CountryCode != 'US') this.selRec.STATEAB = 'na'
                    this.ds.curSelectedRecord = this.selRec;
                    this.data.updateLocationData()
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
            this.cds.acknowledge('LOCATION: Incomplete Form', 'You must ' + this.invalidMsg.join(', ') + '.', 'OK', 'lg');
          }
        } else {
          this.cds.acknowledge('LOCATION: Invalid Submission', 'You have not made any changes to this record.', 'OK');
        }
      }
    });

    this.comm.editRecClicked.subscribe(() => {
      if(this.ds.curSelectedButton == 'missionlocations') {
        this.updateDataLoad();
        this.chgArr = [];
        this.selRec = this.ds.curSelectedRecord;
        this.conlog.log("Selected Record - ID: " + this.ds.curSelectedRecord.lngMissionLocationID);
        this.conlog.log("Selected Record - State: " + this.ds.curSelectedRecord.STATEAB);
        this.conlog.log("Selected Record - Country: " + this.ds.curSelectedRecord.Country);
        this.conlog.log("Selected Record - CountryCode: " + this.ds.curSelectedRecord.CountryCode);
        this.conlog.log("Selected Record - UN_CC: " + this.ds.curSelectedRecord.UN_CC);
      }
    });

    this.comm.createNewClicked.subscribe(() => {
      if(this.ds.curSelectedButton == 'missionlocations') {
        this.updateDataLoad();
        this.chgArr = [];
        this.selRec = new Locations();
        this.setDefaultItems();
      }
    });
  }

  setDefaultItems() {
  }

  enableDisableStateField() {
    return this.selRec.CountryCode == 'US';
  }

  // Used to get the latest batch of stored DDL information
  updateDataLoad() {
    this.country = this.ds.opsData['country'];
    this.states = this.ds.opsData['states'];
  }

  resetAllFields() {
    this.selRec = new Locations();
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

    if (this.locationControl.invalid) this.invalidMsg.push('enter a location');
    if (this.displayControl.invalid) this.invalidMsg.push('enter a display');
    if (this.countryControl.invalid) this.invalidMsg.push('select a country');

    if (this.selRec.CountrCode == 'US') {
      if (this.stateControl.invalid) this.invalidMsg.push('select a state');
    }

    if (this.installationControl.invalid) this.invalidMsg.push('enter an installation');
    if (this.geolocControl.invalid) this.invalidMsg.push('enter a geographical location');
    if (this.geocoordControl.invalid) this.invalidMsg.push('enter a geo coordinate');
    if (this.latitudeControl.invalid) this.invalidMsg.push("enter a latitude");
    if (this.longitudeControl.invalid) this.invalidMsg.push("enter a longitude");

    this.correctForNulls();

    //return null;
  }

  correctForNulls() {
    // Make sure value isn't null
    if (this.selRec.ID == null) this.selRec.ID = 0;
    if (this.selRec.opHidden == null) this.selRec.opHidden = 0;
    if (this.selRec.CZ == null) this.selRec.CZ = 0;
    if (this.selRec.ZipCode == null) this.selRec.ZipCode = 0;
    if (this.selRec.STATEAB == null) this.selRec.STATEAB = "na";
  }
}
