import { DatastoreService } from '../../services/datastore.service';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent implements OnInit {

  version: string = "";
  token: string | null = null;

  constructor(private ds: DatastoreService, private location: Location) { }

  ngOnInit() {
    this.version = this.ds.getVersion();
    this.token = localStorage.getItem('token');
  }

  returnToMDIS(){
    console.log("go back to previous page");
      this.location.back();
  }
}
