import {Component, OnInit} from '@angular/core';
import {DatastoreService} from '../../services/datastore.service';
import {DataService} from '../../services/data.service';
import {MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogService} from '../confirm-dialog/confirm-dialog.service';
import {CommService} from '../../services/comm.service';

@Component({
  selector: 'app-locations-dialog',
  templateUrl: './locations-dialog.component.html',
  styleUrls: ['./locations-dialog.component.css']
})

export class LocationsDialogComponent implements OnInit {

  //locations: any = [];
  searched: boolean = false;
  searching: boolean = false;
  searchTxt: string;
  searchExist: any = [];
  searchPoss: any = [];
  locationSelected: any [];

  constructor(private ds: DatastoreService, private data: DataService, public dialogRef: MatDialogRef<LocationsDialogComponent>,
              private cds: ConfirmDialogService, private comm: CommService) { }

  ngOnInit() {
    //this.updateDataLoad();
    this.resetSearch();
  }

  /*updateDataLoad() {
      this.locations = this.ds.opsData["missionlocations"];
  }*/

  resetSearch() {
    // Reset the original search and shrink the form
    this.searchTxt = '';
    this.searched = false;
    this.locationSelected = [];
    this.searchExist = [];
    this.searchPoss = [];
  }

  closeSearch() {
    this.dialogRef.close();
    console.log('The mission location search window has been closed.');
  }

  executeSearch() {
    this.searchExist = [];
    this.searchPoss = [];
    this.searched = false;
    this.searching = true;

    this.getLocationData();
  }

  getLocationData() {
    this.data.searchMissionLocation(this.searchTxt).subscribe((resultset1) => {
      this.searchExist = resultset1;

      //Now retrieve all possibles
      this.data.searchGeoLocation(this.searchTxt).subscribe((resultset2) => {
        this.searchPoss = resultset2;
        this.searched = true;
        this.searching = false;
      });
    });
  }

  recordSelected(row: any) {
    // Search and make sure we don't have it then add otherwise remove
    row.Selected = !row.Selected;
    let i: number = (this.locationSelected.length > 0) ? this.ds.get2DArrayIndex(this.locationSelected, 'GeoLoc_Cd', row.GeoLoc_Cd) : 0;

    // Decide if it should be added or removed from the locationSelected array
    if (row.Selected) {
      if (i === 0) {
        this.locationSelected.push(row);
      }
    } else {
      this.locationSelected.splice(i, 1);
    }
  }

  addSelectedLocations() {
    // Will loop through a store each of the selected location now
    if (this.locationSelected.length > 0) {
      this.locationSelected.forEach((obj) => {
        this.data.saveMissionLocation(obj)
            .subscribe((result) => {
              //Need to evaluate if the record was properly added
              console.log(result);
              if (result.ID > 0) {
                this.cds.acknowledge('Location Added', 'Successfully Added Rec ID ' + result.processMsg.split('-')[1]);
                this.resetSearch();
                this.comm.signalReload.emit();
              } else {
                // We have an error
                let errMsg = result.processMsg.split(':')
                this.cds.acknowledge('Location: ' + errMsg[0], errMsg[1], 'OK');
              }
            });
      });
    } else {
      this.cds.acknowledge('Invalid Selection', 'No location have been selected.');
    }
  }
}
