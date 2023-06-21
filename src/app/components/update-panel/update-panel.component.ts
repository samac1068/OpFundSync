//import { CommService } from '../../services/comm.service';
import { Component, OnInit, Input } from '@angular/core';
//import { DatastoreService } from 'src/app/services/datastore.service';


@Component({
  selector: 'app-update-panel',
  templateUrl: './update-panel.component.html',
  styleUrls: ['./update-panel.component.css']
})
export class UpdatePanelComponent implements OnInit {

  @Input() isNewRecord: boolean;
  @Input() curSelectedButton: string = "damps";

  constructor() { }
  ngOnInit() {

  }
}
