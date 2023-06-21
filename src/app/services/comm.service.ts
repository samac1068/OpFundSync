import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommService {
  //Button Handler
  navbarClicked = new EventEmitter();
  cancelRecClicked = new EventEmitter();
  submitRecClicked = new EventEmitter();
  createNewClicked = new EventEmitter();
  editRecClicked = new EventEmitter();
  cogClicked = new EventEmitter();

  signalReload = new EventEmitter();
}
