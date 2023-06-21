import { CommService } from '../../services/comm.service';
import { Component, OnInit, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { DatastoreService } from 'src/app/services/datastore.service';

@Component({
  selector: 'ofsbutton',
  templateUrl: './ofsbutton.component.html',
  styleUrls: ['./ofsbutton.component.css']
})
export class OfsbuttonComponent implements OnInit {

  //Passed Parameters
  @Input() label: string;
  @Input() tooltip: string;
  @Input() imgname: string;
  @Input() width: number;

  @Output() btnClickEvt :EventEmitter<any> = new EventEmitter();

  imgPath: string;
  bgColorArr: string[] = ["#66903B", "#395E13", "#786643", "#693B4B"];
  txtColorArr: string[] = ["#FFFFFF", "#FFFF00", "#000000"];
  txtIndex: number = 0;
  toggle: boolean = false;

  constructor(private ds: DatastoreService, private comm: CommService) { }

  ngOnInit() {
    this.imgPath = `./assets/images/${this.imgname}.png`;

    this.comm.navbarClicked.subscribe(() => {
      this.confirmBtnStatus();
    });
  }

  handleMouseDown(){
    this.toggle = true;
  }

  handleMouseUp(){
    this.btnClickEvt.emit(this.label.toLowerCase().replace(" ", ""));
  }

  handleMouseOver(){
    this.txtIndex = 1;
  }

  handleMouseOut() {
    this.txtIndex = 0;
  }

  confirmBtnStatus() {
    // If this button is not currently selected, then change BG color and toggle
    this.toggle = (this.ds.curSelectedButton == this.label.toLowerCase().replace(" ", ""));
  }

  buttonShift(): Object{
    if(this.txtIndex == 1 && !this.toggle)
      return {'background-color': this.bgColorArr[1]};

    if(this.toggle)
      return {'margin-left': '1px', 'margin-top': '3px', 'background-color' : this.bgColorArr[3]};
    else
      return {'margin-left': '1px', 'margin-top': '3px', 'background-color': this.bgColorArr[0]};
  }
}
